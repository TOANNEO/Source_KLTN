import { useState, useEffect } from 'react';
import { getCurrentBehavior, createOrUpdateBehavior } from '../../services/studentService';
import toast from 'react-hot-toast';

const BehaviorPage = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentSemester, setCurrentSemester] = useState(null);
  const [formData, setFormData] = useState({
    study_hours_per_day: " ",
    sleep_hours_per_day: " ",
    class_attendance: " ",
    social_media_hours: " ",
    screen_time_hours: " ",
    mental_stress_level: " "
  });

  useEffect(() => {
    fetchCurrentBehavior();
  }, []);

  const fetchCurrentBehavior = async () => {
    try {
      setLoading(true);
      const response = await getCurrentBehavior();

      // Backend can return either:
      // 1. { success: true, data: behavior } - when behavior exists
      // 2. { success: true, data: null } - when no behavior exists
      const behaviorData = response?.data?.data || response?.data;

      console.log('Behavior data:', behaviorData);

      if (behaviorData && behaviorData.study_hours_per_day !== undefined) {
        const newFormData = {
          study_hours_per_day: parseFloat(behaviorData.study_hours_per_day) || 0,
          sleep_hours_per_day: parseFloat(behaviorData.sleep_hours_per_day) || 0,
          class_attendance: parseFloat(behaviorData.class_attendance) || 0,
          social_media_hours: parseFloat(behaviorData.social_media_hours) || 0,
          screen_time_hours: parseFloat(behaviorData.screen_time_hours) || 0,
          mental_stress_level: parseInt(behaviorData.mental_stress_level) || 0
        };

        if (behaviorData.semester) {
          console.log('Setting semester:', behaviorData.semester);
          setCurrentSemester(behaviorData.semester);
        }
      } else {
        // Set default values
        setFormData({
          study_hours_per_day: 0,
          sleep_hours_per_day: 0,
          class_attendance: 0,
          social_media_hours: 0,
          screen_time_hours: 0,
          mental_stress_level: 0
        });
      }
    } catch (error) {
      // Set default values on error
      setFormData({
        study_hours_per_day: 0,
        sleep_hours_per_day: 0,
        class_attendance: 0,
        social_media_hours: 0,
        screen_time_hours: 0,
        mental_stress_level: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSliderChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: parseFloat(value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      // Get current semester ID (you may need to fetch this from an API)
      const semesterId = currentSemester?.id || 1; // Default to 1 if not available

      const payload = {
        semester_id: semesterId,
        ...formData
      };

      await createOrUpdateBehavior(payload);
      toast.success('Cập nhật hành vi thành công!');

      // Refresh data
      await fetchCurrentBehavior();
    } catch (error) {
      const serverError =
      error.message;
      const validationError =
      error.errors?.[0]?.message;
      toast.error(validationError || serverError || 'Có lỗi xảy ra khi cập nhật hành vi');
      
    } finally {
      setSubmitting(false);
    }
  };

  const fields = [
    {
      name: 'study_hours_per_day',
      label: 'Số giờ tự học mỗi ngày',
      min: 0,
      max: 16,
      step: 0.5,
      unit: 'giờ',
      icon: '📚',
      color: 'blue',
      description: 'Thời gian tự học ngoài giờ lên lớp'
    },
    {
      name: 'sleep_hours_per_day',
      label: 'Số giờ ngủ mỗi ngày',
      min: 0,
      max: 12,
      step: 0.5,
      unit: 'giờ',
      icon: '😴',
      color: 'purple',
      description: 'Thời gian ngủ trung bình mỗi ngày'
    },
    {
      name: 'class_attendance',
      label: 'Tỷ lệ đi học',
      min: 0,
      max: 100,
      step: 1,
      unit: '%',
      icon: '✅',
      color: 'green',
      description: 'Phần trăm buổi học bạn tham gia'
    },
    {
      name: 'social_media_hours',
      label: 'Thời gian dùng mạng xã hội',
      min: 0,
      max: 24,
      step: 0.5,
      unit: 'giờ',
      icon: '📱',
      color: 'pink',
      description: 'Thời gian sử dụng Facebook, Instagram, TikTok...'
    },
    {
      name: 'screen_time_hours',
      label: 'Thời gian sử dụng màn hình',
      min: 0,
      max: 24,
      step: 0.5,
      unit: 'giờ',
      icon: '💻',
      color: 'orange',
      description: 'Tổng thời gian dùng điện thoại, máy tính'
    },
    {
      name: 'mental_stress_level',
      label: 'Mức độ căng thẳng',
      min: 0,
      max: 9,
      step: 1,
      unit: '',
      icon: '😰',
      color: 'red',
      description: 'Đánh giá mức độ stress (0: Rất thấp, 9: Rất cao)'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-500 text-blue-600 border-blue-500',
      purple: 'bg-purple-500 text-purple-600 border-purple-500',
      green: 'bg-green-500 text-green-600 border-green-500',
      pink: 'bg-pink-500 text-pink-600 border-pink-500',
      orange: 'bg-orange-500 text-orange-600 border-orange-500',
      red: 'bg-red-500 text-red-600 border-red-500'
    };
    return colors[color] || colors.blue;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gray-200 rounded w-64"></div>
            <div className="h-6 bg-gray-200 rounded w-96"></div>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-xl p-6">
                <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Cập nhật hành vi học tập
          </h1>
          <p className="text-gray-600">
            Nhập các chỉ số hành vi để nhận dự báo kết quả học tập chính xác hơn
          </p>
          {currentSemester && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-medium">
                Học kỳ hiện tại: {currentSemester.name} - {currentSemester.academic_year}
              </span>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {fields.map((field) => {
            const value = formData[field.name];
            const colorClasses = getColorClasses(field.color);
            const percentage = ((value - field.min) / (field.max - field.min)) * 100;

            return (
              <div
                key={field.name}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{field.icon}</span>
                    <div>
                      <label className="text-lg font-semibold text-gray-800">
                        {field.label}
                      </label>
                      <p className="text-sm text-gray-500 mt-1">
                        {field.description}
                      </p>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-lg bg-${field.color}-50 border-2 ${colorClasses.split(' ')[2]}`}>
                    <span className={`text-2xl font-bold ${colorClasses.split(' ')[1]}`}>
                      {value}
                    </span>
                    <span className="text-sm text-gray-600 ml-1">{field.unit}</span>
                  </div>
                </div>

                {/* Slider */}
                <div className="relative">
                  <input
                    type="range"
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    value={value}
                    onChange={(e) => handleSliderChange(field.name, e.target.value)}
                    className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, ${colorClasses.split(' ')[0].replace('bg-', '#')} 0%, ${colorClasses.split(' ')[0].replace('bg-', '#')} ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>{field.min} {field.unit}</span>
                    <span>{field.max} {field.unit}</span>
                  </div>
                </div>

                {/* Number Input */}
                <div className="mt-4">
                  <input
                    type="number"
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    value={value}
                    onChange={(e) => handleSliderChange(field.name, e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            );
          })}

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang lưu...
                </span>
              ) : (
                'Lưu thông tin'
              )}
            </button>
            <button
              type="button"
              onClick={fetchCurrentBehavior}
              className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Làm mới
            </button>
          </div>
        </form>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Lưu ý quan trọng</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Hãy nhập thông tin trung thực để nhận dự báo chính xác nhất</li>
                <li>• Dữ liệu của bạn được bảo mật và chỉ dùng cho mục đích dự báo</li>
                <li>• Bạn có thể cập nhật thông tin bất cứ lúc nào</li>
                <li>• Sau khi lưu, hệ thống sẽ tự động tính toán dự báo mới</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BehaviorPage;
