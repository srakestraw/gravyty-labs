import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { role, currentGoal } = body;

    if (!role) {
      return NextResponse.json(
        { error: 'Role is required' },
        { status: 400 }
      );
    }

    // Build the prompt
    const systemPrompt = `You are helping a university staff member configure an internal AI agent.
Your job is to suggest 3–5 clear, outcome-focused goals (not tasks, filters, or workflow steps).
Goals should express the desired result the agent should optimize for — the "why," not the "how."
If a current goal is provided, refine it into a clear outcome statement or suggest related outcome goals.
Return a JSON object with a "suggestions" key containing an array of outcome goal strings.`;

    const userPrompt = `Role: ${role}
${currentGoal ? `Current goal: ${currentGoal}` : 'No specific goal provided yet.'}

Generate 3-5 short, outcome-focused goals for this role. Each goal should be a clear outcome statement (e.g., "Increase application completion rates" or "Reduce registration blockers"). 
If a current goal was provided, either refine it into a better outcome statement or suggest related outcome goals.
Return them as a JSON object: {"suggestions": ["outcome goal 1", "outcome goal 2", ...]}`;

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 200,
      response_format: { type: 'json_object' },
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    const parsed = JSON.parse(responseContent);
    
    // Handle different response formats - OpenAI with json_object format typically returns an object
    let suggestions: string[] = [];
    if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
      suggestions = parsed.suggestions;
    } else if (parsed.questions && Array.isArray(parsed.questions)) {
      suggestions = parsed.questions;
    } else if (Array.isArray(parsed)) {
      suggestions = parsed;
    } else {
      // Try to extract array from any key
      const values = Object.values(parsed);
      if (values.length > 0 && Array.isArray(values[0])) {
        suggestions = values[0] as string[];
      }
    }

    // Ensure we have valid suggestions
    if (!Array.isArray(suggestions) || suggestions.length === 0) {
      throw new Error('Invalid response format from OpenAI');
    }

    // Limit to 5 suggestions max
    suggestions = suggestions.slice(0, 5);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate suggestions',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

