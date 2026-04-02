import { useState, useEffect } from "react";

function parseHash(hash) {
  const path = hash.replace(/^#/, "") || "/";
  const match = path.match(/^\/editor\/(.+)$/);
  if (match) return { page: "editor", flowId: match[1] };
  return { page: "dashboard", flowId: null };
}

export function useRouter() {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));

  useEffect(() => {
    const onHash = () => setRoute(parseHash(window.location.hash));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const navigate = (path) => { window.location.hash = path; };

  return { ...route, navigate };
}
