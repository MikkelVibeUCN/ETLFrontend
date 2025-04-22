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

      return simplifyJsonStructure(response)
    } catch (error) {
      console.error("Failed to fetch JSON:", error);
      throw error;
    }
  }
}