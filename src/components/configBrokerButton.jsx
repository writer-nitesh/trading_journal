"use client";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CodeCopy } from "@/components/codeCopy";
import { Button } from "@/components/ui/button";
import { MoveRightIcon, ExternalLink } from "lucide-react";
import { saveCredentials } from "@/lib/firebase/database/index";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import useGlobalState from "@/hooks/globalState";
import { useRouter } from "next/navigation";
import { removeCookie, setConnectedBroker } from "@/lib/utils";
import { trackEvent } from "@/lib/mixpanelClient";
import { BROKER } from "@/lib/brokers/brokers";
import { Zap } from "lucide-react";
import { Shield } from "lucide-react";
import { getKotakOrders } from "@/lib/brokers/kotakneo";

const ConfigureButton = ({ broker, credential }) => {
  const {
    name: brokerName,
    action: brokerAction,
    getAPIURL: brokerURL,
    tutorialIframeUrl,
    requiredFields,
    needRedirect,
  } = broker;

  const {
    credentials,
    setCredentials,
    setSelectedBroker,
    requestTokens,
    setRequestTokens,
  } = useGlobalState();

  const [isCreds, setIsCreds] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  const router = useRouter();
  const findCredential = (name) =>
    credentials?.find((cred) => cred.broker === name.toLowerCase());

  const creds = findCredential(brokerName);

  const { register, handleSubmit, reset } = useForm({});

  const isConnected = requestTokens;

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      const creds = findCredential(brokerName);
      if (creds) {
        reset(creds);
      }
    }
  }, [open, credential, brokerName, credentials, reset]);

  useEffect(() => {
    const creds = findCredential(brokerName);
    if (!creds) {
      setIsCreds(true);
    } else {
      setIsCreds(false);
    }
  }, [credentials, brokerName]);

  const onSubmit = async (formData) => {
    const payload = {
      ...formData,
      broker: brokerName.toLowerCase(),
    };
    console.log(payload);

    try {
      const res = await saveCredentials(payload);
      toast.success("Credentials saved!");
    } catch (error) {
      toast.error(error.message || "Save failed");
    }
  };

  async function handleConnect(credentials) {

    console.log("CONNECTING LOGS : ", credentials);


    if (requestTokens) {
      toast.info(`Disconnecting ${requestTokens.broker}...`);
    }

    try {
      if (credentials.broker === BROKER.ZERODHA) {
        const link = await brokerAction(credentials.api_key);
        setSelectedBroker(brokerName);
        router.push(link);
        if (brokerName === "zerodha") {
          trackEvent("broker_connected");
        }
      }

      if (credentials.broker === BROKER.DHAN) {
        await brokerAction(credentials.broker, credentials.access_token);
        setRequestTokens({
          token: credentials.access_token,
          broker: credentials.broker,
        });
        setOpen(false);
        toast.success("Connected successfully");
        router.push("/dashboard/connect");
      }

      if (credentials.broker === BROKER.GROWW) {
        await brokerAction(credentials.broker, credentials.access_token);
        setRequestTokens({
          token: credentials.access_token,
          broker: credentials.broker,
        });
        setOpen(false);
        toast.success("Connected successfully");
        router.push("/dashboard/connect");
      }

      if (credentials.broker === BROKER.KOTAKNEO) {

        const data = await brokerAction(credentials.consumer_key, credentials.consumer_secret, credentials.mobileNumber,
          credentials.ucc,
          credentials.secret, credentials.mpin);


        if (data.status !== "error") {
          setConnectedBroker(
            credentials.broker,
            {

              accessToken: data.accessToken,
              sessionId: data.sessionId,
              sessionToken: data.sessionToken
            },

            30
          )
          router.push("/dashboard/connect");
          setRequestTokens({
            token: {
              accessToken: data.accessToken,
              sessionId: data.sessionId,
              sessionToken: data.sessionToken
            },
            broker: credentials.broker,
          });
          setOpen(false);
          toast.success("Connected successfully");
        }
        else {
          toast.error(data.error)
        }

      }

      if (credentials.broker === BROKER.DELTAEXCHANGE) {
        await brokerAction(credentials.broker, credentials.api_secret, credentials.api_key);
        setRequestTokens({
          token: credentials.access_token,
          broker: credentials.broker,
        });
        setOpen(false);
        toast.success("Connected successfully");
        router.push("/dashboard/connect");
      }

      if (credentials.broker === BROKER.FYERS) {
        const link = await brokerAction(credentials.app_id);
        router.push(link);
      }

      if (credentials.broker === BROKER.UPSTOX) {
        const redirectURL =
          process.env.NODE_ENV === "development"
            ? "http://localhost:3000/dashboard/connect"
            : "https://www.tradiohub.com/dashboard/connect";
        const link = await brokerAction(credentials.api_key, redirectURL);
        router.push(link);
      }

      if (credentials.broker === BROKER.ANGLEONE) {
        const link = await brokerAction(credentials.api_key);
        router.push(link);
      }
    } catch (error) {
      console.log(error);

      toast.error(error.message || "Connection failed");
      removeCookie("connectedBroker");
      setSelectedBroker(null);
      setRequestTokens(null);
    }
  }

  function handleDisconnect() {
    removeCookie("connectedBroker");
    setRequestTokens(null);
    setSelectedBroker(null);
    toast.success(`${requestTokens.broker} disconnected successfully`);
  }

  // Track when dialog opens (user wants to see the video)
  const handleDialogOpen = () => {
    setOpen(true);
    trackEvent("clicked_on_youtubevideo", {
      broker: brokerName,
      action: "opened_dialog",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen} className="rounded-md">
      <DialogTrigger asChild onClick={handleDialogOpen}>
        {isConnected && isConnected.broker === brokerName.toLowerCase() ? (
          <button
            disabled={!broker.isAvailable}
            className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-white dark:bg-neutral-900 border border-emerald-200 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 rounded-xl font-semibold hover:bg-emerald-50 dark:hover:bg-neutral-800 hover:border-emerald-300 hover:-translate-y-0.5 transition-all duration-200 shadow-sm hover:shadow-md text-sm sm:text-base"
          >
            Manage
          </button>
        ) : (
          <button
            disabled={!broker.isAvailable}
            className="w-full px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-emerald-700 hover:-translate-y-0.5 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
            {!broker.isAvailable ? "Coming Soon" : "Connect"}
          </button>
        )}
      </DialogTrigger>

      <DialogContent className="p-0 w-[95vw] sm:w-full max-w-lg mx-auto h-[90vh] sm:h-[95vh] rounded-xl sm:rounded-2xl shadow-2xl flex flex-col dark:bg-neutral-900">
        <div className="flex flex-col h-full">
          <DialogHeader className="sticky top-0 p-4 sm:p-4 border-b border-neutral-200 dark:border-neutral-700 flex-shrink-0 bg-white dark:bg-neutral-900 rounded-t-xl sm:rounded-t-2xl">
            <div>
              <DialogTitle className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-neutral-100 truncate pr-8">
                Connect {brokerName}
              </DialogTitle>
              <DialogDescription className="text-neutral-600 dark:text-neutral-400 text-sm">
                Enter your API credentials to connect
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg border-2 border-dashed border-neutral-300 dark:border-neutral-700 p-2">
              <div className="flex items-center justify-center h-32 sm:h-48 bg-neutral-200 dark:bg-neutral-700 rounded-lg">
                {tutorialIframeUrl && !iframeError ? (
                  <iframe
                    className="w-full h-full rounded-lg"
                    src={tutorialIframeUrl}
                    title={`${brokerName} tutorial`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                    onError={() => setIframeError(true)}
                    onLoad={() => console.log("Iframe loaded successfully")}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm text-center">
                      {iframeError
                        ? "Video failed to load"
                        : "No tutorial available"}
                    </p>
                    {tutorialIframeUrl && (
                      <a
                        href={tutorialIframeUrl.replace("/embed/", "/watch?v=")}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm underline"
                      >
                        Watch on YouTube
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Credentials Form */}
            <form
              id="brokerForm"
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4 mt-4"
            >
              <div className="flex flex-col gap-2">
                <h3 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  🔑 API Credentials
                </h3>
                <Link
                  href={brokerURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-500 text-sm font-medium underline self-start"
                >
                  Get API Keys →
                </Link>
              </div>

              <div className="grid gap-4">
                {requiredFields.map((field, index) => (
                  <div key={index} className="grid gap-2">
                    <Label
                      htmlFor={field.name}
                      className="text-sm font-medium dark:text-neutral-200"
                    >
                      {field.label}
                    </Label>
                    <Input
                      id={field.name}
                      className="rounded-md text-base dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700"
                      {...register(field.name)}
                      type={field.type}
                      placeholder={field.placeholder}
                      required={field.required}
                    />
                  </div>
                ))}
              </div>
              {needRedirect && (
                <div>
                  <CodeCopy
                    name="Redirect URL"
                    value={
                      process.env.NODE_ENV === "development"
                        ? "http://localhost:3000/dashboard/connect"
                        : "https://www.tradiohub.com/dashboard/connect"
                    }
                  />
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Use this URL in your broker's app settings
                  </p>
                </div>
              )}

              <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-blue-900 dark:text-blue-200 font-medium mb-1 text-sm">
                      Secure Connection
                    </h4>
                    <p className="text-blue-800 dark:text-blue-300 text-xs leading-relaxed">
                      Your API credentials are encrypted and stored securely.
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Dialog Footer */}
          <DialogFooter className="bg-white dark:bg-neutral-900 p-4 border-t border-neutral-200 dark:border-neutral-700 flex-shrink-0 rounded-b-xl sm:rounded-b-2xl">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 w-full">
              <Button
                type="submit"
                form="brokerForm"
                className="bg-blue-600 hover:bg-blue-700 flex-1 text-sm py-3 sm:py-2 cursor-pointer order-2 sm:order-1 dark:text-white"
              >
                Save Changes
              </Button>

              {isConnected &&
                isConnected.broker === brokerName.toLowerCase() ? (
                <Button
                  type="button"
                  onClick={() => handleDisconnect()}
                  variant="destructive"
                  className="flex-1 text-sm py-3 sm:py-2 flex items-center justify-center gap-1 cursor-pointer order-1 sm:order-2 dark:text-white"
                >
                  <span>Disconnect</span>
                  <MoveRightIcon className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  disabled={isCreds}
                  className="bg-green-600 hover:bg-green-700 flex-1 text-sm py-3 sm:py-2 flex items-center justify-center dark:text-white gap-1 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed order-1 sm:order-2"
                  onClick={() => handleConnect(creds)}
                >
                  <span>Connect</span>
                  <MoveRightIcon className="w-4 h-4" />
                </Button>
              )}
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfigureButton;
