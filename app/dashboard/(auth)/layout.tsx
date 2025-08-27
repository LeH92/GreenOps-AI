import React from "react";
import { cookies } from "next/headers";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/sidebar/app-sidebar";
import { SiteHeader } from "@/components/layout/header";
import { DashboardAuthWrapper } from "@/components/dashboard/dashboard-auth-wrapper";

export default async function AuthLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const defaultOpen =
    cookieStore.get("sidebar_state")?.value === "true" ||
    cookieStore.get("sidebar_state") === undefined;

  return (
    <DashboardAuthWrapper>
      <SidebarProvider
        defaultOpen={defaultOpen}
        style={
          {
            "--sidebar-width": "16rem",
            "--sidebar-width-icon": "3rem",
            "--header-height": "3.5rem"
          } as React.CSSProperties
        }>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col min-h-screen">
            <div className="@container/main flex-1 px-2 pt-0 pb-6 xl:group-data-[theme-content-layout=centered]/layout:container xl:group-data-[theme-content-layout=centered]/layout:mx-auto">
              {children}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </DashboardAuthWrapper>
  );
}