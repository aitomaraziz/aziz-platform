import React, { useState } from 'react';
import { RecitationRecord, Student, Halaqah, RecitationType, EvaluationGrade, AssociationSettings } from '../types';
import { SURAH_LIST, SurahInfo } from '../data/quranData';
import {
  BookMarked,
  Plus,
  Search,
  Star,
  Sparkles,
  Send,
  Trash2,
  Filter,
  CheckCircle2,
  Award,
  BookOpen,
  Calendar
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuranTrackerViewProps {
  recitations: RecitationRecord[];
  students: Student[];
  halaqat: Halaqah[];
  settings: AssociationSettings;
  onSaveRecitation: (recitation: RecitationRecord, shouldUpdateStudentHizb?: number) => void;
  onDeleteRecitation: (id: string) => void;
  onSendWhatsApp: (phone: string, text: string) => void;
  preselectedStudentId?: string;
}

export const QuranTrackerView: React.FC<QuranTrackerViewProps> = ({
  recitations,
  students,
  halaqat,
  settings,
  onSaveRecitation,
  onDeleteRecitation,
  onSendWhatsApp,
  preselectedStudentId,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(!!preselectedStudentId);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStudentId, setFilterStudentId] = useState<string>(preselectedStudentId || 'all');

  // Form states
  const [studentId, setStudentId] = useState<string>(preselectedStudentId || (students[0]?.id || ''));
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<RecitationType>('حفظ_جديد');
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(78); // النبأ by default
  const [fromAyah, setFromAyah] = useState<number>(1);
  const [toAyah, setToAyah] = useState<number>(10);
  const [grade, setGrade] = useState<EvaluationGrade>(5);
  const [tajweedNotes, setTajweedNotes] = useState('');
  const [generalNotes, setGeneralNotes] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [newHizbTotal, setNewHizbTotal] = useState<string>('');

  const selectedSurah = SURAH_LIST.find((s) => s.number === selectedSurahNumber) || SURAH_LIST[0];

  const handleSurahChange = (surahNum: number) => {
    setSelectedSurahNumber(surahNum);
    const s = SURAH_LIST.find((item) => item.number === surahNum);
    if (s) {
      setFromAyah(1);
      setToAyah(Math.min(s.numberOfAyahs, 15));
    }
  };

  const handleOpenModal = (stuId?: string) => {
    if (stuId) {
      setStudentId(stuId);
    }
    setDate(new Date().toISOString().split('T')[0]);
    setType('حفظ_جديد');
    setFromAyah(1);
    setToAyah(15);
    setGrade(5);
    setTajweedNotes('');
    setGeneralNotes('');
    setNewHizbTotal('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) return;

    const student = students.find((s) => s.id === studentId);
    const recData: RecitationRecord = {
      id: 'REC' + Date.now(),
      studentId,
      date,
      type,
      surahName: selectedSurah.name,
      fromAyah: Number(fromAyah),
      toAyah: Number(toAyah),
      grade,
      tajweedNotes: tajweedNotes.trim() || undefined,
      generalNotes: generalNotes.trim() || undefined,
      teacherName: teacherName.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    const updateHizb = newHizbTotal !== '' ? Number(newHizbTotal) : undefined;
    onSaveRecitation(recData, updateHizb);

    // Confetti celebration if 5 stars or new achievement!
    if (grade >= 4) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#059669', '#d97706', '#10b981', '#fbbf24'],
        });
      } catch (err) {
        // ignore if not supported
      }
    }

    setIsModalOpen(false);
  };

  const getStudent = (id: string) => students.find((s) => s.id === id);

  // Filtered recitations
  const filteredRecitations = recitations.filter((r) => {
    const s = getStudent(r.studentId);
    const matchSearch =
      !searchTerm ||
      (s && s.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      r.surahName.includes(searchTerm);

    const matchType = filterType === 'all' || r.type === filterType;
    const matchStudent = filterStudentId === 'all' || r.studentId === filterStudentId;

    return matchSearch && matchType && matchStudent;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <BookMarked className="w-6 h-6 text-emerald-700" />
            <span>دفتر التسميع وسجل الحفظ القرآني</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            تسجيل جلسات التسميع اليومية، تقييم أحكام التجويد، ومتابعة الحفظ الجديد والمراجعة
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-900/15 transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>تسجيل تسميع جديد</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="ابحث باسم التلميذ أو السورة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
          />
        </div>

        <div className="w-full md:w-56">
          <select
            value={filterStudentId}
            onChange={(e) => setFilterStudentId(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-600"
          >
            <option value="all">جميع التلاميذ ({students.length})</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.fullName}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-48">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-600"
          >
            <option value="all">جميع أنواع التسميع</option>
            <option value="حفظ_جديد">حفظ جديد</option>
            <option value="مراجعة_قريبة">مراجعة قريبة</option>
            <option value="مراجعة_كبرى">مراجعة كبرى</option>
            <option value="اختبار_حزب">اختبار حزب</option>
            <option value="تلقين">تلقين</option>
          </select>
        </div>
      </div>

      {/* Recitation Log Feed */}
      <div className="space-y-3">
        {filteredRecitations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <BookMarked className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">لا توجد جلسات تسميع مطابقة</h3>
            <p className="text-sm text-slate-500 mt-1">سجل أول جلسة تسميع لتلميذك عبر الزر أعلاه.</p>
          </div>
        ) : (
          filteredRecitations.map((rec) => {
            const student = getStudent(rec.studentId);
            const halaqah = halaqat.find((h) => h.id === student?.halaqahId);
            const guardianPhone = student?.guardianPhone || student?.phone;

            const gradeLabels: Record<EvaluationGrade, string> = {
              5: 'ممتاز ما شاء الله',
              4: 'جيد جداً',
              3: 'جيد',
              2: 'مقبول',
              1: 'يحتاج إعادة وتثبيت',
            };

            const whatsappText = (settings.whatsappTemplateProgress || '')
              .replace('{student_name}', student?.fullName || 'التلميذ')
              .replace('{surah_name}', `سورة ${rec.surahName}`)
              .replace('{from_ayah}', String(rec.fromAyah))
              .replace('{to_ayah}', String(rec.toAyah))
              .replace('{grade}', gradeLabels[rec.grade]);

            return (
              <div
                key={rec.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className="font-black text-slate-900 text-base">
                      {student?.fullName || 'تلميذ محذوف'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                      {rec.type.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {halaqah?.name || ''}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700">
                    <span className="font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      📖 سورة {rec.surahName} (الآيات من {rec.fromAyah} إلى {rec.toAyah})
                    </span>
                    <div className="flex items-center gap-1 text-amber-500 font-bold text-xs bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                      <span>التقييم:</span>
                      <div className="flex items-center">
                        {Array.from({ length: rec.grade }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="text-amber-800 mr-1">({gradeLabels[rec.grade]})</span>
                    </div>
                  </div>

                  {rec.tajweedNotes && (
                    <p className="text-xs text-slate-600">
                      <strong className="text-slate-800">أحكام التجويد:</strong> {rec.tajweedNotes}
                    </p>
                  )}
                  {rec.generalNotes && (
                    <p className="text-xs text-slate-500">
                      <strong className="text-slate-700">ملاحظات:</strong> {rec.generalNotes}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      التاريخ: {rec.date}
                    </span>
                    {rec.teacherName && <span>المؤطر: {rec.teacherName}</span>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  {guardianPhone && (
                    <button
                      onClick={() => onSendWhatsApp(guardianPhone, whatsappText)}
                      title="إرسال تقرير الإنجاز لواتساب الولي"
                      className="flex items-center gap-1.5 px-3 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>إشعار الولي</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (confirm('هل أنت متأكد من حذف جلسة التسميع هذه؟')) {
                        onDeleteRecitation(rec.id);
                      }
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                    title="حذف الجلسة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Recitation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BookMarked className="w-5 h-5 text-emerald-700" />
                <span>تسجيل جلسة تسميع وحفظ</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {/* Student */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  التلميذ <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-600"
                >
                  <option value="">-- اختر التلميذ --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.hizbProgress || 0} حزباً)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">التاريخ</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نوع التسميع</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as RecitationType)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-600"
                  >
                    <option value="حفظ_جديد">حفظ جديد</option>
                    <option value="مراجعة_قريبة">مراجعة قريبة</option>
                    <option value="مراجعة_كبرى">مراجعة كبرى</option>
                    <option value="اختبار_حزب">اختبار حزب</option>
                    <option value="تلقين">تلقين</option>
                  </select>
                </div>
              </div>

              {/* Surah Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">السورة القرآنية</label>
                <select
                  value={selectedSurahNumber}
                  onChange={(e) => handleSurahChange(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-emerald-900 focus:outline-none focus:border-emerald-600"
                >
                  {SURAH_LIST.map((s) => (
                    <option key={s.number} value={s.number}>
                      {s.number}. سورة {s.name} ({s.numberOfAyahs} آية - الحزب {s.startHizb})
                    </option>
                  ))}
                </select>
              </div>

              {/* Ayah Range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">من الآية</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedSurah.numberOfAyahs}
                    value={fromAyah}
                    onChange={(e) => setFromAyah(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    إلى الآية (حد أقصى {selectedSurah.numberOfAyahs})
                  </label>
                  <input
                    type="number"
                    min={fromAyah}
                    max={selectedSurah.numberOfAyahs}
                    value={toAyah}
                    onChange={(e) => setToAyah(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Grade / Stars */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  تقييم جودة الحفظ والإتقان
                </label>
                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                  {([5, 4, 3, 2, 1] as EvaluationGrade[]).map((starVal) => (
                    <button
                      type="button"
                      key={starVal}
                      onClick={() => setGrade(starVal)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        grade === starVal
                          ? 'bg-amber-400 text-slate-900 shadow-xs'
                          : 'bg-white text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {starVal === 5 && '⭐⭐⭐⭐⭐ ممتاز'}
                      {starVal === 4 && '⭐⭐⭐⭐ جيد جداً'}
                      {starVal === 3 && '⭐⭐⭐ جيد'}
                      {starVal === 2 && '⭐⭐ مقبول'}
                      {starVal === 1 && '⭐ يحتاج إعادة'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tajweed Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ملاحظات أحكام التجويد والترتيل
                </label>
                <input
                  type="text"
                  value={tajweedNotes}
                  onChange={(e) => setTajweedNotes(e.target.value)}
                  placeholder="مثال: الانتباه لمقدار المد المنفصل وإخفاء النون"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
                />
              </div>

              {/* Update Student's Total Hizb optionally */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <label className="block text-xs font-bold text-emerald-950 mb-1">
                  تحديث عدد الأحزاب الإجمالية للتلميذ (اختياري)
                </label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={newHizbTotal}
                  onChange={(e) => setNewHizbTotal(e.target.value)}
                  placeholder="اتركه فارغاً إذا لم يختم حزباً جديداً"
                  className="w-full px-3.5 py-2 bg-white border border-emerald-300 rounded-lg text-sm text-emerald-900 font-bold focus:outline-none"
                />
              </div>

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
                  حفظ جلسة التسميع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
