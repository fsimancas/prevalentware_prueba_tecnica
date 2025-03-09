import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface SidebarButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export function SidebarButton({ 
  children, 
  className, 
  active = false,
  ...props 
}: SidebarButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-start gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900",
        active && "bg-gray-100 text-gray-900",
        !active && "text-gray-600",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
