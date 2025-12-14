import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from './auth';

type AppRouteContext<P = any> = {
  params?: Promise<P>;
};

export function withAuth<P>(
  handler: (
    request: NextRequest,
    context: AppRouteContext<P>
  ) => Promise<Response>
) {
  return async (
    request: NextRequest,
    context: AppRouteContext<P>
  ): Promise<Response> => {
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

    (request as any).user = payload;

    return handler(request, context);
  };
}
