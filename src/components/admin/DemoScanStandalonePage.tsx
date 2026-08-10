"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import ProductResult from "@/components/ProductResult";
import DemoAdminLoadingScreen from "@/components/admin/DemoAdminLoadingScreen";
import { buildDemoScanResult } from "@/lib/demoScanBuilder/buildDemoScanResult";
import {
  getDemoScanStoreServerSnapshot,
  listDemoScans,
  subscribeToDemoScans,
} from "@/lib/demoScanBuilder/demoScanStorage";

type DemoScanStandalonePageProps = {
  demoId: string;
  adminEmail: string;
  launchMode?: "preview" | "scan";
};

const demoScanStages = [
  "Preparing demo scan",
  "Loading saved result",
  "Applying your custom checks",
  "Opening final result",
] as const;

function DemoScanExperienceLoading({
  productName,
  productImageUrl,
  stageLabel,
}: {
  productName?: string;
  productImageUrl?: string;
  stageLabel: string;
}) {
  const currentStageIndex = Math.max(
    0,
    demoScanStages.indexOf(stageLabel as (typeof demoScanStages)[number]),
  );

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[85] bg-[rgba(12,22,18,0.76)] px-4 py-5 backdrop-blur-sm sm:px-5 sm:py-6"
    >
      <div className="mx-auto flex h-full w-full max-w-[440px] flex-col justify-center rounded-[30px] border border-white/14 bg-[#102019] p-5 text-white shadow-[0_28px_60px_rgba(0,0,0,0.38)]">
        <div className="overflow-hidden rounded-[28px] border border-white/14 bg-[radial-gradient(circle_at_top,rgba(30,145,120,0.22),rgba(255,255,255,0.045)_46%,rgba(255,255,255,0.03)_100%)] px-5 py-6 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#A7F3D0]">
            Truthlabel
          </p>
          <h2 className="mt-2 font-heading text-[1.45rem] font-semibold text-white">
            Analyzing this product
          </h2>
          <p className="mx-auto mt-2 max-w-[300px] text-[14px] leading-6 text-white/78">
            Opening your saved custom demo through the full result experience.
          </p>

          <div className="relative mx-auto mt-6 h-[190px] w-full max-w-[320px]">
            <div className="absolute left-1/2 top-1/2 h-[154px] w-[154px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#6EE7B7]/30" />
            <div className="absolute left-4 top-8 rounded-full border border-[#6EE7B7]/26 bg-[#12372D] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#A7F3D0]">
              custom demo
            </div>
            <div className="absolute right-2 top-16 rounded-full border border-[#FCD34D]/28 bg-[#342A12] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#FDE68A]">
              result checks
            </div>
            <div className="absolute bottom-8 left-8 rounded-full border border-[#6EE7B7]/22 bg-[#12372D] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#BBF7D0]">
              saved scan
            </div>

            <div className="absolute left-1/2 top-1/2 h-[112px] w-[112px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[26px] border border-white/18 bg-[#0D241C] shadow-[0_24px_60px_rgba(16,185,129,0.16)]">
              {productImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={productImageUrl}
                  alt={productName ? `${productName} demo preview` : "Demo product preview"}
                  className="h-full w-full object-cover opacity-90"
                />
              ) : (
                <div className="absolute inset-4 rounded-[18px] border border-white/18 bg-white/10 px-3 py-4">
                  <div className="h-2 rounded-full bg-white/62" />
                  <div className="mt-2 h-2 rounded-full bg-[#FCD34D]/82" />
                  <div className="mt-2 h-2 rounded-full bg-[#6EE7B7]/82" />
                  <div className="mt-4 h-8 rounded-[12px] border border-white/14 bg-white/8" />
                </div>
              )}
              <div className="absolute inset-x-0 top-0 h-[2px] animate-[truthlabel-scanline_1.55s_linear_infinite] bg-[linear-gradient(90deg,transparent,#6EE7B7,transparent)] shadow-[0_0_18px_rgba(110,231,183,0.9)] motion-reduce:animate-none" />
            </div>
          </div>

          <div className="mt-5 space-y-2 text-left">
            {demoScanStages.map((stage) => {
              const isCurrent = stage === stageLabel;
              const isDone = demoScanStages.indexOf(stage) < currentStageIndex;

              return (
                <div
                  key={stage}
                  className={`grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-[16px] border px-3 py-2.5 transition-colors ${
                    isCurrent
                      ? "border-[#6EE7B7]/42 bg-white/10"
                      : "border-white/10 bg-white/[0.045]"
                  }`}
                >
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                      isDone
                        ? "bg-[#16A34A] text-white"
                        : isCurrent
                          ? "bg-[#10B981] text-white"
                          : "bg-white/12 text-white/54"
                    }`}
                  >
                    {isDone ? "OK" : demoScanStages.indexOf(stage) + 1}
                  </span>
                  <span
                    className={`text-[13px] font-semibold ${
                      isDone || isCurrent ? "text-white" : "text-white/54"
                    }`}
                  >
                    {stage}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="mt-4 text-[11px] font-medium text-white/62">
            Current stage: {stageLabel}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function DemoScanStandalonePage({
  demoId,
  adminEmail,
  launchMode = "preview",
}: DemoScanStandalonePageProps) {
  const router = useRouter();
  const [isPreparing, setIsPreparing] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [scanStageIndex, setScanStageIndex] = useState(0);
  const records = useSyncExternalStore(
    subscribeToDemoScans,
    listDemoScans,
    getDemoScanStoreServerSnapshot,
  );
  const record = records.find((demoRecord) => demoRecord.id === demoId) ?? null;

  const demoScanResult = useMemo(
    () => (record ? buildDemoScanResult(record) : null),
    [record],
  );

  useEffect(() => {
    let cancelled = false;
    const timers: number[] = [];

    if (launchMode === "scan") {
      setScanStageIndex(0);

      demoScanStages.forEach((_, index) => {
        const timer = window.setTimeout(() => {
          if (!cancelled) {
            setScanStageIndex(index);
          }
        }, index * 360);

        timers.push(timer);
      });

      const finishTimer = window.setTimeout(() => {
        if (!cancelled) {
          setIsPreparing(false);
        }
      }, demoScanStages.length * 360 + 320);

      timers.push(finishTimer);
    } else {
      const timer = window.setTimeout(() => {
        if (!cancelled) {
          setIsPreparing(false);
        }
      }, 850);

      timers.push(timer);
    }

    return () => {
      cancelled = true;
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [launchMode]);

  function openBuilder() {
    setLoadingMessage("Opening demo editor");

    window.setTimeout(() => {
      router.push(record ? `/app/admin/demo-scan-builder?demo=${record.id}` : "/app/admin/demo-scan-builder");
    }, 750);
  }

  if (isPreparing || loadingMessage) {
    if (launchMode === "scan") {
      return (
        <DemoScanExperienceLoading
          productName={record?.productName}
          productImageUrl={record?.productImageDataUrl}
          stageLabel={loadingMessage || demoScanStages[scanStageIndex] || demoScanStages[0]}
        />
      );
    }

    return (
      <DemoAdminLoadingScreen
        message={loadingMessage || "Preparing demo result"}
      />
    );
  }

  if (!record || !demoScanResult) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F9F7] px-4">
        <div className="max-w-md rounded-[24px] border border-[#DCE5DF] bg-white p-6 text-center shadow-[0_18px_42px_rgba(16,22,19,0.08)]">
          <p className="text-[12px] font-black uppercase tracking-[0.16em] text-[#A82424]">
            Demo not found
          </p>
          <h1 className="mt-2 text-[28px] font-black tracking-[-0.04em] text-[#101613]">
            This demo is not saved on this device.
          </h1>
          <p className="mt-2 text-[14px] leading-6 text-[#56635C]">
            Demo examples are private admin records stored locally in your browser.
            Open the builder on the device where you saved it.
          </p>
          <button
            type="button"
            onClick={openBuilder}
            className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-[#0E5A3F] px-5 text-[14px] font-black text-white"
          >
            Back to builder
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F9F7]">
      {launchMode === "preview" ? (
        <div className="mx-auto flex max-w-[560px] items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#A82424]">
              Admin demo result
            </p>
            <p className="max-w-[260px] truncate text-[12px] font-semibold text-[#56635C]">
              {adminEmail}
            </p>
          </div>
          <button
            type="button"
            onClick={openBuilder}
            className="inline-flex h-9 items-center justify-center rounded-full border border-[#DCE5DF] bg-white px-3 text-[13px] font-black text-[#101613]"
          >
            Edit demo
          </button>
        </div>
      ) : null}
      <ProductResult
        demoScanResult={demoScanResult}
        doneHrefOverride="/app/admin/demo-scan-builder"
        freshResult={launchMode === "scan"}
        showTestingFeedback={false}
      />
    </main>
  );
}
