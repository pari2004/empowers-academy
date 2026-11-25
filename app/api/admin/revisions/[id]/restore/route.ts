import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { assertSameOrigin, ApiError, apiErrorResponse } from "@/lib/api-guard";
import { can, permission } from "@/lib/rbac";
import { restoreRevision, getRevisionEntityType, ENTITY_RESOURCE } from "@/lib/revisions";

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    assertSameOrigin(req);
    const session = await auth();
    if (!session?.user) throw new ApiError("Unauthorized", 401);

    const { id } = params;
    const entityType = await getRevisionEntityType(id);
    if (!entityType) throw new ApiError("Revision not found", 404);

    // The permission required mirrors whatever resource this revision belongs
    // to (e.g. a course revision needs courses.update) — restoring content is
    // exactly as privileged as editing it, so it's checked the same way.
    const resource = ENTITY_RESOURCE[entityType as keyof typeof ENTITY_RESOURCE];
    if (!resource) throw new ApiError(`Restore isn't supported for entity type "${entityType}"`, 400);
    const perm = permission(resource, "update");
    if (!can(session, perm)) throw new ApiError(`Forbidden: missing permission "${perm}"`, 403);

    const restored = await restoreRevision(id, session.user.id);
    return NextResponse.json(restored);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
