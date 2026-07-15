import { SectionLabel } from "@/components/ResultUi";
import {
  allergyOptions,
  avoidOptions,
  type AllergyConcern,
  type AvoidConcern,
  type UserProfile,
} from "@/data/fakeProduct";

type AllergyProfileProps = {
  profile: UserProfile;
  onToggleAllergy: (value: AllergyConcern) => void;
  onToggleAvoid: (value: AvoidConcern) => void;
  variant?: "card" | "panel";
};

type OptionChipProps = {
  label: string;
  selected: boolean;
  onClick: () => void;
};

function OptionChip({ label, selected, onClick }: OptionChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`rounded-full border px-3 py-1.5 text-left text-[13px] font-medium transition ${
        selected
          ? "border-[#1c3028] bg-[#1c3028] text-white shadow-[0_10px_24px_rgba(28,48,40,0.14)]"
          : "border-[#ddd6ca] bg-white/78 text-[#33443c] hover:border-[#c4b493] hover:bg-[#fbf6ed]"
      }`}
    >
      {label}
    </button>
  );
}

export default function AllergyProfile({
  profile,
  onToggleAllergy,
  onToggleAvoid,
  variant = "card",
}: AllergyProfileProps) {
  const selectedSummary = [...profile.allergies, ...profile.avoid];
  const containerClass =
    variant === "panel"
      ? "rounded-[22px] border border-[#e7decf] bg-white/76 px-4 py-4"
      : "rounded-[28px] border border-white/75 bg-[var(--surface-strong)] px-4 py-4 shadow-[var(--shadow)]";
  const titleClass =
    variant === "panel"
      ? "mt-1.5 font-heading text-[1.2rem] font-semibold text-[#16251f]"
      : "mt-1.5 font-heading text-[1.3rem] font-semibold text-[#16251f]";
  const summaryClass =
    variant === "panel"
      ? "mt-4 rounded-[18px] border border-[#e7decf] bg-[#faf7f0] p-3.5"
      : "mt-4 rounded-[20px] border border-[#e7decf] bg-white/76 p-3.5";

  return (
    <section className={containerClass}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <SectionLabel>Alert settings</SectionLabel>
          <h2 className={titleClass}>
            What should we watch for?
          </h2>
          <p className="mt-1.5 max-w-sm text-[13px] leading-5 text-[#55645c]">
            Choose allergies and label concerns so results can flag them clearly.
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-[#e5dcc9] bg-white/75 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6d6a5d]">
          Saved locally
        </span>
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#445047]">
            Allergy concerns
          </h3>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {allergyOptions.map((option) => (
              <OptionChip
                key={option}
                label={option}
                selected={profile.allergies.includes(option)}
                onClick={() => onToggleAllergy(option)}
              />
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#445047]">
            Avoid list
          </h3>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {avoidOptions.map((option) => (
              <OptionChip
                key={option}
                label={option}
                selected={profile.avoid.includes(option)}
                onClick={() => onToggleAvoid(option)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className={summaryClass}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7c6d4f]">
          Saved alerts
        </p>
        {selectedSummary.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {selectedSummary.map((item) => (
              <span
                key={item}
                className="inline-flex rounded-full border border-[#e1d8ca] bg-[#faf7f0] px-3 py-1 text-[12px] font-medium text-[#445249]"
              >
                {item}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-[13px] leading-5 text-[#49584f]">
            No allergies or food concerns selected yet.
          </p>
        )}
      </div>
    </section>
  );
}
