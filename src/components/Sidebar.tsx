import React from 'react';
import { ActiveTab, AppDatabase } from '../types';
import {
  LayoutDashboard,
  Users,
  Layers,
  BookMarked,
  UserCheck,
  CreditCard,
  Wallet,
  Receipt,
  BarChart3,
  HardDrive,
  X,
  Sparkles,
  Award
} from 'lucide-react';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  database: AppDatabase;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  database,
  isMobileOpen,
  onCloseMobile,
}) => {
  const currentMonthStr = String(new Date().getMonth() + 1).padStart(2, '0');
  const currentYear = new Date().getFullYear();

  // حساب عدد غير المسددين للشهر الحالي
  const currentMonthPaidIds = new Set(
    database.monthlyFees
      .filter((m) => m.month === currentMonthStr && m.year === currentYear)
      .map((m) => m.studentId)
  );
  const unpaidCount = database.students.filter(
    (s) => s.exemptionStatus !== 'معفى_كلي' && !currentMonthPaidIds.has(s.id)
  ).length;

  const navItems: { id: ActiveTab; label: string; icon: React.ElementType; badge?: string | number; badgeColor?: string }[] = [
    {
      id: 'dashboard',
      label: 'لوحة التحكم',
      icon: LayoutDashboard,
    },
    {
      id: 'students',
      label: 'إدارة التلاميذ',
      icon: Users,
      badge: database.students.length,
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'halaqat',
      label: 'الحلقات والمشايخ',
      icon: Layers,
      badge: database.halaqat.length,
      badgeColor: 'bg-slate-100 text-slate-700',
    },
    {
      id: 'quranTracker',
      label: 'دفتر الحفظ والتسميع',
      icon: BookMarked,
      badge: database.recitations.length,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'attendance',
      label: 'سجل الحضور والغياب',
      icon: UserCheck,
    },
    {
      id: 'finance',
      label: 'الواجبات والاشتراكات',
      icon: CreditCard,
      badge: unpaidCount > 0 ? `${unpaidCount} متأخر` : undefined,
      badgeColor: 'bg-rose-100 text-rose-800',
    },
    {
      id: 'fund',
      label: 'صندوق الجمعية والمصاريف',
      icon: Wallet,
    },
    {
      id: 'receipts',
      label: 'الوصولات والشهادات',
      icon: Award,
    },
    {
      id: 'reports',
      label: 'التقارير والإحصائيات',
      icon: BarChart3,
    },
    {
      id: 'backupSettings',
      label: 'الحفظ المحلي والإعدادات',
      icon: HardDrive,
    },
  ];

  const handleNavClick = (tabId: ActiveTab) => {
    setActiveTab(tabId);
    onCloseMobile();
  };

  const navContent = (
    <div className="flex flex-col h-full bg-white border-l border-slate-200">
      {/* Sidebar Header (Mobile close button) */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between lg:hidden">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-600" />
          <span className="font-bold text-slate-800 text-sm">القائمة الرئيسية</span>
        </div>
        <button
          onClick={onCloseMobile}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all group cursor-pointer ${
                isActive
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-800/20'
                  : 'text-slate-700 hover:bg-emerald-50/70 hover:text-emerald-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-amber-300' : 'text-slate-500 group-hover:text-emerald-700'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold shrink-0 ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : item.badgeColor || 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Local storage footer indicator */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/80">
        <div className="p-3 bg-emerald-50 border border-emerald-200/70 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span className="text-xs font-bold text-emerald-900">الأمان والخصوصية</span>
          </div>
          <p className="text-[11px] text-emerald-800 leading-relaxed">
            جميع البيانات محفوظة ومخزنة محلياً في هذا الكمبيوتر فقط بدون أي انقطاع.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed) */}
      <aside className="hidden lg:block w-64 xl:w-72 h-[calc(100vh-5rem)] sticky top-20 shrink-0 print:hidden">
        {navContent}
      </aside>

      {/* Mobile Drawer (Overlay) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-right duration-200">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
