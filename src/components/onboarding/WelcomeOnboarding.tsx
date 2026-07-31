import Image from "next/image";

import styles from "./WelcomeOnboarding.module.css";

type WelcomeOnboardingProps = {
  onContinue: () => void;
};

export function WelcomeOnboarding({ onContinue }: WelcomeOnboardingProps) {
  return (
    <main className={styles.screen} aria-labelledby="welcome-heading">
      <section className={styles.welcomeContent}>
        <div className={styles.logoShell}>
          <Image
            src="/icon.svg"
            alt="TruthLabel"
            width={104}
            height={104}
            priority
            className={styles.logo}
          />
        </div>

        <div className={styles.copy}>
          <h1 id="welcome-heading" className={styles.heading}>
            Welcome to <span className={styles.brandName}>TruthLabel</span>
          </h1>

          <p className={styles.tagline}>Scan before you trust it.</p>
        </div>
      </section>

      <div className={styles.actionArea}>
        <button
          type="button"
          className={styles.getStartedButton}
          onClick={onContinue}
        >
          Get Started
        </button>
      </div>
    </main>
  );
}
