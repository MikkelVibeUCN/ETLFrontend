export interface RuleDefinition {
  label: string;
  inputType?: "text" | "number" | "select" | "checkbox" | "none";
  options?: string[];
  inputTypeByDataType?: Partial<Record<string, Omit<RuleDefinition, "label">>>;
  defaultValue?: string | number | boolean;
}

export interface TypeRuleMap {
  [dataType: string]: string[];
}

export interface RuleConfig {
  globalRules: string[];
  typeRules: TypeRuleMap;
  ruleDefinitions: Record<string, RuleDefinition>;
}

const ruleConfig: RuleConfig = {
  globalRules: ["change_name"],
  typeRules: {
    string: ["equals", "contains"],
    number: ["equals", "greater_than", "less_than"],
    boolean: ["equals"],
    list: [],
    object: [],
    null: [],
  },
  ruleDefinitions: {
    change_name: {
      label: "Change Name",
      inputType: "text",
      defaultValue: "$fieldName", // ✅ This special keyword will be replaced dynamically
    },
    equals: {
      label: "Equals",
      inputTypeByDataType: {
        string: { inputType: "text" },
        number: { inputType: "number" },
        boolean: {
          inputType: "select",
          options: ["true", "false"],
        },
      },
    },
    contains: {
      label: "Contains",
      inputType: "text",
    },
    greater_than: {
      label: "Greater Than",
      inputType: "number",
    },
    less_than: {
      label: "Less Than",
      inputType: "number",
    },
  },
};

export default ruleConfig;
