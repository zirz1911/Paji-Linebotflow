import { useState } from "react";

const KEY = "paji_settings";
const SERVER = "http://localhost:3001";

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
  catch { return {}; }
}

export function useSettings() {
  const [settings, setSettings] = useState(load);

  const setApiKey = (apiKey) => {
    const next = { ...load(), apiKey };
    localStorage.setItem(KEY, JSON.stringify(next));
    setSettings(next);
    // push to server (fire and forget)
    fetch(`${SERVER}/api/settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey }),
    }).catch(() => {});
  };

  return { apiKey: settings.apiKey || "", setApiKey };
}
