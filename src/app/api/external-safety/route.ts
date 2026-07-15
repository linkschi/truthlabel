import { runExternalSafetyLookupDirect } from "@/lib/externalSafety/runExternalSafetyLookupDirect";
import type { ExternalSafetyLookupInput } from "@/lib/externalSafety/externalSafetyTypes";
import { publicAppConfig } from "@/lib/appConfig";

export async function POST(request: Request) {
  if (!publicAppConfig.flags.enableExternalSafetyLookup) {
    return Response.json({
      lookupPerformed: false,
      signals: [],
      cleanCheckedSources: [],
      warnings: ["External safety lookup is disabled in this build."],
      errors: [],
    });
  }

  let payload: ExternalSafetyLookupInput;

  try {
    payload = (await request.json()) as ExternalSafetyLookupInput;
  } catch {
    return Response.json(
      {
        lookupPerformed: false,
        signals: [],
        cleanCheckedSources: [],
        warnings: [],
        errors: ["External safety request body was not valid JSON."],
      },
      { status: 400 },
    );
  }

  const result = await runExternalSafetyLookupDirect(payload);
  return Response.json(result);
}
