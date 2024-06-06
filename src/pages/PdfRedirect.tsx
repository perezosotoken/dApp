// src/pages/PdfRedirect.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const PdfRedirect: React.FC = () => {
  return <Navigate to="/assets/perezoso_wp.pdf" />;
};

export default PdfRedirect;
