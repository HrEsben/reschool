"use client";

import dynamic from "next/dynamic";

const MobileCacheFix = dynamic(() => import("@/components/mobile/mobile-cache-fix").then(mod => ({ default: mod.MobileCacheFix })), {
  ssr: false
});

export function ClientMobileCacheFix({ children }: { children: React.ReactNode }) {
  return <MobileCacheFix>{children}</MobileCacheFix>;
}