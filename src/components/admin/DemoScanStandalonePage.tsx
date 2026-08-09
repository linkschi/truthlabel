"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import ProductResult from "@/components/ProductResult";
import { buildDemoScanResult } from "@/lib/demoScanBuilder/buildDemoScanResult";
import {
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
  const records = useSyncExternalStore(
    subscribeToDemoScans,
    listDemoScans,
    () => [],
  );
  const record = records.find((demoRecord) => demoRecord.id === demoId) ?? null;

  const demoScanResult = useMemo(
    () => (record ? buildDemoScanResult(record) : null),
    [record],
  );

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
          <Link
            href="/app/admin/demo-scan-builder"
            className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-[#0E5A3F] px-5 text-[14px] font-black text-white"
          >
            Back to builder
          </Link>
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
        <Link
          href={`/app/admin/demo-scan-builder?demo=${record.id}`}
          className="inline-flex h-9 items-center justify-center rounded-full border border-[#DCE5DF] bg-white px-3 text-[13px] font-black text-[#101613]"
        >
          Edit demo
        </Link>
      </div>
      <ProductResult
        demoScanResult={demoScanResult}
        doneHrefOverride="/app/admin/demo-scan-builder"
        showTestingFeedback={false}
      />
    </main>
  );
}
