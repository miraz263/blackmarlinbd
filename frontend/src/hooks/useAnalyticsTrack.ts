import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { analyticsService } from "@/services/analyticsService";

export function useAnalyticsTrack() {
  const location = useLocation();
  const prevPath = useRef<string>("");

  useEffect(() => {
    const path = location.pathname + location.search;
    if (path === prevPath.current) return;
    prevPath.current = path;

    // Fire-and-forget — never block the UI
    analyticsService.collect(path, document.referrer);
  }, [location.pathname, location.search]);
}
