import type { PublicMaterial, ListMaterialsParams, ApiResponse } from './types.js';
export declare class MaterialsClient {
    private requestFn;
    constructor(requestFn: <T>(endpoint: string, params?: Record<string, any>) => Promise<ApiResponse<T>>);
    /**
     * List or search materials, labor (upah), or tools (alat)
     */
    list(params?: ListMaterialsParams): Promise<ApiResponse<PublicMaterial[]>>;
    /**
     * Get single material/item by ID
     */
    getById(id: string): Promise<ApiResponse<PublicMaterial>>;
    /**
     * Shortcut to list labor (upah)
     */
    listLabor(params?: Omit<ListMaterialsParams, 'kategori'>): Promise<ApiResponse<PublicMaterial[]>>;
    /**
     * Shortcut to list tools/equipment (alat)
     */
    listTools(params?: Omit<ListMaterialsParams, 'kategori'>): Promise<ApiResponse<PublicMaterial[]>>;
}
