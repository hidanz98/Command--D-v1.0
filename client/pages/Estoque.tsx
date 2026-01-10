import React, { useState } from "react";
import {
  Package,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Camera,
  Lightbulb,
  Mic,
  Video,
  Plane,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Wrench,
  Calendar,
  DollarSign,
  BarChart3,
  Grid3X3,
  List,
  QrCode,
  Tag,
  MapPin,
  History,
  TrendingUp,
  Download,
  Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// Tipos
interface Equipment {
  id: string;
  code: string;
  name: string;
  category: string;
  status: 'available' | 'rented' | 'maintenance' | 'reserved';
  condition: 'excellent' | 'good' | 'fair' | 'needs_repair';
  dailyRate: number;
  purchaseValue: number;
  purchaseDate: Date;
  lastMaintenance?: Date;
  nextMaintenance?: Date;
  totalRentals: number;
  totalRevenue: number;
  location: string;
  serialNumber?: string;
  notes?: string;
  currentRental?: {
    clientName: string;
    returnDate: Date;
  };
}

// Dados mockados
const MOCK_EQUIPMENT: Equipment[] = [
  {
    id: '1',
    code: 'CAM-001',
    name: 'Canon C300 Mark III',
    category: 'camera',
    status: 'rented',
    condition: 'excellent',
    dailyRate: 350,
    purchaseValue: 45000,
    purchaseDate: new Date(2024, 5, 15),
    lastMaintenance: new Date(2025, 11, 10),
    nextMaintenance: new Date(2026, 2, 10),
    totalRentals: 45,
    totalRevenue: 18500,
    location: 'Prateleira A1',
    serialNumber: 'CN5D-2024-001',
    currentRental: {
      clientName: 'Globo Filmes',
      returnDate: new Date(2026, 0, 10)
    }
  },
  {
    id: '2',
    code: 'CAM-002',
    name: 'Canon C300 Mark III',
    category: 'camera',
    status: 'available',
    condition: 'excellent',
    dailyRate: 350,
    purchaseValue: 45000,
    purchaseDate: new Date(2024, 5, 15),
    lastMaintenance: new Date(2025, 10, 20),
    nextMaintenance: new Date(2026, 1, 20),
    totalRentals: 38,
    totalRevenue: 15200,
    location: 'Prateleira A1',
    serialNumber: 'CN5D-2024-002'
  },
  {
    id: '3',
    code: 'CAM-003',
    name: 'RED Komodo',
    category: 'camera',
    status: 'available',
    condition: 'good',
    dailyRate: 600,
    purchaseValue: 85000,
    purchaseDate: new Date(2024, 2, 10),
    lastMaintenance: new Date(2025, 11, 5),
    totalRentals: 28,
    totalRevenue: 15200,
    location: 'Prateleira A2',
    serialNumber: 'RED-KMD-001'
  },
  {
    id: '4',
    code: 'DRN-001',
    name: 'DJI Inspire 2',
    category: 'drone',
    status: 'reserved',
    condition: 'excellent',
    dailyRate: 400,
    purchaseValue: 35000,
    purchaseDate: new Date(2024, 8, 1),
    totalRentals: 32,
    totalRevenue: 12800,
    location: 'Armário Drones',
    serialNumber: 'DJI-INS2-001',
    currentRental: {
      clientName: 'Ana Costa',
      returnDate: new Date(2026, 0, 25)
    }
  },
  {
    id: '5',
    code: 'ILU-001',
    name: 'Kit ARRI SkyPanel S60',
    category: 'lighting',
    status: 'available',
    condition: 'excellent',
    dailyRate: 250,
    purchaseValue: 28000,
    purchaseDate: new Date(2024, 4, 20),
    lastMaintenance: new Date(2025, 9, 15),
    totalRentals: 38,
    totalRevenue: 11500,
    location: 'Prateleira B1'
  },
  {
    id: '6',
    code: 'ILU-002',
    name: 'Kit LED Aputure 300D II',
    category: 'lighting',
    status: 'rented',
    condition: 'good',
    dailyRate: 120,
    purchaseValue: 12000,
    purchaseDate: new Date(2024, 1, 10),
    totalRentals: 52,
    totalRevenue: 6200,
    location: 'Prateleira B2',
    currentRental: {
      clientName: 'MS Produções',
      returnDate: new Date(2026, 0, 12)
    }
  },
  {
    id: '7',
    code: 'AUD-001',
    name: 'Kit Áudio Sennheiser MKH',
    category: 'audio',
    status: 'maintenance',
    condition: 'needs_repair',
    dailyRate: 150,
    purchaseValue: 18000,
    purchaseDate: new Date(2023, 8, 5),
    lastMaintenance: new Date(2025, 12, 8),
    totalRentals: 62,
    totalRevenue: 8500,
    location: 'Manutenção',
    notes: 'Receptor wireless com defeito'
  },
  {
    id: '8',
    code: 'GRP-001',
    name: 'Gimbal DJI Ronin 2',
    category: 'grip',
    status: 'available',
    condition: 'fair',
    dailyRate: 150,
    purchaseValue: 22000,
    purchaseDate: new Date(2023, 5, 15),
    totalRentals: 42,
    totalRevenue: 5800,
    location: 'Prateleira C1'
  },
];

// Categorias
const CATEGORIES = [
  { id: 'camera', name: 'Câmeras', icon: Camera, color: 'bg-blue-500' },
  { id: 'lighting', name: 'Iluminação', icon: Lightbulb, color: 'bg-amber-500' },
  { id: 'audio', name: 'Áudio', icon: Mic, color: 'bg-green-500' },
  { id: 'grip', name: 'Grip/Suporte', icon: Package, color: 'bg-purple-500' },
  { id: 'drone', name: 'Drones', icon: Plane, color: 'bg-rose-500' },
];

export default function Estoque() {
  const [equipment, setEquipment] = useState<Equipment[]>(MOCK_EQUIPMENT);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

  // Filtrar equipamentos
  const filteredEquipment = equipment.filter(eq => {
    const matchesSearch = !searchTerm || 
      eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || eq.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || eq.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Estatísticas
  const stats = {
    total: equipment.length,
    available: equipment.filter(e => e.status === 'available').length,
    rented: equipment.filter(e => e.status === 'rented').length,
    maintenance: equipment.filter(e => e.status === 'maintenance').length,
    reserved: equipment.filter(e => e.status === 'reserved').length,
    totalValue: equipment.reduce((acc, e) => acc + e.purchaseValue, 0),
    totalRevenue: equipment.reduce((acc, e) => acc + e.totalRevenue, 0),
  };

  // Ícone da categoria
  const getCategoryIcon = (category: string) => {
    const cat = CATEGORIES.find(c => c.id === category);
    if (cat) {
      const Icon = cat.icon;
      return <Icon className="h-4 w-4" />;
    }
    return <Package className="h-4 w-4" />;
  };

  // Status badge
  const getStatusBadge = (status: Equipment['status']) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/50"><CheckCircle2 className="h-3 w-3 mr-1" />Disponível</Badge>;
      case 'rented':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50"><Clock className="h-3 w-3 mr-1" />Locado</Badge>;
      case 'maintenance':
        return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/50"><Wrench className="h-3 w-3 mr-1" />Manutenção</Badge>;
      case 'reserved':
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50"><Calendar className="h-3 w-3 mr-1" />Reservado</Badge>;
      default:
        return null;
    }
  };

  // Condição badge
  const getConditionBadge = (condition: Equipment['condition']) => {
    switch (condition) {
      case 'excellent':
        return <Badge variant="outline" className="text-green-400 border-green-500/50">Excelente</Badge>;
      case 'good':
        return <Badge variant="outline" className="text-blue-400 border-blue-500/50">Bom</Badge>;
      case 'fair':
        return <Badge variant="outline" className="text-amber-400 border-amber-500/50">Regular</Badge>;
      case 'needs_repair':
        return <Badge variant="outline" className="text-red-400 border-red-500/50">Reparo Necessário</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-xl border-b border-slate-700/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Controle de Estoque</h1>
                <p className="text-sm text-slate-400">Gerencie seus equipamentos</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="border-slate-600"
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
              </Button>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="h-4 w-4 mr-2" />
                Novo Equipamento
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Package className="h-8 w-8 text-indigo-400" />
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-slate-400">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-950/50 to-emerald-950/50 border-green-500/30">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-green-400" />
                <div>
                  <p className="text-2xl font-bold text-green-400">{stats.available}</p>
                  <p className="text-xs text-slate-400">Disponíveis</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-950/50 to-cyan-950/50 border-blue-500/30">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-blue-400" />
                <div>
                  <p className="text-2xl font-bold text-blue-400">{stats.rented}</p>
                  <p className="text-xs text-slate-400">Locados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-950/50 to-amber-950/50 border-orange-500/30">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Wrench className="h-8 w-8 text-orange-400" />
                <div>
                  <p className="text-2xl font-bold text-orange-400">{stats.maintenance}</p>
                  <p className="text-xs text-slate-400">Manutenção</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-4">
              <div>
                <p className="text-lg font-bold text-green-400">R$ {(stats.totalRevenue / 1000).toFixed(0)}k</p>
                <p className="text-xs text-slate-400">Receita Gerada</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-4">
              <div>
                <p className="text-lg font-bold">R$ {(stats.totalValue / 1000).toFixed(0)}k</p>
                <p className="text-xs text-slate-400">Valor Inventário</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar equipamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40 bg-slate-800 border-slate-700">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {CATEGORIES.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-slate-800 border-slate-700">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="available">Disponível</SelectItem>
              <SelectItem value="rented">Locado</SelectItem>
              <SelectItem value="reserved">Reservado</SelectItem>
              <SelectItem value="maintenance">Manutenção</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Grid/Lista de Equipamentos */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredEquipment.map(eq => (
              <Card 
                key={eq.id} 
                className={cn(
                  "bg-slate-800/50 border-slate-700 hover:border-slate-600 cursor-pointer transition-all",
                  eq.status === 'maintenance' && "border-orange-500/30",
                  eq.condition === 'needs_repair' && "border-red-500/30"
                )}
                onClick={() => setSelectedEquipment(eq)}
              >
                <CardContent className="pt-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      eq.category === 'camera' ? 'bg-blue-500/20 text-blue-400' :
                      eq.category === 'lighting' ? 'bg-amber-500/20 text-amber-400' :
                      eq.category === 'audio' ? 'bg-green-500/20 text-green-400' :
                      eq.category === 'drone' ? 'bg-rose-500/20 text-rose-400' :
                      'bg-purple-500/20 text-purple-400'
                    )}>
                      {getCategoryIcon(eq.category)}
                    </div>
                    {getStatusBadge(eq.status)}
                  </div>

                  {/* Info */}
                  <div className="space-y-2">
                    <div>
                      <p className="font-bold truncate">{eq.name}</p>
                      <p className="text-xs text-slate-400">{eq.code}</p>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Diária:</span>
                      <span className="font-medium text-green-400">R$ {eq.dailyRate}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Condição:</span>
                      {getConditionBadge(eq.condition)}
                    </div>

                    {eq.currentRental && (
                      <div className="p-2 bg-blue-500/10 rounded border border-blue-500/30 text-xs">
                        <p className="text-blue-400 font-medium">{eq.currentRental.clientName}</p>
                        <p className="text-slate-500">
                          Devolução: {eq.currentRental.returnDate.toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-700 text-xs text-slate-500">
                      <span>{eq.totalRentals} locações</span>
                      <span>R$ {eq.totalRevenue.toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Código</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Equipamento</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-slate-400">Status</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-slate-400">Condição</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Diária</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Locações</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-slate-400">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEquipment.map(eq => (
                    <tr key={eq.id} className="border-b border-slate-800 hover:bg-slate-700/30">
                      <td className="py-3 px-4 font-mono text-sm">{eq.code}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "p-1.5 rounded",
                            eq.category === 'camera' ? 'bg-blue-500/20 text-blue-400' :
                            eq.category === 'lighting' ? 'bg-amber-500/20 text-amber-400' :
                            eq.category === 'audio' ? 'bg-green-500/20 text-green-400' :
                            eq.category === 'drone' ? 'bg-rose-500/20 text-rose-400' :
                            'bg-purple-500/20 text-purple-400'
                          )}>
                            {getCategoryIcon(eq.category)}
                          </div>
                          <span className="font-medium">{eq.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">{getStatusBadge(eq.status)}</td>
                      <td className="py-3 px-4 text-center">{getConditionBadge(eq.condition)}</td>
                      <td className="py-3 px-4 text-right font-medium text-green-400">R$ {eq.dailyRate}</td>
                      <td className="py-3 px-4 text-right">{eq.totalRentals}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedEquipment(eq)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <QrCode className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Modal de Detalhes */}
      <Dialog open={!!selectedEquipment} onOpenChange={() => setSelectedEquipment(null)}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl">
          {selectedEquipment && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getCategoryIcon(selectedEquipment.category)}
                  {selectedEquipment.name}
                </DialogTitle>
                <DialogDescription>
                  Código: {selectedEquipment.code} • Serial: {selectedEquipment.serialNumber || 'N/A'}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Status</p>
                    {getStatusBadge(selectedEquipment.status)}
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Condição</p>
                    {getConditionBadge(selectedEquipment.condition)}
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Localização</p>
                    <p className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {selectedEquipment.location}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Valor de Aquisição</p>
                    <p className="font-medium">R$ {selectedEquipment.purchaseValue.toLocaleString('pt-BR')}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Diária</p>
                    <p className="text-xl font-bold text-green-400">R$ {selectedEquipment.dailyRate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Total de Locações</p>
                    <p className="font-medium">{selectedEquipment.totalRentals}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Receita Gerada</p>
                    <p className="font-medium text-green-400">R$ {selectedEquipment.totalRevenue.toLocaleString('pt-BR')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Última Manutenção</p>
                    <p className="font-medium">
                      {selectedEquipment.lastMaintenance?.toLocaleDateString('pt-BR') || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {selectedEquipment.currentRental && (
                <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30 mt-4">
                  <p className="text-sm text-blue-400 font-medium mb-1">Locação Atual</p>
                  <p>Cliente: {selectedEquipment.currentRental.clientName}</p>
                  <p className="text-sm text-slate-400">
                    Devolução prevista: {selectedEquipment.currentRental.returnDate.toLocaleDateString('pt-BR')}
                  </p>
                </div>
              )}

              {selectedEquipment.notes && (
                <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/30 mt-4">
                  <p className="text-sm text-orange-400 font-medium mb-1">Observações</p>
                  <p className="text-sm">{selectedEquipment.notes}</p>
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button variant="outline" className="border-slate-600">
                  <QrCode className="h-4 w-4 mr-2" />
                  QR Code
                </Button>
                <Button variant="outline" className="border-slate-600">
                  <History className="h-4 w-4 mr-2" />
                  Histórico
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

