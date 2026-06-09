import { useState, useEffect } from 'react';
import { getGrades, getProfile } from '../../services/studentService';
import { groupGradesByYearAndSemester, convertTo4Scale } from '../../utils/gradeUtils';
import GradeTable from '../../components/student/GradeTable';
import SemesterSummary from '../../components/student/SemesterSummary';
import GradeTableSkeleton from '../../components/student/GradeTableSkeleton';

const GradesPage = () => {
  const [loading, setLoading] = useState(true);
  const [gradesData, setGradesData] = useState({});
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGradesData();
  }, []);

  const fetchGradesData = async () => {
    try {
      setLoading(true);
      setError(null);

  

      const [gradesRes, profileRes] = await Promise.allSettled([
        getGrades(),
        getProfile()
      ]);


      if (gradesRes.status === 'fulfilled') {
        console.log('Grades response value:', gradesRes.value);


        const grades = gradesRes.value?.data || [];
    

        if (Array.isArray(grades) && grades.length > 0) {
          const grouped = groupGradesByYearAndSemester(grades);

          setGradesData(grouped);
        } else {
          console.warn('No grades data or not an array');
        }
      } else {
        console.error('Failed to fetch grades:', gradesRes);
      }

      if (profileRes.status === 'fulfilled') {
        // API interceptor already unwraps response.data
        const profileData = profileRes.value?.data;
        console.log('Profile data:', profileData);
        setProfile(profileData);
      } else {
        console.error('Failed to fetch profile:', profileRes);
      }

    } catch (err) {
      console.error('Error fetching grades:', err);
      setError('Không thể tải dữ liệu bảng điểm. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const calculateCumulativeGPA = () => {
    if (!profile) return { gpa10: '0.00', gpa4: '0.00' };

    const gpa10 = parseFloat(profile.gpa_cumulative) || 0;
    const gpa4 = convertTo4Scale(gpa10);

    return {
      gpa10: gpa10.toFixed(2),
      gpa4: gpa4.toFixed(2)
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="h-10 bg-gray-200 rounded w-64 mb-4 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-96 animate-pulse"></div>
          </div>
          <GradeTableSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700 font-medium">{error}</p>
            <button
              onClick={fetchGradesData}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  const academicYears = Object.keys(gradesData).sort().reverse();

  if (academicYears.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Bảng điểm</h1>
            <p className="text-gray-600">Xem kết quả học tập theo từng học kỳ</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <svg className="w-24 h-24 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Chưa có điểm</h3>
            <p className="text-gray-500">Bảng điểm của bạn sẽ hiển thị ở đây khi có kết quả học tập</p>
          </div>
        </div>
      </div>
    );
  }

  const cumulativeGPA = calculateCumulativeGPA();
  const cumulativeCredits = profile?.total_credits || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Bảng điểm</h1>
          <p className="text-gray-600">Xem kết quả học tập theo từng học kỳ</p>
        </div>

        {/* Grades by Academic Year */}
        <div className="space-y-8">
          {academicYears.map((year) => {
            const semesters = Object.keys(gradesData[year]).sort();

            return (
              <div key={year} className="bg-white rounded-2xl shadow-lg p-8">
                {/* Academic Year Header */}
                <div className="mb-6 pb-4 border-b-2 border-blue-600">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Năm học: {year}
                  </h2>
                </div>

                {/* Semesters */}
                <div className="space-y-8">
                  {semesters.map((semester) => {
                    const semesterGrades = gradesData[year][semester];

                    return (
                      <div key={semester} className="space-y-4">
                        {/* Semester Header */}
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                          <h3 className="text-xl font-bold text-gray-700">
                            Học kỳ: {semester}
                          </h3>
                          <span className="ml-auto text-sm text-gray-500 font-mono">
                            {semesterGrades.length} môn học
                          </span>
                        </div>

                        {/* Grade Table */}
                        <GradeTable grades={semesterGrades} />

                        {/* Semester Summary */}
                        <SemesterSummary
                          grades={semesterGrades}
                          cumulativeGPA={cumulativeGPA}
                          cumulativeCredits={cumulativeCredits}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Chú thích:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-50 border border-red-200 rounded"></div>
              <span className="text-gray-600">Điểm &lt; 4.0: Không đạt</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-50 border border-yellow-200 rounded"></div>
              <span className="text-gray-600">Điểm 4.0 - 5.6: Đủ điều kiện học cải thiện</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-50 border border-green-200 rounded"></div>
              <span className="text-gray-600">Điểm &gt; 5.6: Đạt</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradesPage;
