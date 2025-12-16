import { NextRequest, NextResponse } from 'next/server';
import { getCollection, COLLECTIONS } from '@/lib/db-utils';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { withAuth } from '@/lib/middleware';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function parseLLMResponse(text: string) {
  try {
    console.log('🤖 Calling Gemini LLM for:', text);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

    const prompt = `From the message below, extract the following as JSON:
- category (string): The category of the transaction (e.g., "Food", "Transport", "Salary", etc.)
- type (string): Must be exactly one of: "Expense", "Income", or "Investment"
- price (number): The amount in the transaction
- sentiment (number): A value from -1 to 1 representing the emotional tone
- date (string or null): Extract date if mentioned (format: "05 Jul"), otherwise null

Message: "${text}"

Important: Return ONLY valid JSON, no markdown formatting, no explanatory text.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Clean response
    const cleanText = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    const jsonStart = cleanText.indexOf('{');
    const jsonEnd = cleanText.lastIndexOf('}') + 1;
    const jsonString = cleanText.slice(jsonStart, jsonEnd);

    const parsed = JSON.parse(jsonString);
    console.log('✅ LLM parsed successfully:', parsed);
    return parsed;
  } catch (error) {
    console.error('❌ LLM Parse Error:', error);
    return null;
  }
}

async function getHandler(request: NextRequest) {
  try {
    const user = (request as any).user;
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const all = searchParams.get('all') === 'true';

    const collection = await getCollection(COLLECTIONS.MESSAGES);
    let query = collection.find({ userId: user.userId }).sort({ createdAt: -1 });
    
    if (!all && !limit) {
      query = query.limit(100);
    } else if (limit) {
      query = query.limit(parseInt(limit, 10));
    }
    
    const messages = await query.toArray();

    // Calculate totals
    const totals = {
      expense: 0,
      income: 0,
      investments: 0,
      savings: 0,
    };

    messages.forEach((msg) => {
      if (msg.parsedData) {
        switch (msg.parsedData.transaction_type) {
          case 'EXPENSE':
            totals.expense += msg.parsedData.amount;
            break;
          case 'INCOME':
            totals.income += msg.parsedData.amount;
            break;
          case 'INVESTMENTS':
            totals.investments += msg.parsedData.amount;
            break;
          case 'SAVINGS':
            totals.savings += msg.parsedData.amount;
            break;
        }
      }
    });

    const formattedMessages = messages.map((msg) => ({
      ...msg,
      id: msg._id.toString(),
      _id: msg._id.toString(),
    }));

    return NextResponse.json({
      success: true,
      messages: formattedMessages.reverse(),
      totals,
    });
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages', details: error.message },
      { status: 500 }
    );
  }
}
async function postHandler(request: NextRequest) {
  try {
    const user = (request as any).user;
    const { inputText } = await request.json();

    if (!inputText) {
      return NextResponse.json(
        { error: 'inputText is required' },
        { status: 400 }
      );
    }

    // Parse with LLM directly
    const llmData = await parseLLMResponse(inputText);

    let parsedData = null;
    if (llmData) {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      // Extract tags from input
      const words = inputText
        .toLowerCase()
        .split(' ')
        .filter((w: string) => w.length > 3);
      const tags = words
        .slice(0, 2)
        .map((tag: string) => tag.charAt(0).toUpperCase() + tag.slice(1));

      // Map type to transaction_type
      let transactionType: 'EXPENSE' | 'INCOME' | 'INVESTMENTS' = 'EXPENSE';
      if (llmData.type?.toLowerCase() === 'income') transactionType = 'INCOME';
      if (llmData.type?.toLowerCase() === 'investment')
        transactionType = 'INVESTMENTS';

      parsedData = {
        text: inputText,
        amount: llmData.price || 0,
        category: llmData.category || 'Uncategorized',
        transaction_type: transactionType,
        tags,
        sentiment: llmData.sentiment || 0,
        location: 'Unknown',
        timestamp: now.toISOString(),
        year,
        month,
        year_month: `${year}-${month.toString().padStart(2, '0')}`,
        month_name: now.toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        }),
        year_month_key: `${year}-${month.toString().padStart(2, '0')}`,
      };
    }

    const message = {
      userId: user.userId,
      inputText,
      parsedData,
      createdAt: new Date().toISOString(),
    };

    console.log('💾 Attempting to save to MongoDB:', message);

    const collection = await getCollection(COLLECTIONS.MESSAGES);
    const result = await collection.insertOne(message);

    console.log('✅ MongoDB insert successful! ID:', result.insertedId);

    return NextResponse.json({
      success: true,
      message: {
        ...message,
        id: result.insertedId.toString(),
        _id: result.insertedId.toString(),
      },
    });
  } catch (error: any) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Failed to create message', details: error.message },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getHandler);
export const POST = withAuth(postHandler);
