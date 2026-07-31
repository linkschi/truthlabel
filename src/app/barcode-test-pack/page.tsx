import Link from "next/link";
import type { Metadata } from "next";
import PrintTestSheetButton from "./PrintTestSheetButton";

export const metadata: Metadata = {
  title: "Barcode Test Pack",
  description:
    "A Truthlabel QA page with scannable barcode cards for camera testing.",
};

const eanLeftOdd = [
  "0001101",
  "0011001",
  "0010011",
  "0111101",
  "0100011",
  "0110001",
  "0101111",
  "0111011",
  "0110111",
  "0001011",
] as const;

const eanLeftEven = [
  "0100111",
  "0110011",
  "0011011",
  "0100001",
  "0011101",
  "0111001",
  "0000101",
  "0010001",
  "0001001",
  "0010111",
] as const;

const eanRight = [
  "1110010",
  "1100110",
  "1101100",
  "1000010",
  "1011100",
  "1001110",
  "1010000",
  "1000100",
  "1001000",
  "1110100",
] as const;

const eanParity = [
  "LLLLLL",
  "LLGLGG",
  "LLGGLG",
  "LLGGGL",
  "LGLLGG",
  "LGGLLG",
  "LGGGLL",
  "LGLGLG",
  "LGLGGL",
  "LGGLGL",
] as const;

type BarcodeCard = {
  barcode: string;
  title: string;
  note: string;
  expected: "lookup" | "camera-only" | "south-africa";
};

const lookupExamples: BarcodeCard[] = [
  {
    barcode: "5449000000996",
    title: "Coca-Cola example",
    note: "Known Open Food Facts lookup example.",
    expected: "lookup",
  },
  {
    barcode: "5000159407236",
    title: "Mars example",
    note: "Known Open Food Facts lookup example.",
    expected: "lookup",
  },
  {
    barcode: "1000000000009",
    title: "Open database example",
    note: "Useful for checking lookup behavior with a real EAN-13.",
    expected: "lookup",
  },
  {
    barcode: "6003678052405",
    title: "South Africa test code",
    note: "Useful for checking the South African fallback message.",
    expected: "south-africa",
  },
];

const cameraOnlyExamples: BarcodeCard[] = [
  "1000000000016",
  "1000000000023",
  "1000000000030",
  "1000000000047",
  "1000000000054",
  "1000000000061",
  "1000000000078",
  "1000000000085",
  "1000000000092",
  "1000000000108",
  "1000000000115",
  "1000000000122",
  "1000000000139",
  "1000000000146",
  "1000000000153",
  "1000000000160",
  "1000000000177",
  "1000000000184",
  "1000000000191",
  "1000000000207",
  "1000000000214",
  "1000000000221",
  "1000000000238",
  "1000000000245",
].map((barcode, index) => ({
  barcode,
  title: `Camera test ${String(index + 1).padStart(2, "0")}`,
  note: "Valid EAN-13 symbol for camera-read testing.",
  expected: "camera-only" as const,
}));

function getCheckDigit(value: string) {
  const digits = value.replace(/\D/g, "");
  const body = digits.length === 13 ? digits.slice(0, 12) : digits;
  let sum = 0;
  let useThree = true;

  for (let index = body.length - 1; index >= 0; index -= 1) {
    sum += Number(body[index]) * (useThree ? 3 : 1);
    useThree = !useThree;
  }

  return String((10 - (sum % 10)) % 10);
}

function normalizeEan13(value: string) {
  const digits = value.replace(/\D/g, "");

  if (digits.length === 12) {
    return `${digits}${getCheckDigit(digits)}`;
  }

  return digits;
}

function encodeEan13(value: string) {
  const digits = normalizeEan13(value);

  if (!/^\d{13}$/.test(digits) || getCheckDigit(digits) !== digits[12]) {
    throw new Error(`Invalid EAN-13 barcode: ${value}`);
  }

  const firstDigit = Number(digits[0]);
  const parity = eanParity[firstDigit];
  const leftDigits = digits.slice(1, 7).split("");
  const rightDigits = digits.slice(7).split("");

  return [
    "101",
    ...leftDigits.map((digit, index) => {
      const numericDigit = Number(digit);
      return parity[index] === "L"
        ? eanLeftOdd[numericDigit]
        : eanLeftEven[numericDigit];
    }),
    "01010",
    ...rightDigits.map((digit) => eanRight[Number(digit)]),
    "101",
  ].join("");
}

