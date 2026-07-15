import { publicAppConfig } from "@/lib/appConfig";
import { cleanOcrIngredientText, type CleanOcrIngredientTextResult } from "@/lib/cleanOcrIngredientText";

export type OcrExtractionResult = CleanOcrIngredientTextResult & {
  rawText: string;
  averageConfidence: number | null;
};

export async function extractIngredientTextFromImage(
  image: Blob | File | string,
): Promise<OcrExtractionResult> {
  const { recognize } = await import("tesseract.js");
  const result = await recognize(image, publicAppConfig.ocrLanguage);
  const rawText = result.data?.text ?? "";
  const averageConfidence =
    typeof result.data?.confidence === "number" ? result.data.confidence : null;
  const cleaned = cleanOcrIngredientText(rawText, {
    averageConfidence,
  });

  return {
    rawText,
    averageConfidence,
    ...cleaned,
  };
}
