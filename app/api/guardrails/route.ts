import { NextRequest, NextResponse } from 'next/server';
import { loadGuardrailsConfig, saveGuardrailsConfig, validateGuardrailsConfig } from '@/lib/guardrails/store';
import { canEditGuardrails } from '@/lib/roles';
import { GuardrailsConfig } from '@/lib/guardrails/types';

// Lazy initialization to avoid build-time errors
let prisma: any = null;
async function getPrisma() {
  if (process.env.NEXT_PHASE === 'phase-production-build' || typeof window !== 'undefined') {
    return null;
  }
  if (!prisma) {
    try {
      const { PrismaClient } = await import('@prisma/client');
      prisma = new PrismaClient();
    } catch (e) {
      return null;
    }
  }
  return prisma;
}

/**
 * GET /api/guardrails
 * Returns current guardrails configuration
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Check permissions - for now allow read access
    // In production, check: canAccessAIAssistants(userId)
    
    const config = await loadGuardrailsConfig();
    return NextResponse.json({ config });
  } catch (error) {
    console.error('Error loading guardrails config:', error);
    return NextResponse.json(
      { error: 'Failed to load guardrails configuration' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/guardrails
 * Updates guardrails configuration
 * Body: { config: GuardrailsConfig }
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Check permissions - extract userId from auth
    // For now, allow editing (will be enforced in production)
    // const userId = extractUserId(request);
    // if (!canEditGuardrails(userId)) {
    //   return NextResponse.json(
    //     { error: 'Unauthorized: Only admins can edit guardrails' },
    //     { status: 403 }
    //   );
    // }

    const body = await request.json();
    const { config } = body;

    if (!config) {
      return NextResponse.json(
        { error: 'config is required' },
        { status: 400 }
      );
    }

    // Validate config
    const validationErrors = validateGuardrailsConfig(config);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }

    // TODO: Extract userId from auth context
    const updatedBy = 'admin'; // TODO: Get from auth

    // Save config
    const updatedConfig = await saveGuardrailsConfig(config, updatedBy);

    // TODO: Persist to database when ready
    // const db = await getPrisma();
    // if (db) {
    //   await db.guardrailsConfig.upsert({
    //     where: { id: 'global' },
    //     create: { id: 'global', config: updatedConfig, updatedBy },
    //     update: { config: updatedConfig, updatedBy },
    //   });
    // }

    return NextResponse.json({ config: updatedConfig });
  } catch (error) {
    console.error('Error saving guardrails config:', error);
    return NextResponse.json(
      { error: 'Failed to save guardrails configuration' },
      { status: 500 }
    );
  }
}

