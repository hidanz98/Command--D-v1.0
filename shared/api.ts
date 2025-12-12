export interface DemoResponse {
  message: string;
  timestamp: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ==============================================
// PRODUCT CODES
// ==============================================

export interface ProductCode {
  qrCode?: string;
  barcode?: string;
  qrCodeImage?: string;
  barcodeImage?: string;
}

export interface PrintCodesResponse {
  product: {
    id: string;
    name: string;
    sku?: string;
    category?: string;
  };
  qrCode: {
    data: string;
    image: string;
  };
  barcode: {
    data: string;
    image: string;
  };
  size: string;
}

// ==============================================
// MAINTENANCE
// ==============================================

export type MaintenanceType = 
  | 'PREVENTIVE' 
  | 'CORRECTIVE' 
  | 'PREDICTIVE' 
  | 'EMERGENCY' 
  | 'INSPECTION' 
  | 'CALIBRATION' 
  | 'CLEANING' 
  | 'UPGRADE';

export type MaintenanceStatus = 
  | 'SCHEDULED' 
  | 'IN_PROGRESS' 
  | 'COMPLETED' 
  | 'CANCELLED' 
  | 'PENDING' 
  | 'ON_HOLD';

export type MaintenancePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface ReplacedPart {
  name: string;
  quantity: number;
  cost?: number;
}

export interface ProductMaintenance {
  id: string;
  productId: string;
  type: MaintenanceType;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  title: string;
  description?: string;
  issue?: string;
  solution?: string;
  cost?: number;
  laborCost?: number;
  partsCost?: number;
  technician?: string;
  technicianId?: string;
  serviceProvider?: string;
  scheduledDate?: string;
  startedAt?: string;
  completedAt?: string;
  replacedParts?: ReplacedPart[];
  notes?: string;
  attachments: string[];
  nextMaintenanceDate?: string;
  tenantId: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceReport {
  total: number;
  byStatus: Record<MaintenanceStatus, number>;
  byType: Record<MaintenanceType, number>;
  totalCost: number;
  avgCost: number;
  maintenances: ProductMaintenance[];
}