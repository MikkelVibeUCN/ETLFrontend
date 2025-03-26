export async function fetchJsonWithHeaders(
    url: string,
    headers: Record<string, string>
): Promise<any> {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: headers,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to fetch JSON:', error);
        throw error;
    }
}


export function formatHeaders(
    headers: HeaderItem[]
): Record<string, string> {
    const newHeaders: Record<string, string> = {};

    headers.forEach(element => {
        if (element.extra && element.extra !== "") {
            newHeaders[element.key] = `${element.value} ${element.extra}`;
        } else {
            newHeaders[element.key] = element.value;
        }
    });

    return newHeaders;
}

type HeaderItem = {
    key: string;
    value: string;
    extra?: string;
};

export function simplifyJsonStructure(json: any): any {
    const firstItem = Array.isArray(json.results) && json.results.length > 0 ? json.results[0] : null;
  
    return {
      results: firstItem
        ? [
            {
              id: typeof firstItem.id === "number" ? "number" : typeof firstItem.id,
              adult:
                typeof firstItem.adult === "boolean" || firstItem.adult === null
                  ? "bool"
                  : typeof firstItem.adult,
            },
            "..."
          ]
        : [],
      page: typeof json.page === "number" ? "number" : typeof json.page,
      total_pages: typeof json.total_pages === "number" ? "number" : typeof json.total_pages,
      total_results: typeof json.total_results === "number" ? "number" : typeof json.total_results,
    };
  }
  
  