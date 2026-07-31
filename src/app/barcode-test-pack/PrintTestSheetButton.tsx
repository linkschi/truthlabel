"use client";

export default function PrintTestSheetButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex min-h-11 items-center rounded-full border border-[#D7E7DD] bg-[#F3FAF6] px-5 text-[13px] font-black text-[#0E5A3F] transition hover:bg-[#E8F6EF] active:scale-[0.98]"
    >
      Print test sheet
    </button>
  );
}
