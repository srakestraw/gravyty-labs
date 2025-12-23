/**
 * Conflict resolver for Voice & Tone profile assignment
 * 
 * Determines which profile should be used for a given context based on:
 * 1. Specificity order: user > group > agent > app > default
 * 2. Rule priority (order ascending) as tie-breaker within a scope
 * 3. Channel filtering
 */

import { VoiceProfile, VoiceProfileId, AssignmentRule, AssignmentScope, AssignmentChannelScope } from './types';

export interface ResolutionContext {
  userId?: string;
  groupIds?: string[];
  agentId?: string;
  appId?: string;
  channel?: AssignmentChannelScope;
}

export interface ResolutionResult {
  profileId: VoiceProfileId;
  source: 'rule' | 'default';
  ruleId?: string;
  scope?: AssignmentScope;
}

/**
 * Resolves which voice profile should be used for a given context.
 * 
 * Assignment priority (most specific to least specific):
 * 1. User
 * 2. Group
 * 3. Agent
 * 4. App
 * 5. Default profile
 * 
 * When multiple rules match, the most specific rule wins. If rules have equal specificity,
 * the rule with the highest priority (lowest order number, top-most) is applied.
 * 
 * @param profiles - All available voice profiles
 * @param rules - All assignment rules
 * @param context - The resolution context (user, group, agent, app, channel)
 * @returns The resolved profile ID and how it was determined
 */
export function resolveVoiceProfile(
  profiles: VoiceProfile[],
  rules: AssignmentRule[],
  context: ResolutionContext
): ResolutionResult {
  // Step 1: Filter rules by channel
  let applicableRules = rules;
  if (context.channel) {
    applicableRules = rules.filter(rule => 
      rule.channelScope === 'all' || rule.channelScope === context.channel
    );
  }

  // Step 2: Evaluate specificity in order (strongest → weakest)
  const specificityOrder: AssignmentScope[] = ['user', 'group', 'agent', 'app'];

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
        profileId: selectedRule.profileId,
        source: 'rule',
        ruleId: selectedRule.id,
        scope: selectedRule.scope,
      };
    }
  }

  // Step 3: No rule matched - use default profile
  const defaultProfile = profiles.find(p => p.isDefault);
  
  if (defaultProfile) {
    return {
      profileId: defaultProfile.id,
      source: 'default',
    };
  }

  // Step 4: Fallback to first profile if no default defined
  if (profiles.length > 0) {
    return {
      profileId: profiles[0].id,
      source: 'default',
    };
  }

  // Step 5: No profiles available - this should not happen in normal operation
  throw new Error('No voice profiles available for resolution');
}

/**
 * Helper to convert legacy ToneRule to AssignmentRule
 */
export function convertToneRuleToAssignmentRule(toneRule: any): AssignmentRule {
  // Map 'app' | 'group' | 'user' to 'app' | 'group' | 'agent' | 'user'
  let scope: AssignmentScope = 'app';
  if (toneRule.scope === 'user') scope = 'user';
  else if (toneRule.scope === 'group') scope = 'group';
  else if (toneRule.scope === 'app') scope = 'app';
  // Note: 'agent' is new, so legacy rules won't have it

  return {
    id: toneRule.id,
    profileId: toneRule.profileId,
    scope,
    targetId: toneRule.targetId,
    targetLabel: toneRule.targetLabel,
    channelScope: toneRule.channelScope as AssignmentChannelScope,
    order: toneRule.order,
  };
}







