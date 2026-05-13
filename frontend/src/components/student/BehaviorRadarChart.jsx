import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const BehaviorRadarChart = ({ behaviorData }) => {
  if (!behaviorData) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Chỉ số hành vi</h3>
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">Chưa có dữ liệu</p>
          <p className="text-sm text-gray-400 mt-2">Cập nhật hành vi để xem biểu đồ</p>
        </div>
      </div>
    );
  }

  // Normalize data to 0-100 scale for radar chart
  const radarData = [
    {
      subject: 'Giờ học',
      value: Math.min((behaviorData.study_hours_per_day / 16) * 100, 100),
      fullMark: 100,
      actual: `${behaviorData.study_hours_per_day}h`
    },
    {
      subject: 'Giờ ngủ',
      value: Math.min((behaviorData.sleep_hours_per_day / 12) * 100, 100),
      fullMark: 100,
      actual: `${behaviorData.sleep_hours_per_day}h`
    },
    {
      subject: 'Điểm danh',
      value: behaviorData.class_attendance || 0,
      fullMark: 100,
      actual: `${behaviorData.class_attendance}%`
    },
    {
      subject: 'Mạng XH',
      value: Math.max(100 - ((behaviorData.social_media_hours / 24) * 100), 0),
      fullMark: 100,
      actual: `${behaviorData.social_media_hours}h`,
      inverted: true
    },
    {
      subject: 'Màn hình',
      value: Math.max(100 - ((behaviorData.screen_time_hours / 24) * 100), 0),
      fullMark: 100,
      actual: `${behaviorData.screen_time_hours}h`,
      inverted: true
    }
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800 mb-1">{data.subject}</p>
          <p className="text-sm text-purple-600">
            Giá trị: <span className="font-bold">{data.actual}</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {data.inverted ? 'Thấp hơn là tốt hơn' : 'Cao hơn là tốt hơn'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-700">Chỉ số hành vi</h3>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
          <span>5 chỉ số chính</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={radarData}>
          <PolarGrid stroke="#e5e7eb" strokeWidth={1} />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: '#9ca3af', fontSize: 10 }}
            tickCount={6}
          />
          <Radar
            name="Chỉ số"
            dataKey="value"
            stroke="#8b5cf6"
            fill="#8b5cf6"
            fillOpacity={0.5}
            strokeWidth={2}
            dot={{ fill: '#8b5cf6', r: 4 }}
          />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-purple-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Giờ học/ngày</p>
            <p className="text-lg font-bold text-purple-600">
              {behaviorData.study_hours_per_day}h
            </p>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Giờ ngủ/ngày</p>
            <p className="text-lg font-bold text-blue-600">
              {behaviorData.sleep_hours_per_day}h
            </p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Điểm danh</p>
            <p className="text-lg font-bold text-green-600">
              {behaviorData.class_attendance}%
            </p>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Căng thẳng</p>
            <p className="text-lg font-bold text-orange-600">
              {behaviorData.mental_stress_level}/9
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BehaviorRadarChart;
