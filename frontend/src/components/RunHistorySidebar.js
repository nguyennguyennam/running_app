// src/components/RunHistorySidebar.jsx
import React from 'react';
import { ListGroup, Card, Button, Spinner, Alert } from 'react-bootstrap';
import moment from 'moment'; // Để định dạng ngày tháng

function RunHistorySidebar({ runs, onSelectRun, onDeleteRun, loading, error, selectedRunId }) {
  if (loading) {
    return <Spinner animation="border" role="status"><span className="visually-hidden">Đang tải...</span></Spinner>;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!runs || runs.length === 0) {
    return <Card><Card.Body>Chưa có buổi chạy nào được ghi lại.</Card.Body></Card>;
  }

  const formatDuration = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `<span class="math-inline">\{h\.toString\(\)\.padStart\(2, '0'\)\}\:</span>{m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="mb-4">
      <Card.Header>Danh sách các buổi chạy</Card.Header>
      <ListGroup variant="flush">
        {runs.map((run) => (
          <ListGroup.Item
            key={run.id}
            action
            onClick={() => onSelectRun(run.id)}
            active={run.id === selectedRunId}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <strong>Ngày:</strong> {moment(run.date).format('DD/MM/YYYY HH:mm')}
                <br />
                <strong>Khoảng cách:</strong> {run.distance.toFixed(2)} km
                <br />
                <strong>Thời lượng:</strong> {formatDuration(run.durationSeconds)}
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation(); // Ngăn sự kiện click lan ra ListGroup.Item
                  onDeleteRun(run.id);
                }}
              >
                Xóa
              </Button>
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Card>
  );
}

export default RunHistorySidebar;