import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getCollection, COLLECTIONS } from '@/lib/db-utils';
import { withAuth } from '@/lib/middleware';

async function patchHandler(
  request: NextRequest,
  { params }: { params?: Promise<{ id: string }> }
) {

  if (!params) {
    return NextResponse.json(
      { error: 'Missing route params' },
      { status: 400 }
    );
  }

  const { id } = await params;
  const updates = await request.json();

  try {
    const collection = await getCollection(COLLECTIONS.MESSAGES);

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Message updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating message:', error);
    return NextResponse.json(
      { error: 'Failed to update message', details: error.message },
      { status: 500 }
    );
  }
}

async function deleteHandler(
  request: NextRequest,
  { params }: { params?: Promise<{ id: string }> }
) {

  if (!params) {
    return NextResponse.json(
      { error: 'Missing route params' },
      { status: 400 }
    );
  }

  const { id } = await params;

  try {
    const collection = await getCollection(COLLECTIONS.MESSAGES);
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { error: 'Failed to delete message', details: error.message },
      { status: 500 }
    );
  }
}

export const PATCH = withAuth(patchHandler);
export const DELETE = withAuth(deleteHandler);
