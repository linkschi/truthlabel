import { useSyncExternalStore } from "react";
import {
  safeLocalStorageGetItem,
  safeLocalStorageRemoveItem,
  safeLocalStorageSetItem,
} from "@/lib/browserStorage";

import { defaultUserSettings } from "./defaultUserSettings";
import type {
  InsideItUserSettings,
  UserAllergyProfile,
  UserRegionSettings,
  UserScanPreferences,
} from "./userSettingsTypes";

const STORAGE_KEY = "insideit.user-settings";
const SETTINGS_CHANGE_EVENT = "insideit.user-settings.changed";

let cachedRawSettings: string | null | undefined;
let cachedSettingsSnapshot: InsideItUserSettings = withUpdatedAt(defaultUserSettings);

function uniqueStrings(values: Array<string | undefined | null>) {
  const seen = new Set<string>();
  const result: string[] = [];

  values.forEach((value) => {
    const normalized = value?.trim();
    if (!normalized || seen.has(normalized)) {
      return;
    }

    seen.add(normalized);
    result.push(normalized);
  });

  return result;
}

function withUpdatedAt(
  settings: Omit<InsideItUserSettings, "updatedAt"> & { updatedAt?: string },
) {
  return {
    ...settings,
    updatedAt: settings.updatedAt?.trim() || new Date().toISOString(),
  };
}

function sanitizeAllergyProfile(value: unknown): UserAllergyProfile {
  const profile =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Partial<UserAllergyProfile>)
      : {};

  return {
    allergens: uniqueStrings(Array.isArray(profile.allergens) ? profile.allergens : []),
    customAllergens: uniqueStrings(
      Array.isArray(profile.customAllergens) ? profile.customAllergens : [],
    ),
    lastUpdated: profile.lastUpdated?.trim() || undefined,
  };
}

function sanitizeRegionSettings(value: unknown): UserRegionSettings {
  const regionSettings =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Partial<UserRegionSettings>)
      : {};
  const allowedRegions = new Set<UserRegionSettings["region"]>([
    "US",
    "UK",
    "EU",
    "CA",
    "AU",
    "ZA",
    "GLOBAL",
    "UNKNOWN",
    undefined,
  ]);

  return {
    region: allowedRegions.has(regionSettings.region)
      ? regionSettings.region
      : defaultUserSettings.regionSettings.region,
    country: regionSettings.country?.trim() ?? defaultUserSettings.regionSettings.country,
    language:
      regionSettings.language?.trim() ?? defaultUserSettings.regionSettings.language,
  };
}

function sanitizeScanPreferences(value: unknown): UserScanPreferences {
  const preferences =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Partial<UserScanPreferences>)
      : {};

  return {
    defaultProductCategory:
      preferences.defaultProductCategory?.trim() ||
      defaultUserSettings.scanPreferences.defaultProductCategory,
    showNotCheckedExternalSections:
      typeof preferences.showNotCheckedExternalSections === "boolean"
        ? preferences.showNotCheckedExternalSections
        : defaultUserSettings.scanPreferences.showNotCheckedExternalSections,
    showConfidenceNotes:
      typeof preferences.showConfidenceNotes === "boolean"
        ? preferences.showConfidenceNotes
        : defaultUserSettings.scanPreferences.showConfidenceNotes,
    autoRunExternalSafetyLookup:
      typeof preferences.autoRunExternalSafetyLookup === "boolean"
        ? preferences.autoRunExternalSafetyLookup
        : defaultUserSettings.scanPreferences.autoRunExternalSafetyLookup,
  };
}

function normalizeUserSettings(
  settings: Partial<InsideItUserSettings> | InsideItUserSettings,
): InsideItUserSettings {
  const allergyProfile = sanitizeAllergyProfile(settings.allergyProfile);

  return withUpdatedAt({
    allergyProfile: {
      ...allergyProfile,
      lastUpdated: allergyProfile.lastUpdated ?? settings.updatedAt ?? new Date().toISOString(),
    },
    regionSettings: sanitizeRegionSettings(settings.regionSettings),
    scanPreferences: sanitizeScanPreferences(settings.scanPreferences),
    settingsVersion:
      typeof settings.settingsVersion === "number"
        ? settings.settingsVersion
        : defaultUserSettings.settingsVersion,
    updatedAt: settings.updatedAt,
  });
}

