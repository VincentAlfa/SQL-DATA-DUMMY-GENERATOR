import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { streamText } from 'ai';
import { google } from '@ai-sdk/google';

export async function POST(request: NextRequest) {
  try {
    const { sqlSchema } = await request.json();

    if (!sqlSchema) {
      return NextResponse.json({ error: 'SQL schema is required' }, { status: 400 });
    }

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json(
        { error: 'Google Generative AI API key is not configured' },
        { status: 500 }
      );
    }

    console.log('Starting generation with Gemini...');

    const prompt = `
You are an expert SQL developer. Analyze the following SQL schema and generate realistic dummy data INSERT statements.

Requirements:
1. Understand the table structure, data types, and constraints
2. Identify primary keys, foreign keys, and relationships between tables
3. Generate realistic dummy data that respects all constraints
4. Strictly generate **exactly 20 records per table** — no more, no less.
5. Ensure foreign key relationships are maintained
6. Use realistic data (names, emails, dates, etc.)
7. Return only the INSERT statements, no explanations
8. For each table, generate a single INSERT INTO statement containing all 20 records (use comma-separated value groups)
9. Maintain SQL syntax consistency and ensure statements can be executed without errors
10. If a table includes an 'id' column (or any auto-increment primary key), include the id values explicitly in the INSERT statement

SQL Schema:
${sqlSchema}

Generate INSERT statements with realistic dummy data:
`;

    const result = streamText({
      model: google('gemini-2.5-flash-lite'),
      prompt,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      {
        error: `Failed to generate dummy data: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      },
      { status: 500 }
    );
  }
}
