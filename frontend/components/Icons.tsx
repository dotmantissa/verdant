type IconProps = {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  strokeWidth?: number;
};

function Icon({
  size = 18,
  className,
  style,
  strokeWidth = 1.75,
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function IconLock(p: IconProps) {
  return (
    <Icon {...p}>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </Icon>
  );
}

export function IconLink(p: IconProps) {
  return (
    <Icon {...p}>
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </Icon>
  );
}

export function IconBolt(p: IconProps) {
  return (
    <Icon {...p}>
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </Icon>
  );
}

export function IconPlane(p: IconProps) {
  return (
    <Icon {...p}>
      <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 3.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
    </Icon>
  );
}

export function IconLeaf(p: IconProps) {
  return (
    <Icon {...p}>
      <path d="M11 20A7 7 0 014.29 7.2a7 7 0 016.08-5.11A11 11 0 0121 3a11 11 0 01-2.27 7.28A10 10 0 0111 13v7z" />
      <path d="M11 20c0-5.5-2-9.56-4-12" />
    </Icon>
  );
}

export function IconClipboard(p: IconProps) {
  return (
    <Icon {...p}>
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="M9 12h6M9 16h4" />
    </Icon>
  );
}

export function IconCheck(p: IconProps) {
  return (
    <Icon {...p}>
      <path d="M20 6L9 17l-5-5" />
    </Icon>
  );
}

export function IconXMark(p: IconProps) {
  return (
    <Icon {...p}>
      <path d="M18 6L6 18M6 6l12 12" />
    </Icon>
  );
}

export function IconClock(p: IconProps) {
  return (
    <Icon {...p}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </Icon>
  );
}

export function IconBarChart(p: IconProps) {
  return (
    <Icon {...p}>
      <path d="M18 20V10M12 20V4M6 20v-6" />
    </Icon>
  );
}

export function IconTree(p: IconProps) {
  return (
    <Icon {...p}>
      <path d="M12 22v-7" />
      <path d="M8 15h8l-4-6-4 6z" />
      <path d="M9 9h6L12 3 9 9z" />
    </Icon>
  );
}

export function IconWind(p: IconProps) {
  return (
    <Icon {...p}>
      <path d="M17.7 7.7a2.5 2.5 0 111.8 4.3H2" />
      <path d="M9.6 4.6A2 2 0 1111 8H2" />
      <path d="M12.6 19.4A2 2 0 1014 16H2" />
    </Icon>
  );
}

export function IconWaves(p: IconProps) {
  return (
    <Icon {...p}>
      <path d="M2 12c1.4-2 2.8-2 4.2 0s2.8 2 4.2 0 2.8-2 4.2 0 2.8 2 4.2 0" />
      <path d="M2 17c1.4-2 2.8-2 4.2 0s2.8 2 4.2 0 2.8-2 4.2 0 2.8 2 4.2 0" />
      <path d="M2 7c1.4-2 2.8-2 4.2 0s2.8 2 4.2 0 2.8-2 4.2 0 2.8 2 4.2 0" />
    </Icon>
  );
}

export function IconFlame(p: IconProps) {
  return (
    <Icon {...p}>
      <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 002.5 2.5z" />
    </Icon>
  );
}

export function IconSun(p: IconProps) {
  return (
    <Icon {...p}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </Icon>
  );
}

export function IconMoon(p: IconProps) {
  return (
    <Icon {...p}>
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </Icon>
  );
}

export function IconWallet(p: IconProps) {
  return (
    <Icon {...p}>
      <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
      <path d="M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z" />
      <circle cx="16" cy="14" r="1" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function IconGlobe(p: IconProps) {
  return (
    <Icon {...p}>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </Icon>
  );
}
