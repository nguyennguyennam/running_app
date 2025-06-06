// src/components/DetailedAnalysisViewer.jsx
import React, { useState } from 'react';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';

function DetailedAnalysisViewer({ runs, selectedRunData }) {
  const [weight, setWeight] = useState(''); // kg
  const [age, setAge] = useState('');     // tuổi
  const [height, setHeight] = useState('');   // cm
  const [gender, setGender] = useState('male'); // male/female
  const [recommendations, setRecommendations] = useState('');

  // Hàm tính BMR (Basal Metabolic Rate) - Mifflin-St Jeor Equation
  const calculateBMR = (w, h, a, g) => {
    if (g === 'male') {
      return (10 * w) + (6.25 * h) - (5 * a) + 5;
    } else {
      return (10 * w) + (6.25 * h) - (5 * a) - 161;
    }
  };

  // Hàm tính Calo đốt cháy cho buổi chạy (rất đơn giản, cần công thức phức tạp hơn nếu muốn chính xác)
  // METs for running can vary greatly (e.g., 8-12 METs)
  const calculateCaloriesBurned = (durationSeconds, distanceKm, w) => {
    if (!w || !durationSeconds || !distanceKm) return 0;
    // Một công thức đơn giản ước tính: Calo = METs * weight(kg) * (duration(hours))
    // METs trung bình cho chạy bộ ~ 10 METs
    const METs = 10;
    const durationHours = durationSeconds / 3600;
    return METs * w * durationHours;
  };

  // Tổng hợp dữ liệu chạy để phân tích
  const totalDistance = runs.reduce((sum, run) => sum + run.distance, 0);
  const totalDurationSeconds = runs.reduce((sum, run) => sum + run.durationSeconds, 0);
  const averagePace = totalDurationSeconds > 0 && totalDistance > 0 ? (totalDurationSeconds / 60) / (totalDistance / 1000) : 0; // min/km

  const generateRecommendations = () => {
    if (!weight || !age || !height || runs.length === 0) {
      setRecommendations('Vui lòng nhập đầy đủ thông tin cá nhân và có dữ liệu buổi chạy để nhận khuyến nghị.');
      return;
    }

    const bmr = calculateBMR(parseFloat(weight), parseFloat(height), parseInt(age), gender);
    let totalCaloriesBurned = runs.reduce((sum, run) => sum + calculateCaloriesBurned(run.durationSeconds, run.distance, parseFloat(weight)), 0);

    let recs = [];
    recs.push(`Dựa trên thông tin của bạn, BMR (Tỷ lệ trao đổi chất cơ bản) ước tính khoảng ${bmr.toFixed(0)} calo/ngày.`);
    recs.push(`Tổng calo đã đốt trong các buổi chạy: ${totalCaloriesBurned.toFixed(0)} calo.`);

    if (totalDistance < 20) { // Ví dụ: dưới 20km tổng
      recs.push('Bạn có thể cân nhắc tăng quãng đường chạy hàng tuần để cải thiện sức bền và đốt thêm calo.');
    } else if (totalDistance < 50) {
      recs.push('Bạn đang có những buổi chạy đều đặn! Hãy thử thách bản thân với các buổi chạy dài hơn hoặc tập luyện interval.');
    } else {
        recs.push('Bạn là một người chạy bộ tuyệt vời! Hãy tiếp tục duy trì phong độ và xem xét các mục tiêu chạy mới.');
    }

    if (averagePace > 7) { // Ví dụ: Pace chậm hơn 7 min/km
      recs.push('Để tăng tốc độ, hãy thử kết hợp các bài tập chạy biến tốc (interval training) hoặc chạy tempo.');
    } else if (averagePace < 5) {
        recs.push('Tốc độ của bạn rất ấn tượng! Hãy chú ý đến việc phục hồi và lắng nghe cơ thể.');
    }

    recs.push('**Bài tập bổ trợ:** Để tăng cường sức mạnh và giảm nguy cơ chấn thương, hãy kết hợp các bài tập bổ trợ như Squats, Lunges, Plank, Bridge và Calf Raises vào lịch trình của bạn 2-3 lần/tuần.');
    recs.push('**Lời khuyên giảm cân:** Để giảm cân, bạn cần tạo ra sự thâm hụt calo (đốt cháy nhiều hơn nạp vào). Kết hợp chạy bộ với chế độ ăn uống cân bằng và kiểm soát calo là chìa khóa. Tham khảo ý kiến chuyên gia dinh dưỡng để có kế hoạch phù hợp.');


    setRecommendations(recs.join('\n\n')); // Hiển thị dưới dạng các đoạn văn bản
  };

  const handleAnalyze = () => {
    generateRecommendations();
  };

  const formatDurationTotal = (seconds) => {
    if (seconds === 0) return "0s";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    let parts = [];
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    if (s > 0 || parts.length === 0) parts.push(`${s}s`);
    return parts.join(' ');
  };


  return (
    <Card className="mb-4">
      <Card.Header>Phân tích chuyên sâu và Khuyến nghị</Card.Header>
      <Card.Body>
        <Form>
          <Row className="mb-3">
            <Col md={3}>
              <Form.Group controlId="formWeight">
                <Form.Label>Cân nặng (kg)</Form.Label>
                <Form.Control type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="formHeight">
                <Form.Label>Chiều cao (cm)</Form.Label>
                <Form.Control type="number" value={height} onChange={(e) => setHeight(e.target.value)} />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="formAge">
                <Form.Label>Tuổi</Form.Label>
                <Form.Control type="number" value={age} onChange={(e) => setAge(e.target.value)} />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="formGender">
                <Form.Label>Giới tính</Form.Label>
                <Form.Select value={gender} onChange={(e) => setGender(e.target.value)}>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <Button variant="primary" onClick={handleAnalyze} className="w-100">
            Nhận phân tích từ AI
          </Button>
        </Form>

        <h5 className="mt-4">Tổng quan các buổi chạy</h5>
        <p><strong>Tổng quãng đường:</strong> {totalDistance.toFixed(2)} km</p>
        <p><strong>Tổng thời lượng:</strong> {formatDurationTotal(totalDurationSeconds)}</p>
        <p><strong>Tốc độ trung bình:</strong> {totalDistance > 0 ? `${averagePace.toFixed(2)} min/km` : 'N/A'}</p>

        {selectedRunData && (
            <Card className="mt-3">
                <Card.Body>
                    <Card.Title>Phân tích buổi chạy đã chọn</Card.Title>
                    <p><strong>Khoảng cách:</strong> {selectedRunData.distance.toFixed(2)} km</p>
                    <p><strong>Thời lượng:</strong> {formatDurationTotal(selectedRunData.durationSeconds)}</p>
                    {/* Thêm các thông số khác của buổi chạy nếu có */}
                    <p><strong>Calo đốt ước tính (buổi này):</strong> {calculateCaloriesBurned(selectedRunData.durationSeconds, selectedRunData.distance, parseFloat(weight)).toFixed(0)} calo</p>
                </Card.Body>
            </Card>
        )}

        <h5 className="mt-4">Khuyến nghị cá nhân</h5>
        {recommendations ? (
          <p style={{ whiteSpace: 'pre-wrap' }}>{recommendations}</p>
        ) : (
          <p>Nhập thông tin và click "Nhận phân tích từ AI" để xem khuyến nghị.</p>
        )}
      </Card.Body>
    </Card>
  );
}

export default DetailedAnalysisViewer;