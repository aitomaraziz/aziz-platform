import { AppDatabase, AssociationSettings, Student, Halaqah, AnnualFee, MonthlyFee, RecitationRecord, AttendanceRecord, ExpenseRecord, IncomeRecord } from '../types';

const DB_KEY = 'quran_association_database_v2';
const IDB_NAME = 'QuranAssociationLocalDB';
const IDB_STORE = 'app_state';

// الإعدادات الافتراضية
export const DEFAULT_SETTINGS: AssociationSettings = {
  assocName: 'جمعية الفرقان لتحفيظ القرآن الكريم وتدريس علومه',
  subtitle: 'فرع دار القرآن والحديث - تأسست سنة 2018',
  assocAddress: 'حي النور، شارع الإمام مالك، الجزائر',
  assocPhone: '0555 12 34 56',
  assocEmail: 'contact@forqan-quran.org',
  currency: 'د.ج',
  annualFeeDefault: 1200,
  monthlyFeeDefault: 300,
  presidentName: 'الشيخ عبد الرحمن بن يحيى',
  treasurerName: 'الأستاذ فاروق العمري',
  whatsappTemplateReceipt: 'السلام عليكم ورحمة الله، نشعركم باستلام واجب التسجيل للتلميذ {student_name} بمبلغ {amount} {currency}، وصل رقم {receipt_no}. بارك الله فيكم وتقبل منا ومنكم.',
  whatsappTemplateReminder: 'السلام عليكم ورحمة الله، نذكركم بلطف بوجوب تسوية الواجب الشهري للتلميذ {student_name} لشهر {month}/{year}. شاكرين حسن تعاونكم.',
  whatsappTemplateProgress: 'بشرى طيبة! أتم التلميذ {student_name} اليوم تسميع {surah_name} (الآيات {from_ayah} إلى {to_ayah}) بتقييم: {grade}. بارك الله فيه ووفقه.',
  autoBackupToLocalFolder: false,
};

// بيانات أولية واقعية للبدء المباشر
export const INITIAL_DATABASE: AppDatabase = {
  version: 2,
  lastUpdated: new Date().toISOString(),
  settings: DEFAULT_SETTINGS,
  halaqat: [
    {
      id: 'H1',
      name: 'حلقة الإمام نافع (كبار - إتقان)',
      teacherName: 'الشيخ عبد الله الجزائري',
      teacherPhone: '0661 22 33 44',
      scheduleDescription: 'السبت والإثنين والأربعاء (بعد صلاة العصر)',
      genderTarget: 'ذكور',
      targetLevel: 'متقدم / حفظ الأجزاء',
      notes: 'رواية ورش عن نافع من طريق الأزرق'
    },
    {
      id: 'H2',
      name: 'حلقة الفتيان البراعم (مبتدئين)',
      teacherName: 'الأستاذ طه بن عيسى',
      teacherPhone: '0550 99 88 77',
      scheduleDescription: 'أيام الثلاثاء والخميس والسبت صباحاً',
      genderTarget: 'ذكور',
      targetLevel: 'جزء عم وجزء تبارك',
      notes: 'التركيز على مخارج الحروف والترتيل والتلقين'
    },
    {
      id: 'H3',
      name: 'حلقة الزهراوان (فتيات ونساء)',
      teacherName: 'المؤطرة أم أيمن الخنساء',
      teacherPhone: '0770 11 22 33',
      scheduleDescription: 'الأحد والأربعاء بعد الظهر',
      genderTarget: 'إناث',
      targetLevel: 'حفظ وتثبيت',
      notes: 'دروس التجويد العملي والنظري'
    },
    {
      id: 'H4',
      name: 'حلقة براعم النور (التمهيدي والتحضيري)',
      teacherName: 'المعلمة فاطمة الزهراء',
      teacherPhone: '0558 44 55 66',
      scheduleDescription: 'السبت والجمعة صباحاً',
      genderTarget: 'مختلط',
      targetLevel: 'قصار السور والقاعدة النورانية',
      notes: 'تلقين وتحسين النطق وحفظ السور القصيرة'
    }
  ],
  students: [
    {
      id: 'S101',
      fullName: 'ياسين أحمد بن عيسى',
      regNumber: '2026-001',
      birthDate: '2012-05-14',
      gender: 'ذكر',
      phone: '0551 22 33 44',
      guardianName: 'أحمد بن عيسى',
      guardianRelation: 'أب',
      guardianPhone: '0551 22 33 44',
      address: 'حي الزهور، عمارة 4',
      hizbProgress: 18,
      currentSurah: 'الكهف',
      halaqahId: 'H1',
      level: 'متوسط',
      regDate: '2026-01-05',
      exemptionStatus: 'عادي',
      notes: 'تلميذ مواظب ومتقن لأحكام المدود',
      createdAt: '2026-01-05T09:00:00.000Z',
      updatedAt: '2026-08-20T10:00:00.000Z'
    },
    {
      id: 'S102',
      fullName: 'محمد إبراهيم الزبيري',
      regNumber: '2026-002',
      birthDate: '2014-08-22',
      gender: 'ذكر',
      phone: '0662 44 55 66',
      guardianName: 'إبراهيم الزبيري',
      guardianRelation: 'أب',
      guardianPhone: '0662 44 55 66',
      address: 'حي المجاهدين رقم 12',
      hizbProgress: 6,
      currentSurah: 'الملك',
      halaqahId: 'H2',
      level: 'مبتدئ',
      regDate: '2026-01-10',
      exemptionStatus: 'عادي',
      notes: 'صوت جميل وحفظ سريع',
      createdAt: '2026-01-10T10:00:00.000Z',
      updatedAt: '2026-08-22T11:00:00.000Z'
    },
    {
      id: 'S103',
      fullName: 'مريم يوسف القادري',
      regNumber: '2026-003',
      birthDate: '2011-03-10',
      gender: 'أنثى',
      phone: '0773 88 99 00',
      guardianName: 'يوسف القادري',
      guardianRelation: 'أب',
      guardianPhone: '0773 88 99 00',
      address: 'حي الأمل شارع الاستقلال',
      hizbProgress: 32,
      currentSurah: 'الإسراء',
      halaqahId: 'H3',
      level: 'متقدم',
      regDate: '2026-01-12',
      exemptionStatus: 'عادي',
      notes: 'تستعد لاختبار ختم نصف القرآن الكريم',
      createdAt: '2026-01-12T14:00:00.000Z',
      updatedAt: '2026-08-25T16:00:00.000Z'
    },
    {
      id: 'S104',
      fullName: 'عبد الرحمن طارق التلمساني',
      regNumber: '2026-004',
      birthDate: '2015-11-02',
      gender: 'ذكر',
      phone: '0559 11 22 33',
      guardianName: 'أمينة بن صالح',
      guardianRelation: 'أم (يتيم الأب)',
      guardianPhone: '0559 11 22 33',
      address: 'حي السلام قرب المسجد العتيق',
      hizbProgress: 4,
      currentSurah: 'النبأ',
      halaqahId: 'H2',
      level: 'براعم',
      regDate: '2026-02-01',
      exemptionStatus: 'معفى_كلي',
      notes: 'إعفاء كلي من الرسوم (يتيم مكفول)',
      createdAt: '2026-02-01T08:30:00.000Z',
      updatedAt: '2026-08-15T09:00:00.000Z'
    },
    {
      id: 'S105',
      fullName: 'خديجة مصطفى العباسي',
      regNumber: '2026-005',
      birthDate: '2013-07-19',
      gender: 'أنثى',
      phone: '0665 77 88 99',
      guardianName: 'مصطفى العباسي',
      guardianRelation: 'أب',
      guardianPhone: '0665 77 88 99',
      address: 'شارع أول نوفمبر، عمارة ب',
      hizbProgress: 14,
      currentSurah: 'مريم',
      halaqahId: 'H3',
      level: 'متوسط',
      regDate: '2026-02-05',
      exemptionStatus: 'معفى_جزئي',
      notes: 'خصم الأخوة (أخت التلميذ أنس العباسي)',
      createdAt: '2026-02-05T10:00:00.000Z',
      updatedAt: '2026-08-18T10:30:00.000Z'
    },
    {
      id: 'S106',
      fullName: 'أنس مصطفى العباسي',
      regNumber: '2026-006',
      birthDate: '2016-09-30',
      gender: 'ذكر',
      phone: '0665 77 88 99',
      guardianName: 'مصطفى العباسي',
      guardianRelation: 'أب',
      guardianPhone: '0665 77 88 99',
      address: 'شارع أول نوفمبر، عمارة ب',
      hizbProgress: 2,
      currentSurah: 'الأعلى',
      halaqahId: 'H4',
      level: 'تمهيدي',
      regDate: '2026-02-05',
      exemptionStatus: 'معفى_جزئي',
      notes: 'خصم الأخوة 50%',
      createdAt: '2026-02-05T10:15:00.000Z',
      updatedAt: '2026-08-18T11:00:00.000Z'
    }
  ],
  annualFees: [
    { id: 'AF1', studentId: 'S101', year: 2026, amount: 1200, date: '2026-01-05', receiptNumber: 'REC-2026-001', paymentMethod: 'نقدي', notes: 'سداد كامل', createdAt: '2026-01-05T09:10:00.000Z' },
    { id: 'AF2', studentId: 'S102', year: 2026, amount: 1200, date: '2026-01-10', receiptNumber: 'REC-2026-002', paymentMethod: 'نقدي', notes: 'سداد كامل', createdAt: '2026-01-10T10:10:00.000Z' },
    { id: 'AF3', studentId: 'S103', year: 2026, amount: 1200, date: '2026-01-12', receiptNumber: 'REC-2026-003', paymentMethod: 'نقدي', notes: 'سداد سنوي', createdAt: '2026-01-12T14:15:00.000Z' },
    { id: 'AF5', studentId: 'S105', year: 2026, amount: 600, date: '2026-02-05', receiptNumber: 'REC-2026-004', paymentMethod: 'نقدي', notes: 'إعفاء جزئي 50%', createdAt: '2026-02-05T10:05:00.000Z' },
    { id: 'AF6', studentId: 'S106', year: 2026, amount: 600, date: '2026-02-05', receiptNumber: 'REC-2026-005', paymentMethod: 'نقدي', notes: 'إعفاء جزئي 50%', createdAt: '2026-02-05T10:20:00.000Z' }
  ],
  monthlyFees: [
    // ياسين S101
    { id: 'MF101_1', studentId: 'S101', month: '01', year: 2026, amount: 300, date: '2026-01-05', receiptNumber: 'MF-26-01', paymentMethod: 'نقدي', createdAt: '2026-01-05T09:15:00.000Z' },
    { id: 'MF101_2', studentId: 'S101', month: '02', year: 2026, amount: 300, date: '2026-02-04', receiptNumber: 'MF-26-15', paymentMethod: 'نقدي', createdAt: '2026-02-04T09:00:00.000Z' },
    { id: 'MF101_3', studentId: 'S101', month: '03', year: 2026, amount: 300, date: '2026-03-02', receiptNumber: 'MF-26-30', paymentMethod: 'نقدي', createdAt: '2026-03-02T09:00:00.000Z' },
    { id: 'MF101_4', studentId: 'S101', month: '04', year: 2026, amount: 300, date: '2026-04-05', receiptNumber: 'MF-26-45', paymentMethod: 'نقدي', createdAt: '2026-04-05T09:00:00.000Z' },
    { id: 'MF101_5', studentId: 'S101', month: '05', year: 2026, amount: 300, date: '2026-05-04', receiptNumber: 'MF-26-60', paymentMethod: 'نقدي', createdAt: '2026-05-04T09:00:00.000Z' },
    { id: 'MF101_6', studentId: 'S101', month: '06', year: 2026, amount: 300, date: '2026-06-03', receiptNumber: 'MF-26-75', paymentMethod: 'نقدي', createdAt: '2026-06-03T09:00:00.000Z' },
    { id: 'MF101_7', studentId: 'S101', month: '07', year: 2026, amount: 300, date: '2026-07-02', receiptNumber: 'MF-26-90', paymentMethod: 'نقدي', createdAt: '2026-07-02T09:00:00.000Z' },
    { id: 'MF101_8', studentId: 'S101', month: '08', year: 2026, amount: 300, date: '2026-08-03', receiptNumber: 'MF-26-105', paymentMethod: 'نقدي', createdAt: '2026-08-03T09:00:00.000Z' },
    // محمد S102
    { id: 'MF102_1', studentId: 'S102', month: '01', year: 2026, amount: 300, date: '2026-01-10', receiptNumber: 'MF-26-02', paymentMethod: 'نقدي', createdAt: '2026-01-10T10:15:00.000Z' },
    { id: 'MF102_2', studentId: 'S102', month: '02', year: 2026, amount: 300, date: '2026-02-08', receiptNumber: 'MF-26-18', paymentMethod: 'نقدي', createdAt: '2026-02-08T10:00:00.000Z' },
    { id: 'MF102_3', studentId: 'S102', month: '03', year: 2026, amount: 300, date: '2026-03-05', receiptNumber: 'MF-26-32', paymentMethod: 'نقدي', createdAt: '2026-03-05T10:00:00.000Z' },
    { id: 'MF102_4', studentId: 'S102', month: '04', year: 2026, amount: 300, date: '2026-04-09', receiptNumber: 'MF-26-48', paymentMethod: 'نقدي', createdAt: '2026-04-09T10:00:00.000Z' },
    { id: 'MF102_5', studentId: 'S102', month: '05', year: 2026, amount: 300, date: '2026-05-11', receiptNumber: 'MF-26-63', paymentMethod: 'نقدي', createdAt: '2026-05-11T10:00:00.000Z' },
    { id: 'MF102_6', studentId: 'S102', month: '06', year: 2026, amount: 300, date: '2026-06-08', receiptNumber: 'MF-26-78', paymentMethod: 'نقدي', createdAt: '2026-06-08T10:00:00.000Z' },
    { id: 'MF102_7', studentId: 'S102', month: '07', year: 2026, amount: 300, date: '2026-07-07', receiptNumber: 'MF-26-92', paymentMethod: 'نقدي', createdAt: '2026-07-07T10:00:00.000Z' },
    // مريم S103
    { id: 'MF103_1', studentId: 'S103', month: '01', year: 2026, amount: 300, date: '2026-01-12', receiptNumber: 'MF-26-05', paymentMethod: 'نقدي', createdAt: '2026-01-12T14:20:00.000Z' },
    { id: 'MF103_2', studentId: 'S103', month: '02', year: 2026, amount: 300, date: '2026-02-10', receiptNumber: 'MF-26-20', paymentMethod: 'نقدي', createdAt: '2026-02-10T14:00:00.000Z' },
    { id: 'MF103_3', studentId: 'S103', month: '03', year: 2026, amount: 300, date: '2026-03-08', receiptNumber: 'MF-26-35', paymentMethod: 'نقدي', createdAt: '2026-03-08T14:00:00.000Z' },
    { id: 'MF103_4', studentId: 'S103', month: '04', year: 2026, amount: 300, date: '2026-04-12', receiptNumber: 'MF-26-50', paymentMethod: 'نقدي', createdAt: '2026-04-12T14:00:00.000Z' },
    { id: 'MF103_5', studentId: 'S103', month: '05', year: 2026, amount: 300, date: '2026-05-10', receiptNumber: 'MF-26-65', paymentMethod: 'نقدي', createdAt: '2026-05-10T14:00:00.000Z' },
    { id: 'MF103_6', studentId: 'S103', month: '06', year: 2026, amount: 300, date: '2026-06-11', receiptNumber: 'MF-26-80', paymentMethod: 'نقدي', createdAt: '2026-06-11T14:00:00.000Z' },
    { id: 'MF103_7', studentId: 'S103', month: '07', year: 2026, amount: 300, date: '2026-07-10', receiptNumber: 'MF-26-95', paymentMethod: 'نقدي', createdAt: '2026-07-10T14:00:00.000Z' },
    { id: 'MF103_8', studentId: 'S103', month: '08', year: 2026, amount: 300, date: '2026-08-10', receiptNumber: 'MF-26-110', paymentMethod: 'نقدي', createdAt: '2026-08-10T14:00:00.000Z' }
  ],
  recitations: [
    {
      id: 'REC1',
      studentId: 'S101',
      date: '2026-08-25',
      type: 'حفظ_جديد',
      surahName: 'الكهف',
      fromAyah: 1,
      toAyah: 20,
      grade: 5,
      tajweedNotes: 'مخارج ممتازة مع ضبط المدود المتصلة والمنفصلة',
      generalNotes: 'ما شاء الله تبارك الله، أداء رائع',
      teacherName: 'الشيخ عبد الله الجزائري',
      createdAt: '2026-08-25T16:30:00.000Z'
    },
    {
      id: 'REC2',
      studentId: 'S102',
      date: '2026-08-25',
      type: 'حفظ_جديد',
      surahName: 'الملك',
      fromAyah: 1,
      toAyah: 15,
      grade: 4,
      tajweedNotes: 'الانتباه إلى إخفاء النون الساكنة والتنوين',
      generalNotes: 'حفظ طيب يحتاج فقط لتثبيت الآية 11',
      teacherName: 'الأستاذ طه بن عيسى',
      createdAt: '2026-08-25T17:00:00.000Z'
    },
    {
      id: 'REC3',
      studentId: 'S103',
      date: '2026-08-26',
      type: 'مراجعة_كبرى',
      surahName: 'الإسراء',
      fromAyah: 1,
      toAyah: 50,
      grade: 5,
      tajweedNotes: 'إتقان تام للوقف والابتداء',
      generalNotes: 'مستعدة تماماً لاختبار الحزب',
      teacherName: 'المؤطرة أم أيمن',
      createdAt: '2026-08-26T15:00:00.000Z'
    }
  ],
  attendance: [
    { id: 'ATT1', studentId: 'S101', halaqahId: 'H1', date: '2026-08-25', status: 'حاضر', createdAt: '2026-08-25T16:00:00.000Z' },
    { id: 'ATT2', studentId: 'S102', halaqahId: 'H2', date: '2026-08-25', status: 'حاضر', createdAt: '2026-08-25T16:00:00.000Z' },
    { id: 'ATT3', studentId: 'S103', halaqahId: 'H3', date: '2026-08-26', status: 'حاضر', createdAt: '2026-08-26T14:30:00.000Z' },
    { id: 'ATT4', studentId: 'S104', halaqahId: 'H2', date: '2026-08-25', status: 'غائب_بعذر', notes: 'عذر مرضي خفيف', createdAt: '2026-08-25T16:00:00.000Z' }
  ],
  expenses: [
    { id: 'EXP1', title: 'مكافآت شهر جويلية للمشايخ والمؤطرين', category: 'مكافآت_مشايخ', amount: 15000, date: '2026-07-31', paidTo: 'مشايخ الحلقات (4)', receiptNumber: 'DEP-26-01', notes: 'مكافأة تقديرية للمشايخ', createdAt: '2026-07-31T18:00:00.000Z' },
    { id: 'EXP2', title: 'شراء مصاحف التجويد ودفاتر التسميع', category: 'تجهيزات_وكتب', amount: 4800, date: '2026-08-05', paidTo: 'مكتبة النور الإسلامية', receiptNumber: 'DEP-26-02', notes: '30 مصحف برواية ورش + 50 دفتر متابعة', createdAt: '2026-08-05T11:00:00.000Z' },
    { id: 'EXP3', title: 'جوائز تشجيعية لمسابقة الأوائل الصيفية', category: 'جوائز_مسابقات', amount: 6500, date: '2026-08-20', paidTo: 'محلات التكريم', receiptNumber: 'DEP-26-03', notes: 'دروع وكتب وهدايا تحفيزية', createdAt: '2026-08-20T17:00:00.000Z' }
  ],
  incomes: [
    { id: 'INC1', title: 'تبرع كريم من محسن لخدمة القرآن', category: 'تبرعات_محسنين', amount: 25000, date: '2026-08-01', receivedFrom: 'فاعل خير من سكان الحي', receiptNumber: 'INC-26-01', notes: 'تبرع لصالح صيانة قاعات التحفيظ والجوائز', createdAt: '2026-08-01T10:00:00.000Z' }
  ]
};

