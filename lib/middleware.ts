import { NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from './auth';

export function withAuth(handler: Function) {
  return async (request: Request, context?: any) => {
    console.log('request => ', request);

    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Add user info to request
    (request as any).user = payload;

    return handler(request, context);
  };
}
