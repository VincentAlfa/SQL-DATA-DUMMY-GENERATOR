import type { NextRequest } from "next/server"
import { streamText } from "ai"
import { google } from "@ai-sdk/google"

export async function POST(request: NextRequest) {
  try {
    const { sqlSchema } = await request.json()

    if (!sqlSchema) {
      return new Response(JSON.stringify({ error: "SQL schema is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Check if API key is available
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return new Response(
        JSON.stringify({
          error: "Google Generative AI API key is not configured",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    console.log("Starting generation with Gemini...")

    const prompt = `
You are an expert SQL developer. Analyze the following SQL schema and generate realistic dummy data INSERT statements.

Requirements:
1. Understand the table structure, data types, and constraints
2. Identify primary keys, foreign keys, and relationships between tables
3. Generate realistic dummy data that respects all constraints
4. Create 10 records per table
5. Ensure foreign key relationships are maintained
6. Use realistic data (names, emails, dates, etc.)
7. Return only the INSERT statements, no explanations

SQL Schema:
${sqlSchema}

Generate INSERT statements with realistic dummy data:
`

    const result = streamText({
      model: google("gemini-1.5-flash"),
      prompt,
      maxTokens: 2000,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Error in API route:", error)
    return new Response(
      JSON.stringify({
        error: `Failed to generate dummy data: ${error instanceof Error ? error.message : "Unknown error"}`,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
