import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { HttpError } from "./http";
export function authConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
export async function serverAuth() {
  if (!authConfigured()) return null;
  const jar = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => jar.getAll(),
        setAll: (items) => {
          for (const { name, value, options } of items)
            jar.set(name, value, options);
        },
      },
    },
  );
}
export async function authenticated() {
  const client = await serverAuth();
  if (!client)
    throw new HttpError(
      503,
      "Account sync is not configured. Guest mode remains available.",
    );
  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  if (error || !user)
    throw new HttpError(401, "Sign in to sync your private workspace.");
  return { client, user };
}
