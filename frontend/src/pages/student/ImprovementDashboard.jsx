import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell, ReferenceLine
} from 'recharts';
import { getLatestPrediction, getPredictionHistory } from '../../services/studentService';
import ImprovementPage from './ImprovementPage';

// SVG Icons thay thế lucide-react
const Icons = {
  TrendingUp: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  AlertTriangle: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  CheckCircle: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Smartphone: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  UserCheck: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  BookOpen: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  Eye: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  Moon: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  ),
  Users: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Activity: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  Calendar: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Loader: () => (
    <svg className="w-12 h-12 animate-spin text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  Info: () => (
    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
};

// Mapping icon đồng bộ chính xác 100% với các key biến từ Backend và Mô hình ML
const FACTOR_ICONS = {
  study_hours_per_day: Icons.BookOpen,
  class_attendance_percent: Icons.UserCheck,
  sleep_hours_per_day: Icons.Moon,
  mental_stress_level: Icons.AlertTriangle,
  social_media_hours: Icons.Smartphone,
  screen_time_hours: Icons.Eye,
  extracurricular_hours_per_week: Icons.Users,
  exercise_hours_per_week: Icons.Activity
};

// Mapping màu cho impact level
const IMPACT_COLORS = {
  high: 'bg-red-50 border-red-200 text-red-800',
  medium: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  low: 'bg-blue-50 border-blue-200 text-blue-800'
};

