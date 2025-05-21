/**
 * Formats request body content to string if needed
 */
function formatBody(content: unknown): string | undefined {
  if (content === null || content === undefined) return undefined;
  return typeof content === "string" ? content : JSON.stringify(content);
}

/**
 * Custom error class with additional request context
 */
export class ApiError extends Error {
  status: number;
  method: string;
  url: string;
  responseBody: string;
  requestBody?: string;

  constructor(message: string, status: number, method: string, url: string, responseBody: string, requestBody?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.method = method;
    this.url = url;
    this.responseBody = responseBody;
    this.requestBody = requestBody;
  }

  /**
   * Returns a descriptive error message with context
   */
  get fullErrorMessage(): string {
    let msg = `API Error (${this.status}) on ${this.method} ${this.url}: ${this.message}`;
    
    if (this.responseBody) {
      try {
        const parsed = JSON.parse(this.responseBody);
        msg += `\nResponse: ${JSON.stringify(parsed, null, 2)}`;
      } catch {
        msg += `\nResponse: ${this.responseBody}`;
      }
    }
    
    return msg;
  }
}

export interface RequestConfig {
  headers?: Record<string, string>;
  content?: any;
  endpoint?: string; // Optional when full URL is used
  url?: string; // Full URL shortcut
  timeout?: number; // Optional timeout in milliseconds
}

/**
 * Makes an HTTP request with comprehensive error handling
 */
async function request<T = any>(baseUrl: string, config: RequestConfig, method: string): Promise<T> {
  const { headers = {}, content, endpoint, url, timeout } = config;
  
  // Validate URL configuration
  if (!url && !endpoint) {
    throw new Error("Either 'url' or 'endpoint' must be provided");
  }
  
  let finalUrl = url ?? `${baseUrl}${endpoint}`;

  if (method === 'GET') {
    const timestamp = `_=${Date.now()}`;
    finalUrl += finalUrl.includes('?') ? `&${timestamp}` : `?${timestamp}`;
  }

  const formattedBody = formatBody(content);
  
  // Prepare request options
  const options: RequestInit = {
    method,
    headers: {
      ...headers,
      // Add JSON content-type header if sending content and not already specified
      ...(formattedBody && !headers['content-type'] ? 
          { 'content-type': 'application/json' } : {})
    },
    body: formattedBody,
  };

  try {
    // Handle timeout if specified
    let timeoutId: number | undefined;
    const fetchPromise = fetch(finalUrl, options);
    
    const response = await (timeout ? Promise.race([
      fetchPromise,
      new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new ApiError(
            "Request timed out", 
            0, 
            method, 
            finalUrl, 
            "Timeout", 
            formattedBody
          ));
        }, timeout) as unknown as number; // Type cast for browser compatibility
      })
    ]) : fetchPromise) as Response;
    
    // Clear timeout if it was set
    if (timeoutId) clearTimeout(timeoutId);

    // Handle non-success responses
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}`;
      
      // Try to parse error response as JSON to extract any error message
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.message || errorJson.error) {
          errorMessage += `: ${errorJson.message || errorJson.error}`;
        } else if (errorJson.errors && Array.isArray(errorJson.errors)) {
          errorMessage += `: ${errorJson.errors.join(', ')}`;
        }
      } catch {
        // If not JSON or no message field, use the raw text
        if (errorText.trim()) {
          errorMessage += `: ${errorText.trim().substring(0, 100)}${errorText.length > 100 ? '...' : ''}`;
        }
      }
      
      throw new ApiError(
        errorMessage,
        response.status,
        method,
        finalUrl,
        errorText,
        formattedBody
      );
    }

    // Process successful response
    const contentType = response.headers.get("content-type") || '';
    
    // Handle JSON responses
    if (contentType.includes("application/json")) {
      const data = await response.json();
      
      // Handle API-level errors that still return 200 OK
      if ("success" in data && data.success === false) {
        const errorMessage = data.message || data.error || 'API returned success: false';
        throw new ApiError(
          errorMessage,
          response.status,
          method,
          finalUrl,
          JSON.stringify(data),
          formattedBody
        );
      }
      
      return data;
    }
    // Handle non-JSON responses
    const textData = await response.text();
    return textData as unknown as T;
    
  } catch (error) {
    // Convert network errors to ApiErrors with more context
    if (!(error instanceof ApiError)) {
      throw new ApiError(
        error instanceof Error ? error.message : String(error),
        0,  // Status 0 indicates a network/client error
        method,
        finalUrl,
        error instanceof Error ? error.stack || error.message : String(error),
        formattedBody
      );
    }
    throw error;
  }
}

export function createServiceClient(baseUrl: string) {
  return {
    get: <T = any>(config: Omit<RequestConfig, "method">) =>
      request<T>(baseUrl, { ...config }, "GET"),
    post: <T = any>(config: Omit<RequestConfig, "method">) =>
      request<T>(baseUrl, { ...config }, "POST"),
    delete: <T = any>(config: Omit<RequestConfig, "method">) =>
      request<T>(baseUrl, { ...config }, "DELETE"),
    put: <T = any>(config: Omit<RequestConfig, "method">) =>
      request<T>(baseUrl, { ...config }, "PUT"),
  };
}