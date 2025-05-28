"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Brain, BarChart2, Settings, CheckSquare } from "lucide-react"

export default function BottomNavigation() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path
  }

  const navItems = [
    {
      name: "Home",
      href: "/",
      icon: Home,
    },
    {
      name: "Analyze",
      href: "/analyze-insights",
      icon: Brain,
    },
    {
      name: "Insights",
      href: "/insights",
      icon: BarChart2,
    },
    {
      name: "Actions",
      href: "/action-items",
      icon: CheckSquare,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center justify-center w-full h-full ${
              isActive(item.href) ? "text-primary" : "text-gray-500"
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs mt-1">{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

