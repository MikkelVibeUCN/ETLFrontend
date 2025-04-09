function formatBody(content: unknown): string | undefined {
  if (content === null || content === undefined) return undefined;
  return typeof content === "string" ? content : JSON.stringify(content);
}

export interface RequestConfig {
  headers?: Record<string, string>;
  content?: any;
  endpoint?: string; // Optional when full URL is used
  url?: string; // Full URL shortcut
}

async function request<T = any>(baseUrl: string, config: RequestConfig, method: string): Promise<T> {
  const { headers, content, endpoint, url } = config;

  const finalUrl = url ?? `${baseUrl}${endpoint}`;

  const options: RequestInit = {
    method,
    headers,
    body: formatBody(content),
  };

  const response = await fetch(finalUrl, options);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HTTP ${response.status}: ${error}`);
  }

  const data = await response.json();

  if ("success" in data && data.success === false) {
    throw new Error(`API failure: ${method} ${finalUrl}`);
  }

  return data;
}

// Factory function to create a ServiceClient with a base_url
export function createServiceClient(baseUrl: string) {
  return {
    get: <T = any>(config: Omit<RequestConfig, "method">) =>
      request<T>(baseUrl, { ...config}, "GET"),

    post: <T = any>(config: Omit<RequestConfig, "method">) =>
      request<T>(baseUrl, { ...config}, "POST"),

    delete: <T = any>(config: Omit<RequestConfig, "method">) =>
      request<T>(baseUrl, { ...config}, "DELETE"),
  };
}
