import { Link } from 'react-router-dom';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <ExclamationTriangleIcon className="w-24 h-24 text-red-500 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-800 mb-2">403</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Không có quyền truy cập</h2>
        <p className="text-gray-600 mb-8">
          Bạn không có quyền truy cập vào trang này.
        </p>
        <Link
          to="/"
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Quay về trang chủ
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
