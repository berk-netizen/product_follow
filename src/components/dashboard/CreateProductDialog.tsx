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
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm gap-2 rounded-xl">
                    <Plus className="h-4 w-4" />
                    New Product
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-2xl border-border bg-card">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold font-playfair">Create New Product</DialogTitle>
                        <DialogDescription className="text-muted-foreground text-xs">
                            Enter the details of the new production model. It will appear on the Kanban board under &apos;SAMPLE SEWN&apos;.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-6">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="season" className="text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                                Season
                            </Label>
                            <Input
                                id="season"
                                value={formData.season}
                                onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                                className="col-span-3 font-mono h-10 bg-muted/30 border-border focus:ring-emerald-500"
                                placeholder="e.g. SS25"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="code" className="text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                                Model Code
                            </Label>
                            <Input
                                id="code"
                                value={formData.model_code}
                                onChange={(e) => setFormData({ ...formData, model_code: e.target.value })}
                                className="col-span-3 font-mono h-10 bg-muted/30 border-border focus:ring-emerald-500"
                                placeholder="e.g. JCK-102"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                                Model Name
                            </Label>
                            <Input
                                id="name"
                                value={formData.model_name}
                                onChange={(e) => setFormData({ ...formData, model_name: e.target.value })}
                                className="col-span-3 h-10 bg-muted/30 border-border"
                                placeholder="e.g. Winter Puffer"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="manuf" className="text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                                Manufacturer
                            </Label>
                            <Input
                                id="manuf"
                                value={formData.manufacturer}
                                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                                className="col-span-3 h-10 bg-muted/30 border-border"
                                placeholder="e.g. GLOBAL ART"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="date" className="text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                                Target Date
                            </Label>
                            <Input
                                id="date"
                                type="date"
                                value={formData.target_loading_date}
                                onChange={(e) => setFormData({ ...formData, target_loading_date: e.target.value })}
                                className="col-span-3 font-mono h-10 bg-muted/30 border-border text-foreground"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="qty" className="text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                                Planned Qty
                            </Label>
                            <Input
                                id="qty"
                                type="number"
                                value={formData.planned_qty}
                                onChange={(e) => setFormData({ ...formData, planned_qty: parseInt(e.target.value) || 0 })}
                                className="col-span-3 font-mono font-bold h-10 bg-muted/30 border-border"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="supplier" className="text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                                Supplier
                            </Label>
                            <Select onValueChange={(val) => setFormData({ ...formData, supplier_type: val })}>
                                <SelectTrigger className="col-span-3 h-10 bg-muted/30 border-border text-foreground">
                                    <SelectValue placeholder="Select Supplier" />
                                </SelectTrigger>
                                <SelectContent className="bg-popover border-border">
                                    <SelectItem value="Üretici">Üretici</SelectItem>
                                    <SelectItem value="Kumaşçı">Kumaşçı</SelectItem>
                                    <SelectItem value="Aksesuar">Aksesuar</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="deliveryDate" className="text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                                Delivery
                            </Label>
                            <Input
                                id="deliveryDate"
                                type="date"
                                value={formData.delivery_date}
                                onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                                className="col-span-3 font-mono h-10 bg-muted/30 border-border text-foreground"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" className="w-full h-11 bg-primary text-primary-foreground font-semibold rounded-xl">Add to Board</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
