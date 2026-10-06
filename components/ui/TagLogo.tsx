"use client";

import React, { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface TagLogoProps {
  className?: string;
  height?: number;
  width?: number;
  showText?: boolean;
  variant?: "light" | "dark" | "full";
  href?: string | null;
}

export function TagLogo({
  className,
  height = 42,
  width,
  showText = false,
  href = "/",
}: TagLogoProps) {
  const [imgError, setImgError] = useState(false);

  const logoContent = (
    <div className={cn("inline-flex items-center gap-2.5 group cursor-pointer shrink-0", className)}>
      {!imgError ? (
        <img
          src="/tag-logo.png"
          alt="Touch And Go"
          onError={() => setImgError(true)}
          style={{ height: `${height}px`, width: width ? `${width}px` : "auto" }}
          className="object-contain transition-transform duration-200 group-hover:scale-105 max-w-[180px]"
        />
      ) : (
        <div className="w-10 h-10 rounded-xl bg-[#2563EB] text-white flex items-center justify-center font-black text-lg shadow-xs">
          T
        </div>
      )}

      {showText && (
        <div className="flex flex-col text-left leading-none">
          <span className="font-black text-base sm:text-lg tracking-tight text-slate-900 group-hover:text-[#2563EB] transition-colors">
            Touch And Go
          </span>
          <span className="text-[10px] font-bold text-blue-600 tracking-wider uppercase">
            Recruitment India
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block shrink-0">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}
