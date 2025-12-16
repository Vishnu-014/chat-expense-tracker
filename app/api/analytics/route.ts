import { NextRequest, NextResponse } from 'next/server';
import { getCollection, COLLECTIONS } from '@/lib/db-utils';
import { withAuth } from '@/lib/middleware';

/* -------------------- TYPES -------------------- */

type TransactionType = 'EXPENSE' | 'INCOME' | 'INVESTMENTS' | 'SAVINGS';

const TRANSACTION_TYPES: TransactionType[] = [
  'EXPENSE',
  'INCOME',
  'INVESTMENTS',
  'SAVINGS',
];

interface CategoryAnalytics {
  name: string;
  amount: number;
  count: number;
  percentage?: number;
}

interface AnalyticsResponse {
  expense: number;
  income: number;
  investments: number;
  savings: number;
  categories: Record<TransactionType, CategoryAnalytics[]>;
  tags: Record<TransactionType, CategoryAnalytics[]>;
  period: string;
}

/* -------------------- HANDLER -------------------- */

async function getHandler(request: NextRequest) {
  try {
    const user = (request as any).user;
    const { searchParams } = new URL(request.url);

    const month = searchParams.get('month'); // 2025-12
    const year = searchParams.get('year'); // 2025
    const startDate = searchParams.get('startDate'); // 2025-11-01
    const endDate = searchParams.get('endDate'); // 2025-12-31

    const collection = await getCollection(COLLECTIONS.MESSAGES);

    /* -------------------- QUERY -------------------- */

    const query: any = {
      userId: user.userId,
      parsedData: { $ne: null },
    };

    if (month) {
      query['parsedData.year_month'] = month;
    } else if (year) {
      query['parsedData.year'] = parseInt(year);
    } else if (startDate && endDate) {
      // Parse dates properly and set to start/end of day in UTC
      const startOfDay = new Date(startDate + 'T00:00:00.000Z').toISOString(); // <-- Convert to ISO String
      const endOfDay = new Date(endDate + 'T23:59:59.999Z').toISOString();   // <-- Convert to ISO String
      
      // Query using parsedData.timestamp instead of createdAt
      query['parsedData.timestamp'] = {
        $gte: startOfDay, // Now comparing string to string
        $lte: endOfDay,   // Now comparing string to string
      };
    }

    console.log('Analytics Query:', JSON.stringify(query, null, 2));

    /* -------------------- TOTALS -------------------- */

    const totals = await collection
      .aggregate<{ _id: TransactionType; total: number; count: number }>([
        { $match: query },
        {
          $group: {
            _id: '$parsedData.transaction_type',
            total: { $sum: '$parsedData.amount' },
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    console.log('Totals:', totals);

    /* -------------------- CATEGORIES -------------------- */

    const allCategories: Record<TransactionType, CategoryAnalytics[]> = {
      EXPENSE: [],
      INCOME: [],
      INVESTMENTS: [],
      SAVINGS: [],
    };

    for (const transactionType of TRANSACTION_TYPES) {
      const categories = await collection
        .aggregate<{
          _id: string;
          total: number;
          count: number;
        }>([
          {
            $match: {
              ...query,
              'parsedData.transaction_type': transactionType,
            },
          },
          {
            $group: {
              _id: '$parsedData.category',
              total: { $sum: '$parsedData.amount' },
              count: { $sum: 1 },
            },
          },
          { $sort: { total: -1 } },
        ])
        .toArray();

      allCategories[transactionType] = categories.map((c) => ({
        name: c._id,
        amount: c.total,
        count: c.count,
      }));
    }

    /* -------------------- TAGS -------------------- */

    const allTags: Record<TransactionType, CategoryAnalytics[]> = {
      EXPENSE: [],
      INCOME: [],
      INVESTMENTS: [],
      SAVINGS: [],
    };

    for (const transactionType of TRANSACTION_TYPES) {
      const tags = await collection
        .aggregate<{
          _id: string;
          total: number;
          count: number;
        }>([
          {
            $match: {
              ...query,
              'parsedData.transaction_type': transactionType,
              'parsedData.tags': { $exists: true, $ne: [] },
            },
          },
          { $unwind: '$parsedData.tags' },
          {
            $group: {
              _id: '$parsedData.tags',
              total: { $sum: '$parsedData.amount' },
              count: { $sum: 1 },
            },
          },
          { $sort: { total: -1 } },
        ])
        .toArray();

      allTags[transactionType] = tags.map((t) => ({
        name: t._id,
        amount: t.total,
        count: t.count,
      }));
    }

    /* -------------------- ANALYTICS -------------------- */

    const getTotal = (type: TransactionType) =>
      totals.find((t) => t._id === type)?.total || 0;

    const analytics: AnalyticsResponse = {
      expense: getTotal('EXPENSE'),
      income: getTotal('INCOME'),
      investments: getTotal('INVESTMENTS'),
      savings: getTotal('SAVINGS'),
      categories: allCategories,
      tags: allTags,
      period: month || year || 'custom',
    };

    /* -------------------- PERCENTAGES -------------------- */

    for (const transactionType of TRANSACTION_TYPES) {
      const typeTotal = getTotal(transactionType);

      analytics.categories[transactionType] = analytics.categories[
        transactionType
      ].map((cat) => ({
        ...cat,
        percentage:
          typeTotal > 0 ? Math.round((cat.amount / typeTotal) * 100) : 0,
      }));

      analytics.tags[transactionType] = analytics.tags[
        transactionType
      ].map((tag) => ({
        ...tag,
        percentage:
          typeTotal > 0 ? Math.round((tag.amount / typeTotal) * 100) : 0,
      }));
    }

    /* -------------------- RESPONSE -------------------- */

    return NextResponse.json({
      success: true,
      analytics,
    });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics', details: error.message },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getHandler);