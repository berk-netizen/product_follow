import { ProductionItem, ProductMaterial, ProductLaborCost } from '../types';

export const MOCK_PRODUCTION_ITEMS: ProductionItem[] = [
    {
        id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        season: 'SS25',
        model_code: 'MDL-001',
        model_name: 'Summer Breeze Dress',
        category: 'Dresses',
        manufacturer: 'MACHINIST',
        status: 'IN CUTTING',
        sizes_breakdown: { 'S': 50, 'M': 100, 'L': 50 },
        target_loading_date: '2024-05-15',
        po_date: '2024-02-01',
        fabric_arrival_date: '2024-03-01',
        cutting_date: '2024-03-15',
        actual_mfg_deadline: '2024-05-01',
        image_url: '/summer_breeze.png',
        fabric_supplier: 'GAYRET TEKSTİL',
        fabric_quality: 'SAN FRANCISCO',
        fabric_composition: '%45 Wool, %55 Polyester',
        lining_detail: 'TWILL',
        color_name: 'NAVY BLUE',
        color_code: '450',
        fabric_order_status: 'PENDING',
        planned_qty: 200,
        received_qty: 0,
        target_sales_price: 89.99,
        final_sales_price_tl: 2850.00,
        created_at: '2024-02-15T12:00:00Z',
    },
    {
        id: 'b1234567-89ab-cdef-0123-456789abcdef',
        season: 'AW24',
        model_code: 'JCK-102',
        model_name: 'Winter Puffer Jacket',
        category: 'Outerwear',
        manufacturer: 'GLOBAL ART',
        status: 'WAITING FABRIC',
        sizes_breakdown: { 'M': 150, 'L': 150, 'XL': 50 },
        target_loading_date: '2024-09-01',
        po_date: '2024-01-20',
        fabric_arrival_date: null,
        cutting_date: null,
        actual_mfg_deadline: '2024-08-15',
        image_url: null,
        fabric_supplier: 'SÖKTAŞ',
        fabric_quality: 'MALDIVE',
        fabric_composition: '100% ORG COTTON',
        lining_detail: '40/1 POPLIN',
        color_name: 'BLACK',
        color_code: '800',
        fabric_order_status: 'ORDERED',
        planned_qty: 350,
        received_qty: 0,
        target_sales_price: 149.99,
        final_sales_price_tl: 4500.00,
        created_at: '2024-01-25T09:30:00Z',
    },
    {
        id: 'c2345678-9abc-def0-1234-56789abcdef0',
        season: 'SS25',
        model_code: 'TSH-505',
        model_name: 'Basic Cotton Tee',
        category: 'T-Shirts',
        manufacturer: 'MACHINIST',
        status: 'SAMPLE SEWN',
        sizes_breakdown: { 'XS': 100, 'S': 200, 'M': 300, 'L': 200, 'XL': 100 },
        target_loading_date: '2024-04-10',
        po_date: '2023-12-15',
        fabric_arrival_date: '2024-01-10',
        cutting_date: null,
        actual_mfg_deadline: '2024-03-25',
        image_url: null,
        fabric_supplier: 'GAYRET TEKSTİL',
        fabric_quality: 'SINGLE JERSEY',
        fabric_composition: '100% Cotton',
        lining_detail: 'N/A',
        color_name: 'WHITE',
        color_code: '01',
        fabric_order_status: 'DELIVERED',
        planned_qty: 900,
        received_qty: 0,
        target_sales_price: 24.99,
        final_sales_price_tl: 750.00,
        created_at: '2023-12-20T14:15:00Z',
    }
];

export const MOCK_MATERIALS: Record<string, ProductMaterial[]> = {
    'f47ac10b-58cc-4372-a567-0e02b2c3d479': [
        {
            id: 'm1',
            product_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
            material_type: 'Main Fabric',
            supplier: 'Fabric Co. Ltd',
            quality: '100% Cotton Poplin',
            unit_consumption: 1.5,
            unit_price: 4.50,
            waste_rate: 0.03, // 3%
            total_amount: (1.5 * 4.50) * 1.03,
            order_status: 'OK',
            notes: null
        },
        {
            id: 'm2',
            product_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
            material_type: 'Brand Label',
            supplier: 'Labels Inc',
            quality: 'Woven',
            unit_consumption: 1,
            unit_price: 0.15,
            waste_rate: 0.01,
            total_amount: (1 * 0.15) * 1.01,
            order_status: 'PENDING',
            notes: null
        }
    ]
};

export const MOCK_LABOR_COSTS: Record<string, ProductLaborCost[]> = {
    'f47ac10b-58cc-4372-a567-0e02b2c3d479': [
        {
            id: 'l1',
            product_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
            operation_name: 'PATTERN',
            cost_amount: 1.20
        },
        {
            id: 'l2',
            product_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
            operation_name: 'CM (CUT+MAKE+FINISH)',
            cost_amount: 4.50
        },
        {
            id: 'l3',
            product_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
            operation_name: 'LOGISTICS',
            cost_amount: 0.80
        }
    ]
};

// Mock service functions
export const getProductionItems = async (): Promise<ProductionItem[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_PRODUCTION_ITEMS), 400));
};

export const getProductionItemById = async (id: string): Promise<ProductionItem | undefined> => {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_PRODUCTION_ITEMS.find(item => item.id === id)), 400));
};

export const getProductMaterials = async (productId: string): Promise<ProductMaterial[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_MATERIALS[productId] || []), 300));
};

export const getProductLaborCosts = async (productId: string): Promise<ProductLaborCost[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_LABOR_COSTS[productId] || []), 300));
};
