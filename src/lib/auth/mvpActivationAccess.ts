const mvpActivationAccessStorageKey = "truthlabel.mvpActivationAccess";
const mvpActivationParams = ["mvp_access", "early_access", "access_code"];

type MvpActivationAccessRecord = {
  grantedAt: string;
  source: "activation_link" | "app_link";
};

function canUseBrowserStorage() {
  return typeof window !== "undefined";
}

export function hasMvpActivationParam(search: string | URLSearchParams) {
  const params =
    typeof search === "string"
      ? new URLSearchParams(search.startsWith("?") ? search.slice(1) : search)
      : search;

  return mvpActivationParams.some((param) => Boolean(params.get(param)));
}

export function grantMvpActivationAccess(
  source: MvpActivationAccessRecord["source"] = "activation_link",
) {
  if (!canUseBrowserStorage()) {
    return;
  }

  const record: MvpActivationAccessRecord = {
    grantedAt: new Date().toISOString(),
    source,
  };

  try {
    window.localStorage.setItem(
      mvpActivationAccessStorageKey,
      JSON.stringify(record),
    );
  } catch {
    try {
      window.sessionStorage.setItem(
        mvpActivationAccessStorageKey,
        JSON.stringify(record),
      );
    } catch {
      // Storage can be blocked. The app will fall back to normal auth checks.
    }
  }
}

export function hasMvpActivationAccess() {
  if (!canUseBrowserStorage()) {
    return false;
  }

  try {
    if (window.localStorage.getItem(mvpActivationAccessStorageKey)) {
      return true;
    }
  } catch {
    // Fall back to session storage below.
  }

  try {
    return Boolean(window.sessionStorage.getItem(mvpActivationAccessStorageKey));
  } catch {
    return false;
  }
}

export function clearMvpActivationAccess() {
  if (!canUseBrowserStorage()) {
    return;
  }

  try {
    window.localStorage.removeItem(mvpActivationAccessStorageKey);
  } catch {
    // Best effort cleanup.
  }

  try {
    window.sessionStorage.removeItem(mvpActivationAccessStorageKey);
  } catch {
    // Best effort cleanup.
  }
}
