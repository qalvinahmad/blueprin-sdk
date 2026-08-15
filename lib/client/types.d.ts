/**
 * Types for Blueprin Public API
 */
export interface BlueprinClientOptions {
    apiKey: string;
    baseUrl?: string;
    timeoutMs?: number;
    maxRetries?: number;
    retryDelayMs?: number;
}
export interface PaginationMeta {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
}
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    pagination?: PaginationMeta;
    error?: string;
}
export interface AhsComponent {
    id?: string;
    nama: string;
    kategori: 'MATERIAL' | 'UPAH' | 'ALAT';
    satuan: string;
    koefisien: number;
    harga_satuan: number;
    subtotal: number;
}
export interface AhsItem {
    id: string;
    kode: string;
    nama: string;
    satuan: string;
    kelompok: string;
    total_harga: number;
    total_bahan: number;
    total_upah: number;
    total_alat: number;
    component_count?: number;
    components?: AhsComponent[];
}
export interface ListAhsParams {
    id?: string;
    search?: string;
    kelompok?: string;
    limit?: number;
    offset?: number;
}
export interface PublicMaterial {
    id: string;
    nama: string;
    kategori: 'MATERIAL' | 'UPAH' | 'ALAT';
    satuan: string;
    harga: number;
    spesifikasi?: string;
    kode?: string;
}
export interface ListMaterialsParams {
    id?: string;
    kategori?: 'MATERIAL' | 'UPAH' | 'ALAT' | string;
    search?: string;
    limit?: number;
    offset?: number;
}
export interface PublicRabItem {
    id: string;
    project_id: string;
    uraian: string;
    kategori: string;
    volume: number;
    satuan: string;
    harga_satuan: number;
    total_harga: number;
    kode?: string;
}
export interface ListRabParams {
    project_id: string;
    search?: string;
    kategori?: string;
    limit?: number;
    offset?: number;
}
export interface ApiPlan {
    code: string;
    name: string;
    price_amount: number;
    currency?: string;
    requests_per_day: number;
    requests_per_month: number;
    rate_limit_per_second: number;
    duration_days?: number;
    features?: string[];
}
export interface ApiUsageStats {
    period_days: number;
    total_requests: number;
    success_requests: number;
    failed_requests: number;
    avg_response_time_ms: number;
    by_endpoint?: Record<string, number>;
    by_day?: Array<{
        date: string;
        count: number;
    }>;
}
