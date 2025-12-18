"use client"
import Image from "next/image"
import GoogleSignIn from "@/components/auth/googleSignin" // Adjust path if needed
import { useEffect } from "react"
import { trackEvent } from "@/lib/mixpanelClient"
import PhoneAuth from "@/components/auth/phoneAuth"

export default function SignupPage() {
  useEffect(() => {
    trackEvent("viewed_login")
  }, [])
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 px-4">
      <div className="w-full max-w-md">
        {/* Main Card Container */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl border border-neutral-100 dark:border-neutral-700 p-8 space-y-8">
          {/* Logo Section */}
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-lg opacity-20 scale-110"></div>
              <div className="relative bg-white dark:bg-neutral-700 rounded-full p-4 shadow-lg">
                <Image
                  src="/logos/tradio_dark_logo.svg"
                  alt="Tradio Dark Logo"
                  width={120}
                  height={120}
                  className="rounded-full hidden dark:block"
                  priority
                />
                <Image
                  src="/logos/tradio_light_logo.svg"
                  alt="Tradio Light Logo"
                  width={120}
                  height={120}
                  className="rounded-full  dark:hidden"
                  priority
                />
              </div>
            </div>

            {/* Tagline */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-neutral-900 to-neutral-700 dark:from-neutral-100 dark:to-neutral-300 bg-clip-text text-transparent">
                Trade Better Every Day
              </h1>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm">Join thousands of traders improving their skills</p>
            </div>
          </div>

          {/* Google Sign In Button */}
          <div className="space-y-4">
            {/* <PhoneAuth /> */}
            <GoogleSignIn />

            {/* Terms and Privacy */}
            <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center leading-relaxed">
              By signing up, you agree to our  Privacy Policy

            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
