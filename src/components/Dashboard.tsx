import React from 'react';
import { AppDatabase, ActiveTab, Student } from '../types';
import {
  Users,
  CreditCard,
  BookMarked,
  Wallet,
  UserPlus,
  Receipt,
  Award,
  CalendarCheck,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  Send,
  Sparkles,
  Layers,
  ChevronLeft,
  Clock,
  Star
} from 'lucide-react';

interface DashboardProps {
  database: AppDatabase;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNewStudent: () => void;
  onOpenNewPayment: () => void;
  onOpenNewRecitation: () => void;
  onOpenStudentProfile: (student: Student) => void;
  onSendWhatsApp: (phone: string, text: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  database,
  setActiveTab,
  onOpenNewStudent,
  onOpenNewPayment,
  onOpenNewRecitation,
  onOpenStudentProfile,
  onSendWhatsApp,
}) => {
  const currentMonthStr = String(new Date().getMonth() + 1).padStart(2, '0');
  const currentYear = new Date().getFullYear();
  const monthNamesArabic = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];
  const currentMonthName = monthNamesArabic[new Date().getMonth()];

  const { students, halaqat, annualFees, monthlyFees, recitations, expenses, incomes, settings } = database;

  // 1. حسابات التلاميذ
  const totalStudents = students.length;
  const maleStudents = students.filter((s) => s.gender === 'ذكر').length;
  const femaleStudents = students.filter((s) => s.gender === 'أنثى').length;

  // 2. الواجب السنوي للسنة الحالية
  const currentYearAnnualPaid = annualFees.filter((a) => a.year === currentYear);
  const totalAnnualCollected = currentYearAnnualPaid.reduce((sum, a) => sum + a.amount, 0);
  const annualPaidCount = currentYearAnnualPaid.length;

  // 3. الاشتراك الشهري للشهر الحالي
  const currentMonthPaid = monthlyFees.filter(
    (m) => m.month === currentMonthStr && m.year === currentYear
  );
  const currentMonthCollected = currentMonthPaid.reduce((sum, m) => sum + m.amount, 0);
  const paidStudentIds = new Set(currentMonthPaid.map((m) => m.studentId));

  // الطلاب المتأخرون عن سداد الشهر الحالي (مع استثناء المعفى كليا)
  const unpaidStudents = students.filter(
    (s) => s.exemptionStatus !== 'معفى_كلي' && !paidStudentIds.has(s.id)
  );

  // 4. رصيد صندوق الجمعية العام
  const allAnnualSum = annualFees.reduce((sum, a) => sum + a.amount, 0);
  const allMonthlySum = monthlyFees.reduce((sum, m) => sum + m.amount, 0);
  const allIncomeSum = incomes.reduce((sum, i) => sum + i.amount, 0);
  const allExpenseSum = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netFundBalance = allAnnualSum + allMonthlySum + allIncomeSum - allExpenseSum;

  // 5. نشاط الحفظ والتسميع
  const recentRecitations = [...recitations].reverse().slice(0, 5);

  const getStudentName = (id: string) => {
    return students.find((s) => s.id === id)?.fullName || 'تلميذ';
  };

  const getHalaqahName = (id?: string) => {
    return halaqat.find((h) => h.id === id)?.name || 'غير محددة';
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 p-6 sm:p-8 text-white shadow-xl shadow-emerald-950/15">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/60 border border-emerald-500/30 text-amber-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>لوحة القيادة والمتابعة الحية</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              أهلاً بكم في نظام إدارة تحفيظ القرآن الكريم
            </h2>
            <p className="text-emerald-100 text-sm sm:text-base mt-2 leading-relaxed opacity-90">
              متابعة دقيقة للتلاميذ، الحلقات، درجات التسميع اليومية، وتحصيل الاشتراكات والواجبات مع الحفظ الفوري الآمن.
            </p>
          </div>

          {/* Quick Primary Actions in Banner */}
          <div className="flex flex-wrap gap-2.5 sm:gap-3 shrink-0">
            <button
              onClick={onOpenNewStudent}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>تسجيل تلميذ</span>
            </button>
            <button
              onClick={onOpenNewPayment}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm border border-emerald-400/40 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>قبض اشتراك</span>
            </button>
            <button
              onClick={onOpenNewRecitation}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all active:scale-95 cursor-pointer"
            >
              <BookMarked className="w-4 h-4 text-amber-300" />
              <span>دفتر التسميع</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Students */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">إجمالي التلاميذ</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{totalStudents}</span>
            <span className="text-xs font-semibold text-slate-500">تلميذ وتلميذة</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>ذكور: <strong>{maleStudents}</strong></span>
            <span>•</span>
            <span>إناث: <strong>{femaleStudents}</strong></span>
            <span>•</span>
            <span>حلقات: <strong>{halaqat.length}</strong></span>
          </div>
        </div>

        {/* Current Month Collection */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              اشتراكات {currentMonthName} ({currentYear})
            </span>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-700">{currentMonthCollected.toLocaleString()}</span>
            <span className="text-xs font-bold text-slate-500">{settings.currency}</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-emerald-700 font-semibold">
              مسددون: {currentMonthPaid.length}
            </span>
            <span className="text-rose-600 font-semibold">
              متأخرون: {unpaidStudents.length}
            </span>
          </div>
        </div>

        {/* Annual Fees Collection */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              الواجب السنوي ({currentYear})
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{totalAnnualCollected.toLocaleString()}</span>
            <span className="text-xs font-bold text-slate-500">{settings.currency}</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>تم السداد: <strong>{annualPaidCount}</strong> / {totalStudents}</span>
            <span className="text-amber-700 font-bold">
              {totalStudents > 0 ? Math.round((annualPaidCount / totalStudents) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* Net Fund Balance */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">صندوق الجمعية الصافي</span>
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-3xl font-black ${netFundBalance >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
              {netFundBalance.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-500">{settings.currency}</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>المداخيل: <strong className="text-emerald-700">{(allAnnualSum + allMonthlySum + allIncomeSum).toLocaleString()}</strong></span>
            <span>المصاريف: <strong className="text-rose-600">{allExpenseSum.toLocaleString()}</strong></span>
          </div>
        </div>
      </div>

      {/* Grid: Unpaid Arrears & Recent Recitations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Top: Unpaid Students Alerts (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                    تنبيه المتأخرات ({currentMonthName} {currentYear})
                  </h3>
                  <p className="text-xs text-slate-500">
                    تلاميذ لم يسددوا الاشتراك الشهري بعد ({unpaidStudents.length} تلميذ)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('finance')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                <span>مصفوفة الدفع</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {unpaidStudents.length === 0 ? (
              <div className="py-8 text-center bg-emerald-50/60 rounded-xl border border-emerald-100">
                <Sparkles className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="font-bold text-emerald-900 text-sm">ممتاز! تم استيفاء جميع اشتراكات هذا الشهر بالكامل</p>
                <p className="text-xs text-emerald-700 mt-1">لا توجد أي متأخرات مسجلة على التلاميذ لهذا الشهر.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                {unpaidStudents.slice(0, 6).map((student) => {
                  const halaqah = halaqat.find((h) => h.id === student.halaqahId);
                  const phone = student.guardianPhone || student.phone || '';
                  const reminderMsg = (settings.whatsappTemplateReminder || '')
                    .replace('{student_name}', student.fullName)
                    .replace('{month}', currentMonthStr)
                    .replace('{year}', String(currentYear));

                  return (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {student.fullName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <button
                            onClick={() => onOpenStudentProfile(student)}
                            className="font-bold text-slate-900 text-sm hover:text-emerald-700 truncate text-right block"
                          >
                            {student.fullName}
                          </button>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                            <span className="truncate">{halaqah?.name || 'بدون حلقة'}</span>
                            {student.exemptionStatus === 'معفى_جزئي' && (
                              <span className="px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800 text-[10px] font-semibold">
                                خصم 50%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {phone && (
                          <button
                            onClick={() => onSendWhatsApp(phone, reminderMsg)}
                            title={`إرسال تذكير عبر واتساب لولي الأمر (${phone})`}
                            className="p-2 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-colors cursor-pointer"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={onOpenNewPayment}
                          className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs cursor-pointer"
                        >
                          تسجيل دفع
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {unpaidStudents.length > 6 && (
            <p className="text-xs text-slate-500 text-center mt-3 pt-2 border-t border-slate-100">
              يوجد {unpaidStudents.length - 6} تلميذ آخر متأخر، اضغط على مصفوفة الدفع لعرض الجميع.
            </p>
          )}
        </div>

        {/* Right / Bottom: Recent Quran Recitations (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <BookMarked className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base sm:text-lg">آخر جلسات التسميع</h3>
                  <p className="text-xs text-slate-500">سجل الحفظ والمراجعات الأخيرة</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('quranTracker')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                <span>دفتر التسميع</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {recentRecitations.length === 0 ? (
              <div className="py-8 text-center bg-slate-50 rounded-xl border border-slate-100">
                <BookMarked className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="font-semibold text-slate-600 text-sm">لم يتم تسجيل أي تسميع بعد</p>
                <button
                  onClick={onOpenNewRecitation}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-bold"
                >
                  إضافة تسميع جديد
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentRecitations.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 hover:bg-emerald-50/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">
                        {getStudentName(rec.studentId)}
                      </span>
                      <div className="flex items-center gap-1 text-amber-500">
                        {Array.from({ length: rec.grade }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-600 mt-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md text-[11px]">
                          سورة {rec.surahName} ({rec.fromAyah} - {rec.toAyah})
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {rec.type.replace('_', ' ')}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {rec.date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
              إجمالي جلسات الحفظ المسجلة: <strong>{recitations.length}</strong>
            </span>
            <button
              onClick={onOpenNewRecitation}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
            >
              + إضافة تسميع
            </button>
          </div>
        </div>
      </div>

      {/* Halaqat Quick Overview Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">حلقات التحفيظ والمؤطرين</h3>
              <p className="text-xs text-slate-500">توزيع الحلقات والمشايخ المشرفين</p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('halaqat')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
          >
            <span>إدارة الحلقات</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {halaqat.map((h) => {
            const count = students.filter((s) => s.halaqahId === h.id).length;
            return (
              <div
                key={h.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/20 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-800 line-clamp-1">
                    {h.name}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                    {count} طالب
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2 font-medium">
                  المشرف: <span className="text-slate-900 font-semibold">{h.teacherName}</span>
                </p>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                  {h.scheduleDescription || 'الموعد لم يحدد بعد'}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
