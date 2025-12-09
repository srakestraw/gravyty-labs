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
        res.status(403).json({
          error: `Email domain '${domain}' is not allowed. Please use a ${allowedDomains.join(' or ')} email.`
        });
        return;
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
    return;
  } catch (error) {
    console.error('Auth sync error:', error);
    res.status(401).json({
      error: 'Authentication failed'
    });
    return;
  }
});

// In-memory storage for configs (TODO: Move to Firestore)
let guardrailsConfig: any = null;
let communicationConfig: any = null;

// Helper function to handle guardrails requests
async function handleGuardrails(req: any, res: any) {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  
  try {
    if (req.method === 'GET') {
      // Return cached config or default structure
      if (!guardrailsConfig) {
        // Return default guardrails structure
        guardrailsConfig = {
          fairness: {
            protectedAttributes: [
              "race_ethnicity", "gender_identity", "sexual_orientation",
              "religion", "national_origin", "disability_status",
              "age", "veteran_status", "first_gen", "low_income"
            ],
            allowAttributeOverrides: true,
            languageGuidelines: {
              avoidFraming: [],
              preferredFraming: []
            },
            fairnessEvalsEnabled: true,
          },
          privacy: {
            allowedDomains: ["admissions", "student_success", "registrar", "career_services", "alumni_engagement", "advancement"],
            sensitiveDomainsExcluded: ["counseling_notes", "mental_health", "conduct_records"],
            emailPolicy: "summary_only",
            smsPolicy: "reminders_only",
            phonePolicy: "summary_only",
          },
          engagement: {
            quietHours: {
              enabled: true,
              startTime: "21:00",
              endTime: "08:00",
              timezoneMode: "recipient"
            },
            quietPeriods: [],
            holidays: [],
            priorityOverrides: {},
          },
          actions: {
            defaults: {
              send_email: "human_review",
              send_sms: "human_review",
              send_phone_call: "blocked",
              create_task: "auto",
              create_internal_flag: "auto",
              change_status: "human_review",
              change_owner: "human_review"
            },
            perRoleOverrides: {}
          },
          logging: {
            requireActionLogging: true,
            requireDneCheckLogging: true,
            requireGuardrailCheckLogging: true,
            requireEvalStatusBeforeAuto: true
          },
          humanEscalation: {
            rules: []
          },
          updatedAt: new Date().toISOString(),
        };
      }
      res.status(200).json({ config: guardrailsConfig });
      return;
    }
    
    if (req.method === 'POST') {
      const { config } = req.body;
      if (!config) {
        res.status(400).json({ error: 'config is required' });
        return;
      }
      
      // Save config (in-memory for now, TODO: persist to Firestore)
      guardrailsConfig = {
        ...config,
        updatedAt: new Date().toISOString(),
        updatedBy: 'admin' // TODO: Get from auth
      };
      
      res.status(200).json({ config: guardrailsConfig });
      return;
    }
    
    res.status(405).json({ error: 'Method not allowed' });
    return;
  } catch (error) {
    console.error('Guardrails error:', error);
    res.status(500).json({ error: 'Failed to process guardrails request' });
    return;
  }
}

// Helper function to handle communication config requests
async function handleCommunicationConfig(req: any, res: any) {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  
  try {
    if (req.method === 'GET') {
      // Return cached config or default structure
      if (!communicationConfig) {
        // Return default communication config structure
        communicationConfig = {
          brand: {
            name: "Gravyty Labs",
            mission: "",
            values: [],
            voiceDescription: ""
          },
          personality: {
            traits: [],
            communicationStyle: "professional",
            formalityLevel: "balanced"
          },
          toneRules: [],
          updatedAt: new Date().toISOString(),
        };
      }
      res.status(200).json({ config: communicationConfig });
      return;
    }
    
    if (req.method === 'POST') {
      const { config } = req.body;
      if (!config) {
        res.status(400).json({ error: 'config is required' });
        return;
      }
      
      // Save config (in-memory for now, TODO: persist to Firestore)
      communicationConfig = {
        ...config,
        updatedAt: new Date().toISOString(),
        updatedBy: 'admin' // TODO: Get from auth
      };
      
      res.status(200).json({ config: communicationConfig });
      return;
    }
    
    res.status(405).json({ error: 'Method not allowed' });
    return;
  } catch (error) {
    console.error('Communication config error:', error);
    res.status(500).json({ error: 'Failed to process communication config request' });
    return;
  }
}

// Main API router function
export const api = functions.https.onRequest(async (req, res) => {
  // Extract the path - handle both /api/endpoint and /endpoint formats
  // req.path might be /api/guardrails or /guardrails depending on how it's called
  let path = req.path || '/';
  
  // Remove /api prefix if present
  if (path.startsWith('/api')) {
    path = path.replace(/^\/api/, '') || '/';
  }
  
  // Also check req.url which might have the full path
  if (!path || path === '/') {
    const urlPath = req.url?.split('?')[0] || '';
    if (urlPath.startsWith('/api')) {
      path = urlPath.replace(/^\/api/, '') || '/';
    } else if (urlPath && urlPath !== '/') {
      path = urlPath;
    }
  }
  
  const segments = path.split('/').filter(Boolean);
  const endpoint = segments[0] || '';
  
  // Log for debugging (remove in production if needed)
  console.log('API request:', {
    method: req.method,
    path: req.path,
    url: req.url,
    parsedPath: path,
    endpoint,
    segments
  });
  
  // Route to appropriate handler
  if (endpoint === 'guardrails') {
    return handleGuardrails(req, res);
  } else if (endpoint === 'communication-config') {
    return handleCommunicationConfig(req, res);
  } else if (endpoint === 'auth' && segments[1] === 'sync') {
    // Handle auth/sync
    return authSync(req, res);
  } else if (endpoint === 'health') {
    // Handle health check
    return health(req, res);
  } else {
    console.error('Unknown endpoint:', endpoint, 'from path:', req.path, 'url:', req.url);
    res.status(404).json({ error: `Endpoint ${endpoint} not found` });
    return;
  }
});

// Guardrails endpoint (standalone, for direct access)
export const guardrails = functions.https.onRequest(async (req, res) => {
  return handleGuardrails(req, res);
});

// Communication config endpoint (standalone, for direct access)
export const communicationConfigEndpoint = functions.https.onRequest(async (req, res) => {
  return handleCommunicationConfig(req, res);
});




