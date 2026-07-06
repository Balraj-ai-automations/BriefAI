import { apiClient } from './client';
import type {
  GenerateCampaignRequest,
  GenerateCampaignResponse,
  HistoryResponse,
  HealthResponse,
} from './types';

export async function generateCampaign(
  req: GenerateCampaignRequest
): Promise<GenerateCampaignResponse> {
  return apiClient.post<GenerateCampaignResponse>('/api/generate', req, {
    timeoutMs: 90000, // 90s — generation can take ~1 min
  });
}

export async function getCampaigns(userId: string): Promise<HistoryResponse> {
  return apiClient.get<HistoryResponse>(`/api/campaigns/${userId}`);
}

export async function checkHealth(): Promise<HealthResponse> {
  return apiClient.get<HealthResponse>('/api/health', { timeoutMs: 15000 });
}
