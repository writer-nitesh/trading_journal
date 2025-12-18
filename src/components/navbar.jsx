"use client";

import React, { useState } from "react";
import { Target, User, Menu, X } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import useGlobalState from "@/hooks/globalState";
import { logout } from "@/lib/firebase/authActions";
import { removeCookie } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";
import GetOrders from "./getOrders";
import { trackEvent } from "@/lib/mixpanelClient";
import { ModeToggle } from "./theme/theme-mode";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!mounted) return false;
  return isMobile;
};

const Navbar = ({ pathname, onTasksClick }) => {
  const router = useRouter();
  const t = useTranslations();
  const { user, setRequestTokens, setSelectedBroker, currency, setCurrency } =
    useGlobalState();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const isMobile = useIsMobile();

  const navLinks = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/dashboard/charts", label: "Charts" },
    { path: "/dashboard/trades", label: "Trade Book" },
    { path: "/dashboard/journal", label: "Calendar" },
    { path: "/dashboard/addtrades", label: "Add Trades" },
    { path: "/dashboard/connect", label: "Connect Broker" },
    { path: "/dashboard/subscription", label: "Pricing" },
  ];

  const handleConnect = () => {
    trackEvent("clicked_on_connectbroker");
    router.push("/dashboard/connect");
  };

  const handleCurrencyToggle = () => {
    const newCurrency = currency === "INR" ? "USD" : "INR";
    setCurrency(newCurrency);
    trackEvent("currency_changed", { from: currency, to: newCurrency });
  };

  async function handleLogout() {
    setSelectedBroker(null);
    setRequestTokens([]);
    removeCookie("connectedBroker");
    setRequestTokens(null);
    localStorage.clear(); // clears persisted zustand slice too
    await logout();
    window.location.href = "/signup";
  }

  const isActive = (path) => pathname === path;

  return (
    <>
      <div className="w-full flex overflow-y-auto h-full justify-between items-center p-4 bg-white/80 backdrop-blur-sm border-b border-neutral-200 dark:bg-neutral-900/80 dark:border-neutral-700">
        {/* Left Side */}
        <div className="flex items-center space-x-8">
          <Link href="/dashboard">
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
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navLinks.map(({ path, label }) => (
              <Link
                key={path}
                href={path}
                className={`text-[16px] font-medium pb-1 transition-colors ${
                  isActive(path)
                    ? "text-[#009966] border-b-2 border-[#009966]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-3">
          {/* Desktop Actions */}
          <GetOrders showElseCondition={true} />
          <div className="hidden md:flex items-center space-x-3">
            {onTasksClick && (
              <Button
                variant="outline"
                size="sm"
                onClick={onTasksClick}
                className="gap-2"
              >
                <Target className="h-4 w-4 text-green-600" />
                Tasks
              </Button>
            )}

            <ModeToggle />
          </div>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <User className="h-4 w-4" />
                {/* {!isMobile && (user?.displayName || user?.email || "NA")} */}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {/* <DropdownMenuItem>Account Settings</DropdownMenuItem>
              <DropdownMenuItem>Language</DropdownMenuItem> */}

              {/* Currency Toggle */}
              <div className="flex items-center justify-between px-2 py-1.5 text-sm">
                <span>Currency:</span>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={currency === "INR" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    INR
                  </Badge>
                  <Switch
                    checked={currency === "USD"}
                    onCheckedChange={handleCurrencyToggle}
                    size="sm"
                  />
                  <Badge
                    variant={currency === "USD" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    USD
                  </Badge>
                </div>
              </div>

              <DropdownMenuSeparator />
              {/* <DropdownMenuItem>AI Voice Settings</DropdownMenuItem> */}
              <DropdownMenuItem asChild>
                <Link href="/dashboard/subscription">Subscription</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>Export Data</DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
              >
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu Sheet */}
          <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="lg:hidden">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-64">
              <SheetHeader className="">
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>

              <div className="flex flex-col h-full">
                {/* Mobile Navigation Links */}
                <nav className="flex-1 m-2">
                  {navLinks.map(({ path, label }) => (
                    <Link
                      key={path}
                      href={path}
                      onClick={() => setShowMobileMenu(false)}
                      className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                        isActive(path)
                          ? "bg-green-50 text-[#009966] dark:bg-green-900/20"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      }`}
                    >
                      {label}
                    </Link>
                  ))}
                </nav>
                <SheetFooter>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Theme</span>
                    <ModeToggle />
                  </div>

                  {onTasksClick && (
                    <Button
                      onClick={() => {
                        onTasksClick();
                        setShowMobileMenu(false);
                      }}
                      className="w-full gap-2"
                      variant="outline"
                    >
                      <Target className="h-4 w-4 text-green-600" />
                      Tasks
                    </Button>
                  )}
                </SheetFooter>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  );
};

export default Navbar;
