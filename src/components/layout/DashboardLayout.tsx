"use client";

import { ReactNode } from "react";
import { DataSyncProvider } from "../DataSyncProvider";
import { SyncStatus } from "../ui/SyncStatus";
import { Sidebar } from "./Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <DataSyncProvider>
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <div className="mb-4">
              <SyncStatus />
            </div>
            {children}
          </main>
        </div>
      </div>
    </DataSyncProvider>
  );
}
