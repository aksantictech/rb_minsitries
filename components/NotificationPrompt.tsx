"use client";

import { Bell, BellRing, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "./LanguageProvider";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

export default function NotificationPrompt({ compact = false }: { compact?: boolean }) {
  const { language, t } = useLanguage();
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const supported =
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;

    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);
      checkExistingSubscription();
    }
  }, []);

  async function checkExistingSubscription() {
    const registration = await navigator.serviceWorker.getRegistration();
    const subscription = await registration?.pushManager.getSubscription();
    setIsSubscribed(Boolean(subscription));
  }

  async function enableNotifications() {
    setMessage("");
    setIsLoading(true);

    try {
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!publicKey) {
        throw new Error("Clé publique VAPID manquante.");
      }

      const nextPermission = await Notification.requestPermission();
      setPermission(nextPermission);

      if (nextPermission !== "granted") {
        setMessage("Les notifications n’ont pas été autorisées sur ce téléphone.");
        setIsLoading(false);
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js");
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      const response = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...subscription.toJSON(),
          userAgent: navigator.userAgent,
          languageCode: language,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur d’abonnement aux notifications.");
      }

      setIsSubscribed(true);
      setMessage("Notifications activées avec succès.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erreur inconnue.");
    }

    setIsLoading(false);
  }

  if (!isSupported) return null;

  if (compact && isSubscribed) return null;

  return (
    <section className="section notification-section" style={{ paddingTop: compact ? 10 : 18, paddingBottom: compact ? 10 : 18 }}>
      <div className="container">
        <div
          className="card rb-gold-glow"
          style={{
            padding: compact ? 18 : 24,
            display: "grid",
            gridTemplateColumns: "auto minmax(0, 1fr) auto",
            gap: 18,
            alignItems: "center",
            borderColor: "rgba(217,164,65,0.3)",
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 18,
              display: "grid",
              placeItems: "center",
              background: "rgba(217,164,65,0.12)",
              color: "var(--gold-bright)",
            }}
          >
            {isSubscribed ? <BellRing size={26} /> : <Bell size={26} />}
          </div>

          <div>
            <h2 style={{ margin: 0, fontSize: compact ? 20 : 26 }}>
              {isSubscribed ? "Notifications activées" : t("notificationsTitle")}
            </h2>
            <p style={{ margin: "6px 0 0", color: "var(--muted)", lineHeight: 1.6 }}>
              {isSubscribed
                ? "Vous recevrez les publications du ministère dans la langue sélectionnée."
                : t("notificationsText")}
            </p>
            {message ? (
              <p style={{ margin: "8px 0 0", color: "var(--gold-bright)", fontWeight: 800 }}>
                {message}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={enableNotifications}
            disabled={isLoading || permission === "denied" || isSubscribed}
            style={{ cursor: isLoading || isSubscribed ? "not-allowed" : "pointer" }}
          >
            <ShieldCheck size={18} />
            {isSubscribed ? "Activées" : isLoading ? "Activation..." : t("notificationsButton")}
          </button>
        </div>
      </div>
    </section>
  );
}
