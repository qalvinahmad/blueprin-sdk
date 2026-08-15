import type { PublicMaterial, ListMaterialsParams, ApiResponse } from './types.js';

export class MaterialsClient {
  constructor(private requestFn: <T>(endpoint: string, params?: Record<string, any>) => Promise<ApiResponse<T>>) {}

  /**
   * List or search materials, labor (upah), or tools (alat)
   */
  async list(params?: ListMaterialsParams): Promise<ApiResponse<PublicMaterial[]>> {
    return this.requestFn<PublicMaterial[]>('/api/public/materials', params);
  }

  /**
   * Get single material/item by ID
   */
  async getById(id: string): Promise<ApiResponse<PublicMaterial>> {
    return this.requestFn<PublicMaterial>('/api/public/materials', { id });
  }

  /**
   * Shortcut to list labor (upah)
   */
  async listLabor(params?: Omit<ListMaterialsParams, 'kategori'>): Promise<ApiResponse<PublicMaterial[]>> {
    return this.list({ ...params, kategori: 'UPAH' });
  }

  /**
   * Shortcut to list tools/equipment (alat)
   */
  async listTools(params?: Omit<ListMaterialsParams, 'kategori'>): Promise<ApiResponse<PublicMaterial[]>> {
    return this.list({ ...params, kategori: 'ALAT' });
  }
}
