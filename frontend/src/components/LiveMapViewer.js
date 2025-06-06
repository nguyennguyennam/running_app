// src/components/LiveMapViewer.jsx
import React, { useEffect, useState, memo } from 'react';
import { Button, Card} from 'react-bootstrap';

// React-Leaflet và Leaflet CSS
import { MapContainer, TileLayer, Polyline, CircleMarker, useMap, GeoJSON, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Import icon marker mặc định của Leaflet để khắc phục lỗi missing icon
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Cấu hình icon mặc định cho Leaflet markers
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// --- Component MapUpdater để điều khiển tầm nhìn bản đồ ---
// Component này sử dụng hook useMap để truy cập đối tượng map của Leaflet
// và điều chỉnh chế độ xem bản đồ (zoom, fitBounds) dựa trên props thay đổi.
function MapUpdater({ liveLocation, isTracking, selectedRunRoute, currentRunRoute, routeData, liveLocationLatLng, startMarkerCoords, endMarkerCoords }) {
    const map = useMap(); // Hook để truy cập thể hiện bản đồ Leaflet

    useEffect(() => {
        let boundsToFit = null;

        // Ưu tiên hiển thị tuyến đường được tìm kiếm từ ORS
        // routeData ở đây là routeGeoJSON từ App.jsx
        if (routeData && routeData.bbox) { // routeData.bbox là bbox của GeoJSON Feature
            const [minLng, minLat, maxLng, maxLat] = routeData.bbox;
            boundsToFit = L.latLngBounds([[minLat, minLng], [maxLat, maxLng]]);
        }
        // Nếu không có tuyến đường tìm kiếm, và đang theo dõi, tập trung vào vị trí trực tiếp
        else if (isTracking && liveLocationLatLng) {
            map.flyTo(liveLocationLatLng, 16);
            return; // Dừng ở đây vì flyTo đã được gọi
        }
        // Nếu không có tuyến đường tìm kiếm, và không theo dõi, tập trung vào tuyến đường đang chạy (nếu có)
        else if (currentRunRoute && currentRunRoute.length > 0) {
            boundsToFit = L.latLngBounds(currentRunRoute.map(p => [p.lat, p.lng]));
        }
        // Cuối cùng là tuyến đường lịch sử (nếu có và không có các trạng thái trên)
        else if (selectedRunRoute && selectedRunRoute.length > 0) {
            boundsToFit = L.latLngBounds(selectedRunRoute.map(p => [p.lat, p.lng]));
        }
        // Nếu có điểm xuất phát/kết thúc nhưng chưa có route, cố gắng fit cả 2 điểm
        else if (startMarkerCoords && endMarkerCoords) {
            boundsToFit = L.latLngBounds([startMarkerCoords, endMarkerCoords]);
        }
        // Nếu chỉ có điểm xuất phát
        else if (startMarkerCoords) {
            map.flyTo(startMarkerCoords, 16);
            return;
        }
        // Nếu chỉ có điểm kết thúc
        else if (endMarkerCoords) {
            map.flyTo(endMarkerCoords, 16);
            return;
        }


        if (boundsToFit && boundsToFit.isValid()) {
            map.fitBounds(boundsToFit, { padding: [70, 70], maxZoom: 16 }); // Tăng padding để tuyến đường hiển thị tốt hơn
        }
        // Nếu không có dữ liệu nào, giữ nguyên tầm nhìn mặc định hoặc bay về trung tâm ban đầu
        else if (!liveLocation && !currentRunRoute && !selectedRunRoute && !routeData && !startMarkerCoords && !endMarkerCoords) {
            map.setView([10.762622, 106.660172], 12); // Về trung tâm TP.HCM
        }

    }, [liveLocation, isTracking, selectedRunRoute, currentRunRoute, routeData, map, liveLocationLatLng, startMarkerCoords, endMarkerCoords]); // Thêm tất cả dependencies

    return null; // Component này không render gì trực tiếp lên DOM
}

// --- Component chính LiveMapViewer ---
const LiveMapViewer = memo(({
    selectedRunRoute,
    routeData, // Đây là routeGeoJSON từ App.jsx
    startMarkerCoords, // Tọa độ điểm xuất phát
    endMarkerCoords,    // Tọa độ điểm kết thúc
    routeInstructions = [], // Hướng dẫn chi tiết từ ORS
}) => {
    const [mapLoaded, setMapLoaded] = useState(false);
    const [isInstructionsMinimized, setIsInstructionsMinimized] = useState(false); // State để thu nhỏ/phóng to card hướng dẫn

    // Hàm định dạng thời lượng (giây -> HH:MM:SS hoặc MM:SS)
    const formatDuration = (seconds) => {
        if (seconds < 0) return "00:00";
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        let parts = [h, m, s].map(v => v < 10 ? '0' + v : v);
        if (h === 0) {
            parts = parts.slice(1);
        }
        return parts.join(':');
    };

    // Hàm định dạng tốc độ (phút/km)
    const formatPace = (paceMinutesPerKm) => {
        if (paceMinutesPerKm <= 0 || paceMinutesPerKm === -5) return `--:-- /km`;
        const totalSeconds = Math.round(paceMinutesPerKm * 60);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds} /km`;
    };



    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '500px' }}>
            <MapContainer
                center={[10.762622, 106.660172]} // Center ban đầu, ví dụ: TP.HCM (vĩ độ, kinh độ)
                zoom={12}
                style={{ width: '100%', height: '100%' }}
                whenCreated={map => setMapLoaded(true)} // Đặt mapLoaded là true khi bản đồ được tạo xong
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                />

                {/* Component MapUpdater để quản lý zoom và fitBounds của bản đồ */}
                <MapUpdater
                    selectedRunRoute={selectedRunRoute}
                    routeData={routeData} // routeData ở đây là routeGeoJSON
                    startMarkerCoords={startMarkerCoords}
                    endMarkerCoords={endMarkerCoords}
                />

                {/* Hiển thị tuyến đường được tìm thấy từ ORS (màu cam) - ưu tiên hiển thị nếu có */}
                {routeData && (
                    <GeoJSON
                        data={routeData} // Truyền đối tượng GeoJSON đầy đủ
                        style={() => ({
                            color: '#fd7e14', // Màu cam
                            weight: 6,
                            opacity: 0.7,
                        })}
                    />
                )}

                {routeData && startMarkerCoords && (
                    <Marker position={startMarkerCoords} />
                )}
                {routeData && endMarkerCoords && (
                    <Marker position={endMarkerCoords} />
                )}
            </MapContainer>

            {routeData  && (
                <Card
                    className="shadow-sm"
                    style={{
                        position: 'absolute',
                        top: '15px',
                        right: '15px', // Đặt ở góc trên bên phải
                        zIndex: 1000,
                        width: 'auto',
                        minWidth: '250px',
                        maxWidth: '350px',
                        maxHeight: isInstructionsMinimized ? '50px' : 'calc(100% - 30px)', // Chiều cao động
                        overflowY: isInstructionsMinimized ? 'hidden' : 'auto', // Ẩn overflow khi thu nhỏ
                        pointerEvents: 'auto',
                        transition: 'max-height 0.3s ease-out' // Chuyển đổi mượt mà
                    }}
                >
                    <Card.Body>
                        <Card.Title className="fw-bold mb-3 d-flex justify-content-between align-items-center">
                            Hướng dẫn chi tiết chạy
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => setIsInstructionsMinimized(prev => !prev)}
                                className="ms-2"
                            >
                                {isInstructionsMinimized ? 'Mở rộng' : 'Thu gọn'}
                            </Button>
                        </Card.Title>
                        {!isInstructionsMinimized && ( // Chỉ hiển thị nội dung khi không thu nhỏ
                            <ol style={{ paddingLeft: '20px' }}>
                                {routeInstructions.map((step, index) => (
                                    <li key={index} className="mb-2">
                                        <strong>{step.instruction}</strong>
                                        <br />
                                        <small>
                                            ({(step.distance / 1000).toFixed(2)} km, {formatDuration(step.duration)})
                                        </small>
                                    </li>
                                ))}
                            </ol>
                        )}
                    </Card.Body>
                </Card>
            )}
            <Card
                className="shadow-sm"
                style={{
                    position: 'absolute',
                    bottom: '15px',
                    left: '15px',
                    zIndex: 1000,
                    width: 'auto',
                    minWidth: '250px',
                    maxWidth: '350px',
                    pointerEvents: 'auto'
                }}
            >
            </Card>
        </div>
    );
});

export default LiveMapViewer;
