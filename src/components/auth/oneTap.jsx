
"use client";

import GoogleOneTapLogin from "react-google-one-tap-login";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getOneTap } from "@/lib/firebase/authActions";

export default function GoogleOneTapLoginComponent() {
  const router = useRouter();

  async function handleSuccess(response) {
    try {
      await getOneTap(response);
      toast.success("Account created successfully", {
        description: "Redirecting to journal...",
      });
      setTimeout(() => {
        router.push("/dashboard/journal");
      }, 200);
    } catch (error) {
      toast.error("Signup error", { description: error.message });
    }
  }

  function handleError(error) {
    toast.error("Google One Tap error", { description: error?.message || "Unknown error" });
  }

  return (
    <GoogleOneTapLogin
      onSuccess={handleSuccess}
      onError={handleError}
      googleAccountConfigs={{
        client_id: "161219288577-34alqi871jrvps868h726coefc79cc4n.apps.googleusercontent.com",
      }}
    />
  );
}
