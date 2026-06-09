import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import {
  getSemesters, createSemester, updateSemester, setCurrentSemester
} from '../../services/adminService';

const EMPTY_FORM = { name: '', academic_year: '', start_date: '', end_date: '' };

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const toISO = (d) => (d ? d.split('T')[0] : '');
export default function SemestersPage() {
  const [semesters, setSemesters]   = useState([]);
  const [loading, setLoading]       = useState(true);

  const [showModal, setShowModal]   = useState(false);
  const [editing, setEditing]       = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [saving, setSaving]         = useState(false);

  const [setCurrent, setSetCurrent] = useState(null); // semester to confirm
  const [setting, setSetting]       = useState(false);

  /* ─── Fetch ────────────────────────────────────────────────── */
  const fetchSemesters = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSemesters();
      const list = res.data?.items || res.data || [];
      // Sort ascending by start_date
      setSemesters(list);
    } catch {
      toast.error('Không thể tải danh sách học kỳ');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSemesters(); }, [fetchSemesters]);

  /* ─── Open modal ────────────────────────────────────────────── */
  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (sem) => {
    setEditing(sem);
    setForm({
      name:          sem.name || '',
      academic_year: sem.academic_year || '',
      start_date:    toISO(sem.start_date),
      end_date:      toISO(sem.end_date)
    });
    setShowModal(true);
  };

  /* ─── Frontend date validation ──────────────────────────────── */
  const validateDates = () => {
    const { start_date, end_date } = form;
    if (!start_date || !end_date) {
      toast.error('Ngày bắt đầu và kết thúc là bắt buộc');
      return false;
    }
    if (new Date(start_date) >= new Date(end_date)) {
      toast.error('Ngày bắt đầu phải trước ngày kết thúc');
      return false;
    }
    // When creating: new start_date must be after latest existing end_date
    if (!editing) {
      const latest = semesters.reduce((acc, s) => {
        if (!s.end_date) return acc;
        return !acc || new Date(s.end_date) > new Date(acc) ? s.end_date : acc;
      }, null);
      if (latest && new Date(start_date) <= new Date(latest)) {
        toast.error(`Ngày bắt đầu phải sau ${fmtDate(latest)} (ngày kết thúc học kỳ gần nhất)`);
        return false;
      }
    }
    return true;
  };

  /* ─── Save ──────────────────────────────────────────────────── */
  const handleSave = async () => {
    if (!form.name.trim())          return toast.error('Tên học kỳ là bắt buộc');
    if (!form.academic_year.trim()) return toast.error('Năm học là bắt buộc');
    if (!/^\d{4}-\d{4}$/.test(form.academic_year.trim()))
      return toast.error('Năm học phải có dạng YYYY-YYYY');
    if (!validateDates()) return;

    setSaving(true);
    try {
      if (editing) {
        await updateSemester(editing.id, form);
        toast.success('Cập nhật học kỳ thành công');
      } else {
        await createSemester(form);
        toast.success('Thêm học kỳ thành công');
      }
      setShowModal(false);
      fetchSemesters();
    } catch (err) {
      toast.error(err?.message || 'Thao tác thất bại');
    } finally {
      setSaving(false);
    }
  };

  /* ─── Set current ───────────────────────────────────────────── */
  const handleSetCurrent = async () => {
    if (!setCurrent) return;
    setSetting(true);
    try {
      await setCurrentSemester(setCurrent.id);
      toast.success('Đã đặt học kỳ hiện hành');
      setSetCurrent(null);
      fetchSemesters();
    } catch (err) {
      toast.error(err?.message || 'Không thể đặt học kỳ hiện hành');
    } finally {
      setSetting(false);
    }
  };

  /* ─── Latest end_date hint ──────────────────────────────────── */
  const latestEndDate = !editing
    ? semesters.reduce((acc, s) => {
        if (!s.end_date) return acc;
        return !acc || new Date(s.end_date) > new Date(acc) ? s.end_date : acc;
      }, null)
    : null;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Quản lý học kỳ</h1>
        <p className="text-slate-500 text-sm mt-1">Tạo, cập nhật và đặt học kỳ hiện hành</p>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-4 flex justify-end">
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm học kỳ
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Tên học kỳ</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Năm học</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Ngày bắt đầu</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Ngày kết thúc</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500">Trạng thái</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-100">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : semesters.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-16 text-slate-400">
                  <div className="flex flex-col items-center gap-2">
                    <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm">Chưa có học kỳ nào</span>
                  </div>
                </td>
              </tr>
            ) : (
              semesters.map(sem => (
                <tr key={sem.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800">{sem.name}</td>
                  <td className="px-4 py-3 text-slate-600">{sem.academic_year}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs tabular-nums">{fmtDate(sem.start_date)}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs tabular-nums">{fmtDate(sem.end_date)}</td>
                  <td className="px-4 py-3 text-center">
                    {sem.is_current ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700 border border-green-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                        Hiện hành
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                        Không hoạt động
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      {/* Edit */}
                      <button
                        title="Chỉnh sửa"
                        onClick={() => openEdit(sem)}
                        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      {/* Set current */}
                      {!sem.is_current && (
                        <button
                          title="Đặt làm học kỳ hiện hành"
                          onClick={() => setSetCurrent(sem)}
                          className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <Modal
          title={editing ? `Chỉnh sửa: ${editing.name}` : 'Thêm học kỳ mới'}
          onClose={() => setShowModal(false)}
        >
          <div className="space-y-4">
            {/* Date hint */}
            {!editing && latestEndDate && (
              <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5">
                <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-blue-700">
                  Ngày bắt đầu phải sau <span className="font-semibold">{fmtDate(latestEndDate)}</span> (ngày kết thúc học kỳ gần nhất).
                </p>
              </div>
            )}

            <FormField label="Tên học kỳ *">
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="VD: Học kỳ 1"
                className={inputCls}
              />
            </FormField>

            <FormField label="Năm học *">
              <input
                value={form.academic_year}
                onChange={e => setForm(f => ({ ...f, academic_year: e.target.value }))}
                placeholder="VD: 2024-2025"
                className={inputCls}
              />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Ngày bắt đầu *">
                <input
                  type="date"
                  value={form.start_date}
                  onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                  className={inputCls}
                  min={!editing && latestEndDate ? toISO(new Date(new Date(latestEndDate).getTime() + 86400000).toISOString()) : undefined}
                />
              </FormField>
              <FormField label="Ngày kết thúc *">
                <input
                  type="date"
                  value={form.end_date}
                  onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                  className={inputCls}
                  min={form.start_date || undefined}
                />
              </FormField>
            </div>

            <div className="flex justify-end gap-3 pt-1">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-60"
              >
                {saving ? 'Đang lưu...' : editing ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Set-current confirm */}
      {setCurrent && (
        <Modal
          title="Đặt học kỳ hiện hành"
          onClose={() => setSetCurrent(null)}
        >
          <p className="text-sm text-slate-600 mb-5">
            Bạn có chắc muốn đặt{' '}
            <span className="font-semibold text-slate-800">{setCurrent.name} ({setCurrent.academic_year})</span>{' '}
            làm học kỳ hiện hành? Học kỳ hiện hành cũ sẽ tự động bị tắt.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setSetCurrent(null)}
              className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSetCurrent}
              disabled={setting}
              className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-60"
            >
              {setting ? 'Đang xử lý...' : 'Xác nhận'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ── Helpers ─────────────────────────────────────────────────── */

const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

function FormField({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 z-10">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-slate-800 text-base">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
