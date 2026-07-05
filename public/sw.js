self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = {};

  if (event.data) {
    try {
      data = event.data.json();
    } catch (error) {
      data = { title: "Roy Bondo Ministries", body: event.data.text() };
    }
  }

  const title = data.title || "Roy Bondo Ministries";
  const options = {
    body: data.body || "Nouvelle publication du ministère.",
    icon: data.icon || "/images/logo_rb.png",
    badge: data.badge || "/images/logo_rb.png",
    image: data.image,
    data: {
      url: data.url || "/",
      publicationId: data.publicationId || null,
    },
    vibrate: [120, 80, 120],
    requireInteraction: false,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification?.data?.url || "/";
  const normalizedUrl = new URL(targetUrl, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url === normalizedUrl && "focus" in client) {
          return client.focus();
        }
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(normalizedUrl);
      }

      return undefined;
    })
  );
});
