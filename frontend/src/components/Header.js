// src/components/Header.jsx
import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { Bell, CircleUser, Bike } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // <--- Thêm import này

const Header = ({ username, handleLogout, onNavigateToRunHistory, onNavigateToHome }) => {
    const [showUserPopup, setShowUserPopup] = useState(false);

    // CHẮC CHẮN RẰNG HÀM NÀY ĐANG ĐƯỢC GỌI VÀ onNavigateToRunHistory ĐANG THAY ĐỔI TRẠNG THÁI
    const handleGoToRunHistory = (e) => {
        e.preventDefault(); // Rất quan trọng để ngăn chặn browser điều hướng (reload trang)
        console.log("Navigating to Run History..."); // Thêm console.log để kiểm tra
        onNavigateToRunHistory(); // Gọi hàm được truyền từ App.jsx
        setShowUserPopup(false);
    };

    const handleGoToHome = (e) => {
        e.preventDefault();
        console.log("Navigating to Home..."); // Thêm console.log để kiểm tra
        onNavigateToHome();
        setShowUserPopup(false);
    };

    const toggleUserPopup = () => {
        setShowUserPopup(prev => !prev);
    };

    const commonFontSize = '1rem';
    const commonFontFamily = 'Roboto, sans-serif';

    return (
        <header
            className="d-flex justify-content-between align-items-center p-3 shadow-lg text-white"
            style={{
                background: 'linear-gradient(to right, #2563eb, #8b5cf6)',
                fontFamily: commonFontFamily,
                fontSize: commonFontSize
            }}
        >
            {/* Phần bên trái: Icon và Tiêu đề */}
            <div className="d-flex align-items-center gap-2">
                <Bike size={28} className="text-white" />
                <h2
                    className="fw-semibold m-0 text-white"
                    style={{ fontSize: commonFontSize, fontFamily: commonFontFamily }}
                >
                    App run! Run everywhere
                </h2>
            </div>

            {/* Phần ở giữa: Div chứa link "RunHistory" */}
            <div className="d-flex justify-content-center flex-grow-1">
                <a
                    href="/run-history" // Giữ href cho accessibility (người dùng vẫn có thể click chuột phải và "Open in new tab")
                    onClick={handleGoToRunHistory} // <--- Gọi hàm sử dụng navigate
                    className="text-decoration-none"
                    style={{
                        cursor: 'pointer',
                        color: 'white',
                        fontSize: commonFontSize,
                        fontFamily: commonFontFamily,
                    }}
                >
                    RunHistory
                </a>
            </div>

            {/* Phần bên phải: Icon thông báo, Icon người dùng với Popup, và Button Đăng xuất chính */}
            <div className="d-flex align-items-center gap-4 position-relative">
                <Bell
                    size={24}
                    className="text-white"
                    style={{ cursor: 'pointer' }}
                />

                <CircleUser
                    size={24}
                    className="text-white"
                    style={{ cursor: 'pointer' }}
                    onClick={toggleUserPopup}
                />

                {showUserPopup && (
                    <div
                        className="bg-white text-dark shadow-sm rounded p-3"
                        style={{
                            position: 'absolute',
                            top: '100%',
                            right: '0',
                            marginTop: '10px',
                            zIndex: 10009,
                            minWidth: '180px',
                            fontSize: commonFontSize,
                            fontFamily: commonFontFamily,
                        }}
                    >
                        <p className="m-0 fw-bold">Welcome, user {username}</p>
                    </div>
                )}

                <Button
                    variant="outline-light"
                    onClick={handleLogout}
                    className="rounded-pill border border-white px-4 py-2"
                    style={{ fontSize: commonFontSize, fontFamily: commonFontFamily }}
                >
                    Đăng xuất
                </Button>
            </div>
        </header>
    );
};

export default Header;