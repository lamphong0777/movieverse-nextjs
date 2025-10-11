import React from 'react';
import { ClipLoader } from 'react-spinners';

const Loading: React.FC = () => {
  return (
    <div className="flex justify-center items-center py-8">
      <ClipLoader color="#ef4444" size={50} aria-label="Đang tải..." data-testid="loader" />
    </div>
  );
};

export default Loading;