function Ean13Svg({ barcode }: { barcode: string }) {
  const encoded = encodeEan13(barcode);
  const bars: Array<{ x: number; width: number; guard: boolean }> = [];
  let moduleIndex = 0;

  while (moduleIndex < encoded.length) {
    if (encoded[moduleIndex] !== "1") {
      moduleIndex += 1;
      continue;
    }

    let width = 1;
    while (encoded[moduleIndex + width] === "1") {
      width += 1;
    }

    const guard =
      moduleIndex < 3 ||
      (moduleIndex >= 45 && moduleIndex < 50) ||
      moduleIndex >= 92;

    bars.push({ x: moduleIndex + 9, width, guard });
    moduleIndex += width;
  }

  return (
    <svg
      aria-label={`Barcode ${barcode}`}
      className="h-auto w-full"
      role="img"
      viewBox="0 0 113 82"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="113" height="82" fill="#fff" />
      {bars.map((bar) => (
        <rect
          key={`${bar.x}-${bar.width}`}
          x={bar.x}
          y="5"
          width={bar.width}
          height={bar.guard ? 58 : 50}
          fill="#050505"
          shapeRendering="crispEdges"
        />
      ))}
      <text
        x="56.5"
        y="76"
        fill="#111"
        fontFamily="Arial, sans-serif"
        fontSize="8"
        fontWeight="700"
        letterSpacing="1.1"
        textAnchor="middle"
      >
        {barcode}
      </text>
    </svg>
  );
}

function StatusBadge({ expected }: { expected: BarcodeCard["expected"] }) {
  const copy =
    expected === "lookup"
      ? "Lookup test"
      : expected === "south-africa"
        ? "SA fallback test"
        : "Camera-only";
  const className =
    expected === "lookup"
      ? "bg-[#E8F6EF] text-[#0E5A3F]"
      : expected === "south-africa"
        ? "bg-[#FFFBEC] text-[#8A6500]"
        : "bg-[#FFF6F6] text-[#A33A3F]";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.12em] ${className}`}
    >
      {copy}
    </span>
  );
}

function BarcodeCard({ item }: { item: BarcodeCard }) {
  return (
    <article className="break-inside-avoid rounded-[22px] border border-[#D7E7DD] bg-white p-4 shadow-[0_14px_34px_rgba(15,40,28,0.08)] print:shadow-none">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[17px] font-black tracking-[-0.02em] text-[#101613]">
            {item.title}
          </h2>
          <p className="mt-1 text-[12.5px] font-semibold leading-5 text-[#66716B]">
            {item.note}
          </p>
        </div>
        <StatusBadge expected={item.expected} />
      </div>
      <div className="rounded-[16px] border border-[#E7ECE8] bg-white p-3">
        <Ean13Svg barcode={item.barcode} />
      </div>
      <p className="mt-3 text-center text-[13px] font-black tracking-[0.16em] text-[#101613]">
        {item.barcode}
      </p>
    </article>
  );
}

export default function BarcodeTestPackPage() {
  return (
    <main className="min-h-screen bg-[#FBFDFB] px-4 py-6 text-[#101613] print:bg-white">
      <section className="mx-auto max-w-[1120px]">
        <div className="rounded-[30px] border border-[#D7E7DD] bg-white px-5 py-6 shadow-[0_18px_44px_rgba(15,40,28,0.08)] print:border-0 print:shadow-none">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#0E5A3F]">
            Truthlabel QA
          </p>
          <h1 className="mt-2 text-[34px] font-black tracking-[-0.05em] sm:text-[48px]">
            Barcode test pack
          </h1>
          <p className="mt-3 max-w-[760px] text-[15px] font-semibold leading-7 text-[#66716B]">
            Use this page to test whether the camera reads barcodes reliably.
            Open the scanner on your phone and point it at these cards on a
            laptop screen, tablet, or printed page.
          </p>

          <div className="mt-5 flex flex-wrap gap-2 print:hidden">
            <Link
              href="/app/manual?mode=barcode-camera"
              className="inline-flex min-h-11 items-center rounded-full bg-[#0E5A3F] px-5 text-[13px] font-black text-white transition hover:bg-[#0B4732] active:scale-[0.98]"
            >
              Open barcode scanner
            </Link>
            <PrintTestSheetButton />
          </div>
        </div>

        <section className="mt-6">
          <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-[24px] font-black tracking-[-0.04em]">
                Lookup examples
              </h2>
              <p className="mt-1 text-[13px] font-semibold text-[#66716B]">
                These help test both camera detection and product lookup behavior.
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {lookupExamples.map((item) => (
              <BarcodeCard key={item.barcode} item={item} />
            ))}
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-3">
            <h2 className="text-[24px] font-black tracking-[-0.04em]">
              Camera-read stress tests
            </h2>
            <p className="mt-1 text-[13px] font-semibold text-[#66716B]">
              These are valid EAN-13 symbols for testing detection speed,
              distance, lighting, glare, and focus.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cameraOnlyExamples.map((item) => (
              <BarcodeCard key={item.barcode} item={item} />
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[22px] border border-[#F1DDAD] bg-[#FFFBEC] px-4 py-4 text-[13px] font-semibold leading-6 text-[#8A6500] print:hidden">
          <strong className="text-[#101613]">How to test:</strong> keep the
          barcode flat, fill the scanner frame, avoid glare, and try different
          distances. If the camera reads these but product lookup fails, the
          scanner is working and the issue is product database coverage.
        </section>
      </section>
    </main>
  );
}
