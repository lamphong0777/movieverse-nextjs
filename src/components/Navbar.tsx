'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchCategories } from '@/redux/features/categorySlice';
import { fetchCountries } from '@/redux/features/countrySlice';
import { RootState } from '@/redux/store';
import { Category, Country } from '@/types';
import { useAppDispatch } from '@/redux/hooks';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { categories, loading: categoryLoading, error: categoryError } = useSelector((state: RootState) => state.category);
  const { countries, loading: countryLoading, error: countryError } = useSelector((state: RootState) => state.country);

  const categoryRef = useRef<HTMLDivElement>(null);
  const countryRef = useRef<HTMLDivElement>(null);

  // 🧩 Fetch data
  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchCountries());
  }, [dispatch]);

  // 🧠 Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) setIsCategoryOpen(false);
      if (countryRef.current && !countryRef.current.contains(event.target as Node)) setIsCountryOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 🔍 Hàm xử lý tìm kiếm
  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    router.push(`/tim-kiem?keyword=${encodeURIComponent(searchTerm.trim())}`);
    setSearchTerm('');
    setIsMenuOpen(false);
  };

  // 🔍 Hàm xử lý khi nhấn Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <nav className="bg-gray-900 bg-opacity-80 backdrop-blur-md sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 🔴 Logo + Desktop Menu */}
          <div className="flex items-center">
            <Link href="/" className="text-red-500 text-2xl font-bold">
              KKPHIM
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                <Link href="/" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Trang Chủ
                </Link>
                <Link href="/danh-sach/phim-le" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Phim Lẻ
                </Link>
                <Link href="/danh-sach/phim-bo" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Phim Bộ
                </Link>

                {/* 🟩 Thể Loại */}
                <div className="relative" ref={categoryRef}>
                  <button
                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                    className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Thể Loại
                  </button>
                  {isCategoryOpen && (
                    <div className="absolute z-10 mt-2 w-[600px] bg-gray-800 rounded-md shadow-lg py-4 px-4">
                      {categoryLoading ? (
                        <div className="text-gray-400 text-center">Đang tải...</div>
                      ) : categoryError ? (
                        <div className="text-red-500 text-center">Lỗi: {categoryError}</div>
                      ) : categories.length === 0 ? (
                        <div className="text-gray-400 text-center">Không có thể loại</div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                          {categories.map((c: Category) => (
                            <Link
                              key={c._id}
                              href={`/the-loai/${c.slug}`}
                              className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded-md"
                              onClick={() => setIsCategoryOpen(false)}
                            >
                              {c.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 🟦 Quốc Gia */}
                <div className="relative" ref={countryRef}>
                  <button
                    onClick={() => setIsCountryOpen(!isCountryOpen)}
                    className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Quốc Gia
                  </button>
                  {isCountryOpen && (
                    <div className="absolute z-10 mt-2 w-[600px] bg-gray-800 rounded-md shadow-lg py-4 px-4">
                      {countryLoading ? (
                        <div className="text-gray-400 text-center">Đang tải...</div>
                      ) : countryError ? (
                        <div className="text-red-500 text-center">Lỗi: {countryError}</div>
                      ) : countries.length === 0 ? (
                        <div className="text-gray-400 text-center">Không có quốc gia</div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                          {countries.map((ct: Country) => (
                            <Link
                              key={ct._id}
                              href={`/quoc-gia/${ct.slug}`}
                              className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded-md"
                              onClick={() => setIsCountryOpen(false)}
                            >
                              {ct.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 🔍 Search Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tìm kiếm phim..."
                className="bg-gray-800 text-white placeholder-gray-400 border border-gray-700 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-red-500 w-64"
              />
              <button onClick={handleSearch} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </button>
            </div>
          </div>

          {/* 📱 Nút Menu Mobile */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700"
            >
              {isMenuOpen ? (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 📱 Menu Mobile */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-900">
          {/* 🔍 Search Mobile */}
          <div className="p-4 border-b border-gray-700 flex items-center gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tìm kiếm phim..."
              className="flex-1 bg-gray-800 text-white placeholder-gray-400 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <button onClick={handleSearch} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium">
              Tìm
            </button>
          </div>

          {/* Links */}
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/"
              className="block text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Trang Chủ
            </Link>
            <Link
              href="/danh-sach/phim-le"
              className="block text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Phim Lẻ
            </Link>
            <Link
              href="/danh-sach/phim-bo"
              className="block text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Phim Bộ
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
