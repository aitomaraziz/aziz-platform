import React, { useState } from 'react';
import { Halaqah, Student } from '../types';
import {
  Layers,
  Plus,
  Users,
  Edit2,
  Trash2,
  Phone,
  Clock,
  BookOpen,
  UserCheck,
  CheckCircle2
} from 'lucide-react';

interface HalaqatViewProps {
  halaqat: Halaqah[];
  students: Student[];
  onSaveHalaqah: (halaqah: Halaqah) => void;
  onDeleteHalaqah: (id: string) => void;
  onSendWhatsApp: (phone: string, text: string) => void;
}

export const HalaqatView: React.FC<HalaqatViewProps> = ({
  halaqat,
  students,
  onSaveHalaqah,
  onDeleteHalaqah,
  onSendWhatsApp,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHalaqah, setEditingHalaqah] = useState<Halaqah | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [teacherPhone, setTeacherPhone] = useState('');
  const [scheduleDescription, setScheduleDescription] = useState('');
  const [genderTarget, setGenderTarget] = useState<'ذكور' | 'إناث' | 'مختلط'>('ذكور');
  const [targetLevel, setTargetLevel] = useState('');
  const [notes, setNotes] = useState('');

  // Selected Halaqah to inspect students
  const [selectedHalaqahId, setSelectedHalaqahId] = useState<string | null>(null);

  const handleOpenNew = () => {
    setEditingHalaqah(null);
    setName('');
    setTeacherName('');
    setTeacherPhone('');
    setScheduleDescription('');
    setGenderTarget('ذكور');
    setTargetLevel('جميع المستويات');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (h: Halaqah) => {
    setEditingHalaqah(h);
    setName(h.name);
    setTeacherName(h.teacherName);
    setTeacherPhone(h.teacherPhone || '');
    setScheduleDescription(h.scheduleDescription || '');
    setGenderTarget(h.genderTarget);
    setTargetLevel(h.targetLevel || '');
    setNotes(h.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !teacherName.trim()) return;

    const data: Halaqah = {
      id: editingHalaqah ? editingHalaqah.id : 'H' + Date.now(),
      name: name.trim(),
      teacherName: teacherName.trim(),
      teacherPhone: teacherPhone.trim() || undefined,
      scheduleDescription: scheduleDescription.trim() || undefined,
      genderTarget,
      targetLevel: targetLevel.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    onSaveHalaqah(data);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-emerald-700" />
            <span>حلقات التحفيظ والمشايخ المؤطرين</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            تنظيم أفواج وتوزيع التلاميذ على المشايخ والمعلمات حسب المستويات والأوقات
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-900/15 transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة حلقة جديدة</span>
        </button>
      </div>

      {/* Halaqat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {halaqat.map((h) => {
          const halaqahStudents = students.filter((s) => s.halaqahId === h.id);
          const maleCount = halaqahStudents.filter((s) => s.gender === 'ذكر').length;
          const femaleCount = halaqahStudents.filter((s) => s.gender === 'أنثى').length;

          return (
            <div
              key={h.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base leading-tight">{h.name}</h3>
                    <p className="text-xs text-emerald-800 font-semibold mt-1">
                      المؤطر: <span className="text-slate-800">{h.teacherName}</span>
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs shrink-0">
                    {halaqahStudents.length} تلميذ
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>التوقيت: <strong>{h.scheduleDescription || 'لم يحدد بعد'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>المستوى: <strong>{h.targetLevel || 'عام'}</strong></span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px] text-slate-500">
                    <span>الفئة: <strong>{h.genderTarget}</strong></span>
                    <span>ذكور: {maleCount} | إناث: {femaleCount}</span>
                  </div>
                </div>

                {h.teacherPhone && (
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-slate-500">هاتف المؤطر:</span>
                    <button
                      onClick={() =>
                        onSendWhatsApp(
                          h.teacherPhone!,
                          `السلام عليكم فضيلة الشيخ ${h.teacherName}، تحية طيبة من إدارة جمعية تحفيظ القرآن الكريم.`
                        )
                      }
                      className="font-mono text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{h.teacherPhone}</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedHalaqahId(selectedHalaqahId === h.id ? null : h.id)}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{selectedHalaqahId === h.id ? 'إخفاء التلاميذ' : 'عرض قائمة التلاميذ'}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(h)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                    title="تعديل الحلقة"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`هل أنت متأكد من حذف ${h.name}؟`)) {
                        onDeleteHalaqah(h.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                    title="حذف الحلقة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Collapsible Student Roster */}
              {selectedHalaqahId === h.id && (
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <h4 className="text-xs font-bold text-slate-700 mb-2">تلاميذ هذه الحلقة ({halaqahStudents.length}):</h4>
                  {halaqahStudents.length === 0 ? (
                    <p className="text-xs text-slate-400">لا يوجد تلاميذ مسجلين في هذه الحلقة بعد</p>
                  ) : (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                      {halaqahStudents.map((s, idx) => (
                        <div
                          key={s.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs"
                        >
                          <span className="font-medium text-slate-800 truncate">
                            {idx + 1}. {s.fullName}
                          </span>
                          <span className="text-emerald-800 font-bold font-mono">
                            {s.hizbProgress || 0} حزباً
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingHalaqah ? 'تعديل بيانات الحلقة' : 'إضافة حلقة تحفيظ جديدة'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم الحلقة <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: حلقة الإمام الشاطبي"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الشيخ / المؤطر المشرف <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  placeholder="اسم المعلم أو الشيخ"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">هاتف المؤطر</label>
                  <input
                    type="tel"
                    value={teacherPhone}
                    onChange={(e) => setTeacherPhone(e.target.value)}
                    placeholder="0555123456"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الفئة المستهدفة</label>
                  <select
                    value={genderTarget}
                    onChange={(e) => setGenderTarget(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-600"
                  >
                    <option value="ذكور">ذكور</option>
                    <option value="إناث">إناث</option>
                    <option value="مختلط">مختلط (براعم)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">أوقات ومواعيد الحصص</label>
                <input
                  type="text"
                  value={scheduleDescription}
                  onChange={(e) => setScheduleDescription(e.target.value)}
                  placeholder="مثال: السبت والإثنين والأربعاء (بعد العصر)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المستوى والمنهاج</label>
                <input
                  type="text"
                  value={targetLevel}
                  onChange={(e) => setTargetLevel(e.target.value)}
                  placeholder="مثال: جزء عم وتبارك، التجويد النظري"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
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
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold cursor-pointer"
                >
                  حفظ الحلقة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
