import React from 'react';
import { AssociationSettings } from '../types';
import { 
  BookOpen, 
  HardDrive, 
  Printer, 
  Download, 
  Menu,
  ShieldCheck,
  Calendar,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  settings: AssociationSettings;
  onOpenMobileMenu: () => void;
  onQuickBackup: () => void;
  onPrintPage: () => void;
  linkedDirName: string | null;
  storageUsage: { formatted: string };
  lastSavedTime: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  onOpenMobileMenu,
  onQuickBackup,
  onPrintPage,
  linkedDirName,
  storageUsage,
  lastSavedTime,
}) => {
  const todayArabic = new Date().toLocaleDateString('ar-SA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Right side: Logo & Association Title */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={onOpenMobileMenu}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              aria-label="فتح القائمة"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 shrink-0">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300" />
              </div>
              <div className="overflow-hidden">
                <h1 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 truncate leading-tight">
                  {settings.assocName}
                </h1>
                <p className="text-xs text-emerald-700 font-medium truncate flex items-center gap-1.5 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>{settings.subtitle || 'نظام إدارة التحفيظ والتسجيل الشامل'}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Left side: Local Storage Status Badge & Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Local Storage Indicator */}
            <div className="hidden md:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-xs font-medium">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
              </span>
              <div className="flex flex-col">
                <div className="flex items-center gap-1 font-semibold text-emerald-800">
                  <HardDrive className="w-3.5 h-3.5" />
                  <span>
                    {linkedDirName ? `مجلد متصل: ${linkedDirName}` : 'حفظ محلي في جهازك'}
                  </span>
                </div>
                <span className="text-[10px] text-emerald-600">
                  {storageUsage.formatted} • آخر حفظ: {lastSavedTime || 'الآن'}
                </span>
              </div>
            </div>

            {/* Date display */}
            <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{todayArabic}</span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={onQuickBackup}
                title="تنزيل نسخة احتياطية فورية على الكمبيوتر"
                className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-700" />
                <span className="hidden sm:inline">نسخة احتياطية</span>
              </button>

              <button
                onClick={onPrintPage}
                title="طباعة الصفحة الحالية أو الكشف"
                className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span className="hidden sm:inline">طباعة</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
