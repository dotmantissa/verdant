// Module declarations for standalone tsc (next types only fully resolve via next build)
declare module "next" {
  const _: unknown;
  export default _;
  export type { NextConfig } from "next/dist/server/config-shared";
  export type { Metadata } from "next/dist/lib/metadata/types/metadata-interface";
}

declare module "next/link" {
  import type { FC, AnchorHTMLAttributes } from "react";
  interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
    href: string;
    prefetch?: boolean;
    replace?: boolean;
    scroll?: boolean;
    shallow?: boolean;
    passHref?: boolean;
    locale?: string | false;
    children?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    onClick?: React.MouseEventHandler<HTMLAnchorElement>;
    target?: string;
    rel?: string;
    "aria-label"?: string;
  }
  const Link: FC<LinkProps>;
  export default Link;
}
