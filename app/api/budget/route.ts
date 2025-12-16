import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getCollection, COLLECTIONS } from '@/lib/db-utils';
import { withAuth } from '@/lib/middleware';

async function getHandler(request: Request) {
  try {
    const user = (request as any).user;

    const budgetsCollection = await getCollection(COLLECTIONS.BUDGETS);
    
    // Find or create budget for user
    let budget = await budgetsCollection.findOne({ userId: user.userId });
    
    if (!budget) {
      // Create default budget
      const defaultBudget = {
        userId: user.userId,
        expense: 40000,
        income: 0,
        investments: 0,
        savings: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const result = await budgetsCollection.insertOne(defaultBudget);
      budget = { ...defaultBudget, _id: result.insertedId };
    }

    return NextResponse.json({
      success: true,
      budget: {
        id: budget._id.toString(),
        expense: budget.expense || 40000,
        income: budget.income || 0,
        investments: budget.investments || 0,
        savings: budget.savings || 0,
      },
    });
  } catch (error: any) {
    console.error('Get budget error:', error);
    return NextResponse.json(
      { error: 'Failed to get budget', details: error.message },
      { status: 500 }
    );
  }
}

async function patchHandler(request: Request) {
  try {
    const user = (request as any).user;
    const { expense, income, investments, savings } = await request.json();

    const budgetsCollection = await getCollection(COLLECTIONS.BUDGETS);

    // Find existing budget
    let budget = await budgetsCollection.findOne({ userId: user.userId });

    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (expense !== undefined) updateData.expense = expense;
    if (income !== undefined) updateData.income = income;
    if (investments !== undefined) updateData.investments = investments;
    if (savings !== undefined) updateData.savings = savings;

    if (budget) {
      // Update existing budget
      await budgetsCollection.updateOne(
        { userId: user.userId },
        { $set: updateData }
      );
    } else {
      // Create new budget
      const newBudget = {
        userId: user.userId,
        expense: expense || 40000,
        income: income || 0,
        investments: investments || 0,
        savings: savings || 0,
        createdAt: new Date().toISOString(),
        ...updateData,
      };
      await budgetsCollection.insertOne(newBudget);
    }

    // Fetch updated budget
    const updatedBudget = await budgetsCollection.findOne({ userId: user.userId });

    return NextResponse.json({
      success: true,
      budget: {
        id: updatedBudget!._id.toString(),
        expense: updatedBudget!.expense || 40000,
        income: updatedBudget!.income || 0,
        investments: updatedBudget!.investments || 0,
        savings: updatedBudget!.savings || 0,
      },
    });
  } catch (error: any) {
    console.error('Update budget error:', error);
    return NextResponse.json(
      { error: 'Failed to update budget', details: error.message },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getHandler);
export const PATCH = withAuth(patchHandler);

