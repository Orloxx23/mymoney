"use client";

import { ProgressProvider } from "@bprogress/next/app";
import React from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ProgressProvider
      height="2px"
      color="var(--color-primary)"
      options={{ showSpinner: true }}
      shallowRouting
      spinnerPosition="top-left"
    >
      {children}
    </ProgressProvider>
  );
}
