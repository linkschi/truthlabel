import source from "./usMeatBatch24FastMvp.json";
import { recordsFromFastMvpBatch } from "./usMeatFastMvpAdapter";

export const usMeatBatch24Records = recordsFromFastMvpBatch(
  source as unknown as Parameters<typeof recordsFromFastMvpBatch>[0],
);
