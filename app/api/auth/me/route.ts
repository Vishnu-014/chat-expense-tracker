import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getCollection, COLLECTIONS } from '@/lib/db-utils';
import { withAuth } from '@/lib/middleware';

async function handler(request: Request) {
  try {
    const user = (request as any).user;

    const usersCollection = await getCollection(COLLECTIONS.USERS);
    const userData = await usersCollection.findOne(
      { _id: new ObjectId(user.userId) },
      { projection: { password: 0 } }
    );

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        ...userData,
        id: userData._id.toString(),
      },
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Failed to get user data', details: error.message },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handler);
