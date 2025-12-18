// app/api/verify/route.js (Next.js 13+ App Router)
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { token } = body; // JWT token from OTP widget success

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const response = await fetch(
      "https://control.msg91.com/api/v5/widget/verifyAccessToken",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          authkey: process.env.MSG91_AUTHKEY,
          "access-token": token,
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json({ success: true, data });
    } else {
      return NextResponse.json({ success: false, error: data }, { status: 400 });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
