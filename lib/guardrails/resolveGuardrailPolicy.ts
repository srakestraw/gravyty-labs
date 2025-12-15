/**
 * Conflict resolver for Guardrail Policy assignment
 * 
 * Determines which policy should be used for a given context based on:
 * 1. Specificity order: user > group > agent > app > default
 * 2. Rule priority (order ascending) as tie-breaker within a scope
 * 3. Channel filtering
 */

import { GuardrailPolicy, GuardrailPolicyId, GuardrailAssignmentRule, GuardrailScope, GuardrailChannelScope } from './types';

export interface GuardrailResolutionContext {
  userId?: string;
  groupIds?: string[];
  agentId?: string;
  appId?: string;
  channel?: GuardrailChannelScope;
}

export interface GuardrailResolutionResult {
  policyId: GuardrailPolicyId;
  source: 'rule' | 'default';
  ruleId?: string;
  scope?: GuardrailScope;
}

/**
 * Resolves which guardrail policy should be used for a given context.
 * 
 * IMPORTANT: Global Guardrails always apply as a baseline. The resolved policy from this function
 * is layered on top of Global Guardrails. Policy rules can narrow or extend behavior,
 * but core safety rules defined at the Global level must still be enforced.
 * 
 * Assignment priority (most specific to least specific):
 * 1. User
 * 2. Group
 * 3. Agent
 * 4. App
 * 5. Default policy
 * 
 * When multiple rules match, the most specific rule wins. If rules have equal specificity,
 * the rule with the highest priority (lowest order number, top-most) is applied.
 * 
 * @param policies - All available guardrail policies
 * @param rules - All assignment rules
 * @param context - The resolution context (user, group, agent, app, channel)
 * @returns The resolved policy ID and how it was determined
 */
export function resolveGuardrailPolicy(
  policies: GuardrailPolicy[],
  rules: GuardrailAssignmentRule[],
  context: GuardrailResolutionContext
): GuardrailResolutionResult {
  // Step 1: Filter rules by channel
  let applicableRules = rules;
  if (context.channel) {
    applicableRules = rules.filter(rule => 
      rule.channelScope === 'all' || rule.channelScope === context.channel
    );
  }

  // Step 2: Evaluate specificity in order (strongest → weakest)
  const specificityOrder: GuardrailScope[] = ['user', 'group', 'agent', 'app'];

  for (const scope of specificityOrder) {
    const matchingRules = applicableRules.filter(rule => {
      if (rule.scope !== scope) return false;

      switch (scope) {
        case 'user':
          return context.userId && rule.targetId === context.userId;
        case 'group':
          return context.groupIds && context.groupIds.includes(rule.targetId);
        case 'agent':
          return context.agentId && rule.targetId === context.agentId;
        case 'app':
          return context.appId && rule.targetId === context.appId;
        default:
          return false;
      }
    });

    if (matchingRules.length > 0) {
      // Sort by order ascending (0 is highest priority)
      matchingRules.sort((a, b) => a.order - b.order);
      const selectedRule = matchingRules[0];
      
      return {
        policyId: selectedRule.policyId,
        source: 'rule',
        ruleId: selectedRule.id,
        scope: selectedRule.scope,
      };
    }
  }

  // Step 3: No rule matched - use default policy
  const defaultPolicy = policies.find(p => p.isDefault);
  
  if (defaultPolicy) {
    return {
      policyId: defaultPolicy.id,
      source: 'default',
    };
  }

  // Step 4: Fallback to first policy if no default defined
  if (policies.length > 0) {
    return {
      policyId: policies[0].id,
      source: 'default',
    };
  }

  // Step 5: No policies available - this should not happen in normal operation
  throw new Error('No guardrail policies available for resolution');
}


