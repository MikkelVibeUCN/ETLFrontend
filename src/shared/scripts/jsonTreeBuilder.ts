export interface FieldNode {
    name: string;
    selected: boolean;
    children?: FieldNode[];
  }
  
  export function buildFieldTreeFromJson(json: any): FieldNode[] {  
    function parseObject(obj: any, parentKey = ''): FieldNode[] {
      if (typeof obj !== 'object' || obj === null) return [];
  
      if (Array.isArray(obj)) {
        // Assume first element is representative
        return parseObject(obj[0], parentKey);
      }
  
      return Object.entries(obj).map(([key, value]) => {
        const node: FieldNode = {
          name: key,
          selected: true
        };
  
        if (typeof value === 'object' && value !== null) {
          node.children = parseObject(value, key);
        }
  
        return node;
      });
    }
  
    return parseObject(json);
  }
  