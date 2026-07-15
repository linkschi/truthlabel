export type ExternalSafetySourceRegistryEntry = {
  providerId:
    | "openfda"
    | "usda_fsis"
    | "uk_fsa"
    | "eu_rasff";
  providerName: string;
  docsUrl: string;
  searchUrl?: string;
  region: string;
  accessMode: "official_api" | "official_html" | "disabled";
  enabledByDefault: boolean;
  notes: string;
};

export const externalSafetySourceRegistry: Record<
  ExternalSafetySourceRegistryEntry["providerId"],
  ExternalSafetySourceRegistryEntry
> = {
  openfda: {
    providerId: "openfda",
    providerName: "openFDA Food Enforcement",
    docsUrl: "https://open.fda.gov/apis/food/enforcement/how-to-use-the-endpoint/",
    searchUrl: "https://api.fda.gov/food/enforcement.json",
    region: "US",
    accessMode: "official_api",
    enabledByDefault: true,
    notes:
      "Official FDA enforcement endpoint for food recalls and enforcement reports.",
  },
  usda_fsis: {
    providerId: "usda_fsis",
    providerName: "USDA FSIS Recalls / Public Health Alerts",
    docsUrl: "https://www.fsis.usda.gov/science-data/developer-resources/recall-api",
    searchUrl: "https://www.fsis.usda.gov/recalls-alerts",
    region: "US",
    accessMode: "official_html",
    enabledByDefault: true,
    notes:
      "Official USDA FSIS recall and public-health-alert pages. Automated access may be rate-limited or edge-blocked in some environments.",
  },
  uk_fsa: {
    providerId: "uk_fsa",
    providerName: "UK FSA Food Alerts",
    docsUrl: "https://alerts.food.gov.uk/news-alerts",
    searchUrl: "https://alerts.food.gov.uk/news-alerts",
    region: "UK",
    accessMode: "official_html",
    enabledByDefault: true,
    notes:
      "Official UK Food Standards Agency alert listings and alert detail pages.",
  },
  eu_rasff: {
    providerId: "eu_rasff",
    providerName: "EU RASFF",
    docsUrl: "https://food.ec.europa.eu/safety/rasff_en",
    searchUrl: "https://food.ec.europa.eu/safety/rasff_en",
    region: "EU",
    accessMode: "disabled",
    enabledByDefault: false,
    notes:
      "Provider shell only. A stable official API or approved machine-readable access path was not configured.",
  },
};
