
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-marketplace-secondary text-white">
      <div className="container py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-bold mb-4">DigitalMarket</h3>
            <p className="text-gray-300 text-sm">
              Sàn thương mại điện tử sản phẩm số phục vụ kiếm tiền online. Mọi giao dịch đều được bảo vệ.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Liên kết</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-300 hover:text-white">
                  Sản phẩm
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-300 hover:text-white">
                  Dịch vụ
                </Link>
              </li>
              <li>
                <Link to="/seller/register" className="text-gray-300 hover:text-white">
                  Đăng ký bán hàng
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-bold mb-4">Hỗ trợ</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/help" className="text-gray-300 hover:text-white">
                  Trung tâm hỗ trợ
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-300 hover:text-white">
                  Câu hỏi thường gặp
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4">Thông tin liên hệ</h3>
            <div className="space-y-2 text-sm">
              <p className="text-gray-300">Email: support@digitalmarket.com</p>
              <p className="text-gray-300">Giờ làm việc: 08:00 - 22:00</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} DigitalMarket. Đã đăng ký bản quyền.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
