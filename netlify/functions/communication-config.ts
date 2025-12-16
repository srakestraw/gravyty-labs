import type { Handler } from '@netlify/functions';
import { loadCommunicationConfig, saveCommunicationConfig, validateCommunicationConfig } from '../../lib/communication/store';

export const handler: Handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  // Handle OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: '',
    };
  }

  try {
    if (event.httpMethod === 'GET') {
      const config = await loadCommunicationConfig();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ config }),
      };
    }

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { config } = body;

      if (!config) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'config is required' }),
        };
      }

      // Validate config
      const validationErrors = validateCommunicationConfig(config);
      if (validationErrors.length > 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Validation failed', details: validationErrors }),
        };
      }

      // TODO: Extract userId from auth context
      const updatedBy = 'admin'; // TODO: Get from auth

      // Save config
      const updatedConfig = await saveCommunicationConfig(config, updatedBy);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ config: updatedConfig }),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  } catch (error) {
    console.error('Communication config error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to process communication config request' }),
    };
  }
};





