import source from "./usSeafoodBatch01FastMvp.json";
import { recordsFromSeafoodFastMvpBatch } from "./usSeafoodFastMvpAdapter";

export const usSeafoodBatch01Records = recordsFromSeafoodFastMvpBatch(
  source as unknown as Parameters<typeof recordsFromSeafoodFastMvpBatch>[0],
);
