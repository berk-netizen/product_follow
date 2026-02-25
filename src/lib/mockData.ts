import { supabase } from '../utils/supabase';
import { ProductionItem, ProductMaterial, ProductLaborCost } from '../types';

// Supabase Service Functions

export const getProductionItems = async (): Promise<ProductionItem[]> => {
    const { data, error } = await supabase
        .from('production_items')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching production items:', error);
        return [];
    }
    return data as ProductionItem[];
};

export const getProductionItemById = async (id: string): Promise<ProductionItem | undefined> => {
    const { data, error } = await supabase
        .from('production_items')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching production item by ID:', error);
        return undefined;
    }
    return data as ProductionItem;
};

export const createProductionItem = async (item: Partial<ProductionItem>): Promise<ProductionItem | undefined> => {
    const { data, error } = await supabase
        .from('production_items')
        .insert([item])
        .select()
        .single();

    if (error) {
        console.error('Supabase error creating production item:', error);
        // Show the exact error to help diagnose
        alert(`Supabase Hatası:\nKod: ${error.code}\nMesaj: ${error.message}\nDetay: ${error.details}`);
        return undefined;
    }
    return data as ProductionItem;
};


export const getProductMaterials = async (productId: string): Promise<ProductMaterial[]> => {
    const { data, error } = await supabase
        .from('product_materials')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching product materials:', error);
        return [];
    }
    return data as ProductMaterial[];
};

export const getProductLaborCosts = async (productId: string): Promise<ProductLaborCost[]> => {
    const { data, error } = await supabase
        .from('product_labor_costs')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching product labor costs:', error);
        return [];
    }
    return data as ProductLaborCost[];
};

export const updateProductionItem = async (id: string, updates: Partial<ProductionItem>): Promise<ProductionItem | undefined> => {
    const { data, error } = await supabase
        .from('production_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating production item:', error);
        return undefined;
    }
    return data as ProductionItem;
};

// For Materials and Labor, we'll implement a "Sync" logic: 
// It will UPSERT items that have a valid UUID, and DELETE items that are no longer in the list.
// However, to keep it simple and matching the previous mock behavior (replace all),
// we will DELETE children first and then INSERT the new list.
// WARNING: This is less efficient than upserting but matches the current client-side state model.

export const updateProductMaterials = async (productId: string, newMaterials: ProductMaterial[]): Promise<ProductMaterial[]> => {
    // 1. Delete all existing materials for this product
    const { error: deleteError } = await supabase
        .from('product_materials')
        .delete()
        .eq('product_id', productId);

    if (deleteError) {
        console.error('Error deleting old materials:', deleteError);
        throw deleteError;
    }

    // 2. Prepare materials for insertion (remove IDs if they are temporary client-side strings)
    const materialsToInsert = newMaterials.map(({ id, ...rest }) => {
        // If the ID is a transient client-side ID (doesn't look like a UUID), let Supabase generate it
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
        return isUUID ? { id, ...rest } : rest;
    });

    if (materialsToInsert.length === 0) return [];

    // 3. Insert new materials
    const { data, error: insertError } = await supabase
        .from('product_materials')
        .insert(materialsToInsert)
        .select();

    if (insertError) {
        console.error('Error inserting new materials:', insertError);
        throw insertError;
    }

    return data as ProductMaterial[];
};

export const updateProductLaborCosts = async (productId: string, newLaborCosts: ProductLaborCost[]): Promise<ProductLaborCost[]> => {
    // 1. Delete all existing labor costs for this product
    const { error: deleteError } = await supabase
        .from('product_labor_costs')
        .delete()
        .eq('product_id', productId);

    if (deleteError) {
        console.error('Error deleting old labor costs:', deleteError);
        throw deleteError;
    }

    // 2. Prepare labor costs for insertion
    const laborToInsert = newLaborCosts.map(({ id, ...rest }) => {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
        return isUUID ? { id, ...rest } : rest;
    });

    if (laborToInsert.length === 0) return [];

    // 3. Insert new labor costs
    const { data, error: insertError } = await supabase
        .from('product_labor_costs')
        .insert(laborToInsert)
        .select();

    if (insertError) {
        console.error('Error inserting new labor costs:', insertError);
        throw insertError;
    }

    return data as ProductLaborCost[];
};
