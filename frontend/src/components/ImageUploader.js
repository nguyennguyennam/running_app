// src/components/ImageUploader.jsx
import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Spinner } from 'react-bootstrap';
import { uploadRunImage, getImagesForRun, deleteImage } from '../api/apiService';

const ImageUploader = ({ runId }) => {
  const [file, setFile] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadMessage, setUploadMessage] = useState(null);

  const fetchImages = async () => {
    if (!runId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await getImagesForRun(runId);
      setImages(response.data);
    } catch (err) {
      console.error('Error fetching images:', err);
      setError('Không thể tải ảnh. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [runId]); // Refetch images when runId changes

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploadMessage(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!runId || !file) {
      setError('Vui lòng chọn một file ảnh.');
      return;
    }
    setLoading(true);
    setError(null);
    setUploadMessage(null);
    try {
      await uploadRunImage(runId, file);
      setUploadMessage('Ảnh đã được tải lên thành công!');
      setFile(null); // Clear selected file
      fetchImages(); // Refresh image list
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Lỗi khi tải ảnh lên. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    setLoading(true);
    setError(null);
    try {
      await deleteImage(imageId);
      setUploadMessage('Ảnh đã được xóa.');
      fetchImages(); // Refresh image list
    } catch (err) {
      console.error('Error deleting image:', err);
      setError('Lỗi khi xóa ảnh. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-sm p-4">
      <Card.Title className="text-center mb-4">Ảnh cho buổi chạy: {runId}</Card.Title>
      {error && <p className="text-danger text-center">{error}</p>}
      {uploadMessage && <p className="text-success text-center">{uploadMessage}</p>}

      <Form.Group controlId="formFile" className="mb-3">
        <Form.Label>Tải ảnh lên</Form.Label>
        <Form.Control type="file" onChange={handleFileChange} accept="image/*" />
      </Form.Group>
      <Button
        variant="primary"
        onClick={handleUpload}
        disabled={loading || !file}
        className="w-100 mb-4"
      >
        {loading ? 'Đang tải lên...' : 'Tải ảnh lên'}
      </Button>

      <h5 className="mb-3">Ảnh đã tải lên:</h5>
      {loading && images.length === 0 && (
        <div className="text-center">
          <Spinner animation="border" size="sm" /> Đang tải ảnh...
        </div>
      )}
      {!loading && images.length === 0 && <p className="text-center">Chưa có ảnh nào.</p>}
      <Row xs={1} sm={2} md={3} lg={4} className="g-4">
        {images.map((img) => (
          <Col key={img.id}>
            <Card className="h-100">
              <Card.Img
                variant="top"
                src={`http://localhost:5004${img.imageUrl}`} 
                alt={`Run ${img.runActivityId}`}
                style={{ height: '150px', objectFit: 'cover' }}
              />
              <Card.Body className="d-flex flex-column">
                <Card.Text className="text-muted small flex-grow-1">
                  Mô tả: {img.description || 'Không có'}
                </Card.Text>
                <Button variant="danger" size="sm" onClick={() => handleDeleteImage(img.id)}>
                  Xóa
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  );
};

export default ImageUploader;