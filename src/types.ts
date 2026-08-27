export type Gender = 'ذكر' | 'أنثى';

export type ExemptionStatus = 'عادي' | 'معفى_كلي' | 'معفى_جزئي'; // جزئي = 50%

export type RecitationType = 'حفظ_جديد' | 'مراجعة_قريبة' | 'مراجعة_كبرى' | 'اختبار_حزب' | 'تلقين';

export type EvaluationGrade = 5 | 4 | 3 | 2 | 1; // 5: ممتاز, 4: جيد جدا, 3: جيد, 2: مقبول, 1: يحتاج إعادة

export type AttendanceStatus = 'حاضر' | 'غائب' | 'غائب_بعذر' | 'متأخر';

export type ExpenseCategory = 'مكافآت_مشايخ' | 'جوائز_مسابقات' | 'تجهيزات_وكتب' | 'فواتير_وصيانة' | 'إطعام_وضيافة' | 'أنشطة_ورحلات' | 'أخرى';

export type IncomeCategory = 'اشتراكات_شهرية' | 'اشتراكات_سنوية' | 'تبرعات_محسنين' | 'أوقاف' | 'دعم_رسمي' | 'أخرى';

export interface Student {
  id: string;
  fullName: string;
  regNumber: string; // e.g. "2026-001"
  birthDate?: string;
  gender: Gender;
  phone?: string;
  guardianName?: string;
  guardianRelation?: string; // أب, أم, ولي أمر, إلخ
  guardianPhone?: string;
  address?: string;
  hizbProgress?: number; // عدد الأحزاب المحفوظة حاليا (من 0 إلى 60)
  currentSurah?: string; // السورة الحالية
  halaqahId?: string; // معرّف الحلقة
  level?: string; // تمهيدي، مبتدئ، متوسط، خاتم، إلخ
  regDate: string; // YYYY-MM-DD
  exemptionStatus: ExemptionStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Halaqah {
  id: string;
  name: string; // e.g. "حلقة الإمام نافع"
  teacherName: string; // اسم الشيخ / المعلم
  teacherPhone?: string;
  scheduleDescription?: string; // e.g. "السبت والأربعاء بعد العصر"
  genderTarget: 'ذكور' | 'إناث' | 'مختلط';
  targetLevel?: string;
  notes?: string;
}

export interface AnnualFee {
  id: string;
  studentId: string;
  year: number;
  amount: number;
  date: string; // YYYY-MM-DD
  receiptNumber?: string;
  paymentMethod: 'نقدي' | 'تحويل_بنكي' | 'شيك' | 'أخرى';
  notes?: string;
  createdAt: string;
}

export interface MonthlyFee {
  id: string;
  studentId: string;
  month: string; // "01" to "12"
  year: number;
  amount: number;
  date: string; // YYYY-MM-DD
  receiptNumber?: string;
  paymentMethod: 'نقدي' | 'تحويل_بنكي' | 'شيك' | 'أخرى';
  notes?: string;
  createdAt: string;
}

export interface RecitationRecord {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  type: RecitationType;
  surahName: string;
  fromAyah: number;
  toAyah: number;
  grade: EvaluationGrade;
  tajweedNotes?: string;
  generalNotes?: string;
  teacherName?: string;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  halaqahId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  notes?: string;
  createdAt: string;
}

export interface ExpenseRecord {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string; // YYYY-MM-DD
  paidTo?: string; // الجهة أو المستفيد
  receiptNumber?: string;
  notes?: string;
  createdAt: string;
}

export interface IncomeRecord {
  id: string;
  title: string;
  category: IncomeCategory;
  amount: number;
  date: string; // YYYY-MM-DD
  receivedFrom?: string; // المتبرع أو الجهة
  receiptNumber?: string;
  notes?: string;
  createdAt: string;
}

export interface AssociationSettings {
  assocName: string;
  subtitle: string;
  assocAddress: string;
  assocPhone: string;
  assocEmail: string;
  address?: string;
  phone?: string;
  currency: string; // e.g. "د.ج" or "ر.س" or "د.م" or "$"
  annualFeeDefault: number;
  monthlyFeeDefault: number;
  presidentName: string;
  treasurerName: string;
  headerLogoUrl?: string;
  whatsappTemplateReceipt?: string;
  whatsappTemplateReminder?: string;
  whatsappTemplateProgress?: string;
  autoBackupToLocalFolder: boolean;
}

export interface AppDatabase {
  version: number;
  lastUpdated: string;
  settings: AssociationSettings;
  students: Student[];
  halaqat: Halaqah[];
  annualFees: AnnualFee[];
  monthlyFees: MonthlyFee[];
  recitations: RecitationRecord[];
  attendance: AttendanceRecord[];
  expenses: ExpenseRecord[];
  incomes: IncomeRecord[];
}

export type AssociationDatabase = AppDatabase;

export type ActiveTab = 
  | 'dashboard'
  | 'students'
  | 'halaqat'
  | 'quranTracker'
  | 'attendance'
  | 'finance'
  | 'fund'
  | 'receipts'
  | 'reports'
  | 'backupSettings';
