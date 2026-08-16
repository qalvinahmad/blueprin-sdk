import type { PublicRabItem, ListRabParams, ApiResponse } from './types.js';

export class RabClient {
  constructor(private requestFn: <T>(endpoint: string, params?: Record<string, any>) => Promise<ApiResponse<T>>) {}

  /**
   * List budget plan (RAB - Rencana Anggaran Biaya) items for a specific project
   */
  async getByProjectId(projectId: string, params?: Omit<ListRabParams, 'project_id'>): Promise<ApiResponse<PublicRabItem[]>> {
    return this.requestFn<PublicRabItem[]>('/api/public/rab', { ...params, project_id: projectId });
  }
}
