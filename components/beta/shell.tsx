"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Menu,
  X,
  ArrowUpRight,
  House,
  Search,
  Heart,
  ClipboardList,
  UserRound,
} from "lucide-react";
import { useWorkspace } from "./workspace-provider";
export default function Shell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const { state, ready, config } = useWorkspace();
  return (
    <div className="hb-app">
      <div className="hb-topbar">
        <span>
          <i /> Homebridge beta
        </span>
        <span>
          {config.listings
            ? "Licensed listing integration configured"
            : "No live listing feed connected"}{" "}
          ·{" "}
          <Link href="/integrations">
            Connection details <ArrowUpRight size={11} />
          </Link>
        </span>
      </div>
      <header className="hb-header">
        <Link href="/" className="hb-logo" aria-label="Homebridge home">
          <svg width="31" height="32" viewBox="0 0 32 34" fill="none">
            <path
              d="M3 29V13L16 3l13 10v16M10 29V18a6 6 0 0 1 12 0v11M3 29h26"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          homebridge<span>BETA</span>
        </Link>
        <nav
          className={open ? "hb-main-nav open" : "hb-main-nav"}
          aria-label="Main navigation"
        >
          {[
            ["Explore Homes", "/homes"],
            ["My Homes", "/my-homes"],
            ["My Purchase", "/purchase"],
            ["How It Works", "/how-it-works"],
          ].map(([text, href]) => (
            <Link
              key={href}
              href={href}
              className={path === href ? "active" : ""}
              onClick={() => setOpen(false)}
            >
              {text}
            </Link>
          ))}
        </nav>
        <div className="hb-header-actions">
          <Link className="hb-account" href="/account">
            <UserRound size={15} />
            {config.user ? "My Account" : "Sign In"}
          </Link>
          <Link className="hb-btn hb-primary hb-desktop-cta" href="/import">
            Analyze a home <ArrowUpRight size={15} />
          </Link>
          <button
            className="hb-menu"
            aria-label="Toggle navigation"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <main className="hb-main">{children}</main>
      <footer className="hb-footer">
        <div className="hb-row hb-between">
          <div>
            <Link href="/" className="hb-logo">
              <House size={23} />
              homebridge
            </Link>
            <p>Find your home. Understand your next step.</p>
          </div>
          <div className="hb-footer-links">
            <Link href="/pricing">Proposed pricing</Link>
            <Link href="/integrations">Data & integrations</Link>
            <Link href="/agent">Demo reviewer</Link>
            <Link href="/account">Account & privacy</Link>
          </div>
        </div>
        <p className="hb-disclosure">
          Homebridge is a prototype, not an operating brokerage. No
          representation, valid purchase agreement, actual offer submission, or
          licensed professional service is established. Demo properties and
          reviews are fictional. Estimates and provider-reported information
          require verification.
        </p>
        <div className="hb-footer-bottom">
          <span>Homebridge · Buyer beta</span>
          <span>
            {ready && state.role === "demo-agent"
              ? "Demo reviewer simulation"
              : config.user
                ? "Signed-in workspace"
                : "Guest workspace · saved in this browser"}
          </span>
        </div>
      </footer>
      <nav className="hb-mobile-nav" aria-label="Mobile navigation">
        {[
          [Search, "Explore", "/homes"],
          [Heart, "My Homes", "/my-homes"],
          [ClipboardList, "Purchase", "/purchase"],
          [UserRound, "Account", "/account"],
        ].map(([Icon, title, href]) => {
          const I = Icon as typeof Search;
          return (
            <Link
              key={String(href)}
              href={String(href)}
              className={path === href ? "active" : ""}
            >
              <I size={18} />
              {String(title)}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
