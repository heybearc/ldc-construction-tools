import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Create response
    const response = NextResponse.json({ 
      success: true, 
      message: "Signed out successfully" 
    });
    
    // Clear the session cookie
    response.cookies.set("session", "", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 0, // Expire immediately
      expires: new Date(0) // Set to past date
    });
    
    return response;
    
  } catch (error) {
    console.error("Signout error:", error);
    return NextResponse.json({ 
      error: "Signout failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
