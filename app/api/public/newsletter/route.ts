import { NextResponse } from "next/server";
import { z } from "zod";
import { assertSameOrigin, apiErrorResponse, ApiError } from "@/lib/api-guard";
import { subscribe } from "@/lib/services/newsletterService";

const bodySchema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) throw new ApiError("A valid email is required", 422);
    await subscribe(parsed.data.email, "website");
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
