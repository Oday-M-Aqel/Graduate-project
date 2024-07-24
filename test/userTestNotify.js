const publicVapidKey = 'BIfnXiQ8o1KKEM75QjeKg9Q16hA956r7RolBrUmbHnBcuBrk3Giyvk3sb2feXYiE9Vkk-ObPF9Nmf4DhG8J_Hfo';

// Check for service worker
if ('serviceWorker' in navigator) {
    send().catch(err => console.error('Service Worker registration error:', err));
  }
  
  // Register ServiceWorker, Register Push, Send Push
  async function send() {
    console.log("Registering Service Worker...");
    const register = await navigator.serviceWorker.register('/js/worker.js');
    console.log('Service Worker Registered:', register);
    console.log('I am here');
    // Register Push
    console.log("Registering Push...");
    const subscription = await register.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
    });
    console.log("Push Registered:", subscription);
  
    // Send push notification
    console.log("Sending Push...");
    await fetch('/user/dashboard', {
      method: "POST",
      body: JSON.stringify(subscription),
      headers: {
        'content-type': 'application/json'
      }
    });
    console.log("Push Sent");
  }
  
  function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }