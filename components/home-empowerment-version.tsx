"use client"

import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Brain,
  Shield,
  ArrowRight,
  CheckCircle,
  Lightbulb,
  Heart,
  Sparkles,
  TreePine,
  Compass,
  Eye,
  TrendingUp,
  Zap,
  Sun,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function HomeEmpowermentVersion() {
  const { user, isLoading } = useAuth()
  const isAuthenticated = user !== null && !isLoading

  return (
    <>
      {/* Hero Section - Empowerment Focus */}
      <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/30 via-purple-100/30 to-pink-100/30"></div>
        <div className="container px-4 py-16 relative">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <div className="mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Brain className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Understand Your Inner World
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-700 max-w-3xl leading-relaxed">
              Turn your thoughts and emotions into powerful insights. 
              <span className="font-semibold text-indigo-600"> You have the power to understand your patterns</span>, 
              recognize your growth, and shape your emotional journey.
            </p>
            <div className="space-y-6">
              {isAuthenticated ? (
                <Button size="lg" className="px-10 py-4 text-lg rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transition-all duration-300" asChild>
                  <Link href="/analyze-insights">
                    <Compass className="mr-3 h-6 w-6" />
                    Begin Your Discovery
                  </Link>
                </Button>
              ) : (
                <Button size="lg" className="px-10 py-4 text-lg rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transition-all duration-300" asChild>
                  <Link href="/login">
                    <Sparkles className="mr-3 h-6 w-6" />
                    Start Your Journey
                  </Link>
                </Button>
              )}
              <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Your data, your control</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Private & secure</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>No judgment, just growth</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Your Journey of Self-Discovery */}
      <section className="py-16 px-4">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Your Journey of Self-Discovery
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Every emotion tells a story. Every pattern reveals wisdom. You're not just tracking feelings—you're building emotional intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Eye className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-800">Observe & Reflect</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Notice your emotions, thoughts, and experiences without judgment. 
                  <strong> You're the expert on your own mind.</strong>
                </p>
                {isAuthenticated && (
                  <Button variant="outline" size="sm" className="border-blue-200 text-blue-700 hover:bg-blue-50" asChild>
                    <Link href="/analyze-insights">
                      Start Reflecting <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Brain className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-800">Discover Patterns</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  AI helps you see the hidden connections in your emotional world.
                  <strong> Knowledge is power over your inner landscape.</strong>
                </p>
                {isAuthenticated && (
                  <Button variant="outline" size="sm" className="border-purple-200 text-purple-700 hover:bg-purple-50" asChild>
                    <Link href="/insights">
                      Explore Patterns <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <TreePine className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-800">Grow & Evolve</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Turn insights into action. Shape your emotional future with intention.
                  <strong> You have the agency to change.</strong>
                </p>
                {isAuthenticated && (
                  <Button variant="outline" size="sm" className="border-green-200 text-green-700 hover:bg-green-50" asChild>
                    <Link href="/insights">
                      See Your Growth <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Empowerment Through Understanding */}
      <section className="py-16 px-4 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
              Understanding Gives You Power
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              When you understand your emotional patterns, you gain the power to influence them. Knowledge becomes freedom.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-pink-500 text-white rounded-xl flex items-center justify-center mr-6 mt-1 shadow-lg">
                  <Heart className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-3 text-gray-800">Emotional Intelligence</h4>
                  <p className="text-gray-600 leading-relaxed">
                    See your emotional patterns clearly. Understand what triggers certain feelings and how they evolve over time. 
                    <strong className="text-red-600"> Your emotions are data—use them wisely.</strong>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 text-white rounded-xl flex items-center justify-center mr-6 mt-1 shadow-lg">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-3 text-gray-800">Progress Recognition</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Track your personal growth journey. Celebrate breakthroughs and recognize how far you've come. 
                    <strong className="text-indigo-600"> Every insight is a step forward.</strong>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 text-white rounded-xl flex items-center justify-center mr-6 mt-1 shadow-lg">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-3 text-gray-800">Intentional Actions</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Transform insights into purposeful actions. Create habits that align with your emotional goals. 
                    <strong className="text-green-600"> You choose how to respond to life.</strong>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-xl flex items-center justify-center mr-6 mt-1 shadow-lg">
                  <Sun className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-3 text-gray-800">Breakthrough Moments</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Recognize and celebrate your "aha!" moments. Build on realizations that change how you see yourself. 
                    <strong className="text-orange-600"> Your breakthroughs are your superpowers.</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How Your Journey Unfolds */}
      <section className="py-16 px-4">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">How Your Journey Unfolds</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A simple, powerful process that puts you in control of your emotional growth
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-200 via-purple-200 to-pink-200 rounded-full"></div>

              {/* Step 1 */}
              <div className="flex mb-12 relative">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center z-10 shadow-lg font-bold text-lg">
                  1
                </div>
                <div className="ml-8">
                  <h3 className="font-bold text-2xl mb-3 text-gray-800">Share Your Inner Experience</h3>
                  <p className="text-gray-600 mb-4 text-lg leading-relaxed">
                    Express what's on your mind and heart. Your thoughts and emotions are valuable data about your inner world.
                  </p>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                    <p className="italic text-gray-700 text-lg">
                      "I've been feeling overwhelmed with work lately, but I also noticed I'm more confident in meetings now..."
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex mb-12 relative">
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-full w-12 h-12 flex items-center justify-center z-10 shadow-lg font-bold text-lg">
                  2
                </div>
                <div className="ml-8">
                  <h3 className="font-bold text-2xl mb-3 text-gray-800">AI Reveals Hidden Patterns</h3>
                  <p className="text-gray-600 mb-4 text-lg leading-relaxed">
                    Powerful AI analyzes your experiences to reveal emotional patterns, growth areas, and insights you might miss.
                  </p>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
                    <p className="font-semibold mb-3 text-gray-800">What AI Discovered:</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        <span className="text-gray-700">Stress patterns linked to specific work situations</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        <span className="text-gray-700">Growing confidence in professional settings</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                        <span className="text-gray-700">Connection between self-care and performance</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex mb-12 relative">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-full w-12 h-12 flex items-center justify-center z-10 shadow-lg font-bold text-lg">
                  3
                </div>
                <div className="ml-8">
                  <h3 className="font-bold text-2xl mb-3 text-gray-800">Take Empowered Action</h3>
                  <p className="text-gray-600 mb-4 text-lg leading-relaxed">
                    Use insights to make intentional choices. You decide how to respond to what you've learned about yourself.
                  </p>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
                    <p className="font-semibold mb-3 text-gray-800">Your Action Plan:</p>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Zap className="h-5 w-5 text-green-600 mt-0.5" />
                        <span className="text-gray-700">Set boundaries with work notifications after 7 PM</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <Zap className="h-5 w-5 text-green-600 mt-0.5" />
                        <span className="text-gray-700">Practice confidence-building exercises before meetings</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <Sun className="h-5 w-5 text-yellow-500 mt-0.5" />
                        <span className="text-gray-700 font-medium">Breakthrough: Your confidence is growing! Celebrate this progress.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex relative">
                <div className="bg-gradient-to-br from-yellow-500 to-orange-600 text-white rounded-full w-12 h-12 flex items-center justify-center z-10 shadow-lg font-bold text-lg">
                  4
                </div>
                <div className="ml-8">
                  <h3 className="font-bold text-2xl mb-3 text-gray-800">Witness Your Evolution</h3>
                  <p className="text-gray-600 mb-4 text-lg leading-relaxed">
                    Track your emotional growth over time. See how your patterns shift as you become more self-aware.
                  </p>
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-100">
                    <div className="flex items-center gap-3 mb-3">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                      <span className="font-semibold text-gray-800">30 Days Later:</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      "I can see how my relationship with work stress has completely changed. I'm not just coping—I'm thriving. 
                      The patterns are so clear now, and I feel empowered to shape my emotional future."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy & Control Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Shield className="h-10 w-10" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800">Your Data, Your Control, Your Journey</h2>
            <p className="text-xl mb-8 text-gray-600 leading-relaxed">
              We believe in your right to emotional privacy. Your inner world is sacred, and we protect it like it is.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <h4 className="font-semibold text-lg mb-2 text-gray-800">End-to-End Encryption</h4>
                <p className="text-gray-600">Your thoughts are encrypted and secure—only you can access them</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="h-6 w-6" />
                </div>
                <h4 className="font-semibold text-lg mb-2 text-gray-800">Complete Transparency</h4>
                <p className="text-gray-600">You see exactly how AI analyzes your data—no black boxes</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6" />
                </div>
                <h4 className="font-semibold text-lg mb-2 text-gray-800">You Own Your Insights</h4>
                <p className="text-gray-600">Export, delete, or share your data—you're always in control</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Empowerment CTA */}
      <section className="py-16 px-4 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-700/20 via-purple-700/20 to-pink-700/20"></div>
        <div className="container relative">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Understand Your Inner World?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
            Your emotional intelligence is your superpower. Start building it today.
          </p>
          {isAuthenticated ? (
            <Button variant="secondary" size="lg" className="px-10 py-4 text-lg rounded-full bg-white text-indigo-600 hover:bg-gray-50 shadow-xl hover:shadow-2xl transition-all duration-300" asChild>
              <Link href="/analyze-insights">
                <Compass className="mr-3 h-6 w-6" />
                Begin Your Discovery
              </Link>
            </Button>
          ) : (
            <Button variant="secondary" size="lg" className="px-10 py-4 text-lg rounded-full bg-white text-indigo-600 hover:bg-gray-50 shadow-xl hover:shadow-2xl transition-all duration-300" asChild>
              <Link href="/login">
                <Sparkles className="mr-3 h-6 w-6" />
                Start Your Journey Free
              </Link>
            </Button>
          )}
          <p className="text-indigo-100 mt-4">Join thousands who've unlocked their emotional intelligence</p>
        </div>
      </section>
    </>
  )
} 