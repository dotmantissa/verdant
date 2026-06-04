"use client";

import Link from "next/link";

type LogoProps = {
  className?: string;
};

export function Logo({ className = "" }: LogoProps) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2.5 group select-none ${className}`}
      aria-label="Verdant home"
    >
      <VerdantMark size={26} />
      <span
        className="text-base leading-none transition-colors duration-200 group-hover:text-[#3DCC7A]"
        style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, letterSpacing: "-0.02em", color: "#EEEEEF" }}
      >
        Verdant
      </span>
    </Link>
  );
}

export function VerdantMark({ size = 26 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 26 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Leaf outline */}
      <path
        d="M13 3 C20 3 22 8 22 13 C22 18 17 22 13 22 C9 22 4 18 4 13 C4 8 6 3 13 3 Z"
        stroke="#3DCC7A"
        strokeWidth="1.5"
        fill="none"
        strokeLinejoin="round"
      />
      {/* Center vein */}
      <line x1="13" y1="4" x2="13" y2="21" stroke="#3DCC7A" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
      {/* Two lateral veins */}
      <path d="M13 11 L17.5 9" stroke="#3DCC7A" strokeWidth="0.9" strokeLinecap="round" opacity="0.5" />
      <path d="M13 15 L17 13.5" stroke="#3DCC7A" strokeWidth="0.9" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}
