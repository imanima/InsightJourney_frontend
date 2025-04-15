"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Menu, X, Home, Mic, CheckSquare, BookOpen, Settings, LogOut, ArrowLeft } from "lucide-react"
import BottomNavigation from "@/components/bottom-navigation"
import type { ReactNode } from "react"

interface MobileLayoutProps {
  children: ReactNode
  hideNavigation?: boolean
  hideNav?: boolean
  title?: string
  showBackButton?: boolean
  backUrl?: string
}

export default function MobileLayout({
  children,
  hideNavigation = false,
  hideNav = false,
  title,
  showBackButton = false,
  backUrl = "/",
}: MobileLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()

  const isAuthenticated = user !== null && !isLoading

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Analyze Insights", href: "/record-insights", icon: Mic },
    { name: "Action Items", href: "/action-items", icon: CheckSquare },
    { name: "Insights", href: "/insights", icon: BookOpen },
    { name: "Settings", href: "/settings", icon: Settings },
  ]

  const getInitials = (name: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {!hideNav && (
        <header className="sticky top-0 z-40 bg-white border-b shadow-sm">
          <div className="container flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-2">
              {showBackButton ? (
                <Button variant="ghost" size="icon" asChild className="mr-2">
                  <Link href={backUrl}>
                    <ArrowLeft className="h-5 w-5" />
                    <span className="sr-only">Back</span>
                  </Link>
                </Button>
              ) : (
                <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[80%] sm:w-[350px] p-0">
                    <div className="flex flex-col h-full">
                      <div className="border-b p-4 flex items-center justify-between">
                        <Link href="/" className="text-xl font-bold text-primary" onClick={() => setIsMenuOpen(false)}>
                          InsightJourney
                        </Link>
                        <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
                          <X className="h-5 w-5" />
                        </Button>
                      </div>

                      {isAuthenticated && (
                        <div className="border-b p-4">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={user?.image || undefined} alt={user?.name || "User"} />
                              <AvatarFallback>{getInitials(user?.name || "User")}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user?.name}</p>
                              <p className="text-sm text-muted-foreground">{user?.email}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <nav className="flex-1 overflow-auto py-2">
                        <ul className="grid gap-1 p-2">
                          {navItems.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname === item.href

                            return (
                              <li key={item.href}>
                                <Link
                                  href={item.href}
                                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                                    isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                                  }`}
                                  onClick={() => setIsMenuOpen(false)}
                                >
                                  <Icon className="h-5 w-5" />
                                  {item.name}
                                </Link>
                              </li>
                            )
                          })}
                        </ul>
                      </nav>

                      {isAuthenticated && (
                        <div className="border-t p-4">
                          <Button variant="outline" className="w-full justify-start gap-2" onClick={logout}>
                            <LogOut className="h-4 w-4" />
                            Sign Out
                          </Button>
                        </div>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
              )}

              {title ? (
                <h1 className="text-lg font-medium">{title}</h1>
              ) : (
                <Link href="/" className="text-lg font-bold text-primary">
                  InsightJourney
                </Link>
              )}
            </div>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium hidden md:inline-block">{user?.name}</span>
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full p-0"
                    onClick={() => router.push("/settings")}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.image || undefined} alt={user?.name || "User"} />
                      <AvatarFallback>{getInitials(user?.name || "User")}</AvatarFallback>
                    </Avatar>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/login">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </header>
      )}

      <main className="flex-1 pb-16">{children}</main>

      {isAuthenticated && !hideNavigation && <BottomNavigation />}
    </div>
  )
}

