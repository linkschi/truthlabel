import type { InsideItUserSettings } from "./userSettingsTypes";

export const defaultUserSettings: InsideItUserSettings = {
  allergyProfile: {
    allergens: [],
    customAllergens: [],
  },
  regionSettings: {
    region: "UNKNOWN",
    country: "",
    language: "en",
  },
  scanPreferences: {
    defaultProductCategory: "General / Unknown",
    showNotCheckedExternalSections: true,
    showConfidenceNotes: true,
    autoRunExternalSafetyLookup: true,
  },
  settingsVersion: 1,
  updatedAt: "",
};
