import { AppSidebar } from "@/components/sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

function DashboardLayout({ children }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className='px-10 py-5 flex flex-col gap-5'>
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}

export default DashboardLayout;
