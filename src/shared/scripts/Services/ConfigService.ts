import type { LoadConfig } from "../../../components/Load/loadConfig";
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

    static async validateLoadConfig(config: LoadConfig): Promise<boolean> {
        const endpoint = "Pipeline/validate"
        const options = {
            endpoint: endpoint,
            headers: { "Content-type": "application/json"},
            content: this.mapConfigToContent(config)
        } as RequestConfig
        var result = await ConfigService.client.get(options);
        return result.isValid
    }

    static async loadMetadata(config: LoadConfig): Promise<string[]> {
        const endpoint = "Pipeline/metadata"
        const options = {
            endpoint: endpoint,
            headers: { "Content-type": "application/json"},
            content: this.mapConfigToContent(config)
        } as RequestConfig
        return await ConfigService.client.get(options)
    }

    private static mapConfigToContent(config: LoadConfig) {
        return {
            connectionString: config.TargetInfo.ConnectionString,
            type: config.TargetInfo.$type
        }
    }
}