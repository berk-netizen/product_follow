import { Status } from "@/types";
import { differenceInDays, parseISO, isPast } from "date-fns";

export type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export const getDeadlineBadge = (targetDate: string | null, status: Status): { text: string, variant: 'default' | 'destructive' | 'secondary', colorClass: string } | null => {
    if (!targetDate) return null;

    if (status === 'SHIPPED') {
        return null;
    }

    const date = parseISO(targetDate);
    const inPast = isPast(date);
    const diffDays = Math.abs(differenceInDays(date, new Date()));

    if (inPast) {
        return {
            text: `Delayed by ${diffDays} Days`,
            variant: "destructive",
            colorClass: "bg-red-50 text-red-600 border-red-200"
        }
    }

    if (diffDays <= 7) {
        return {
            text: `${diffDays} Days Left`,
            variant: "default",
            colorClass: "bg-yellow-50 text-yellow-600 border-yellow-200"
        }
    }

    return {
        text: `${diffDays} Days Left`,
        variant: "secondary",
        colorClass: "bg-emerald-50 text-emerald-600 border-emerald-200"
    }

}

export const getMaterialAlertBadge = (status: string, cuttingDate: string | null): { text: string, variant: 'default' | 'destructive' | 'secondary', colorClass: string } | null => {
    if (status === 'DELIVERED') return null;

    if (status === 'MANUFACTURER WAREHOUSE') {
        return {
            text: "In Warehouse",
            variant: "secondary",
            colorClass: "bg-blue-50 text-blue-600 border-blue-200"
        }
    }

    if (cuttingDate) {
        const cutDate = parseISO(cuttingDate);
        const diffDays = differenceInDays(cutDate, new Date());

        if (diffDays <= 3) {
            return {
                text: status === 'PENDING' ? "Fabric Not Ordered!" : "Fabric Not Arrived!",
                variant: "destructive",
                colorClass: "bg-red-50 text-red-600 border-red-200 animate-pulse"
            }
        }
    }

    if (status === 'ORDERED') {
        return {
            text: "Fabric Ordered",
            variant: "secondary",
            colorClass: "bg-orange-50 text-orange-600 border-orange-200"
        }
    }

    return {
        text: "Fabric Pending",
        variant: "secondary",
        colorClass: "bg-slate-50 text-slate-400 border-slate-200"
    }
}
