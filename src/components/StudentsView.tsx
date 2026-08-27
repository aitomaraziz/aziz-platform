import React, { useState, useMemo } from 'react';
import { Student, Halaqah, Gender, ExemptionStatus, AssociationSettings } from '../types';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Download,
  Upload,
  Printer,
  Edit2,
  Trash2,
  Eye,
  BookMarked,
  CreditCard,
  Send,
  Sparkles,
  Phone,
  Calendar,
  CheckCircle2,
  Shield,
  Layers,
  LayoutGrid,
  List
} from 'lucide-react';

interface StudentsViewProps {
  students: Student[];
  halaqat: Halaqah[];
  settings: AssociationSettings;
  onSaveStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onOpenProfile: (student: Student) => void;
  onOpenRecitationForStudent: (student: Student) => void;
  onOpenPaymentForStudent: (student: Student) => void;
  onExportCSV: () => void;
  onImportCSV: (file: File) => void;
  onSendWhatsApp: (phone: string, text: string) => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  students,
  halaqat,
  settings,
  onSaveStudent,
  onDeleteStudent,
  onOpenProfile,
  onOpenRecitationForStudent,
  onOpenPaymentForStudent,
  onExportCSV,
  onImportCSV,
  onSendWhatsApp,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHalaqah, setSelectedHalaqah] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [selectedExemption, setSelectedExemption] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<Gender>('ذكر');
  const [phone, setPhone] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianRelation, setGuardianRelation] = useState('أب');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [address, setAddress] = useState('');
  const [hizbProgress, setHizbProgress] = useState<number>(0);
  const [currentSurah, setCurrentSurah] = useState('');
  const [halaqahId, setHalaqahId] = useState('');
  const [level, setLevel] = useState('مبتدئ');
  const [regDate, setRegDate] = useState(new Date().toISOString().split('T')[0]);
  const [exemptionStatus, setExemptionStatus] = useState<ExemptionStatus>('عادي');
  const [notes, setNotes] = useState('');

  // Delete Confirmation State
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Open modal for new
  const handleOpenNew = () => {
    const nextSeq = students.length + 1;
    const yearStr = new Date().getFullYear();
    setEditingStudent(null);
    setFullName('');
    setRegNumber(`${yearStr}-${String(nextSeq).padStart(3, '0')}`);
    setBirthDate('');
    setGender('ذكر');
    setPhone('');
    setGuardianName('');
    setGuardianRelation('أب');
    setGuardianPhone('');
    setAddress('');
    setHizbProgress(0);
    setCurrentSurah('النبأ');
    setHalaqahId(halaqat[0]?.id || '');
    setLevel('مبتدئ');
    setRegDate(new Date().toISOString().split('T')[0]);
    setExemptionStatus('عادي');
    setNotes('');
    setIsModalOpen(true);
  };

  // Open modal for edit
  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFullName(student.fullName);
    setRegNumber(student.regNumber || '');
    setBirthDate(student.birthDate || '');
    setGender(student.gender);
    setPhone(student.phone || '');
    setGuardianName(student.guardianName || '');
    setGuardianRelation(student.guardianRelation || 'أب');
    setGuardianPhone(student.guardianPhone || '');
    setAddress(student.address || '');
    setHizbProgress(student.hizbProgress || 0);
    setCurrentSurah(student.currentSurah || '');
    setHalaqahId(student.halaqahId || '');
    setLevel(student.level || '');
    setRegDate(student.regDate || new Date().toISOString().split('T')[0]);
    setExemptionStatus(student.exemptionStatus || 'عادي');
    setNotes(student.notes || '');
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    const studentData: Student = {
      id: editingStudent ? editingStudent.id : 'S' + Date.now(),
      fullName: fullName.trim(),
      regNumber: regNumber.trim(),
      birthDate: birthDate || undefined,
      gender,
      phone: phone.trim() || undefined,
      guardianName: guardianName.trim() || undefined,
      guardianRelation: guardianRelation.trim() || undefined,
      guardianPhone: guardianPhone.trim() || undefined,
      address: address.trim() || undefined,
      hizbProgress: Number(hizbProgress) || 0,
      currentSurah: currentSurah.trim() || undefined,
      halaqahId: halaqahId || undefined,
      level: level.trim() || undefined,
      regDate: regDate || new Date().toISOString().split('T')[0],
      exemptionStatus,
      notes: notes.trim() || undefined,
      createdAt: editingStudent ? editingStudent.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveStudent(studentData);
    setIsModalOpen(false);
  };

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const q = searchTerm.toLowerCase();
      const matchQuery =
        !searchTerm ||
        s.fullName.toLowerCase().includes(q) ||
        (s.regNumber && s.regNumber.toLowerCase().includes(q)) ||
        (s.phone && s.phone.includes(q)) ||
        (s.guardianName && s.guardianName.toLowerCase().includes(q)) ||
        (s.guardianPhone && s.guardianPhone.includes(q));

      const matchHalaqah = selectedHalaqah === 'all' || s.halaqahId === selectedHalaqah;
      const matchGender = selectedGender === 'all' || s.gender === selectedGender;
      const matchExemption = selectedExemption === 'all' || s.exemptionStatus === selectedExemption;

      return matchQuery && matchHalaqah && matchGender && matchExemption;
    });
  }, [students, searchTerm, selectedHalaqah, selectedGender, selectedExemption]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportCSV(file);
      e.target.value = '';
    }
  };

  const getHalaqahName = (id?: string) => {
    return halaqat.find((h) => h.id === id)?.name || 'غير محددة';
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-700" />
            <span>سجل وإدارة التلاميذ</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            إجمالي التلاميذ المسجلين: <strong className="text-emerald-700 font-bold">{students.length}</strong> تلميذ
            (ذكور: {students.filter((s) => s.gender === 'ذكر').length} | إناث: {students.filter((s) => s.gender === 'أنثى').length})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleOpenNew}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-900/15 transition-all active:scale-95 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>تسجيل تلميذ جديد</span>
          </button>

          <button
            onClick={onExportCSV}
            title="تصدير بيانات التلاميذ إلى ملف Excel/CSV"
            className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            <span className="hidden sm:inline">تصدير CSV</span>
          </button>

          <label className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer">
            <Upload className="w-4 h-4 text-amber-600" />
            <span className="hidden sm:inline">استيراد CSV</span>
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={() => window.print()}
            title="طباعة كشف التلاميذ"
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ابحث بالاسم، رقم التسجيل، هاتف الولي..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15 transition-all"
            />
          </div>

          {/* Halaqah Filter */}
          <div className="w-full md:w-56">
            <select
              value={selectedHalaqah}
              onChange={(e) => setSelectedHalaqah(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-600 cursor-pointer"
            >
              <option value="all">جميع الحلقات ({halaqat.length})</option>
              {halaqat.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          {/* Gender Filter */}
          <div className="w-full md:w-36">
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-600 cursor-pointer"
            >
              <option value="all">الكل (الجنس)</option>
              <option value="ذكر">ذكور فقط</option>
              <option value="أنثى">إناث فقط</option>
            </select>
          </div>

          {/* Exemption Filter */}
          <div className="w-full md:w-40">
            <select
              value={selectedExemption}
              onChange={(e) => setSelectedExemption(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-600 cursor-pointer"
            >
              <option value="all">جميع الرسوم</option>
              <option value="عادي">رسوم عادية</option>
              <option value="معفى_جزئي">إعفاء جزئي 50%</option>
              <option value="معفى_كلي">إعفاء كلي 100%</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-end md:self-auto shrink-0">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'cards' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="عرض البطاقات"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="عرض الجدول"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Results View */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">لا يوجد تلاميذ مطابقين للبحث</h3>
          <p className="text-sm text-slate-500 mt-1">
            جرب تغيير كلمات البحث أو الفلاتر المحددة، أو قم بتسجيل تلميذ جديد.
          </p>
          <button
            onClick={handleOpenNew}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-xs cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>تسجيل تلميذ جديد</span>
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        /* Cards Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredStudents.map((student) => {
            const halaqah = halaqat.find((h) => h.id === student.halaqahId);
            const guardianPhone = student.guardianPhone || student.phone;
            const progressPercent = Math.min(100, Math.round(((student.hizbProgress || 0) / 60) * 100));

            return (
              <div
                key={student.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base text-white shadow-xs shrink-0 ${
                          student.gender === 'ذكر'
                            ? 'bg-gradient-to-br from-emerald-600 to-teal-700'
                            : 'bg-gradient-to-br from-teal-600 to-cyan-700'
                        }`}
                      >
                        {student.fullName.charAt(0)}
                      </div>
                      <div>
                        <button
                          onClick={() => onOpenProfile(student)}
                          className="font-bold text-slate-900 text-base text-right hover:text-emerald-700 transition-colors line-clamp-1 cursor-pointer"
                        >
                          {student.fullName}
                        </button>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px] font-semibold text-slate-600">
                            {student.regNumber || 'بدون رقم'}
                          </span>
                          <span>•</span>
                          <span>{student.gender}</span>
                          {student.level && (
                            <>
                              <span>•</span>
                              <span>{student.level}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Exemption badge */}
                    {student.exemptionStatus === 'معفى_كلي' ? (
                      <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[11px] font-bold shrink-0">
                        معفى كلياً
                      </span>
                    ) : student.exemptionStatus === 'معفى_جزئي' ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold shrink-0">
                        خصم 50%
                      </span>
                    ) : null}
                  </div>

                  {/* Halaqah & Quran Progress */}
                  <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-emerald-700" />
                        <span className="font-medium">{halaqah?.name || 'غير محددة'}</span>
                      </span>
                      <span className="text-emerald-800 font-bold">
                        {student.hizbProgress || 0} / 60 حزباً ({progressPercent}%)
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    {student.currentSurah && (
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                        <span>السورة الحالية:</span>
                        <strong className="text-slate-800 font-semibold">سورة {student.currentSurah}</strong>
                      </div>
                    )}
                  </div>

                  {/* Guardian contact */}
                  <div className="mt-3 text-xs text-slate-600 flex items-center justify-between">
                    <span className="truncate">
                      الولي: <strong>{student.guardianName || 'غير مسجل'}</strong> ({student.guardianRelation || 'ولي'})
                    </span>
                    {guardianPhone && (
                      <span className="font-mono text-[11px] text-slate-500">{guardianPhone}</span>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenProfile(student)}
                      title="عرض بطاقة التلميذ والملف الكامل"
                      className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onOpenRecitationForStudent(student)}
                      title="تسجيل تسميع وحفظ جديد"
                      className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 transition-colors cursor-pointer"
                    >
                      <BookMarked className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onOpenPaymentForStudent(student)}
                      title="تسجيل دفع اشتراك"
                      className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-colors cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4" />
                    </button>
                    {guardianPhone && (
                      <button
                        onClick={() =>
                          onSendWhatsApp(
                            guardianPhone,
                            `السلام عليكم ورحمة الله، تقرير متابعة التلميذ ${student.fullName} في جمعية تحفيظ القرآن الكريم.`
                          )
                        }
                        title="مراسلة ولي الأمر عبر واتساب"
                        className="p-2 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-colors cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(student)}
                      title="تعديل بيانات التلميذ"
                      className="p-2 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setStudentToDelete(student)}
                      title="حذف التلميذ"
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-emerald-800 text-white text-xs font-bold">
                  <th className="p-3.5">رقم التسجيل</th>
                  <th className="p-3.5">اسم التلميذ</th>
                  <th className="p-3.5">الجنس</th>
                  <th className="p-3.5">الحلقة</th>
                  <th className="p-3.5">الحفظ</th>
                  <th className="p-3.5">ولي الأمر</th>
                  <th className="p-3.5">الهاتف</th>
                  <th className="p-3.5">الرسوم</th>
                  <th className="p-3.5 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredStudents.map((student, idx) => {
                  const halaqah = halaqat.find((h) => h.id === student.halaqahId);
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-mono text-xs font-semibold text-slate-600">
                        {student.regNumber || '-'}
                      </td>
                      <td className="p-3.5 font-bold text-slate-900">
                        <button
                          onClick={() => onOpenProfile(student)}
                          className="hover:text-emerald-700 transition-colors text-right cursor-pointer"
                        >
                          {student.fullName}
                        </button>
                      </td>
                      <td className="p-3.5 text-xs text-slate-600">{student.gender}</td>
                      <td className="p-3.5 text-xs text-slate-700 font-medium">
                        {halaqah?.name || '-'}
                      </td>
                      <td className="p-3.5 text-xs font-bold text-emerald-800">
                        {student.hizbProgress || 0} حزباً
                      </td>
                      <td className="p-3.5 text-xs text-slate-700">
                        {student.guardianName || '-'}
                      </td>
                      <td className="p-3.5 text-xs font-mono text-slate-600">
                        {student.guardianPhone || student.phone || '-'}
                      </td>
                      <td className="p-3.5 text-xs">
                        {student.exemptionStatus === 'معفى_كلي' ? (
                          <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold text-[11px]">
                            معفى كلياً
                          </span>
                        ) : student.exemptionStatus === 'معفى_جزئي' ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px]">
                            خصم 50%
                          </span>
                        ) : (
                          <span className="text-slate-500">عادي</span>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onOpenProfile(student)}
                            title="الملف الكامل"
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenRecitationForStudent(student)}
                            title="تسميع"
                            className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 cursor-pointer"
                          >
                            <BookMarked className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenPaymentForStudent(student)}
                            title="دفع"
                            className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 cursor-pointer"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(student)}
                            title="تعديل"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setStudentToDelete(student)}
                            title="حذف"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* Add / Edit Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-700" />
                <span>{editingStudent ? 'تعديل بيانات التلميذ' : 'تسجيل تلميذ جديد'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="mt-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الاسم الكامل للتلميذ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="مثال: يحيى بن محمد الصالح"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15"
                  />
                </div>

                {/* Reg Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رقم التسجيل</label>
                  <input
                    type="text"
                    value={regNumber}
                    onChange={(e) => setRegNumber(e.target.value)}
                    placeholder="مثال: 2026-001"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الجنس</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as Gender)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-600"
                  >
                    <option value="ذكر">ذكر</option>
                    <option value="أنثى">أنثى</option>
                  </select>
                </div>

                {/* Birth Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ الميلاد</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
                  />
                </div>

                {/* Halaqah */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الحلقة التابع لها</label>
                  <select
                    value={halaqahId}
                    onChange={(e) => setHalaqahId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-600"
                  >
                    <option value="">-- اختر الحلقة --</option>
                    {halaqat.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name} ({h.teacherName})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Current Hizb Progress */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    مقدار الحفظ الحالي (عدد الأحزاب من 0 إلى 60)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={hizbProgress}
                    onChange={(e) => setHizbProgress(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
                  />
                </div>

                {/* Current Surah */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">السورة الحالية</label>
                  <input
                    type="text"
                    value={currentSurah}
                    onChange={(e) => setCurrentSurah(e.target.value)}
                    placeholder="مثال: البقرة، الملك، النبأ"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
                  />
                </div>

                {/* Guardian Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اسم الولي</label>
                  <input
                    type="text"
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    placeholder="اسم الأب أو الأم أو الكافل"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
                  />
                </div>

                {/* Guardian Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">هاتف الولي (واتساب)</label>
                  <input
                    type="tel"
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
                    placeholder="مثال: 0555123456"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
                  />
                </div>

                {/* Exemption Status */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">حالة رسوم الاشتراك</label>
                  <select
                    value={exemptionStatus}
                    onChange={(e) => setExemptionStatus(e.target.value as ExemptionStatus)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-600"
                  >
                    <option value="عادي">رسوم كاملة عادية</option>
                    <option value="معفى_جزئي">إعفاء جزئي (خصم الأخوة 50%)</option>
                    <option value="معفى_كلي">إعفاء كلي (أيتام / معوزين)</option>
                  </select>
                </div>

                {/* Registration Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ الالتحاق والتسجيل</label>
                  <input
                    type="date"
                    value={regDate}
                    onChange={(e) => setRegDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
                  />
                </div>

                {/* Address */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">العنوان السكني</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="الحي والشارع"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
                  />
                </div>

                {/* Notes */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات تربوية أو صحية</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="أي ملاحظات خاصة بالتلميذ..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 resize-none"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-sm transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  {editingStudent ? 'حفظ التعديلات' : 'تسجيل التلميذ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">تأكيد حذف التلميذ</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              هل أنت متأكد من حذف التلميذ <strong>"{studentToDelete.fullName}"</strong>؟ سيتم حذف جميع سجلات الحفظ والمدفوعات الخاصة به أيضاً.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setStudentToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 cursor-pointer"
              >
                تراجع
              </button>
              <button
                onClick={() => {
                  onDeleteStudent(studentToDelete.id);
                  setStudentToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-xs cursor-pointer"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
