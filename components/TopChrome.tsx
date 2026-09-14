"use client";
import { forwardRef, type ReactNode } from "react";

/** Fixed top stack so the disclosure banner can wrap without the nav overlapping it. */
export const TopChrome = forwardRef<
  HTMLDivElement,
  {
    banner?: ReactNode;
    children: ReactNode;
  }
>(function TopChrome({ banner, children }, ref) {
  return (
    <div ref={ref} className="gryps-top-chrome gryps-no-print">
      {banner}
      <div className="gryps-aurora-topline" aria-hidden="true" />
      {children}
    </div>
  );
});
