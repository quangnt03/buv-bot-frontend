"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { UserButton } from "@/components/dashboard/user-button"
import { LayoutDashboard, Settings, User, FileText } from "lucide-react"
import ModeToggle from "@/components/mode-toggle"

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: User,
  }
]

export function NavBar() {
  const pathname = usePathname()

  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4 max-w-full">
        {/* All navigation items with some space on the left */}
        <div className="flex items-center gap-6 ml-4">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href
            return (
              <Link 
                key={index}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            )
          })}
        </div>
        
        {/* Only user controls on the right */}
        <div className="ml-auto flex items-center gap-4">
          {/* <ModeToggle /> */}
          <UserButton />
        </div>
      </div>
    </nav>
  )
}