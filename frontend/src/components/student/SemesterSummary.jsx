import { calculateSemesterGPA } from '../../utils/gradeUtils';

const SemesterSummary = ({ grades, cumulativeGPA, cumulativeCredits }) => {
  const semesterStats = calculateSemesterGPA(grades);

  return (
    <div className="bg-gray-50 rounded-lg p-6 mt-4 border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wide">
            Kết quả học kỳ
          </h4>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">Số tín chỉ đạt:</span>
            <span className="font-mono font-semibold text-green-600">
              {semesterStats.passedCredits}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">Số tín chỉ không đạt:</span>
            <span className="font-mono font-semibold text-red-600">
              {semesterStats.failedCredits}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-300">
            <span className="text-gray-700 font-medium text-sm">Điểm TB học kỳ (Hệ 10):</span>
            <span className="font-mono font-bold text-blue-600 text-lg">
              {semesterStats.gpa10}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium text-sm">Điểm TB học kỳ (Hệ 4):</span>
            <span className="font-mono font-bold text-blue-600 text-lg">
              {semesterStats.gpa4}
            </span>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-3 md:border-l md:border-gray-300 md:pl-6">
          <h4 className="font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wide">
            Kết quả tích lũy
          </h4>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">Số tín chỉ tích lũy:</span>
            <span className="font-mono font-semibold text-gray-800">
              {cumulativeCredits || 0}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-300">
            <span className="text-gray-700 font-medium text-sm">Điểm TB tích lũy (Hệ 10):</span>
            <span className="font-mono font-bold text-purple-600 text-lg">
              {cumulativeGPA?.gpa10 || '0.00'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium text-sm">Điểm TB tích lũy (Hệ 4):</span>
            <span className="font-mono font-bold text-purple-600 text-lg">
              {cumulativeGPA?.gpa4 || '0.00'}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-300">
            <span className="text-gray-600 text-sm">Điểm rèn luyện - Xếp loại (RL):</span>
            <span className="font-mono font-semibold text-gray-800">
              Chưa có
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SemesterSummary;
