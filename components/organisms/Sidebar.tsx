import { Logo } from "@/components/atoms/Logo"
import { SidebarNav } from "@/components/molecules/SidebarNav"
import { signOut } from "next-auth/react"
import { LogOut } from "lucide-react"

export function Sidebar() {
  return (
    <div className="flex h-full min-h-screen w-64 flex-col border-r bg-white">
      <div className="flex h-14 items-center border-b px-4">
        <Logo />
      </div>
      
      <div className="flex-1 overflow-auto py-2">
        <SidebarNav />
      </div>

      <div className="border-t p-4">
        <button
          onClick={() => signOut()}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
        >
          <LogOut className="h-5 w-5" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  )
}
