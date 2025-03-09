import { useRouter } from "next/router";
import { AppSidebar } from "../organisms/AppSidebar";
import { Separator } from "@/components/ui/separator";

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const excludedPages = ["/usuarios", "/reportes", "/ingresos-egresos"];
  const isExcludedPage = excludedPages.includes(router.pathname);

  return (
    <div className="flex h-screen bg-gray-100">
      <AppSidebar />
      {isExcludedPage ? (
        <>{children}</>
      ) : (
        <main className="flex-1 p-6">
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <Separator className="mt-2" />
          </header>
          <section className="grid grid-cols-3 gap-6">{children}</section>
        </main>
      )}
    </div>
  );
};
