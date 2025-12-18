"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Phone, Shield, Loader2, CheckCircle } from "lucide-react";
import useGlobalState from "@/hooks/globalState";
import { createPhoneData } from "@/lib/phoneVerification";
import PhoneVerified from "./phoneVerified";
import { trackEvent } from "@/lib/mixpanelClient";
import { addUserData } from "@/lib/firebase/database/userData";

// Zod schemas
const phoneSchema = z.object({
  phoneNumber: z
    .string()
    .min(1, "Mobile number is required")
    .length(10, "Mobile number must be exactly 10 digits")

    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number")
    .transform((val) => `+91${val}`), // Automatically add +91 prefix
});

const otpSchema = z.object({
  otp: z
    .string()
    .length(4, "OTP must be exactly 4 digits")
    .regex(/^\d{4}$/, "OTP must contain only numbers"),
});

export default function OtpWidget() {
  const { user } = useGlobalState();
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Phone form
  const phoneForm = useForm({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phoneNumber: "",
    },
  });

  // OTP form
  const otpForm = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  // Fix 2: Add method existence checks in onPhoneSubmit
  const onPhoneSubmit = async (data) => {
    setError("");
    setLoading(true);

    // Check if MSG91 methods are available
    if (!window.sendOtp) {
      setError("OTP service not ready. Please refresh and try again.");
      setLoading(false);
      return;
    }

    try {
      await new Promise((resolve, reject) => {
        window.sendOtp(
          data.phoneNumber,
          (response) => {
            console.log("OTP sent successfully", response);

            // ADD THIS TRACKING
            trackEvent("requested_phone_otp", {
              phoneNumber: data.phoneNumber,
              provider: "msg91",
            });

            setPhoneNumber(data.phoneNumber);
            setOtpSent(true);
            setError("");
            resolve(response);
          },
          (err) => {
            console.error("Error sending OTP", err);
            setError(
              "Failed to send OTP. Please check your mobile number and try again."
            );
            reject(err);
          }
        );
      });
    } catch (err) {
      console.error("Phone submit error:", err);
      setError("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fix 3: Add method existence checks in onOtpSubmit
  const onOtpSubmit = async (data) => {
    setError("");
    setLoading(true);

    // Check if MSG91 methods are available
    if (!window.verifyOtp) {
      setError(
        "OTP verification service not ready. Please refresh and try again."
      );
      setLoading(false);
      return;
    }

    try {
      await new Promise((resolve, reject) => {
        window.verifyOtp(
          data.otp,
          async (response) => {
            try {
              console.log("OTP verified", response);

              // Send token to backend for final verification
              const res = await fetch("/api/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  token: response.message,
                  phoneNumber: phoneNumber,
                }),
              });

              const result = await res.json();
              console.log("Final Verification:", result);

              if (!res.ok) {
                throw new Error(result.error || "Verification failed");
              }

              if (result.success) {
                await addUserData({
                  phone: { number: phoneNumber, verified: true },
                });

                // ADD THIS TRACKING FOR SUCCESSFUL VERIFICATION
                trackEvent("completed_phone_verification", {
                  phoneNumber: phoneNumber,
                  provider: "msg91",
                  userId: user.uid,
                });
                setVerified(true);
                setError("");
                resolve(response);
              } else {
                setError("Verification failed. Please try again.");
                reject(new Error("Backend verification failed"));
              }
            } catch (err) {
              console.error("Backend verification error:", err);
              setError("Verification failed. Please try again.");
              reject(err);
            }
          },
          (err) => {
            console.error("OTP verification failed", err);
            setError("Invalid OTP. Please check and try again.");
            reject(err);
          }
        );
      });
    } catch (err) {
      console.error("OTP submit error:", err);
      setError("OTP verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToPhone = () => {
    setOtpSent(false);
    setError("");
    setVerified(false);
    setPhoneNumber("");
    otpForm.reset();
  };

  const formatPhoneDisplay = (phone) => {
    if (phone.startsWith("+91")) {
      const number = phone.slice(3);
      return `+91 ${number.slice(0, 5)} ${number.slice(5)}`;
    }
    return phone;
  };

  return (
    <div className="h-screen z-555 w-screen backdrop-blur-md fixed flex items-center justify-center">
      <div className="bg-white dark:bg-neutral-800 flex flex-col items-center justify-center w-full gap-4 p-6 max-w-md mx-auto border dark:border-neutral-700 rounded-lg shadow-lg min-h-[400px]">
        {verified ? (
          <PhoneVerified phoneNumber={phoneNumber} />
        ) : (
          <>
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">
                Mobile Verification
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                Secure login with OTP verification
              </p>
            </div>

            {!otpSent ? (
              <Form {...phoneForm}>
                <form
                  onSubmit={phoneForm.handleSubmit(onPhoneSubmit)}
                  className="flex flex-col gap-4 w-full"
                >
                  <FormField
                    control={phoneForm.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium dark:text-neutral-200">
                          Mobile Number
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-neutral-600 dark:text-neutral-400 font-medium">
                              +91
                            </div>
                            <Input
                              {...field}
                              type="tel"
                              placeholder="98765 43210"
                              className="pl-12 dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-200 dark:placeholder-neutral-400"
                              maxLength={10}
                              onChange={(e) => {
                                // Only allow numbers
                                const value = e.target.value.replace(/\D/g, "");
                                field.onChange(value);
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#009966] hover:bg-[#007755] transition-colors duration-200 text-white dark:bg-[#009966] dark:hover:bg-[#007755]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending OTP...
                      </>
                    ) : (
                      <>
                        <Phone className="mr-2 h-4 w-4" />
                        Send OTP
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            ) : (
              <Form {...otpForm}>
                <form
                  onSubmit={otpForm.handleSubmit(onOtpSubmit)}
                  className="flex flex-col gap-4 w-full"
                >
                  <div className="flex flex-col gap-4 items-center">
                    <div className="flex flex-col items-center">
                      <Label className="text-lg font-medium dark:text-neutral-200">
                        Enter OTP
                      </Label>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                        We sent a 4-digit code to{" "}
                        {formatPhoneDisplay(phoneNumber)}
                      </p>
                    </div>

                    <FormField
                      control={otpForm.control}
                      name="otp"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <InputOTP
                              maxLength={4}
                              {...field}
                              onChange={(value) => {
                                field.onChange(value);
                              }}
                              className="dark:[&>div]:border-neutral-600 dark:[&>div]:bg-neutral-700 dark:[&>div]:text-neutral-200"
                            >
                              <InputOTPGroup>
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSeparator />
                                <InputOTPSlot index={2} />
                                <InputOTPSlot index={3} />
                              </InputOTPGroup>
                            </InputOTP>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {otpForm.watch("otp").length > 0 &&
                      otpForm.watch("otp").length < 4 && (
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          Please enter all 4 digits (
                          {otpForm.watch("otp").length}
                          /4)
                        </p>
                      )}
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || otpForm.watch("otp").length !== 4}
                    className="w-full bg-[#009966] hover:bg-[#007755] text-white transition-colors duration-200 disabled:opacity-50 dark:bg-[#009966] dark:hover:bg-[#007755]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Shield className="mr-2 h-4 w-4" />
                        Verify OTP
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBackToPhone}
                    className="w-full hover:bg-neutral-50 dark:hover:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-200 transition-colors duration-200"
                    disabled={loading}
                  >
                    Change Mobile Number
                  </Button>
                </form>
              </Form>
            )}
          </>
        )}
        {error && (
          <Alert
            variant="destructive"
            className="w-full dark:border-red-600 dark:bg-red-950"
          >
            <AlertDescription className="dark:text-red-200">
              {error}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
