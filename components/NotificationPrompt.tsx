"use client";

import { Bell, BellRing, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

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
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(Boolean(subscription));
    } catch {
      setIsSubscribed(false);
    }
  }

  async function enableNotifications() {
    setMessage("");

    if (!isSupported) {
      setMessage("Les notifications ne sont pas supportées par ce navigateur.");
      return;
    }

    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

    if (!vapidPublicKey) {
      setMessage("La clé publique VAPID n’est pas encore configurée.");
      return;
    }

    setIsLoading(true);

    try {
      const nextPermission = await Notification.requestPermission();
      setPermission(nextPermission);

      if (nextPermission !== "granted") {
        setMessage("Les notifications n’ont pas été activées.");
        setIsLoading(false);
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js");
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });
      }

      const subscriptionJson = subscription.toJSON();

      const response = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: subscriptionJson.keys,
          userAgent: navigator.userAgent,
        }),
      });

      if (!response.ok) {
        throw new Error("Impossible d’enregistrer l’abonnement.");
      }

      setIsSubscribed(true);
      setMessage("Notifications activées. Vous recevrez les publications du ministère.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erreur d’activation des notifications.");
    }

    setIsLoading(false);
  }

  if (!isSupported) {
    return null;
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={enableNotifications}
        disabled={isLoading || isSubscribed || permission === "denied"}
        className="btn btn-secondary"
        style={{ cursor: isLoading || isSubscribed ? "not-allowed" : "pointer" }}
        title={message || "Activer les notifications"}
      >
        {isSubscribed ? <BellRing size={18} /> : <Bell size={18} />}
        {isSubscribed ? "Notifications actives" : "Notifications"}
      </button>
    );
  }

  return (
    <section className="section" style={{ paddingTop: 12, paddingBottom: 18 }}>
      <div className="container">
        <div
          className="card rb-gold-glow"
          style={{
            padding: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
            flexWrap: "wrap",
            borderColor: "rgba(217,164,65,0.32)",
          }}
        >
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 18,
                background: "rgba(217,164,65,0.12)",
                display: "grid",
                placeItems: "center",
                color: "var(--gold-bright)",
              }}
            >
              <ShieldCheck size={27} />
            </div>

            <div>
              <h2 style={{ margin: 0, fontSize: 22 }}>Activez les notifications du ministère</h2>
              <p style={{ margin: "7px 0 0", color: "var(--muted)", lineHeight: 1.6 }}>
                Recevez les messages d’encouragement, nouvelles vidéos, sorties de livres et rappels spirituels directement sur votre téléphone.
              </p>
              {message ? (
                <p style={{ margin: "8px 0 0", color: "var(--gold-bright)", fontWeight: 800 }}>
                  {message}
                </p>
              ) : null}
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={enableNotifications}
            disabled={isLoading || isSubscribed || permission === "denied"}
            style={{ cursor: isLoading || isSubscribed ? "not-allowed" : "pointer" }}
          >
            {isSubscribed ? <BellRing size={18} /> : <Bell size={18} />}
            {isLoading
              ? "Activation..."
              : isSubscribed
                ? "Notifications activées"
                : permission === "denied"
                  ? "Notifications bloquées"
                  : "Activer les notifications"}
          </button>
        </div>
      </div>
    </section>
  );
}
