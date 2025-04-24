import { createServiceClient, type RequestConfig } from "./ServiceClient";

export class ExtractService {
    private static baseUrl = "https://localhost:7087/api/";

    static client = createServiceClient(this.baseUrl);

    static async startPipeline(configId: string) {
        const endpoint = `extract/${configId}`
        const options = {
            endpoint: endpoint,
        } as RequestConfig
        await this.client.post(options)
    }
}