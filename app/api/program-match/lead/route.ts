import { NextRequest, NextResponse } from 'next/server';
import { dataClient } from '@/lib/data';
import { checkLeadCreationRateLimit } from '@/lib/program-match/rate-limiting';

/**
 * POST /api/program-match/lead
 * 
 * Create a Program Match lead (canonical RFI) at gate
 * 
 * Body:
 * - quiz_id, version_id, email (required)
 * - first_name, last_name, phone, etc. (optional)
 * - consent flags
 * - tracking context (utm, referrer, device)
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const rateLimit = checkLeadCreationRateLimit(clientIp);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          resetAt: rateLimit.resetAt,
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetAt.toString(),
          },
        }
      );
    }

    const body = await request.json();
    const { quiz_id, version_id, email } = body;

    if (!quiz_id || !version_id || !email) {
      return NextResponse.json(
        { error: 'quiz_id, version_id, and email are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const lead = await dataClient.createProgramMatchLead(
      { workspace: 'admissions', app: 'admissions' },
      {
        quiz_id,
        version_id,
        email,
        first_name: body.first_name,
        last_name: body.last_name,
        phone: body.phone,
        intended_start_term: body.intended_start_term,
        modality_preference: body.modality_preference,
        email_consent: body.email_consent,
        sms_consent: body.sms_consent,
        utm_source: body.utm_source,
        utm_medium: body.utm_medium,
        utm_campaign: body.utm_campaign,
        referrer: body.referrer,
        device_type: body.device_type,
      }
    );

    return NextResponse.json({
      lead_id: lead.lead_id,
      resume_token: lead.resume_token,
      resume_url: lead.resume_url,
    }, {
      headers: {
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.resetAt.toString(),
      },
    });
  } catch (error) {
    console.error('Error creating Program Match lead:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

