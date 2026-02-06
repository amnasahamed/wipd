import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
    try {
        const cookieStore = await cookies();
        cookieStore.set({
            name: "auth-token",
            value: "",
            httpOnly: true,
            path: "/",
            maxAge: 0,
            sameSite: "strict",
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Logout error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to logout" },
            { status: 500 }
        );
    }
}
