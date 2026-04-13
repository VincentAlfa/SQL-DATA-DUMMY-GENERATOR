import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { NextResponse } from 'next/server';

type RequestBody = {
  prompt?: string;
  tableConfigs?: Record<string, number>;
};

export async function POST(request: Request) {
  try {
    const { prompt, tableConfigs }: RequestBody = await request.json();

    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: 'Please provide SQL schema.' }, { status: 400 });
    }

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json(
        { error: 'Google Generative AI API key is not configured' },
        { status: 500 },
      );
    }

    let tableInstructions = 'Generate exactly 20 records per table.';
    if (tableConfigs && Object.keys(tableConfigs).length > 0) {
      const perTable = Object.entries(tableConfigs)
        .map(
          ([tableName, recordCount]) =>
            `- ${tableName}: Generate exactly ${recordCount} records`,
        )
        .join('\n');

      tableInstructions = `Records per table:\n${perTable}`;
    }

    const systemPrompt = [
      'You are an expert SQL developer.',
      'Analyze the SQL schema provided by the user and generate realistic dummy data INSERT statements.',
      'Requirements:',
      '1. CRITICAL RULE: Input Validation. First, verify the user input. The input MUST be a strictly valid SQL schema. If the input is plain text, gibberish, conversational, missing, OR contains any SQL syntax errors, malformed constraints, or typos, IMMEDIATELY stop and return ONLY the exact string: "ERROR: Invalid SQL schema provided." Do not ask for the schema, do not ask for clarification, do not explain, and do not generate any data.',
      '2. Understand the table structure, data types, nullability, and constraints.',
      "3. CRITICAL SQL SYNTAX: Escape single quotes inside string values by doubling them (e.g., 'O''Connor') to prevent fatal syntax errors.",
      '4. DEPENDENCY & INTEGRITY: Order INSERTs logically (Parent tables before Child tables). Foreign key values in child tables MUST STRICTLY match the exact primary key values you just generated for their parent tables. Do not invent orphan foreign keys.',
      '5. Respect NULL constraints: If a column allows NULL, occasionally insert NULL values to make data realistic for testing. Never insert NULL into NOT NULL columns.',
      `6. ${tableInstructions}`,
      '7. Use realistic dummy data. For dates and timestamps, strictly use standard SQL format (YYYY-MM-DD HH:MM:SS).',
      '8. For each table, generate exactly one INSERT INTO statement utilizing a multiple-row values list (comma-separated rows).',
      '9. PK HANDLING: If a primary key is an auto-increment integer, include values explicitly and sequentially. If it is a UUID, generate valid random UUID strings. Never generate duplicate primary keys.',
      '10. OUTPUT FORMAT: Return ONLY the executable SQL code. Absolutely no conversational text, greetings, or explanations. Wrap the entire output inside a single ```sql block.',
    ].join('\n');

    const result = streamText({
      model: google('gemini-flash-lite-latest'),
      system: systemPrompt,
      prompt,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Error in generate-dummy-data route:', error);
    return NextResponse.json(
      {
        error: `Failed to generate dummy data: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      },
      { status: 500 },
    );
  }
}
