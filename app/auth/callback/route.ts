import { NextResponse } from "next/server";
import { serverAuth } from "../../../lib/homebridge/server/auth";
export async function GET(request: Request) {
  const url = new URL(request.url),
    code = url.searchParams.get("code");
  const client = await serverAuth();
  if (code && client) {
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (!error)
      return NextResponse.redirect(new URL("/account?connected=1", url.origin));
  }
  return NextResponse.redirect(new URL("/account?error=signin", url.origin));
}
