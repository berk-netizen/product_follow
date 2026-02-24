import { getProductionItemById, getProductMaterials, getProductLaborCosts } from "@/lib/mockData";
import { notFound } from "next/navigation";
import CostingFormClient from "@/components/costing/CostingFormClient";

interface CostingPageProps {
    params: {
        locale: string;
        id: string;
    };
}

export default async function CostingPage({ params: { id } }: CostingPageProps) {
    // Mock Data fetching passing to client component
    // In real app, this would use Supabase Server Client
    const product = await getProductionItemById(id);

    if (!product) {
        notFound();
    }

    const materials = await getProductMaterials(id);
    const laborCosts = await getProductLaborCosts(id);

    return (
        <div className="max-w-6xl mx-auto py-6">
            <CostingFormClient
                initialProduct={product}
                initialMaterials={materials}
                initialLaborCosts={laborCosts}
            />
        </div>
    );
}
