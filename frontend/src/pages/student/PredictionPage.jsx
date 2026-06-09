import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { runPrediction } from '../../services/studentService';
import toast from 'react-hot-toast';

const PredictionPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [prediction, setPrediction] = useState(null);

  const handleRunPrediction = async () => {
    try {
      setLoading(true);
      const response = await runPrediction({});

      console.log('Prediction response:', response);

      const predictionData = response?.data;
        console.log('Extracted prediction data:', predictionData);

      if (predictionData) {
        setPrediction(predictionData);
        toast.success('Dự báo thành công! Đang chuyển sang trang gợi ý...');

        // Bắt đầu đếm ngược UI
        setCountdown(3);
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        // Chờ đúng 3s rồi tắt loading và chuyển trang
        setTimeout(() => {
          setLoading(false);
          setCountdown(null);
          navigate('/student/prediction-dashboard');
        }, 3000);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error running prediction:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi chạy dự báo';
      toast.error(errorMsg);
      setLoading(false);
      setCountdown(null);
    }
  };

  const getRiskConfig = (riskLabel) => {
    const configs = {
      safe: {
        color: 'green',
        bgGradient: 'from-green-400 to-emerald-500',
        bgLight: 'bg-green-50',
        textColor: 'text-green-700',
        borderColor: 'border-green-500',
        icon: '✅',
        label: 'An toàn',
        description: 'Kết quả học tập tốt, tiếp tục duy trì!'
      },
      warning: {
        color: 'yellow',
        bgGradient: 'from-yellow-400 to-orange-500',
        bgLight: 'bg-yellow-50',
        textColor: 'text-yellow-700',
        borderColor: 'border-yellow-500',
        icon: '⚠️',
        label: 'Cảnh báo',
        description: 'Cần cải thiện một số chỉ số học tập'
      },
      danger: {
        color: 'red',
        bgGradient: 'from-red-400 to-rose-500',
        bgLight: 'bg-red-50',
        textColor: 'text-red-700',
        borderColor: 'border-red-500',
        icon: '🚨',
        label: 'Nguy cơ',
        description: 'Cần hành động ngay để cải thiện kết quả'
      }
    };
    return configs[riskLabel] || configs.warning;
  };

  const formatFactorName = (factor) => {
    const names = {
      final_exam_score: 'Điểm thi cuối kỳ',
      class_attendance_percent: 'Tỷ lệ đi học',
      study_hours_per_day: 'Giờ tự học mỗi ngày',
      assignment_score: 'Điểm bài tập',
      sleep_hours: 'Giờ ngủ',
      social_media_hours: 'Giờ dùng mạng xã hội',
      screen_time_hours: 'Giờ dùng màn hình',
      mental_stress_level: 'Mức độ căng thẳng'
    };
    return names[factor] || factor;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      {/* Countdown Overlay */}
      {countdown !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-10 text-center max-w-sm w-full mx-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Dự báo thành công!</h3>
            <p className="text-gray-500 mb-6">Đang chuyển sang trang Gợi ý cải thiện học tập...</p>
            <div className="relative w-24 h-24 mx-auto mb-4">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                <circle
                  cx="48" cy="48" r="40"
                  fill="none"
                  stroke="url(#countdownGrad)"
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - countdown / 3)}`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
                <defs>
                  <linearGradient id="countdownGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#9333ea" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-gray-800">
                {countdown}
              </span>
            </div>
            <p className="text-sm text-gray-400">Tự động chuyển sau {countdown} giây</p>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Dự báo kết quả học tập
          </h1>
          <p className="text-gray-600">
            Sử dụng AI để dự đoán GPA và nhận gợi ý cải thiện
          </p>
        </div>

        {/* Run Prediction Button */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Chạy dự báo AI
              </h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Hệ thống sẽ phân tích dữ liệu hành vi và điểm số của bạn để đưa ra dự báo GPA chính xác
              </p>
            </div>

            <button
              onClick={handleRunPrediction}
              disabled={loading}
              className={`px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                loading ? 'animate-pulse' : ''
              }`}
            >
              {loading ? (
                <span className="flex items-center gap-3">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang phân tích...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Chạy dự báo ngay
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Prediction Result */}
        {prediction && (
          <div className="mb-8 animate-fadeIn">
            <PredictionResult prediction={prediction} getRiskConfig={getRiskConfig} formatFactorName={formatFactorName} />
          </div>
        )}
      </div>
    </div>
  );
};

// Prediction Result Component
const PredictionResult = ({ prediction, getRiskConfig, formatFactorName }) => {
  const config = getRiskConfig(prediction.risk_label);

  // Get top 3 factors from feature_importance
  const topFactors = prediction.feature_importance
    ? Object.entries(prediction.feature_importance)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([factor, importance]) => ({
          factor,
          importance: importance * 100,
          name: formatFactorName(factor)
        }))
    : [];

  return (
    <div className={`bg-gradient-to-br ${config.bgLight} border-2 ${config.borderColor} rounded-2xl shadow-xl p-8`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Kết quả dự báo</h2>
        <div className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${config.bgGradient} text-white rounded-full shadow-lg`}>
          <span className="text-2xl">{config.icon}</span>
          <span className="font-bold">{config.label}</span>
        </div>
      </div>

      {/* GPA Display */}
      <div className="bg-white rounded-xl p-8 mb-6 text-center shadow-md">
        <p className="text-gray-600 mb-2">GPA dự báo (Hệ 10)</p>
        <div className="flex items-center justify-center gap-2">
          <span className={`text-6xl font-bold bg-gradient-to-r ${config.bgGradient} bg-clip-text text-transparent`}>
            {prediction.predicted_gpa?.toFixed(2) || 'N/A'}
          </span>
          <span className="text-3xl text-gray-400">/ 10</span>
        </div>
        <p className={`mt-4 ${config.textColor} font-medium`}>
          {config.description}
        </p>
      </div>

      {/* Top Factors */}
      {topFactors.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Top 3 yếu tố ảnh hưởng nhiều nhất
          </h3>
          <div className="space-y-4">
            {topFactors.map((item, index) => (
              <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700">{item.name}</span>
                  <span className="text-sm font-bold text-gray-600">
                    {item.importance.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${config.bgGradient} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${item.importance}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictionPage;
