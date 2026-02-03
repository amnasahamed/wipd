import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function getSessionUser() {
    const authToken = (await cookies()).get("auth-token")?.value;
    if (!authToken) return null;

    try {
        const parsed = JSON.parse(authToken);
        const id = typeof parsed?.id === "string" ? parsed.id : null;
        const role = typeof parsed?.role === "string" ? parsed.role : null;
        if (!id || !role) return null;
        return { id, role };
    } catch {
        return null;
    }
}

export async function requireRole(allowedRoles) {
    const sessionUser = await getSessionUser();

    if (!sessionUser?.id) {
        return {
            user: null,
            errorResponse: NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            ),
        };
    }

    if (!allowedRoles.includes(sessionUser.role)) {
        return {
            user: null,
            errorResponse: NextResponse.json(
                { success: false, error: "Forbidden" },
                { status: 403 }
            ),
        };
    }

    return { user: sessionUser, errorResponse: null };
}

export async function requireAdmin() {
    return requireRole(["ADMIN"]);
}

export async function requireWriter() {
    return requireRole(["WRITER"]);
}

