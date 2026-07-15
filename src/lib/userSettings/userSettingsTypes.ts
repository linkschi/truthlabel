export type UserAllergyProfile = {
  allergens: string[];
  customAllergens: string[];
  lastUpdated?: string;
};

export type UserRegionSettings = {
  country?: string;
  region?: "US" | "UK" | "EU" | "CA" | "AU" | "ZA" | "GLOBAL" | "UNKNOWN";
  language?: string;
};

export type UserScanPreferences = {
  defaultProductCategory: string;
  showNotCheckedExternalSections: boolean;
  showConfidenceNotes: boolean;
  autoRunExternalSafetyLookup: boolean;
};

export type InsideItUserSettings = {
  allergyProfile: UserAllergyProfile;
  regionSettings: UserRegionSettings;
  scanPreferences: UserScanPreferences;
  settingsVersion: number;
  updatedAt: string;
};
