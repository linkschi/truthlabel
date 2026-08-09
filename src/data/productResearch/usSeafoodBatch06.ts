import source from "./usSeafoodBatch06FastMvp.json";
import { recordsFromSeafoodFastMvpBatch } from "./usSeafoodFastMvpAdapter";

export const usSeafoodBatch06Records = recordsFromSeafoodFastMvpBatch(
  source as unknown as Parameters<typeof recordsFromSeafoodFastMvpBatch>[0],
);
