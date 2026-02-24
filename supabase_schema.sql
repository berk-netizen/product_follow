-- product_follow db schema

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table 1: production_items
CREATE TABLE IF NOT EXISTS production_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    season TEXT NOT NULL,
    model_code TEXT NOT NULL,
    model_name TEXT NOT NULL,
    category TEXT,
    manufacturer TEXT,
    status TEXT CHECK (status IN ('SAMPLE SEWN', 'WAITING FABRIC', 'IN CUTTING', 'IN SEWING', 'IRON/PACK', 'IN WAREHOUSE', 'SHIPPED')) NOT NULL DEFAULT 'SAMPLE SEWN',
    sizes_breakdown JSONB DEFAULT '{}'::jsonb,
    target_loading_date DATE,
    po_date DATE,
    fabric_arrival_date DATE,
    cutting_date DATE,
    actual_mfg_deadline DATE,
    image_url TEXT,
    fabric_supplier TEXT,
    fabric_quality TEXT,
    fabric_composition TEXT,
    lining_detail TEXT,
    color_name TEXT,
    color_code TEXT,
    fabric_order_status TEXT CHECK (fabric_order_status IN ('MANUFACTURER WAREHOUSE', 'PENDING', 'ORDERED', 'DELIVERED')) DEFAULT 'PENDING',
    planned_qty INTEGER DEFAULT 0,
    received_qty INTEGER DEFAULT 0,
    target_sales_price DECIMAL(10, 2) DEFAULT 0.00,
    final_sales_price_tl DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table 2: product_materials
CREATE TABLE IF NOT EXISTS product_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES production_items(id) ON DELETE CASCADE,
    material_type TEXT NOT NULL,
    supplier TEXT,
    quality TEXT,
    unit_consumption DECIMAL(10, 4) DEFAULT 0.0000,
    unit_price DECIMAL(10, 4) DEFAULT 0.0000,
    waste_rate DECIMAL(5, 4) DEFAULT 0.0300,
    -- total_amount will be calculated at insert/update trigger or client-side, typically best stored if queried often
    total_amount DECIMAL(10, 4) DEFAULT 0.0000,
    order_status TEXT DEFAULT 'PENDING' CHECK (order_status IN ('OK', 'PENDING')),
    notes TEXT
);

-- Function and trigger to auto-calculate total_amount for product_materials
CREATE OR REPLACE FUNCTION calculate_material_total()
RETURNS TRIGGER AS $$
BEGIN
    NEW.total_amount := (NEW.unit_price * NEW.unit_consumption) * (1 + NEW.waste_rate);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_calculate_material_total ON product_materials;
CREATE TRIGGER trg_calculate_material_total
BEFORE INSERT OR UPDATE ON product_materials
FOR EACH ROW
EXECUTE FUNCTION calculate_material_total();


-- Table 3: product_labor_costs
CREATE TABLE IF NOT EXISTS product_labor_costs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES production_items(id) ON DELETE CASCADE,
    operation_name TEXT NOT NULL,
    cost_amount DECIMAL(10, 2) DEFAULT 0.00
);

-- Indexing for common queries
CREATE INDEX IF NOT EXISTS idx_materials_product_id ON product_materials(product_id);
CREATE INDEX IF NOT EXISTS idx_labor_product_id ON product_labor_costs(product_id);
CREATE INDEX IF NOT EXISTS idx_production_status ON production_items(status);
