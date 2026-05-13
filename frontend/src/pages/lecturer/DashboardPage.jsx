const LecturerDashboard = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Giảng viên</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Sinh viên nguy cơ</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Cảnh báo</h3>
          <p className="text-3xl font-bold text-yellow-600 mt-2">0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">An toàn</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">0</p>
        </div>
      </div>
    </div>
  );
};

export default LecturerDashboard;
