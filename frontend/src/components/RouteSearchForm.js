// src/components/RouteSearchForm.js (đổi tên từ RouteSearchSection.js để khớp với component mà bạn gửi)
import React, { useState } from 'react';
import { Card, Form, Button, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { addRun } from '../api/apiService';

const RouteSearchForm = ({ // Đổi tên prop từ RouteSearchSection sang RouteSearchForm để khớp file
    startPoint,           
    setStartPoint,
    endPoint,             
    setEndPoint,
    fetchRoute,
    loadingRoute,
    routeError,
    routeData,            
    formatDuration,
    calculateCaloriesBurned,
    userId,
    startMarkerCoords,    
    endMarkerCoords,      
    routeGeoJSON          
}) => {
    const [savingRoute, setSavingRoute] = useState(false);

    const onSaveRoute = async () => {
        console.log("Debug save route:");
        console.log("  routeData:", routeData);
        console.log("  startMarkerCoords:", startMarkerCoords);
        console.log("  endMarkerCoords:", endMarkerCoords);
        console.log("  routeGeoJSON:", routeGeoJSON);

        const startLocationObject = {
            latitude: startMarkerCoords[0], 
            longitude: startMarkerCoords[1],
            name: startPoint 
        };

        const endLocationObject = {
            latitude: endMarkerCoords[0],
            longitude: endMarkerCoords[1],
            name: endPoint 
        };

        const runData = {
            userId: userId, 
            startPoint: startLocationObject,
            endPoint: endLocationObject,     
            distance: parseFloat((routeData.distance / 1000).toFixed(2)), 
            duration: Math.round(routeData.duration), 
            caloriesBurned: parseFloat(calculateCaloriesBurned(routeData.distance / 1000)), 
            date: new Date().toISOString(), 
            routeGeoJSON: JSON.stringify(routeGeoJSON)
        };
        console.log('Saving run data:', runData); 

        try {
            setSavingRoute(true);
            const result = await addRun(runData); // Gọi API addRun
            if (result) {
                alert('Đã lưu tuyến đường thành công!');
            }
        } catch (error) {
            console.error('Error saving route:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
                headers: error.response?.headers
            });
            // Hiển thị lỗi cho người dùng
            alert(`Lỗi khi lưu tuyến đường: ${error.response?.data?.title || error.message}`);
        } finally {
            setSavingRoute(false);
        }
    };

    return (
        <Card className="mb-3">
            <Card.Body>
                <Card.Title className="text-center mb-3">Tìm đường đi</Card.Title>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Điểm xuất phát</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Nhập điểm xuất phát (ví dụ: Chợ Bến Thành)"
                            value={startPoint}
                            onChange={(e) => setStartPoint(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Điểm kết thúc</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Nhập điểm kết thúc (ví dụ: Landmark 81)"
                            value={endPoint}
                            onChange={(e) => setEndPoint(e.target.value)}
                        />
                    </Form.Group>
                    <div className="d-grid gap-2">
                        <Button
                            variant="primary"
                            onClick={fetchRoute}
                            disabled={loadingRoute || !startPoint || !endPoint}
                        >
                            {loadingRoute ? (
                                <>
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                        className="me-2"
                                    />
                                    Đang tìm đường...
                                </>
                            ) : (
                                'Tìm đường đi'
                            )}
                        </Button>
                    </div>
                </Form>

                {routeError && (
                    <Alert variant="danger" className="mt-3">
                        {routeError}
                    </Alert>
                )}

                {/* Thông tin tuyến đường */}
                {routeData && (
                    <div className="mt-4 p-3 border rounded">
                        <h5 className="text-center mb-3">Thông tin tuyến đường</h5>
                        <Row className="mb-2">
                            <Col xs={6} className="text-end fw-bold">Khoảng cách:</Col>
                            <Col xs={6} className="text-start">
                                {(routeData.distance / 1000).toFixed(2)} km
                            </Col>
                        </Row>
                        <Row className="mb-2">
                            <Col xs={6} className="text-end fw-bold">Thời gian ước tính:</Col>
                            <Col xs={6} className="text-start">
                                {formatDuration(routeData.duration)}
                            </Col>
                        </Row>
                        <Row className="mb-3">
                            <Col xs={6} className="text-end fw-bold">Calo đốt ước tính:</Col>
                            <Col xs={6} className="text-start">
                                {calculateCaloriesBurned(routeData.distance / 1000)} calo
                            </Col>
                        </Row>

                        <div className="d-grid mt-2">
                            <Button
                                variant="success"
                                onClick={onSaveRoute}
                                disabled={savingRoute}
                            >
                                {savingRoute ? (
                                    <>
                                        <Spinner
                                            as="span"
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            aria-hidden="true"
                                            className="me-2"
                                        />
                                        Đang lưu...
                                    </>
                                ) : (
                                    'Lưu tuyến đường'
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

export default RouteSearchForm;