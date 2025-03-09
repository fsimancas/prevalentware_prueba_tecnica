import { ReactNode } from 'react';
import { Sidebar } from '../molecules/Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-900">
      <Sidebar />
      <div className="transition-all duration-300 ml-64">
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
} 