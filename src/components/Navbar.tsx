'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDebouncedCallback } from 'use-debounce';

import { fetchCategories } from '@/redux/features/categorySlice';
import { fetchCountries } from '@/redux/features/countrySlice';
import { RootState } from '@/redux/store';
import { Category, Country } from '@/types';
import { useAppDispatch } from '@/redux/hooks';
import Image from 'next/image';
import { convertToWebP } from '@/lib/image';

type Suggestion = {
  name: string;
  originName?: string;
  slug: string;
  thumbUrl?: string;
};

async function fetchSuggestions(keyword: string): Promise<Suggestion[]> {
  if (!keyword.trim() || keyword.length < 2) return [];
  try {
    const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(keyword)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.suggestions || [];
  } catch {
    return [];
  }
}

const Navbar = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isCountryOpen, setIsCountryOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const { categories, loading: catLoading, error: catError } = useSelector((state: RootState) => state.category);
  const { countries, loading: countryLoading, error: countryError } = useSelector((state: RootState) => state.country);

  const categoryRef = useRef<HTMLDivElement>(null);
  const countryRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    dispatch(fetchCategories());
    dispatch(fetchCountries());
  }, [dispatch, mounted]);

  useEffect(() => {
    if (!mounted) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) setIsCategoryOpen(false);
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) setIsCountryOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mounted]);

  const debouncedFetch = useDebouncedCallback(async (term: string) => {
    if (term.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setIsLoadingSuggestions(true);
    const results = await fetchSuggestions(term);
    setSuggestions(results);
    setShowSuggestions(true);
    setIsLoadingSuggestions(false);
  }, 400);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchTerm(value);
      debouncedFetch(value);
    },
    [debouncedFetch]
  );

  const performSearch = useCallback(() => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;
    router.push(`/tim-kiem?keyword=${encodeURIComponent(trimmed)}`);
    setSearchTerm('');
    setSuggestions([]);
    setShowSuggestions(false);
    setIsMenuOpen(false);
  }, [searchTerm, router]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      performSearch();
    }
  };

  const handleSuggestionClick = (slug: string) => {
    setShowSuggestions(false);
    setSearchTerm('');
    router.push(`/phim/${slug}`);
  };

  if (!mounted) return null;

  return (
    <nav className="bg-gray-900 sticky top-0 z-50 shadow-lg border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-red-600 text-2xl font-black tracking-tight">
              KKPHIM
            </Link>

            <div className="hidden md:flex ml-10 space-x-1">
              <NavLink href="/">Trang Chủ</NavLink>
              <NavLink href="/danh-sach/phim-le">Phim Lẻ</NavLink>
              <NavLink href="/danh-sach/phim-bo">Phim Bộ</NavLink>

              <Dropdown label="Thể Loại" isOpen={isCategoryOpen} toggle={() => setIsCategoryOpen(!isCategoryOpen)} ref={categoryRef}>
                {catLoading ? (
                  <div className="text-gray-400 py-6 text-center">Đang tải...</div>
                ) : catError ? (
                  <div className="text-red-400 py-6 text-center">Lỗi: {catError}</div>
                ) : (
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1.5 max-h-80 overflow-y-auto">
                    {categories.map((cat: Category) => (
                      <DropdownItem key={cat._id} href={`/the-loai/${cat.slug}`} onClick={() => setIsCategoryOpen(false)}>
                        {cat.name}
                      </DropdownItem>
                    ))}
                  </div>
                )}
              </Dropdown>

              <Dropdown label="Quốc Gia" isOpen={isCountryOpen} toggle={() => setIsCountryOpen(!isCountryOpen)} ref={countryRef}>
                {countryLoading ? (
                  <div className="text-gray-400 py-6 text-center">Đang tải...</div>
                ) : countryError ? (
                  <div className="text-red-400 py-6 text-center">Lỗi: {countryError}</div>
                ) : (
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1.5 max-h-80 overflow-y-auto">
                    {countries.map((ct: Country) => (
                      <DropdownItem key={ct._id} href={`/quoc-gia/${ct.slug}`} onClick={() => setIsCountryOpen(false)}>
                        {ct.name}
                      </DropdownItem>
                    ))}
                  </div>
                )}
              </Dropdown>
            </div>
          </div>

          <div className="hidden md:block relative" ref={searchRef}>
            <div className="relative w-80">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                onFocus={() => searchTerm.length >= 2 && setShowSuggestions(true)}
                placeholder="Tìm phim, diễn viên..."
                className="w-full bg-gray-800 text-white placeholder-gray-400 border border-gray-700 rounded-lg py-2.5 px-4 pr-12 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600"
              />
              <button onClick={performSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {showSuggestions && (
                <div className="absolute top-full left-0 w-full mt-2 bg-gray-800 rounded-lg shadow-2xl border border-gray-700 overflow-hidden z-50 max-h-96 overflow-y-auto">
                  {isLoadingSuggestions ? (
                    <div className="px-5 py-4 text-gray-400 text-center">Đang tìm kiếm...</div>
                  ) : suggestions.length === 0 ? (
                    <div className="px-5 py-4 text-gray-400 text-center">Không tìm thấy gợi ý</div>
                  ) : (
                    suggestions.map((item) => (
                      <div
                        key={item.slug}
                        onClick={() => handleSuggestionClick(item.slug)}
                        className="flex gap-3 px-4 py-3 hover:bg-gray-700 cursor-pointer items-center"
                      >
                        <div className="w-10 h-14 flex-shrink-0 overflow-hidden rounded bg-gray-700">
                          <Image
                            src={convertToWebP(item.thumbUrl)}
                            alt={item.name}
                            width={40}
                            height={56}
                            className="object-cover w-full h-full"
                            unoptimized
                          />
                        </div>

                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium text-gray-200 truncate">{item.name}</span>

                          {item.originName && <span className="text-xs text-gray-400 truncate">{item.originName}</span>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800">
              {isMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800">
          <div className="px-4 py-5 space-y-5">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                placeholder="Tìm phim..."
                className="flex-1 bg-gray-800 text-white placeholder-gray-400 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-red-600"
              />
              <button onClick={performSearch} className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-lg font-medium">
                Tìm
              </button>
            </div>

            <div className="space-y-2">
              <MobileNavLink href="/" onClick={() => setIsMenuOpen(false)}>
                Trang Chủ
              </MobileNavLink>
              <MobileNavLink href="/danh-sach/phim-le" onClick={() => setIsMenuOpen(false)}>
                Phim Lẻ
              </MobileNavLink>
              <MobileNavLink href="/danh-sach/phim-bo" onClick={() => setIsMenuOpen(false)}>
                Phim Bộ
              </MobileNavLink>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link href={href} prefetch={false} className="text-gray-300 hover:bg-gray-800 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
    {children}
  </Link>
);

const MobileNavLink = ({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) => (
  <Link href={href} onClick={onClick} className="block px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg">
    {children}
  </Link>
);

const Dropdown = React.forwardRef<HTMLDivElement, { label: string; isOpen: boolean; toggle: () => void; children: React.ReactNode }>(
  ({ label, isOpen, toggle, children }, ref) => (
    <div className="relative" ref={ref}>
      <button onClick={toggle} className="text-gray-300 hover:bg-gray-800 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
        {label}
      </button>
      {isOpen && (
        <div className="absolute left-0 mt-2 w-80 md:w-[600px] bg-gray-800 rounded-lg shadow-2xl border border-gray-700 py-4 px-4 z-50">
          {children}
        </div>
      )}
    </div>
  )
);
Dropdown.displayName = 'Dropdown';

const DropdownItem = ({ href, onClick, children }: { href: string; onClick?: () => void; children: React.ReactNode }) => (
  <Link href={href} onClick={onClick} prefetch={false} className="block px-4 py-2.5 text-sm text-gray-200 hover:bg-gray-700 rounded">
    {children}
  </Link>
);

export default Navbar;
