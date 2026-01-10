import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Tipos de papéis
export type UserRole = 'MASTER_ADMIN' | 'OWNER' | 'MANAGER' | 'OPERATOR' | 'VIEWER';

// Definição de permissões
export type Permission = 
  // Produtos
  | 'products.view'
  | 'products.create'
  | 'products.edit'
  | 'products.delete'
  | 'products.import'
  | 'products.export'
  // Clientes
  | 'clients.view'
  | 'clients.create'
  | 'clients.edit'
  | 'clients.delete'
  | 'clients.export'
  // Pedidos
  | 'orders.view'
  | 'orders.create'
  | 'orders.edit'
  | 'orders.cancel'
  | 'orders.return'
  | 'orders.export'
  // Financeiro
  | 'finance.view'
  | 'finance.reports'
  | 'finance.payments'
  | 'finance.refunds'
  // Usuários
  | 'users.view'
  | 'users.create'
  | 'users.edit'
  | 'users.delete'
  | 'users.permissions'
  // Configurações
  | 'settings.view'
  | 'settings.edit'
  | 'settings.security'
  | 'settings.backup'
  // Sistema
  | 'system.audit'
  | 'system.diagnostics'
  | 'system.import'
  | 'system.export'
  // Dashboard
  | 'dashboard.view'
  | 'dashboard.premium'
  | 'dashboard.reports';

// Permissões por papel
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  // Master Admin (Otávio) - Acesso total + funcionalidades do sistema
  MASTER_ADMIN: [
    'products.view', 'products.create', 'products.edit', 'products.delete', 'products.import', 'products.export',
    'clients.view', 'clients.create', 'clients.edit', 'clients.delete', 'clients.export',
    'orders.view', 'orders.create', 'orders.edit', 'orders.cancel', 'orders.return', 'orders.export',
    'finance.view', 'finance.reports', 'finance.payments', 'finance.refunds',
    'users.view', 'users.create', 'users.edit', 'users.delete', 'users.permissions',
    'settings.view', 'settings.edit', 'settings.security', 'settings.backup',
    'system.audit', 'system.diagnostics', 'system.import', 'system.export',
    'dashboard.view', 'dashboard.premium', 'dashboard.reports',
  ],
  
  // Dono da Empresa - Quase tudo, exceto funcionalidades de sistema
  OWNER: [
    'products.view', 'products.create', 'products.edit', 'products.delete', 'products.import', 'products.export',
    'clients.view', 'clients.create', 'clients.edit', 'clients.delete', 'clients.export',
    'orders.view', 'orders.create', 'orders.edit', 'orders.cancel', 'orders.return', 'orders.export',
    'finance.view', 'finance.reports', 'finance.payments', 'finance.refunds',
    'users.view', 'users.create', 'users.edit', 'users.delete', 'users.permissions',
    'settings.view', 'settings.edit', 'settings.security', 'settings.backup',
    'system.audit', 'system.import', 'system.export',
    'dashboard.view', 'dashboard.premium', 'dashboard.reports',
  ],
  
  // Gerente - Gerencia operações, sem acesso a configurações críticas
  MANAGER: [
    'products.view', 'products.create', 'products.edit', 'products.import', 'products.export',
    'clients.view', 'clients.create', 'clients.edit', 'clients.export',
    'orders.view', 'orders.create', 'orders.edit', 'orders.cancel', 'orders.return', 'orders.export',
    'finance.view', 'finance.reports', 'finance.payments',
    'users.view', 'users.create', 'users.edit',
    'settings.view',
    'system.audit',
    'dashboard.view', 'dashboard.premium', 'dashboard.reports',
  ],
  
  // Operador - Operações do dia a dia
  OPERATOR: [
    'products.view', 'products.edit',
    'clients.view', 'clients.create', 'clients.edit',
    'orders.view', 'orders.create', 'orders.edit', 'orders.return',
    'finance.view',
    'dashboard.view',
  ],
  
  // Visualizador - Apenas leitura
  VIEWER: [
    'products.view',
    'clients.view',
    'orders.view',
    'dashboard.view',
  ],
};

// Labels dos papéis
export const ROLE_LABELS: Record<UserRole, string> = {
  MASTER_ADMIN: 'Master Admin',
  OWNER: 'Dono',
  MANAGER: 'Gerente',
  OPERATOR: 'Operador',
  VIEWER: 'Visualizador',
};

// Cores dos papéis
export const ROLE_COLORS: Record<UserRole, string> = {
  MASTER_ADMIN: 'bg-purple-500',
  OWNER: 'bg-amber-500',
  MANAGER: 'bg-blue-500',
  OPERATOR: 'bg-green-500',
  VIEWER: 'bg-slate-500',
};

// Descrições dos papéis
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  MASTER_ADMIN: 'Acesso total ao sistema, incluindo configurações de licenciamento',
  OWNER: 'Dono da empresa com acesso completo às operações e configurações',
  MANAGER: 'Gerente com acesso a operações e relatórios, sem configurações críticas',
  OPERATOR: 'Operador do dia a dia com acesso limitado',
  VIEWER: 'Apenas visualização de dados, sem poder de alteração',
};

