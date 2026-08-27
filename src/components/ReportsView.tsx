import React, { useState } from 'react';
import {
  Student,
  Halaqah,
  RecitationRecord,
  AnnualFee,
  MonthlyFee,
  ExpenseRecord,
  IncomeRecord,
  AttendanceRecord,
  AssociationSettings
} from '../types';
import {
  FileText,
  Printer,
  Download,
  Send,
  CreditCard,
  BookMarked,
  UserCheck,
  AlertTriangle,
  Award,
  Calendar,
  Layers
} from 'lucide-react';

interface ReportsViewProps {
  students: Student[];
  halaqat: Halaqah[];
  recitations: RecitationRecord[];
  annualFees: AnnualFee[];
  monthlyFees: MonthlyFee[];
  expenses: ExpenseRecord[];
  incomes: IncomeRecord[];
  attendance: AttendanceRecord[];
  settings: AssociationSettings;
  onSendWhatsApp: (phone: string, text: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  students,
  halaqat,
  recitations,
  annualFees,
  monthlyFees,
  expenses,
  incomes,
  attendance,
  settings,
  onSendWhatsApp,
}) => {
  const currentYear = new Date().getFullYear();
  const currentMonthNum = new Date().getMonth() + 1;
  const currentMonthStr = String(currentMonthNum).padStart(2, '0');

  const [selectedReportType, setSelectedReportType] = useState<
    'financial' | 'quran' | 'overdue' | 'attendance' | 'studentCards'
  >('financial');
  const [reportYear, setReportYear] = useState<number>(currentYear);

  // Financial calculations
  const yearMonthlyFees = monthlyFees.filter((m) => m.year === reportYear);
  const totalMonthlySum = yearMonthlyFees.reduce((s, m) => s + m.amount, 0);

  const yearAnnualFees = annualFees.filter((a) => a.year === reportYear);
  const totalAnnualSum = yearAnnualFees.reduce((s, a) => s + a.amount, 0);

  const totalOtherIncomes = incomes.reduce((s, i) => s + i.amount, 0);
  const totalAllRevenues = totalAnnualSum + totalMonthlySum + totalOtherIncomes;
  const totalAllExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netBalance = totalAllRevenues - totalAllExpenses;

  // Overdue students analysis (unpaid months up to current month in currentYear)
  const overdueList = students
    .map((student) => {
      if (student.exemptionStatus === 'معفى_كلي') return null;

      const paidCount = monthlyFees.filter(
        (m) => m.studentId === student.id && m.year === currentYear
      ).length;

      // Number of months elapsed in current year
      const expectedMonths = currentMonthNum;
      const unpaidCount = Math.max(0, expectedMonths - paidCount);
      const feePerMonth =
        student.exemptionStatus === 'معفى_جزئي'
          ? Math.round(settings.monthlyFeeDefault * 0.5)
          : settings.monthlyFeeDefault;
      const totalDue = unpaidCount * feePerMonth;

      const hasPaidAnnual = annualFees.some(
        (a) => a.studentId === student.id && a.year === currentYear
      );

      if (unpaidCount > 0 || !hasPaidAnnual) {
        return {
          student,
          unpaidCount,
          totalDue,
          hasPaidAnnual,
          guardianPhone: student.guardianPhone || student.phone,
        };
      }
      return null;
    })
    .filter(Boolean) as {
    student: Student;
    unpaidCount: number;
    totalDue: number;
    hasPaidAnnual: boolean;
    guardianPhone?: string;
  }[];

  // Quran Leaderboard (top hizb & recent recitation)
  const topStudents = [...students].sort((a, b) => (b.hizbProgress || 0) - (a.hizbProgress || 0));

  const handlePrint = () => {
    window.print();
  };

  const exportFinancialCSV = () => {
    let csv = '\uFEFFالبيان,المبلغ بالدينار\n';
    csv += `إجمالي الاشتراكات الشهرية لسنة ${reportYear},${totalMonthlySum}\n`;
    csv += `إجمالي الواجب السنوي لسنة ${reportYear},${totalAnnualSum}\n`;
    csv += `إجمالي التبرعات والمداخيل الأخرى,${totalOtherIncomes}\n`;
    csv += `المجموع العام للمداخيل,${totalAllRevenues}\n`;
    csv += `إجمالي المصاريف والنفقات,${totalAllExpenses}\n`;
    csv += `الرصيد الصافي المتبقي,${netBalance}\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `التقرير_المالي_${reportYear}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs print:hidden">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-700" />
            <span>التقارير الإدارية والمالية الرسمية</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            إعداد وتصدير وطباعة كشوفات الجمعية، تقارير الحفظ القرآني، وجداول المتأخرات
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-bold shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة التقرير الحالي</span>
          </button>
        </div>
      </div>

      {/* Report Selector Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 print:hidden">
        <button
          onClick={() => setSelectedReportType('financial')}
          className={`p-3.5 rounded-2xl font-bold text-xs flex flex-col items-center gap-2 border transition-all cursor-pointer ${
            selectedReportType === 'financial'
              ? 'bg-emerald-700 text-white border-emerald-700 shadow-md'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <CreditCard className="w-5 h-5" />
          <span>التقرير المالي العام</span>
        </button>

        <button
          onClick={() => setSelectedReportType('quran')}
          className={`p-3.5 rounded-2xl font-bold text-xs flex flex-col items-center gap-2 border transition-all cursor-pointer ${
            selectedReportType === 'quran'
              ? 'bg-emerald-700 text-white border-emerald-700 shadow-md'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <BookMarked className="w-5 h-5" />
          <span>إنجازات الحفظ القرآني</span>
        </button>

        <button
          onClick={() => setSelectedReportType('overdue')}
          className={`p-3.5 rounded-2xl font-bold text-xs flex flex-col items-center gap-2 border transition-all cursor-pointer ${
            selectedReportType === 'overdue'
              ? 'bg-emerald-700 text-white border-emerald-700 shadow-md'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <AlertTriangle className="w-5 h-5" />
          <span>كشف المتأخرات ({overdueList.length})</span>
        </button>

        <button
          onClick={() => setSelectedReportType('attendance')}
          className={`p-3.5 rounded-2xl font-bold text-xs flex flex-col items-center gap-2 border transition-all cursor-pointer ${
            selectedReportType === 'attendance'
              ? 'bg-emerald-700 text-white border-emerald-700 shadow-md'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <UserCheck className="w-5 h-5" />
          <span>إحصائيات الانضباط</span>
        </button>

        <button
          onClick={() => setSelectedReportType('studentCards')}
          className={`p-3.5 rounded-2xl font-bold text-xs flex flex-col items-center gap-2 border transition-all cursor-pointer ${
            selectedReportType === 'studentCards'
              ? 'bg-emerald-700 text-white border-emerald-700 shadow-md'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Award className="w-5 h-5" />
          <span>بطاقات التلاميذ المجمعة</span>
        </button>
      </div>

      {/* Printable Report Canvas */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs print:border-none print:shadow-none print:p-0">
        {/* Printable Header */}
        <div className="border-b-2 border-emerald-900 pb-6 mb-8 text-center relative">
          <div className="flex items-center justify-between">
            <div className="text-right">
              <h3 className="font-black text-emerald-900 text-base">{settings.assocName}</h3>
              <p className="text-xs text-slate-600 font-serif">مؤسسة تحفيظ القرآن الكريم والعلوم الشرعية</p>
              {settings.address && <p className="text-[11px] text-slate-500">{settings.address}</p>}
            </div>

            <div className="w-16 h-16 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-black text-2xl shadow-sm">
              📖
            </div>

            <div className="text-left font-mono text-xs text-slate-500">
              <div>التاريخ: {new Date().toLocaleDateString('ar-EG')}</div>
              <div>السنة المالية: {reportYear}</div>
            </div>
          </div>

          <div className="mt-6 inline-block px-6 py-1.5 bg-emerald-900 text-white font-black text-sm rounded-full">
            {selectedReportType === 'financial' && `التقرير المالي والختامي السنوي لسنة ${reportYear}`}
            {selectedReportType === 'quran' && 'كشف إنجازات ومستويات حفظ القرآن الكريم'}
            {selectedReportType === 'overdue' && 'كشف المتأخرات والاشتراكات غير المسددة'}
            {selectedReportType === 'attendance' && 'كشف تقييم الحضور والانضباط العام'}
            {selectedReportType === 'studentCards' && 'بطاقات العضوية الرسمية لتلاميذ الجمعية'}
          </div>
        </div>

        {/* 1. Financial Report */}
        {selectedReportType === 'financial' && (
          <div className="space-y-6">
            <div className="flex justify-end print:hidden">
              <button
                onClick={exportFinancialCSV}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تصدير ملف Excel / CSV</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Revenues side */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-emerald-50/20">
                <h4 className="font-black text-emerald-900 text-sm border-b pb-2 mb-3">
                  أولاً: تفاصيل المداخيل والإيرادات
                </h4>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-700">اشتراكات التلاميذ الشهرية ({yearMonthlyFees.length} وصل):</span>
                    <strong className="text-slate-900 font-mono">{totalMonthlySum.toLocaleString()} {settings.currency}</strong>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-700">الواجب السنوي والتسجيل ({yearAnnualFees.length} مسدد):</span>
                    <strong className="text-slate-900 font-mono">{totalAnnualSum.toLocaleString()} {settings.currency}</strong>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-700">تبرعات المحسنين والمداخيل الأخرى:</span>
                    <strong className="text-slate-900 font-mono">{totalOtherIncomes.toLocaleString()} {settings.currency}</strong>
                  </div>
                  <div className="flex justify-between pt-2 text-sm font-black text-emerald-800">
                    <span>مجموع المداخيل العامة:</span>
                    <span className="font-mono">{totalAllRevenues.toLocaleString()} {settings.currency}</span>
                  </div>
                </div>
              </div>

              {/* Expenses side */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-rose-50/20">
                <h4 className="font-black text-rose-900 text-sm border-b pb-2 mb-3">
                  ثانياً: تفاصيل المصاريف والنفقات
                </h4>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-700">إجمالي النفقات وفواتير الصرف ({expenses.length} عملية):</span>
                    <strong className="text-rose-700 font-mono">{totalAllExpenses.toLocaleString()} {settings.currency}</strong>
                  </div>
                  <div className="pt-2 text-sm font-black text-rose-800 flex justify-between">
                    <span>مجموع المصاريف:</span>
                    <span className="font-mono">{totalAllExpenses.toLocaleString()} {settings.currency}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Result Box */}
            <div className="p-5 rounded-2xl bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-bold">الرصيد الصافي المتبقي في الخزينة:</span>
                <div className="text-3xl font-black text-emerald-400 mt-1">
                  {netBalance.toLocaleString()} {settings.currency}
                </div>
              </div>
              <div className="text-right text-xs text-slate-300">
                <div>حالة الميزانية: <strong>{netBalance >= 0 ? 'فائض مالي مريح' : 'عجز'}</strong></div>
              </div>
            </div>

            {/* Signatures */}
            <div className="pt-12 grid grid-cols-2 text-center text-xs font-bold text-slate-700">
              <div>
                <p className="mb-14">أمين مال الجمعية</p>
                <div className="w-36 h-0.5 bg-slate-300 mx-auto"></div>
              </div>
              <div>
                <p className="mb-14">رئيس الجمعية / المشرف العام</p>
                <div className="w-36 h-0.5 bg-slate-300 mx-auto"></div>
              </div>
            </div>
          </div>
        )}

        {/* 2. Quran Achievements Report */}
        {selectedReportType === 'quran' && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-emerald-900 text-white font-bold">
                    <th className="p-3">#</th>
                    <th className="p-3">اسم التلميذ</th>
                    <th className="p-3">الحلقة</th>
                    <th className="p-3">عدد الأحزاب المكتملة</th>
                    <th className="p-3">السورة الحالية</th>
                    <th className="p-3">نسبة الحفظ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {topStudents.map((student, idx) => {
                    const halaqah = halaqat.find((h) => h.id === student.halaqahId);
                    const pct = Math.min(100, Math.round(((student.hizbProgress || 0) / 60) * 100));

                    return (
                      <tr key={student.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold font-mono">{idx + 1}</td>
                        <td className="p-3 font-bold text-slate-900">{student.fullName}</td>
                        <td className="p-3 text-slate-600">{halaqah?.name || 'عامة'}</td>
                        <td className="p-3 font-black text-emerald-800 font-mono">
                          {student.hizbProgress || 0} / 60 حزباً
                        </td>
                        <td className="p-3 text-slate-700">سورة {student.currentSurah || '-'}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="font-mono font-bold text-slate-700">{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. Overdue Fees Report */}
        {selectedReportType === 'overdue' && (
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs font-bold">
              يبلغ عدد التلاميذ المتأخرين عن تسديد الاشتراكات: {overdueList.length} تلميذاً بإجمالي مستحقات:{' '}
              {overdueList.reduce((s, o) => s + o.totalDue, 0).toLocaleString()} {settings.currency}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-rose-900 text-white font-bold">
                    <th className="p-3">#</th>
                    <th className="p-3">التلميذ</th>
                    <th className="p-3">الحلقة</th>
                    <th className="p-3">الواجب السنوي</th>
                    <th className="p-3">الأشهر غير المسددة</th>
                    <th className="p-3">إجمالي المستحق</th>
                    <th className="p-3 print:hidden">إجراء واتساب</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {overdueList.map((item, idx) => {
                    const halaqah = halaqat.find((h) => h.id === item.student.halaqahId);
                    return (
                      <tr key={item.student.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold font-mono">{idx + 1}</td>
                        <td className="p-3 font-bold text-slate-900">{item.student.fullName}</td>
                        <td className="p-3 text-slate-600">{halaqah?.name || '-'}</td>
                        <td className="p-3">
                          {item.hasPaidAnnual ? (
                            <span className="text-emerald-700 font-bold">مسدد ✓</span>
                          ) : (
                            <span className="text-rose-600 font-bold">غير مسدد ✕</span>
                          )}
                        </td>
                        <td className="p-3 font-bold text-rose-700 font-mono">
                          {item.unpaidCount} أشهر
                        </td>
                        <td className="p-3 font-black text-rose-800 font-mono">
                          {item.totalDue} {settings.currency}
                        </td>
                        <td className="p-3 print:hidden">
                          {item.guardianPhone && (
                            <button
                              onClick={() => {
                                const msg = (settings.whatsappTemplateReminder || '')
                                  .replace('{student_name}', item.student.fullName)
                                  .replace('{month}', currentMonthStr)
                                  .replace('{year}', String(currentYear));
                                onSendWhatsApp(item.guardianPhone!, msg);
                              }}
                              className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                            >
                              <Send className="w-3 h-3" />
                              <span>تذكير</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. Attendance Report */}
        {selectedReportType === 'attendance' && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-emerald-900 text-white font-bold">
                    <th className="p-3">التلميذ</th>
                    <th className="p-3">الحلقة</th>
                    <th className="p-3">الحصص المسجلة</th>
                    <th className="p-3">الحضور الفعلي</th>
                    <th className="p-3">الغياب بدون عذر</th>
                    <th className="p-3">نسبة الانضباط</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {students.map((student) => {
                    const halaqah = halaqat.find((h) => h.id === student.halaqahId);
                    const stuAtt = attendance.filter((a) => a.studentId === student.id);
                    const attended = stuAtt.filter((a) => a.status === 'حاضر').length;
                    const unexcused = stuAtt.filter((a) => a.status === 'غائب').length;
                    const rate = stuAtt.length > 0 ? Math.round((attended / stuAtt.length) * 100) : 100;

                    return (
                      <tr key={student.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">{student.fullName}</td>
                        <td className="p-3 text-slate-600">{halaqah?.name || '-'}</td>
                        <td className="p-3 font-mono">{stuAtt.length}</td>
                        <td className="p-3 font-mono text-emerald-700 font-bold">{attended}</td>
                        <td className="p-3 font-mono text-rose-600 font-bold">{unexcused}</td>
                        <td className="p-3 font-black text-slate-900 font-mono">{rate}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. Batch Student Cards */}
        {selectedReportType === 'studentCards' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {students.map((student) => {
              const halaqah = halaqat.find((h) => h.id === student.halaqahId);
              return (
                <div
                  key={student.id}
                  className="p-5 rounded-2xl bg-gradient-to-br from-emerald-900 to-teal-950 text-white border border-amber-400/30 relative overflow-hidden shadow-sm"
                >
                  <div className="flex items-center justify-between border-b border-white/20 pb-2">
                    <div>
                      <h4 className="font-bold text-amber-300 text-xs">{settings.assocName}</h4>
                      <p className="text-[9px] text-emerald-200">بطاقة تلميذ</p>
                    </div>
                    <span className="font-mono text-[10px] font-bold bg-white/10 px-1.5 py-0.5 rounded">
                      {student.regNumber || '2026'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mt-3">
                    <div className="w-12 h-12 rounded-xl bg-white text-emerald-950 font-black text-lg flex items-center justify-center shrink-0">
                      {student.fullName.charAt(0)}
                    </div>
                    <div>
                      <h5 className="font-bold text-sm text-white">{student.fullName}</h5>
                      <p className="text-[11px] text-amber-300">الحلقة: {halaqah?.name || 'عامة'}</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-white/20 flex justify-between text-[10px] text-emerald-200">
                    <span>الهاتف: {student.guardianPhone || student.phone || '-'}</span>
                    <span>الأحزاب: {student.hizbProgress || 0}/60</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
