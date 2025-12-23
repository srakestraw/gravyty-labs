/**
 * Enforcement Tests for AI Assistant Data Access Rules
 * 
 * These tests ensure that the AI Assistant module does not contain
 * direct data access patterns (fetch, axios, direct API imports, etc.).
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

describe('AI Assistant Data Access Enforcement', () => {
  const aiAssistantDir = join(process.cwd(), 'lib/ai-assistant');
  const aiAssistantComponentsDir = join(process.cwd(), 'components/shared/ai-assistant');

  // Patterns that indicate forbidden direct data access
  const forbiddenPatterns = [
    // Direct fetch calls
    /fetch\s*\(/,
    // Axios imports/usage
    /import.*axios/,
    /from\s+['"]axios['"]/,
    // Direct API client imports (outside provider folder)
    /from\s+['"]@\/lib\/data['"]/,
    /import.*dataClient/,
    // Direct repository/service imports
    /from\s+['"]@\/lib\/.*\/mock/,
    /from\s+['"]@\/lib\/.*\/service/,
    /from\s+['"]@\/lib\/.*\/repository/,
    // Direct SDK calls
    /\.get\(/,
    /\.post\(/,
    /\.put\(/,
    /\.delete\(/,
  ];

  // Files that are ALLOWED to have direct data access (provider implementations)
  const allowedFiles = [
    /providers\/.*\.ts$/, // Provider implementations can use dataClient
  ];

  function isFileAllowed(filePath: string): boolean {
    return allowedFiles.some(pattern => pattern.test(filePath));
  }

  function checkFileForForbiddenPatterns(filePath: string, content: string): string[] {
    const violations: string[] = [];
    
    if (isFileAllowed(filePath)) {
      return violations; // Skip provider files
    }

    const lines = content.split('\n');
    lines.forEach((line, index) => {
      forbiddenPatterns.forEach((pattern) => {
        if (pattern.test(line)) {
          violations.push(
            `Line ${index + 1}: Found forbidden pattern "${pattern.source}" in ${filePath}`
          );
        }
      });
    });

    return violations;
  }

  function getAllFiles(dir: string, fileList: string[] = []): string[] {
    const files = readdirSync(dir);
    
    files.forEach((file) => {
      const filePath = join(dir, file);
      const stat = statSync(filePath);
      
      if (stat.isDirectory()) {
        // Skip providers directory and __tests__ directory
        if (!filePath.includes('providers') && !filePath.includes('__tests__')) {
          getAllFiles(filePath, fileList);
        }
      } else if ((file.endsWith('.ts') || file.endsWith('.tsx')) && !file.endsWith('.test.ts')) {
        fileList.push(filePath);
      }
    });
    
    return fileList;
  }

  it('should not contain direct fetch calls in AI Assistant module', () => {
    const violations: string[] = [];
    
    // Check lib/ai-assistant (excluding providers)
    const libDir = join(process.cwd(), 'lib/ai-assistant');
    const libFiles = getAllFiles(libDir);

    // Check components/shared/ai-assistant
    const componentDir = join(process.cwd(), 'components/shared/ai-assistant');
    const componentFiles = getAllFiles(componentDir);

    const allFiles = [...libFiles, ...componentFiles];

    for (const filePath of allFiles) {
      const content = readFileSync(filePath, 'utf-8');
      const fileViolations = checkFileForForbiddenPatterns(filePath, content);
      violations.push(...fileViolations);
    }

    if (violations.length > 0) {
      console.error('\n❌ Found forbidden data access patterns:');
      violations.forEach(v => console.error(`  ${v}`));
      console.error('\n💡 All data access must go through domain-scoped providers.');
      console.error('   See: lib/ai-assistant/providers/');
    }

    expect(violations).toHaveLength(0);
  });

  it('should not import dataClient directly in AI Assistant components', () => {
    const violations: string[] = [];
    
    const componentDir = join(process.cwd(), 'components/shared/ai-assistant');
    const componentFiles = getAllFiles(componentDir);

    for (const filePath of componentFiles) {
      const content = readFileSync(filePath, 'utf-8');
      
      if (content.includes("from '@/lib/data'") || content.includes('from "@/lib/data"')) {
        violations.push(`Found direct dataClient import in ${file}`);
      }
    }

    if (violations.length > 0) {
      console.error('\n❌ Found direct dataClient imports:');
      violations.forEach(v => console.error(`  ${v}`));
      console.error('\n💡 Use domain-scoped providers instead.');
      console.error('   Example: import { AdmissionsDataProvider } from "@/lib/ai-assistant/providers/types"');
    }

    expect(violations).toHaveLength(0);
  });

  it('should not import mock data directly in AI Assistant components', () => {
    const violations: string[] = [];
    
    const componentDir = join(process.cwd(), 'components/shared/ai-assistant');
    const componentFiles = getAllFiles(componentDir);

    const mockImportPattern = /from\s+['"]@\/lib\/.*\/mock/;

    for (const filePath of componentFiles) {
      const content = readFileSync(filePath, 'utf-8');
      
      if (mockImportPattern.test(content)) {
        violations.push(`Found direct mock data import in ${file}`);
      }
    }

    if (violations.length > 0) {
      console.error('\n❌ Found direct mock data imports:');
      violations.forEach(v => console.error(`  ${v}`));
      console.error('\n💡 All data access must go through domain-scoped providers.');
    }

    expect(violations).toHaveLength(0);
  });
});

