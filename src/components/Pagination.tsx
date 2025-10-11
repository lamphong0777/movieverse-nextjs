'use client';

import React, { useState } from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const [inputPage, setInputPage] = useState<string>('');

  if (totalPages <= 1) return null;

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputPage(e.target.value);
  };

  const handleInputSubmit = () => {
    const page = parseInt(inputPage, 10);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      onPageChange(page);
      setInputPage(''); // Clear input after successful navigation
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputSubmit();
    }
  };

  const isInputInvalid = inputPage && (isNaN(parseInt(inputPage, 10)) || parseInt(inputPage, 10) < 1 || parseInt(inputPage, 10) > totalPages);

  const visiblePages = Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2));

  return (
    <div className="mt-8 flex flex-wrap justify-center items-center gap-2 sm:gap-3">
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className="px-3 sm:px-4 py-2 bg-gray-800 text-white rounded-full disabled:opacity-50 hover:bg-gray-600 transition-colors duration-200 shadow-md"
        aria-label="Trang trước"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      {visiblePages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 sm:px-4 py-2 rounded-full shadow-md transition-colors duration-200 ${
            currentPage === page ? 'bg-red-600 text-white' : 'bg-gray-800 text-white hover:bg-gray-600'
          }`}
          aria-label={`Trang ${page}`}
        >
          {page}
        </button>
      ))}
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="px-3 sm:px-4 py-2 bg-gray-800 text-white rounded-full disabled:opacity-50 hover:bg-gray-600 transition-colors duration-200 shadow-md"
        aria-label="Trang sau"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="text-gray-300 text-sm sm:text-base">Tổng: {totalPages} trang</span>
        <div className="relative">
          <input
            type="number"
            value={inputPage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Trang..."
            min="1"
            max={totalPages}
            className={`w-20 sm:w-24 bg-gray-800 text-white border ${
              isInputInvalid ? 'border-red-500' : 'border-gray-600'
            } rounded-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200 text-sm sm:text-base`}
            aria-label="Nhập số trang"
          />
          {isInputInvalid && <span className="absolute -bottom-5 left-0 text-red-500 text-xs">Trang không hợp lệ</span>}
        </div>
        <button
          onClick={handleInputSubmit}
          disabled={!!(!inputPage || isInputInvalid)}
          className="px-3 sm:px-4 py-2 bg-red-600 text-white rounded-full disabled:opacity-50 hover:bg-red-700 transition-colors duration-200 shadow-md text-sm sm:text-base"
          aria-label="Đi đến trang đã nhập"
        >
          Đi
        </button>
      </div>
    </div>
  );
};

export default Pagination;
