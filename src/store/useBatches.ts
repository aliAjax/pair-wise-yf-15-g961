import { useEffect, useMemo, useState } from "react";
import type { Batch, Stage, TempRecord } from "../domain/types";
import { stageFor, totalDegreeDays } from "../domain/degreeDays";
import { loadBatches, saveBatches } from "./persistence";
import { seedBatches, uid } from "./seed";

export type StageFilter = Stage | "全部";

export interface BatchSummary {
  batch: Batch;
  total: number;
  stage: Stage;
}

export interface NewBatchInput {
  code: string;
  caseNo: string;
  location: string;
  species: string;
  exposureStage: string;
  preservative: string;
}

export function useBatches() {
  const [batches, setBatches] = useState<Batch[]>(() => loadBatches() ?? seedBatches());
  const [selectedId, setSelectedId] = useState<string | null>(() => batches[0]?.id ?? null);
  const [stageFilter, setStageFilter] = useState<StageFilter>("全部");

  // 任何变更立即落盘，关掉页面再打开仍能看到原记录
  useEffect(() => {
    saveBatches(batches);
  }, [batches]);

  const summaries = useMemo<BatchSummary[]>(
    () =>
      batches.map((batch) => {
        const total = totalDegreeDays(batch.records);
        return { batch, total, stage: stageFor(total) };
      }),
    [batches]
  );

  const visibleSummaries = useMemo(
    () => summaries.filter((s) => stageFilter === "全部" || s.stage === stageFilter),
    [summaries, stageFilter]
  );

  const selected = batches.find((b) => b.id === selectedId) ?? null;

  // 批次被删除后，选中项回退到第一个批次
  useEffect(() => {
    if (batches.length > 0 && !batches.some((b) => b.id === selectedId)) {
      setSelectedId(batches[0].id);
    }
  }, [batches, selectedId]);

  function patchBatch(batchId: string, patch: (batch: Batch) => Batch) {
    setBatches((prev) => prev.map((b) => (b.id === batchId ? patch(b) : b)));
  }

  const actions = {
    selectBatch: setSelectedId,
    setStageFilter,

    addBatch(input: NewBatchInput) {
      const batch: Batch = { ...input, id: uid("batch"), notes: "", records: [] };
      setBatches((prev) => [...prev, batch]);
      setSelectedId(batch.id);
    },

    removeBatch(batchId: string) {
      setBatches((prev) => prev.filter((b) => b.id !== batchId));
    },

    updateNotes(batchId: string, notes: string) {
      patchBatch(batchId, (b) => ({ ...b, notes }));
    },

    addRecord(batchId: string, record: Omit<TempRecord, "id">) {
      patchBatch(batchId, (b) => ({
        ...b,
        records: [...b.records, { ...record, id: uid("rec") }],
      }));
    },

    /** 录入错的温度/时长直接改，阶段与曲线由 summaries 派生自动重算 */
    updateRecord(batchId: string, recordId: string, patch: Partial<Omit<TempRecord, "id">>) {
      patchBatch(batchId, (b) => ({
        ...b,
        records: b.records.map((r) => (r.id === recordId ? { ...r, ...patch } : r)),
      }));
    },

    removeRecord(batchId: string, recordId: string) {
      patchBatch(batchId, (b) => ({
        ...b,
        records: b.records.filter((r) => r.id !== recordId),
      }));
    },
  };

  return { summaries, visibleSummaries, selected, selectedId, stageFilter, actions };
}
