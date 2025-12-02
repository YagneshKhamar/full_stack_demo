import { NextRequest, NextResponse } from "next/server";
import { createTokenSchema } from "@/domain/tokens/token.validation";
import { createToken, getActiveTokens } from "@/domain/tokens/token.service";
import { authorizeRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // ---- API key auth ----
    const authError = authorizeRequest(req);
    if (authError) return authError;
    // ----------------------

    const json = await req.json();

    // Zod validation
    const parsed = createTokenSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Invalid request body",
          errors: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const token = await createToken(parsed.data);

    return NextResponse.json(token, { status: 201 });
  } catch (err) {
    console.error("POST /api/tokens error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // ---- API key auth ----
    const authError = authorizeRequest(req);
    if (authError) return authError;
    // ----------------------
    
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { message: "userId query parameter is required" },
        { status: 400 }
      );
    }

    const tokens = await getActiveTokens(userId);
    return NextResponse.json(tokens, { status: 200 });
  } catch (err) {
    console.error("GET /api/tokens error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
