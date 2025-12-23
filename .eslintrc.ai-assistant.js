/**
 * ESLint rules for AI Assistant module
 * 
 * Prevents direct data access patterns in AI Assistant code.
 * This file can be extended in the main ESLint config if needed.
 */

module.exports = {
  rules: {
    // Prevent direct fetch calls (use providers instead)
    'no-restricted-syntax': [
      'error',
      {
        selector: 'CallExpression[callee.name="fetch"]',
        message: 'Direct fetch calls are forbidden in AI Assistant. Use domain-scoped providers instead.',
      },
    ],
    // Prevent direct dataClient imports in components
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: '@/lib/data',
            message: 'Direct dataClient imports are forbidden in AI Assistant components. Use domain-scoped providers instead.',
          },
        ],
        patterns: [
          {
            group: ['@/lib/**/mock*'],
            message: 'Direct mock data imports are forbidden. Use domain-scoped providers instead.',
          },
          {
            group: ['@/lib/**/service*'],
            message: 'Direct service imports are forbidden in AI Assistant. Use domain-scoped providers instead.',
          },
        ],
      },
    ],
  },
  overrides: [
    {
      // Allow dataClient in provider implementations
      files: ['lib/ai-assistant/providers/**/*.ts'],
      rules: {
        'no-restricted-imports': 'off',
      },
    },
  ],
};

