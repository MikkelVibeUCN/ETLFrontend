import ruleConfig from './Rules/Scripts/ruleConfig'

export type RuleKey = keyof typeof ruleConfig.ruleDefinitions
export type RuleDef = typeof ruleConfig.ruleDefinitions[RuleKey]

export interface TransformConfig {
  Mappings: MappingRule[];
  Filters: FilterRule[];
}

export interface MappingRule {
  SourceField: string;
  TargetField: string;
  RuleKey?: RuleKey; // ✅ Optional but strictly typed
}

export interface FilterRule {
  Field: string;
  Operator: RuleKey; // ✅ Must match a defined rule
  Value: string;
}
