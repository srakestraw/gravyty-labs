import { NextRequest, NextResponse } from 'next/server';
import { dataClient } from '@/lib/data';
import type { ProgramMatchEvent } from '@/lib/program-match/types';

/**
 * POST /api/program-match/events
 * 
 * Track Program Match events
 * 
 * Body: ProgramMatchEvent or array of ProgramMatchEvent
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle single event or batch
    const events: ProgramMatchEvent[] = Array.isArray(body) ? body : [body];

    // Validate events
    for (const event of events) {
      if (!event.event_type || !event.timestamp) {
        return NextResponse.json(
          { error: 'Invalid event format' },
          { status: 400 }
        );
      }
    }

    // Track all events (non-blocking)
    const promises = events.map((event) =>
      dataClient.trackProgramMatchEvent(
        { workspace: 'admissions', app: 'admissions' },
        event
      ).catch((err) => {
        console.error('Error tracking event:', err);
        // Don't throw - continue processing other events
      })
    );

    await Promise.all(promises);

    return NextResponse.json({ success: true, tracked: events.length });
  } catch (error) {
    console.error('Error tracking Program Match events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

