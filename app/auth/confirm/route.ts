import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

function normalizeNext(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/profile";
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type") as EmailOtpType | null;
  const next = normalizeNext(requestUrl.searchParams.get("next"));

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(new URL("/login?message=supabase-not-configured", request.url));
  }

  const supabase = await createClient();
  let hasError = false;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    hasError = Boolean(error);
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    hasError = Boolean(error);
  } else {
    hasError = true;
  }

  return NextResponse.redirect(new URL(hasError ? "/login?message=auth-link-error" : next, request.url));
}

