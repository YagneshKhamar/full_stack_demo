import { NextRequest, NextResponse } from "next/server";

const API_KEY_HEADER = "x-api-key";

export function authorizeRequest(req: NextRequest): NextResponse | null {
  const expectedKey = process.env.TOKENS_API_KEY;
  if (!expectedKey) {
    console.error("TOKENS_API_KEY is not set");
    return NextResponse.json(
      { message: "Server misconfiguration: missing API key" },
      { status: 500 },
    );
  }

  const providedKey = req.headers.get(API_KEY_HEADER);

  if (!providedKey || providedKey !== expectedKey) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  return null; // authorized
}
