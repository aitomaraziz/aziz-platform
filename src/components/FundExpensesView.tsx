import React, { useState } from 'react';
import { ExpenseRecord, IncomeRecord, ExpenseCategory, IncomeCategory, AssociationSettings } from '../types';
import {
  Wallet,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  Receipt,
  Trash2,
  Filter,
  Calendar
} from 'lucide-react';

interface FundExpensesViewProps {
  expenses: ExpenseRecord[];
  incomes: IncomeRecord[];
  totalAnnualFeesSum: number;
  totalMonthlyFeesSum: number;
  settings: AssociationSettings;
  onSaveExpense: (expense: ExpenseRecord) => void;
  onDeleteExpense: (id: string) => void;
  onSaveIncome: (income: IncomeRecord) => void;
  onDeleteIncome: (id: string) => void;
}

export const FundExpensesView: React.FC<FundExpensesViewProps> = ({
  expenses,
  incomes,
  totalAnnualFeesSum,
  totalMonthlyFeesSum,
  settings,
  onSaveExpense,
  onDeleteExpense,
  onSaveIncome,
  onDeleteIncome,
}) => {
  const [activeTab, setActiveTab] = useState<'expenses' | 'incomes'>('expenses');

  // Modal State
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);

  // Expense form
  const [expTitle, setExpTitle] = useState('');
  const [expCategory, setExpCategory] = useState<ExpenseCategory>('مكافآت_مشايخ');
  const [expAmount, setExpAmount] = useState<number>(1000);
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [expPaidTo, setExpPaidTo] = useState('');
  const [expReceipt, setExpReceipt] = useState('');
  const [expNotes, setExpNotes] = useState('');

  // Income form
  const [incTitle, setIncTitle] = useState('');
  const [incCategory, setIncCategory] = useState<IncomeCategory>('تبرعات_محسنين');
  const [incAmount, setIncAmount] = useState<number>(5000);
  const [incDate, setIncDate] = useState(new Date().toISOString().split('T')[0]);
  const [incReceivedFrom, setIncReceivedFrom] = useState('');
  const [incReceipt, setIncReceipt] = useState('');
  const [incNotes, setIncNotes] = useState('');

  // Financial totals
  const totalOtherIncomes = incomes.reduce((s, i) => s + i.amount, 0);
  const totalAllRevenues = totalAnnualFeesSum + totalMonthlyFeesSum + totalOtherIncomes;
  const totalAllExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netFundBalance = totalAllRevenues - totalAllExpenses;

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle.trim() || !expAmount) return;

    const newExp: ExpenseRecord = {
      id: 'EXP_' + Date.now(),
      title: expTitle.trim(),
      category: expCategory,
      amount: Number(expAmount),
      date: expDate,
      paidTo: expPaidTo.trim() || undefined,
      receiptNumber: expReceipt.trim() || undefined,
      notes: expNotes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    onSaveExpense(newExp);
    setIsExpenseModalOpen(false);
    setExpTitle('');
  };

  const handleIncomeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incTitle.trim() || !incAmount) return;

    const newInc: IncomeRecord = {
      id: 'INC_' + Date.now(),
      title: incTitle.trim(),
      category: incCategory,
      amount: Number(incAmount),
      date: incDate,
      receivedFrom: incReceivedFrom.trim() || undefined,
      receiptNumber: incReceipt.trim() || undefined,
      notes: incNotes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    onSaveIncome(newInc);
    setIsIncomeModalOpen(false);
    setIncTitle('');
  };

  const expenseCategoryLabels: Record<ExpenseCategory, string> = {
    مكافآت_مشايخ: 'مكافآت المشايخ والمؤطرين',
    جوائز_مسابقات: 'جوائز ومسابقات وتكريمات',
    تجهيزات_وكتب: 'تجهيزات ومصاحف وكتب',
    فواتير_وصيانة: 'فواتير وصيانة ومرافق',
    إطعام_وضيافة: 'إطعام وضيافة مناسبات',
    أنشطة_ورحلات: 'أنشطة ورحلات تربوية',
    أخرى: 'مصاريف أخرى متنوعة',
  };

  const incomeCategoryLabels: Record<IncomeCategory, string> = {
    اشتراكات_شهرية: 'اشتراكات شهرية',
    اشتراكات_سنوية: 'اشتراكات سنوية',
    تبرعات_محسنين: 'تبرعات المحسنين',
    أوقاف: 'عائدات أوقاف',
    دعم_رسمي: 'دعم ومساهمات رسمية',
    أخرى: 'مداخيل أخرى',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Wallet className="w-6 h-6 text-emerald-700" />
            <span>صندوق الجمعية والميزانية</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            إدارة المداخيل، التبرعات، ومصاريف الجمعية من مكافآت المشايخ وتجهيزات الحلقات
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsIncomeModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ تسجيل مدخول / تبرع</span>
          </button>
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>- تسجيل مصروف</span>
          </button>
        </div>
      </div>

      {/* Balance Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Total Revenues */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">إجمالي المداخيل العامة</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-700">{totalAllRevenues.toLocaleString()}</span>
            <span className="text-xs font-bold text-slate-500">{settings.currency}</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>اشتراكات: {(totalAnnualFeesSum + totalMonthlyFeesSum).toLocaleString()}</span>
            <span>•</span>
            <span>تبرعات: {totalOtherIncomes.toLocaleString()}</span>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">إجمالي المصاريف</span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-rose-600">{totalAllExpenses.toLocaleString()}</span>
            <span className="text-xs font-bold text-slate-500">{settings.currency}</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
            عدد فواتير المصاريف: <strong>{expenses.length}</strong>
          </div>
        </div>

        {/* Net Fund Balance */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">الرصيد الصافي الحالي</span>
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
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs font-semibold text-emerald-800">
            {netFundBalance >= 0 ? '✓ الميزانية متوازنة وإيجابية' : '⚠️ عجز مؤقت في الصندوق'}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-t-2xl border-t border-r border-l gap-6">
        <button
          onClick={() => setActiveTab('expenses')}
          className={`py-3.5 font-bold text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'expenses'
              ? 'border-rose-600 text-rose-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <TrendingDown className="w-4 h-4" />
          <span>سجل المصاريف والنفقات ({expenses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('incomes')}
          className={`py-3.5 font-bold text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'incomes'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>سجل التبرعات والمداخيل الإضافية ({incomes.length})</span>
        </button>
      </div>

      {/* 1. Expenses Table */}
      {activeTab === 'expenses' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {expenses.length === 0 ? (
            <div className="p-12 text-center text-slate-500">لا توجد مصاريف مسجلة بعد</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-sm">
                <thead>
                  <tr className="bg-rose-900 text-white text-xs font-bold">
                    <th className="p-3.5">البيان</th>
                    <th className="p-3.5">التصنيف</th>
                    <th className="p-3.5">المبلغ</th>
                    <th className="p-3.5">التاريخ</th>
                    <th className="p-3.5">الجهة / المستفيد</th>
                    <th className="p-3.5">رقم الوصل</th>
                    <th className="p-3.5 text-center">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900">{exp.title}</td>
                      <td className="p-3.5 text-xs text-slate-700 font-medium">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[11px] font-bold">
                          {expenseCategoryLabels[exp.category] || exp.category}
                        </span>
                      </td>
                      <td className="p-3.5 font-black text-rose-600">
                        {exp.amount.toLocaleString()} {settings.currency}
                      </td>
                      <td className="p-3.5 text-xs text-slate-600">{exp.date}</td>
                      <td className="p-3.5 text-xs text-slate-700">{exp.paidTo || '-'}</td>
                      <td className="p-3.5 text-xs font-mono text-slate-500">{exp.receiptNumber || '-'}</td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => {
                            if (confirm('هل أنت متأكد من حذف هذا المصروف؟')) {
                              onDeleteExpense(exp.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 2. Incomes Table */}
      {activeTab === 'incomes' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {incomes.length === 0 ? (
            <div className="p-12 text-center text-slate-500">لا توجد تبرعات إضافية مسجلة بعد</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-sm">
                <thead>
                  <tr className="bg-emerald-800 text-white text-xs font-bold">
                    <th className="p-3.5">البيان</th>
                    <th className="p-3.5">التصنيف</th>
                    <th className="p-3.5">المبلغ</th>
                    <th className="p-3.5">التاريخ</th>
                    <th className="p-3.5">المتبرع / المصدر</th>
                    <th className="p-3.5">رقم الوصل</th>
                    <th className="p-3.5 text-center">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {incomes.map((inc) => (
                    <tr key={inc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900">{inc.title}</td>
                      <td className="p-3.5 text-xs text-slate-700 font-medium">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                          {incomeCategoryLabels[inc.category] || inc.category}
                        </span>
                      </td>
                      <td className="p-3.5 font-black text-emerald-700">
                        {inc.amount.toLocaleString()} {settings.currency}
                      </td>
                      <td className="p-3.5 text-xs text-slate-600">{inc.date}</td>
                      <td className="p-3.5 text-xs text-slate-700">{inc.receivedFrom || 'فاعل خير'}</td>
                      <td className="p-3.5 text-xs font-mono text-slate-500">{inc.receiptNumber || '-'}</td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => {
                            if (confirm('هل أنت متأكد من حذف هذا المدخول؟')) {
                              onDeleteIncome(inc.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-rose-600" />
                <span>تسجيل مصروف جديد</span>
              </h3>
              <button
                onClick={() => setIsExpenseModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExpenseSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  بيان المصروف <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  placeholder="مثال: شراء مصاحف التجويد وكتب القاعدة النورانية"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-rose-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">تصنيف المصروف</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value as ExpenseCategory)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-rose-600"
                >
                  {Object.entries(expenseCategoryLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    المبلغ ({settings.currency}) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={expAmount}
                    onChange={(e) => setExpAmount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-rose-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">التاريخ</label>
                  <input
                    type="date"
                    required
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-rose-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الجهة المدفوع لها / المستفيد</label>
                <input
                  type="text"
                  value={expPaidTo}
                  onChange={(e) => setExpPaidTo(e.target.value)}
                  placeholder="اسم المحل أو المعلم"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-rose-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رقم الوصل أو الفاتورة</label>
                <input
                  type="text"
                  value={expReceipt}
                  onChange={(e) => setExpReceipt(e.target.value)}
                  placeholder="DEP-2026-001"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-rose-600"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold shadow-md cursor-pointer"
                >
                  تسجيل المصروف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Income Modal */}
      {isIncomeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-700" />
                <span>تسجيل مدخول / تبرع جديد</span>
              </h3>
              <button
                onClick={() => setIsIncomeModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleIncomeSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  البيان <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={incTitle}
                  onChange={(e) => setIncTitle(e.target.value)}
                  placeholder="مثال: تبرع كريم لخدمة القرآن الكريم"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">نوع المدخول</label>
                <select
                  value={incCategory}
                  onChange={(e) => setIncCategory(e.target.value as IncomeCategory)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-600"
                >
                  {Object.entries(incomeCategoryLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    المبلغ ({settings.currency}) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={incAmount}
                    onChange={(e) => setIncAmount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">التاريخ</label>
                  <input
                    type="date"
                    required
                    value={incDate}
                    onChange={(e) => setIncDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المتبرع / المصدر</label>
                <input
                  type="text"
                  value={incReceivedFrom}
                  onChange={(e) => setIncReceivedFrom(e.target.value)}
                  placeholder="اسم المحسن أو فاعل خير"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رقم الوصل</label>
                <input
                  type="text"
                  value={incReceipt}
                  onChange={(e) => setIncReceipt(e.target.value)}
                  placeholder="INC-2026-001"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsIncomeModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold shadow-md cursor-pointer"
                >
                  تسجيل المدخول
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
