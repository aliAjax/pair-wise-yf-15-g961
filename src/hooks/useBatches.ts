import { useCallback, useEffect, useMemo, useState } from "react";
import type { Batch, TempRecord } from "../types";
import { loadBatches, saveBatches } from "../lib/storage";
import { seedBatches } from "../lib/seed";
import { accumulatedHeat, stageOfBatch } from "../lib/thermal";

export interface NewBatchInput {
  code: string;
  caseNo: string;
  species: string;
  location: string;
  preservation: string;
  exposure: string;
  sampledAt: string; // datetime-local
  tempC: number;
  durationDays: number;
}

let counter = 0;
function uid(prefix: string): string {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${counter}`;
}

export function useBatches() {
  const [batches, setBatches] = useState<Batch[]>(() => {
    const stored = loadBatches();
    return stored.length > 0 ? stored : seedBatches();
  });

  // 任何增删改后立即持久化，关掉页面再打开仍是原记录
  useEffect(() => {
    saveBatches(batches);
  }, [batches]);

  const addBatch = useCallback((input: NewBatchInput): string => {
    const id = uid("b");
    const firstRecord: TempRecord = {
      id: uid("t"),
      sampledAt: new Date(input.sampledAt || Date.now()).toISOString(),
      tempC: input.tempC,
      durationDays: input.durationDays,
    };
    const batch: Batch = {
      id,
      code: input.code.trim() || "未命名批次",
      caseNo: input.caseNo.trim(),
      species: input.species.trim(),
      location: input.location.trim(),
      preservation: input.preservation.trim(),
      exposure: input.exposure.trim(),
      note: "",
      createdAt: new Date().toISOString(),
      temperatures: [firstRecord],
    };
    setBatches((prev) => [batch, ...prev]);
    return id;
  }, []);

  const removeBatch = useCallback((id: string) => {
    setBatches((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const addTemperature = useCallback(
    (batchId: string, sampledAt: string, tempC: number, durationDays: number) => {
      setBatches((prev) =>
        prev.map((b) =>
          b.id !== batchId
            ? b
            : {
                ...b,
                temperatures: [
                  ...b.temperatures,
                  {
                    id: uid("t"),
                    sampledAt: new Date(sampledAt || Date.now()).toISOString(),
                    tempC,
                    durationDays,
                  },
                ],
              }
        )
      );
    },
    []
  );

  /** 录入错温度后在这里改正：阶段与曲线由积温层自动重算 */
  const updateTemperature = useCallback(
    (
      batchId: string,
      recordId: string,
      patch: Partial<Pick<TempRecord, "sampledAt" | "tempC" | "durationDays">>
    ) => {
      setBatches((prev) =>
        prev.map((b) => {
          if (b.id !== batchId) return b;
          return {
            ...b,
            temperatures: b.temperatures.map((r) => {
              if (r.id !== recordId) return r;
              return {
                ...r,
                tempC: patch.tempC ?? r.tempC,
                durationDays: patch.durationDays ?? r.durationDays,
                sampledAt:
                  patch.sampledAt !== undefined
                    ? new Date(patch.sampledAt || Date.now()).toISOString()
                    : r.sampledAt,
              };
            }),
          };
        })
      );
    },
    []
  );

  const removeTemperature = useCallback((batchId: string, recordId: string) => {
    setBatches((prev) =>
      prev.map((b) =>
        b.id !== batchId
          ? b
          : { ...b, temperatures: b.temperatures.filter((r) => r.id !== recordId) }
      )
    );
  }, []);

  const updateNote = useCallback((batchId: string, note: string) => {
    setBatches((prev) =>
      prev.map((b) => (b.id === batchId ? { ...b, note } : b))
    );
  }, []);

  const stats = useMemo(() => {
    const stageCount = { 卵: 0, 幼虫: 0, 蛹: 0, 成虫: 0 } as Record<string, number>;
    let pendingNote = 0;
    let tempSum = 0;
    let tempN = 0;
    for (const b of batches) {
      stageCount[stageOfBatch(b)] += 1;
      if (!b.note.trim()) pendingNote += 1;
      for (const r of b.temperatures) {
        tempSum += r.tempC;
        tempN += 1;
      }
    }
    return {
      batchCount: batches.length,
      avgTemp: tempN ? Math.round((tempSum / tempN) * 10) / 10 : null,
      stageCount,
      pendingNote,
    };
  }, [batches]);

  return {
    batches,
    stats,
    addBatch,
    removeBatch,
    addTemperature,
    updateTemperature,
    removeTemperature,
    updateNote,
    accumulatedHeat,
  };
}
