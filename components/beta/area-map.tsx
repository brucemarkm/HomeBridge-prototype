"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Home } from "../../lib/homebridge/schema";
import { dollars } from "../../lib/homebridge/finance";
export default function AreaMap({ homes }: { homes: Home[] }) {
  const el = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let disposed = false;
    let map: import("maplibre-gl").Map | undefined;
    void import("maplibre-gl").then((m) => {
      if (!el.current || disposed) return;
      try {
        map = new m.Map({
          container: el.current,
          style: {
            version: 8,
            sources: {
              osm: {
                type: "raster",
                tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
                tileSize: 256,
                attribution: "© OpenStreetMap contributors",
              },
            },
            layers: [{ id: "osm", type: "raster", source: "osm" }],
          },
          center: [-111.7, 40.28],
          zoom: 9,
        });
        map.addControl(new m.NavigationControl({ showCompass: false }));
        map.on("error", () => setFailed(true));
        for (const home of homes) {
          if (home.latitude === null || home.longitude === null) continue;
          const button = document.createElement("button");
          button.className = "hb-map-marker";
          button.textContent = home.price ? dollars(home.price) : "View";
          button.setAttribute("aria-label", `View ${home.address} on map`);
          button.onclick = () =>
            router.push(`/homes/${encodeURIComponent(home.id)}`);
          new m.Marker({ element: button })
            .setLngLat([home.longitude, home.latitude])
            .addTo(map);
        }
      } catch {
        setFailed(true);
      }
    });
    return () => {
      disposed = true;
      map?.remove();
    };
  }, [homes, router]);
  return (
    <section className="hb-map-area" aria-label="Property area map">
      <div ref={el} className="hb-map-canvas" />
      {failed && (
        <div className="hb-map-fallback">
          <strong>Map tiles could not load.</strong>
          <p>Your home list still works. Use the area links below.</p>
          {homes
            .filter((h) => h.latitude !== null && h.longitude !== null)
            .map((h) => (
              <a
                key={h.id}
                href={`https://www.openstreetmap.org/?mlat=${h.latitude}&mlon=${h.longitude}#map=12/${h.latitude}/${h.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {h.address} · {h.city}
              </a>
            ))}
        </div>
      )}
      <p>
        Demo coordinates indicate approximate city areas, not actual addresses.
        No marker is shown where coordinates are unknown.
      </p>
    </section>
  );
}
