import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  getClasses, createClass, updateClass, deleteClass,
  getDepartments, getLecturers
} from '../../services/adminService';

const fullName = (u) => u ? `${u.first_name} ${u.last_name}` : '';

const EMPTY_FORM = { class_name: '', department_id: '', lecturer_id: '' };

export default function ClassesPage() {
  const navigate = useNavigate();
  const [classes, setClasses]       = useState([]);
  const [departments, setDepartments] = useState([]);
  const [lecturers, setLecturers]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [showModal, setShowModal]   = useState(false);
  const [editing, setEditing]       = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [saving, setSaving]         = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]     = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [clsRes, deptRes, lecRes] = await Promise.all([
        getClasses({ search, department_id: deptFilter }),
        getDepartments(),
        getLecturers()
      ]);
      setClasses(clsRes.data || []);
      setDepartments(deptRes.data || []);
      setLecturers(Array.isArray(lecRes.data) ? lecRes.data : (lecRes.data?.lecturers || []));
    } catch {
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [search, deptFilter]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit   = (cls) => {
    setEditing(cls);
    setForm({
      class_name:    cls.class_name,
      department_id: cls.department_id,
      lecturer_id:   cls.lecturer_id || ''
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.class_name.trim()) return toast.error('Tên lớp là bắt buộc');
    if (!form.department_id)     return toast.error('Vui lòng chọn khoa');
    setSaving(true);
    try {
      const payload = {
        class_name:    form.class_name.trim(),
        department_id: Number(form.department_id),
        lecturer_id:   form.lecturer_id ? Number(form.lecturer_id) : null
      };
      if (editing) {
        await updateClass(editing.id, payload);
        toast.success('Cập nhật lớp thành công');
      } else {
        await createClass(payload);
        toast.success('Tạo lớp thành công');
      }
      setShowModal(false);
      fetchAll();
    } catch (err) {
      toast.error(err?.message || 'Thao tác thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteClass(deleteTarget.id);
      toast.success('Đã xóa lớp');
      setDeleteTarget(null);
      fetchAll();
    } catch (err) {
      toast.error(err?.message || 'Xóa thất bại');
    } finally {
      setDeleting(false);
    }
  };

  const totalWithHomeroom = classes.filter(c => c.lecturer_id).length;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Quản lý Lớp hành chính</h1>
        <p className="text-slate-500 text-sm mt-1">Tạo, chỉnh sửa và phân công sinh viên vào các lớp học</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Tổng số lớp"  value={classes.length} color="blue" />
        <StatCard label="Đã phân công GVCN" value={totalWithHomeroom} color="green" />
        <StatCard label="Chưa phân công" value={classes.length - totalWithHomeroom} color="amber" />
        <StatCard label="Tổng sinh viên" value={classes.reduce((s,c) => s + (c.student_count||0), 0)} color="indigo" />
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-4 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-3 flex-wrap">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text" placeholder="Tìm tên lớp..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-52"
            />
          </div>
          <select
            value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả khoa</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm lớp
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-5 py-3 font-semibold text-slate-600">Tên lớp</th>
              <th className="text-left px-5 py-3 font-semibold text-slate-600">Khoa</th>
              <th className="text-left px-5 py-3 font-semibold text-slate-600">Giáo viên chủ nhiệm</th>
              <th className="text-center px-5 py-3 font-semibold text-slate-600">Số SV</th>
              <th className="text-center px-5 py-3 font-semibold text-slate-600">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({length: 5}).map((_, i) => (
                <tr key={i} className="border-b border-slate-100">
                  {Array.from({length: 5}).map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : classes.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-16 text-slate-400">
                  <div className="flex flex-col items-center gap-2">
                    <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21H5a2 2 0 01-2-2V7a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                    </svg>
                    <span>Chưa có lớp hành chính nào</span>
                  </div>
                </td>
              </tr>
            ) : (
              classes.map((cls, idx) => (
                <tr key={cls.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${idx % 2 === 0 ? '' : 'bg-slate-50/40'}`}>
                  <td className="px-5 py-3 font-semibold text-slate-800">{cls.class_name}</td>
                  <td className="px-5 py-3 text-slate-600">
                    {cls.department ? (
                      <span className="inline-flex items-center gap-1">
                        <span className="bg-indigo-100 text-indigo-700 text-xs font-medium px-2 py-0.5 rounded">{cls.department.code}</span>
                        <span className="hidden md:inline">{cls.department.name}</span>
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-5 py-3">
                    {cls.homeroom_teacher ? (
                      <span className="text-slate-700">
                        {fullName(cls.homeroom_teacher.user)}
                        <span className="text-xs text-slate-400 ml-1">({cls.homeroom_teacher.lecturer_code})</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-medium px-2.5 py-1 rounded-full border border-amber-200">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        Chưa phân công
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className="bg-blue-100 text-blue-700 font-semibold text-sm px-3 py-0.5 rounded-full">
                      {cls.student_count || 0}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <ActionBtn title="Xem chi tiết" onClick={() => navigate(`/admin/classes/${cls.id}`)} color="indigo">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                      </ActionBtn>
                      <ActionBtn title="Chỉnh sửa" onClick={() => openEdit(cls)} color="blue">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      </ActionBtn>
                      <ActionBtn title="Xóa lớp" onClick={() => setDeleteTarget(cls)} color="red">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </ActionBtn>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <Modal title={editing ? 'Chỉnh sửa lớp' : 'Thêm lớp mới'} onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <FormField label="Tên lớp *">
              <input
                type="text" value={form.class_name}
                onChange={e => setForm(f => ({...f, class_name: e.target.value}))}
                placeholder="VD: CNTT2022A"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </FormField>
            <FormField label="Khoa *">
              <select
                value={form.department_id}
                onChange={e => setForm(f => ({...f, department_id: e.target.value}))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Chọn khoa --</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </FormField>
            <FormField label="Giáo viên chủ nhiệm (tuỳ chọn)">
              <select
                value={form.lecturer_id}
                onChange={e => setForm(f => ({...f, lecturer_id: e.target.value}))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Chưa phân công --</option>
                {lecturers.map(l => (
                  <option key={l.id} value={l.id}>
                    {fullName(l.user)} ({l.lecturer_code})
                  </option>
                ))}
              </select>
            </FormField>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              Hủy
            </button>
            <button
              onClick={handleSave} disabled={saving}
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-60"
            >
              {saving ? 'Đang lưu...' : editing ? 'Cập nhật' : 'Tạo lớp'}
            </button>
          </div>
        </Modal>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <Modal title="Xác nhận xóa lớp" onClose={() => setDeleteTarget(null)}>
          <p className="text-slate-600 text-sm">
            Bạn có chắc muốn xóa lớp <span className="font-semibold text-slate-800">{deleteTarget.class_name}</span>?
            Chỉ có thể xóa lớp khi không còn sinh viên.
          </p>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              Hủy
            </button>
            <button
              onClick={handleDelete} disabled={deleting}
              className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-60"
            >
              {deleting ? 'Đang xóa...' : 'Xóa lớp'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────── */

function StatCard({ label, value, color }) {
  const colors = {
    blue:   'bg-blue-50 border-blue-200 text-blue-700',
    green:  'bg-green-50 border-green-200 text-green-700',
    amber:  'bg-amber-50 border-amber-200 text-amber-700',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[color] || colors.blue}`}>
      <p className="text-xs font-medium opacity-70">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

function ActionBtn({ title, onClick, color, children }) {
  const colors = {
    indigo: 'text-indigo-600 hover:bg-indigo-50',
    blue:   'text-blue-600 hover:bg-blue-50',
    red:    'text-red-500 hover:bg-red-50',
  };
  return (
    <button title={title} onClick={onClick}
      className={`p-1.5 rounded-lg transition-colors ${colors[color] || colors.blue}`}>
      {children}
    </button>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 z-10">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-slate-800 text-base">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
