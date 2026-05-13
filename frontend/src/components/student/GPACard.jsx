import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const GPACard = ({ gpa, totalCredits }) => {
  // Calculate percentage (GPA out of 10)
  const safeGPA = Number(gpa) || 0;
const safeCredits = Number(totalCredits) || 0;
  const percentage = (safeGPA / 10) * 100;

  // Determine color based on GPA
  const getColor = () => {
  if (safeGPA >= 9.0) return '#10b981'; // xanh lá
  if (safeGPA >= 8.0) return '#3b82f6'; // xanh dương
  if (safeGPA >= 6.5) return '#f59e0b'; // vàng
  if (safeGPA >= 5.0) return '#f97316'; // cam
  return '#ef4444'; // đỏ
};

 const getLabel = () => {
  if (safeGPA >= 9.0) return 'Xuất sắc';
  if (safeGPA >= 8.0) return 'Giỏi';
  if (safeGPA >= 6.5) return 'Khá';
  if (safeGPA >= 5.0) return 'Trung bình';
  return 'Yếu';
};
  const color = getColor();
  const label = getLabel();

  // Data for gauge chart
  const data = [
    { value: percentage },
    { value: 100 - percentage }
  ];

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-700">GPA Tích lũy</h3>
        <span
          className="px-3 py-1 rounded-full text-xs font-medium"
          style={{ backgroundColor: `${color}20`, color: color }}
        >
          {label}
        </span>
      </div>

      <div className="relative">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              startAngle={180}
              endAngle={0}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={0}
              dataKey="value"
            >
              <Cell fill={color} />
              <Cell fill="#e5e7eb" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ top: '40%' }}>
          <div className="text-5xl font-bold" style={{ color: color }}>
            {safeGPA.toFixed(2)}
          </div>
          <div className="text-sm text-gray-500 mt-1">/ 10.0</div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Tổng tín chỉ tích lũy</span>
          <span className="font-semibold text-gray-800">{safeCredits} TC</span>
        </div>
      </div>
    </div>
  );
};

export default GPACard;
