import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, LineChart, Line
} from 'recharts';
import { ArrowDownTrayIcon, ChartBarIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import * as svc from '../../services/lecturerService';

const TABS = [
  { key: 'risk', label: 'Phân bố nguy cơ', Icon: ChartBarIcon },
  { key: 'roi',  label: 'Hiệu quả can thiệp', Icon: ArrowTrendingUpIcon },
];

export default function LecturerReportPage() {
  const [tab, setTab] = useState('risk');
  const [semesters, setSemesters] = useState([]);
  const [semId, setSemId] = useState('');
  const [riskData, setRiskData] = useState([]);
  const [roiData, setRoiData] = useState([]);
  const [loadingRisk, setLoadingRisk] = useState(false);
  const [loadingRoi, setLoadingRoi] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Load semester list
  useEffect(() => {
    fetch('/api/v1/semesters', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(r => r.json())
      .then(d =>
         {
        if (d.success) {
          setSemesters(d.data);
          const cur = d.data.find(s => s.is_current);
          if (cur) setSemId(String(cur.id));
        }
      })
      .catch(() => {});
  }, []);

  // Load risk ratio when semester changes
  useEffect(() => {
    if (!semId) return;
    setLoadingRisk(true);
    svc.getRiskRatio({ semester_id: semId })
      .then(res => { if (res.success) setRiskData(res.data); })
      .catch(() => toast.error('Không thể tải dữ liệu phân bố nguy cơ'))
      .finally(() => setLoadingRisk(false));
  }, [semId]);

  // Load ROI when tab switches to roi
  useEffect(() => {
    if (tab !== 'roi' || !semId) return;
    setLoadingRoi(true);
    svc.getInterventionROI(semId)
      .then(res => {
        console.log('ROI RESPONSE:', res); 
        console.log('ROI DATA:', res.data); 
        console.log('ROI DETAILS:', res.data?.details);
         if (res.success) setRoiData(res.data.details || []);
       })
      .catch(() => toast.error('Không thể tải dữ liệu hiệu quả can thiệp'))
      .finally(() => setLoadingRoi(false));
  }, [tab, semId]);
        
  const handleExport = async (format) => {
    if (!semId) { toast.error('Vui lòng chọn học kỳ'); return; 
    }
    setExporting(true);
    try {
      const blob = await svc.exportLecturerReport(
        { semester_id: semId, format }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bao-cao-nguy-co-${semId}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
       console.error(err);
       toast.error('Xuất báo cáo thất bại');
    } finally {
      setExporting(false);
    }
  };

  // Summary totals from riskData
  const totals = riskData.reduce(
    (acc, row) => ({
      danger:  acc.danger  + (row.danger  || 0),
      warning: acc.warning + (row.warning || 0),
      safe:    acc.safe    + (row.safe    || 0),
    }),
    { danger: 0, warning: 0, safe: 0 }
  );
  const grandTotal = totals.danger + totals.warning + totals.safe;

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Báo cáo giảng viên</h1>
          <p className="text-sm text-slate-500 mt-0.5">Phân tích nguy cơ và hiệu quả can thiệp</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={semId}
            onChange={e => setSemId(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            <option value="">-- Chọn học kỳ --</option>
            {semesters.map(s => (
              <option key={s.id} value={s.id}>{s.name}{s.is_current ? ' (Hiện tại)' : ''}</option>
            ))}
          </select>
          <button
            onClick={() => handleExport('excel')}
            disabled={exporting || !semId}
            className="flex items-center gap-1.5 px-3 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            Excel
          </button>
          <button
            onClick={() => handleExport('pdf')}
            disabled={exporting || !semId}
            className="flex items-center gap-1.5 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            PDF
          </button>
        </div>
      </div>

      {/* KPI summary row */}
      {grandTotal > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs font-medium text-red-600">Nguy hiểm</p>
            <p className="text-3xl font-bold font-mono text-red-700 mt-1">{totals.danger}</p>
            <p className="text-xs text-red-400 mt-1">{grandTotal ? ((totals.danger / grandTotal) * 100).toFixed(1) : 0}% tổng SV</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs font-medium text-amber-600">Cảnh báo</p>
            <p className="text-3xl font-bold font-mono text-amber-700 mt-1">{totals.warning}</p>
            <p className="text-xs text-amber-400 mt-1">{grandTotal ? ((totals.warning / grandTotal) * 100).toFixed(1) : 0}% tổng SV</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs font-medium text-emerald-600">An toàn</p>
            <p className="text-3xl font-bold font-mono text-emerald-700 mt-1">{totals.safe}</p>
            <p className="text-xs text-emerald-400 mt-1">{grandTotal ? ((totals.safe / grandTotal) * 100).toFixed(1) : 0}% tổng SV</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-200">
          {TABS.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                tab === key
                  ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* Tab 1: Risk ratio bar chart */}
          {tab === 'risk' && (
            loadingRisk ? (
              <div className="flex items-center justify-center h-72">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : riskData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-72 text-slate-400">
                <ChartBarIcon className="w-12 h-12 mb-3" />
                <p className="text-sm">Chưa có dữ liệu dự báo cho học kỳ này</p>
              </div>
            ) : (
              <>
                <h2 className="text-sm font-semibold text-slate-700 mb-4">
                  Phân bố mức nguy cơ theo lớp
                </h2>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={riskData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="class_name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 12 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="safe"    fill="#10b981" name="An toàn"   radius={[4,4,0,0]} />
                    <Bar dataKey="warning" fill="#f59e0b" name="Cảnh báo" radius={[4,4,0,0]} />
                    <Bar dataKey="danger"  fill="#ef4444" name="Nguy hiểm" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </>
            )
          )}

          {/* Tab 2: Intervention ROI */}
          {tab === 'roi' && (
            loadingRoi ? (
              <div className="flex items-center justify-center h-72">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : roiData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-72 text-slate-400">
                <ArrowTrendingUpIcon className="w-12 h-12 mb-3" />
                <p className="text-sm">Chưa có dữ liệu so sánh can thiệp</p>
              </div>
            ) : (
              <>
                <h2 className="text-sm font-semibold text-slate-700 mb-1">
                  Hiệu quả can thiệp — thay đổi mức nguy cơ trước / sau
                </h2>
                <p className="text-xs text-slate-400 mb-4">
                  Số sinh viên chuyển từ nguy cơ cao → thấp hơn sau khi được can thiệp
                </p>
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={roiData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 12 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line type="monotone" dataKey="before" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4 }} name="Trước can thiệp" />
                    <Line type="monotone" dataKey="after"  stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} name="Sau can thiệp" />
                  </LineChart>
                </ResponsiveContainer>

                {/* ROI detail table */}
                <div className="mt-5 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Sinh viên</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500">Nguy cơ trước</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500">Nguy cơ sau</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500">GPA thay đổi</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500">Số lần can thiệp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roiData.map((row, i) => (
                        <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/60">
                          <td className="px-4 py-3 font-medium text-slate-800">{row.full_name || row.name}</td>
                          <td className="px-4 py-3 text-center">
                            <RiskBadge label={row.previous_risk} />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <RiskBadge label={row.current_risk} />
                          </td>
                          <td className="px-4 py-3 text-center font-mono text-sm">
                            {row.gpa_change != null ? (
                              <span className={row.gpa_change >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                                {row.gpa_change >= 0 ? '+' : ''}{parseFloat(row.gpa_change).toFixed(2)}
                              </span>
                            ) : '—'}
                          </td>
                          <td className="px-4 py-3 text-center text-slate-700">{row.intervention_count ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )
          )}
        </div>
      </div>
    </div>
  );
}

function RiskBadge({ label }) {
  const map = {
    danger:  'bg-red-100 text-red-700 border-red-200',
    warning: 'bg-amber-100 text-amber-700 border-amber-200',
    safe:    'bg-emerald-100 text-emerald-700 border-emerald-200',
  };
  const text = { danger: 'Nguy hiểm', warning: 'Cảnh báo', safe: 'An toàn' };
  if (!label) return <span className="text-xs text-slate-400">—</span>;
  return (
    <span className={`inline-block text-xs px-2.5 py-0.5 rounded-full border font-medium ${map[label] || ''}`}>
      {text[label] || label}
    </span>
  );
}
