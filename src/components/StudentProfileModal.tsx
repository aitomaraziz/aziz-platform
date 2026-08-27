import React, { useState } from 'react';
import { Student, Halaqah, RecitationRecord, AnnualFee, MonthlyFee, AttendanceRecord, AssociationSettings } from '../types';
import {
  X,
  User,
  BookMarked,
  CreditCard,
  UserCheck,
  Award,
  Phone,
  Calendar,
  Layers,
  Send,
  Printer,
  Star,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Shield,
  MapPin
} from 'lucide-react';

interface StudentProfileModalProps {
  student: Student | null;
  halaqat: Halaqah[];
  recitations: RecitationRecord[];
  annualFees: AnnualFee[];
  monthlyFees: MonthlyFee[];
  attendance: AttendanceRecord[];
  settings: AssociationSettings;
  onClose: () => void;
  onOpenRecitation: (student: Student) => void;
  onOpenPayment: (student: Student) => void;
  onSendWhatsApp: (phone: string, text: string) => void;
  onPrintCard: (student: Student) => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  student,
  halaqat,
  recitations,
  annualFees,
  monthlyFees,
  attendance,
  settings,
  onClose,
  onOpenRecitation,
  onOpenPayment,
  onSendWhatsApp,
  onPrintCard,
}) => {
  if (!student) return null;

  const [activeTab, setActiveTab] = useState<'quran' | 'finance' | 'attendance' | 'card'>('quran');

  const halaqah = halaqat.find((h) => h.id === student.halaqahId);
  const studentRecitations = recitations.filter((r) => r.studentId === student.id);
  const studentAnnualFees = annualFees.filter((a) => a.studentId === student.id);
  const studentMonthlyFees = monthlyFees.filter((m) => m.studentId === student.id);
  const studentAttendance = attendance.filter((att) => att.studentId === student.id);

  // حساب نسبة الحضور
  const totalAttended = studentAttendance.filter((a) => a.status === 'حاضر').length;
  const attendanceRate = studentAttendance.length > 0
    ? Math.round((totalAttended / studentAttendance.length) * 100)
    : 100;

  const progressPercent = Math.min(100, Math.round(((student.hizbProgress || 0) / 60) * 100));
  const currentYear = new Date().getFullYear();
  const phone = student.guardianPhone || student.phone;

  const monthNamesArabic = [
    'يناير (01)', 'فبراير (02)', 'مارس (03)', 'أبريل (04)',
    'مايو (05)', 'يونيو (06)', 'يوليو (07)', 'أغسطس (08)',
    'سبتمبر (09)', 'أكتوبر (10)', 'نوفمبر (11)', 'ديسمبر (12)'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-6 max-h-[92vh] overflow-y-auto custom-scrollbar flex flex-col justify-between">
        <div>
          {/* Header Bar */}
          <div className="flex items-start justify-between pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-md ${
                  student.gender === 'ذكر'
                    ? 'bg-gradient-to-br from-emerald-600 to-teal-800'
                    : 'bg-gradient-to-br from-teal-600 to-cyan-800'
                }`}
              >
                {student.fullName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">{student.fullName}</h2>
                  {student.exemptionStatus === 'معفى_كلي' ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold text-xs">
                      إعفاء كلي
                    </span>
                  ) : student.exemptionStatus === 'معفى_جزئي' ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-xs">
                      خصم 50%
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-slate-500 mt-1">
                  <span className="font-mono bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-700">
                    رقم التسجيل: {student.regNumber || '-'}
                  </span>
                  <span>•</span>
                  <span>الحلقة: <strong className="text-emerald-800">{halaqah?.name || 'غير محددة'}</strong></span>
                  <span>•</span>
                  <span>المستوى: <strong className="text-slate-800">{student.level || 'مبتدئ'}</strong></span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-base cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Quick Actions Row & Contact Card */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2 text-xs text-slate-700">
              <User className="w-4 h-4 text-slate-400 shrink-0" />
              <span>الولي: <strong>{student.guardianName || 'غير مسجل'}</strong> ({student.guardianRelation || 'ولي'})</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-700">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="font-mono">هاتف: {student.guardianPhone || student.phone || 'غير مسجل'}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-700">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <span>تاريخ التسجيل: {student.regDate}</span>
            </div>
          </div>

          {/* Progress Banner */}
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-900 text-white shadow-md">
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold flex items-center gap-2">
                <BookMarked className="w-4 h-4 text-amber-300" />
                <span>إنجاز حفظ القرآن الكريم</span>
              </span>
              <span className="text-amber-300 font-bold font-mono">
                {student.hizbProgress || 0} من 60 حزباً ({progressPercent}%)
              </span>
            </div>
            <div className="w-full h-3 bg-white/20 rounded-full mt-2.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-amber-300 rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {student.currentSurah && (
              <p className="text-xs text-emerald-100 mt-2">
                السورة الحالية المداوم عليها: <strong className="text-white">سورة {student.currentSurah}</strong>
              </p>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 mt-6 gap-2 sm:gap-6">
            <button
              onClick={() => setActiveTab('quran')}
              className={`pb-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'quran'
                  ? 'border-emerald-700 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <BookMarked className="w-4 h-4" />
              <span>سجل التسميع ({studentRecitations.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('finance')}
              className={`pb-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'finance'
                  ? 'border-emerald-700 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>الاشتراكات والواجبات</span>
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`pb-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'attendance'
                  ? 'border-emerald-700 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>الحضور ({attendanceRate}%)</span>
            </button>
            <button
              onClick={() => setActiveTab('card')}
              className={`pb-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'card'
                  ? 'border-emerald-700 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>بطاقة التلميذ</span>
            </button>
          </div>

          {/* Tab Contents */}
          <div className="mt-5">
            {/* 1. Recitation Tab */}
            {activeTab === 'quran' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm">سجل جلسات الحفظ والمراجعة</h4>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenRecitation(student);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer"
                  >
                    + تسجيل تسميع جديد
                  </button>
                </div>

                {studentRecitations.length === 0 ? (
                  <div className="py-10 text-center bg-slate-50 rounded-2xl border border-slate-100">
                    <BookMarked className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-700 text-sm">لا توجد جلسات تسميع مسجلة بعد</p>
                    <p className="text-xs text-slate-500 mt-1">اضغط على زر تسجيل تسميع لإضافة أول جلسة للتلميذ.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                    {studentRecitations.map((rec) => (
                      <div
                        key={rec.id}
                        className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 hover:bg-emerald-50/30 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">
                              سورة {rec.surahName} (الآيات {rec.fromAyah} إلى {rec.toAyah})
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                              {rec.type.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-amber-500">
                            {Array.from({ length: rec.grade }).map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                        </div>

                        {rec.tajweedNotes && (
                          <p className="text-xs text-slate-600 mt-1.5">
                            <strong className="text-slate-800">ملاحظات التجويد:</strong> {rec.tajweedNotes}
                          </p>
                        )}
                        {rec.generalNotes && (
                          <p className="text-xs text-slate-500 mt-0.5">
                            <strong className="text-slate-700">ملاحظات عامة:</strong> {rec.generalNotes}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-200/50">
                          <span>المؤطر: {rec.teacherName || 'الشيخ المشرف'}</span>
                          <span>التاريخ: {rec.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 2. Finance Tab */}
            {activeTab === 'finance' && (
              <div className="space-y-4">
                {/* Annual Fee Card */}
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-amber-900 text-sm">الواجب السنوي لسنة {currentYear}</h4>
                      <p className="text-xs text-amber-700 mt-0.5">رسوم التسجيل والتأمين السنوية</p>
                    </div>
                    {studentAnnualFees.some((a) => a.year === currentYear) ? (
                      <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>تم السداد</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-xs flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>غير مسدد</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* 12-Month Matrix for this student */}
                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-3">سجل الاشتراكات الشهرية ({currentYear})</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                    {monthNamesArabic.map((monthName, idx) => {
                      const monthNum = String(idx + 1).padStart(2, '0');
                      const paidRecord = studentMonthlyFees.find(
                        (m) => m.month === monthNum && m.year === currentYear
                      );
                      const isPaid = !!paidRecord;

                      return (
                        <div
                          key={monthNum}
                          className={`p-3 rounded-xl border text-center transition-all ${
                            isPaid
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                              : student.exemptionStatus === 'معفى_كلي'
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-900'
                              : 'bg-slate-50 border-slate-200 text-slate-600'
                          }`}
                        >
                          <div className="text-xs font-bold">{monthName}</div>
                          <div className="mt-1">
                            {isPaid ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>{paidRecord.amount} {settings.currency}</span>
                              </span>
                            ) : student.exemptionStatus === 'معفى_كلي' ? (
                              <span className="text-[11px] font-bold text-indigo-700">معفى كلياً</span>
                            ) : (
                              <span className="text-[11px] font-semibold text-rose-600">غير مسدد</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenPayment(student);
                    }}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    + تسجيل دفع اشتراك لهذا التلميذ
                  </button>
                </div>
              </div>
            )}

            {/* 3. Attendance Tab */}
            {activeTab === 'attendance' && (
              <div className="space-y-3">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">معدل الانضباط والحضور</h4>
                    <p className="text-xs text-slate-500">من إجمالي {studentAttendance.length} حصة مسجلة</p>
                  </div>
                  <span className="text-2xl font-black text-emerald-700">{attendanceRate}%</span>
                </div>

                {studentAttendance.length === 0 ? (
                  <p className="text-center text-xs text-slate-500 py-8">لا يوجد سجل حضور مسجل بعد</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                    {studentAttendance.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 text-xs"
                      >
                        <span className="font-medium text-slate-800">{att.date}</span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                            att.status === 'حاضر'
                              ? 'bg-emerald-100 text-emerald-800'
                              : att.status === 'غائب_بعذر'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {att.status.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. Student Card Badge Preview & Print */}
            {activeTab === 'card' && (
              <div className="space-y-4">
                <div
                  id={`student-badge-${student.id}`}
                  className="max-w-md mx-auto p-6 rounded-3xl bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900 text-white shadow-xl relative overflow-hidden border border-amber-400/30"
                >
                  <div className="flex items-center justify-between border-b border-white/20 pb-3">
                    <div>
                      <h4 className="font-black text-amber-300 text-sm">{settings.assocName}</h4>
                      <p className="text-[10px] text-emerald-200">بطاقة تلميذ تحفيظ القرآن الكريم</p>
                    </div>
                    <span className="font-mono text-xs font-bold bg-white/10 px-2 py-0.5 rounded">
                      {student.regNumber || '2026-000'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mt-4">
                    <div className="w-16 h-16 rounded-2xl bg-white text-emerald-900 font-black text-2xl flex items-center justify-center shadow-md shrink-0">
                      {student.fullName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-black text-lg text-white leading-tight">{student.fullName}</h3>
                      <p className="text-xs text-amber-300 font-semibold mt-0.5">
                        الحلقة: {halaqah?.name || 'عامة'}
                      </p>
                      <p className="text-[11px] text-emerald-200">المستوى: {student.level || 'مبتدئ'}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/20 grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-emerald-300">الولي:</span> {student.guardianName || '-'}
                    </div>
                    <div>
                      <span className="text-emerald-300">الهاتف:</span> {student.guardianPhone || student.phone || '-'}
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <button
                    onClick={() => onPrintCard(student)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-bold shadow-md cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>طباعة بطاقة التلميذ الرسمية</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {phone && (
              <button
                onClick={() =>
                  onSendWhatsApp(
                    phone,
                    `السلام عليكم ورحمة الله، تقرير متابعة التلميذ ${student.fullName} في جمعية تحفيظ القرآن الكريم:\n- الأحزاب المكتملة: ${student.hizbProgress || 0}/60 حزباً.\n- السورة الحالية: ${student.currentSurah || '-'}.\nتقبل الله منا ومنكم.`
                  )
                }
                className="flex items-center gap-2 px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>إرسال تقرير الحفظ لواتساب الولي</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
