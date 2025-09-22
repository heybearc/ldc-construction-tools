import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    console.log("Auth attempt for:", email);
    
    // Find user with correct field name
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        passwordHash: true // Use correct field name
      }
    });
    
    console.log("User found:", user ? "YES" : "NO");
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }
    
    if (!user.passwordHash) {
      return NextResponse.json({ error: "No password set for user" }, { status: 401 });
    }
    
    // Test password comparison with correct field
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    console.log("Password match:", passwordMatch);
    
    if (!passwordMatch) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }
    
    // Success
    const response = NextResponse.json({ 
      success: true, 
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name,
        role: user.role 
      } 
    });
    
    response.cookies.set("session", user.id, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7
    });
    
    return response;
    
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json({ 
      error: "Authentication failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
