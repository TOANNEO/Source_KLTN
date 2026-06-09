import { useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  ArrowTrendingUpIcon,
  AcademicCapIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  SparklesIcon,
  ChartBarIcon,
  LightBulbIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import { getImprovementSuggestions } from '../../services/studentService';

import { formatGPA } from '../../utils/formatters';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';

const ImprovementPage = () => {
  const [targetGPA, setTargetGPA] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [errors, setErrors] = useState({});

  const validateTargetGPA = (value) => {
    const gpa = parseFloat(value);
    if (isNaN(gpa)) {
      return 'Vui lòng nhập số hợp lệ';
    }
    if (gpa < 0 || gpa > 10) {
      return 'GPA phải trong khoảng 0.0 - 10.0';
    }
    if (data?.current_gpa && gpa <= data.current_gpa) {
      return 'GPA mục tiêu phải cao hơn GPA hiện tại';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validateTargetGPA(targetGPA);
    if (error) {
      setErrors({ targetGPA: error });
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const response = await getImprovementSuggestions(parseFloat(targetGPA));
      if (response.success) {
        setData(response.data);
        console.log('Improvement suggestions:', response.data);
        toast.success('Phân tích thành công!');
      } else {
        toast.error(response.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Lỗi khi phân tích gợi ý cải thiện';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    };
    const labels = {
      high: 'Ưu tiên cao',
      medium: 'Ưu tiên trung bình',
      low: 'Ưu tiên thấp'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${badges[priority]}`}>
        {labels[priority]}
      </span>
    );
  };

  const getScoreColor = (score) => {
    if (score >= 8.5) return 'text-green-600';
    if (score >= 7.0) return 'text-blue-600';
    if (score >= 5.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
              <SparklesIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Gợi ý cải thiện GPA</h1>
              <p className="text-gray-600 mt-1">
                Nhập GPA mục tiêu để nhận gợi ý các môn học cải thiện phù hợp
              </p>
            </div>
          </div>
        </div>

        {/* Target GPA Input Form */}
        <Card className="mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="md:col-span-2">
                <Input
                  label="GPA mục tiêu (thang 10)"
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={targetGPA}
                  onChange={(e) => setTargetGPA(e.target.value)}
                  placeholder="Ví dụ: 8.5"
                  error={errors.targetGPA}
                  required
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang phân tích...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <SparklesIcon className="w-5 h-5" />
                    <span>Phân tích</span>
                  </div>
                )}
              </Button>
            </div>
          </form>
        </Card>

        {/* Results Section */}
        {data && (
          <div className="space-y-6">
            {/* Warnings Section */}
            {data.warnings && data.warnings.length > 0 && (
              <Card className="bg-yellow-50 border-yellow-200">
                <div className="flex items-start space-x-3">
                  <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-yellow-900 mb-2">Cảnh báo</h3>
                    <ul className="space-y-2">
                      {data.warnings.map((warning, index) => (
                        <li key={index} className="text-sm text-yellow-800 flex items-start">
                          <span className="mr-2">•</span>
                          <span>{typeof warning === 'string' ? warning : warning.message}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 mb-1">GPA Hiện Tại</p>
                    <p className="text-3xl font-bold text-blue-900">{formatGPA(data.current_gpa)}</p>
                  </div>
                  <div className="p-3 bg-blue-200 rounded-full">
                    <ChartBarIcon className="w-8 h-8 text-blue-700" />
                  </div>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600 mb-1">GPA Mục Tiêu</p>
                    <p className="text-3xl font-bold text-green-900">{formatGPA(data.target_gpa)}</p>
                  </div>
                  <div className="p-3 bg-green-200 rounded-full">
                    <ArrowTrendingUpIcon className="w-8 h-8 text-green-700" />
                  </div>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600 mb-1">GPA tối đa khả thi</p>
                    <p className="text-3xl font-bold text-purple-900">{formatGPA(data.max_gpa_after_improvement)}</p>
                    <p className="text-xs text-purple-600 mt-1">Sau khi cải thiện</p>
                  </div>
                  <div className="p-3 bg-purple-200 rounded-full">
                    <SparklesIcon className="w-8 h-8 text-purple-700" />
                  </div>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600 mb-1">Tổng Tín Chỉ</p>
                    <p className="text-3xl font-bold text-orange-900">{data.total_credits}</p>
                  </div>
                  <div className="p-3 bg-orange-200 rounded-full">
                    <AcademicCapIcon className="w-8 h-8 text-orange-700" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Summary Statistics */}
            {data.summary && (
              <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
                <h3 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center gap-2">
                  <ChartBarIcon className="w-5 h-5" />
                  Tổng quan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <span className="text-sm text-gray-600">Số môn đủ điều kiện:</span>
                    <span className="text-xl font-bold text-indigo-900">{data.summary.total_eligible_courses}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <span className="text-sm text-gray-600">Tổng GPA có thể tăng:</span>
                    <span className="text-xl font-bold text-green-600">+{formatGPA(data.summary.total_potential_gain)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <span className="text-sm text-gray-600">Khả thi:</span>
                    {data.summary.is_target_achievable ? (
                      <span className="flex items-center gap-1 text-green-600 font-semibold">
                        <CheckCircleIcon className="w-5 h-5" />
                        Có thể đạt
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-600 font-semibold">
                        <XCircleIcon className="w-5 h-5" />
                        Không thể đạt
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Extra Credits Message */}
            {data.extra_credits_message && (
              <Card className="bg-blue-50 border-blue-200">
                <div className="flex items-start space-x-3">
                  <LightBulbIcon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">Gợi ý học thêm tín chỉ</h3>
                    <p className="text-sm text-blue-800">{data.extra_credits_message}</p>
                    {data.extra_credits_needed && data.extra_credits_needed !== Infinity && (
                      <div className="mt-3 p-3 bg-blue-100 rounded-lg">
                        <p className="text-sm font-semibold text-blue-900">
                          Số tín chỉ cần học thêm: <span className="text-xl">{data.extra_credits_needed}</span> tín chỉ
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Eligible Courses List */}
            {data.eligible_courses && data.eligible_courses.length > 0 && (
              <Card>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <BookOpenIcon className="w-6 h-6 text-purple-600" />
                  Danh sách môn học đủ điều kiện cải thiện
                </h2>
                <div className="space-y-4">
                  {data.eligible_courses.map((course, index) => (
                    <div
                      key={index}
                      className="p-5 border-2 border-gray-200 rounded-lg hover:shadow-lg transition-all hover:border-purple-300"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg mb-1">
                            {course.course_name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Mã môn: <span className="font-semibold">{course.course_code}</span> •
                            Tín chỉ: <span className="font-semibold">{course.credits}</span>
                          </p>
                          {course.semester && (
                            <p className="text-xs text-gray-500 mt-1">
                              {course.semester.name} - {course.semester.academic_year}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="p-3 bg-red-50 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">Điểm hiện tại</p>
                          <p className={`text-2xl font-bold ${getScoreColor(course.old_score)}`}>
                            {course.old_score.toFixed(2)}
                          </p>
                        </div>
                      <div
                        className={`p-3 rounded-lg
                          ${
                            course.required_score > 10
                              ? 'bg-red-50 border border-red-200'
                              : 'bg-yellow-50'
                          }
                        `}
                      >
                        <p className="text-xs text-gray-600 mb-1">
                          Điểm cần đạt
                        </p>

                        <p className="text-2xl font-bold text-yellow-700">
                          {course.required_score > 10 ? (
                            <span className="text-red-600 text-lg font-bold">
                              Không khả thi
                            </span>
                          ) : (
                            course.required_score.toFixed(2)
                          )}
                        </p>

                        {course.required_score > 10 && (
                          <div className="mt-3">
                            <span className="flex px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                              Không khả thi với thang điểm hiện tại
                            </span>
                          </div>
                        )}
                      </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">Điểm đề xuất</p>
                          <p className="text-2xl font-bold text-green-700">
                            {course.required_score > 10
                              ? '—'
                              : course.recommended_score.toFixed(2)}
                          </p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">GPA tăng thêm</p>
                          <p className="text-2xl font-bold text-purple-700">
                            +{course.predicted_gpa_gain.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      {course.priority && (
                        <div className="mt-4">
                          {getPriorityBadge(course.priority)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}
            {/* Recommended Plan */}
            {data.recommended_plan && (
              <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-emerald-900 flex items-center gap-2">
                    <SparklesIcon className="w-6 h-6" />
                    Kế hoạch cải thiện đề xuất
                  </h2>

                  {data.recommended_plan.achieved_target ? (
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full">
                      <CheckCircleIcon className="w-5 h-5" />
                      <span className="font-semibold">Có thể đạt mục tiêu</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-full">
                      <XCircleIcon className="w-5 h-5" />
                      <span className="font-semibold">Chưa thể đạt mục tiêu</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-white rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">GPA dự kiến</p>
                    <p className="text-3xl font-bold text-emerald-700">
                      {formatGPA(data.recommended_plan.predicted_final_gpa)}
                    </p>
                  </div>

                  <div className="p-4 bg-white rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Số môn đề xuất</p>
                    <p className="text-3xl font-bold text-purple-700">
                      {data.recommended_plan.total_selected_courses}
                    </p>
                  </div>

                  <div className="p-4 bg-white rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Khoảng cách còn lại</p>
                    <p className="text-3xl font-bold text-orange-700">
                      {formatGPA(data.recommended_plan.remaining_gap)}
                    </p>
                  </div>
                </div>
                {data.recommended_plan.total_selected_courses === 0 && (
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-700 font-semibold">
                      Không tồn tại kế hoạch cải thiện khả thi cho GPA mục tiêu này.
                    </p>

                    <p className="text-sm text-red-600 mt-2">
                      Hãy giảm GPA mục tiêu hoặc học thêm tín chỉ mới để cải thiện GPA.
                    </p>
                  </div>
                )}
                {/* Selected Courses */}
                <div className="space-y-4">
                  {data.recommended_plan.selected_courses.map((course, index) => (
                    <div
                      key={index}
                      className="p-4 bg-white border border-emerald-200 rounded-xl"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-gray-900">
                            {course.course_name}
                          </h3>

                          <p className="text-sm text-gray-600">
                            {course.course_code} • {course.credits} tín chỉ
                          </p>
                        </div>

                        <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
                          #{index + 1}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-3 bg-red-50 rounded-lg">
                          <p className="text-xs text-gray-600">Điểm hiện tại</p>
                          <p className="text-xl font-bold text-red-600">
                            {course.old_score.toFixed(2)}
                          </p>
                        </div>

                        <div className="p-3 bg-yellow-50 rounded-lg">
                          <p className="text-xs text-gray-600">Điểm cần đạt</p>
                          <p className="text-xl font-bold text-yellow-700">
                            {course.required_score > 10 ? ( <span className="text-red-600 text-lg font-bold"> Không khả thi </span> ) : ( course.required_score.toFixed(2) )}
                          </p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="text-xs text-gray-600">Điểm đề xuất</p>
                          <p className="text-xl font-bold text-green-700">
                            {course.recommended_score.toFixed(2)}
                          </p>
                        </div>

                        <div className="p-3 bg-purple-50 rounded-lg">
                          <p className="text-xs text-gray-600">GPA tăng thêm</p>
                          <p className="text-xl font-bold text-purple-700">
                            +{course.predicted_gpa_gain.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImprovementPage;
