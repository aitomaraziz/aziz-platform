import React, { useState, useMemo } from 'react';
import { AttendanceRecord, Student, Halaqah, AttendanceStatus } from '../types';
import {
  UserCheck,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Save,
  Check,
  Printer
} from 'lucide-react';

interface AttendanceViewProps {
  attendance: AttendanceRecord[];
  students: Student[];
  halaqat: Halaqah[];
  onSaveBatchAttendance: (records: AttendanceRecord[]) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  attendance,
  students,
  halaqat,
  onSaveBatchAttendance,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedHalaqahId, setSelectedHalaqahId] = useState<string>(halaqat[0]?.id || 'all');

  // Filter students by selected halaqah
  const halaqahStudents = useMemo(() => {
    if (selectedHalaqahId === 'all') return students;
    return students.filter((s) => s.halaqahId === selectedHalaqahId);
  }, [students, selectedHalaqahId]);

  // Map of studentId -> status for the selected date
  const [localStatuses, setLocalStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [localNotes, setLocalNotes] = useState<Record<string, string>>({});

  // Populate local status from existing records when date or halaqah changes
  React.useEffect(() => {
    const existing = attendance.filter((a) => a.date === selectedDate);
    const statusMap: Record<string, AttendanceStatus> = {};
    const notesMap: Record<string, string> = {};

    halaqahStudents.forEach((s) => {
      const rec = existing.find((a) => a.studentId === s.id);
      if (rec) {
        statusMap[s.id] = rec.status;
        notesMap[s.id] = rec.notes || '';
      } else {
        statusMap[s.id] = 'حاضر'; // default to present
      }
    });

    setLocalStatuses(statusMap);
    setLocalNotes(notesMap);
  }, [selectedDate, selectedHalaqahId, halaqahStudents, attendance]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setLocalStatuses((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleNoteChange = (studentId: string, note: string) => {
    setLocalNotes((prev) => ({ ...prev, [studentId]: note }));
  };

  const handleMarkAllPresent = () => {
    const newStatuses: Record<string, AttendanceStatus> = {};
    halaqahStudents.forEach((s) => {
      newStatuses[s.id] = 'حاضر';
    });
    setLocalStatuses(newStatuses);
  };

  const handleSaveAttendance = () => {
    const recordsToSave: AttendanceRecord[] = halaqahStudents.map((s) => {
      return {
        id: 'ATT_' + s.id + '_' + selectedDate,
        studentId: s.id,
        halaqahId: s.halaqahId || '',
        date: selectedDate,
        status: localStatuses[s.id] || 'حاضر',
        notes: localNotes[s.id] || undefined,
        createdAt: new Date().toISOString(),
      };
    });

    onSaveBatchAttendance(recordsToSave);
  };

  // Quick stats for the current screen
  const presentCount = halaqahStudents.filter((s) => (localStatuses[s.id] || 'حاضر') === 'حاضر').length;
  const absentCount = halaqahStudents.filter((s) => localStatuses[s.id] === 'غائب').length;
  const excusedCount = halaqahStudents.filter((s) => localStatuses[s.id] === 'غائب_بعذر').length;
  const lateCount = halaqahStudents.filter((s) => localStatuses[s.id] === 'متأخر').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-emerald-700" />
            <span>سجل الحضور والغياب اليومي</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            تسجيل حضور تلاميذ الحلقات ومتابعة الغيابات والأعذار بنقرة واحدة
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveAttendance}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-900/15 transition-all active:scale-95 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>حفظ كشف الحضور</span>
          </button>
          <button
            onClick={() => window.print()}
            title="طباعة كشف الحضور"
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold cursor-pointer"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Date & Circle Selector */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ الحصة</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="flex-1 sm:w-64">
              <label className="block text-xs font-bold text-slate-700 mb-1">الحلقة القرآنية</label>
              <select
                value={selectedHalaqahId}
                onChange={(e) => setSelectedHalaqahId(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-600"
              >
                <option value="all">جميع الحلقات ({students.length} تلميذ)</option>
                {halaqat.map((h) => {
                  const count = students.filter((s) => s.halaqahId === h.id).length;
                  return (
                    <option key={h.id} value={h.id}>
                      {h.name} ({count} تلميذ)
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <button
            onClick={handleMarkAllPresent}
            className="w-full sm:w-auto px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors cursor-pointer self-end"
          >
            ✓ تحديد جميع تلاميذ القائمة كـ "حاضر"
          </button>
        </div>

        {/* Quick Session Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-center">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200">
            <span className="text-xs font-bold">حاضر</span>
            <div className="text-xl font-black text-emerald-700">{presentCount}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-900 border border-rose-200">
            <span className="text-xs font-bold">غائب</span>
            <div className="text-xl font-black text-rose-700">{absentCount}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200">
            <span className="text-xs font-bold">غائب بعذر</span>
            <div className="text-xl font-black text-amber-700">{excusedCount}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-sky-50 text-sky-900 border border-sky-200">
            <span className="text-xs font-bold">متأخر</span>
            <div className="text-xl font-black text-sky-700">{lateCount}</div>
          </div>
        </div>
      </div>

      {/* Attendance Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {halaqahStudents.length === 0 ? (
          <div className="p-12 text-center text-slate-500">لا يوجد تلاميذ في هذه الحلقة</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-emerald-800 text-white text-xs font-bold">
                  <th className="p-3.5">#</th>
                  <th className="p-3.5">اسم التلميذ</th>
                  <th className="p-3.5">الحلقة</th>
                  <th className="p-3.5 text-center">حالة الحضور</th>
                  <th className="p-3.5">ملاحظات الغياب / العذر</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {halaqahStudents.map((student, idx) => {
                  const currentStatus = localStatuses[student.id] || 'حاضر';
                  const halaqah = halaqat.find((h) => h.id === student.halaqahId);

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 text-xs text-slate-400 font-mono">{idx + 1}</td>
                      <td className="p-3.5 font-bold text-slate-900">
                        {student.fullName}
                      </td>
                      <td className="p-3.5 text-xs text-slate-600 font-medium">
                        {halaqah?.name || '-'}
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Present */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'حاضر')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              currentStatus === 'حاضر'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            حاضر
                          </button>

                          {/* Absent */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'غائب')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              currentStatus === 'غائب'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            غائب
                          </button>

                          {/* Excused */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'غائب_بعذر')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              currentStatus === 'غائب_بعذر'
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            بعذر
                          </button>

                          {/* Late */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'متأخر')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              currentStatus === 'متأخر'
                                ? 'bg-sky-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            متأخر
                          </button>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <input
                          type="text"
                          value={localNotes[student.id] || ''}
                          onChange={(e) => handleNoteChange(student.id, e.target.value)}
                          placeholder="ملاحظة أو سبب الغياب..."
                          className="w-full px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bottom Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveAttendance}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-sm font-bold shadow-lg shadow-emerald-900/20 transition-all active:scale-95 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>تأكيد وحفظ سجل الحضور لـ ({selectedDate})</span>
        </button>
      </div>
    </div>
  );
};