// Interface do usuário
interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  customPermissions?: Permission[];
}

// Contexto
interface PermissionsContextType {
  user: User | null;
  role: UserRole;
  permissions: Permission[];
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  canAccessRoute: (route: string) => boolean;
  isAtLeast: (role: UserRole) => boolean;
  setUser: (user: User | null) => void;
  getRolePermissions: (role: UserRole) => Permission[];
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

// Hierarquia de papéis (maior número = mais permissões)
const ROLE_HIERARCHY: Record<UserRole, number> = {
  VIEWER: 1,
  OPERATOR: 2,
  MANAGER: 3,
  OWNER: 4,
  MASTER_ADMIN: 5,
};

// Rotas protegidas
const ROUTE_PERMISSIONS: Record<string, Permission[]> = {
  '/dashboard-premium': ['dashboard.premium'],
  '/painel': ['dashboard.premium'],
  '/auditoria': ['system.audit'],
  '/logs': ['system.audit'],
  '/seguranca': ['settings.security'],
  '/security': ['settings.security'],
  '/configuracoes': ['settings.view'],
  '/backups': ['settings.backup'],
  '/importacao': ['system.import'],
  '/importar': ['system.import'],
  '/usuarios': ['users.view'],
  '/permissoes': ['users.permissions'],
  '/financeiro': ['finance.view'],
  '/relatorios': ['finance.reports'],
  '/diagnostico': ['system.diagnostics'],
};

export function PermissionsProvider({ children }: { children: ReactNode }) {
  // Usuário mockado para teste (em produção, viria do AuthContext)
  const [user, setUser] = useState<User | null>({
    id: '1',
    name: 'Felipe Admin',
    email: 'felipe@empresa.com',
    role: 'OWNER', // Mudar para testar diferentes papéis
  });

  const role = user?.role || 'VIEWER';
  
  // Combinar permissões do papel + customizadas
  const permissions = [
    ...ROLE_PERMISSIONS[role],
    ...(user?.customPermissions || [])
  ];

  // Verificar se tem uma permissão específica
  const hasPermission = (permission: Permission): boolean => {
    return permissions.includes(permission);
  };

  // Verificar se tem qualquer uma das permissões
  const hasAnyPermission = (perms: Permission[]): boolean => {
    return perms.some(p => permissions.includes(p));
  };

  // Verificar se tem todas as permissões
  const hasAllPermissions = (perms: Permission[]): boolean => {
    return perms.every(p => permissions.includes(p));
  };

  // Verificar se pode acessar uma rota
  const canAccessRoute = (route: string): boolean => {
    const requiredPermissions = ROUTE_PERMISSIONS[route];
    if (!requiredPermissions) return true; // Rota não protegida
    return hasAnyPermission(requiredPermissions);
  };

  // Verificar se o papel é pelo menos X na hierarquia
  const isAtLeast = (minRole: UserRole): boolean => {
    return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[minRole];
  };

  // Obter permissões de um papel
  const getRolePermissions = (r: UserRole): Permission[] => {
    return ROLE_PERMISSIONS[r];
  };

  return (
    <PermissionsContext.Provider value={{
      user,
      role,
      permissions,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      canAccessRoute,
      isAtLeast,
      setUser,
      getRolePermissions,
    }}>
      {children}
    </PermissionsContext.Provider>
  );
}

// Hook para usar permissões
export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
}

// Componente de proteção de conteúdo
interface RequirePermissionProps {
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  minRole?: UserRole;
  fallback?: ReactNode;
  children: ReactNode;
}

export function RequirePermission({
  permission,
  permissions,
  requireAll = false,
  minRole,
  fallback = null,
  children
}: RequirePermissionProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isAtLeast } = usePermissions();

  let hasAccess = true;

  if (minRole) {
    hasAccess = isAtLeast(minRole);
  }

  if (permission) {
    hasAccess = hasAccess && hasPermission(permission);
  }

  if (permissions) {
    hasAccess = hasAccess && (requireAll 
      ? hasAllPermissions(permissions) 
      : hasAnyPermission(permissions)
    );
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Componente de proteção de botão/ação
interface ProtectedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  permission?: Permission;
  minRole?: UserRole;
  children: ReactNode;
}

export function ProtectedButton({
  permission,
  minRole,
  children,
  ...props
}: ProtectedButtonProps) {
  const { hasPermission, isAtLeast } = usePermissions();

  let hasAccess = true;

  if (minRole) {
    hasAccess = isAtLeast(minRole);
  }

  if (permission) {
    hasAccess = hasAccess && hasPermission(permission);
  }

  if (!hasAccess) {
    return (
      <button {...props} disabled className="opacity-50 cursor-not-allowed">
        {children}
      </button>
    );
  }

  return <button {...props}>{children}</button>;
}

export default PermissionsContext;

