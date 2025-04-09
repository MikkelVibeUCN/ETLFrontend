import type { PipelineConfig } from "../PipelineConfig";
import { createServiceClient, type RequestConfig } from "./ServiceClient";

export class ConfigService {
    private static baseUrl = "http://localhost:5015/api/";

    static client = createServiceClient(this.baseUrl);

    static async getAllConfigs(): Promise<PipelineConfig[]> {
        const endpoint = "Pipeline"
        const options  = {
            endpoint: endpoint,
            headers: { accept: "text/plain" }
        } as RequestConfig
        var response = await ConfigService.client.get(options)

        return response as PipelineConfig[];
    }

    static async getConfig(id: string): Promise<PipelineConfig>{
        const endpoint = `Pipeline/${id}`
        const options = {
            endpoint: endpoint
        } as RequestConfig
        var response = await ConfigService.client.get(options)
        
        return response as PipelineConfig
    }

    static async saveConfig(config: PipelineConfig) {
        const endpoint = "Pipeline"
        const options = {
            endpoint: endpoint,
            content: config
        } as RequestConfig
        await ConfigService.client.post(options)
    }
}