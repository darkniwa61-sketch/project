import { InventoryTable } from "@/components/ui/inventory-table";

export default function InventoryPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#2d2621]">Inventory</h1>
        <p className="text-sm text-[#78716c] mt-1">Manage your stock levels, add new items, and track inventory across warehouses.</p>
      </div>

      <InventoryTable />
    </div>
  );
}
