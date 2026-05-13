import { useNavigate } from 'react-router-dom';

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Cập Nhật Hành Vi',
      description: 'Nhập chỉ số học tập và sinh hoạt',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      color: 'blue',
      path: '/student/behavior'
    },
    {
      title: 'Xem Gợi Ý Cải Thiện',
      description: 'Nhận đề xuất học cải thiện GPA',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      color: 'purple',
      path: '/student/improvement'
    }
  ];

  const colorClasses = {
    blue: {
      bg: 'bg-blue-500',
      hover: 'hover:bg-blue-600',
      light: 'bg-blue-50',
      text: 'text-blue-600'
    },
    purple: {
      bg: 'bg-purple-500',
      hover: 'hover:bg-purple-600',
      light: 'bg-purple-50',
      text: 'text-purple-600'
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {actions.map((action, index) => {
        const colors = colorClasses[action.color];
        return (
          <button
            key={index}
            onClick={() => navigate(action.path)}
            className={`p-6 rounded-xl ${colors.light} border-2 border-transparent hover:border-${action.color}-300 transition-all duration-300 hover:scale-105 hover:shadow-lg text-left group`}
          >
            <div className={`${colors.bg} w-16 h-16 rounded-full flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
              {action.icon}
            </div>
            <h3 className={`font-bold ${colors.text} mb-2 text-lg`}>{action.title}</h3>
            <p className="text-sm text-gray-600">{action.description}</p>
          </button>
        );
      })}
    </div>
  );
};

export default QuickActions;
