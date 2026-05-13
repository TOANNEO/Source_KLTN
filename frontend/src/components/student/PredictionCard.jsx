import { ExclamationTriangleIcon, CheckCircleIcon, ShieldExclamationIcon } from '@heroicons/react/24/solid';

const PredictionCard = ({ prediction }) => {
  if (!prediction) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Dự báo gần nhất</h3>
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">Chưa có dự báo</p>
          <p className="text-sm text-gray-400 mt-2">Cập nhật hành vi để nhận dự báo AI</p>
        </div>
      </div>
    );
  }

  const getRiskConfig = (riskLabel) => {
    const configs = {
      safe: {
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        badgeBg: 'bg-green-100',
        badgeText: 'text-green-700',
        icon: CheckCircleIcon,
        iconColor: 'text-green-500',
        label: 'An toàn',
        gradient: 'from-green-50 to-emerald-50'
      },
      warning: {
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        badgeBg: 'bg-yellow-100',
        badgeText: 'text-yellow-700',
        icon: ExclamationTriangleIcon,
        iconColor: 'text-yellow-500',
        label: 'Cảnh báo',
        gradient: 'from-yellow-50 to-amber-50'
      },
      danger: {
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        badgeBg: 'bg-red-100',
        badgeText: 'text-red-700',
        icon: ShieldExclamationIcon,
        iconColor: 'text-red-500',
        label: 'Nguy cơ',
        gradient: 'from-red-50 to-rose-50'
      }
    };
    return configs[riskLabel] || configs.warning;
  };

  const config = getRiskConfig(prediction.risk_label);
  const Icon = config.icon;
  const safePredictedGPA = Number(prediction.predicted_gpa) || 0;
  return (
    <div className={`bg-gradient-to-br ${config.gradient} rounded-2xl shadow-lg p-6 border-2 ${config.borderColor} hover:shadow-xl transition-shadow duration-300`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-700">Dự báo gần nhất</h3>
        <div className={`flex items-center gap-2 ${config.badgeBg} px-3 py-1.5 rounded-full`}>
          <Icon className={`w-5 h-5 ${config.iconColor}`} />
          <span className={`text-sm font-semibold ${config.badgeText}`}>
            {config.label}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 mb-4 shadow-sm">
        <p className="text-sm text-gray-600 mb-2 text-center">GPA dự báo</p>
        <div className="flex items-center justify-center">
          <span className={`text-5xl font-bold ${config.badgeText}`}>
            {safePredictedGPA.toFixed(2)}
          </span>
          <span className="text-2xl text-gray-400 ml-2">/ 10</span>
        </div>
      </div>

      {prediction.key_factors && prediction.key_factors.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Yếu tố ảnh hưởng:</h4>
          <div className="space-y-2">
            {prediction.key_factors.slice(0, 3).map((factor, index) => (
              <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
                <span className="text-sm text-gray-700 capitalize">
                  {factor.factor.replace(/_/g, ' ')}
                </span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  factor.impact === 'high' ? 'bg-red-100 text-red-700' :
                  factor.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {factor.impact === 'high' ? 'Cao' : factor.impact === 'medium' ? 'Trung bình' : 'Thấp'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Cập nhật: {new Date(prediction.created_at).toLocaleString('vi-VN')}
        </p>
      </div>
    </div>
  );
};

export default PredictionCard;
