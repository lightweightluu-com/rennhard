import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router";

type Variant = "dark" | "accent" | "ghost";
const variantClass: Record<Variant, string> = { dark: "", accent: "btn-accent", ghost: "btn-ghost" };

export const Arrow = () => (
  <svg className="arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

interface Common {
  variant?: Variant;
  small?: boolean;
  children: ReactNode;
  className?: string;
}
type Props =
  | (Common & { to: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "children">)
  | (Common & { href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "children">)
  | (Common & { to?: undefined; href?: undefined } & ButtonHTMLAttributes<HTMLButtonElement>);

export function Button(props: Props) {
  const { variant = "dark", small, children, className = "", ...rest } = props;
  const cls = `btn ${variantClass[variant]} ${small ? "btn-sm" : ""} ${className}`;
  const inner = (
    <>
      {children}
      <Arrow />
    </>
  );
  if ("to" in rest && rest.to) {
    const { to, ...a } = rest as { to: string } & AnchorHTMLAttributes<HTMLAnchorElement>;
    return <Link to={to} className={cls} {...a}>{inner}</Link>;
  }
  if ("href" in rest && rest.href) {
    const { href, ...a } = rest as { href: string } & AnchorHTMLAttributes<HTMLAnchorElement>;
    return <a href={href} className={cls} {...a}>{inner}</a>;
  }
  const { to: _t, href: _h, ...b } = rest as ButtonHTMLAttributes<HTMLButtonElement> & { to?: never; href?: never };
  return <button className={cls} {...b}>{inner}</button>;
}
