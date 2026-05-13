import {
  convertTo4Scale,
  convertToLetterGrade,
  isPassing,
  getGradeColorClass,
  getGradeBgClass,
  isConditionalCourse
} from '../../utils/gradeUtils';

const GradeTable = ({ grades }) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="min-w-full bg-white">
        <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider w-16">
              STT
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
              Mã môn
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
              Tên môn học
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider w-20">
              Số TC
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider w-24">
              Điểm hệ 10
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider w-24">
              Điểm hệ 4
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider w-24">
              Điểm chữ
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider w-32">
              Đạt/Không đạt
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {grades.map((grade, index) => {
            const score10 = parseFloat(grade.total_score) || 0;
            const score4 = convertTo4Scale(score10);
            const letterGrade = convertToLetterGrade(score10);
            const passing = isPassing(score10);
            const isConditional = isConditionalCourse(grade.course?.course_name);
            const credits = parseFloat(grade.course?.credits) || 0;

            return (
              <tr
                key={grade.id}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                {/* STT */}
                <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                  {index + 1}
                </td>

                {/* Mã môn */}
                <td className="px-4 py-3 text-sm font-mono font-semibold text-gray-800">
                  {grade.course?.course_code || 'N/A'}
                </td>

                {/* Tên môn học */}
                <td className="px-4 py-3 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <span>{grade.course?.course_name || 'N/A'}</span>
                    {isConditional && (
                      <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded-full">
                        Điều kiện
                      </span>
                    )}
                  </div>
                </td>

                {/* Số TC */}
                <td className="px-4 py-3 text-center text-sm font-mono font-semibold text-gray-800">
                  {credits > 0 ? credits : '-'}
                </td>

                {/* Điểm hệ 10 */}
                <td className={`px-4 py-3 text-center ${getGradeBgClass(score10)}`}>
                  <span className={`text-sm font-mono ${getGradeColorClass(score10)}`}>
                    {score10.toFixed(2)}
                  </span>
                </td>

                {/* Điểm hệ 4 */}
                <td className="px-4 py-3 text-center">
                  {credits > 0 ? (
                    <span className="text-sm font-mono font-semibold text-gray-700">
                      {score4.toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>

                {/* Điểm chữ */}
                <td className="px-4 py-3 text-center">
                  {credits > 0 ? (
                    <span className="text-sm font-mono font-bold text-gray-800">
                      {letterGrade}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>

                {/* Đạt/Không đạt */}
                <td className="px-4 py-3 text-center">
                  {passing ? (
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
                      <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default GradeTable;
