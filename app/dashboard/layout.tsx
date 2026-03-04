import { AppSidebar } from "@/components/ui/app-sidebar"
import { DashboardHeader } from "@/components/ui/dashboard-header"
import { NotificationProvider } from "@/components/providers/notification-provider"
import { InventoryProvider } from "@/components/providers/inventory-provider"
import { ActivityProvider } from "@/components/providers/activity-provider"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <NotificationProvider>
      <ActivityProvider>
        <InventoryProvider>
          <div className="flex h-screen w-full bg-[#fafafa]">
            <AppSidebar />
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <DashboardHeader />
              <main className="flex-1 overflow-y-auto px-6 py-8 md:px-8">
                {children}
              </main>
            </div>
          </div>
        </InventoryProvider>
      </ActivityProvider>
    </NotificationProvider>
  )
}
