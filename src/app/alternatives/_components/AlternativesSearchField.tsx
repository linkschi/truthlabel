"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import styles from "./AlternativesSearchField.module.css";

export default function AlternativesSearchField() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const hasQuery = query.trim().length > 0;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedQuery = query.trim();
    const destination = trimmedQuery
      ? `/alternatives/explore?q=${encodeURIComponent(trimmedQuery)}`
      : "/alternatives/explore";

    router.push(destination);
  }

  return (
    <form
      className={styles.searchForm}
      onSubmit={handleSubmit}
      role="search"
      aria-label="Search healthier alternatives"
    >
      <span className={styles.searchIcon} aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          <path
            d="m20 20-4.4-4.4m2.4-5.1a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
      </span>
      <input
        className={styles.input}
        name="q"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search a product, brand, or category"
        autoComplete="off"
      />
      {hasQuery ? (
        <button
          className={styles.clearButton}
          type="button"
          onClick={() => setQuery("")}
          aria-label="Clear search"
        >
          <span aria-hidden="true">x</span>
        </button>
      ) : null}
    </form>
  );
}
