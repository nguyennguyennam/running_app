// src/components/RunHistory.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Spinner, Alert, Pagination } from 'react-bootstrap';
import { getMyRuns } from '../api/apiService'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons'; // Import icons

const RunHistory = ({userId}) => {
    console.log("Received userId in RunHistory:", userId); // Kiểm tra userId ngay khi nhận được
    const [runs, setRuns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [runsPerPage] = useState(5); // Số lượng hoạt động trên mỗi trang

    // Hàm format Duration từ số giây sang định dạng giờ:phút:giây
    const formatDuration = (seconds) => {
        if (typeof seconds !== 'number' || isNaN(seconds) || seconds < 0) {
            return "N/A";
        }
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = Math.floor(seconds % 60);

        const pad = (num) => num.toString().padStart(2, '0');
        return `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`;
    };

    // Hàm format Date
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const fetchRuns = useCallback(async () => {
       console.log("Fetching runs for userId:", userId); // Kiểm tra userId khi gọi API
        try {
            const response = await getMyRuns(userId);
            const fetchedRuns = response.data.map(run => ({
                ...run,
                displayDuration: formatDuration(run.duration),
                displayCalories:run.caloriesBurned,
                displayDate: formatDate(run.date),
            }));
            setRuns(fetchedRuns);
        } catch (err) {
            console.error("Failed to fetch runs:", err);
            setError("Failed to load run history. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchRuns();
    }, [fetchRuns]);

    // Lọc runs dựa trên searchTerm (ví dụ: theo StartPoint Name, EndPoint Name)
    const filteredRuns = runs.filter(run => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return (
            run.startPoint?.name?.toLowerCase().includes(lowerCaseSearchTerm) ||
            run.endPoint?.name?.toLowerCase().includes(lowerCaseSearchTerm) ||
            run.displayDate.toLowerCase().includes(lowerCaseSearchTerm) // Có thể tìm theo ngày
        );
    });

    // Logic phân trang
    const indexOfLastRun = currentPage * runsPerPage;
    const indexOfFirstRun = indexOfLastRun - runsPerPage;
    const currentRuns = filteredRuns.slice(indexOfFirstRun, indexOfLastRun);

    const totalPages = Math.ceil(filteredRuns.length / runsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Tạo các item phân trang
    const paginationItems = [];
    for (let number = 1; number <= totalPages; number++) {
        paginationItems.push(
            <Pagination.Item key={number} active={number === currentPage} onClick={() => paginate(number)}>
                {number}
            </Pagination.Item>
        );
    }

    return (
        <Container className="my-4">
            <Card className="shadow-sm">
                <Card.Body>
                    <h3 className="mb-4">My Run History</h3>

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <div className="input-group">
                                    <span className="input-group-text"><FontAwesomeIcon icon={faSearch} /></span>
                                    <Form.Control
                                        type="text"
                                        placeholder="Search for runs..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
                                        }}
                                    />
                                </div>
                            </Form.Group>
                        </Col>
                        <Col md={6} className="d-flex justify-content-end">
                        </Col>
                    </Row>

                    {loading ? (
                        <div className="d-flex justify-content-center my-5">
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                        </div>
                    ) : error ? (
                        <Alert variant="danger">{error}</Alert>
                    ) : runs.length === 0 ? (
                        <Alert variant="info">No run history found. Start your first run!</Alert>
                    ) : (
                        <>
                            <Table responsive hover className="mb-3">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Start Point</th>
                                        <th>End Point</th>
                                        <th>Distance (km)</th>
                                        <th>Duration</th>
                                        <th>Calories Burned</th>
                                        <th>Image</th> {/* Cột hiển thị ảnh */}
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentRuns.map((run) => (
                                        <tr key={run.id}>
                                            <td>{run.displayDate}</td>
                                            <td>{run.startPoint?.name || 'N/A'}</td>
                                            <td>{run.endPoint?.name || 'N/A'}</td>
                                            <td>{run.distance?.toFixed(2) || 'N/A'}</td>
                                            <td>{run.displayDuration}</td>
                                            <td>{run.displayCalories}</td>
                                            <td>
                                                {run.runImageUrl ? (
                                                    <img
                                                        src={run.runImageUrl}
                                                        alt="Run Map"
                                                        style={{ width: '80px', height: 'auto', borderRadius: '4px', cursor: 'pointer' }}
                                                        onClick={() => window.open(run.runImageUrl, '_blank')} // Mở ảnh trong tab mới khi click
                                                    />
                                                ) : (
                                                    'N/A'
                                                )}
                                            </td>
                                            <td>
                                                <Button variant="outline-info" size="sm" className="me-2">View</Button>
                                                {/* Có thể thêm nút Edit/Delete tại đây */}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="d-flex justify-content-center">
                                    <Pagination>
                                        <Pagination.Prev onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} />
                                        {paginationItems}
                                        <Pagination.Next onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} />
                                    </Pagination>
                                </div>
                            )}
                        </>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default RunHistory;