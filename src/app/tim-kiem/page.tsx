import React, { Suspense } from 'react'
import SearchPage from '@/features/SearchPage'

export default function Page() {
  return (
    <Suspense
      fallback={<div className="text-center text-white py-10">Đang tải kết quả tìm kiếm...</div>}
    >
      <SearchPage />
    </Suspense>
  )
}