const ImprovementDashboard = () => {
  const [latestPrediction, setLatestPrediction] = useState(null);
  const [predictionHistory, setPredictionHistory] = useState([]);
  const [activePrediction, setActivePrediction] = useState(null); // Quản lý phiên dự đoán đang được chọn hiển thị
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPredictionData();
  }, []);

  const fetchPredictionData = async () => {
    try {
      setLoading(true);
      setError(null);
      const latestResponse = await getLatestPrediction();
      const historyResponse = await getPredictionHistory();



      if (latestResponse.success && latestResponse.data) {
        setLatestPrediction(latestResponse.data);
        setActivePrediction(latestResponse.data);
        console.log('Latest Prediction:', latestResponse);
        console.log('History Response:', historyResponse);
      }
      if (historyResponse.success && historyResponse.data) {
        setPredictionHistory(Array.isArray(historyResponse.data) ? historyResponse.data : []);
      }
    } catch (err) {
      console.error('Error fetching prediction data:', err);
      setError(err.response?.data?.message || 'Không thể tải dữ liệu dự đoán');
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý khi sinh viên nhấn nút "Xem chi tiết" một bản ghi lịch sử
  const handleViewDetail = (historyItem) => {
    if (historyItem.id === latestPrediction?.id) {
      setActivePrediction(latestPrediction);
    } else {
      // Vì dữ liệu lịch sử thô không có key_factors và advice, ta gán trực tiếp để hiển thị điểm/nguy cơ
      setActivePrediction({ ...historyItem, semester: historyItem.semester || { name: 'Không xác định', academic_year: 'N/A' }, actionable_advice: [], key_factors: [], risk_message: historyItem.risk_message || `GPA dự báo ${historyItem.predicted_gpa} - Trạng thái: ${historyItem.risk_label.toUpperCase()}` });
    }
    // Cuộn mượt mà lên đầu trang để sinh viên xem kết quả thay đổi
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

    const CircularProgress = ({ value, max = 10, size = 200, strokeWidth = 20 }) => {
    const numericValue = Number(value || 0);

    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = (numericValue / max) * 100;
    const offset = circumference - (progress / 100) * circumference;

    let color = '#ef4444';

    if (numericValue >= 7.0) color = '#22c55e';
    else if (numericValue >= 5.0) color = '#eab308';

    return (
        <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
            <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="none"
            />

            <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            />
        </svg>

        <div className="absolute flex flex-col items-center">
            <span className="text-5xl font-bold" style={{ color }}>
            {numericValue.toFixed(2)}
            </span>

            <span className="text-sm text-gray-500 mt-1">
            / {max}
            </span>
        </div>
        </div>
    );
    };


  const RiskBadge = ({ riskLabel, riskMessage }) => {
    const badgeStyles = { 
      safe: 'bg-green-100 text-green-800 border-green-300', 
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-300 animate-pulse', 
      danger: 'bg-red-100 text-red-800 border-red-300 animate-pulse' 
    };
    const iconComponents = { safe: Icons.CheckCircle, warning: Icons.AlertTriangle, danger: Icons.AlertTriangle };
    const IconComponent = iconComponents[riskLabel] || Icons.AlertTriangle;
    
    return (
      <div className={`flex items-center gap-3 px-6 py-4 rounded-xl border-2 ${badgeStyles[riskLabel] || 'bg-gray-100 text-gray-800'} shadow-lg`}>
        <IconComponent />
        <div>
          <div className="font-semibold text-lg capitalize">
            {riskLabel === 'safe' ? 'An Toàn' : riskLabel === 'warning' ? 'Cảnh Báo' : 'Nguy Hiểm'}
          </div>
          <div className="text-sm mt-1">{riskMessage}</div>
        </div>
      </div>
    );
  };

  const AdviceCard = ({ advice }) => {
    const IconComponent = FACTOR_ICONS[advice.factor_key] || Icons.Activity;
    return (
      <div className={`p-5 rounded-xl border-2 ${IMPACT_COLORS[advice.impact] || 'bg-gray-50'} shadow-md hover:shadow-lg transition-shadow duration-300`}>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 p-3 bg-white rounded-lg shadow-sm"><IconComponent /></div>
          <div className="flex-1">
            <h4 className="font-semibold text-lg mb-2">{advice.factor_name}</h4>
            <p className="text-sm leading-relaxed">{advice.advice}</p>
            <div className="mt-3 inline-block px-3 py-1 bg-white rounded-full text-xs font-medium">
              Mức độ tác động: <span className="font-semibold capitalize text-blue-600">{advice.impact}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ShapFactorsChart = ({ factors }) => {
    const chartData = factors.map((f) => ({ 
      name: f.factor, 
      importance: Number(f.importance || 0), 
      fill: f.direction === 'positive' ? '#22c55e' : '#ef4444' 
    }));
    
    return (
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[-1, 1]} />
          <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value) => Number(value).toFixed(3)} labelStyle={{ color: '#000' }} />
          <ReferenceLine x={0} stroke="#666" strokeWidth={2} />
          <Bar dataKey="importance" radius={[0, 4, 4, 0]} barSize={24}>
            {chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.fill} />))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  };
  const HistoryChart = ({ history }) => {
    const chartData = [...history].reverse().map((item) => ({ 
      semester: item.semester?.name || 'N/A', 
      gpa: Number(item.predicted_gpa || 0), 
      date: item.predicted_at 
    }));
    
    return (
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="semester" angle={-15} textAnchor="end" height={60} tick={{ fontSize: 12 }} />
          <YAxis domain={[0, 10]} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="gpa" stroke="#3b82f6" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} name="GPA Dự đoán" />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Icons.Loader />
          <p className="text-gray-600 mt-4 font-medium">Đang kết nối mô hình AI tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
          <div className="text-red-500 mb-4 flex justify-center"><Icons.AlertTriangle /></div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Có lỗi xảy ra</h3>
          <p className="text-gray-600 mb-4 text-sm">{error}</p>
          <button onClick={fetchPredictionData} className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md">Thử lại</button>
        </div>
      </div>
    );
  }

  if (!activePrediction || !activePrediction.predicted_gpa) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md p-6">
          <div className="text-gray-400 mb-4 flex justify-center"><Icons.Activity /></div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Chưa có dữ liệu dự đoán</h3>
          <p className="text-gray-600 text-sm">Bạn chưa thực hiện phiên dự đoán nào trong hệ thống. Hãy sang trang cập nhật hành vi học tập để nhận kết quả phân tích GPA sớm nhất.</p>
        </div>
      </div>
    );
  }

