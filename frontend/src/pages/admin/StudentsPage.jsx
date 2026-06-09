import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import {
  getStudents, createStudent, updateStudent, deleteStudent,
  toggleStudentActive, resetStudentPassword, getClasses
} from '../../services/adminService';

const fullName = (u) => u ? `${u.first_name || ''} ${u.last_name || ''}`.trim() : '—';

const EMPTY_FORM = {
  student_code: '', first_name: '', last_name: '',
  email: '', password: '', major: '', course_year: '', class_id: ''
};

export default function StudentsPage() {
  const [students, setStudents]     = useState([]);
  const [classes, setClasses]       = useState([]);
  const [allYears, setAllYears]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [yearFilter, setYearFilter] = useState('');

  const [showModal, setShowModal]   = useState(false);
  const [editing, setEditing]       = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [saving, setSaving]         = useState(false);

  const [toggleTarget, setToggleTarget]   = useState(null);
  const [toggling, setToggling]           = useState(false);

  const [resetTarget, setResetTarget]     = useState(null);
  const [newPassword, setNewPassword]     = useState('');
  const [resetting, setResetting]         = useState(false);

  const [deleteTarget, setDeleteTarget]   = useState(null);
  const [deleting, setDeleting]           = useState(false);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getStudents({ search, course_year: yearFilter });
      const data = res.data || [];
      setStudents(data);
      // Cập nhật danh sách khóa khi không có filter (để không bị thu hẹp)
      if (!yearFilter) {
        const years = [...new Set(data.map(s => s.course_year).filter(Boolean))].sort((a, b) => b - a);
        setAllYears(years);
      }
    } catch (err) {
       const serverError =
      err.message;
      const validationError =
      err.errors?.[0]?.message;
      toast.error(validationError || serverError || 'Thao tác thất bại');
    } finally {
      setLoading(false);
    }
  }, [search, yearFilter]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  useEffect(() => {
    getClasses().then(r => setClasses(r.data || [])).catch(() => {});
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    setForm({
      student_code: s.student_code || '',
      first_name:   s.user?.first_name || '',
      last_name:    s.user?.last_name || '',
      email:        s.user?.email || '',
      password:     '',
      major:        s.major || '',
      course_year:  s.course_year || '',
      class_id:     s.class_id || ''
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    console.log('1. Handle Save clicked');
    if (!form.student_code.trim()) return toast.error('Mã sinh viên là bắt buộc');
    if (!form.first_name.trim())   return toast.error('Họ là bắt buộc');
    if (!form.last_name.trim())    return toast.error('Tên là bắt buộc');
    if (!editing && !form.email.trim()) return toast.error('Email là bắt buộc');

    setSaving(true);
    try {
      const payload = {
        student_code: form.student_code.trim(),
        first_name:   form.first_name.trim(),
        last_name:    form.last_name.trim(),
        full_name:    `${form.first_name.trim()} ${form.last_name.trim()}`,
        major:        form.major.trim(),
        course_year:  Number(form.course_year) || undefined,
        class_id:     form.class_id ? Number(form.class_id) : null,
        email:        form.email.trim(),
        ...(form.password && { password: form.password })
      };

      if (editing) {
        console.log('CALL UPDATE');
        const res = await updateStudent(editing.id, payload);
        console.log('DONE UPDATE');
        toast.success('Cập nhật sinh viên thành công');
        if (res.data?.hasGrades) toast('Sinh viên này đã có điểm trong hệ thống', { icon: 'ℹ️' });
      } else {
        await createStudent(payload);
        toast.success('Thêm sinh viên thành công');
      }
      setShowModal(false);
      fetchStudents();
    } catch (err) {
      const serverError =
      err.message;
      const validationError =
      err.errors?.[0]?.message;
      toast.error(validationError || serverError || 'Thao tác thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async () => {
    if (!toggleTarget) return;
    setToggling(true);
    try {
      const res = await toggleStudentActive(toggleTarget.id);
      const active = res.data?.is_active;
      console.log('Toggle active result:', res.data);
      toast.success(active ? 'Đã kích hoạt tài khoản' : 'Đã vô hiệu hóa tài khoản');
      setToggleTarget(null);
      fetchStudents();
    } catch (err) {
      toast.error(err?.message || 'Thao tác thất bại');
    } finally {
      setToggling(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) return toast.error('Mật khẩu phải ít nhất 6 ký tự');
    setResetting(true);
    try {
      await resetStudentPassword(resetTarget.id, newPassword);
      toast.success('Đặt lại mật khẩu thành công');
      setResetTarget(null);
      setNewPassword('');
    } catch (err) {
      toast.error(err?.message || 'Đặt lại mật khẩu thất bại');
    } finally {
      setResetting(false);
    }
  };

  const handleSoftDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteStudent(deleteTarget.id);
      toast.success('Đã vô hiệu hóa tài khoản sinh viên');
      setDeleteTarget(null);
      fetchStudents();
    } catch (err) {
      toast.error(err?.message || 'Thao tác thất bại');
    } finally {
      setDeleting(false);
    }
  };

  const isInactive = editing && !editing.user?.is_active;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Quản lý sinh viên</h1>
        <p className="text-slate-500 text-sm mt-1">Tạo tài khoản, cập nhật thông tin và quản lý trạng thái sinh viên</p>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-4 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-3 flex-wrap">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text" placeholder="Tìm theo tên, mã SV..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
            />
          </div>
          <select
            value={yearFilter} onChange={e => setYearFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả khóa</option>
            {allYears.map(y => (
              <option key={y} value={y}>Khóa {y}</option>
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
          Thêm sinh viên
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Mã SV</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Họ và tên</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Ngành</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500">Khóa</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Tên lớp</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Cố vấn học tập</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500">Trạng thái</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-100">
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : students.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-16 text-slate-400">
                  <div className="flex flex-col items-center gap-2">
                    <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
                    </svg>
                    <span className="text-sm">Không có sinh viên nào</span>
                  </div>
                </td>
              </tr>
            ) : (
              students.map(s => {
                const active = s.user?.is_active;
                const advisor = s.class?.homeroom_teacher;
                return (
                  <tr key={s.id} className={`border-b border-slate-50 hover:bg-slate-50/60 transition-colors ${!active ? 'opacity-60' : ''}`}>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{s.student_code}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{fullName(s.user)}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{s.major || '—'}</td>
                    <td className="px-4 py-3 text-center text-slate-600">{s.course_year || '—'}</td>
                    <td className="px-4 py-3 text-slate-700 text-xs">{s.class?.class_name || <span className="text-slate-400 italic">Chưa có lớp</span>}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {advisor ? fullName(advisor.user) : <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {active
                        ? <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700 border border-green-200">Hoạt động</span>
                        : <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-red-100 text-red-700 border border-red-200">Vô hiệu</span>
                      }
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <ActionBtn title="Chỉnh sửa" onClick={() => openEdit(s)} color="blue">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        </ActionBtn>
                        <ActionBtn title="Bật/Tắt tài khoản" onClick={() => setToggleTarget(s)} color={active ? 'amber' : 'green'}>
                          {active
                            ? <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
                            : <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                          }
                        </ActionBtn>
                        <ActionBtn title="Reset mật khẩu" onClick={() => { setResetTarget(s); setNewPassword(''); }} color="indigo">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
                        </ActionBtn>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <Modal title={editing ? `${isInactive ? '[Vô hiệu] ' : ''}Chỉnh sửa: ${fullName(editing.user)}` : 'Thêm sinh viên mới'} onClose={() => setShowModal(false)}>
          {/* Inactive warning banner */}
          {isInactive && (
            <div className="mb-4 flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
              <svg className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-amber-800">Tài khoản đang bị vô hiệu hóa</p>
                <p className="text-xs text-amber-700 mt-0.5">Không thể chỉnh sửa thông tin. Hãy kích hoạt lại tài khoản trước.</p>
              </div>
            </div>
          )}

          {/* Section 1: Thông tin sinh viên */}
          <div className="mb-5">
            <SectionLabel>Thông tin sinh viên</SectionLabel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField label="Mã sinh viên" required>
                <input value={form.student_code} disabled={!!isInactive}
                  onChange={e => setForm(f => ({ ...f, student_code: e.target.value }))}
                  placeholder="VD: A46644" className={inputCls(isInactive)} />
              </FormField>
              <FormField label="Họ" required>
                <input value={form.first_name} disabled={!!isInactive}
                  onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))}
                  placeholder="Nguyễn" className={inputCls(isInactive)} />
              </FormField>
              <FormField label="Tên" required>
                <input value={form.last_name} disabled={!!isInactive}
                  onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))}
                  placeholder="Văn A" className={inputCls(isInactive)} />
              </FormField>
              <FormField label="Ngành" required>
                {/* <input value={form.major} disabled={!!isInactive}
                  onChange={e => setForm(f => ({ ...f, major: e.target.value }))}
                  placeholder="Công nghệ thông tin" className={inputCls(isInactive)} 
                  /> */}
                  <select
                    value={form.major}
                    disabled={!!isInactive}
                    onChange={e => setForm(f => ({ ...f, major: e.target.value }))}
                    className={inputCls(isInactive)}
                  >
                    <option value="">-- Chọn ngành --</option>
                    <option value="Công nghệ thông tin">Công nghệ thông tin</option>
                    <option value="Hệ thống thông tin">Hệ thống thông tin</option>
                    <option value="Khoa học máy tính">Khoa học máy tính</option>
                    <option value="Trí tuệ nhân tạo">Trí tuệ nhân tạo</option>
                    <option value="Mạng máy tính và truyền thông dữ liệu">
                      Mạng máy tính và truyền thông dữ liệu
                    </option>
                  </select>
              </FormField>
              <FormField label="Khóa" required>
                <input type="number" value={form.course_year} disabled={!!isInactive}
                  onChange={e => setForm(f => ({ ...f, course_year: e.target.value }))}
                  placeholder="2022" className={inputCls(isInactive)} />
              </FormField>
              <FormField label="Lớp hành chính">
                <select value={form.class_id} disabled={!!isInactive}
                  onChange={e => setForm(f => ({ ...f, class_id: e.target.value }))}
                  className={inputCls(isInactive)}>
                  <option value="">-- Chưa xếp lớp --</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.class_name}</option>
                  ))}
                </select>
              </FormField>
            </div>
          </div>

          {/* Section 2: Thông tin tài khoản */}
          <div className="mb-5">
            <SectionLabel>Thông tin tài khoản</SectionLabel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField label="Email" required>
                <input type="email" value={form.email} disabled={!!isInactive}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="VD: msv@tlu.edu.vn" className={inputCls(isInactive)} />
              </FormField>
              {!editing && (
                <FormField label="Mật khẩu tạm thời">
                  <input type="password" value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Mặc định: TLU@123456" className={inputCls(false)} />
                </FormField>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-1">
            {isInactive && (
              <button onClick={() => { setShowModal(false); setToggleTarget(editing); }}
                className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
                Kích hoạt tài khoản
              </button>
            )}
            <button onClick={() => setShowModal(false)}
              className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              Hủy
            </button>
            {!isInactive && (
              <button onClick={handleSave} disabled={saving}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-60">
                {saving ? 'Đang lưu...' : editing ? 'Cập nhật' : 'Thêm mới'}
              </button>
            )}
          </div>
        </Modal>
      )}

      {/* Toggle confirm */}
      {toggleTarget && (
        <Modal title={toggleTarget.user?.is_active ? 'Vô hiệu hóa tài khoản' : 'Kích hoạt tài khoản'} onClose={() => setToggleTarget(null)}>
          <p className="text-sm text-slate-600">
            {toggleTarget.user?.is_active
              ? <>Bạn có chắc muốn <span className="font-semibold text-red-600">vô hiệu hóa</span> tài khoản của sinh viên <span className="font-semibold text-slate-800">{fullName(toggleTarget.user)}</span>? Sinh viên sẽ không thể đăng nhập.</>
              : <>Bạn có chắc muốn <span className="font-semibold text-green-600">kích hoạt</span> lại tài khoản của sinh viên <span className="font-semibold text-slate-800">{fullName(toggleTarget.user)}</span>?</>
            }
          </p>
          <div className="flex justify-end gap-3 mt-5">
            <button onClick={() => setToggleTarget(null)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Hủy</button>
            <button onClick={handleToggle} disabled={toggling}
              className={`px-4 py-2 text-sm text-white rounded-lg font-medium disabled:opacity-60 transition-colors ${toggleTarget.user?.is_active ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>
              {toggling ? 'Đang xử lý...' : toggleTarget.user?.is_active ? 'Vô hiệu hóa' : 'Kích hoạt'}
            </button>
          </div>
        </Modal>
      )}

      {/* Reset password modal */}
      {resetTarget && (
        <Modal title="Đặt lại mật khẩu" onClose={() => setResetTarget(null)}>
          <p className="text-sm text-slate-600 mb-4">
            Đặt mật khẩu mới cho sinh viên <span className="font-semibold text-slate-800">{fullName(resetTarget.user)}</span>
          </p>
          <FormField label="Mật khẩu mới (ít nhất 6 ký tự)">
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
              placeholder="Nhập mật khẩu mới..." autoFocus
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </FormField>
          <div className="flex justify-end gap-3 mt-5">
            <button onClick={() => setResetTarget(null)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Hủy</button>
            <button onClick={handleResetPassword} disabled={resetting}
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-60 transition-colors">
              {resetting ? 'Đang lưu...' : 'Đặt lại mật khẩu'}
            </button>
          </div>
        </Modal>
      )}

      {/* Soft-delete confirm */}
      {deleteTarget && (
        <Modal title="Vô hiệu hóa tài khoản" onClose={() => setDeleteTarget(null)}>
          <p className="text-sm text-slate-600">
            Vô hiệu hóa tài khoản sinh viên <span className="font-semibold text-slate-800">{fullName(deleteTarget.user)}</span>? Sinh viên sẽ không thể đăng nhập (dữ liệu được giữ nguyên).
          </p>
          <div className="flex justify-end gap-3 mt-5">
            <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Hủy</button>
            <button onClick={handleSoftDelete} disabled={deleting}
              className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-60 transition-colors">
              {deleting ? 'Đang xử lý...' : 'Vô hiệu hóa'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ── helpers ─────────────────────────────────────────────────── */

const inputCls = (disabled) =>
  `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    disabled ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'border-slate-200'
  }`;

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{children}</span>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  );
}

function FormField({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label} {required && <span className="text-red-500">*</span>}</label>
      {children}
    </div>
  );
}

function ActionBtn({ title, onClick, color, children }) {
  const colors = {
    blue:   'text-blue-600 hover:bg-blue-50',
    amber:  'text-amber-600 hover:bg-amber-50',
    green:  'text-green-600 hover:bg-green-50',
    indigo: 'text-indigo-600 hover:bg-indigo-50',
    red:    'text-red-500 hover:bg-red-50'
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
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 z-10 max-h-[90vh] overflow-y-auto">
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
