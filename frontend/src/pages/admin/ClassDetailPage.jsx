import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  getClassById, getClassStudents, getUnassignedStudents,
  addStudentsToClass, removeStudentFromClass, assignHomeroom, getLecturers
} from '../../services/adminService';

const fullName = (u) => u ? `${u.first_name} ${u.last_name}`.trim() : '—';

const RISK_CONFIG = {
  danger:  { label: 'Nguy hiểm', cls: 'bg-red-100 text-red-700 border-red-200' },
  warning: { label: 'Cảnh báo',  cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  safe:    { label: 'An toàn',   cls: 'bg-green-100 text-green-700 border-green-200' },
};

export default function ClassDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cls, setCls]               = useState(null);
  const [classStudents, setClassStudents] = useState([]);
  const [unassigned, setUnassigned] = useState([]);
  const [lecturers, setLecturers]   = useState([]);
  const [loading, setLoading]       = useState(true);

  const [selectedIds, setSelectedIds]     = useState(new Set());
  const [unassignSearch, setUnassignSearch] = useState('');
  const [classSearch, setClassSearch]     = useState('');
  const [addingIds, setAddingIds]         = useState(false);
  const [removingId, setRemovingId]       = useState(null);

  const [showHomeroomForm, setShowHomeroomForm] = useState(false);
  const [homeroomLecId, setHomeroomLecId]       = useState('');
  const [savingHomeroom, setSavingHomeroom]     = useState(false);

  const debounceRef = useRef(null);

  const fetchClass = useCallback(async () => {
    try {
      const res = await getClassById(id);
      setCls(res.data);
      setHomeroomLecId(res.data?.lecturer_id || '');
    } catch { toast.error('Không tải được thông tin lớp'); }
  }, [id]);

  const fetchClassStudents = useCallback(async () => {
    try {
      const res = await getClassStudents(id);
      setClassStudents(res.data || []);
    } catch { toast.error('Không tải được danh sách sinh viên'); }
  }, [id]);

  const fetchUnassigned = useCallback(async (search = '') => {
    try {
      const res = await getUnassignedStudents(search);
      setUnassigned(res.data || []);
    } catch { /* silent */ }
  }, []);

  const fetchLecturers = useCallback(async () => {
    try {
      const res = await getLecturers();
      setLecturers(Array.isArray(res.data) ? res.data : (res.data?.lecturers || []));
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchClass(), fetchClassStudents(), fetchUnassigned(), fetchLecturers()]);
      setLoading(false);
    };
    init();
  }, [fetchClass, fetchClassStudents, fetchUnassigned, fetchLecturers]);

  // Debounce unassigned search
  const handleUnassignSearch = (val) => {
    setUnassignSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchUnassigned(val), 400);
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === unassigned.length && unassigned.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(unassigned.map(s => s.id)));
    }
  };

  const handleAddStudents = async () => {
    if (selectedIds.size === 0) return toast.error('Chưa chọn sinh viên nào');
    setAddingIds(true);
    try {
      const res = await addStudentsToClass(id, [...selectedIds]);
      toast.success(`Đã thêm ${res.data?.added?.length || 0} sinh viên vào lớp`);
      if (res.data?.skipped?.length > 0) {
        toast(`${res.data.skipped.length} sinh viên đã thuộc lớp khác, bỏ qua`, { icon: 'ℹ️' });
      }
      setSelectedIds(new Set());
      await Promise.all([fetchClassStudents(), fetchUnassigned(unassignSearch)]);
    } catch (err) {
      toast.error(err?.message || 'Thêm sinh viên thất bại');
    } finally {
      setAddingIds(false);
    }
  };

  const handleRemove = async (studentId) => {
    setRemovingId(studentId);
    try {
      await removeStudentFromClass(id, studentId);
      toast.success('Đã xóa sinh viên khỏi lớp');
      await Promise.all([fetchClassStudents(), fetchUnassigned(unassignSearch)]);
    } catch (err) {
      toast.error(err?.message || 'Xóa thất bại');
    } finally {
      setRemovingId(null);
    }
  };

  const handleSaveHomeroom = async () => {
    setSavingHomeroom(true);
    try {
      await assignHomeroom(id, { lecturer_id: homeroomLecId ? Number(homeroomLecId) : null });
      toast.success('Phân công GVCN thành công');
      setShowHomeroomForm(false);
      fetchClass();
    } catch (err) {
      toast.error(err?.message || 'Phân công thất bại');
    } finally {
      setSavingHomeroom(false);
    }
  };

  const filteredClassStudents = classStudents.filter(s => {
    const q = classSearch.toLowerCase();
    if (!q) return true;
    const name = fullName(s.user).toLowerCase();
    const code = (s.student_code || '').toLowerCase();
    return name.includes(q) || code.includes(q);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Back + Header */}
      <div className="mb-6">
        <button onClick={() => navigate('/admin/classes')}
          className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600 text-sm mb-4 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại danh sách lớp
        </button>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{cls?.class_name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {cls?.department && (
                <span className="bg-indigo-100 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full border border-indigo-200">
                  {cls.department.code} — {cls.department.name}
                </span>
              )}
              <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full border border-blue-200">
                {classStudents.length} sinh viên
              </span>
            </div>
          </div>

          {/* GVCN panel */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 min-w-[280px]">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Giáo viên chủ nhiệm</p>
            {cls?.homeroom_teacher ? (
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{fullName(cls.homeroom_teacher?.user)}</p>
                  <p className="text-xs text-slate-500">{cls.homeroom_teacher?.user?.email}</p>
                </div>
                <button onClick={() => setShowHomeroomForm(v => !v)}
                  className="text-xs text-blue-600 hover:underline font-medium">
                  Thay đổi
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm text-amber-600 font-medium">Chưa phân công</span>
                <button onClick={() => setShowHomeroomForm(v => !v)}
                  className="text-xs text-blue-600 hover:underline font-medium">
                  Phân công
                </button>
              </div>
            )}
            {showHomeroomForm && (
              <div className="mt-3 pt-3 border-t border-slate-100 flex gap-2">
                <select
                  value={homeroomLecId}
                  onChange={e => setHomeroomLecId(e.target.value)}
                  className="flex-1 border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Bỏ phân công --</option>
                  {lecturers.map(l => (
                    <option key={l.id} value={l.id}>{fullName(l.user)} ({l.lecturer_code})</option>
                  ))}
                </select>
                <button onClick={handleSaveHomeroom} disabled={savingHomeroom}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60 font-medium">
                  {savingHomeroom ? '...' : 'Lưu'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* LEFT: Unassigned students */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-700 text-sm mb-3">Sinh viên chưa có lớp</h2>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                type="text" placeholder="Tìm sinh viên..."
                value={unassignSearch} onChange={e => handleUnassignSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Select all bar */}
          {unassigned.length > 0 && (
            <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
                <input type="checkbox"
                  checked={selectedIds.size === unassigned.length && unassigned.length > 0}
                  onChange={toggleAll}
                  className="rounded border-slate-300 text-blue-600"
                />
                Chọn tất cả ({unassigned.length})
              </label>
              {selectedIds.size > 0 && (
                <span className="text-xs font-medium text-blue-600">{selectedIds.size} đã chọn</span>
              )}
            </div>
          )}

          {/* List */}
          <div className="flex-1 overflow-y-auto" style={{ maxHeight: '420px' }}>
            {unassigned.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <svg className="w-8 h-8 mb-2 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
                </svg>
                <p className="text-xs">Không có sinh viên chưa có lớp</p>
              </div>
            ) : (
              unassigned.map(s => (
                <label key={s.id}
                  className={`flex items-center gap-3 px-4 py-3 border-b border-slate-50 cursor-pointer hover:bg-blue-50/50 transition-colors ${selectedIds.has(s.id) ? 'bg-blue-50' : ''}`}>
                  <input type="checkbox"
                    checked={selectedIds.has(s.id)}
                    onChange={() => toggleSelect(s.id)}
                    className="rounded border-slate-300 text-blue-600"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{fullName(s.user)}</p>
                    <p className="text-xs text-slate-500">{s.student_code}</p>
                  </div>
                </label>
              ))
            )}
          </div>

          {/* Add button */}
          <div className="p-4 border-t border-slate-100">
            <button
              onClick={handleAddStudents}
              disabled={selectedIds.size === 0 || addingIds}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {addingIds ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              )}
              Thêm vào lớp {selectedIds.size > 0 && `(${selectedIds.size})`}
            </button>
          </div>
        </div>

        {/* RIGHT: Class students */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3">
            <h2 className="font-semibold text-slate-700 text-sm">
              Sinh viên trong lớp
              <span className="ml-2 bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                {classStudents.length}
              </span>
            </h2>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                type="text" placeholder="Lọc sinh viên..."
                value={classSearch} onChange={e => setClassSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 w-44"
              />
            </div>
          </div>

          <div className="overflow-auto flex-1" style={{ maxHeight: '500px' }}>
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-50 z-10">
                <tr className="border-b border-slate-200">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Mã SV</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Họ tên</th>
                  <th className="text-center px-4 py-2.5 text-xs font-semibold text-slate-500">GPA</th>
                  <th className="text-center px-4 py-2.5 text-xs font-semibold text-slate-500">Nguy cơ</th>
                  <th className="text-center px-4 py-2.5 text-xs font-semibold text-slate-500"></th>
                </tr>
              </thead>
              <tbody>
                {filteredClassStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-400 text-xs">
                      {classStudents.length === 0 ? 'Lớp chưa có sinh viên nào' : 'Không tìm thấy sinh viên'}
                    </td>
                  </tr>
                ) : (
                  filteredClassStudents.map(s => {
                    const risk = s.latest_prediction?.risk_label;
                    const rc = RISK_CONFIG[risk];
                    return (
                      <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-slate-600">{s.student_code}</td>
                        <td className="px-4 py-3 font-medium text-slate-800">{fullName(s.user)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-semibold text-slate-700">
                            {s.gpa_cumulative != null ? parseFloat(s.gpa_cumulative).toFixed(2) : '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {rc ? (
                            <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full border ${rc.cls}`}>
                              {rc.label}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">Chưa dự báo</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleRemove(s.id)}
                            disabled={removingId === s.id}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Xóa khỏi lớp"
                          >
                            {removingId === s.id
                              ? <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                              : <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                            }
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