// ================= IndexedDB Helper =================
function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IDB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveToIndexedDB(data: AppDatabase): Promise<void> {
  try {
    const db = await openIndexedDB();
    const tx = db.transaction(IDB_STORE, 'readwrite');
    const store = tx.objectStore(IDB_STORE);
    store.put(data, 'main_database');
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('IndexedDB save failed, fallback to localStorage', err);
  }
}

export async function loadFromIndexedDB(): Promise<AppDatabase | null> {
  try {
    const db = await openIndexedDB();
    const tx = db.transaction(IDB_STORE, 'readonly');
    const store = tx.objectStore(IDB_STORE);
    const request = store.get('main_database');
    return new Promise((resolve) => {
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

// ================= File System Directory Linking =================
// للربط المباشر مع مجلد في الكمبيوتر
let activeDirectoryHandle: FileSystemDirectoryHandle | null = null;

export function hasFileSystemAccessSupport(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
}

export async function pickLocalDirectory(): Promise<{ success: boolean; dirName?: string; error?: string }> {
  if (!hasFileSystemAccessSupport()) {
    return { success: false, error: 'المتصفح لا يدعم الوصول المباشر للمجلدات. سيتم استخدام التخزين الداخلي والتحميل المباشر.' };
  }
  try {
    const handle = await (window as any).showDirectoryPicker({
      mode: 'readwrite',
      startIn: 'documents',
    });
    activeDirectoryHandle = handle;
    return { success: true, dirName: handle.name };
  } catch (e: any) {
    if (e.name === 'AbortError') {
      return { success: false, error: 'تم إلغاء اختيار المجلد' };
    }
    return { success: false, error: e.message || 'فشل اختيار المجلد' };
  }
}

export function getActiveDirectoryName(): string | null {
  return activeDirectoryHandle ? activeDirectoryHandle.name : null;
}

export async function syncToLinkedDirectory(data: AppDatabase): Promise<boolean> {
  if (!activeDirectoryHandle) return false;
  try {
    const fileHandle = await activeDirectoryHandle.getFileHandle('quran_association_data.json', { create: true });
    const writable = await (fileHandle as any).createWritable();
    await writable.write(JSON.stringify(data, null, 2));
    await writable.close();
    return true;
  } catch (e) {
    console.error('Error writing to linked directory:', e);
    return false;
  }
}

// ================= Main Database API =================
export async function loadDatabase(): Promise<AppDatabase> {
  // 1. Try IndexedDB first
  const idbData = await loadFromIndexedDB();
  if (idbData && idbData.students && idbData.version >= 2) {
    return idbData;
  }

  // 2. Try LocalStorage
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.students) {
        // Migration/save to IDB
        await saveToIndexedDB(parsed);
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading from localStorage:', e);
  }

  // 3. Fallback to Initial Database
  await saveDatabase(INITIAL_DATABASE);
  return INITIAL_DATABASE;
}

export async function saveDatabase(db: AppDatabase): Promise<void> {
  const updatedDb: AppDatabase = {
    ...db,
    lastUpdated: new Date().toISOString(),
  };

  // 1. LocalStorage
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(updatedDb));
  } catch (e) {
    console.warn('LocalStorage limit exceeded, saved in IndexedDB', e);
  }

  // 2. IndexedDB
  await saveToIndexedDB(updatedDb);

  // 3. Linked Directory (if selected)
  if (activeDirectoryHandle && updatedDb.settings.autoBackupToLocalFolder) {
    await syncToLinkedDirectory(updatedDb);
  }
}

// ================= Export & Import Utilities =================
export function exportDatabaseJSON(data: AppDatabase): void {
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `نسخة_احتياطية_جمعية_القرآن_${dateStr}.json`;
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportStudentsToCSV(students: Student[], halaqat: Halaqah[], settings: AssociationSettings): void {
  const headers = [
    'رقم التسجيل',
    'الاسم الكامل',
    'الجنس',
    'تاريخ الميلاد',
    'الهاتف',
    'اسم الولي',
    'صلة القرابة',
    'هاتف الولي',
    'الحلقة',
    'المستوى',
    'الأحزاب المحفوظة',
    'السورة الحالية',
    'حالة الإعفاء',
    'تاريخ التسجيل',
    'ملاحظات'
  ];

  const halaqatMap = new Map(halaqat.map(h => [h.id, h.name]));

  const rows = students.map(s => [
    `"${s.regNumber || ''}"`,
    `"${s.fullName || ''}"`,
    `"${s.gender || ''}"`,
    `"${s.birthDate || ''}"`,
    `"${s.phone || ''}"`,
    `"${s.guardianName || ''}"`,
    `"${s.guardianRelation || ''}"`,
    `"${s.guardianPhone || ''}"`,
    `"${s.halaqahId ? halaqatMap.get(s.halaqahId) || '' : ''}"`,
    `"${s.level || ''}"`,
    `"${s.hizbProgress || 0}"`,
    `"${s.currentSurah || ''}"`,
    `"${s.exemptionStatus || 'عادي'}"`,
    `"${s.regDate || ''}"`,
    `"${(s.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `قائمة_التلاميذ_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportFinancialStatementCSV(
  annualFees: AnnualFee[],
  monthlyFees: MonthlyFee[],
  expenses: ExpenseRecord[],
  incomes: IncomeRecord[],
  students: Student[],
  settings: AssociationSettings
): void {
  const studentMap = new Map(students.map(s => [s.id, s.fullName]));

  const headers = ['النوع', 'رقم الوصل', 'التاريخ', 'البيان / التلميذ / المستفيد', 'التصنيف / الشهر / السنة', 'المبلغ (' + settings.currency + ')', 'طريقة الدفع'];
  
  const rows: string[][] = [];

  // Annual
  annualFees.forEach(a => {
    rows.push([
      '"واجب سنوي"',
      `"${a.receiptNumber || '-'}"`,
      `"${a.date}"`,
      `"${studentMap.get(a.studentId) || 'تلميذ'}"`,
      `"سنة ${a.year}"`,
      `"${a.amount}"`,
      `"${a.paymentMethod || 'نقدي'}"`
    ]);
  });

  // Monthly
  monthlyFees.forEach(m => {
    rows.push([
      '"اشتراك شهري"',
      `"${m.receiptNumber || '-'}"`,
      `"${m.date}"`,
      `"${studentMap.get(m.studentId) || 'تلميذ'}"`,
      `"شهر ${m.month}/${m.year}"`,
      `"${m.amount}"`,
      `"${m.paymentMethod || 'نقدي'}"`
    ]);
  });

  // Other Incomes
  incomes.forEach(i => {
    rows.push([
      '"مدخول إضافي"',
      `"${i.receiptNumber || '-'}"`,
      `"${i.date}"`,
      `"${i.title} (${i.receivedFrom || 'فاعل خير'})"`,
      `"${i.category}"`,
      `"${i.amount}"`,
      '"نقدي"'
    ]);
  });

  // Expenses
  expenses.forEach(e => {
    rows.push([
      '"مصروف"',
      `"${e.receiptNumber || '-'}"`,
      `"${e.date}"`,
      `"${e.title} (${e.paidTo || '-'})"`,
      `"${e.category}"`,
      `"-${e.amount}"`,
      '"نقدي"'
    ]);
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `كشف_العمليات_المالية_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// حساب حجم التخزين المستهلك
export function getStorageUsage(): { bytes: number; formatted: string; count: number } {
  try {
    const raw = localStorage.getItem(DB_KEY) || '';
    const bytes = new Blob([raw]).size;
    let formatted = `${(bytes / 1024).toFixed(1)} كيلوبايت`;
    if (bytes > 1024 * 1024) {
      formatted = `${(bytes / (1024 * 1024)).toFixed(2)} ميجابايت`;
    }
    return { bytes, formatted, count: raw ? 1 : 0 };
  } catch {
    return { bytes: 0, formatted: '0 كيلوبايت', count: 0 };
  }
}

export function getLocalFolderInfo(): { connected: boolean; name: string } {
  const name = getActiveDirectoryName();
  return {
    connected: !!name,
    name: name || 'غير متصل',
  };
}

export async function disconnectLocalDirectory(): Promise<void> {
  activeDirectoryHandle = null;
}

export const exportDatabaseAsJSON = exportDatabaseJSON;

export function importDatabaseFromJSON(file: File): Promise<AppDatabase> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        if (!parsed.students || !parsed.settings) {
          throw new Error('الملف غير صالح أو لا يحتوي على بنية بيانات الجمعية الصحيحة.');
        }
        await saveDatabase(parsed);
        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('فشل قراءة الملف من القرص'));
    reader.readAsText(file);
  });
}

export function generateSeedDatabase(): AppDatabase {
  return JSON.parse(JSON.stringify(INITIAL_DATABASE));
}

export async function clearAllDatabase(): Promise<void> {
  localStorage.removeItem(DB_KEY);
  try {
    const db = await openIndexedDB();
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).clear();
  } catch (e) {
    console.error('Error clearing indexedDB', e);
  }
}

