"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Shell from "./shell";
import Landing from "./landing";
import Explore from "./explore";
import ImportHome from "./import-home";
import PropertyWorkspace from "./property-workspace";
import MyHomes, { CompareHomes } from "./my-homes";
import Purchase from "./purchase";
import AgentWorkspace from "./agent-workspace";
import Account from "./account";
import { Pricing, Integrations, HowItWorks, Resources } from "./public-pages";
export default function BetaApp() {
  const path = usePathname() || "/";
  let page: React.ReactNode;
  if (path === "/") page = <Landing />;
  else if (path === "/homes") page = <Explore />;
  else if (path === "/import") page = <ImportHome />;
  else if (path.startsWith("/homes/"))
    page = <PropertyWorkspace id={decodeURIComponent(path.split("/")[2])} />;
  else if (path === "/my-homes") page = <MyHomes />;
  else if (path === "/compare") page = <CompareHomes />;
  else if (path === "/purchase") page = <Purchase />;
  else if (path === "/agent" || path.startsWith("/agent/"))
    page = <AgentWorkspace />;
  else if (path === "/account") page = <Account />;
  else if (path === "/pricing") page = <Pricing />;
  else if (path === "/integrations") page = <Integrations />;
  else if (path === "/how-it-works" || path === "/about") page = <HowItWorks />;
  else if (path === "/resources") page = <Resources />;
  else
    page = (
      <div className="hb-page hb-empty">
        <h1>Let’s get you back to your home search.</h1>
        <p>
          This buyer beta focuses on home analysis, draft preparation, and
          simulated professional review.
        </p>
        <Link className="hb-btn hb-primary" href="/homes">
          Explore homes
        </Link>
      </div>
    );
  return <Shell>{page}</Shell>;
}
