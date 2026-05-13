import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const GPALineChart = ({ gpaHistory }) => {
  if (!gpaHistory || gpaHistory.length === 0) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">GPA theo học kỳ</h3>
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">Chưa có dữ liệu</p>
          <p className="text-sm text-gray-400 mt-2">Dữ liệu GPA sẽ hiển thị khi có điểm</p>
        </div>
      </div>
    );
  }

  // Format data for chart
  const chartData = gpaHistory.map(item => ({
    name: item.semester_name || `HK${item.semester_id}`,
    gpa: parseFloat(item.gpa) || 0,
    credits: item.total_credits || 0
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800 mb-2">{payload[0].payload.name}</p>
          <p className="text-sm text-blue-600">
            GPA: <span className="font-bold">{payload[0].value.toFixed(2)}</span>
          </p>
          <p className="text-sm text-gray-600">
            Tín chỉ: {payload[0].payload.credits} TC
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-700">GPA theo học kỳ</h3>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>Xu hướng GPA</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorGPA" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="name"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            tick={{ fill: '#6b7280' }}
          />
          <YAxis
            domain={[0, 10]}
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            tick={{ fill: '#6b7280' }}
            ticks={[0, 2, 4, 6, 8, 10]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="gpa"
            stroke="#3b82f6"
            strokeWidth={3}
            fill="url(#colorGPA)"
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
            activeDot={{ r: 7, fill: '#2563eb' }}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-500 mb-1">Cao nhất</p>
            <p className="text-lg font-bold text-green-600">
              {Math.max(...chartData.map(d => d.gpa)).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Trung bình</p>
            <p className="text-lg font-bold text-blue-600">
              {(chartData.reduce((sum, d) => sum + d.gpa, 0) / chartData.length).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Thấp nhất</p>
            <p className="text-lg font-bold text-orange-600">
              {Math.min(...chartData.map(d => d.gpa)).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GPALineChart;
