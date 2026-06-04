"use client";

import Link from "next/link";

type LogoProps = {
  size?: number;
  showText?: boolean;
  className?: string;
};

export function Logo({ size = 32, showText = true, className = "" }: LogoProps) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-3 group select-none ${className}`}
      aria-label="Verdant home"
    >
      <VerdantMark size={size} />
      {showText && (
        <span
          style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, letterSpacing: "-0.02em" }}
          className="text-[#EEEEEF] text-lg leading-none group-hover:text-[#3DCC7A] transition-colors duration-200"
        >
          Verdant
        </span>
      )}
    </Link>
  );
}

export function VerdantMark({ size = 32 }: { size?: number }) {
  const s = size;
  const center = s / 2;
  const r = s * 0.42;

  return (
    <svg
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Outer circle — verification ring */}
      <circle
        cx={center}
        cy={center}
        r={r}
        stroke="#3DCC7A"
        strokeWidth={s * 0.055}
        opacity="0.25"
      />

      {/* Leaf body — two arcs forming a leaf shape */}
      <path
        d={`
          M ${center} ${center - r * 0.72}
          C ${center + r * 0.72} ${center - r * 0.72}
            ${center + r * 0.72} ${center + r * 0.18}
            ${center} ${center + r * 0.55}
          C ${center - r * 0.72} ${center + r * 0.18}
            ${center - r * 0.72} ${center - r * 0.72}
            ${center} ${center - r * 0.72}
          Z
        `}
        fill="#3DCC7A"
        opacity="0.15"
      />
      <path
        d={`
          M ${center} ${center - r * 0.72}
          C ${center + r * 0.72} ${center - r * 0.72}
            ${center + r * 0.72} ${center + r * 0.18}
            ${center} ${center + r * 0.55}
          C ${center - r * 0.72} ${center + r * 0.18}
            ${center - r * 0.72} ${center - r * 0.72}
            ${center} ${center - r * 0.72}
          Z
        `}
        stroke="#3DCC7A"
        strokeWidth={s * 0.05}
        fill="none"
      />

      {/* Center vein — vertical data line */}
      <line
        x1={center}
        y1={center - r * 0.62}
        x2={center}
        y2={center + r * 0.45}
        stroke="#3DCC7A"
        strokeWidth={s * 0.04}
        strokeLinecap="round"
        opacity="0.7"
      />

      {/* Small lateral veins */}
      <line
        x1={center}
        y1={center - r * 0.18}
        x2={center + r * 0.3}
        y2={center - r * 0.02}
        stroke="#3DCC7A"
        strokeWidth={s * 0.03}
        strokeLinecap="round"
        opacity="0.5"
      />
      <line
        x1={center}
        y1={center - r * 0.18}
        x2={center - r * 0.3}
        y2={center - r * 0.02}
        stroke="#3DCC7A"
        strokeWidth={s * 0.03}
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}
