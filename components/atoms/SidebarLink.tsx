import Link from "next/link"
import { useRouter } from "next/router"
import { cn } from "@/lib/utils"

interface SidebarLinkProps {
  href: string
  children: React.ReactNode
}

export function SidebarLink({ href, children }: SidebarLinkProps) {
  const router = useRouter()
  const isActive = router.pathname === href

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-start gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900",
        isActive ? "bg-gray-100 text-gray-900" : "text-gray-600"
      )}
    >
      {children}
    </Link>
  )
}
