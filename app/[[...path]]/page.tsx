import { redirect } from "next/navigation";
import { Suspense } from "react";
import BetaApp from "../../components/beta/app";
const aliases: Record<string, string> = {
  "/dashboard": "/my-homes",
  "/dashboard/saved": "/my-homes",
  "/dashboard/compare": "/compare",
  "/dashboard/purchase": "/purchase",
  "/dashboard/documents": "/purchase",
  "/dashboard/messages": "/purchase",
  "/dashboard/settings": "/account",
  "/dashboard/assistant": "/homes/demo-provo",
  "/dashboard/finances": "/homes/demo-provo?tab=payment",
  "/login": "/account",
  "/get-started": "/homes?demo=1",
  "/admin": "/account",
  "/admin/settings": "/account",
};
export default async function Page({
  params,
}: {
  params: Promise<{ path?: string[] }>;
}) {
  const { path } = await params;
  const route = "/" + (path || []).join("/");
  if (aliases[route]) redirect(aliases[route]);
  return (
    <Suspense
      fallback={
        <div className="hb-page hb-skeleton" aria-label="Loading Homebridge">
          <div />
          <div />
        </div>
      }
    >
      <BetaApp />
    </Suspense>
  );
}
