import React, { useState, useMemo } from 'react';
import {
  AnnualFee,
  MonthlyFee,
  Student,
  Halaqah,
  AssociationSettings
} from '../types';
import {
  CreditCard,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  Calendar,
  Send,
  Trash2,
  Edit2,
  FileSpreadsheet,
  Receipt
} from 'lucide-react';

interface FinanceViewProps {
  annualFees: AnnualFee[];
  monthlyFees: MonthlyFee[];
  students: Student[];
  halaqat: Halaqah[];
  settings: AssociationSettings;
  onSaveAnnualPayment: (fee: AnnualFee) => void;
  onDeleteAnnualPayment: (id: string) => void;
  onSaveMonthlyPayment: (fee: MonthlyFee) => void;
  onDeleteMonthlyPayment: (id: string) => void;
  onOpenReceiptForPayment: (type: 'annual' | 'monthly', recordId: string) => void;
  onSendWhatsApp: (phone: string, text: string) => void;
  preselectedStudentId?: string;
}

export const FinanceView: React.FC<FinanceViewProps> = ({
  annualFees,
  monthlyFees,
  students,
  halaqat,
  settings,
  onSaveAnnualPayment,
  onDeleteAnnualPayment,
  onSaveMonthlyPayment,
  onDeleteMonthlyPayment,
  onOpenReceiptForPayment,
  onSendWhatsApp,
  preselectedStudentId,
}) => {
  const currentYear = new Date().getFullYear();
  const currentMonthNum = new Date().getMonth() + 1;
  const currentMonthStr = String(currentMonthNum).padStart(2, '0');

  const [activeSubTab, setActiveSubTab] = useState<'monthlyMatrix' | 'monthlyLog' | 'annual'>('monthlyMatrix');
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [halaqahFilter, setHalaqahFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(!!preselectedStudentId);
  const [paymentType, setPaymentType] = useState<'monthly' | 'annual'>('monthly');
  const [studentId, setStudentId] = useState<string>(preselectedStudentId || (students[0]?.id || ''));
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState<number>(settings.monthlyFeeDefault);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([currentMonthStr]);
  const [receiptNumber, setReceiptNumber] = useState(`REC-${currentYear}-${String(Date.now()).slice(-4)}`);
  const [paymentMethod, setPaymentMethod] = useState<'نقدي' | 'تحويل_بنكي' | 'شيك' | 'أخرى'>('نقدي');
  const [notes, setNotes] = useState('');

  const monthNamesArabic = [
    { num: '01', name: 'يناير' },
    { num: '02', name: 'فبراير' },
    { num: '03', name: 'مارس' },
    { num: '04', name: 'أبريل' },
    { num: '05', name: 'مايو' },
    { num: '06', name: 'يونيو' },
    { num: '07', name: 'يوليو' },
    { num: '08', name: 'أغسطس' },
    { num: '09', name: 'سبتمبر' },
    { num: '10', name: 'أكتوبر' },
    { num: '11', name: 'نوفمبر' },
    { num: '12', name: 'ديسمبر' },
  ];

  // Auto-adjust default amount based on student exemption
  const handleStudentChange = (id: string, type = paymentType) => {
    setStudentId(id);
    const s = students.find((item) => item.id === id);
    let baseAmount = type === 'monthly' ? settings.monthlyFeeDefault : settings.annualFeeDefault;
    if (s?.exemptionStatus === 'معفى_جزئي') {
      baseAmount = Math.round(baseAmount * 0.5);
    } else if (s?.exemptionStatus === 'معفى_كلي') {
      baseAmount = 0;
    }
    setAmount(baseAmount);
  };

  const handleOpenNewModal = (type: 'monthly' | 'annual' = 'monthly', stuId?: string) => {
    setPaymentType(type);
    const targetStudentId = stuId || studentId || (students[0]?.id || '');
    handleStudentChange(targetStudentId, type);
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setSelectedMonths([currentMonthStr]);
    setReceiptNumber(`REC-${selectedYear}-${String(Date.now()).slice(-4)}`);
    setPaymentMethod('نقدي');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) return;

    if (paymentType === 'annual') {
      const fee: AnnualFee = {
        id: 'AF_' + Date.now(),
        studentId,
        year: selectedYear,
        amount: Number(amount),
        date: paymentDate,
        receiptNumber: receiptNumber.trim() || undefined,
        paymentMethod,
        notes: notes.trim() || undefined,
        createdAt: new Date().toISOString(),
      };
      onSaveAnnualPayment(fee);
    } else {
      // Save for all selected months
      selectedMonths.forEach((m, idx) => {
        const fee: MonthlyFee = {
          id: 'MF_' + Date.now() + '_' + idx,
          studentId,
          month: m,
          year: selectedYear,
          amount: Number(amount),
          date: paymentDate,
          receiptNumber: receiptNumber.trim() || undefined,
          paymentMethod,
          notes: notes.trim() || undefined,
          createdAt: new Date().toISOString(),
        };
        onSaveMonthlyPayment(fee);
      });
    }

    setIsModalOpen(false);
  };

  // Toggle month in multiselect
  const toggleMonth = (mNum: string) => {
    if (selectedMonths.includes(mNum)) {
      if (selectedMonths.length > 1) {
        setSelectedMonths(selectedMonths.filter((m) => m !== mNum));
      }
    } else {
      setSelectedMonths([...selectedMonths, mNum].sort());
    }
  };

  const getStudent = (id: string) => students.find((s) => s.id === id);

  // Filtered Students for Matrix
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        !searchTerm ||
        s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.regNumber && s.regNumber.includes(searchTerm));
      const matchHalaqah = halaqahFilter === 'all' || s.halaqahId === halaqahFilter;
      return matchSearch && matchHalaqah;
    });
  }, [students, searchTerm, halaqahFilter]);

  // Statistics for the selected year
  const yearMonthlyFees = monthlyFees.filter((m) => m.year === selectedYear);
  const totalMonthlySum = yearMonthlyFees.reduce((s, m) => s + m.amount, 0);

  const yearAnnualFees = annualFees.filter((a) => a.year === selectedYear);
  const totalAnnualSum = yearAnnualFees.reduce((s, a) => s + a.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-700" />
            <span>الواجبات والاشتراكات المالية</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            متابعة دقيقة لاشتراكات التلاميذ الشهرية والواجب السنوي ومصفوفة السداد السنوية
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleOpenNewModal('monthly')}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-900/15 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل دفع اشتراك</span>
          </button>
          <button
            onClick={() => window.print()}
            title="طباعة الكشف"
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold cursor-pointer"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Year & KPI Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500">السنة المالية المختارة</span>
            <div className="mt-1">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="text-lg font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 cursor-pointer"
              >
                {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                  <option key={y} value={y}>
                    سنة {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Calendar className="w-8 h-8 text-emerald-700/40" />
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500">إجمالي الاشتراكات الشهرية ({selectedYear})</span>
            <div className="text-2xl font-black text-emerald-700 mt-1">
              {totalMonthlySum.toLocaleString()} {settings.currency}
            </div>
            <span className="text-[11px] text-slate-500">{yearMonthlyFees.length} عملية دفع</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            💰
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500">إجمالي الواجب السنوي ({selectedYear})</span>
            <div className="text-2xl font-black text-amber-700 mt-1">
              {totalAnnualSum.toLocaleString()} {settings.currency}
            </div>
            <span className="text-[11px] text-slate-500">{yearAnnualFees.length} تلميذ سددوا</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            📅
          </div>
        </div>
      </div>

      {/* Subtabs Bar */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-t-2xl border-t border-r border-l gap-4 sm:gap-6">
        <button
          onClick={() => setActiveSubTab('monthlyMatrix')}
          className={`py-3.5 font-bold text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'monthlyMatrix'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>مصفوفة الدفع السنوية (12 شهراً)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('monthlyLog')}
          className={`py-3.5 font-bold text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'monthlyLog'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>سجل المدفوعات الشهرية ({yearMonthlyFees.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('annual')}
          className={`py-3.5 font-bold text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'annual'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>الواجب السنوي والتسجيل ({yearAnnualFees.length})</span>
        </button>
      </div>

      {/* 1. Monthly 12-Month Matrix View */}
      {activeSubTab === 'monthlyMatrix' && (
        <div className="space-y-4">
          {/* Matrix Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="ابحث بالتلميذ في المصفوفة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="w-full sm:w-56">
              <select
                value={halaqahFilter}
                onChange={(e) => setHalaqahFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-600"
              >
                <option value="all">جميع الحلقات</option>
                {halaqat.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Matrix Legend */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold px-2 text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-600"></span> تم السداد
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500"></span> متأخر عن السداد
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-slate-300"></span> شهر قادم
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-indigo-500"></span> إعفاء كلي
            </span>
          </div>

          {/* Matrix Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-emerald-900 text-white font-bold">
                    <th className="p-3 sticky right-0 bg-emerald-900 z-10">التلميذ / الحلقة</th>
                    {monthNamesArabic.map((m) => (
                      <th key={m.num} className="p-2 text-center whitespace-nowrap">
                        {m.name}
                      </th>
                    ))}
                    <th className="p-3 text-center">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((student) => {
                    const halaqah = halaqat.find((h) => h.id === student.halaqahId);
                    const guardianPhone = student.guardianPhone || student.phone;

                    return (
                      <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 sticky right-0 bg-white font-bold text-slate-900 border-l border-slate-100 shadow-xs min-w-44">
                          <div className="truncate">{student.fullName}</div>
                          <div className="text-[10px] text-slate-400 font-normal truncate">
                            {halaqah?.name || 'عامة'}
                          </div>
                        </td>

                        {monthNamesArabic.map((m, idx) => {
                          const monthNum = idx + 1;
                          const paidFee = monthlyFees.find(
                            (fee) =>
                              fee.studentId === student.id &&
                              fee.month === m.num &&
                              fee.year === selectedYear
                          );
                          const isPaid = !!paidFee;
                          const isPast =
                            selectedYear < currentYear ||
                            (selectedYear === currentYear && monthNum <= currentMonthNum);

                          return (
                            <td key={m.num} className="p-1.5 text-center">
                              {isPaid ? (
                                <button
                                  onClick={() => onOpenReceiptForPayment('monthly', paidFee.id)}
                                  title={`تم الدفع: ${paidFee.amount} ${settings.currency} (انقر لعرض الوصل)`}
                                  className="w-7 h-7 mx-auto rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black flex items-center justify-center text-[10px] shadow-xs cursor-pointer"
                                >
                                  ✓
                                </button>
                              ) : student.exemptionStatus === 'معفى_كلي' ? (
                                <span
                                  title="معفى كلياً من الرسوم"
                                  className="w-7 h-7 mx-auto rounded-lg bg-indigo-100 text-indigo-800 font-bold flex items-center justify-center text-[10px]"
                                >
                                  معفى
                                </span>
                              ) : isPast ? (
                                <button
                                  onClick={() => handleOpenNewModal('monthly', student.id)}
                                  title="متأخر - اضغط لتسجيل الدفع"
                                  className="w-7 h-7 mx-auto rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold flex items-center justify-center text-[10px] cursor-pointer"
                                >
                                  ✕
                                </button>
                              ) : (
                                <span className="w-7 h-7 mx-auto rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center text-[10px]">
                                  -
                                </span>
                              )}
                            </td>
                          );
                        })}

                        <td className="p-2 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleOpenNewModal('monthly', student.id)}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded font-bold text-[11px] cursor-pointer"
                            >
                              + دفع
                            </button>
                            {guardianPhone && (
                              <button
                                onClick={() => {
                                  const reminderMsg = (settings.whatsappTemplateReminder || '')
                                    .replace('{student_name}', student.fullName)
                                    .replace('{month}', currentMonthStr)
                                    .replace('{year}', String(currentYear));
                                  onSendWhatsApp(guardianPhone, reminderMsg);
                                }}
                                title="إرسال تذكير واتساب"
                                className="p-1 text-emerald-700 hover:bg-emerald-50 rounded cursor-pointer"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. Monthly Payments Log Table */}
      {activeSubTab === 'monthlyLog' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {yearMonthlyFees.length === 0 ? (
            <div className="p-12 text-center text-slate-500">لا توجد مدفوعات مسجلة لهذه السنة</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-sm">
                <thead>
                  <tr className="bg-emerald-800 text-white text-xs font-bold">
                    <th className="p-3.5">رقم الوصل</th>
                    <th className="p-3.5">التلميذ</th>
                    <th className="p-3.5">الشهر / السنة</th>
                    <th className="p-3.5">المبلغ</th>
                    <th className="p-3.5">تاريخ الدفع</th>
                    <th className="p-3.5">طريقة الدفع</th>
                    <th className="p-3.5 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {yearMonthlyFees.map((fee) => {
                    const student = getStudent(fee.studentId);
                    const monthObj = monthNamesArabic.find((m) => m.num === fee.month);
                    return (
                      <tr key={fee.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 font-mono text-xs font-bold text-slate-600">
                          {fee.receiptNumber || '-'}
                        </td>
                        <td className="p-3.5 font-bold text-slate-900">
                          {student?.fullName || 'محذوف'}
                        </td>
                        <td className="p-3.5 text-xs text-emerald-800 font-bold">
                          {monthObj?.name || fee.month} ({fee.year})
                        </td>
                        <td className="p-3.5 font-black text-slate-900">
                          {fee.amount} {settings.currency}
                        </td>
                        <td className="p-3.5 text-xs text-slate-600">{fee.date}</td>
                        <td className="p-3.5 text-xs text-slate-500">{fee.paymentMethod}</td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => onOpenReceiptForPayment('monthly', fee.id)}
                              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                              title="طباعة وصل القبض"
                            >
                              وصل
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('هل أنت متأكد من حذف هذا السجل المالي؟')) {
                                  onDeleteMonthlyPayment(fee.id);
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 3. Annual Fees Table */}
      {activeSubTab === 'annual' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">سجل تسديد الواجب السنوي (سنة {selectedYear})</h3>
            <button
              onClick={() => handleOpenNewModal('annual')}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold cursor-pointer"
            >
              + تسجيل واجب سنوي
            </button>
          </div>

          {yearAnnualFees.length === 0 ? (
            <div className="p-12 text-center text-slate-500">لا توجد مدفوعات واجب سنوي مسجلة لهذه السنة</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-sm">
                <thead>
                  <tr className="bg-amber-900 text-white text-xs font-bold">
                    <th className="p-3.5">رقم الوصل</th>
                    <th className="p-3.5">التلميذ</th>
                    <th className="p-3.5">السنة</th>
                    <th className="p-3.5">المبلغ</th>
                    <th className="p-3.5">تاريخ الدفع</th>
                    <th className="p-3.5">ملاحظات</th>
                    <th className="p-3.5 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {yearAnnualFees.map((fee) => {
                    const student = getStudent(fee.studentId);
                    return (
                      <tr key={fee.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 font-mono text-xs font-bold text-slate-600">
                          {fee.receiptNumber || '-'}
                        </td>
                        <td className="p-3.5 font-bold text-slate-900">
                          {student?.fullName || 'محذوف'}
                        </td>
                        <td className="p-3.5 text-xs text-amber-900 font-bold">سنة {fee.year}</td>
                        <td className="p-3.5 font-black text-slate-900">
                          {fee.amount} {settings.currency}
                        </td>
                        <td className="p-3.5 text-xs text-slate-600">{fee.date}</td>
                        <td className="p-3.5 text-xs text-slate-500">{fee.notes || '-'}</td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => onOpenReceiptForPayment('annual', fee.id)}
                              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                              title="طباعة وصل القبض"
                            >
                              وصل
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('هل أنت متأكد من حذف هذا السجل؟')) {
                                  onDeleteAnnualPayment(fee.id);
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* New Payment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-700" />
                <span>تسجيل عملية دفع وقبض</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentType('monthly');
                    handleStudentChange(studentId, 'monthly');
                  }}
                  className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    paymentType === 'monthly'
                      ? 'bg-white text-emerald-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  اشتراك شهري
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentType('annual');
                    handleStudentChange(studentId, 'annual');
                  }}
                  className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    paymentType === 'annual'
                      ? 'bg-white text-emerald-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  الواجب السنوي
                </button>
              </div>

              {/* Student */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  التلميذ <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={studentId}
                  onChange={(e) => handleStudentChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-600"
                >
                  <option value="">-- اختر التلميذ --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} {s.exemptionStatus !== 'عادي' ? `(${s.exemptionStatus.replace('_', ' ')})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Months Multi-select (if monthly) */}
              {paymentType === 'monthly' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    اختر الشهر (أو الأشهر المسددة دفعة واحدة):
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                    {monthNamesArabic.map((m) => {
                      const isSelected = selectedMonths.includes(m.num);
                      return (
                        <button
                          type="button"
                          key={m.num}
                          onClick={() => toggleMonth(m.num)}
                          className={`py-1.5 px-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {m.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Amount & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    المبلغ ({settings.currency}) لكل شهر
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ الدفع</label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Receipt Number & Payment Method */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رقم وصل القبض</label>
                  <input
                    type="text"
                    value={receiptNumber}
                    onChange={(e) => setReceiptNumber(e.target.value)}
                    placeholder="REC-2026-001"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">طريقة الدفع</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-600"
                  >
                    <option value="نقدي">نقدي</option>
                    <option value="تحويل_بنكي">تحويل بنكي / CCP</option>
                    <option value="شيك">شيك</option>
                    <option value="أخرى">أخرى</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ملاحظات إضافية..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
                />
              </div>

              {paymentType === 'monthly' && selectedMonths.length > 1 && (
                <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold">
                  إجمالي المبلغ المقبوض عن {selectedMonths.length} أشهر: {amount * selectedMonths.length} {settings.currency}
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold shadow-md cursor-pointer"
                >
                  تأكيد وقبض المبلغ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
