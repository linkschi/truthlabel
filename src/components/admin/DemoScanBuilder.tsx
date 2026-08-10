"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import ProductResult from "@/components/ProductResult";
import DemoAdminLoadingScreen from "@/components/admin/DemoAdminLoadingScreen";
import { buildDemoScanResult } from "@/lib/demoScanBuilder/buildDemoScanResult";
import {
  createBlankDemoCategory,
  createBlankDemoFinding,
  createDemoId,
  createStarterDemoScan,
  demoCategoryIconOptions,
  demoProductQualityOptions,
  demoSeverityOptions,
  type DemoCategoryIconName,
  type DemoScanCategory,
  type DemoScanFinding,
  type DemoScanRecord,
  type DemoSeverity,
} from "@/lib/demoScanBuilder/demoScanTypes";
import {
  getDemoScanStoreServerSnapshot,
  deleteDemoScan,
  duplicateDemoScan,
  listDemoScans,
  saveDemoScan,
  subscribeToDemoScans,
} from "@/lib/demoScanBuilder/demoScanStorage";

type DemoScanBuilderProps = {
  adminEmail: string;
  initialDemoId?: string;
};

const severityClasses: Record<DemoSeverity, string> = {
  green: "border-[#BFECCB] bg-[#E9F8EE] text-[#168A43]",
  yellow: "border-[#F4D681] bg-[#FFF5D9] text-[#9A610B]",
  red: "border-[#F3B6B6] bg-[#FDECEC] text-[#A82424]",
};

function cloneDemoCategory(category: DemoScanCategory): DemoScanCategory {
  return {
    ...category,
    id: createDemoId("category"),
    name: `${category.name || "Category"} copy`,
    findings: category.findings.map((finding) => ({
      ...finding,
      id: createDemoId("finding"),
    })),
  };
}

function moveArrayItem<T>(items: T[], fromIndex: number, toIndex: number) {
  if (toIndex < 0 || toIndex >= items.length) {
    return items;
  }

  const nextItems = [...items];
  const [removedItem] = nextItems.splice(fromIndex, 1);
  nextItems.splice(toIndex, 0, removedItem);
  return nextItems;
}

function getDemoUrl(demoId: string) {
  return `/app/admin/demo-scan-builder/demo/${demoId}`;
}

