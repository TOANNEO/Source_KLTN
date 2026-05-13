import { useState, useEffect } from 'react';
import { getDashboard, getGPAHistory, getLatestPrediction, getCurrentBehavior } from '../../services/studentService';
import GPACard from '../../components/student/GPACard';
import PredictionCard from '../../components/student/PredictionCard';
import GPALineChart from '../../components/student/GPALineChart';
import BehaviorRadarChart from '../../components/student/BehaviorRadarChart';
import QuickActions from '../../components/student/QuickActions';

const StudentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    profile: null,
    gpaHistory: [],
    latestPrediction: null,
    behaviorData: null
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all dashboard data in parallel
      const [dashboardRes, gpaHistoryRes, predictionRes, behaviorRes] = await Promise.allSettled([
        getDashboard(),
        getGPAHistory(),
        getLatestPrediction(),
        getCurrentBehavior()
      ]);

    

      setDashboardData({
  profile:
    dashboardRes.status === 'fulfilled' &&
    dashboardRes.value?.data?.profile
      ? dashboardRes.value.data.profile
      : null,

  gpaHistory:
    dashboardRes.status === 'fulfilled' &&
    dashboardRes.value?.data?.gpa_history
      ? dashboardRes.value.data.gpa_history
      : [],

  latestPrediction:
    predictionRes.status === 'fulfilled' &&
    predictionRes.value?.data
      ? predictionRes.value.data
      : null,

  behaviorData:
    behaviorRes.status === 'fulfilled' &&
    behaviorRes.value?.data
      ? behaviorRes.value.data
      : null
});
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Dashboard Sinh viên
          </h1>
          <p className="text-gray-600">
            Theo dõi kết quả học tập và nhận gợi ý cải thiện
          </p>
        </div>

        {/* Top Row: GPA and Prediction Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <GPACard
            gpa={dashboardData.profile?.gpa_cumulative || 0}
            totalCredits={dashboardData.profile?.total_credits || 0}
          />
          <PredictionCard prediction={dashboardData.latestPrediction} />
        </div>

        {/* Middle Row: Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <GPALineChart gpaHistory={dashboardData.gpaHistory} />
          <BehaviorRadarChart behaviorData={dashboardData.behaviorData} />
        </div>

        {/* Bottom Row: Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Thao tác nhanh</h2>
          <QuickActions />
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
