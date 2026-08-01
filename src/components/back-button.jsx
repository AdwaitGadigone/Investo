"use client";

import { useRouter } from "next/navigation";
import { IconArrowLeft } from "@/components/icons";

export function BackButton({ className = "" }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className={`inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text transition-colors ${className}`}
    >
      <IconArrowLeft width={15} height={15} />
      Back
    </button>
  );
}
