"use client";

import { useEffect, useRef, useState } from "react";

interface MapSelectorProps {
  address: string;
  onChangeAddress: (addr: string) => void;
  lang: string;
}

export default function MapSelector({ address, onChangeAddress, lang }: MapSelectorProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapType, setMapType] = useState<"google" | "leaflet" | "loading">("loading");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [geocodingStatus, setGeocodingStatus] = useState("");

  const googleMapRef = useRef<any>(null);
  const googleMarkerRef = useRef<any>(null);

  const leafletMapRef = useRef<any>(null);
  const leafletMarkerRef = useRef<any>(null);

  // Check which Map API to load
  const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  useEffect(() => {
    if (googleApiKey) {
      loadGoogleMaps();
    } else {
      loadLeafletMap();
    }

    return () => {
      // Cleanup leaflet map if necessary
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Update searchQuery when external address updates (initial load or page changes)
  useEffect(() => {
    if (address && searchQuery === "") {
      setSearchQuery(address);
    }
  }, [address]);

  // --- GOOGLE MAPS API LOADER & INITIALIZER ---
  const loadGoogleMaps = () => {
    if ((window as any).google && (window as any).google.maps) {
      initGoogleMap();
      return;
    }

    const scriptId = "google-maps-script";
    if (document.getElementById(scriptId)) {
      const checkInterval = setInterval(() => {
        if ((window as any).google && (window as any).google.maps) {
          clearInterval(checkInterval);
          initGoogleMap();
        }
      }, 100);
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}&libraries=places`;
    script.async = true;
    script.onload = () => {
      initGoogleMap();
    };
    script.onerror = () => {
      console.warn("Failed to load Google Maps script, falling back to Leaflet.");
      loadLeafletMap();
    };
    document.body.appendChild(script);
  };

  const initGoogleMap = () => {
    if (!mapContainerRef.current) return;
    setMapType("google");

    const defaultLat = 23.7271; // Aizawl
    const defaultLng = 92.7176;

    const maps = (window as any).google.maps;
    const map = new maps.Map(mapContainerRef.current, {
      center: { lat: defaultLat, lng: defaultLng },
      zoom: 14,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });
    googleMapRef.current = map;

    const marker = new maps.Marker({
      position: { lat: defaultLat, lng: defaultLng },
      map: map,
      draggable: true,
    });
    googleMarkerRef.current = marker;

    // Click on Map to place marker
    map.addListener("click", (e: any) => {
      const latLng = e.latLng;
      marker.setPosition(latLng);
      reverseGeocodeGoogle(latLng.lat(), latLng.lng());
    });

    // Drag marker
    marker.addListener("dragend", () => {
      const position = marker.getPosition();
      reverseGeocodeGoogle(position.lat(), position.lng());
    });

    // If initial address is present, try geocoding it to center map
    if (address) {
      geocodeAddressGoogle(address);
    }
  };

  const reverseGeocodeGoogle = (lat: number, lng: number) => {
    setGeocodingStatus(lang === "mz" ? "Hmun awmna zawn mek a ni..." : "Resolving address details...");
    const maps = (window as any).google.maps;
    const geocoder = new maps.Geocoder();

    geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
      if (status === "OK" && results[0]) {
        const formatted = results[0].formatted_address;
        onChangeAddress(formatted);
        setSearchQuery(formatted);
        setGeocodingStatus("");
      } else {
        setGeocodingStatus(lang === "mz" ? "Zawn hmuh a ni lo." : "Address not found.");
      }
    });
  };

  const geocodeAddressGoogle = (query: string) => {
    const maps = (window as any).google.maps;
    const geocoder = new maps.Geocoder();

    geocoder.geocode({ address: query }, (results: any, status: any) => {
      if (status === "OK" && results[0]) {
        const location = results[0].geometry.location;
        googleMapRef.current.setCenter(location);
        googleMarkerRef.current.setPosition(location);
      }
    });
  };

  // --- LEAFLET / OPENSTREETMAP LOADER & INITIALIZER ---
  const loadLeafletMap = () => {
    // Inject CSS if not present
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Inject JS if not present
    const scriptId = "leaflet-js";
    if ((window as any).L) {
      initLeafletMap();
      return;
    }

    if (document.getElementById(scriptId)) {
      const checkInterval = setInterval(() => {
        if ((window as any).L) {
          clearInterval(checkInterval);
          initLeafletMap();
        }
      }, 100);
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => {
      initLeafletMap();
    };
    document.body.appendChild(script);
  };

  const initLeafletMap = () => {
    if (!mapContainerRef.current || leafletMapRef.current) return;
    setMapType("leaflet");

    const defaultLat = 23.7271; // Aizawl
    const defaultLng = 92.7176;

    const L = (window as any).L;

    // Build leafet map instance
    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: false,
    }).setView([defaultLat, defaultLng], 14);
    leafletMapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    // Setup custom icon to prevent Leaflet asset URL path bugs in Next.js
    const LeafletIcon = L.Icon.extend({
      options: {
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      }
    });
    const defaultIcon = new LeafletIcon();

    const marker = L.marker([defaultLat, defaultLng], {
      draggable: true,
      icon: defaultIcon
    }).addTo(map);
    leafletMarkerRef.current = marker;

    // Click event
    map.on("click", (e: any) => {
      const latlng = e.latlng;
      marker.setLatLng(latlng);
      reverseGeocodeLeaflet(latlng.lat, latlng.lng);
    });

    // Drag event
    marker.on("dragend", () => {
      const position = marker.getLatLng();
      reverseGeocodeLeaflet(position.lat, position.lng);
    });

    // If initial address is present, search to position map
    if (address) {
      searchAddressLeaflet(address, false);
    }
  };

  const reverseGeocodeLeaflet = async (lat: number, lng: number) => {
    setGeocodingStatus(lang === "mz" ? "Hmun awmna zawn mek a ni..." : "Resolving address details...");
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=${lang === "mz" ? "en" : lang}`
      );
      const data = await response.json();
      if (data && data.display_name) {
        onChangeAddress(data.display_name);
        setSearchQuery(data.display_name);
        setGeocodingStatus("");
      } else {
        setGeocodingStatus(lang === "mz" ? "Zawn hmuh a ni lo." : "Address not found.");
      }
    } catch (err) {
      setGeocodingStatus(lang === "mz" ? "Hmun awmna zawn a hlawhchham." : "Failed to resolve address.");
    }
  };

  const searchAddressLeaflet = async (query: string, zoom = true) => {
    if (!query) return;
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);

        if (leafletMapRef.current) {
          leafletMapRef.current.setView([latitude, longitude], zoom ? 16 : 14);
        }
        if (leafletMarkerRef.current) {
          leafletMarkerRef.current.setLatLng([latitude, longitude]);
        }
      }
    } catch (err) {
      console.warn("Leaflet geocoding query failed", err);
    }
  };

  // --- SEARCH TRIGGERS ---
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    if (mapType === "google") {
      geocodeAddressGoogle(searchQuery);
      onChangeAddress(searchQuery);
      setSearchLoading(false);
    } else if (mapType === "leaflet") {
      await searchAddressLeaflet(searchQuery, true);
      onChangeAddress(searchQuery);
      setSearchLoading(false);
    } else {
      setSearchLoading(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert(lang === "mz" ? "I browser hian geolocation a support lo." : "Geolocation is not supported by your browser.");
      return;
    }

    setGpsLoading(true);
    setGeocodingStatus(lang === "mz" ? "I awmna zawn mek a ni..." : "Locating you...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        if (mapType === "google") {
          const latLng = new (window as any).google.maps.LatLng(latitude, longitude);
          googleMapRef.current.setCenter(latLng);
          googleMapRef.current.setZoom(16);
          googleMarkerRef.current.setPosition(latLng);
          reverseGeocodeGoogle(latitude, longitude);
        } else if (mapType === "leaflet") {
          if (leafletMapRef.current) {
            leafletMapRef.current.setView([latitude, longitude], 16);
          }
          if (leafletMarkerRef.current) {
            leafletMarkerRef.current.setLatLng([latitude, longitude]);
          }
          reverseGeocodeLeaflet(latitude, longitude);
        }
        setGpsLoading(false);
      },
      (error) => {
        console.warn("Geolocation error", error);
        setGeocodingStatus("");
        setGpsLoading(false);
        alert(
          lang === "mz"
            ? "I awmna hmuh a ni lo. Permission i pe em tih lo check rawh."
            : "Could not retrieve your location. Please check map permissions."
        );
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  return (
    <div style={{
      border: "1px solid rgba(45,106,79,0.12)",
      borderRadius: "16px",
      backgroundColor: "#fafbfc",
      padding: "16px",
      marginTop: "8px",
      display: "flex",
      flexDirection: "column",
      gap: "12px"
    }}>
      {/* Search Input Bar */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={lang === "mz" ? "Hmun hming zawnna (e.g. Chanmari, Aizawl)..." : "Search location on map..."}
          style={{
            flexGrow: 1,
            minWidth: "200px",
            backgroundColor: "#ffffff",
            border: "1px solid #d1d5db",
            borderRadius: "10px",
            padding: "8px 12px",
            fontSize: "13px",
            fontWeight: 600,
            outline: "none"
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSearch(e);
            }
          }}
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={searchLoading}
          style={{
            backgroundColor: "#1c7dfa",
            color: "#ffffff",
            border: "none",
            borderRadius: "10px",
            padding: "8px 16px",
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px"
          }}
        >
          {searchLoading ? (
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            lang === "mz" ? "Zawng rawh" : "Search"
          )}
        </button>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={gpsLoading}
          style={{
            backgroundColor: "#ffffff",
            color: "#1c7dfa",
            border: "1px solid #1c7dfa",
            borderRadius: "10px",
            padding: "8px 16px",
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}
        >
          {gpsLoading ? (
            <svg className="animate-spin h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" style={{ color: "#1c7dfa" }}>
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            "📍 " + (lang === "mz" ? "Hmun awmna hman" : "Use My Location")
          )}
        </button>
      </div>

      {/* Map Loader status or alerts */}
      {geocodingStatus && (
        <div style={{ fontSize: "11px", color: "#1c7dfa", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
          <span className="animate-pulse">●</span> {geocodingStatus}
        </div>
      )}

      {/* Map Canvas */}
      <div
        ref={mapContainerRef}
        style={{
          width: "100%",
          height: "260px",
          borderRadius: "12px",
          backgroundColor: "#e5e7eb",
          overflow: "hidden",
          border: "1px solid #e5e7eb",
          zIndex: 1
        }}
      />

      {/* Footnote instruction */}
      <div style={{ fontSize: "11px", color: "#6b7280", fontWeight: 600, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>
          📍 {lang === "mz"
            ? "Makah hian i hna awmna kawk turin click la, marker kha i hnûk (drag) thei bawk e."
            : "Click on the map or drag the marker to pin your exact job location."}
        </span>
        <span style={{ fontSize: "9px", textTransform: "uppercase", backgroundColor: "#e2e8f0", padding: "2px 6px", borderRadius: "100px", color: "#475569" }}>
          {mapType === "google" ? "Google Maps" : mapType === "leaflet" ? "OpenStreetMap" : "Loading..."}
        </span>
      </div>
    </div>
  );
}
