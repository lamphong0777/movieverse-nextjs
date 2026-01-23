'use client'

import { convertToWebP } from '@/lib/image'
import { fetchCategories } from '@/redux/features/categorySlice'
import { fetchCountries } from '@/redux/features/countrySlice'
import { useAppDispatch } from '@/redux/hooks'
import { RootState } from '@/redux/store'
import { Category, Country } from '@/types'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useDebouncedCallback } from 'use-debounce'

type Suggestion = {
  name: string
  originName?: string
  slug: string
  thumbUrl?: string
}

async function fetchSuggestions(keyword: string): Promise<Suggestion[]> {
  if (keyword.trim().length < 2) return []
  const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(keyword)}`)
  if (!res.ok) return []
  const data: { suggestions?: Suggestion[] } = await res.json()
  return data.suggestions ?? []
}

export default function Navbar() {
  const dispatch = useAppDispatch()
  const router = useRouter()

  const [mounted, setMounted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [catOpen, setCatOpen] = useState(false)
  const [countryOpen, setCountryOpen] = useState(false)

  const [search, setSearch] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggest, setShowSuggest] = useState(false)
  const [loadingSuggest, setLoadingSuggest] = useState(false)

  const { categories } = useSelector((s: RootState) => s.category)
  const { countries } = useSelector((s: RootState) => s.country)

  const catRef = useRef<HTMLDivElement | null>(null)
  const countryRef = useRef<HTMLDivElement | null>(null)
  const desktopSearchRef = useRef<HTMLDivElement | null>(null)
  const mobileSearchRef = useRef<HTMLDivElement | null>(null)

  const hasSearch = useMemo(() => search.trim().length > 0, [search])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    dispatch(fetchCategories())
    dispatch(fetchCountries())
  }, [mounted, dispatch])

  useEffect(() => {
    const close = (e: MouseEvent) => {
      const t = e.target as Node
      if (catRef.current && !catRef.current.contains(t)) setCatOpen(false)
      if (countryRef.current && !countryRef.current.contains(t)) setCountryOpen(false)
      const inDesktop = desktopSearchRef.current?.contains(t) ?? false
      const inMobile = mobileSearchRef.current?.contains(t) ?? false
      if (!inDesktop && !inMobile) setShowSuggest(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const debouncedSearch = useDebouncedCallback(async (value: string) => {
    if (value.trim().length < 2) {
      setShowSuggest(false)
      setSuggestions([])
      return
    }
    setLoadingSuggest(true)
    const data = await fetchSuggestions(value)
    setSuggestions(data)
    setShowSuggest(true)
    setLoadingSuggest(false)
  }, 400)

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setSearch(v)
    debouncedSearch(v)
  }

  const closeAll = () => {
    setShowSuggest(false)
    setCatOpen(false)
    setCountryOpen(false)
    setMenuOpen(false)
  }

  const doSearch = () => {
    if (!search.trim()) return
    router.push(`/tim-kiem?keyword=${encodeURIComponent(search.trim())}`)
    setSearch('')
    setShowSuggest(false)
    setMenuOpen(false)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') doSearch()
  }

  const onSelectSuggestion = (slug: string) => {
    router.push(`/phim/${slug}`)
    setSearch('')
    closeAll()
  }

  if (!mounted) return null

  return (
    <nav className="sticky top-0 z-50 bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="h-16 flex items-center justify-between gap-3">
          <Link href="/" className="text-red-600 text-2xl font-black shrink-0">
            KKPHIM
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <NavLink href="/">Trang Chủ</NavLink>
            <NavLink href="/danh-sach/phim-le">Phim Lẻ</NavLink>
            <NavLink href="/danh-sach/phim-bo">Phim Bộ</NavLink>

            <div ref={catRef} className="relative">
              <NavButton onClick={() => setCatOpen((v) => !v)}>Thể Loại</NavButton>
              {catOpen && (
                <Dropdown>
                  {categories.map((c: Category) => (
                    <DropdownItem
                      key={c._id}
                      href={`/the-loai/${c.slug}`}
                      onClick={() => setCatOpen(false)}
                    >
                      {c.name}
                    </DropdownItem>
                  ))}
                </Dropdown>
              )}
            </div>

            <div ref={countryRef} className="relative">
              <NavButton onClick={() => setCountryOpen((v) => !v)}>Quốc Gia</NavButton>
              {countryOpen && (
                <Dropdown>
                  {countries.map((c: Country) => (
                    <DropdownItem
                      key={c._id}
                      href={`/quoc-gia/${c.slug}`}
                      onClick={() => setCountryOpen(false)}
                    >
                      {c.name}
                    </DropdownItem>
                  ))}
                </Dropdown>
              )}
            </div>
          </div>

          <div ref={desktopSearchRef} className="hidden md:block relative w-80">
            <input
              value={search}
              onChange={onSearchChange}
              onKeyDown={onKeyDown}
              onFocus={() => search.trim().length >= 2 && setShowSuggest(true)}
              placeholder="Tìm phim, diễn viên..."
              className="w-full bg-gray-800 border border-gray-700 px-3 py-2 text-white focus:border-red-600 focus:outline-none"
            />
            {showSuggest && (
              <SuggestionBox
                items={suggestions}
                loading={loadingSuggest}
                onSelect={onSelectSuggestion}
              />
            )}
          </div>

          <button
            onClick={() => {
              setMenuOpen((v) => !v)
              setCatOpen(false)
              setCountryOpen(false)
              setShowSuggest(false)
            }}
            className="md:hidden text-gray-300 text-xl px-2 py-2"
            aria-label="Menu"
          >
            ☰
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800 px-4 py-3 space-y-2">
          <div ref={mobileSearchRef} className="relative">
            <input
              value={search}
              onChange={onSearchChange}
              onKeyDown={onKeyDown}
              onFocus={() => search.trim().length >= 2 && setShowSuggest(true)}
              placeholder="Tìm phim..."
              className="w-full bg-gray-800 border border-gray-700 px-3 py-2 text-white focus:border-red-600 focus:outline-none"
            />
            {showSuggest && (
              <SuggestionBox
                items={suggestions}
                loading={loadingSuggest}
                onSelect={onSelectSuggestion}
              />
            )}
            {hasSearch && (
              <button
                onClick={doSearch}
                className="mt-2 w-full bg-red-600 hover:bg-red-500 text-white py-2 text-sm font-semibold"
              >
                Tìm kiếm
              </button>
            )}
          </div>

          <div className="space-y-1">
            <MobileLink href="/" onClick={closeAll}>
              Trang Chủ
            </MobileLink>
            <MobileLink href="/danh-sach/phim-le" onClick={closeAll}>
              Phim Lẻ
            </MobileLink>
            <MobileLink href="/danh-sach/phim-bo" onClick={closeAll}>
              Phim Bộ
            </MobileLink>
          </div>

          <MobileAccordion title="Thể Loại">
            <ScrollGrid>
              {categories.map((c) => (
                <CompactItem key={c._id} href={`/the-loai/${c.slug}`} onClick={closeAll}>
                  {c.name}
                </CompactItem>
              ))}
            </ScrollGrid>
          </MobileAccordion>

          <MobileAccordion title="Quốc Gia">
            <ScrollGrid>
              {countries.map((c) => (
                <CompactItem key={c._id} href={`/quoc-gia/${c.slug}`} onClick={closeAll}>
                  {c.name}
                </CompactItem>
              ))}
            </ScrollGrid>
          </MobileAccordion>
        </div>
      )}
    </nav>
  )
}

type NavProps = { href: string; children: ReactNode }

const NavLink = ({ href, children }: NavProps) => (
  <Link
    href={href}
    className="px-2 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded"
  >
    {children}
  </Link>
)

const NavButton = ({ onClick, children }: { onClick: () => void; children: ReactNode }) => (
  <button
    onClick={onClick}
    className="px-2 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded"
  >
    {children}
  </button>
)

const Dropdown = ({ children }: { children: ReactNode }) => (
  <div className="absolute top-full left-0 mt-2 w-[520px] max-w-[85vw] bg-gray-800 border border-gray-700 rounded shadow-lg z-50">
    <div className="max-h-80 overflow-y-auto p-2 grid grid-cols-3 lg:grid-cols-4 gap-1">
      {children}
    </div>
  </div>
)

type DropdownItemProps = { href: string; onClick?: () => void; children: ReactNode }

const DropdownItem = ({ href, onClick, children }: DropdownItemProps) => (
  <Link
    href={href}
    onClick={onClick}
    className="px-2 py-2 text-sm text-gray-200 hover:bg-gray-700 rounded"
  >
    {children}
  </Link>
)

const MobileLink = ({ href, onClick, children }: NavProps & { onClick: () => void }) => (
  <Link
    href={href}
    onClick={onClick}
    className="block px-3 py-2 text-gray-300 hover:bg-gray-800 rounded"
  >
    {children}
  </Link>
)

const MobileAccordion = ({ title, children }: { title: string; children: ReactNode }) => {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-gray-800 rounded">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left px-3 py-2 text-gray-300 hover:bg-gray-800 rounded"
      >
        {title}
      </button>
      {open ? <div className="px-2 pb-2">{children}</div> : null}
    </div>
  )
}

const ScrollGrid = ({ children }: { children: ReactNode }) => (
  <div className="max-h-60 overflow-y-auto pr-1">
    <div className="grid grid-cols-2 gap-1">{children}</div>
  </div>
)

const CompactItem = ({
  href,
  onClick,
  children,
}: {
  href: string
  onClick: () => void
  children: ReactNode
}) => (
  <Link
    href={href}
    onClick={onClick}
    className="px-2 py-2 text-sm text-gray-200 hover:bg-gray-800 rounded"
  >
    {children}
  </Link>
)

type SuggestionBoxProps = {
  items: Suggestion[]
  loading: boolean
  onSelect: (slug: string) => void
}

const SuggestionBox = ({ items, loading, onSelect }: SuggestionBoxProps) => (
  <div className="absolute top-full left-0 w-full mt-2 bg-gray-800 border border-gray-700 rounded shadow-lg max-h-96 overflow-y-auto z-50">
    {loading ? (
      <div className="px-4 py-3 text-gray-400 text-center">Đang tìm...</div>
    ) : items.length === 0 ? (
      <div className="px-4 py-3 text-gray-400 text-center">Không có kết quả</div>
    ) : (
      items.map((i) => (
        <button
          key={i.slug}
          onClick={() => onSelect(i.slug)}
          className="w-full text-left flex gap-3 px-3 py-2 hover:bg-gray-700"
        >
          <Image
            src={convertToWebP(i.thumbUrl)}
            alt={i.name}
            width={40}
            height={56}
            className="object-cover shrink-0 rounded"
            unoptimized
          />
          <div className="min-w-0">
            <div className="text-sm text-gray-200 truncate">{i.name}</div>
            {i.originName ? (
              <div className="text-xs text-gray-400 truncate">{i.originName}</div>
            ) : null}
          </div>
        </button>
      ))
    )}
  </div>
)
