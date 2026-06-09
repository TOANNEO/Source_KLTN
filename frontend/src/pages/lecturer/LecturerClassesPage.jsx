import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { BuildingLibraryIcon } from '@heroicons/react/24/outline';
import { getLecturerClasses } from '../../services/lecturerService';

export default function LecturerClassesPage() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLecturerClasses()
      .then(res => {
        if (res.success) setClasses(res.data || []);
        else toast.error(res.message || 'Không thể tải danh sách lớp');
      })
      .catch(() => toast.error('Không thể tải danh sách lớp chủ nhiệm'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Lớp chủ nhiệm</h1>
        <p className="text-slate-500 text-sm mt-0.5">Danh sách các lớp  đang phụ trách</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 animate-pulse">
              <div className="h-5 bg-slate-200 rounded w-2/3 mb-3" />
              <div className="h-3 bg-slate-100 rounded w-1/2 mb-6" />
              <div className="grid grid-cols-3 gap-2">
                {[1,2,3].map(j => <div key={j} className="h-10 bg-slate-100 rounded-lg" />)}
              </div>
            </div>
          ))}
        </div>
      ) : classes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <BuildingLibraryIcon className="w-16 h-16 text-slate-300 mb-4" />
          <h3 className="font-semibold text-slate-700 mb-1">Chưa có lớp chủ nhiệm</h3>
          <p className="text-slate-400 text-sm max-w-xs">
            Bạn chưa được phân công chủ nhiệm lớp nào. Vui lòng liên hệ quản trị viên.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {classes.map(cls => (
            <ClassCard key={cls.id} cls={cls} onClick={() => navigate(`/lecturer/classes/${cls.id}`)} />
          ))}
        </div>
      )}
    </div>
  );
}

function ClassCard({ cls, onClick }) {
  const rc = cls.risk_counts || { danger: 0, warning: 0, safe: 0 };
  const total = cls.student_count || 0;
  const withPred = rc.danger + rc.warning + rc.safe;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer flex flex-col"
    >
      <div className="p-5 flex-1">
        {/* Class name + student count */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-lg font-bold text-slate-800 leading-tight">{cls.class_name}</h3>
          <span className="shrink-0 bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-200">
            {total} SV
          </span>
        </div>

        {/* Department */}
        {cls.department && (
          <p className="text-xs text-slate-500 mb-4">
            {cls.department.name}
            <span className="ml-1 text-slate-400">({cls.department.code})</span>
          </p>
        )}

        {/* Risk mini-stats */}
        {withPred > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 text-center">
              <p className="text-xs text-red-500 font-medium">Nguy hiểm</p>
              <p className="text-xl font-bold font-mono text-red-700 mt-0.5">{rc.danger}</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-center">
              <p className="text-xs text-amber-500 font-medium">Cảnh báo</p>
              <p className="text-xl font-bold font-mono text-amber-700 mt-0.5">{rc.warning}</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-center">
              <p className="text-xs text-emerald-500 font-medium">An toàn</p>
              <p className="text-xl font-bold font-mono text-emerald-700 mt-0.5">{rc.safe}</p>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-center">
            <p className="text-xs text-slate-400">Chưa có dữ liệu dự báo</p>
          </div>
        )}
      </div>

      {/* Risk bar */}
      {withPred > 0 && (
        <div className="px-5 pb-3">
          <div className="h-1.5 rounded-full overflow-hidden flex">
            {rc.danger  > 0 && <div className="bg-red-400"    style={{ width: `${(rc.danger  / withPred) * 100}%` }} />}
            {rc.warning > 0 && <div className="bg-amber-400"  style={{ width: `${(rc.warning / withPred) * 100}%` }} />}
            {rc.safe    > 0 && <div className="bg-emerald-400" style={{ width: `${(rc.safe   / withPred) * 100}%` }} />}
          </div>
        </div>
      )}

      <div className="px-5 pb-5">
        <div className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-lg transition-colors">
          Xem danh sách sinh viên
        </div>
      </div>
    </div>
  );
}
