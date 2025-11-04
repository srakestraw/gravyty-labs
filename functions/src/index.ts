import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

// Health check endpoint
export const health = functions.https.onRequest((req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'gravyty-labs-api'
  });
});

// Auth sync endpoint
export const authSync = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  
  try {
    const body = req.body;
    
    // Validate email domain on backend as well
    if (body.email) {
      const allowedDomains = ['gravyty.com', 'rakestraw.com', 'gravytylabs.com'];
      const domain = body.email.split('@')[1];
      
      if (!allowedDomains.includes(domain)) {
        return res.status(403).json({
          error: `Email domain '${domain}' is not allowed. Please use a ${allowedDomains.join(' or ')} email.`
        });
      }
    }
    
    // TODO: Verify Firebase token
    // TODO: Call NestJS backend to sync user
    // TODO: Set httpOnly cookie
    
    // For now, just return success
    res.status(200).json({ 
      success: true,
      user: {
        id: body.uid,
        email: body.email,
        name: body.displayName || body.email.split('@')[0],
      }
    });
  } catch (error) {
    console.error('Auth sync error:', error);
    res.status(401).json({
      error: 'Authentication failed'
    });
  }
});


