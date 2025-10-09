import { useState, useEffect, useCallback } from "react";

interface PendingAction {
  id?: number;
  type: "create" | "update" | "delete";
  entity: "employee" | "transaction" | "payroll";
  data: any;
  timestamp: number;
}

interface OfflineStorage {
  employees: any[];
  transactions: any[];
  payrollCalculations: any[];
  lastSync: number;
}

export function useOffline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
  const [offlineData, setOfflineData] = useState<OfflineStorage>({
    employees: [],
    transactions: [],
    payrollCalculations: [],
    lastSync: Date.now(),
  });

  // Initialize offline functionality
  useEffect(() => {
    // Service Worker disabled to prevent fetch errors
    // if ("serviceWorker" in navigator) {
    //   navigator.serviceWorker
    //     .register("/sw.js")
    //     .then((registration) => {
    //       console.log("SW registered:", registration);
    //     })
    //     .catch((error) => {
    //       console.log("SW registration failed:", error);
    //     });
    // }

    // Setup IndexedDB
    initDB();

    // Load cached data
    loadOfflineData();

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      syncData();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Initialize IndexedDB
  const initDB = useCallback(async () => {
    try {
      const db = await openDB();
      console.log("IndexedDB initialized");
    } catch (error) {
      console.error("Failed to initialize IndexedDB:", error);
    }
  }, []);

  // Open IndexedDB connection
  const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("LocadoraDB", 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains("employees")) {
          db.createObjectStore("employees", { keyPath: "id" });
        }

        if (!db.objectStoreNames.contains("transactions")) {
          db.createObjectStore("transactions", { keyPath: "id" });
        }

        if (!db.objectStoreNames.contains("payroll_calculations")) {
          db.createObjectStore("payroll_calculations", { keyPath: "id" });
        }

        if (!db.objectStoreNames.contains("pending_actions")) {
          db.createObjectStore("pending_actions", {
            keyPath: "id",
            autoIncrement: true,
          });
        }

        if (!db.objectStoreNames.contains("app_data")) {
          db.createObjectStore("app_data", { keyPath: "key" });
        }
      };
    });
  };

  // Load offline data from IndexedDB
  const loadOfflineData = useCallback(async () => {
    try {
      const db = await openDB();

      // Load employees
      const employeesTransaction = db.transaction(["employees"], "readonly");
      const employeesStore = employeesTransaction.objectStore("employees");
      const employeesRequest = employeesStore.getAll();

      // Load pending actions
      const pendingTransaction = db.transaction(
        ["pending_actions"],
        "readonly",
      );
      const pendingStore = pendingTransaction.objectStore("pending_actions");
      const pendingRequest = pendingStore.getAll();

      employeesRequest.onsuccess = () => {
        setOfflineData((prev) => ({
          ...prev,
          employees: employeesRequest.result,
        }));
      };

      pendingRequest.onsuccess = () => {
        setPendingActions(pendingRequest.result);
      };
    } catch (error) {
      console.error("Failed to load offline data:", error);
    }
  }, []);

  // Save data to IndexedDB
  const saveToCache = useCallback(async (storeName: string, data: any) => {
    try {
      const db = await openDB();
      const transaction = db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);

      if (Array.isArray(data)) {
        // Clear store and add all items
        await store.clear();
        for (const item of data) {
          await store.add(item);
        }
      } else {
        await store.put(data);
      }

      console.log(`Data saved to ${storeName}`);
    } catch (error) {
      console.error(`Failed to save to ${storeName}:`, error);
    }
  }, []);

  // Add pending action for offline processing
  const addPendingAction = useCallback(
    async (action: Omit<PendingAction, "timestamp">) => {
      try {
        const actionWithTimestamp = {
          ...action,
          timestamp: Date.now(),
        };

        const db = await openDB();
        const transaction = db.transaction(["pending_actions"], "readwrite");
        const store = transaction.objectStore("pending_actions");
        await store.add(actionWithTimestamp);

        setPendingActions((prev) => [...prev, actionWithTimestamp]);

        // Try to sync immediately if online
        if (isOnline) {
          setTimeout(() => syncData(), 1000);
        }
      } catch (error) {
        console.error("Failed to add pending action:", error);
      }
    },
    [isOnline],
  );

  // Sync data when coming back online
  const syncData = useCallback(async () => {
    if (!isOnline || isSyncing) return;

    setIsSyncing(true);

    try {
      const db = await openDB();
      const transaction = db.transaction(["pending_actions"], "readonly");
      const store = transaction.objectStore("pending_actions");
      const request = store.getAll();

      request.onsuccess = async () => {
        const actions = request.result;

        for (const action of actions) {
          try {
            // Mock API call - replace with actual API
            const response = await fetch("/api/sync", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(action),
            });

            if (response.ok) {
              // Remove successful action
              const deleteTransaction = db.transaction(
                ["pending_actions"],
                "readwrite",
              );
              const deleteStore =
                deleteTransaction.objectStore("pending_actions");
              await deleteStore.delete(action.id);
            }
          } catch (error) {
            console.log("Failed to sync action:", action.id);
          }
        }

        // Reload pending actions
        loadOfflineData();

        // Update last sync time
        const appDataTransaction = db.transaction(["app_data"], "readwrite");
        const appDataStore = appDataTransaction.objectStore("app_data");
        await appDataStore.put({ key: "lastSync", value: Date.now() });
      };
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, loadOfflineData]);

  // Calculate payroll automatically
  const calculatePayroll = useCallback((employee: any) => {
    const grossSalary = employee.baseSalary + (employee.benefits || 0);
    const totalDiscounts = employee.discounts || 0;
    const inssDiscount = grossSalary * 0.11; // 11% INSS
    const irpfDiscount = grossSalary > 2112 ? (grossSalary - 2112) * 0.075 : 0; // IRPF simplificado

    const netSalary =
      grossSalary - totalDiscounts - inssDiscount - irpfDiscount;

    return {
      ...employee,
      grossSalary,
      netSalary,
      inssDiscount,
      irpfDiscount,
      totalDiscounts: totalDiscounts + inssDiscount + irpfDiscount,
      calculatedAt: new Date().toISOString(),
    };
  }, []);

  // Employee management functions
  const addEmployee = useCallback(
    async (employeeData: any) => {
      const employee = calculatePayroll({
        ...employeeData,
        id: `emp_${Date.now()}`,
        status: "active",
        createdAt: new Date().toISOString(),
      });

      // Save to local cache
      await saveToCache("employees", [...offlineData.employees, employee]);

      // Add to pending actions for sync
      await addPendingAction({
        type: "create",
        entity: "employee",
        data: employee,
      });

      setOfflineData((prev) => ({
        ...prev,
        employees: [...prev.employees, employee],
      }));

      return employee;
    },
    [calculatePayroll, saveToCache, addPendingAction, offlineData.employees],
  );

  const updateEmployee = useCallback(
    async (id: string, updates: any) => {
      const updatedEmployees = offlineData.employees.map((emp) =>
        emp.id === id ? calculatePayroll({ ...emp, ...updates }) : emp,
      );

      await saveToCache("employees", updatedEmployees);

      await addPendingAction({
        type: "update",
        entity: "employee",
        data: { id, updates },
      });

      setOfflineData((prev) => ({
        ...prev,
        employees: updatedEmployees,
      }));
    },
    [calculatePayroll, saveToCache, addPendingAction, offlineData.employees],
  );

  const deleteEmployee = useCallback(
    async (id: string) => {
      const filteredEmployees = offlineData.employees.filter(
        (emp) => emp.id !== id,
      );

      await saveToCache("employees", filteredEmployees);

      await addPendingAction({
        type: "delete",
        entity: "employee",
        data: { id },
      });

      setOfflineData((prev) => ({
        ...prev,
        employees: filteredEmployees,
      }));
    },
    [saveToCache, addPendingAction, offlineData.employees],
  );

  return {
    isOnline,
    isSyncing,
    pendingActions: pendingActions.length,
    offlineData,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    calculatePayroll,
    syncData,
    saveToCache,
  };
}
