// src/components/AuthForm.jsx
import React, { useState } from 'react';
import { Form, Button, Card, Spinner, Alert } from 'react-bootstrap';
import { loginUser, registerUser, setAuthToken } from '../api/apiService'; // Import API functions

const AuthForm = ({ isRegister, setIsLoggedIn, setUsername, setUserId, setAuthLoading, setAuthError, onToggleAuthMode }) => {
    const [username, setLocalUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [localLoading, setLocalLoading] = useState(false); // Local loading state for the form
    const [localError, setLocalError] = useState(null);     // Local error state for the form

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalLoading(true);
        setLocalError(null); // Clear local error
        setAuthError(null);  // Clear global error from App.js

        try {
            if (isRegister) {
                console.log('Đang thực hiện đăng ký với dữ liệu:', { username, email, password });
                await registerUser({ username, email, password });
                alert('Đăng ký thành công! Vui lòng đăng nhập.');
                onToggleAuthMode(); 
            } else {
                console.log('Đang thực hiện đăng nhập với dữ liệu:', { username, password });
                const response = await loginUser({ username, password });
                const { token, userId, username: loggedInUsername } = response.data; // Destructure username from response

                localStorage.setItem('jwtToken', token);
                localStorage.setItem('username', loggedInUsername);
                localStorage.setItem('userId', userId);
                console.log('Đăng nhập thành công:', { token, userId, loggedInUsername });
                setAuthToken(token); 
                setIsLoggedIn(true); 
                setUsername(loggedInUsername); 
                setUserId(userId); 
            }
        } catch (err) {
            console.error('Lỗi khi gọi API xác thực:', err);
            const errorMessage = err.response?.data?.message || 'Đã xảy ra lỗi mạng hoặc lỗi server.';
            setLocalError(errorMessage); // Set local error
            setAuthError(errorMessage); // Also set global error for App.js to display
        } finally {
            setLocalLoading(false); // Set local loading to false
            setAuthLoading(false); // Also set global loading to false
        }
    };

    return (
        <Card className="shadow-lg p-4" style={{ maxWidth: '400px', width: '100%' }}>
            <Card.Title className="text-center mb-4 display-6 fw-bold">
                {isRegister ? 'Đăng Ký' : 'Đăng Nhập'}
            </Card.Title>
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formBasicUsername">
                    <Form.Label>Tên đăng nhập</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Nhập tên đăng nhập"
                        value={username}
                        onChange={(e) => setLocalUsername(e.target.value)}
                        required
                        aria-label="Tên đăng nhập"
                    />
                </Form.Group>

                {isRegister && (
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Địa chỉ Email</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="Nhập email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            aria-label="Địa chỉ Email"
                        />
                    </Form.Group>
                )}

                <Form.Group className="mb-4" controlId="formBasicPassword">
                    <Form.Label>Mật khẩu</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Nhập mật khẩu"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        aria-label="Mật khẩu"
                    />
                </Form.Group>

                {localError && <Alert variant="danger" className="mb-3 text-center">{localError}</Alert>}

                <Button
                    variant="primary"
                    type="submit"
                    className="w-100 mb-3"
                    disabled={localLoading}
                >
                    {localLoading ? (
                        <>
                            <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                className="me-2"
                            />
                            {isRegister ? 'Đang đăng ký...' : 'Đang đăng nhập...'}
                        </>
                    ) : (
                        isRegister ? 'Đăng Ký' : 'Đăng Nhập'
                    )}
                </Button>
                <Button
                    variant="link"
                    className="w-100 text-decoration-none"
                    onClick={onToggleAuthMode}
                    disabled={localLoading}
                >
                    {isRegister ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký'}
                </Button>
            </Form>
        </Card>
    );
};

export default AuthForm;