import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // With JWT, logout is handled on the client side by removing the token
  // But we can log this event or invalidate tokens in a blacklist if needed

  return NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  });
}
