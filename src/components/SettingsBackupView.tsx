import React, { useState } from 'react';
import {
  AssociationDatabase,
  AssociationSettings
} from '../types';
import {
  pickLocalDirectory,
  disconnectLocalDirectory,
  getLocalFolderInfo,
  exportDatabaseAsJSON,
  importDatabaseFromJSON,
  generateSeedDatabase,
  clearAllDatabase
} from '../lib/storage';
import {
  Settings,
  HardDrive,
  FolderSync,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FileSpreadsheet,
  Save,
  Trash2,
  FolderOpen,
  Sparkles,
  Info
} from 'lucide-react';

interface SettingsBackupViewProps {
  database: AssociationDatabase;
  onUpdateSettings: (newSettings: AssociationSettings) => void;
  onDatabaseReplaced: (newDb: AssociationDatabase) => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const SettingsBackupView: React.FC<SettingsBackupViewProps> = ({
  database,
  onUpdateSettings,
  onDatabaseReplaced,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'storage' | 'association' | 'whatsapp'>('storage');

  // Settings form state
  const [assocName, setAssocName] = useState(database.settings.assocName);
  const [currency, setCurrency] = useState(database.settings.currency);
  const [monthlyFeeDefault, setMonthlyFeeDefault] = useState(database.settings.monthlyFeeDefault);
  const [annualFeeDefault, setAnnualFeeDefault] = useState(database.settings.annualFeeDefault);
  const [phone, setPhone] = useState(database.settings.phone || '');
  const [address, setAddress] = useState(database.settings.address || '');
  const [whatsappTemplateReminder, setWhatsappTemplateReminder] = useState(
    database.settings.whatsappTemplateReminder || ''
  );
  const [whatsappTemplateProgress, setWhatsappTemplateProgress] = useState(
    database.settings.whatsappTemplateProgress || ''
  );

  const folderInfo = getLocalFolderInfo();

  // Handle local folder pick
  const handleConnectFolder = async () => {
    const success = await pickLocalDirectory();
    if (success) {
      onShowToast('تم ربط المجلد المحلي على جهازك بنجاح! سيتم حفظ أي تعديل فيه تلقائياً.', 'success');
      // trigger save to that folder
      onUpdateSettings({ ...database.settings });
    } else {
      onShowToast('لم يتم اختيار مجلد، يمكنك دائماً تحميل نسخ احتياطية بضغطة زر.', 'info');
    }
  };

  const handleDisconnectFolder = async () => {
    await disconnectLocalDirectory();
    onShowToast('تم فصل المجلد المحلي. البيانات ما زالت محفوظة في متصفحك (IndexedDB).', 'info');
    onUpdateSettings({ ...database.settings });
  };

  // Handle JSON Download
  const handleExportJSON = () => {
    exportDatabaseAsJSON(database);
    onShowToast('تم تحميل ملف النسخة الاحتياطية على جهاز الكمبيوتر.', 'success');
  };

  // Handle JSON Upload
  const handleImportJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imported = await importDatabaseFromJSON(file);
      onDatabaseReplaced(imported);
      onShowToast('تمت استعادة قاعدة البيانات بنجاح من الملف!', 'success');
    } catch (err: any) {
      onShowToast(`خطأ في قراءة ملف النسخة الاحتياطية: ${err.message}`, 'error');
    }
    // reset input
    e.target.value = '';
  };

  // Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: AssociationSettings = {
      ...database.settings,
      assocName: assocName.trim(),
      currency: currency.trim(),
      monthlyFeeDefault: Number(monthlyFeeDefault),
      annualFeeDefault: Number(annualFeeDefault),
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
      whatsappTemplateReminder,
      whatsappTemplateProgress,
    };
    onUpdateSettings(updated);
    onShowToast('تم حفظ إعدادات الجمعية بنجاح!', 'success');
  };

  // Seed Data
  const handleSeedData = () => {
    if (confirm('هل تريد ملء التطبيق ببيانات نموذجية تجريبية للتجربة (تلاميذ، حلقات، اشتراكات، تسميع)؟')) {
      const seed = generateSeedDatabase();
      onDatabaseReplaced(seed);
      onShowToast('تم توليد بيانات نموذجية متكاملة بنجاح!', 'success');
    }
  };

  // Factory Reset
  const handleResetData = async () => {
    if (
      confirm(
        '⚠️ تحذير شديد: هل أنت متأكد من مسح كافة بيانات الجمعية والبدء من الصفر؟ ننصحك بتحميل نسخة احتياطية أولاً.'
      )
    ) {
      await clearAllDatabase();
      const emptyDb = generateSeedDatabase();
      emptyDb.students = [];
      emptyDb.halaqat = [];
      emptyDb.recitations = [];
      emptyDb.annualFees = [];
      emptyDb.monthlyFees = [];
      emptyDb.expenses = [];
      emptyDb.incomes = [];
      emptyDb.attendance = [];
      onDatabaseReplaced(emptyDb);
      onShowToast('تمت إعادة ضبط قاعدة البيانات.', 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <HardDrive className="w-6 h-6 text-emerald-700" />
            <span>مركز التخزين المحلي والإعدادات</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            إدارة حفظ البيانات الدائم في الكمبيوتر، النسخ الاحتياطي، وإعدادات جمعية التحفيظ
          </p>
        </div>

        <button
          onClick={handleExportJSON}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>تنزيل نسخة احتياطية (JSON)</span>
        </button>
      </div>

      {/* Navigation Subtabs */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-t-2xl border-t border-r border-l gap-4 sm:gap-6">
        <button
          onClick={() => setActiveTab('storage')}
          className={`py-3.5 font-bold text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'storage'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <FolderSync className="w-4 h-4" />
          <span>التخزين على جهاز الكمبيوتر</span>
        </button>

        <button
          onClick={() => setActiveTab('association')}
          className={`py-3.5 font-bold text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'association'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>معلومات وهوية الجمعية</span>
        </button>

        <button
          onClick={() => setActiveTab('whatsapp')}
          className={`py-3.5 font-bold text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'whatsapp'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>قوالب رسائل الواتساب</span>
        </button>
      </div>

      {/* 1. Storage & Backup Tab */}
      {activeTab === 'storage' && (
        <div className="space-y-6">
          {/* Main Direct Folder Sync Banner */}
          <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-400/30">
                  <HardDrive className="w-3.5 h-3.5" />
                  <span>ميزة الحفظ المحلي المباشر في الكمبيوتر</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black">
                  حفظ البيانات والتقارير في مجلد حقيقي على جهازك
                </h3>
                <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
                  يمكنك ربط مجلد من القرص الصلب لحاسوبك (مثل المستندات أو قرص D) لحفظ ملف البيانات{' '}
                  <code className="bg-black/30 px-1.5 py-0.5 rounded font-mono text-amber-300">
                    quran_association_db.json
                  </code>{' '}
                  وتحديثه فورياً وبشكل دائم حتى في حال إغلاق المتصفح أو انقطاع الإنترنت.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 min-w-64 text-center">
                <div className="text-xs font-bold text-emerald-200 mb-2">حالة المجلد المحلي</div>
                {folderInfo.connected ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2 text-sm font-bold text-emerald-300">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span>متصل بمجلد: {folderInfo.name}</span>
                    </div>
                    <button
                      onClick={handleDisconnectFolder}
                      className="w-full px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-xs font-bold transition-all cursor-pointer"
                    >
                      فصل المجلد
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-300">لم يتم ربط مجلد محلي بعد</p>
                    <button
                      onClick={handleConnectFolder}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black rounded-xl text-xs shadow-lg transition-all active:scale-95 cursor-pointer"
                    >
                      <FolderOpen className="w-4 h-4" />
                      <span>اختر مجلداً على جهازك</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Storage Layers Status Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h4 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-emerald-700" />
              <span>طبقات التخزين النشطة في هذا المتصفح</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950">
                <div className="flex items-center gap-2 font-bold text-xs text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>قاعدة بيانات IndexedDB</span>
                </div>
                <div className="text-xl font-black mt-2 text-emerald-900">نشطة وتلقائية</div>
                <p className="text-[11px] text-emerald-700 mt-1">
                  تحفظ كافة السجلات والتقارير تلقائياً مع كل عملية إضافة أو تعديل.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-950">
                <div className="flex items-center gap-2 font-bold text-xs text-teal-800">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>تخزين احتياطي LocalStorage</span>
                </div>
                <div className="text-xl font-black mt-2 text-teal-900">نشط ومتزامن</div>
                <p className="text-[11px] text-teal-700 mt-1">
                  طبقة ثانوية لضمان عدم فقدان أي بيانات عند تحديث الصفحة.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-700">
                  <FolderSync className="w-4 h-4 text-slate-500" />
                  <span>المجلد المحلي (File System)</span>
                </div>
                <div className="text-xl font-black mt-2">
                  {folderInfo.connected ? 'متصل وحي' : 'اختياري'}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  يحفظ ملفاً مباشراً في مجلدات الحاسوب دون الحاجة لخوادم خارجية.
                </p>
              </div>
            </div>
          </div>

          {/* Manual Import & Export Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Export Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                  <Download className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-base">تصدير نسخة احتياطية كاملة (JSON)</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  احفظ ملف النسخة الاحتياطية على قرص فلاش USB أو في أي مكان آخر على جهازك للرجوع إليه وقتما تشاء.
                </p>
                <div className="mt-3 text-xs text-slate-600 font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  حجم البيانات الحالي: {database.students.length} تلميذ | {database.recitations.length} تسميع |{' '}
                  {database.monthlyFees.length + database.annualFees.length} عملية مالية
                </div>
              </div>

              <button
                onClick={handleExportJSON}
                className="mt-5 w-full flex items-center justify-center gap-2 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>تحميل ملف قاعدة البيانات الآن</span>
              </button>
            </div>

            {/* Import Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-3">
                  <Upload className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-base">استعادة قاعدة بيانات سابقة</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  اختر ملف النسخة الاحتياطية (.json) لاستعادة كافة السجلات والتلاميذ والتقارير فورياً.
                </p>
              </div>

              <label className="mt-5 w-full flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>استيراد ملف JSON من الجهاز</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Quick Demo Seed and Factory Reset */}
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h5 className="font-bold text-slate-900 text-sm">أدوات الصيانة وقواعد البيانات التجريبية</h5>
              <p className="text-xs text-slate-500 mt-0.5">
                توليد بيانات نموذجية للتجربة والاستكشاف، أو مسح البيانات وإعادة الضبط
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSeedData}
                className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                توليد بيانات نموذجية تجريبية
              </button>
              <button
                onClick={handleResetData}
                className="px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                مسح وإعادة ضبط
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Association Profile Tab */}
      {activeTab === 'association' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <h3 className="text-lg font-bold text-slate-900 mb-1">بيانات جمعية تحفيظ القرآن الكريم</h3>
          <p className="text-xs text-slate-500 mb-6">
            هذه المعلومات تظهر على الوثائق الرسمية، وصولات القبض، وبطاقات التلاميذ
          </p>

          <form onSubmit={handleSaveSettings} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                اسم الجمعية / المؤسسة القرآنية <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={assocName}
                onChange={(e) => setAssocName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رمز العملة</label>
                <input
                  type="text"
                  required
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  placeholder="دج أو ر.س أو درهم"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الاشتراك الشهري الافتراضي
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={monthlyFeeDefault}
                  onChange={(e) => setMonthlyFeeDefault(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الواجب السنوي الافتراضي
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={annualFeeDefault}
                  onChange={(e) => setAnnualFeeDefault(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  رقم هاتف الإدارة / الواتساب
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0555000000"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">عنوان المقر</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="المسجد العتيق، الحي، الولاية"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-bold shadow-md cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>حفظ التعديلات</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. WhatsApp Templates Tab */}
      {activeTab === 'whatsapp' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <h3 className="text-lg font-bold text-slate-900 mb-1">قوالب الرسائل الآلية للتواصل مع الأولياء</h3>
          <p className="text-xs text-slate-500 mb-6">
            يمكنك تخصيص نصوص الرسائل التي تُرسل بنقرة واحدة عبر الواتساب للأولياء
          </p>

          <form onSubmit={handleSaveSettings} className="space-y-5 max-w-2xl">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                قالب رسالة التذكير بالاشتراك الشهري المتأخر
              </label>
              <textarea
                rows={3}
                value={whatsappTemplateReminder}
                onChange={(e) => setWhatsappTemplateReminder(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-emerald-600"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                الوسوم المتاحة: <code>{'{student_name}'}</code>, <code>{'{month}'}</code>, <code>{'{year}'}</code>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                قالب رسالة إشعار إنجاز الحفظ والتسميع
              </label>
              <textarea
                rows={3}
                value={whatsappTemplateProgress}
                onChange={(e) => setWhatsappTemplateProgress(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-emerald-600"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                الوسوم المتاحة: <code>{'{student_name}'}</code>, <code>{'{surah_name}'}</code>, <code>{'{from_ayah}'}</code>, <code>{'{to_ayah}'}</code>, <code>{'{grade}'}</code>
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-bold shadow-md cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>حفظ القوالب</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
