import { useSession } from "next-auth/react";
import { SidebarLink } from "@/components/atoms/SidebarLink";
import {
  LayoutDashboard,
  DollarSign,
  FileText,
  Users,
} from "lucide-react";

export function SidebarNav() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  return (
    <nav className="space-y-1">
      <SidebarLink href="/">
        <LayoutDashboard className="h-5 w-5" />
        <span>Dashboard</span>
      </SidebarLink>
      
      <SidebarLink href="/ingresos-egresos">
        <DollarSign className="h-5 w-5" />
        <span>Ingresos y Egresos</span>
      </SidebarLink>

      {isAdmin && (
        <>
          <SidebarLink href="/reportes">
            <FileText className="h-5 w-5" />
            <span>Reportes</span>
          </SidebarLink>

          <SidebarLink href="/usuarios">
            <Users className="h-5 w-5" />
            <span>Usuarios</span>
          </SidebarLink>
        </>
      )}
    </nav>
  );
}
