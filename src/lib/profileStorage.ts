"use client";

import { useSyncExternalStore } from "react";
import {
  allergyOptions,
  avoidOptions,
  defaultProfile,
  type AllergyConcern,
  type AvoidConcern,
  type UserProfile,
} from "@/data/fakeProduct";
import {
  safeLocalStorageGetItem,
  safeLocalStorageSetItem,
} from "@/lib/browserStorage";
import {
  getSavedAllergyProfile,
  getUserSettings,
  updateAllergyProfile,
} from "@/lib/userSettings/userSettingsStorage";

const STORAGE_KEY = "insideit.watch-profile";
const PROFILE_CHANGE_EVENT = "insideit.watch-profile.changed";
let cachedRawProfile: string | null | undefined;
let cachedProfileSnapshot: UserProfile = defaultProfile;

const settingsIdByLegacyAllergy: Record<AllergyConcern, string> = {
  Milk: "milk",
  Egg: "egg",
  Peanuts: "peanut",
  "Tree nuts": "tree nuts",
  "Wheat / gluten": "wheat",
  Soy: "soy",
  Fish: "fish",
  Shellfish: "crustacean shellfish",
  Sesame: "sesame",
  Mustard: "mustard",
  Celery: "celery",
  Lupin: "lupin",
  Molluscs: "molluscs",
  Sulphites: "sulphites",
};

const legacyAllergyBySettingsId: Partial<Record<string, AllergyConcern>> = {
  milk: "Milk",
  egg: "Egg",
  peanut: "Peanuts",
  "tree nuts": "Tree nuts",
  wheat: "Wheat / gluten",
  gluten: "Wheat / gluten",
  soy: "Soy",
  fish: "Fish",
  "crustacean shellfish": "Shellfish",
  sesame: "Sesame",
  mustard: "Mustard",
  celery: "Celery",
  lupin: "Lupin",
  molluscs: "Molluscs",
  sulfites: "Sulphites",
  sulphites: "Sulphites",
};

function sanitizeAllergies(value: unknown): AllergyConcern[] {
  if (!Array.isArray(value)) {
    return defaultProfile.allergies;
  }

  const allowed = new Set<AllergyConcern>(allergyOptions);
  return value.filter(
    (entry): entry is AllergyConcern =>
      typeof entry === "string" && allowed.has(entry as AllergyConcern),
  );
}

function sanitizeAvoidList(value: unknown): AvoidConcern[] {
  if (!Array.isArray(value)) {
    return defaultProfile.avoid;
  }

  const allowed = new Set<AvoidConcern>(avoidOptions);
  return value.filter(
    (entry): entry is AvoidConcern =>
      typeof entry === "string" && allowed.has(entry as AvoidConcern),
  );
}

function normalizeProfile(profile: Partial<UserProfile> | UserProfile): UserProfile {
  return {
    allergies: sanitizeAllergies(profile.allergies),
    avoid: sanitizeAvoidList(profile.avoid),
  };
}

function toLegacyAllergies() {
  const settings = getUserSettings();
  const saved = getSavedAllergyProfile(settings);
  return saved
    .map((item) => legacyAllergyBySettingsId[item.trim().toLowerCase()])
    .filter((value): value is AllergyConcern => Boolean(value));
}

function readCachedProfile(rawProfile: string | null): UserProfile {
  if (rawProfile === cachedRawProfile) {
    return {
      ...cachedProfileSnapshot,
      allergies: toLegacyAllergies(),
    };
  }

  try {
    cachedRawProfile = rawProfile;

    if (!rawProfile) {
      cachedProfileSnapshot = {
        allergies: toLegacyAllergies(),
        avoid: defaultProfile.avoid,
      };
      return cachedProfileSnapshot;
    }

    const parsed = JSON.parse(rawProfile) as Partial<UserProfile>;
    cachedProfileSnapshot = {
      allergies: toLegacyAllergies(),
      avoid: normalizeProfile(parsed).avoid,
    };
    return cachedProfileSnapshot;
  } catch {
    cachedProfileSnapshot = {
      allergies: toLegacyAllergies(),
      avoid: defaultProfile.avoid,
    };
    return cachedProfileSnapshot;
  }
}

export function loadProfile(): UserProfile {
  if (typeof window === "undefined") {
    return defaultProfile;
  }

  return readCachedProfile(safeLocalStorageGetItem(STORAGE_KEY));
}

function getServerProfileSnapshot() {
  return defaultProfile;
}

function getClientProfileSnapshot() {
  if (typeof window === "undefined") {
    return defaultProfile;
  }

  return readCachedProfile(safeLocalStorageGetItem(STORAGE_KEY));
}

export function saveProfile(profile: UserProfile) {
  if (typeof window === "undefined") {
    return;
  }

  const normalizedProfile = normalizeProfile(profile);
  const userSettings = getUserSettings();
  const serializedProfile = JSON.stringify({
    avoid: normalizedProfile.avoid,
  });

  updateAllergyProfile({
    allergens: normalizedProfile.allergies.map(
      (entry) => settingsIdByLegacyAllergy[entry],
    ),
    customAllergens: userSettings.allergyProfile.customAllergens,
    lastUpdated: new Date().toISOString(),
  });

  cachedRawProfile = serializedProfile;
  cachedProfileSnapshot = normalizedProfile;
  safeLocalStorageSetItem(STORAGE_KEY, serializedProfile);
  window.dispatchEvent(new Event(PROFILE_CHANGE_EVENT));
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
  window.addEventListener(PROFILE_CHANGE_EVENT, handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(PROFILE_CHANGE_EVENT, handleChange);
  };
}

export function useStoredProfile() {
  return useSyncExternalStore(
    subscribe,
    getClientProfileSnapshot,
    getServerProfileSnapshot,
  );
}
