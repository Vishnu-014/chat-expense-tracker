import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

    const prompt = `From the message below, extract the following as JSON:
- category (string): The category of the transaction (e.g., "Food", "Transport", "Salary", etc.)
- type (string): Must be exactly one of: "Expense", "Income", or "Investment"
- price (number): The amount in the transaction
- sentiment (number): A value from -1 to 1 representing the emotional tone (-1 = very negative, 0 = neutral, 1 = very positive)
- date (string or null): Extract date if mentioned (format: "05 Jul"), otherwise null

Message: "${message}"

Important: Return ONLY valid JSON, no markdown formatting, no explanatory text.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Clean response
    const cleanText = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    const jsonStart = cleanText.indexOf('{');
    const jsonEnd = cleanText.lastIndexOf('}') + 1;
    const jsonString = cleanText.slice(jsonStart, jsonEnd);

    const parsed = JSON.parse(jsonString);

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error('Parse error:', error);
    return NextResponse.json(
      { error: 'Failed to extract info', details: error.message },
      { status: 500 }
    );
  }
}
