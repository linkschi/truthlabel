"use client";

export default function DemoAdminLoadingScreen({
  message = "Preparing demo",
}: {
  message?: string;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#F7F9F7]/92 px-4 backdrop-blur-sm">
      <section className="w-full max-w-[420px] rounded-[30px] border border-[#DCE5DF] bg-white px-5 py-6 text-center shadow-[0_24px_60px_rgba(16,22,19,0.14)]">
        <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
          <span className="absolute h-24 w-24 animate-spin rounded-full border-4 border-[#DCE5DF] border-t-[#0E5A3F] motion-reduce:animate-none" />
          <span className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#0E5A3F] text-[22px] font-black text-white shadow-[0_16px_36px_rgba(14,90,63,0.22)]">
            TL
          </span>
        </div>
        <p className="mt-5 text-[11px] font-black uppercase tracking-[0.18em] text-[#0E5A3F]">
          Truthlabel demo
        </p>
        <h1 className="mt-2 font-heading text-[1.55rem] font-black tracking-[-0.04em] text-[#101613]">
          {message}
        </h1>
        <p className="mt-2 text-[13px] font-semibold leading-5 text-[#56635C]">
          Building the preview with the same result screen your users see.
        </p>
      </section>
    </div>
  );
}
