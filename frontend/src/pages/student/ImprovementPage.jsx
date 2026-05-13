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
    if (data && gpa <= data.current_gpa) {
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
        toast.success('Phân tích thành công!');
      } else {
        toast.error(response.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error fetching improvement suggestions:', error);
      toast.error('Không thể tải gợi ý cải thiện');
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
                          <span>{warning}</span>
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
