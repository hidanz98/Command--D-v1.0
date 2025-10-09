import { useEffect, useState, useCallback } from "react";

interface TimeEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  clockIn?: string;
  clockOut?: string;
  breakStart?: string;
  breakEnd?: string;
  lunchStart?: string;
  lunchEnd?: string;
  totalHours: number;
  overtimeHours: number;
  status: "working" | "break" | "lunch" | "clocked_out" | "absent";
  location?: string;
  notes: string;
  isEdited: boolean;
}

interface PayrollData {
  employeeId: string;
  period: string;
  totalWorkedHours: number;
  regularHours: number;
  overtimeHours: number;
  totalDays: number;
  workDays: number;
  absenceDays: number;
  lateArrivals: number;
  averageHoursPerDay: number;
}

export const usePayrollIntegration = () => {
  const [payrollData, setPayrollData] = useState<PayrollData[]>([]);

  const calculatePayrollFromTimesheet = useCallback((period: string) => {
    // Get all timesheet entries for the period
    const entries = getTimesheetEntriesForPeriod(period);
    
    // Group by employee
    const employeeGroups = groupByEmployee(entries);
    
    // Calculate payroll data for each employee
    const calculatedData = Object.entries(employeeGroups).map(([employeeId, entries]) => {
      return calculateEmployeePayrollData(employeeId, period, entries);
    });

    setPayrollData(calculatedData);
    return calculatedData;
  }, []);

  const getTimesheetEntriesForPeriod = (period: string): TimeEntry[] => {
    const entries: TimeEntry[] = [];
    
    // Get the year and month from period (YYYY-MM)
    const [year, month] = period.split('-');
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0);
    
    // Iterate through each day of the month
    for (let day = 1; day <= endDate.getDate(); day++) {
      const dateString = `${year}-${month.padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      
      // Get all employee entries for this date from localStorage
      const employees = getActiveEmployees();
      
      employees.forEach(employee => {
        const entryData = localStorage.getItem(`timesheet_${employee.id}_${dateString}`);
        if (entryData) {
          const entry: TimeEntry = JSON.parse(entryData);
          entries.push(entry);
        }
      });
    }
    
    return entries;
  };

  const getActiveEmployees = () => {
    // This should return the list of active employees
    // For now, we'll return a mock list
    return [
      { id: "1", name: "João Silva Santos" },
      { id: "2", name: "Maria Santos Oliveira" },
    ];
  };

  const groupByEmployee = (entries: TimeEntry[]) => {
    return entries.reduce((groups, entry) => {
      if (!groups[entry.employeeId]) {
        groups[entry.employeeId] = [];
      }
      groups[entry.employeeId].push(entry);
      return groups;
    }, {} as Record<string, TimeEntry[]>);
  };

  const calculateEmployeePayrollData = (employeeId: string, period: string, entries: TimeEntry[]): PayrollData => {
    const workDays = entries.filter(entry => entry.status !== "absent").length;
    const absenceDays = entries.filter(entry => entry.status === "absent").length;
    const totalDays = entries.length;
    
    const totalWorkedHours = entries.reduce((sum, entry) => sum + entry.totalHours, 0);
    const totalOvertimeHours = entries.reduce((sum, entry) => sum + entry.overtimeHours, 0);
    const regularHours = totalWorkedHours - totalOvertimeHours;
    
    // Count late arrivals (assuming work starts at 8:00)
    const lateArrivals = entries.filter(entry => {
      if (entry.clockIn) {
        const clockInTime = entry.clockIn.split(':');
        const clockInHour = parseInt(clockInTime[0]);
        const clockInMinute = parseInt(clockInTime[1]);
        // Late if clock in after 8:15 AM
        return clockInHour > 8 || (clockInHour === 8 && clockInMinute > 15);
      }
      return false;
    }).length;
    
    const averageHoursPerDay = workDays > 0 ? totalWorkedHours / workDays : 0;

    return {
      employeeId,
      period,
      totalWorkedHours,
      regularHours,
      overtimeHours: totalOvertimeHours,
      totalDays,
      workDays,
      absenceDays,
      lateArrivals,
      averageHoursPerDay,
    };
  };

  const getPayrollDataForEmployee = (employeeId: string, period: string): PayrollData | null => {
    return payrollData.find(data => data.employeeId === employeeId && data.period === period) || null;
  };

  const updatePayrollData = (period: string) => {
    calculatePayrollFromTimesheet(period);
  };

  // Auto-update payroll data when timesheet changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && e.key.startsWith('timesheet_')) {
        // Extract period from the current month
        const currentPeriod = new Date().toISOString().slice(0, 7);
        calculatePayrollFromTimesheet(currentPeriod);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events when timesheet is updated in same tab
    const handleTimesheetUpdate = () => {
      const currentPeriod = new Date().toISOString().slice(0, 7);
      calculatePayrollFromTimesheet(currentPeriod);
    };

    window.addEventListener('timesheetUpdated', handleTimesheetUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('timesheetUpdated', handleTimesheetUpdate);
    };
  }, [calculatePayrollFromTimesheet]);

  return {
    payrollData,
    calculatePayrollFromTimesheet,
    getPayrollDataForEmployee,
    updatePayrollData,
  };
};

// Helper function to trigger timesheet update events
export const triggerTimesheetUpdate = () => {
  window.dispatchEvent(new CustomEvent('timesheetUpdated'));
};

// Enhanced hook for payroll calculations with tax integration
export const useAdvancedPayrollCalculations = () => {
  const { payrollData, calculatePayrollFromTimesheet } = usePayrollIntegration();

  const calculateSalaryWithTimesheet = (
    baseSalary: number,
    employeeId: string,
    period: string,
    salaryType: "monthly" | "hourly" = "monthly"
  ) => {
    const timesheetData = payrollData.find(
      data => data.employeeId === employeeId && data.period === period
    );

    if (!timesheetData) {
      return {
        baseSalary,
        regularPay: baseSalary,
        overtimePay: 0,
        totalSalary: baseSalary,
        workedHours: 0,
        overtimeHours: 0,
        absenceDays: 0,
        lateArrivals: 0,
      };
    }

    if (salaryType === "hourly") {
      // For hourly employees
      const hourlyRate = baseSalary;
      const regularPay = timesheetData.regularHours * hourlyRate;
      const overtimePay = timesheetData.overtimeHours * hourlyRate * 1.5; // 50% overtime
      const totalSalary = regularPay + overtimePay;

      return {
        baseSalary,
        regularPay,
        overtimePay,
        totalSalary,
        workedHours: timesheetData.totalWorkedHours,
        overtimeHours: timesheetData.overtimeHours,
        absenceDays: timesheetData.absenceDays,
        lateArrivals: timesheetData.lateArrivals,
      };
    } else {
      // For monthly employees
      const expectedHours = 220; // Standard monthly hours
      const hourlyRate = baseSalary / expectedHours;
      
      // Base salary if worked minimum expected hours
      let regularPay = baseSalary;
      
      // Deduct for absences if significant
      if (timesheetData.absenceDays > 0) {
        const deductionPerDay = baseSalary / 22; // 22 work days per month
        regularPay -= timesheetData.absenceDays * deductionPerDay;
      }
      
      // Add overtime pay
      const overtimePay = timesheetData.overtimeHours * hourlyRate * 1.5;
      const totalSalary = regularPay + overtimePay;

      return {
        baseSalary,
        regularPay,
        overtimePay,
        totalSalary,
        workedHours: timesheetData.totalWorkedHours,
        overtimeHours: timesheetData.overtimeHours,
        absenceDays: timesheetData.absenceDays,
        lateArrivals: timesheetData.lateArrivals,
      };
    }
  };

  return {
    payrollData,
    calculatePayrollFromTimesheet,
    calculateSalaryWithTimesheet,
  };
};
