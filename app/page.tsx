"use client"

import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import MobileLayout from "@/components/mobile-layout"
import {
  Brain,
  LineChartIcon as ChartLine,
  Shield,
  Calendar,
  ClipboardList,
  ArrowRight,
  CheckCircle,
  Lightbulb,
  Heart,
  Sparkles,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const isAuthenticated = user !== null && !isLoading

  return (
    <MobileLayout>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 relative overflow-hidden">
        <div className="container px-4 py-12">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4" data-testid="hero-title">
              Your Therapy
              <br />
              Companion
            </h1>
            <p className="text-lg mb-6 text-gray-600 max-w-md">
              Enhance your therapy journey with AI-powered insights that extract emotions, patterns, action items, and
              breakthroughs from your sessions.
            </p>
            <div className="space-y-4">
              {isAuthenticated ? (
                <Button size="lg" className="px-8 rounded-full" asChild data-testid="start-journey-button">
                  <Link href="/analyze-insights">
                    <Brain className="mr-2 h-5 w-5" />
                    Analyze Session
                  </Link>
                </Button>
              ) : (
                <Button size="lg" className="px-8 rounded-full" asChild data-testid="login-button">
                  <Link href="/login">Sign In to Start</Link>
                </Button>
              )}
              <p className="text-sm text-gray-500">Secure, private, and designed for therapy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Therapy Journey Section */}
      <section className="py-12 px-4">
        <div className="container">
          <h2 className="text-2xl font-bold text-center mb-8">Your Therapy Journey</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white p-6 rounded-xl shadow-sm text-center hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Before Session</h3>
                <p className="text-gray-600 mb-4">
                  Prepare for your therapy by noting topics, emotions, and questions you want to discuss.
                </p>
                {isAuthenticated && (
                  <Button variant="outline" size="sm" className="mt-2" asChild>
                    <Link href="/analyze-insights">
                      Prepare Notes <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white p-6 rounded-xl shadow-sm text-center hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">During Session</h3>
                <p className="text-gray-600 mb-4">
                  AI listens to your therapy session and analyzes the conversation to identify key insights and
                  patterns.
                </p>
                {isAuthenticated && (
                  <Button variant="outline" size="sm" className="mt-2" asChild>
                    <Link href="/analyze-insights">
                      Start Analysis <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white p-6 rounded-xl shadow-sm text-center hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">After Session</h3>
                <p className="text-gray-600 mb-4">
                  AI analyzes your notes to extract emotions, patterns, action items, and breakthroughs from your
                  session.
                </p>
                {isAuthenticated && (
                  <Button variant="outline" size="sm" className="mt-2" asChild>
                    <Link href="/insights">
                      View Insights <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="container">
          <h2 className="text-2xl font-bold text-center mb-8">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center mr-4 mt-1">
                  <Heart className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-base font-semibold mb-2">Emotion Extraction</h4>
                  <p className="text-sm text-gray-600">
                    AI identifies emotional patterns and intensity throughout your therapy journey, helping you track
                    your emotional progress.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mr-4 mt-1">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-base font-semibold mb-2">Action Item Extraction</h4>
                  <p className="text-sm text-gray-600">
                    Automatically identify therapy homework and assignments, with reminders to keep you on track between
                    sessions.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-4 mt-1">
                  <ChartLine className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-base font-semibold mb-2">Pattern Recognition</h4>
                  <p className="text-sm text-gray-600">
                    Identify recurring themes, triggers, and thought patterns across sessions to gain deeper insights
                    into your progress.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mr-4 mt-1">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-base font-semibold mb-2">Breakthrough Moments</h4>
                  <p className="text-sm text-gray-600">
                    Highlight key realizations and breakthrough moments from your therapy journey to celebrate progress.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 px-4">
        <div className="container">
          <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>

          <div className="max-w-3xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

              {/* Step 1 */}
              <div className="flex mb-8 relative">
                <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center z-10">
                  1
                </div>
                <div className="ml-6">
                  <h3 className="font-semibold text-lg mb-2">Prepare for Your Session</h3>
                  <p className="text-gray-600 mb-2">
                    Before your therapy appointment, note any topics or concerns you want to discuss.
                  </p>
                  <div className="bg-gray-50 p-3 rounded-md text-sm">
                    <p className="italic">"I've been feeling anxious at work—need to discuss coping strategies."</p>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex mb-8 relative">
                <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center z-10">
                  2
                </div>
                <div className="ml-6">
                  <h3 className="font-semibold text-lg mb-2">AI Listens During Session</h3>
                  <p className="text-gray-600 mb-2">
                    During your therapy session, our AI listens and analyzes the conversation in real-time.
                  </p>
                  <div className="bg-gray-50 p-3 rounded-md text-sm">
                    <p className="italic">
                      "The AI detected discussion about work anxiety, therapist suggestions for mindfulness techniques,
                      and setting boundaries with management."
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex mb-8 relative">
                <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center z-10">
                  3
                </div>
                <div className="ml-6">
                  <h3 className="font-semibold text-lg mb-2">Review AI-Generated Insights</h3>
                  <p className="text-gray-600 mb-2">
                    Our AI analyzes your notes to extract emotions, patterns, action items, and breakthroughs.
                  </p>
                  <div className="bg-gray-50 p-3 rounded-md text-sm">
                    <p className="font-medium mb-1">Analysis Results:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>
                        <span className="text-red-500">Emotions:</span> Anxiety (work), Relief (after discussion)
                      </li>
                      <li>
                        <span className="text-purple-500">Pattern:</span> Perfectionism at work leading to stress
                      </li>
                      <li>
                        <span className="text-green-500">Action Items:</span> Practice mindfulness, set boundaries
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex relative">
                <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center z-10">
                  4
                </div>
                <div className="ml-6">
                  <h3 className="font-semibold text-lg mb-2">Track Progress Between Sessions</h3>
                  <p className="text-gray-600 mb-2">
                    Complete therapy homework, journal your experiences, and prepare for your next session.
                  </p>
                  <div className="bg-gray-50 p-3 rounded-md text-sm">
                    <div className="flex items-start mb-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                      <p>Practiced 5 minutes of mindfulness daily</p>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                      <p>Had conversation with manager about workload</p>
                    </div>
                    <div className="mt-2 text-yellow-600 flex items-start">
                      <Sparkles className="h-4 w-4 mt-0.5 mr-2" />
                      <p>
                        <strong>Breakthrough:</strong> Realized my anxiety stems from fear of disappointing others
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Your Privacy Is Our Priority</h2>
            <p className="text-lg mb-6 text-gray-600">
              We understand the sensitive nature of therapy sessions. All your notes and insights are encrypted, stored
              securely, and never shared without your explicit permission.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
                <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-3">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <span className="text-sm">End-to-end encryption</span>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
                <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-3">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <span className="text-sm">HIPAA compliant</span>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
                <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-3">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <span className="text-sm">You control your data</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-12 px-4 bg-primary text-white text-center">
        <div className="container">
          <h2 className="text-2xl font-bold mb-4">Ready to Enhance Your Therapy Journey?</h2>
          <p className="text-lg mb-6">
            Join thousands of users who are gaining deeper insights from their therapy sessions
          </p>
          {isAuthenticated ? (
            <Button variant="secondary" size="lg" className="px-8 rounded-full" asChild>
              <Link href="/analyze-insights">
                <Brain className="mr-2 h-5 w-5" />
                Analyze Session
              </Link>
            </Button>
          ) : (
            <Button variant="secondary" size="lg" className="px-8 rounded-full" asChild>
              <Link href="/login">Get Started Free</Link>
            </Button>
          )}
        </div>
      </section>
    </MobileLayout>
  )
}

