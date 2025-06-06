// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import LiveMapViewer from './components/LiveMapViewer';
import AuthForm from './components/AuthForm';
import Header from './components/Header';
import RunHistory from './components/RunHistory'; // Import component RunHistory
import RouteSearchForm from './components/RouteSearchForm';
import 'bootstrap/dist/css/bootstrap.min.css';
import { setAuthToken } from './api/apiService';

function App() {
  // --- AUTH STATES ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // --- NAVIGATION STATE (MỚI THÊM) ---
  const [currentPage, setCurrentPage] = useState('home'); // 'home' hoặc 'run-history'

  // --- ROUTING STATES ---
  const [startPoint, setStartPoint] = useState('');
  const [endPoint, setEndPoint] = useState('');
  const [routeData, setRouteData] = useState(null);
  const [routeGeoJSON, setRouteGeoJSON] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [routeError, setRouteError] = useState(null);
  const [startMarkerCoords, setStartMarkerCoords] = useState(null);
  const [endMarkerCoords, setEndMarkerCoords] = useState(null);
  const [routeInstructions, setRouteInstructions] = useState([]);

  // --- AUTH HANDLERS ---
  const toggleAuthMode = () => {
    setIsRegisterMode(prev => !prev);
    setAuthError(null);
  };

  const handleLoginSuccess = (userData) => {
    console.log("=== Bắt đầu handleLoginSuccess ===");
    console.log("handleLoginSuccess: Dữ liệu userData nhận được:", userData);

    // Kiểm tra từng thuộc tính
    console.log("handleLoginSuccess: userData.token:", userData?.token);
    console.log("handleLoginSuccess: userData.username:", userData?.username);
    console.log("handleLoginSuccess: userData.id:", userData?.id);

    if (userData && userData.token) {
      localStorage.setItem('jwtToken', userData.token);
      localStorage.setItem('username', userData.username);
      localStorage.setItem('userId', userData.id);

      // Xác nhận ngay lập tức sau khi lưu
      console.log("handleLoginSuccess: Đã lưu vào Local Storage. Giá trị hiện tại:");
      console.log("handleLoginSuccess: localStorage.jwtToken:", localStorage.getItem('jwtToken'));
      console.log("handleLoginSuccess: localStorage.username:", localStorage.getItem('username'));
      console.log("handleLoginSuccess: localStorage.userId:", localStorage.getItem('userId'));

      setAuthToken(userData.token);
      console.log("handleLoginSuccess: Axios Authorization header đã được thiết lập.");
    } else {
      console.error("handleLoginSuccess: Lỗi - token không tồn tại trong userData.");
    }

    setIsLoggedIn(true);
    setUsername(userData.username); // Dù có token hay không, vẫn cập nhật state UI
    setUserId(userData.id);
    setAuthError(null);
    setCurrentPage('home');
    window.history.pushState({}, '', '/');
    console.log("=== Kết thúc handleLoginSuccess ===");
  };

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    setAuthToken(null);
    setIsLoggedIn(false);
    setUsername('');
    setUserId('');
    setAuthError(null);
    setRouteData(null);
    setRouteGeoJSON(null);
    setStartMarkerCoords(null);
    setEndMarkerCoords(null);
    setRouteError(null);
    setCurrentPage('home'); // Về trang chủ sau khi đăng xuất
    window.history.pushState({}, '', '/'); // Cập nhật URL về '/'
  };

  // --- NAVIGATION HANDLERS ---
  const handleNavigateToRunHistory = () => {
    setCurrentPage('run-history');
    // Cập nhật URL trên thanh địa chỉ
    window.history.pushState({}, '', '/run-history');
    console.log("Navigating to Run History. URL updated to /run-history");
  };

  const handleNavigateToHome = () => {
    setCurrentPage('home');
    // Cập nhật URL trên thanh địa chỉ
    window.history.pushState({}, '', '/');
    console.log("Navigating to Home. URL updated to /");
  };

  // --- UTILITY ---
  const calculateCaloriesBurned = (distanceKm) => {
    if (distanceKm <= 0) return 0;
    return (distanceKm * 70).toFixed(2);
  };

  const formatDuration = (seconds) => {
    if (seconds < 0) return "00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    let parts = [h, m, s].map(v => (v < 10 ? '0' + v : v));
    if (h === 0) parts = parts.slice(1);
    return parts.join(':');
  };

  // --- MAIN ROUTING FUNCTION ---
  const fetchRoute = async () => {
    setLoadingRoute(true);
    setRouteError(null);
    setRouteData(null);
    setRouteGeoJSON(null); // Reset GeoJSON khi tìm đường mới
    setStartMarkerCoords(null); // Reset tọa độ khi tìm đường mới
    setEndMarkerCoords(null);   // Reset tọa độ khi tìm đường mới

    if (!startPoint || !endPoint) {
      setRouteError('Vui lòng nhập cả điểm xuất phát và điểm kết thúc.');
      setLoadingRoute(false);
      return;
    }

    const ORS_API_KEY = "5b3ce3597851110001cf624878137d2b1a0e43378a09c2951756e7b6";
    if (!ORS_API_KEY) {
      setRouteError('Thiếu OpenRouteService API Key. Vui lòng kiểm tra file .env.local và khởi động lại server.');
      setLoadingRoute(false);
      return;
    }

    try {
      // --- Geocoding START POINT ---
      const startGeocodeUrl = `https://api.openrouteservice.org/geocode/search?api_key=${ORS_API_KEY}&text=${encodeURIComponent(startPoint)}&boundary.country=VN&size=1`;
      const startRes = await fetch(startGeocodeUrl);
      const startData = await startRes.json();

      if (!startData.features || startData.features.length === 0) {
        setRouteError(`Không tìm thấy điểm xuất phát: "${startPoint}".`);
        setLoadingRoute(false);
        return;
      }

      const startCoords = startData.features[0].geometry.coordinates;
      setStartMarkerCoords([startCoords[1], startCoords[0]]); // [lat, lng]

      // --- Geocoding END POINT ---
      const endGeocodeUrl = `https://api.openrouteservice.org/geocode/search?api_key=${ORS_API_KEY}&text=${encodeURIComponent(endPoint)}&boundary.country=VN&size=1`;
      const endRes = await fetch(endGeocodeUrl);
      const endData = await endRes.json();

      if (!endData.features || endData.features.length === 0) {
        setRouteError(`Không tìm thấy điểm kết thúc: "${endPoint}".`);
        setLoadingRoute(false);
        return;
      }

      const endCoords = endData.features[0].geometry.coordinates;
      setEndMarkerCoords([endCoords[1], endCoords[0]]); // [lat, lng]

      // --- Routing ---
      const profile = 'cycling-regular';
      const routingUrl = `https://api.openrouteservice.org/v2/directions/${profile}?api_key=${ORS_API_KEY}&start=${startCoords[0]},${startCoords[1]}&end=${endCoords[0]},${endCoords[1]}`;
      const routeRes = await fetch(routingUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json, application/geo+json' }
      });

      if (!routeRes.ok) {
        const errorBody = await routeRes.json();
        setRouteError(`Lỗi từ OpenRouteService: ${errorBody?.error?.message || routeRes.statusText}`);
        setLoadingRoute(false);
        return;
      }

      const routeJson = await routeRes.json();
      const bestRouteFeature = routeJson.features[0];

      if (!bestRouteFeature?.properties?.segments?.[0]) {
        setRouteError('Không tìm thấy tuyến đường khả dụng.');
        setLoadingRoute(false);
        return;
      }

      const summary = bestRouteFeature.properties.summary;
      const steps = bestRouteFeature.properties.segments[0].steps;

      setRouteData({
        distance: summary.distance,
        duration: summary.duration,
        caloriesBurned: calculateCaloriesBurned(summary.distance / 1000)
      });

      setRouteInstructions(
        steps.map(step => ({
          instruction: step.instruction,
          distance: step.distance,
          duration: step.duration
        }))
      );

      setRouteGeoJSON(bestRouteFeature); // Đặt giá trị cho routeGeoJSON
    } catch (error) {
      console.error('Error fetching route:', error);
      setRouteError('Đã xảy ra lỗi khi tìm đường đi. Vui lòng kiểm tra kết nối mạng và thử lại.');
    } finally {
      setLoadingRoute(false);
    }
  };

  // --- Load local auth data on mount and handle initial URL ---
  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    const storedUsername = localStorage.getItem('username');
    const storedUserId = localStorage.getItem('userId');

    console.log("Kiểm tra Local Storage khi khởi tạo:", { token, storedUsername, storedUserId });

    if (token && storedUsername && storedUserId) {
      setAuthToken(token);
      setIsLoggedIn(true);
      setUsername(storedUsername);
      setUserId(storedUserId);

      // Xử lý URL ban đầu khi người dùng truy cập trực tiếp
      const path = window.location.pathname;
      if (path === '/run-history') {
        setCurrentPage('run-history');
      } else {
        setCurrentPage('home');
        window.history.replaceState({}, '', '/'); // Đảm bảo URL là '/' nếu không phải /run-history
      }
    } else {
      // Nếu không đăng nhập, luôn ở trang gốc và ở trạng thái home logic
      window.history.replaceState({}, '', '/');
      setCurrentPage('home');
    }

    // Xử lý nút Back/Forward của trình duyệt
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/run-history') {
        setCurrentPage('run-history');
      } else {
        setCurrentPage('home');
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []); // Chỉ chạy một lần khi mount

  // --- RENDER ---
  return (
    <Container fluid className="app-container d-flex flex-column vh-100 p-0">
      {isLoggedIn ? (
        <>
          <Header
            username={username}
            handleLogout={handleLogout}
            onNavigateToRunHistory={handleNavigateToRunHistory}
            onNavigateToHome={handleNavigateToHome}
            currentPage={currentPage} // Truyền currentPage để Header có thể hiển thị tên trang động
          />
          <main className="d-flex flex-grow-1 flex-column flex-lg-row">
            {currentPage === 'home' && (
              <>
                <aside className="bg-white p-6 shadow-xl rounded-lg lg:w-96 w-full overflow-y-auto flex-shrink-0 order-lg-1 order-2">
                  <RouteSearchForm
                    startPoint={startPoint}
                    setStartPoint={setStartPoint}
                    endPoint={endPoint}
                    setEndPoint={setEndPoint}
                    fetchRoute={fetchRoute}
                    loadingRoute={loadingRoute}
                    routeError={routeError}
                    routeData={routeData}
                    formatDuration={formatDuration}
                    calculateCaloriesBurned={calculateCaloriesBurned}
                    userId={userId}
                    startMarkerCoords={startMarkerCoords} // Đã truyền
                    endMarkerCoords={endMarkerCoords}     // Đã truyền
                    routeGeoJSON={routeGeoJSON}           // Đã truyền
                  />
                </aside>
                <div className="map-container flex-grow-1 order-lg-2 order-1">
                  <LiveMapViewer
                    selectedRunRoute={null}
                    routeData={routeGeoJSON}
                    startMarkerCoords={startMarkerCoords}
                    endMarkerCoords={endMarkerCoords}
                    routeInstructions={routeInstructions}
                  />
                </div>
              </>
            )}

            {currentPage === 'run-history' && (
              <RunHistory userId={userId} /> // Đã truyền userId và RunHistory đã được import
            )}
          </main>
        </>
      ) : (
        <div className="d-flex justify-content-center align-items-center vh-100">
          <AuthForm
            isRegister={isRegisterMode}
            setIsLoggedIn={handleLoginSuccess} // Đảm bảo truyền handleLoginSuccess
            setUsername={setUsername}
            setUserId={setUserId}
            setAuthLoading={setAuthLoading}
            setAuthError={setAuthError}
            onToggleAuthMode={toggleAuthMode}
          />
        </div>
      )}
    </Container>
  );
}

export default App;