function readCachedSettings(rawSettings: string | null) {
  if (rawSettings === cachedRawSettings) {
    return cachedSettingsSnapshot;
  }

  try {
    cachedRawSettings = rawSettings;

    if (!rawSettings) {
      cachedSettingsSnapshot = withUpdatedAt(defaultUserSettings);
      return cachedSettingsSnapshot;
    }

    const parsed = JSON.parse(rawSettings) as Partial<InsideItUserSettings>;
    cachedSettingsSnapshot = normalizeUserSettings(parsed);
    return cachedSettingsSnapshot;
  } catch {
    cachedSettingsSnapshot = withUpdatedAt(defaultUserSettings);
    return cachedSettingsSnapshot;
  }
}

function writeSettings(settings: InsideItUserSettings) {
  if (typeof window === "undefined") {
    return settings;
  }

  const normalizedSettings = normalizeUserSettings(settings);
  const serialized = JSON.stringify(normalizedSettings);

  cachedRawSettings = serialized;
  cachedSettingsSnapshot = normalizedSettings;
  safeLocalStorageSetItem(STORAGE_KEY, serialized);
  window.dispatchEvent(new Event(SETTINGS_CHANGE_EVENT));
  return normalizedSettings;
}

export function getUserSettings(): InsideItUserSettings {
  if (typeof window === "undefined") {
    return withUpdatedAt(defaultUserSettings);
  }

  return readCachedSettings(safeLocalStorageGetItem(STORAGE_KEY));
}

export function saveUserSettings(settings: InsideItUserSettings) {
  return writeSettings(settings);
}

export function updateAllergyProfile(profile: UserAllergyProfile) {
  const settings = getUserSettings();

  return writeSettings({
    ...settings,
    allergyProfile: {
      ...sanitizeAllergyProfile(profile),
      lastUpdated: new Date().toISOString(),
    },
    updatedAt: new Date().toISOString(),
  });
}

export function updateRegionSettings(regionSettings: UserRegionSettings) {
  const settings = getUserSettings();

  return writeSettings({
    ...settings,
    regionSettings: sanitizeRegionSettings(regionSettings),
    updatedAt: new Date().toISOString(),
  });
}

export function updateScanPreferences(scanPreferences: UserScanPreferences) {
  const settings = getUserSettings();

  return writeSettings({
    ...settings,
    scanPreferences: sanitizeScanPreferences(scanPreferences),
    updatedAt: new Date().toISOString(),
  });
}

export function clearUserSettings() {
  if (typeof window === "undefined") {
    return;
  }

  cachedRawSettings = null;
  cachedSettingsSnapshot = withUpdatedAt(defaultUserSettings);
  safeLocalStorageRemoveItem(STORAGE_KEY);
  window.dispatchEvent(new Event(SETTINGS_CHANGE_EVENT));
}

export function resetUserSettings() {
  return writeSettings(withUpdatedAt(defaultUserSettings));
}

export function getSavedAllergyProfile(settings: InsideItUserSettings = getUserSettings()) {
  return uniqueStrings([
    ...settings.allergyProfile.allergens,
    ...settings.allergyProfile.customAllergens,
  ]);
}

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  function handleChange(event: Event) {
    if (
      event instanceof StorageEvent &&
      event.key !== null &&
      event.key !== STORAGE_KEY
    ) {
      return;
    }

    onStoreChange();
  }

  window.addEventListener("storage", handleChange);
  window.addEventListener(SETTINGS_CHANGE_EVENT, handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(SETTINGS_CHANGE_EVENT, handleChange);
  };
}

function getServerSnapshot() {
  return withUpdatedAt(defaultUserSettings);
}

function getClientSnapshot() {
  if (typeof window === "undefined") {
    return withUpdatedAt(defaultUserSettings);
  }

  return readCachedSettings(safeLocalStorageGetItem(STORAGE_KEY));
}

export function useUserSettings() {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}

// Allergy profile data should be treated as sensitive user preference data.
