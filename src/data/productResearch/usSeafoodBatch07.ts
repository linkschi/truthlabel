import source from "./usSeafoodBatch07FastMvp.json";
import { recordsFromSeafoodFastMvpBatch } from "./usSeafoodFastMvpAdapter";

export const usSeafoodBatch07Records = recordsFromSeafoodFastMvpBatch(
  source as unknown as Parameters<typeof recordsFromSeafoodFastMvpBatch>[0],
);
