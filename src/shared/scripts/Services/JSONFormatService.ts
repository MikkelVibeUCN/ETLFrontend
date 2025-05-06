import { createServiceClient } from "./ServiceClient";
import { formatHeaders, simplifyJsonStructure } from "../utils/formatter";

export class JSONFormatService {

  static client = createServiceClient("");

  static async fetchJsonStructure(
    fullUrl: string,
    headers: any[]
  ): Promise<any> {
    try {
      const formattedHeaders = formatHeaders(headers);

      var response = await this.client.get({
        headers: formattedHeaders,
        url: fullUrl
      });
      if(!isValidJson(response)) throw Error("Invalid JSON structure. Ensure URL is correct")

      return simplifyJsonStructure(response)
    } catch (error) {
      throw error;
    }
  }
}



export function isValidJson(value: any): boolean {
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return typeof parsed === 'object' && parsed !== null;
    } catch (e) {
      return false;
    }
  }

  return typeof value === 'object' && value !== null;
}