"use client";
import { CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";

export default function PhoneVerified({ phoneNumber }) {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const formatPhoneDisplay = (phone) => {
    if (phone.startsWith("+91")) {
      const number = phone.slice(3);
      return `+91 ${number.slice(0, 5)} ${number.slice(5)}`;
    }
    return phone; 
  };

  return (
    <>
     {show && (
  <div className="bg-white dark:bg-neutral-800 h-full w-full flex flex-col items-center justify-center gap-6 p-6 mx-auto">
    <div className="flex flex-col items-center gap-4">
      <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
        <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
      </div>
      <div className="text-center">
        <h2 className="text-xl font-semibold text-green-700 dark:text-green-400">
          Verification Successful!
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
          {formatPhoneDisplay(phoneNumber)} has been verified
        </p>
      </div>
    </div>
  </div>
)}
    </>
  );
}
