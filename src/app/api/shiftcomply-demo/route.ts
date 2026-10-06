import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_DEMO_CODE, DEMO_COOKIE, DEMO_DAYS } from "@/shiftcomply/lib/demo";
import { LANG_COOKIE, toLang } from "@/shiftcomply/lib/lang";

// Checks the ShiftComply demo access code and lets the visitor into the demo.
// The demo only ever shows sample data. Set SHIFTCOMPLY_DEMO_CODE in your hosting settings to choose the code.
export async function POST(request: NextRequest) {
  const expected = process.env.SHIFTCOMPLY_DEMO_CODE?.trim() || DEFAULT_DEMO_CODE;
  const body = (await request.json().catch(() => ({}))) as { code?: string; locale?: string };
  const code = (body.code ?? "").trim();

  // A short pause makes guessing codes slow.
  await new Promise((r) => setTimeout(r, 400));
  if (code.toLowerCase() !== expected.toLowerCase()) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(DEMO_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DEMO_DAYS * 24 * 60 * 60,
  });
  // Open the demo in the language the visitor was using on the website. They can change it inside the demo.
  const lang = toLang(body.locale);
  if (lang) {
    res.cookies.set(LANG_COOKIE, lang, { sameSite: "lax", path: "/", maxAge: 365 * 24 * 60 * 60 });
  }
  return res;
}

// Leaves the demo.
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(DEMO_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
