import React from 'react';
import {
  Student,
  AnnualFee,
  MonthlyFee,
  AssociationSettings,
  Halaqah
} from '../types';
import { Printer, X, Send, CheckCircle2, ShieldCheck } from 'lucide-react';

interface ReceiptModalProps {
  receiptData: {
    type: 'annual' | 'monthly';
    record: AnnualFee | MonthlyFee;
    student: Student;
    halaqah?: Halaqah;
  } | null;
  settings: AssociationSettings;
  onClose: () => void;
  onSendWhatsApp: (phone: string, text: string) => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  receiptData,
  settings,
  onClose,
  onSendWhatsApp,
}) => {
  if (!receiptData) return null;

  const { type, record, student, halaqah } = receiptData;
  const isMonthly = type === 'monthly';
  const monthlyRec = isMonthly ? (record as MonthlyFee) : null;
  const annualRec = !isMonthly ? (record as AnnualFee) : null;

  const monthNamesArabic: Record<string, string> = {
    '01': 'يناير',
    '02': 'فبراير',
    '03': 'مارس',
    '04': 'أبريل',
    '05': 'مايو',
    '06': 'يونيو',
    '07': 'يوليو',
    '08': 'أغسطس',
    '09': 'سبتمبر',
    '10': 'أكتوبر',
    '11': 'نوفمبر',
    '12': 'ديسمبر',
  };

  const receiptNumber = record.receiptNumber || `REC-${record.year}-${record.id.slice(-4)}`;
  const description = isMonthly
    ? `اشتراك شهر ${monthNamesArabic[monthlyRec!.month] || monthlyRec!.month} لسنة ${monthlyRec!.year}`
    : `الواجب السنوي ورسوم التسجيل لسنة ${annualRec!.year}`;

  const phone = student.guardianPhone || student.phone;

  const handlePrint = () => {
    window.print();
  };

  const whatsappMessage = `وصل قبض رقم: ${receiptNumber}\n` +
    `جمعية: ${settings.assocName}\n` +
    `استلمنا من ولي التلميذ: ${student.fullName}\n` +
    `مبلغ وقدره: ${record.amount} ${settings.currency}\n` +
    `البيان: ${description}\n` +
    `بتاريخ: ${record.date}\n` +
    `بارك الله فيكم وجزاكم خيراً.`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-6 relative">
        {/* Actions header (hidden when printing) */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 print:hidden">
          <h3 className="text-base font-bold text-slate-800">معاينة وصل القبض الرسمي</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* The Official Printable Receipt */}
        <div className="mt-4 p-6 rounded-2xl border-2 border-dashed border-emerald-800/40 bg-emerald-50/10">
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-emerald-900 pb-4">
            <div>
              <h2 className="font-black text-emerald-950 text-lg leading-tight">{settings.assocName}</h2>
              <p className="text-xs text-slate-600 font-serif mt-0.5">لتحفيظ القرآن الكريم والتربية الإسلامية</p>
              {settings.address && <p className="text-[10px] text-slate-500">{settings.address}</p>}
            </div>

            <div className="text-left">
              <div className="inline-block px-3 py-1 bg-emerald-900 text-white font-mono font-bold text-xs rounded-lg">
                وصل قبض رقم: {receiptNumber}
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-1">التاريخ: {record.date}</div>
            </div>
          </div>

          {/* Receipt Body */}
          <div className="my-5 space-y-3 text-xs text-slate-800">
            <div className="flex items-baseline gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-500 shrink-0">اسم التلميذ:</span>
              <span className="font-black text-base text-slate-900">{student.fullName}</span>
              {student.regNumber && (
                <span className="font-mono text-[11px] text-slate-500 mr-auto">
                  (رقم: {student.regNumber})
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500 font-medium">الحلقة القرآنية:</span>{' '}
                <strong className="text-slate-900">{halaqah?.name || 'عامة'}</strong>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500 font-medium">الولي / المستلم منه:</span>{' '}
                <strong className="text-slate-900">{student.guardianName || student.fullName}</strong>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-900">البيان والغرض:</span>
                  <div className="font-black text-sm text-emerald-950 mt-0.5">{description}</div>
                </div>
                <div className="text-left">
                  <span className="text-[10px] text-slate-500 font-bold">المبلغ المسدد</span>
                  <div className="text-2xl font-black text-emerald-800">
                    {record.amount} <span className="text-xs">{settings.currency}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>طريقة الدفع: <strong>{record.paymentMethod || 'نقدي'}</strong></span>
              {record.notes && <span>ملاحظات: {record.notes}</span>}
            </div>
          </div>

          {/* Stamp & Signature Footer */}
          <div className="pt-4 border-t border-slate-200 grid grid-cols-2 text-center text-xs">
            <div>
              <p className="text-slate-500 font-bold mb-8">توقيع المستلم (أمين الصندوق)</p>
              <span className="text-[10px] text-slate-400 font-mono">تم السداد والقبض</span>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-slate-500 font-bold mb-2">خاتم الجمعية</p>
              <div className="w-14 h-14 rounded-full border-2 border-emerald-700/60 flex items-center justify-center text-[10px] font-black text-emerald-800 rotate-[-12deg]">
                ختم الإدارة
              </div>
            </div>
          </div>
        </div>

        {/* Modal Buttons (hidden on print) */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            {phone && (
              <button
                onClick={() => onSendWhatsApp(phone, whatsappMessage)}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>إرسال الوصل للواتساب</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-bold shadow-md cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الوصل</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
