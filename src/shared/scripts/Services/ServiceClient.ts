const BASE_URL = import.meta.env.VITE_API_BASE_URL;

function formatBody(content: unknown): string | undefined {
  if (content === null || content === undefined) return undefined;
  return typeof content === "string" ? content : JSON.stringify(content);
}

export interface RequestConfig {
  method: "GET" | "POST" | "DELETE";
  headers: Record<string, string>;
  content?: any;
  endpoint?: string; // Optional when full URL is used
  url?: string; // Full URL shortcut
}

async function request<T = any>(config: RequestConfig): Promise<T> {
  const {
    method,
    headers,
    content,
    endpoint,
    url,
  } = config;

  const finalUrl = url ?? `${BASE_URL}${endpoint}`;

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

// CRD
export const ServiceClient = {
  get: <T = any>(config: Omit<RequestConfig, "method">) =>
    request<T>({ ...config, method: "GET" }),

  post: <T = any>(config: Omit<RequestConfig, "method">) =>
    request<T>({ ...config, method: "POST" }),

  delete: <T = any>(config: Omit<RequestConfig, "method">) =>
    request<T>({ ...config, method: "DELETE" }),
};