function FieldLabel({
  children,
  htmlFor,
}: {
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#56635C]"
    >
      {children}
    </label>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const id = useMemo(() => createDemoId("field"), []);

  return (
    <div className="space-y-1.5">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-[14px] border border-[#DCE5DF] bg-white px-3 text-[15px] font-semibold text-[#101613] outline-none transition focus:border-[#168A43] focus:ring-4 focus:ring-[#20A653]/12"
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  const id = useMemo(() => createDemoId("field"), []);

  return (
    <div className="space-y-1.5">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <textarea
        id={id}
        value={value}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full resize-y rounded-[14px] border border-[#DCE5DF] bg-white px-3 py-2.5 text-[14px] leading-6 text-[#101613] outline-none transition focus:border-[#168A43] focus:ring-4 focus:ring-[#20A653]/12"
      />
    </div>
  );
}

function SelectInput<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
}) {
  const id = useMemo(() => createDemoId("field"), []);

  return (
    <div className="space-y-1.5">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="h-11 w-full rounded-[14px] border border-[#DCE5DF] bg-white px-3 text-[15px] font-semibold capitalize text-[#101613] outline-none transition focus:border-[#168A43] focus:ring-4 focus:ring-[#20A653]/12"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function SmallButton({
  children,
  onClick,
  tone = "neutral",
  disabled = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  tone?: "neutral" | "primary" | "danger";
  disabled?: boolean;
}) {
  const toneClass =
    tone === "primary"
      ? "border-[#0E5A3F] bg-[#0E5A3F] text-white"
      : tone === "danger"
        ? "border-[#F3B6B6] bg-[#FDECEC] text-[#A82424]"
        : "border-[#DCE5DF] bg-white text-[#101613]";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-9 items-center justify-center rounded-full border px-3 text-[13px] font-bold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 ${toneClass}`}
    >
      {children}
    </button>
  );
}

function FindingEditor({
  finding,
  index,
  canMoveUp,
  canMoveDown,
  onUpdate,
  onRemove,
  onMove,
}: {
  finding: DemoScanFinding;
  index: number;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onUpdate: (finding: DemoScanFinding) => void;
  onRemove: () => void;
  onMove: (direction: -1 | 1) => void;
}) {
  return (
    <div className="rounded-[18px] border border-[#DCE5DF] bg-[#F7F9F7] p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[13px] font-black text-[#101613]">
          Finding {index + 1}
        </p>
        <div className="flex flex-wrap gap-1.5">
          <SmallButton onClick={() => onMove(-1)} disabled={!canMoveUp}>
            Up
          </SmallButton>
          <SmallButton onClick={() => onMove(1)} disabled={!canMoveDown}>
            Down
          </SmallButton>
          <SmallButton onClick={onRemove} tone="danger">
            Remove
          </SmallButton>
        </div>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_150px]">
        <TextInput
          label="Item name"
          value={finding.name}
          onChange={(name) => onUpdate({ ...finding, name })}
        />
        <SelectInput
          label="Severity"
          value={finding.severity}
          options={demoSeverityOptions}
          onChange={(severity) => onUpdate({ ...finding, severity })}
        />
      </div>
      <div className="mt-3">
        <TextArea
          label="Item explanation"
          value={finding.explanation}
          rows={2}
          onChange={(explanation) => onUpdate({ ...finding, explanation })}
        />
      </div>
    </div>
  );
}

function CategoryEditor({
  category,
  index,
  canMoveUp,
  canMoveDown,
  onUpdate,
  onRemove,
  onDuplicate,
  onMove,
}: {
  category: DemoScanCategory;
  index: number;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onUpdate: (category: DemoScanCategory) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onMove: (direction: -1 | 1) => void;
}) {
  function updateFinding(findingIndex: number, finding: DemoScanFinding) {
    onUpdate({
      ...category,
      findings: category.findings.map((entry, entryIndex) =>
        entryIndex === findingIndex ? finding : entry,
      ),
    });
  }

  function removeFinding(findingIndex: number) {
    onUpdate({
      ...category,
      findings: category.findings.filter((_, entryIndex) => entryIndex !== findingIndex),
    });
  }

  function moveFinding(findingIndex: number, direction: -1 | 1) {
    onUpdate({
      ...category,
      findings: moveArrayItem(
        category.findings,
        findingIndex,
        findingIndex + direction,
      ),
    });
  }

  return (
    <section className="rounded-[24px] border border-[#DCE5DF] bg-white p-4 shadow-[0_14px_32px_rgba(16,22,19,0.06)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#56635C]">
            Category {index + 1}
          </p>
          <h3 className="mt-1 text-[20px] font-black tracking-[-0.03em] text-[#101613]">
            {category.name || "Untitled category"}
          </h3>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-[12px] font-black capitalize ${severityClasses[category.severity]}`}
        >
          {category.severity}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <SmallButton onClick={() => onMove(-1)} disabled={!canMoveUp}>
          Move up
        </SmallButton>
        <SmallButton onClick={() => onMove(1)} disabled={!canMoveDown}>
          Move down
        </SmallButton>
        <SmallButton onClick={onDuplicate}>Duplicate</SmallButton>
        <SmallButton onClick={onRemove} tone="danger">
          Remove
        </SmallButton>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <TextInput
          label="Category name"
          value={category.name}
          onChange={(name) => onUpdate({ ...category, name })}
        />
        <SelectInput<DemoCategoryIconName>
          label="Category icon"
          value={category.iconName}
          options={demoCategoryIconOptions}
          onChange={(iconName) => onUpdate({ ...category, iconName })}
        />
        <TextInput
          label="Yes / No / status text"
          value={category.statusLabel}
          onChange={(statusLabel) => onUpdate({ ...category, statusLabel })}
          placeholder="Yes, No, Heavy, Likely, Review..."
        />
        <SelectInput
          label="Category severity"
          value={category.severity}
          options={demoSeverityOptions}
          onChange={(severity) => onUpdate({ ...category, severity })}
        />
        <div className="space-y-1.5">
          <FieldLabel>Number/count badge</FieldLabel>
          <input
            type="number"
            min={0}
            value={category.count}
            onChange={(event) =>
              onUpdate({
                ...category,
                count: Math.max(0, Math.round(Number(event.target.value) || 0)),
              })
            }
            className="h-11 w-full rounded-[14px] border border-[#DCE5DF] bg-white px-3 text-[15px] font-semibold text-[#101613] outline-none transition focus:border-[#168A43] focus:ring-4 focus:ring-[#20A653]/12"
          />
        </div>
      </div>

      <div className="mt-3 grid gap-3">
        <TextArea
          label="Category reason"
          value={category.reason}
          onChange={(reason) => onUpdate({ ...category, reason })}
        />
        <TextArea
          label="Expanded explanation"
          value={category.message}
          onChange={(message) => onUpdate({ ...category, message })}
        />
        <TextArea
          label="Action line"
          value={category.action}
          onChange={(action) => onUpdate({ ...category, action })}
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#DCE5DF] pt-4">
        <div>
          <h4 className="text-[15px] font-black text-[#101613]">
            Findings inside this category
          </h4>
          <p className="text-[13px] text-[#56635C]">
            These are manual item cards shown when the category opens.
          </p>
        </div>
        <SmallButton
          tone="primary"
          onClick={() =>
            onUpdate({
              ...category,
              findings: [...category.findings, createBlankDemoFinding()],
            })
          }
        >
          Add finding
        </SmallButton>
      </div>

      <div className="mt-3 space-y-3">
        {category.findings.length > 0 ? (
          category.findings.map((finding, findingIndex) => (
            <FindingEditor
              key={finding.id}
              finding={finding}
              index={findingIndex}
              canMoveUp={findingIndex > 0}
              canMoveDown={findingIndex < category.findings.length - 1}
              onUpdate={(nextFinding) => updateFinding(findingIndex, nextFinding)}
              onRemove={() => removeFinding(findingIndex)}
              onMove={(direction) => moveFinding(findingIndex, direction)}
            />
          ))
        ) : (
          <p className="rounded-[16px] border border-dashed border-[#DCE5DF] bg-[#F7F9F7] px-3 py-4 text-[14px] font-semibold text-[#56635C]">
            No findings yet. Add one if this category should expand with item details.
          </p>
        )}
      </div>
    </section>
  );
}

export default function DemoScanBuilder({
  adminEmail,
  initialDemoId,
}: DemoScanBuilderProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const records = useSyncExternalStore(
    subscribeToDemoScans,
    listDemoScans,
    getDemoScanStoreServerSnapshot,
  );
  const [starterRecord] = useState(createStarterDemoScan);
  const [selectedDemoId, setSelectedDemoId] = useState(initialDemoId ?? "");
  const [draftRecord, setDraftRecord] = useState<DemoScanRecord | null>(null);
  const [statusMessage, setStatusMessage] = useState("Demo is not saved yet.");
  const [initialPreparing, setInitialPreparing] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("");
  const selectedRecord =
    records.find((record) => record.id === selectedDemoId) ??
    records.find((record) => record.id === initialDemoId) ??
    records[0] ??
    null;
  const activeRecord = draftRecord ?? selectedRecord ?? starterRecord;

  const demoScanResult = useMemo(
    () => buildDemoScanResult(activeRecord),
    [activeRecord],
  );
  const standaloneUrl = getDemoUrl(activeRecord.id);

  useEffect(() => {
    const timer = window.setTimeout(() => setInitialPreparing(false), 750);

    return () => window.clearTimeout(timer);
  }, []);

  function runDemoTask(message: string, task: () => void | Promise<void>) {
    setLoadingMessage(message);

    window.setTimeout(() => {
      void Promise.resolve()
        .then(task)
        .catch(() => {
          setStatusMessage("That demo action failed. Try again.");
        })
        .finally(() => {
          setLoadingMessage("");
        });
    }, 750);
  }

  function openDemoRoute(message: string, href: string) {
    setLoadingMessage(message);

    window.setTimeout(() => {
      router.push(href);
    }, 750);
  }

  function updateActiveRecord(nextRecord: DemoScanRecord) {
    setDraftRecord({
      ...nextRecord,
      kind: "truthlabel_demo_scan",
    });
    setSelectedDemoId(nextRecord.id);
    setStatusMessage("Unsaved changes.");
  }

  function saveCurrentDemo() {
    runDemoTask("Saving demo", () => {
      const savedRecord = saveDemoScan(activeRecord);
      setSelectedDemoId(savedRecord.id);
      setDraftRecord(savedRecord);
      setStatusMessage("Demo saved locally.");
    });
  }

  function createNewDemo() {
    runDemoTask("Preparing new demo", () => {
      const nextRecord = createStarterDemoScan();
      setSelectedDemoId(nextRecord.id);
      setDraftRecord(nextRecord);
      setStatusMessage("Started a new unsaved demo.");
    });
  }

  function duplicateCurrentDemo() {
    runDemoTask("Duplicating demo", () => {
      const duplicatedRecord = duplicateDemoScan(activeRecord);
      setSelectedDemoId(duplicatedRecord.id);
      setDraftRecord(duplicatedRecord);
      setStatusMessage("Demo duplicated.");
    });
  }

  function deleteCurrentDemo() {
    if (!window.confirm("Delete this demo example from this device?")) {
      return;
    }

    runDemoTask("Deleting demo", () => {
      deleteDemoScan(activeRecord.id);
      const nextRecords = listDemoScans();
      const nextRecord = nextRecords[0] ?? createStarterDemoScan();
      setSelectedDemoId(nextRecord.id);
      setDraftRecord(nextRecords[0] ? null : nextRecord);
      setStatusMessage("Demo deleted from this device.");
    });
  }

  function updateCategory(categoryIndex: number, nextCategory: DemoScanCategory) {
    updateActiveRecord({
      ...activeRecord,
      categories: activeRecord.categories.map((category, index) =>
        index === categoryIndex ? nextCategory : category,
      ),
    });
  }

  function moveCategory(categoryIndex: number, direction: -1 | 1) {
    updateActiveRecord({
      ...activeRecord,
      categories: moveArrayItem(
        activeRecord.categories,
        categoryIndex,
        categoryIndex + direction,
      ),
    });
  }

  function handleImageUpload(file: File | undefined) {
    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      updateActiveRecord({
        ...activeRecord,
        productImageDataUrl:
          typeof reader.result === "string" ? reader.result : "",
      });
    };

    reader.readAsDataURL(file);
  }

  async function copyStandaloneLink() {
    runDemoTask("Copying demo URL", async () => {
      const origin = window.location.origin;
      const url = `${origin}${standaloneUrl}`;

      await navigator.clipboard?.writeText(url);
      setStatusMessage("Standalone demo URL copied.");
    });
  }

  return (
    <main className="min-h-screen bg-[#F7F9F7] px-4 py-5 text-[#101613] sm:px-6 lg:px-8">
      {initialPreparing || loadingMessage ? (
        <DemoAdminLoadingScreen
          message={loadingMessage || "Preparing Demo Scan Builder"}
        />
      ) : null}
      <div className="mx-auto max-w-[1420px]">
        <header className="rounded-[28px] border border-[#DCE5DF] bg-white p-5 shadow-[0_18px_42px_rgba(16,22,19,0.08)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <p className="text-[12px] font-black uppercase tracking-[0.18em] text-[#A82424]">
                Private admin tool
              </p>
              <h1 className="mt-2 font-heading text-[34px] font-black tracking-[-0.05em] text-[#101613] sm:text-[44px]">
                Demo Scan Builder
              </h1>
              <p className="mt-2 text-[15px] leading-6 text-[#56635C]">
                Build manual example result screens without scanning, calculating,
                or changing real product data. Every record is saved as demo-only.
              </p>
            </div>
            <div className="rounded-[18px] border border-[#DCE5DF] bg-[#F7F9F7] px-4 py-3 text-right">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#56635C]">
                Admin
              </p>
              <p className="mt-1 max-w-[260px] break-all text-[13px] font-black text-[#101613]">
                {adminEmail}
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <SmallButton tone="primary" onClick={saveCurrentDemo}>
              Save demo
            </SmallButton>
            <SmallButton onClick={createNewDemo}>New demo</SmallButton>
            <SmallButton onClick={duplicateCurrentDemo}>Duplicate demo</SmallButton>
            <SmallButton onClick={copyStandaloneLink}>Copy demo URL</SmallButton>
            <button
              type="button"
              onClick={() => openDemoRoute("Opening demo result", standaloneUrl)}
              className="inline-flex h-9 items-center justify-center rounded-full border border-[#DCE5DF] bg-white px-3 text-[13px] font-bold text-[#101613] transition active:scale-[0.98]"
            >
              Open demo URL
            </button>
            <SmallButton tone="danger" onClick={deleteCurrentDemo}>
              Delete demo
            </SmallButton>
          </div>

          <p className="mt-3 rounded-full border border-[#DCE5DF] bg-[#F7F9F7] px-3 py-2 text-[13px] font-semibold text-[#56635C]">
            {statusMessage}
          </p>
        </header>

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(460px,1.1fr)]">
          <div className="space-y-5">
            <section className="rounded-[24px] border border-[#DCE5DF] bg-white p-4 shadow-[0_14px_32px_rgba(16,22,19,0.06)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-[22px] font-black tracking-[-0.03em] text-[#101613]">
                    Saved demo examples
                  </h2>
                  <p className="text-[13px] text-[#56635C]">
                    Stored locally on this admin device.
                  </p>
                </div>
                <span className="rounded-full border border-[#DCE5DF] bg-[#F7F9F7] px-3 py-1 text-[12px] font-black text-[#56635C]">
                  {records.length} saved
                </span>
              </div>

              <div className="mt-3 grid gap-2">
                {records.length > 0 ? (
                  records.map((record) => (
                    <button
                      key={record.id}
                      type="button"
                      onClick={() =>
                        runDemoTask("Opening saved demo", () => {
                          setSelectedDemoId(record.id);
                          setDraftRecord(record);
                          setStatusMessage("Opened saved demo.");
                        })
                      }
                      className={`rounded-[18px] border px-3 py-3 text-left transition active:scale-[0.99] ${
                        record.id === activeRecord.id
                          ? "border-[#0E5A3F] bg-[#EDF7F1]"
                          : "border-[#DCE5DF] bg-white hover:bg-[#F7F9F7]"
                      }`}
                    >
                      <p className="font-black text-[#101613]">
                        {record.internalTitle || record.productName}
                      </p>
                      <p className="mt-1 truncate text-[13px] text-[#56635C]">
                        {record.productName} {record.brandName ? `- ${record.brandName}` : ""}
                      </p>
                    </button>
                  ))
                ) : (
                  <p className="rounded-[18px] border border-dashed border-[#DCE5DF] bg-[#F7F9F7] px-3 py-4 text-[14px] font-semibold text-[#56635C]">
                    No saved demos yet. Build one, then press Save demo.
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-[24px] border border-[#DCE5DF] bg-white p-4 shadow-[0_14px_32px_rgba(16,22,19,0.06)]">
              <h2 className="text-[22px] font-black tracking-[-0.03em] text-[#101613]">
                Product setup
              </h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <TextInput
                  label="Internal title"
                  value={activeRecord.internalTitle}
                  onChange={(internalTitle) =>
                    updateActiveRecord({ ...activeRecord, internalTitle })
                  }
                />
                <TextInput
                  label="Product name"
                  value={activeRecord.productName}
                  onChange={(productName) =>
                    updateActiveRecord({ ...activeRecord, productName })
                  }
                />
                <TextInput
                  label="Brand optional"
                  value={activeRecord.brandName}
                  onChange={(brandName) =>
                    updateActiveRecord({ ...activeRecord, brandName })
                  }
                />
                <div className="space-y-1.5">
                  <FieldLabel>Ingredient score / percentage</FieldLabel>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={activeRecord.ingredientScore}
                    onChange={(event) =>
                      updateActiveRecord({
                        ...activeRecord,
                        ingredientScore: Math.max(
                          0,
                          Math.min(100, Math.round(Number(event.target.value) || 0)),
                        ),
                      })
                    }
                    className="h-11 w-full rounded-[14px] border border-[#DCE5DF] bg-white px-3 text-[15px] font-semibold text-[#101613] outline-none transition focus:border-[#168A43] focus:ring-4 focus:ring-[#20A653]/12"
                  />
                </div>
                <SelectInput
                  label="Product quality"
                  value={activeRecord.productQuality}
                  options={demoProductQualityOptions}
                  onChange={(productQuality) =>
                    updateActiveRecord({ ...activeRecord, productQuality })
                  }
                />
                <SelectInput
                  label="Verdict color / severity"
                  value={activeRecord.verdictSeverity}
                  options={demoSeverityOptions}
                  onChange={(verdictSeverity) =>
                    updateActiveRecord({ ...activeRecord, verdictSeverity })
                  }
                />
              </div>

              <div className="mt-4 grid gap-3">
                <TextInput
                  label="Final verdict heading"
                  value={activeRecord.finalHeadline}
                  onChange={(finalHeadline) =>
                    updateActiveRecord({ ...activeRecord, finalHeadline })
                  }
                />
                <TextArea
                  label="Final verdict summary"
                  value={activeRecord.finalSummary}
                  onChange={(finalSummary) =>
                    updateActiveRecord({ ...activeRecord, finalSummary })
                  }
                />
              </div>

              <div className="mt-5 rounded-[20px] border border-[#DCE5DF] bg-[#F7F9F7] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-[16px] font-black text-[#101613]">
                      Product image
                    </h3>
                    <p className="text-[13px] text-[#56635C]">
                      Upload, change, or remove the demo image.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <SmallButton onClick={() => fileInputRef.current?.click()}>
                      Upload image
                    </SmallButton>
                    <SmallButton
                      tone="danger"
                      onClick={() =>
                        updateActiveRecord({
                          ...activeRecord,
                          productImageDataUrl: "",
                        })
                      }
                    >
                      Remove image
                    </SmallButton>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => handleImageUpload(event.target.files?.[0])}
                />
                {activeRecord.productImageDataUrl ? (
                  <div className="relative mt-4 h-44 overflow-hidden rounded-[18px] border border-[#DCE5DF] bg-white">
                    <Image
                      src={activeRecord.productImageDataUrl}
                      alt="Demo product"
                      fill
                      sizes="360px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="mt-4 flex h-36 items-center justify-center rounded-[18px] border border-dashed border-[#DCE5DF] bg-white text-[14px] font-semibold text-[#56635C]">
                    No image selected.
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-[24px] border border-[#DCE5DF] bg-white p-4 shadow-[0_14px_32px_rgba(16,22,19,0.06)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-[22px] font-black tracking-[-0.03em] text-[#101613]">
                    Manual result categories
                  </h2>
                  <p className="text-[13px] text-[#56635C]">
                    Add, remove, duplicate, rename, reorder, and edit every visible check.
                  </p>
                </div>
                <SmallButton
                  tone="primary"
                  onClick={() =>
                    updateActiveRecord({
                      ...activeRecord,
                      categories: [
                        ...activeRecord.categories,
                        createBlankDemoCategory(),
                      ],
                    })
                  }
                >
                  Add category
                </SmallButton>
              </div>
            </section>

            {activeRecord.categories.length > 0 ? (
              activeRecord.categories.map((category, categoryIndex) => (
                <CategoryEditor
                  key={category.id}
                  category={category}
                  index={categoryIndex}
                  canMoveUp={categoryIndex > 0}
                  canMoveDown={categoryIndex < activeRecord.categories.length - 1}
                  onUpdate={(nextCategory) =>
                    updateCategory(categoryIndex, nextCategory)
                  }
                  onRemove={() =>
                    updateActiveRecord({
                      ...activeRecord,
                      categories: activeRecord.categories.filter(
                        (_, index) => index !== categoryIndex,
                      ),
                    })
                  }
                  onDuplicate={() =>
                    updateActiveRecord({
                      ...activeRecord,
                      categories: [
                        ...activeRecord.categories.slice(0, categoryIndex + 1),
                        cloneDemoCategory(category),
                        ...activeRecord.categories.slice(categoryIndex + 1),
                      ],
                    })
                  }
                  onMove={(direction) => moveCategory(categoryIndex, direction)}
                />
              ))
            ) : (
              <p className="rounded-[24px] border border-dashed border-[#DCE5DF] bg-white px-4 py-6 text-[15px] font-semibold text-[#56635C]">
                This demo has no categories. Add one to build the result checklist.
              </p>
            )}
          </div>

          <aside className="xl:sticky xl:top-4 xl:self-start">
            <div className="rounded-[28px] border border-[#DCE5DF] bg-[#101613] p-3 shadow-[0_22px_52px_rgba(16,22,19,0.22)]">
              <div className="flex flex-wrap items-center justify-between gap-3 px-2 py-2 text-white">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/60">
                    Live preview
                  </p>
                  <h2 className="text-[18px] font-black">Exact Results UI</h2>
                </div>
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold text-white/80">
                  Demo only
                </span>
              </div>
              <div className="max-h-[calc(100vh-112px)] overflow-y-auto rounded-[24px] bg-white">
                <ProductResult
                  demoScanResult={demoScanResult}
                  doneHrefOverride="/app/admin/demo-scan-builder"
                  showTestingFeedback={false}
                />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
