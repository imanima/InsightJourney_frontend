"use client"

import type React from "react"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"

interface BaseLayoutProps {
  children: React.ReactNode
  username?: string
}

export default function BaseLayout({ children, username }: BaseLayoutProps) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <nav className="border-b" data-testid="nav-menu">
        <div className="container flex items-center justify-between py-3">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-lg font-bold text-primary" data-testid="nav-logo">
              InsightJourney
            </Link>
            {username && (
              <div className="hidden md:flex gap-2">
                <Link
                  href="/record-insights"
                  className={`nav-link ${pathname === "/record-insights" ? "text-primary font-medium" : "text-muted-foreground"}`}
                  data-testid="nav-record-insights"
                >
                  Analyze Insights
                </Link>
                <Link
                  href="/action-items"
                  className={`nav-link ${pathname === "/action-items" ? "text-primary font-medium" : "text-muted-foreground"}`}
                  data-testid="nav-action-items"
                >
                  Action Items
                </Link>
                <Link
                  href="/journeys"
                  className={`nav-link ${pathname === "/journeys" ? "text-primary font-medium" : "text-muted-foreground"}`}
                  data-testid="nav-journeys"
                >
                  Journeys
                </Link>
                <Link
                  href="/insights"
                  className={`nav-link ${pathname === "/insights" ? "text-primary font-medium" : "text-muted-foreground"}`}
                  data-testid="nav-insights"
                >
                  Insights
                </Link>
                <Link
                  href="/admin-settings"
                  className={`nav-link ${pathname === "/admin-settings" ? "text-primary font-medium" : "text-muted-foreground"}`}
                >
                  <i className="fas fa-cog me-2"></i>Admin Settings
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {username ? (
              <>
                <span className="text-sm text-muted-foreground hidden md:inline" data-testid="user-welcome">
                  Welcome, {username}
                </span>
                <Button variant="outline" size="sm" asChild data-testid="logout-button">
                  <Link href="/logout">
                    <i className="fas fa-sign-out-alt mr-1"></i>
                    Logout
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" asChild data-testid="nav-login">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild data-testid="nav-register">
                  <Link href="/register">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-secondary-800 text-white py-8" data-testid="footer">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">InsightJourney</h3>
              <p className="text-secondary-400">Your personal growth companion</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-secondary-400 hover:text-white">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-secondary-400 hover:text-white">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-secondary-400 hover:text-white">
                    Features
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-2">Support</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-secondary-400 hover:text-white">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-secondary-400 hover:text-white">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-secondary-400 hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-2">Connect</h4>
              <div className="flex gap-4">
                <Link href="#" className="text-secondary-400 hover:text-white">
                  Twitter
                </Link>
                <Link href="#" className="text-secondary-400 hover:text-white">
                  LinkedIn
                </Link>
                <Link href="#" className="text-secondary-400 hover:text-white">
                  GitHub
                </Link>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-secondary-700 text-center text-secondary-400">
            <p>&copy; {new Date().getFullYear()} InsightJourney. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

