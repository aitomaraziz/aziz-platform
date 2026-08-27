import React, { useState, useEffect, useCallback } from 'react';
import {
  AssociationDatabase,
  Student,
  Halaqah,
  RecitationRecord,
  AnnualFee,
  MonthlyFee,
  ExpenseRecord,
  IncomeRecord,
  AttendanceRecord,
  AssociationSettings
} from './types';
import {
  loadDatabase,
  saveDatabase,
  generateSeedDatabase,
  getLocalFolderInfo,
  exportDatabaseAsJSON
} from './lib/storage';

// Components
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { StudentsView } from './components/StudentsView';
import { HalaqatView } from './components/HalaqatView';
import { QuranTrackerView } from './components/QuranTrackerView';
import { AttendanceView } from './components/AttendanceView';
import { FinanceView } from './components/FinanceView';
import { FundExpensesView } from './components/FundExpensesView';
import { ReportsView } from './components/ReportsView';
import { SettingsBackupView } from './components/SettingsBackupView';
import { StudentProfileModal } from './components/StudentProfileModal';
import { ReceiptModal } from './components/ReceiptModal';
import { Toast, ToastMessage } from './components/Toast';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [database, setDatabase] = useState<AssociationDatabase>(generateSeedDatabase());
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Modals & Navigation state
  const [selectedProfileStudent, setSelectedProfileStudent] = useState<Student | null>(null);
  const [targetStudentIdForAction, setTargetStudentIdForAction] = useState<string | undefined>(undefined);
  const [receiptModalData, setReceiptModalData] = useState<{
    type: 'annual' | 'monthly';
    record: AnnualFee | MonthlyFee;
    student: Student;
    halaqah?: Halaqah;
  } | null>(null);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const newToast: ToastMessage = {
      id: 'toast_' + Date.now() + '_' + Math.random(),
      text,
      type,
    };
    setToasts((prev) => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Initial Load from IndexedDB / LocalStorage / Local Folder
  useEffect(() => {
    async function init() {
      try {
        const loaded = await loadDatabase();
        setDatabase(loaded);
      } catch (err) {
        console.error('Failed to load database:', err);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  // Helper to commit DB changes
  const updateDatabase = useCallback(
    async (updater: (prev: AssociationDatabase) => AssociationDatabase, successMessage?: string) => {
      setDatabase((prev) => {
        const updated = updater(prev);
        // persist asynchronously
        saveDatabase(updated).catch((err) => {
          console.error('Failed to auto-save to storage:', err);
        });
        return updated;
      });

      if (successMessage) {
        addToast(successMessage, 'success');
      }
    },
    [addToast]
  );

  // Direct replacement (e.g. from backup restore or seed)
  const handleDatabaseReplaced = useCallback((newDb: AssociationDatabase) => {
    setDatabase(newDb);
    saveDatabase(newDb);
  }, []);

  // Student operations
  const handleSaveStudent = useCallback(
    (student: Student) => {
      updateDatabase((prev) => {
        const index = prev.students.findIndex((s) => s.id === student.id);
        const newStudents = [...prev.students];
        if (index >= 0) {
          newStudents[index] = student;
        } else {
          newStudents.unshift(student);
        }
        return { ...prev, students: newStudents };
      }, 'تم حفظ بيانات التلميذ وتحديث السجل المحلي!');
    },
    [updateDatabase]
  );

  const handleDeleteStudent = useCallback(
    (id: string) => {
      updateDatabase((prev) => {
        return {
          ...prev,
          students: prev.students.filter((s) => s.id !== id),
        };
      }, 'تم حذف التلميذ بنجاح.');
    },
    [updateDatabase]
  );

  // Halaqah operations
  const handleSaveHalaqah = useCallback(
    (halaqah: Halaqah) => {
      updateDatabase((prev) => {
        const index = prev.halaqat.findIndex((h) => h.id === halaqah.id);
        const newHalaqat = [...prev.halaqat];
        if (index >= 0) {
          newHalaqat[index] = halaqah;
        } else {
          newHalaqat.push(halaqah);
        }
        return { ...prev, halaqat: newHalaqat };
      }, 'تم حفظ الحلقة القرآنية وتحديث السجل المحلي!');
    },
    [updateDatabase]
  );

  const handleDeleteHalaqah = useCallback(
    (id: string) => {
      updateDatabase((prev) => {
        return {
          ...prev,
          halaqat: prev.halaqat.filter((h) => h.id !== id),
        };
      }, 'تم حذف الحلقة.');
    },
    [updateDatabase]
  );

  // Quran Recitation operations
  const handleSaveRecitation = useCallback(
    (rec: RecitationRecord, newHizb?: number) => {
      updateDatabase((prev) => {
        const newRecs = [rec, ...prev.recitations];
        let newStudents = [...prev.students];

        // Update student progress & current Surah
        const stuIdx = newStudents.findIndex((s) => s.id === rec.studentId);
        if (stuIdx >= 0) {
          newStudents[stuIdx] = {
            ...newStudents[stuIdx],
            currentSurah: rec.surahName,
            hizbProgress: newHizb !== undefined ? newHizb : newStudents[stuIdx].hizbProgress,
          };
        }

        return { ...prev, recitations: newRecs, students: newStudents };
      }, 'تم تسجيل جلسة التسميع بنجاح وتحديث إنجاز التلميذ!');
    },
    [updateDatabase]
  );

  const handleDeleteRecitation = useCallback(
    (id: string) => {
      updateDatabase((prev) => {
        return {
          ...prev,
          recitations: prev.recitations.filter((r) => r.id !== id),
        };
      }, 'تم حذف جلسة التسميع.');
    },
    [updateDatabase]
  );

  // Attendance operations
  const handleSaveBatchAttendance = useCallback(
    (newRecords: AttendanceRecord[]) => {
      updateDatabase((prev) => {
        // filter out previous records for matching student and date
        const newIds = new Set(newRecords.map((r) => `${r.studentId}_${r.date}`));
        const filtered = prev.attendance.filter((a) => !newIds.has(`${a.studentId}_${a.date}`));
        return {
          ...prev,
          attendance: [...newRecords, ...filtered],
        };
      }, 'تم حفظ وتحديث كشف الحضور بنجاح!');
    },
    [updateDatabase]
  );

  // Finance operations
  const handleSaveMonthlyPayment = useCallback(
    (fee: MonthlyFee) => {
      updateDatabase((prev) => {
        const index = prev.monthlyFees.findIndex(
          (m) => m.studentId === fee.studentId && m.month === fee.month && m.year === fee.year
        );
        const newFees = [...prev.monthlyFees];
        if (index >= 0) {
          newFees[index] = fee;
        } else {
          newFees.unshift(fee);
        }
        return { ...prev, monthlyFees: newFees };
      }, 'تم تسجيل وقبض الاشتراك الشهري!');
    },
    [updateDatabase]
  );

  const handleDeleteMonthlyPayment = useCallback(
    (id: string) => {
      updateDatabase((prev) => {
        return {
          ...prev,
          monthlyFees: prev.monthlyFees.filter((m) => m.id !== id),
        };
      }, 'تم حذف السجل المالي.');
    },
    [updateDatabase]
  );

  const handleSaveAnnualPayment = useCallback(
    (fee: AnnualFee) => {
      updateDatabase((prev) => {
        const index = prev.annualFees.findIndex(
          (a) => a.studentId === fee.studentId && a.year === fee.year
        );
        const newFees = [...prev.annualFees];
        if (index >= 0) {
          newFees[index] = fee;
        } else {
          newFees.unshift(fee);
        }
        return { ...prev, annualFees: newFees };
      }, 'تم تسجيل تسديد الواجب السنوي!');
    },
    [updateDatabase]
  );

  const handleDeleteAnnualPayment = useCallback(
    (id: string) => {
      updateDatabase((prev) => {
        return {
          ...prev,
          annualFees: prev.annualFees.filter((a) => a.id !== id),
        };
      }, 'تم حذف سجل الواجب السنوي.');
    },
    [updateDatabase]
  );

  // Fund & Expenses operations
  const handleSaveExpense = useCallback(
    (expense: ExpenseRecord) => {
      updateDatabase((prev) => {
        return { ...prev, expenses: [expense, ...prev.expenses] };
      }, 'تم تسجيل المصروف في صندوق الجمعية!');
    },
    [updateDatabase]
  );

  const handleDeleteExpense = useCallback(
    (id: string) => {
      updateDatabase((prev) => {
        return { ...prev, expenses: prev.expenses.filter((e) => e.id !== id) };
      }, 'تم حذف المصروف.');
    },
    [updateDatabase]
  );

  const handleSaveIncome = useCallback(
    (income: IncomeRecord) => {
      updateDatabase((prev) => {
        return { ...prev, incomes: [income, ...prev.incomes] };
      }, 'تم تسجيل المدخول/التبرع في الصندوق!');
    },
    [updateDatabase]
  );

  const handleDeleteIncome = useCallback(
    (id: string) => {
      updateDatabase((prev) => {
        return { ...prev, incomes: prev.incomes.filter((i) => i.id !== id) };
      }, 'تم حذف المدخول.');
    },
    [updateDatabase]
  );

  // Settings update
  const handleUpdateSettings = useCallback(
    (newSettings: AssociationSettings) => {
      updateDatabase((prev) => ({ ...prev, settings: newSettings }));
    },
    [updateDatabase]
  );

  // Receipt Modal Opener
  const handleOpenReceipt = useCallback(
    (type: 'annual' | 'monthly', recordId: string) => {
      let rec: AnnualFee | MonthlyFee | undefined;
      if (type === 'monthly') {
        rec = database.monthlyFees.find((m) => m.id === recordId);
      } else {
        rec = database.annualFees.find((a) => a.id === recordId);
      }

      if (!rec) return;
      const student = database.students.find((s) => s.id === rec!.studentId);
      if (!student) return;
      const halaqah = database.halaqat.find((h) => h.id === student.halaqahId);

      setReceiptModalData({
        type,
        record: rec,
        student,
        halaqah,
      });
    },
    [database]
  );

  // WhatsApp Sender
  const handleSendWhatsApp = useCallback((phone: string, text: string) => {
    let cleanPhone = phone.replace(/[^0-9]/g, '');
    // normalize Algerian / international phone numbers if starts with 0
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '213' + cleanPhone.slice(1);
    }
    const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }, []);

  // Quick Action routing from Dashboard or other views
  const handleQuickAction = useCallback((action: string) => {
    setTargetStudentIdForAction(undefined);
    if (action === 'newStudent') {
      setActiveTab('students');
    } else if (action === 'newRecitation') {
      setActiveTab('quranTracker');
    } else if (action === 'newPayment') {
      setActiveTab('finance');
    } else if (action === 'attendance') {
      setActiveTab('attendance');
    } else if (action === 'reports') {
      setActiveTab('reports');
    }
  }, []);

  // Quick action for a specific student
  const handleOpenRecitationForStudent = useCallback((student: Student) => {
    setTargetStudentIdForAction(student.id);
    setActiveTab('quranTracker');
  }, []);

  const handleOpenPaymentForStudent = useCallback((student: Student) => {
    setTargetStudentIdForAction(student.id);
    setActiveTab('finance');
  }, []);

  const handlePrintStudentCard = useCallback((student: Student) => {
    setSelectedProfileStudent(student);
    window.print();
  }, []);

  const folderInfo = getLocalFolderInfo();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-16 h-16 rounded-3xl bg-emerald-600 flex items-center justify-center text-3xl font-black mb-4 shadow-xl animate-pulse">
          📖
        </div>
        <h1 className="text-xl font-black text-emerald-300">نظام جمعية تحفيظ القرآن الكريم</h1>
        <p className="text-xs text-slate-400 mt-2">جاري قراءة البيانات المحلية والتهيئة...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-950">
      {/* Top Navbar */}
      <Navbar
        settings={database.settings}
        folderConnected={folderInfo.connected}
        folderName={folderInfo.name}
        onOpenSettings={() => setActiveTab('settings')}
        onExportBackup={() => exportDatabaseAsJSON(database)}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 sm:p-6 gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0 print:hidden">
          <Sidebar
            activeTab={activeTab}
            onTabChange={(tab) => {
              setTargetStudentIdForAction(undefined);
              setActiveTab(tab);
            }}
            studentsCount={database.students.length}
            halaqatCount={database.halaqat.length}
          />
        </div>

        {/* Content View */}
        <main className="flex-1 min-w-0">
          {activeTab === 'dashboard' && (
            <Dashboard
              database={database}
              onNavigate={setActiveTab}
              onQuickAction={handleQuickAction}
              onSelectStudentProfile={setSelectedProfileStudent}
            />
          )}

          {activeTab === 'students' && (
            <StudentsView
              students={database.students}
              halaqat={database.halaqat}
              recitations={database.recitations}
              annualFees={database.annualFees}
              monthlyFees={database.monthlyFees}
              settings={database.settings}
              onSaveStudent={handleSaveStudent}
              onDeleteStudent={handleDeleteStudent}
              onSelectProfile={setSelectedProfileStudent}
              onOpenRecitation={handleOpenRecitationForStudent}
              onOpenPayment={handleOpenPaymentForStudent}
              onSendWhatsApp={handleSendWhatsApp}
            />
          )}

          {activeTab === 'halaqat' && (
            <HalaqatView
              halaqat={database.halaqat}
              students={database.students}
              onSaveHalaqah={handleSaveHalaqah}
              onDeleteHalaqah={handleDeleteHalaqah}
              onSendWhatsApp={handleSendWhatsApp}
            />
          )}

          {activeTab === 'quranTracker' && (
            <QuranTrackerView
              recitations={database.recitations}
              students={database.students}
              halaqat={database.halaqat}
              settings={database.settings}
              onSaveRecitation={handleSaveRecitation}
              onDeleteRecitation={handleDeleteRecitation}
              onSendWhatsApp={handleSendWhatsApp}
              preselectedStudentId={targetStudentIdForAction}
            />
          )}

          {activeTab === 'attendance' && (
            <AttendanceView
              attendance={database.attendance}
              students={database.students}
              halaqat={database.halaqat}
              onSaveBatchAttendance={handleSaveBatchAttendance}
            />
          )}

          {activeTab === 'finance' && (
            <FinanceView
              annualFees={database.annualFees}
              monthlyFees={database.monthlyFees}
              students={database.students}
              halaqat={database.halaqat}
              settings={database.settings}
              onSaveAnnualPayment={handleSaveAnnualPayment}
              onDeleteAnnualPayment={handleDeleteAnnualPayment}
              onSaveMonthlyPayment={handleSaveMonthlyPayment}
              onDeleteMonthlyPayment={handleDeleteMonthlyPayment}
              onOpenReceiptForPayment={handleOpenReceipt}
              onSendWhatsApp={handleSendWhatsApp}
              preselectedStudentId={targetStudentIdForAction}
            />
          )}

          {activeTab === 'fundExpenses' && (
            <FundExpensesView
              expenses={database.expenses}
              incomes={database.incomes}
              totalAnnualFeesSum={database.annualFees.reduce((s, a) => s + a.amount, 0)}
              totalMonthlyFeesSum={database.monthlyFees.reduce((s, m) => s + m.amount, 0)}
              settings={database.settings}
              onSaveExpense={handleSaveExpense}
              onDeleteExpense={handleDeleteExpense}
              onSaveIncome={handleSaveIncome}
              onDeleteIncome={handleDeleteIncome}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              students={database.students}
              halaqat={database.halaqat}
              recitations={database.recitations}
              annualFees={database.annualFees}
              monthlyFees={database.monthlyFees}
              expenses={database.expenses}
              incomes={database.incomes}
              attendance={database.attendance}
              settings={database.settings}
              onSendWhatsApp={handleSendWhatsApp}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsBackupView
              database={database}
              onUpdateSettings={handleUpdateSettings}
              onDatabaseReplaced={handleDatabaseReplaced}
              onShowToast={addToast}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      {selectedProfileStudent && (
        <StudentProfileModal
          student={selectedProfileStudent}
          halaqat={database.halaqat}
          recitations={database.recitations}
          annualFees={database.annualFees}
          monthlyFees={database.monthlyFees}
          attendance={database.attendance}
          settings={database.settings}
          onClose={() => setSelectedProfileStudent(null)}
          onOpenRecitation={handleOpenRecitationForStudent}
          onOpenPayment={handleOpenPaymentForStudent}
          onSendWhatsApp={handleSendWhatsApp}
          onPrintCard={handlePrintStudentCard}
        />
      )}

      {receiptModalData && (
        <ReceiptModal
          receiptData={receiptModalData}
          settings={database.settings}
          onClose={() => setReceiptModalData(null)}
          onSendWhatsApp={handleSendWhatsApp}
        />
      )}

      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
