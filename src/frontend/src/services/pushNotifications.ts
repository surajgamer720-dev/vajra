/** Browser-side Web Push helpers. Set VITE_PUSH_API_URL to the deployed API URL. */
const PUSH_API_URL = import.meta.env.VITE_PUSH_API_URL || "http://localhost:8787";

function base64UrlToUint8Array(value: string): Uint8Array {
  const padded = value.padEnd(value.length + ((4 - (value.length % 4)) % 4), "=");
  const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
  const bytes = atob(base64);
  return Uint8Array.from(bytes, (character) => character.charCodeAt(0));
}

export function isPushSupported(): boolean {
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

export async function enablePushNotifications(): Promise<PushSubscription> {
  if (!isPushSupported()) throw new Error("Push notifications are not supported by this browser.");
  if (await Notification.requestPermission() !== "granted") {
    throw new Error("Notification permission was not granted.");
  }

  const keyResponse = await fetch(PUSH_API_URL + "/api/push/public-key");
  if (!keyResponse.ok) throw new Error("Could not load the push public key.");
  const { publicKey } = (await keyResponse.json()) as { publicKey: string };
  const registration = await navigator.serviceWorker.ready;
  const subscription = (await registration.pushManager.getSubscription()) ||
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64UrlToUint8Array(publicKey) as unknown as BufferSource,
    }));

  const saveResponse = await fetch(PUSH_API_URL + "/api/push/subscriptions", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(subscription),
  });
  if (!saveResponse.ok) throw new Error("Could not save the push subscription.");
  return subscription;
}

export async function disablePushNotifications(): Promise<void> {
  if (!isPushSupported()) return;
  const subscription = await (await navigator.serviceWorker.ready).pushManager.getSubscription();
  if (subscription) await subscription.unsubscribe();
}
