"use client";
import { auth, phoneSignIn, verifyPhoneCode } from "@/lib/firebase/authActions";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { RecaptchaVerifier } from "firebase/auth";

// shadcn/ui imports
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Loader2, Phone, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  getCurrentUserId,
  checkOnboardingStatus,
} from "@/lib/firebase/database/index";

// Keep track of the confirmation result from Firebase
const defaultStatus = {
  loading: false,
  error: null,
  isCodeSent: false,
  confirmationResult: null,
};

export default function PhoneAuth() {
  const {
    register: registerPhone,
    handleSubmit: handleSubmitPhone,
    formState: { errors: phoneErrors },
  } = useForm();
  const [status, setStatus] = useState(defaultStatus);
  const [otpValue, setOtpValue] = useState("");

  const router = useRouter();

  useEffect(() => {
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
    }

    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible",
        callback: (response) => {
          // reCAPTCHA solved, allow phone auth
          console.log("reCAPTCHA solved");
        },
        "expired-callback": () => {
          // Response expired, reset the reCAPTCHA
          console.log("reCAPTCHA expired");
          if (window.recaptchaVerifier) {
            window.recaptchaVerifier.clear();
          }
        },
      }
    );

    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }
    };
  }, []);

  const handlePhoneAuth = async (data) => {
    setStatus({ ...defaultStatus, loading: true });
    const { phoneNumber } = data;

    try {
      // Pass the imported 'auth' object here
      const confirmation = await phoneSignIn(auth, phoneNumber);

      if (confirmation) {
        toast.success("OTP sent!");
        // Save the confirmation result to state
        setStatus({
          ...defaultStatus,
          isCodeSent: true,
          confirmationResult: confirmation,
        });
      }
    } catch (error) {
      console.error("Phone auth error:", error);
      toast.error("Failed to send verification code. Please try again.");
      setStatus({ ...defaultStatus, error: error.message });

      // Reset reCAPTCHA on error
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = new RecaptchaVerifier(
          auth,
          "recaptcha-container",
          {
            size: "invisible",
          }
        );
      }
    }
  };

  const handleVerifyCode = async () => {
    setStatus((prev) => ({ ...prev, loading: true, error: null }));

    if (!status.confirmationResult) {
      toast.error("Something went wrong. Please try sending the code again.");
      setStatus((prev) => ({
        ...prev,
        loading: false,
        error: "Confirmation result not found.",
      }));
      return;
    }

    if (otpValue.length !== 6) {
      toast.error("Please enter the complete 6-digit code.");
      setStatus((prev) => ({
        ...prev,
        loading: false,
        error: "Incomplete verification code.",
      }));
      return;
    }

    try {
      const result = await verifyPhoneCode(status.confirmationResult, otpValue);
      console.log("Verification successful:", result);

      toast.success("Phone number verified successfully!");

      setStatus((prev) => ({ ...prev, loading: false, error: null }));

      // Check if user has completed onboarding
      const userId = await getCurrentUserId();
      const hasCompletedOnboarding = await checkOnboardingStatus(userId);

      if (hasCompletedOnboarding) {
        router.push("/dashboard");
      } else {
        router.push("/dashboard/preonboarding");
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("Invalid verification code. Please try again.");
      setStatus((prev) => ({ ...prev, loading: false, error: error.message }));
    }
  };

  const handleBackToPhone = () => {
    setStatus(defaultStatus);
    setOtpValue("");
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
    }
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible",
      }
    );
  };

  return (
    <div className="flex flex-col items-center justify-center w-full gap-4">
      {!status.isCodeSent ? (
        <form
          onSubmit={handleSubmitPhone(handlePhoneAuth)}
          className="flex flex-col gap-4 w-full"
        >
          <div className="flex flex-col gap-4">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder=" (555) 123-4567"
              {...registerPhone("phoneNumber", {
                required: "Phone number is required",
                pattern: {
                  value:
                    /^(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$|^\+[1-9]\d{1,14}$/,
                  message: "Please enter a valid phone number",
                },
              })}
              className={phoneErrors.phoneNumber ? "border-red-500" : ""}
            />
            {phoneErrors.phoneNumber && (
              <p className="text-sm text-red-500">
                {phoneErrors.phoneNumber.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={status.loading}
            className="w-full bg-[#009966] hover:bg-[#007755] transition-colors duration-200 text-white"
          >
            {status.loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Phone className="mr-2 h-4 w-4" />
                Get OTP
              </>
            )}
          </Button>
        </form>
      ) : (
        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-col gap-4 items-center">
            <div className="flex flex-col items-center">
              <Label htmlFor="verificationCode" className="text-lg font-medium">
                Enter OTP
              </Label>
              <p className="text-sm text-neutral-600 mt-1">
                We sent a 6-digit code to your phone
              </p>
            </div>
            <InputOTP
              maxLength={6}
              value={otpValue}
              onChange={(value) => setOtpValue(value)}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSeparator />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            {otpValue.length > 0 && otpValue.length < 6 && (
              <p className="text-sm text-neutral-500">
                Please enter all 6 digits ({otpValue.length}/6)
              </p>
            )}
          </div>

          <Button
            type="button"
            onClick={handleVerifyCode}
            disabled={status.loading || otpValue.length !== 6}
            className="w-full bg-[#009966] hover:bg-[#007755] text-white transition-colors duration-200 disabled:opacity-50"
          >
            {status.loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Verify Code
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleBackToPhone}
            className="w-full hover:bg-neutral-50 transition-colors duration-200"
            disabled={status.loading}
          >
            Back to Phone Number
          </Button>
        </div>
      )}

      {/* Always render the recaptcha container */}
      <div id="recaptcha-container"></div>

      {status.error && (
        <Alert variant="destructive">
          <AlertDescription>{status.error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
