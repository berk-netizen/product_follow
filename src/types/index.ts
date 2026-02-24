export type Status = 'SAMPLE SEWN' | 'WAITING FABRIC' | 'IN CUTTING' | 'IN SEWING' | 'IRON/PACK' | 'IN WAREHOUSE' | 'SHIPPED';

export interface ProductionItem {
    id: string;
    season: string;
    model_code: string;
    model_name: string;
    category: string;
    manufacturer: string;
    status: Status;
    sizes_breakdown: Record<string, number>;
    target_loading_date: string;
    po_date: string;
    fabric_arrival_date: string | null;
    cutting_date: string | null;
    actual_mfg_deadline: string | null;
    image_url: string | null;
    fabric_supplier: string | null;
    fabric_quality: string | null;
    fabric_composition: string | null;
    lining_detail: string | null;
    color_name: string | null;
    color_code: string | null;
    fabric_order_status: 'MANUFACTURER WAREHOUSE' | 'PENDING' | 'ORDERED' | 'DELIVERED';
    planned_qty: number;
    received_qty: number;
    target_sales_price: number;
    final_sales_price_tl: number;
    created_at: string;
}

export interface ProductMaterial {
    id: string;
    product_id: string;
    material_type: string;
    supplier: string;
    quality: string;
    unit_consumption: number;
    unit_price: number;
    waste_rate: number;
    total_amount: number;
    order_status: 'OK' | 'PENDING';
    notes: string | null;
}

export interface ProductLaborCost {
    id: string;
    product_id: string;
    operation_name: string;
    cost_amount: number;
}
