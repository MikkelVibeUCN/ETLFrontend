export function simplifyJsonStructure(json: any): any {
  if (Array.isArray(json)) {
    if (json.length === 0) return [];
    return [simplifyJsonStructure(json[0])];
  }

  if (typeof json === "object" && json !== null) {
    const result: Record<string, any> = {};

    for (const key in json) {
      const value = json[key];  

      if (Array.isArray(value)) {
        result[key] = value.length > 0 ? [simplifyJsonStructure(value[0])] : [];
      } else if (typeof value === "object" && value !== null) {
        result[key] = simplifyJsonStructure(value);
      } else {
        result[key] = getType(value);
      }
    }

    return result;
  }
  return getType(json);
}

function getType(value: any): string {
  if (value === null) return "null";
  if (typeof value === "boolean") return "bool";
  if (typeof value === "number") return "number";
  if (typeof value === "string") return "string";
  return typeof value;
}

type HeaderItem = {
  key: string;
  value: string;
  extra?: string;
};




export function formatHeaders(headers: HeaderItem[]): Record<string, string> {
  const newHeaders: Record<string, string> = {};

  headers.forEach(({ key, value, extra }) => {
    newHeaders[key] = extra && extra !== "" ? `${value} ${extra}` : value;
  });

  return newHeaders;
}
