import { NextRequest, NextResponse } from 'next/server';
import { loadCommunicationConfig, saveCommunicationConfig, validateCommunicationConfig } from '@/lib/communication/store';
import { CommunicationConfig } from '@/lib/communication/types';

/**
 * GET /api/communication-config
 * Returns current communication configuration
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Check permissions - for now allow read access
    // In production, check: canAccessAIAssistants(userId)
    
    const config = await loadCommunicationConfig();
    return NextResponse.json({ config });
  } catch (error) {
    console.error('Error loading communication config:', error);
    return NextResponse.json(
      { error: 'Failed to load communication configuration' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/communication-config
 * Updates communication configuration
 * Body: { config: CommunicationConfig }
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Check permissions - extract userId from auth
    // For now, allow editing (will be enforced in production)
    // const userId = extractUserId(request);
    // if (!canEditGuardrails(userId)) {
    //   return NextResponse.json(
    //     { error: 'Unauthorized: Only admins can edit communication config' },
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
    const validationErrors = validateCommunicationConfig(config);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }

    // TODO: Extract userId from auth context
    const updatedBy = 'admin'; // TODO: Get from auth

    // Save config
    const updatedConfig = await saveCommunicationConfig(config, updatedBy);

    // TODO: Persist to database when ready
    // const db = await getPrisma();
    // if (db) {
    //   await db.communicationConfig.upsert({
    //     where: { id: 'global' },
    //     create: { id: 'global', config: updatedConfig, updatedBy },
    //     update: { config: updatedConfig, updatedBy },
    //   });
    // }

    return NextResponse.json({ config: updatedConfig });
  } catch (error) {
    console.error('Error saving communication config:', error);
    return NextResponse.json(
      { error: 'Failed to save communication configuration' },
      { status: 500 }
    );
  }
}

