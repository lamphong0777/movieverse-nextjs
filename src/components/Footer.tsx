import React from 'react'

const Footer: React.FC = () => (
  <footer className="bg-gray-900 text-gray-400">
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center">
        <div className="text-red-500 text-2xl font-bold mb-4">PHIMHAY</div>
        <div className="flex space-x-6 mb-4 text-sm">
          <a href="#" className="hover:text-white">
            Giới Thiệu
          </a>
          <a href="#" className="hover:text-white">
            Điều Khoản Sử Dụng
          </a>
          <a href="#" className="hover:text-white">
            Chính Sách Bảo Mật
          </a>
          <a href="#" className="hover:text-white">
            Liên Hệ
          </a>
        </div>
        <p className="text-center text-sm mb-2 max-w-2xl">
          Phimhay - Trang xem phim Online với giao diện mới được bố trí và thiết kế thân thiện với
          người dùng. <br />
          Nguồn phim được tổng hợp từ các website lớn với đa dạng các đầu phim và thể loại.
        </p>
        <p className="mt-2 text-center text-xs">
          © {new Date().getFullYear()} Phimhay. All rights reserved. Vui lòng không sao chép dưới
          mọi hình thức. (version: 0.4.6)
        </p>
      </div>
    </div>
  </footer>
)

export default Footer
