import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate email domain on backend as well
    if (body.email) {
      const allowedDomains = ['gravyty.com', 'rakestraw.com', 'gravytylabs.com'];
      const domain = body.email.split('@')[1];
      
      if (!allowedDomains.includes(domain)) {
        return NextResponse.json(
          { error: `Email domain '${domain}' is not allowed. Please use a ${allowedDomains.join(' or ')} email.` },
          { status: 403 }
        );
      }
    }
    
    // TODO: Verify Firebase token
    // TODO: Call NestJS backend to sync user
    // TODO: Set httpOnly cookie
    
    // For now, just return success
    return NextResponse.json({ 
      success: true,
      user: {
        id: body.uid,
        email: body.email,
        name: body.displayName || body.email.split('@')[0],
      }
    });
  } catch (error) {
    console.error('Auth sync error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
}
