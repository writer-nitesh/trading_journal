"use client";
import { getGoogleSignIn } from "@/lib/firebase/authActions";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { trackEvent } from "../../lib/mixpanelClient";
import { addUserData, getUserData } from "@/lib/firebase/database/userData";

export default function GoogleSignIn() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  async function handleGoogleSignIn() {
    try {
      setIsLoading(true);
      const user = await getGoogleSignIn();
      const userData = await getUserData(user.uid);

      // If user data does not exist OR onboarding is incomplete, redirect to onboarding
      if (!userData || userData.onBoarding === "incomplete") {
        if (!userData) {
          // User doesn't exist, create complete user data
          await addUserData({
            phone: { number: "", verified: false },
            plan: { type: "trial", trialPeriod: 7 },
            onBoarding: "incomplete",
          });
        }

        router.push("/dashboard/preonboarding");
      } else {
        router.push("/dashboard");
      }

      setTimeout(() => {
        trackEvent("signup_successful");
      }, 100);
    } catch (error) {
      toast.error("Signup error", {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      variant="outline"
      type="button"
      className="w-full h-12 flex items-center justify-center gap-3 text-neutral-700 dark:text-neutral-300 font-medium border-2 border-neutral-200 dark:border-neutral-600 hover:border-neutral-300 dark:hover:border-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all duration-200 rounded-xl shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed group bg-transparent dark:bg-transparent"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin text-neutral-500 dark:text-neutral-400" />
          <span className="text-neutral-500 dark:text-neutral-400">
            Signing in...
          </span>
        </>
      ) : (
        <>
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="20"
              height="20"
              className="transition-transform duration-200 group-hover:scale-110"
            >
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          </div>
          <span className="text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-neutral-100 transition-colors duration-200">
            Sign up with Google
          </span>
        </>
      )}
    </Button>
  );
}
