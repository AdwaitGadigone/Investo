"use client";

import { useTransition } from "react";
import { toggleDigestAction } from "@/lib/actions/digest";

export function DigestToggle({ on }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => toggleDigestAction())}
      disabled={isPending}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-colors disabled:opacity-50 ${
        on
          ? "border border-cool bg-cool/15 text-cool hover:bg-cool/25"
          : "border border-border hover:border-cool hover:text-cool"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${on ? "bg-cool" : "bg-text-muted"}`} />
      Daily digest DM: {on ? "On" : "Off"}
    </button>
  );
}
