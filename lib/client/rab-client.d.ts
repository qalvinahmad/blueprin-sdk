import type { PublicRabItem, ListRabParams, ApiResponse } from './types.js';
export declare class RabClient {
    private requestFn;
    constructor(requestFn: <T>(endpoint: string, params?: Record<string, any>) => Promise<ApiResponse<T>>);
    /**
     * List RAB items for a specific project
     */
    getByProjectId(projectId: string, params?: Omit<ListRabParams, 'project_id'>): Promise<ApiResponse<PublicRabItem[]>>;
}
