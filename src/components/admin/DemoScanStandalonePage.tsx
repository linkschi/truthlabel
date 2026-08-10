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
};

export default function DemoScanStandalonePage({
  demoId,
  adminEmail,
}: DemoScanStandalonePageProps) {
  const router = useRouter();
  const [isPreparing, setIsPreparing] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("");
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
    const timer = window.setTimeout(() => setIsPreparing(false), 850);

    return () => window.clearTimeout(timer);
  }, []);

  function openBuilder() {
    setLoadingMessage("Opening demo editor");

    window.setTimeout(() => {
      router.push(record ? `/app/admin/demo-scan-builder?demo=${record.id}` : "/app/admin/demo-scan-builder");
    }, 750);
  }

  if (isPreparing || loadingMessage) {
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
      <ProductResult
        demoScanResult={demoScanResult}
        doneHrefOverride="/app/admin/demo-scan-builder"
        showTestingFeedback={false}
      />
    </main>
  );
}
