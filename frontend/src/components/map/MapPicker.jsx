import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

// Fix pour l'icône par défaut de Leaflet (sinon elle ne s'affiche pas correctement)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const MapPicker = ({ position, setPosition }) => {
  // Default position if none is provided
  const defaultPosition = [36.8665367, 10.1647233];

  // Initialize markerPosition with a valid value
  const [markerPosition, setMarkerPosition] = useState(
    position && position.latitude && position.longitude
      ? [position.latitude, position.longitude]
      : defaultPosition
  );

  // Update markerPosition when position changes, with a safeguard
  useEffect(() => {
    if (position && position.latitude && position.longitude) {
      setMarkerPosition([position.latitude, position.longitude]);
    } else {
      setMarkerPosition(defaultPosition);
    }
  }, [position]);

  // Composant pour gérer les clics sur la carte
  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setMarkerPosition([lat, lng]);
        setPosition({ latitude: lat, longitude: lng });
      },
    });
    return null;
  };

  return (
    <MapContainer
      center={markerPosition}
      zoom={13}
      style={{ height: "300px", width: "100%", borderRadius: "8px" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={markerPosition} />
      <MapClickHandler />
    </MapContainer>
  );
};

export default MapPicker;