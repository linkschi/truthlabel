import source from "./usSeafoodBatch05FastMvp.json";
import { recordsFromSeafoodFastMvpBatch } from "./usSeafoodFastMvpAdapter";

export const usSeafoodBatch05Records = recordsFromSeafoodFastMvpBatch(
  source as unknown as Parameters<typeof recordsFromSeafoodFastMvpBatch>[0],
);
