"use client";

import useGlobalState from "@/hooks/globalState";
import Plans from "../subscription/plans";

export default function IsSubscribed({ children }) {
  const { userData } = useGlobalState();

const isTrialExpired =
  ["trial", "cancelled", "due"].includes(userData?.plan?.type) &&
  userData?.plan?.trialPeriod === 0;

  return (
    <>
      {children}

      {isTrialExpired && (
        <div className="fixed top-0 left-0 w-full h-full z-50 backdrop-blur-md bg-white/30 flex items-center justify-center p-4">
          <Plans />
        </div>
      )}
    </>
  );
}
