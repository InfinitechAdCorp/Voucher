'use client';

import { useEffect, useState } from "react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === "accepted") {
      setShowInstall(false);
    }
  };

  if (!showInstall) return null;

  return (
    <button
      onClick={handleInstall}
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        backgroundColor: "#2563eb",
        color: "#fff",
        border: "none",
        borderRadius: "9999px",
        padding: "12px 20px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
        cursor: "pointer",
        zIndex: 1000,
      }}
    >
      📲 Install App
    </button>
  );
}
