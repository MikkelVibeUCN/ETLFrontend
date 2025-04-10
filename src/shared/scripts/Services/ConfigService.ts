import type { PipelineConfig } from "../PipelineConfig";
import { createServiceClient, type RequestConfig } from "./ServiceClient";

export class ConfigService {
    private static baseUrl = "https://localhost:7027/api/";

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
            content: config,
            headers: { "Content-type": "application/json" }
        } as RequestConfig
        await ConfigService.client.post(options)
    }

    static async updateConfig(id: string, newConfig: PipelineConfig) {
        const endpoint = `Pipeline/${id}`
        const options = {
            endpoint: endpoint,
            content: newConfig,
            headers: { "Content-type": "application/json"}
        } as RequestConfig
        await ConfigService.client.put(options);
    }
}