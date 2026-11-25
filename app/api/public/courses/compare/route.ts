import { NextResponse } from "next/server";
import { apiErrorResponse, ApiError } from "@/lib/api-guard";
import { getCoursesForComparison } from "@/lib/services/courseService";

const MAX_SLUGS = 4;

// Public, read-only — same trust boundary as the program pages themselves,
// so no same-origin check (nothing is mutated).
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const slugs = (url.searchParams.get("slugs") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, MAX_SLUGS);

    if (!slugs.length) throw new ApiError("Provide at least one slug via ?slugs=a,b,c", 422);

    const courses = await getCoursesForComparison(slugs);
    return NextResponse.json({ courses });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
