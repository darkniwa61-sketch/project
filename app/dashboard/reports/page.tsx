import { ReportsView } from "@/components/ui/reports-view";

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#2d2621]">Reports</h1>
        <p className="text-sm text-[#78716c] mt-1">Track all inventory activity, product changes, and user login history.</p>
      </div>

      <ReportsView />
    </div>
  );
}
