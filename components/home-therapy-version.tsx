"use client"

import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Brain,
  Shield,
  Calendar,
  ClipboardList,
  ArrowRight,
  CheckCircle,
  Heart,
  Users,
  BookOpen,
  Target,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function HomeTherapyVersion() {
  const { user, isLoading } = useAuth()
  const isAuthenticated = user !== null && !isLoading

  return (
    <>
      {/* Hero Section - Therapy Focus */}
      <div className="bg-gradient-to-br from-blue-50 via-green-50 to-teal-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 via-green-100/30 to-teal-100/30"></div>
        <div className="container px-4 py-16 relative">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <div className="mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Brain className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-green-600 to-teal-600 bg-clip-text text-transparent">
              Your Digital Therapy Companion
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-700 max-w-3xl leading-relaxed">
              Process your thoughts and emotions in a safe, private space. 
              <span className="font-semibold text-blue-600"> Get personalized insights</span> 
              that help you understand patterns, overcome challenges, and achieve emotional well-being.
            </p>
            <div className="space-y-6">
              {isAuthenticated ? (
                <Button size="lg" className="px-10 py-4 text-lg rounded-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 shadow-xl hover:shadow-2xl transition-all duration-300" asChild>
                  <Link href="/analyze-insights">
                    <Heart className="mr-3 h-6 w-6" />
                    Start Your Session
                  </Link>
                </Button>
              ) : (
                <Button size="lg" className="px-10 py-4 text-lg rounded-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 shadow-xl hover:shadow-2xl transition-all duration-300" asChild>
                  <Link href="/login">
                    <Heart className="mr-3 h-6 w-6" />
                    Begin Your Healing Journey
                  </Link>
                </Button>
              )}
              <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Completely confidential</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Evidence-based insights</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Professional support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Therapy Process */}
      <section className="py-16 px-4">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
              How Digital Therapy Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A structured, evidence-based approach to understanding and improving your mental health
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <BookOpen className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-800">Express & Process</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Share your thoughts, feelings, and experiences in a judgment-free environment. 
                  <strong> Your voice matters and your feelings are valid.</strong>
                </p>
                {isAuthenticated && (
                  <Button variant="outline" size="sm" className="border-blue-200 text-blue-700 hover:bg-blue-50" asChild>
                    <Link href="/analyze-insights">
                      Start Session <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Brain className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-800">Analyze & Understand</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  AI-powered analysis identifies patterns, triggers, and insights based on therapeutic frameworks.
                  <strong> Gain clarity on your emotional landscape.</strong>
                </p>
                {isAuthenticated && (
                  <Button variant="outline" size="sm" className="border-green-200 text-green-700 hover:bg-green-50" asChild>
                    <Link href="/insights">
                      View Insights <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Target className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-800">Heal & Grow</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Receive personalized coping strategies and action plans to improve your mental health.
                  <strong> Small steps lead to meaningful change.</strong>
                </p>
                {isAuthenticated && (
                  <Button variant="outline" size="sm" className="border-teal-200 text-teal-700 hover:bg-teal-50" asChild>
                    <Link href="/insights">
                      Track Progress <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Therapeutic Benefits */}
      <section className="py-16 px-4 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
              Evidence-Based Mental Health Support
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our approach combines proven therapeutic techniques with modern technology to provide personalized mental health support.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 text-white rounded-xl flex items-center justify-center mr-6 mt-1 shadow-lg">
                  <Heart className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-3 text-gray-800">Emotional Regulation</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Learn to identify, understand, and manage your emotions effectively. Track mood patterns and develop healthier coping mechanisms.
                    <strong className="text-blue-600"> Emotional stability is achievable.</strong>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 text-white rounded-xl flex items-center justify-center mr-6 mt-1 shadow-lg">
                  <Brain className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-3 text-gray-800">Cognitive Restructuring</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Challenge negative thought patterns and develop more balanced, realistic thinking. Break free from cognitive distortions.
                    <strong className="text-green-600"> Your thoughts shape your reality.</strong>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 text-white rounded-xl flex items-center justify-center mr-6 mt-1 shadow-lg">
                  <Target className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-3 text-gray-800">Behavioral Activation</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Set meaningful goals and take purposeful actions aligned with your values. Build momentum through small, achievable steps.
                    <strong className="text-teal-600"> Action creates positive change.</strong>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 text-white rounded-xl flex items-center justify-center mr-6 mt-1 shadow-lg">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-3 text-gray-800">Relationship Patterns</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Understand your attachment styles and communication patterns. Improve relationships and build healthier connections.
                    <strong className="text-purple-600"> Healthy relationships are possible.</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy & Professional Standards */}
      <section className="py-16 px-4">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Shield className="h-10 w-10" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800">Professional-Grade Privacy & Security</h2>
            <p className="text-xl mb-8 text-gray-600 leading-relaxed">
              Your mental health information is protected with the same standards used by licensed therapists and healthcare providers.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <h4 className="font-semibold text-lg mb-2 text-gray-800">HIPAA-Level Security</h4>
                <p className="text-gray-600">Healthcare-grade encryption and privacy protection for all your personal information</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-6 w-6" />
                </div>
                <h4 className="font-semibold text-lg mb-2 text-gray-800">Therapeutic Framework</h4>
                <p className="text-gray-600">AI analysis based on established therapeutic approaches like CBT and DBT</p>
              </div>
              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-6 rounded-xl">
                <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6" />
                </div>
                <h4 className="font-semibold text-lg mb-2 text-gray-800">Professional Support</h4>
                <p className="text-gray-600">Option to connect with licensed therapists when you need human support</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4 bg-gradient-to-br from-blue-600 via-green-600 to-teal-600 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700/20 via-green-700/20 to-teal-700/20"></div>
        <div className="container relative">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Begin Your Healing Journey?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
            Take the first step towards better mental health. You deserve support and healing.
          </p>
          {isAuthenticated ? (
            <Button variant="secondary" size="lg" className="px-10 py-4 text-lg rounded-full bg-white text-blue-600 hover:bg-gray-50 shadow-xl hover:shadow-2xl transition-all duration-300" asChild>
              <Link href="/analyze-insights">
                <Heart className="mr-3 h-6 w-6" />
                Start Your First Session
              </Link>
            </Button>
          ) : (
            <Button variant="secondary" size="lg" className="px-10 py-4 text-lg rounded-full bg-white text-blue-600 hover:bg-gray-50 shadow-xl hover:shadow-2xl transition-all duration-300" asChild>
              <Link href="/login">
                <Heart className="mr-3 h-6 w-6" />
                Get Started Free
              </Link>
            </Button>
          )}
          <p className="text-blue-100 mt-4">Join thousands on their path to mental wellness</p>
        </div>
      </section>
    </>
  )
} 