"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ProductionItem } from "@/types"
import { Plus } from "lucide-react"

interface CreateProductDialogProps {
    onAdd: (item: Partial<ProductionItem>) => void
}

export function CreateProductDialog({ onAdd }: CreateProductDialogProps) {
    const [open, setOpen] = useState(false)
    const [formData, setFormData] = useState({
        season: "",
        model_code: "",
        model_name: "",
        manufacturer: "",
        target_loading_date: "",
        planned_qty: 0,
        supplier_type: "" as any,
        delivery_date: ""
    })


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onAdd(formData)
        setOpen(false)
        setFormData({
            season: "",
            model_code: "",
            model_name: "",
            manufacturer: "",
            target_loading_date: "",
            planned_qty: 0,
            supplier_type: "",
            delivery_date: ""
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-kntlgy-blue hover:bg-kntlgy-blue/90 text-white shadow-sm gap-2">
                    <Plus className="h-4 w-4" />
                    New Product
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create New Product</DialogTitle>
                        <DialogDescription>
                            Enter the details of the new production model. It will appear on the Kanban board under &apos;SAMPLE SEWN&apos;.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="season" className="text-right text-xs uppercase tracking-wider text-slate-500">
                                Season
                            </Label>
                            <Input
                                id="season"
                                value={formData.season}
                                onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                                className="col-span-3 font-mono"
                                placeholder="e.g. SS25"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="code" className="text-right text-xs uppercase tracking-wider text-slate-500">
                                Model Code
                            </Label>
                            <Input
                                id="code"
                                value={formData.model_code}
                                onChange={(e) => setFormData({ ...formData, model_code: e.target.value })}
                                className="col-span-3 font-mono"
                                placeholder="e.g. JCK-102"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right text-xs uppercase tracking-wider text-slate-500">
                                Model Name
                            </Label>
                            <Input
                                id="name"
                                value={formData.model_name}
                                onChange={(e) => setFormData({ ...formData, model_name: e.target.value })}
                                className="col-span-3"
                                placeholder="e.g. Winter Puffer"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="manuf" className="text-right text-xs uppercase tracking-wider text-slate-500">
                                Manufacturer
                            </Label>
                            <Input
                                id="manuf"
                                value={formData.manufacturer}
                                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                                className="col-span-3"
                                placeholder="e.g. GLOBAL ART"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="date" className="text-right text-xs uppercase tracking-wider text-slate-500">
                                Target Date
                            </Label>
                            <Input
                                id="date"
                                type="date"
                                value={formData.target_loading_date}
                                onChange={(e) => setFormData({ ...formData, target_loading_date: e.target.value })}
                                className="col-span-3 font-mono text-slate-700"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="qty" className="text-right text-xs uppercase tracking-wider text-slate-500">
                                Planned Qty
                            </Label>
                            <Input
                                id="qty"
                                type="number"
                                value={formData.planned_qty}
                                onChange={(e) => setFormData({ ...formData, planned_qty: parseInt(e.target.value) || 0 })}
                                className="col-span-3 font-mono font-bold"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="supplier" className="text-right text-xs uppercase tracking-wider text-slate-500">
                                Tedarikçi Tipi
                            </Label>
                            <Select onValueChange={(val) => setFormData({ ...formData, supplier_type: val })}>
                                <SelectTrigger className="col-span-3 text-slate-700">
                                    <SelectValue placeholder="Tedarikçi Seçin" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Üretici">Üretici</SelectItem>
                                    <SelectItem value="Kumaşçı">Kumaşçı</SelectItem>
                                    <SelectItem value="Aksesuar">Aksesuar</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="deliveryDate" className="text-right text-xs uppercase tracking-wider text-slate-500">
                                Teslimat Tar.
                            </Label>
                            <Input
                                id="deliveryDate"
                                type="date"
                                value={formData.delivery_date}
                                onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                                className="col-span-3 font-mono text-slate-700"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" className="w-full bg-kntlgy-blue hover:bg-kntlgy-blue/90 text-white">Add to Board</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
