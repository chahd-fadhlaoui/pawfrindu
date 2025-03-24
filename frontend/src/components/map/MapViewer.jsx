// frontend/src/components/MapViewer.js
import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";

// Fix pour l'icône par défaut de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const MapViewer = ({ position }) => {
  // Default position if none is provided or if position is invalid
  const defaultPosition = [36.8665367, 10.1647233];

  // Initialize mapPosition with a valid value
  const [mapPosition, setMapPosition] = useState(() => {
    if (position && position.latitude && position.longitude) {
      return [position.latitude, position.longitude];
    }
    return defaultPosition;
  });

  // Update mapPosition when position changes
  useEffect(() => {
    if (position && position.latitude && position.longitude) {
      setMapPosition([position.latitude, position.longitude]);
    } else {
      setMapPosition(defaultPosition);
    }
  }, [position]);

  return (
    <MapContainer
      center={mapPosition}
      zoom={13}
      style={{ height: "300px", width: "100%", borderRadius: "12px" }}
      scrollWheelZoom={false} // Disable scroll wheel zoom for better UX
      doubleClickZoom={false} // Disable double-click zoom
      touchZoom={false} // Disable touch zoom
      dragging={false} // Disable dragging
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={mapPosition} />
    </MapContainer>
  );
};

export default MapViewer;