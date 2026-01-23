import Link from 'next/link';

interface MovieBreadcrumbProps {
  type: string;
  page: number;
}

const TYPE_LABEL: Record<string, string> = {
  'phim-le': 'Phim Lẻ',
  'phim-bo': 'Phim Bộ',
  'tv-shows': 'TV Shows',
  'hoat-hinh': 'Hoạt Hình',
};

export default function MovieBreadcrumb({
  type,
  page,
}: MovieBreadcrumbProps) {
  return (
    <div className="text-sm text-gray-400 mb-4">
      <Link href="/" className="hover:text-red-500">
        Trang chủ
      </Link>{' '}
      /{' '}
      <Link href={`/danh-sach/${type}`} className="hover:text-red-500">
        {TYPE_LABEL[type] || type}
      </Link>{' '}
      / Trang {page}
    </div>
  );
}