const isViewingHistory = activePrediction?.id !== latestPrediction?.id;
  console.log(activePrediction.actionable_advice);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Banner thông báo UX khi sinh viên chuyển trạng thái xem dữ liệu lịch sử */}
        {isViewingHistory && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-fadeIn">
            <div className="flex items-center gap-3">
              <Icons.Clock />
              <p className="text-sm text-blue-800 font-medium">
                Bạn đang xem lại phiên dữ liệu cũ của <span className="font-bold">{activePrediction.semester?.name}</span> (Thực hiện ngày {new Date(activePrediction.predicted_at).toLocaleDateString('vi-VN')}).
              </p>
            </div>
            <button 
              onClick={() => setActivePrediction(latestPrediction)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap"
            >
              Quay lại dữ liệu mới nhất
            </button>
          </div>
        )}

        {/* Khối Thượng tầng: Hiển thị Điểm số & Mức độ Nguy cơ */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center justify-center border border-gray-100 transition-all duration-300 hover:shadow-2xl">
            <h2 className="text-2xl font-semibold text-gray-700 mb-6">🎯 GPA Dự Đoán Học Kỳ</h2>
            <CircularProgress value={activePrediction.predicted_gpa || 0} />
            <div className="mt-6 text-center">
              <p className="text-gray-600 font-medium">Quy đổi thang điểm 4: <span className="font-bold text-lg text-gray-800">{Number(activePrediction.predicted_gpa4 || (activePrediction.predicted_gpa * 4 / 10) || 0).toFixed(2)}</span></p>
              <p className="text-xs text-gray-400 mt-2 flex items-center justify-center gap-1">
                <span className="font-semibold">{activePrediction.semester?.name || 'N/A'}</span> - Lớp niên chế học kỳ {activePrediction.semester?.academic_year || 'N/A'}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col justify-center border border-gray-100 transition-all duration-300 hover:shadow-2xl">
            <h2 className="text-2xl font-semibold text-gray-700 mb-6">⚠️ Trạng Thái Nguy Cơ Học Tập</h2>
            <RiskBadge riskLabel={activePrediction.risk_label || 'safe'} riskMessage={activePrediction.risk_message || 'Không có thông tin'} />
          </div>
        </div>

        {/* Khối Trung tâm: Lời khuyên & Biểu đồ SHAP */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Cột trái: Lời khuyên */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-700 mb-6 flex items-center gap-2 border-b pb-3 border-gray-100">
              <Icons.TrendingUp />💡 Lời Khuyên Hành Động Cá Nhân Hóa
            </h2>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
              {isViewingHistory ? (
                <div className="text-center py-12 px-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <div className="flex justify-center mb-2"><Icons.Info /></div>
                  <p className="text-gray-500 text-sm font-medium">Hệ thống chỉ tối ưu hiển thị lời khuyên cho phiên hiện tại.</p>
                  <button onClick={() => setActivePrediction(latestPrediction)} className="mt-3 text-xs text-blue-600 font-bold hover:underline">Xem lời khuyên mới nhất tại đây</button>
                </div>
               
              ) : activePrediction.actionable_advice && activePrediction.actionable_advice.length > 0 ? (
                activePrediction.actionable_advice.map((advice, index) => (<AdviceCard key={index} advice={advice} />))
              ) : (
                <p className="text-gray-400 text-center py-12 text-sm">Tuyệt vời! Mô hình AI không phát hiện chỉ số hành vi tiêu cực nào kéo tụt điểm số của bạn. Hãy duy trì phong độ hiện tại!</p>
              )}
            </div>
          </div>
          
          {/* Cột phải: Biểu đồ SHAP */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-700 mb-6 flex items-center gap-2 border-b pb-3 border-gray-100">
              <Icons.Activity />📈 Nhân Tố Khủng Hoảng Hoặc Thúc Đẩy (SHAP Value)
            </h2>
            {isViewingHistory ? (
              <div className="text-center py-16 px-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <div className="flex justify-center mb-2"><Icons.Info /></div>
                <p className="text-gray-400 text-sm">Biểu đồ phân tích SHAP động chỉ khả dụng đối với phiên kiểm tra gần nhất.</p>
              </div>
            ) : activePrediction.key_factors && activePrediction.key_factors.length > 0 ? (
              <>
                <p className="text-xs text-gray-500 mb-4">Mô hình định lượng tác động các thói quen: Thanh đổ về bên <span className="text-green-600 font-bold">Phải (dương)</span> giúp tăng GPA, thanh đổ về bên <span className="text-red-500 font-bold">Trái (âm)</span> làm sụt điểm GPA.</p>
                <ShapFactorsChart factors={activePrediction.key_factors||[]} />
              </>
            ) : (
              <p className="text-gray-400 text-center py-16 text-sm">Không tìm thấy phân tích trọng số nhân tố.</p>
            )}
          </div>
        </div>

        {/* Khối Hạ tầng: Biểu đồ xu hướng và Bảng Lịch sử */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6 flex items-center gap-2 border-b pb-3 border-gray-100">
            <Icons.Calendar />📚 Theo Dõi Tiến Trình & Lịch Sử Dự Báo Học Tập
          </h2>

          {Array.isArray(predictionHistory) && predictionHistory.length > 0 && (
            <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <h3 className="text-base font-semibold text-gray-700 mb-4 flex items-center gap-1">📈 Biểu đồ xu hướng biến động điểm GPA</h3>
              <HistoryChart history={predictionHistory} />
            </div>
          )}

          <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-inner">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-50 text-gray-600">
                  <th className="text-left py-3.5 px-4 font-semibold">Học Kỳ / Năm Học</th>
                  <th className="text-left py-3.5 px-4 font-semibold">Thời gian dự đoán</th>
                  <th className="text-center py-3.5 px-4 font-semibold">GPA dự đoán</th>
                  <th className="text-center py-3.5 px-4 font-semibold">Trạng thái rủi ro</th>
                  {/* <th className="text-center py-3.5 px-4 font-semibold">Hành Động</th> */}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {Array.isArray(predictionHistory) && predictionHistory.length > 0 ? (
                  predictionHistory.map((item) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-gray-50 transition-colors ${activePrediction && activePrediction.id === item.id ? 'bg-blue-50/60 font-medium' : ''}`}
                    >
                      <td className="py-4 px-4 text-gray-800">{item.semester?.name || 'N/A'}</td>
                      <td className="py-4 px-4 text-gray-500">
                        {item.predicted_at ? new Date(item.predicted_at).toLocaleDateString('vi-VN') : 'N/A'}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="font-bold text-base text-gray-800">
                          {item.predicted_gpa ? parseFloat(item.predicted_gpa).toFixed(2) : 'N/A'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          item.risk_label === 'safe' ? 'bg-green-100 text-green-800' : item.risk_label === 'warning' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {item.risk_label === 'safe' ? 'An Toàn' : item.risk_label === 'warning' ? 'Cảnh Báo' : 'Nguy Hiểm'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {/* <button 
                          onClick={() => handleViewDetail(item)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-xs shadow-sm"
                        >
                          <Icons.Eye />Xem chi tiết
                        </button> */}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-gray-400 font-medium">Hệ thống chưa ghi nhận lịch sử dự đoán nào của bạn.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chân trang thông tin cảnh báo pháp lý hệ thống */}
        <div className="text-center text-xs text-gray-400 space-y-1 pt-4 border-t border-gray-100">
          <p>🤖 Kết quả phân tích được tính toán hoàn toàn tự động bằng thuật toán Học Máy (Machine Learning) dựa trên dữ liệu snapshot hành vi sinh viên cung cấp. Kết quả chỉ mang tính chất dự báo sớm tham khảo.</p>
          {activePrediction && activePrediction.predicted_at && (
            <p>⏰ Phiên bản hiển thị dữ liệu hoạt động cuối cùng: {new Date(activePrediction.predicted_at).toLocaleString('vi-VN')}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImprovementDashboard;