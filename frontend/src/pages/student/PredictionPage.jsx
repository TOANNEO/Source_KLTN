import { useState, useEffect } from 'react';
import { runPrediction, getPredictionHistory } from '../../services/studentService';
import toast from 'react-hot-toast';

const PredictionPage = () => {
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [prediction, setPrediction] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      const response = await getPredictionHistory();
      console.log('History response:', response);
      console.log('History data:', response?.data);

      // Backend returns: { success: true, data: [...] }
      // data is array directly, not { items: [...] }
      const historyData = response?.data || [];

      console.log('Parsed history data:', historyData);
      console.log('Is array?', Array.isArray(historyData));
      console.log('Length:', historyData.length);

      setHistory(Array.isArray(historyData) ? historyData : []);
    } catch (error) {
      console.error('Error fetching history:', error);
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleRunPrediction = async () => {
    try {
      setLoading(true);
      const response = await runPrediction({});
      
      console.log('Prediction response:', response);

      const predictionData = response?.data?.data;

      if (predictionData) {
        setPrediction(predictionData);
        toast.success('Dự báo thành công!');
        // Refresh history
        await fetchHistory();
      }
    } catch (error) {
      console.error('Error running prediction:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi chạy dự báo';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
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

        {/* History */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Lịch sử dự báo</h2>

          {historyLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse flex gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : history.length > 0 ? (
            <PredictionHistory history={history} getRiskConfig={getRiskConfig} />
          ) : (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-500">Chưa có lịch sử dự báo</p>
              <p className="text-sm text-gray-400 mt-2">Chạy dự báo để xem kết quả</p>
            </div>
          )}
        </div>
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

// Prediction History Component
const PredictionHistory = ({ history, getRiskConfig }) => {
  return (
    <div className="space-y-4">
      {history.map((item, index) => {
        const config = getRiskConfig(item.risk_label);
        const date = new Date(item.credited_at);

        return (
          <div
            key={item.id || index}
            className="flex gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            {/* Timeline dot */}
            <div className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${config.bgGradient} flex items-center justify-center text-white font-bold shadow-lg`}>
                {Number(item.predicted_gpa).toFixed(1) || 'N/A'}
              </div>
              {index < history.length - 1 && (
                <div className="w-0.5 h-full bg-gray-300 mt-2"></div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 ${config.bgLight} ${config.textColor} rounded-full text-sm font-semibold`}>
                    {config.label}
                  </span>
                  <span className="text-sm text-gray-500">
                    {date.toLocaleDateString('vi-VN')} {date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
              <p className="text-gray-700">
                GPA dự báo: <span className="font-bold">{Number(item.predicted_gpa).toFixed(2)}</span> / 10
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PredictionPage;
