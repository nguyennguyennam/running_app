// src/components/AlertMessage.jsx
import React from 'react';
import { Alert } from 'react-bootstrap';

const AlertMessage = ({ message, type }) => {
  if (!message) return null;

  return (
    <Alert variant={type} className="mt-3">
      {message}
    </Alert>
  );
};

export default AlertMessage;