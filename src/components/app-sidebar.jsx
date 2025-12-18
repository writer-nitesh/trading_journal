"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";
import DashboardIcon from "@/icons/dashboardIcon";
import JournalIcon from "@/icons/journalIcon";
import ReviewIcon from "@/icons/reviewIcon";
import { uploadBugReport } from "@/lib/firebase/database/bugReports"; // We'll create this function
import { clientApp } from "@/lib/firebase/index";
import { trackEvent } from '@/lib/mixpanelClient';
import { addDoc, collection, getFirestore, Timestamp } from "firebase/firestore";
import { Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CiViewTable } from "react-icons/ci";
import { LiaBugSolid } from "react-icons/lia";
import { toast } from "sonner";

const db = getFirestore(clientApp);

export function AppSidebar({ pathname }) {
  const t = useTranslations();
  const router = useRouter();
  const [openBugDialog, setOpenBugDialog] = useState(false);
  const [bugText, setBugText] = useState("");
  const [bugImage, setBugImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBugImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);
      const base64Buffer = Buffer.from(buffer).toString("base64");

      if (bugImage) {
        await fetch("/api/delete-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: bugImage }),
        });
      }

      const response = await fetch("/api/upload-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buffer: base64Buffer,
          originalFileName: file.name,
          contentType: file.type,
          folderName: "bug_images",
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setBugImage(data.url);
      toast.success("Image uploaded successfully!");
    } catch (err) {
      toast.error("Failed to upload image.");
      console.error("Upload failed:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleBugSubmit = async () => {
    setIsSubmitting(true);
    try {
      await uploadBugReport(bugText, bugImage);
      setBugText("");
      setBugImage(null);
      setOpenBugDialog(false);
      toast.success("Bug report submitted successfully!");

      // Track Mixpanel event for bug report submission
      trackEvent("reported_bugs", {
        hasImage: !!bugImage,
        textLength: bugText.length,
      });
    } catch (err) {
      console.error("Bug report error:", err);
      toast.error("Failed to submit bug report.");
    }
    setIsSubmitting(false);
  };

  // Feedback dialog state
  const [openFeedbackDialog, setOpenFeedbackDialog] = useState(false);
  const [like, setLike] = useState("");
  const [hate, setHate] = useState("");
  const [features, setFeatures] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const handleFeedbackSubmit = async () => {
    setIsSubmittingFeedback(true);
    try {
      await addDoc(collection(db, "feedback"), {
        like,
        hate,
        features,
        createdAt: Timestamp.now(),
      });
      setLike("");
      setHate("");
      setFeatures("");
      setOpenFeedbackDialog(false);
      toast.success("Feedback submitted successfully!");

      // Track Mixpanel event for feedback submission
      trackEvent("shared_feedback", {
        hasLike: !!like,
        hasHate: !!hate,
        hasFeatures: !!features,
        totalLength:
          (like?.length || 0) + (hate?.length || 0) + (features?.length || 0),
      });
    } catch (err) {
      console.error("Feedback error:", err);
      toast.error("Failed to submit feedback.");
    }
    setIsSubmittingFeedback(false);
  };
  // Orufy dialog state
  const [openOrufyDialog, setOpenOrufyDialog] = useState(false);
  const orufyRef = useRef(null);

  // Orufy widget effect
  useEffect(() => {
    if (openOrufyDialog && typeof window !== "undefined") {
      // Add stylesheet
      if (!document.getElementById("orufy-widget-css")) {
        const link = document.createElement("link");
        link.id = "orufy-widget-css";
        link.rel = "stylesheet";
        link.href = "https://orufybookings.com/external/widget.css";
        link.type = "text/css";
        link.media = "all";
        document.head.appendChild(link);
      }

      // Add script
      if (!document.getElementById("orufy-widget-js")) {
        const script = document.createElement("script");
        script.id = "orufy-widget-js";
        script.type = "module";
        script.src = "https://orufybookings.com/external/widget.js";
        document.body.appendChild(script);
      }

      // Initialize widget after script loads
      setTimeout(() => {
        if (window.orufyBookings && orufyRef.current) {
          window.orufyBookings.InLineWidget();
        }
      }, 500);
    }
  }, [openOrufyDialog]);

  const items = [
    {
      title: t("sidebar.journal"),
      url: "/dashboard/journal",
      icon: JournalIcon,
    },
    {
      title: t("sidebar.dashboard"),
      url: "/dashboard",
      icon: DashboardIcon,
    },

    // {
    //     title: t("sidebar.connect"),
    //     url: "/dashboard/connect",
    //     icon: connect_broker,
    // },
    {
      title: "All Trades",
      url: "/dashboard/trades",
      icon: CiViewTable,
    },
    {
      title: t("sidebar.review"),
      url: "/dashboard/review",
      icon: ReviewIcon,
    },
  ];

  const { setOpenMobile, isMobile } = useSidebar();

  const handleMobileClose = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar
      className={`flex flex-col px-2 !bg-[#FCFDFF] dark:!bg-[#28292c] text-black  dark:text-white'}`}
    >
      <SidebarHeader
        className={`flex justify-center items-center m-0 pt-1 !bg-white text-black dark:!bg-[#28292c] dark:text-white`}
      >
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
      </SidebarHeader>

      <SidebarContent className="!bg-[#FCFDFF] dark:!bg-[#28292c]text-black dark:!bg-[#28292c] dark:text-white pt-2">
        <SidebarMenu>
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  className={`hover:bg-[#eef4ff] dark:hover:bg-neutral-800 text-black dark:text-white cursor-pointer`}
                >
                  {item.url === "/dashboard/review" ? (
                    <button
                      type="button"
                      className={`py-6 text-[16px] flex items-center w-full ${pathname === "/dashboard/journal"
                        ? "text-black dark:text-white"
                        : "text-black dark:text-white"
                        }`}
                      onClick={() => {
                        trackEvent("clicked_on_reviewyourjournal");
                        router.push("/dashboard/review");
                        handleMobileClose();
                      }}
                    >
                      <div>
                        <Icon />
                      </div>

                      <span className={"text-black dark:text-white "}>
                        {item.title}
                      </span>
                    </button>
                  ) : (
                    <Link
                      href={item.url}
                      className={`py-6 text-[16px] flex items-center w-full ${pathname === "/dashboard/journal"
                        ? "text-black dark:text-white"
                        : "text-black dark:text-white"
                        }`}
                      onClick={handleMobileClose} // Close sidebar on mobile
                    >
                      <div>
                        <Icon className=" text-2xl" />
                      </div>
                      <span
                        className={
                          pathname === "/dashboard/journal"
                            ? "text-black dark:text-white"
                            : "text-black dark:text-white"
                        }
                      >
                        {item.title}
                      </span>
                    </Link>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter
        className={
          "!bg-white text-black dark:text-white!bg-[#FCFDFF] dark:!bg-[#28292c] p-0 m-0 py-2"
        }
      >
        <SidebarMenu>
          <SidebarMenuItem>
            <Dialog open={openBugDialog} onOpenChange={setOpenBugDialog}>
              <DialogTrigger asChild className="cursor-pointer">
                <SidebarMenuButton
                  asChild
                  className="hover:bg-[#eef4ff] dark:hover:bg-neutral-800"
                >
                  <button
                    className="py-6 text-[16px] flex items-center  w-full text-black dark:text-white"
                    type="button"
                  >
                    <div className="text-[20px] flex items-center justify-center">
                      <LiaBugSolid />
                    </div>
                    <span className="text-black dark:text-white">
                      Report Bugs
                    </span>
                  </button>
                </SidebarMenuButton>
              </DialogTrigger>
              <DialogContent className="w-full max-w-lg min-h-[400px]">
                <DialogHeader>
                  <DialogTitle>Report a Bug</DialogTitle>
                </DialogHeader>
                <Textarea
                  placeholder="Describe the bug or issue..."
                  value={bugText}
                  onChange={(e) => setBugText(e.target.value)}
                  className="mb"
                />

                <input
                  id="image_upload"
                  className="hidden"
                  type="file"
                  accept="image/*"
                  onChange={handleBugImageChange}
                />

                {bugImage ? (
                  <label
                    htmlFor="image_upload"
                    className="flex flex-col gap-2 p-0 rounded"
                  >
                    <Image
                      src={bugImage}
                      alt="Chart"
                      className="h-64 w-full object-contain rounded border"
                      width={500}
                      height={500}
                      quality={100}
                      priority
                    />
                  </label>
                ) : (
                  <div className="h-64 bg-neutral-100 dark:bg-neutral-700 rounded flex items-center justify-center">
                    <label
                      htmlFor="image_upload"
                      className="text-center text-neutral-500 dark:text-neutral-400 flex flex-col items-center justify-center"
                    >
                      <Upload />
                      <div>Upload Image</div>
                      {isUploading && (
                        <div className="text-sm text-neutral-900 dark:text-neutral-100 mt-2">
                          Uploading...
                        </div>
                      )}
                    </label>
                  </div>
                )}

                <DialogFooter>
                  <Button onClick={() => setOpenOrufyDialog(true)}>
                    More Feedback
                  </Button>
                  <Button
                    onClick={handleBugSubmit}
                    disabled={isSubmitting || !bugText}
                  >
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Dialog
              open={openFeedbackDialog}
              onOpenChange={setOpenFeedbackDialog}
            >
              <DialogTrigger asChild className="cursor-pointer">
                <SidebarMenuButton
                  asChild
                  className="hover:bg-[#eef4ff] dark:hover:bg-neutral-800"
                >
                  <button
                    className="py-6 text-[16px] flex items-center w-full text-black dark:text-white"
                    type="button"
                  >
                    <ReviewIcon />
                    <span className="text-black dark:text-white">
                      {t("sidebar.feedback")}
                    </span>
                  </button>
                </SidebarMenuButton>
              </DialogTrigger>
              <DialogContent className="max-w-lg sm:max-w-md md:max-w-lg lg:max-w-xl min-h-[400px] w-[95vw] sm:w-full">
                <DialogHeader className="space-y-3">
                  <DialogTitle className="text-lg sm:text-xl">
                    Please share your honest feedback{" "}
                    <span role="img" aria-label="smile">
                      😇
                    </span>
                  </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4 w-full max-h-[60vh] overflow-y-auto px-1">
                  <div className="space-y-2">
                    <label className="font-medium block text-sm sm:text-base">
                      What do you <b>like</b> the most about Tradio ?
                    </label>
                    <Textarea
                      value={like}
                      onChange={(e) => setLike(e.target.value)}
                      className="w-full h-20 sm:h-24 text-sm sm:text-base resize-none"
                      placeholder="Tell us what you love..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-medium block text-sm sm:text-base">
                      What do you <b>hate or feel frustrated</b> about Tradio ?
                    </label>
                    <Textarea
                      value={hate}
                      onChange={(e) => setHate(e.target.value)}
                      className="w-full h-20 sm:h-24 text-sm sm:text-base resize-none"
                      placeholder="What bothers you the most..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-medium block text-sm sm:text-base">
                      What <b>new features</b> would help you trade better ?
                    </label>
                    <Textarea
                      value={features}
                      onChange={(e) => setFeatures(e.target.value)}
                      className="w-full h-20 sm:h-24 text-sm sm:text-base resize-none"
                      placeholder="Suggest new features..."
                    />
                  </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row flex gap-2 pt-4">
                  <Button
                    className="w-full sm:w-auto order-2 sm:order-1"
                    onClick={() => setOpenOrufyDialog(true)}
                  >
                    More Feedback
                  </Button>
                  <Button
                    onClick={handleFeedbackSubmit}
                    disabled={
                      isSubmittingFeedback || (!like && !hate && !features)
                    }
                    className="w-full sm:w-auto order-1 sm:order-2"
                  >
                    {isSubmittingFeedback ? "Submitting..." : "Submit"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <Dialog open={openOrufyDialog} onOpenChange={setOpenOrufyDialog} >
        <DialogContent className="max-w-2xl w-full min-h-[500px] flex flex-col">
          <DialogHeader className="z-10 bg-white dark:bg-[#28292c] pt-4 pb-2">
            <DialogTitle className="text-lg font-semibold">Book a Feedback Session</DialogTitle>
          </DialogHeader>
          <div
            ref={orufyRef}
            style={{ height: "calc(100dvh - 80px)", marginBottom: "16px", marginTop: "8px" }}
            className="orufy-bookings-inline-widget"
            data-access-link="/tradio/feedback-session?BackgroundColor=FFFFFF&TextColor=363942&ButtonColor=098666"
          ></div>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
}