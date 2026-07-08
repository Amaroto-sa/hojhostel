"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

export default function TawkToWidget() {
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [widgetId, setWidgetId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch settings to get the Tawk.to IDs dynamically
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.tawkto_property_id && data.tawkto_widget_id) {
          setPropertyId(data.tawkto_property_id);
          setWidgetId(data.tawkto_widget_id);
        }
      })
      .catch((err) => console.error("Failed to fetch Tawk.to settings:", err));
  }, []);

  if (!propertyId || !widgetId) return null;

  return (
    <Script id="tawkto-script" strategy="lazyOnload">
      {`
        var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
        (function(){
        var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
        s1.async=true;
        s1.src='https://embed.tawk.to/${propertyId}/${widgetId}';
        s1.charset='UTF-8';
        s1.setAttribute('crossorigin','*');
        s0.parentNode.insertBefore(s1,s0);
        })();
      `}
    </Script>
  );
}
