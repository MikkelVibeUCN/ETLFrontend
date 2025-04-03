export interface FieldNode {
  name: string
  selected: boolean
  dataType: string
  rules?: string[]
  ruleValues?: Record<string, any>
  children?: FieldNode[]
  _expanded?: boolean
}
export function buildFieldTreeFromJson(json: any): FieldNode[] {
  function normalizeType(value: string): string {
    switch (value.toLowerCase()) {
      case "string":
        return "string";
      case "number":
        return "number";
      case "bool":
      case "boolean":
        return "boolean";
      case "null":
        return "null";
      default:
        return "string"; // fallback if unknown type
    }
  }

  function parseObject(obj: any): FieldNode[] {
    if (typeof obj !== "object" || obj === null) return [];

    if (Array.isArray(obj)) {
      return parseObject(obj[0]);
    }

    return Object.entries(obj).map(([key, value]) => {
      let node: FieldNode;

      if (typeof value === "string") {
        node = {
          name: key,
          selected: true,
          dataType: normalizeType(value)
        };
      } else if (Array.isArray(value)) {
        const children = parseObject(value[0]);
        node = {
          name: key,
          selected: true,
          dataType: "list",
          children
        };
      } else if (typeof value === "object" && value !== null) {
        node = {
          name: key,
          selected: true,
          dataType: "object",
          children: parseObject(value)
        };
      } else {
        node = {
          name: key,
          selected: true,
          dataType: normalizeType(String(value))
        };
      }

      return node;
    });
  }

  return parseObject(json);
}
