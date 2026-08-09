import source from "./usSeafoodBatch08FastMvp.json";
import { recordsFromSeafoodFastMvpBatch } from "./usSeafoodFastMvpAdapter";

export const usSeafoodBatch08Records = recordsFromSeafoodFastMvpBatch(
  source as unknown as Parameters<typeof recordsFromSeafoodFastMvpBatch>[0],
);
