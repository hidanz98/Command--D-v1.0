import React, { useState, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  User,
  Package,
  Film,
  DollarSign,
  Eye,
  Plus,
  Filter,
  List,
  Grid3X3,
  Camera,
  Lightbulb,
  Mic,
  Video,
  Plane,
  AlertCircle,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Tipos
interface Reservation {
  id: string;
  clientName: string;
  projectName: string;
  productionDirector?: string;
  location?: string;
  startDate: Date;
  endDate: Date;
  status: 'confirmed' | 'pending' | 'returned' | 'cancelled';
  total: number;
  items: {
    name: string;
    category: string;
    quantity: number;
  }[];
  color: string;
}

// Categorias de equipamentos
const CATEGORIES = [
  { id: 'camera', name: 'Câmeras', icon: Camera, color: 'bg-blue-500' },
  { id: 'lighting', name: 'Iluminação', icon: Lightbulb, color: 'bg-amber-500' },
  { id: 'audio', name: 'Áudio', icon: Mic, color: 'bg-green-500' },
  { id: 'grip', name: 'Grip/Suporte', icon: Video, color: 'bg-purple-500' },
  { id: 'drone', name: 'Drones', icon: Plane, color: 'bg-rose-500' },
];

// Dados mockados de reservas
const MOCK_RESERVATIONS: Reservation[] = [
  {
    id: 'RES-001',
    clientName: 'Globo Filmes Ltda',
    projectName: 'Novela "Amor e Destino"',
    productionDirector: 'Carlos Henrique',
    location: 'Praça da Liberdade, BH',
    startDate: new Date(2026, 0, 6),
    endDate: new Date(2026, 0, 10),
    status: 'confirmed',
    total: 5000,
    items: [
      { name: 'Canon C300 Mark III', category: 'camera', quantity: 2 },
      { name: 'Kit ARRI', category: 'lighting', quantity: 1 },
    ],
    color: 'bg-blue-500',
  },
  {
    id: 'RES-002',
    clientName: 'Maria Santos Produções',
    projectName: 'Documentário "BH em Cores"',
    productionDirector: 'Maria Santos',
    location: 'Pampulha',
    startDate: new Date(2026, 0, 8),
    endDate: new Date(2026, 0, 12),
    status: 'confirmed',
    total: 2500,
    items: [
      { name: 'Sony A7S III', category: 'camera', quantity: 1 },
      { name: 'Kit LED Aputure', category: 'lighting', quantity: 2 },
    ],
    color: 'bg-green-500',
  },
  {
    id: 'RES-003',
    clientName: 'Produtora XYZ',
    projectName: 'Comercial TV - Banco Digital',
    productionDirector: 'Roberto Lima',
    location: 'Estúdio Central BH',
    startDate: new Date(2026, 0, 15),
    endDate: new Date(2026, 0, 18),
    status: 'pending',
    total: 8000,
    items: [
      { name: 'RED Komodo', category: 'camera', quantity: 1 },
      { name: 'Gimbal DJI Ronin 2', category: 'grip', quantity: 1 },
      { name: 'Kit Áudio Sennheiser', category: 'audio', quantity: 1 },
    ],
    color: 'bg-amber-500',
  },
  {
    id: 'RES-004',
    clientName: 'Ana Costa',
    projectName: 'Clipe "Sertanejo Raiz"',
    productionDirector: 'Pedro Almeida',
    location: 'Fazenda Sete Lagoas',
    startDate: new Date(2026, 0, 20),
    endDate: new Date(2026, 0, 25),
    status: 'confirmed',
    total: 6000,
    items: [
      { name: 'DJI Inspire 2', category: 'drone', quantity: 1 },
      { name: 'Sony FX6', category: 'camera', quantity: 2 },
    ],
    color: 'bg-rose-500',
  },
  {
    id: 'RES-005',
    clientName: 'Festival Cinema BH',
    projectName: 'Cobertura Festival 2026',
    location: 'Palácio das Artes',
    startDate: new Date(2026, 0, 10),
    endDate: new Date(2026, 0, 11),
    status: 'returned',
    total: 1200,
    items: [
      { name: 'Kit Áudio Rode', category: 'audio', quantity: 3 },
    ],
    color: 'bg-slate-500',
  },
];

// Nomes dos meses
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function Calendario() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'list'>('month');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Gerar dias do mês
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days: { date: Date; isCurrentMonth: boolean }[] = [];
    
    // Dias do mês anterior
    const startPadding = firstDay.getDay();
    for (let i = startPadding - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({ date, isCurrentMonth: false });
    }
    
    // Dias do mês atual
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      days.push({ date, isCurrentMonth: true });
    }
    
    // Dias do próximo mês
    const endPadding = 42 - days.length;
    for (let i = 1; i <= endPadding; i++) {
      const date = new Date(year, month + 1, i);
      days.push({ date, isCurrentMonth: false });
    }
    
    return days;
  }, [currentDate]);

  // Filtrar reservas
  const filteredReservations = useMemo(() => {
    return MOCK_RESERVATIONS.filter(res => {
      if (statusFilter !== 'all' && res.status !== statusFilter) return false;
      if (categoryFilter !== 'all') {
        const hasCategory = res.items.some(item => item.category === categoryFilter);
        if (!hasCategory) return false;
      }
      return true;
    });
  }, [statusFilter, categoryFilter]);

  // Obter reservas para um dia específico
  const getReservationsForDate = (date: Date) => {
    return filteredReservations.filter(res => {
      const start = new Date(res.startDate);
      const end = new Date(res.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      const checkDate = new Date(date);
      checkDate.setHours(12, 0, 0, 0);
      return checkDate >= start && checkDate <= end;
    });
  };

  // Navegar meses
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date(2026, 0, 10)); // Simula "hoje"
  };

  // Status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/50"><CheckCircle2 className="h-3 w-3 mr-1" />Confirmado</Badge>;
      case 'pending':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50"><AlertCircle className="h-3 w-3 mr-1" />Pendente</Badge>;
      case 'returned':
        return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/50"><CheckCircle2 className="h-3 w-3 mr-1" />Devolvido</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/50"><XCircle className="h-3 w-3 mr-1" />Cancelado</Badge>;
      default:
        return null;
    }
  };

  // Verificar se é hoje (simulado)
  const isToday = (date: Date) => {
    const today = new Date(2026, 0, 10);
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-xl border-b border-slate-700/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
                <CalendarIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Calendário de Reservas</h1>
                <p className="text-sm text-slate-400">Visualize e gerencie as locações</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'month' ? 'list' : 'month')}
                className="border-slate-600"
              >
                {viewMode === 'month' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
              </Button>
              <Button className="bg-cyan-600 hover:bg-cyan-700">
                <Plus className="h-4 w-4 mr-2" />
                Nova Reserva
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Filtros e Navegação */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={prevMonth} className="border-slate-600">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-xl font-bold min-w-[200px] text-center">
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </div>
            <Button variant="outline" size="icon" onClick={nextMonth} className="border-slate-600">
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={goToToday} className="ml-2">
              Hoje
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40 bg-slate-700 border-slate-600">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Categorias</SelectItem>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      <cat.icon className="h-4 w-4" />
                      {cat.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36 bg-slate-700 border-slate-600">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Status</SelectItem>
                <SelectItem value="confirmed">Confirmados</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="returned">Devolvidos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Legenda */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="text-slate-400">Legenda:</span>
          {CATEGORIES.map(cat => (
            <div key={cat.id} className="flex items-center gap-1">
              <div className={`w-3 h-3 rounded ${cat.color}`} />
              <span className="text-slate-300">{cat.name}</span>
            </div>
          ))}
        </div>

        {viewMode === 'month' ? (
          /* Visualização Mensal */
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              {/* Cabeçalho dos dias da semana */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {WEEKDAYS.map(day => (
                  <div key={day} className="text-center text-sm font-medium text-slate-400 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Grid do calendário */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, idx) => {
                  const reservations = getReservationsForDate(day.date);
                  const hasReservations = reservations.length > 0;
                  
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setSelectedDate(day.date);
                        if (reservations.length === 1) {
                          setSelectedReservation(reservations[0]);
                        }
                      }}
                      className={`
                        min-h-[100px] p-1 rounded-lg border cursor-pointer transition-all
                        ${day.isCurrentMonth ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-900/30 border-slate-800'}
                        ${isToday(day.date) ? 'ring-2 ring-cyan-500 border-cyan-500' : ''}
                        ${hasReservations ? 'hover:border-cyan-500/50' : 'hover:border-slate-600'}
                      `}
                    >
                      <div className={`text-sm font-medium mb-1 ${
                        day.isCurrentMonth ? (isToday(day.date) ? 'text-cyan-400' : 'text-slate-200') : 'text-slate-600'
                      }`}>
                        {day.date.getDate()}
                      </div>
                      
                      <div className="space-y-1">
                        {reservations.slice(0, 3).map(res => (
                          <Tooltip key={res.id}>
                            <TooltipTrigger asChild>
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedReservation(res);
                                }}
                                className={`
                                  text-xs px-1 py-0.5 rounded truncate cursor-pointer
                                  ${res.color} text-white hover:opacity-80 transition-opacity
                                `}
                              >
                                {res.projectName.length > 12 ? res.projectName.slice(0, 12) + '...' : res.projectName}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="bg-slate-800 border-slate-700">
                              <div className="text-sm">
                                <p className="font-bold">{res.projectName}</p>
                                <p className="text-slate-400">{res.clientName}</p>
                                <p className="text-cyan-400">R$ {res.total.toLocaleString('pt-BR')}</p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                        {reservations.length > 3 && (
                          <div className="text-xs text-slate-400 pl-1">
                            +{reservations.length - 3} mais
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Visualização em Lista */
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle>Reservas do Mês</CardTitle>
              <CardDescription>
                {filteredReservations.length} reservas em {MONTHS[currentDate.getMonth()]}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredReservations
                  .filter(res => {
                    const resMonth = res.startDate.getMonth();
                    return resMonth === currentDate.getMonth();
                  })
                  .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
                  .map(res => (
                    <div
                      key={res.id}
                      onClick={() => setSelectedReservation(res)}
                      className="flex items-center gap-4 p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 cursor-pointer transition-colors"
                    >
                      <div className={`w-2 h-16 rounded-full ${res.color}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold">{res.projectName}</span>
                          {getStatusBadge(res.status)}
                        </div>
                        <div className="text-sm text-slate-400">{res.clientName}</div>
                        <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3" />
                            {res.startDate.toLocaleDateString('pt-BR')} - {res.endDate.toLocaleDateString('pt-BR')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            {res.items.length} itens
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-400">
                          R$ {res.total.toLocaleString('pt-BR')}
                        </div>
                        <div className="text-xs text-slate-500">
                          {Math.ceil((res.endDate.getTime() - res.startDate.getTime()) / (1000 * 60 * 60 * 24))} dias
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resumo do Mês */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-cyan-950/50 to-blue-950/50 border-cyan-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total do Mês</p>
                  <p className="text-2xl font-bold text-cyan-400">
                    R$ {filteredReservations
                      .filter(r => r.startDate.getMonth() === currentDate.getMonth())
                      .reduce((acc, r) => acc + r.total, 0)
                      .toLocaleString('pt-BR')}
                  </p>
                </div>
                <DollarSign className="h-10 w-10 text-cyan-400/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-950/50 to-emerald-950/50 border-green-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Confirmados</p>
                  <p className="text-2xl font-bold text-green-400">
                    {filteredReservations.filter(r => r.status === 'confirmed').length}
                  </p>
                </div>
                <CheckCircle2 className="h-10 w-10 text-green-400/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-950/50 to-orange-950/50 border-amber-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Pendentes</p>
                  <p className="text-2xl font-bold text-amber-400">
                    {filteredReservations.filter(r => r.status === 'pending').length}
                  </p>
                </div>
                <AlertCircle className="h-10 w-10 text-amber-400/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-950/50 to-violet-950/50 border-purple-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Equipamentos</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {filteredReservations
                      .flatMap(r => r.items)
                      .reduce((acc, item) => acc + item.quantity, 0)}
                  </p>
                </div>
                <Package className="h-10 w-10 text-purple-400/30" />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Modal de Detalhes da Reserva */}
      <Dialog open={!!selectedReservation} onOpenChange={() => setSelectedReservation(null)}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-lg">
          {selectedReservation && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Film className="h-5 w-5 text-cyan-400" />
                  {selectedReservation.projectName}
                </DialogTitle>
                <DialogDescription>
                  Reserva {selectedReservation.id}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  {getStatusBadge(selectedReservation.status)}
                  <span className="text-2xl font-bold text-green-400">
                    R$ {selectedReservation.total.toLocaleString('pt-BR')}
                  </span>
                </div>

                <Separator className="bg-slate-700" />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400 flex items-center gap-1">
                      <User className="h-4 w-4" /> Cliente
                    </p>
                    <p className="font-medium">{selectedReservation.clientName}</p>
                  </div>
                  {selectedReservation.productionDirector && (
                    <div>
                      <p className="text-slate-400 flex items-center gap-1">
                        <Film className="h-4 w-4" /> Direção Produção
                      </p>
                      <p className="font-medium">{selectedReservation.productionDirector}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-slate-400 flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4" /> Período
                    </p>
                    <p className="font-medium">
                      {selectedReservation.startDate.toLocaleDateString('pt-BR')} - {selectedReservation.endDate.toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  {selectedReservation.location && (
                    <div>
                      <p className="text-slate-400 flex items-center gap-1">
                        <MapPin className="h-4 w-4" /> Local
                      </p>
                      <p className="font-medium">{selectedReservation.location}</p>
                    </div>
                  )}
                </div>

                <Separator className="bg-slate-700" />

                <div>
                  <p className="text-slate-400 mb-2 flex items-center gap-1">
                    <Package className="h-4 w-4" /> Equipamentos
                  </p>
                  <div className="space-y-2">
                    {selectedReservation.items.map((item, idx) => {
                      const category = CATEGORIES.find(c => c.id === item.category);
                      return (
                        <div key={idx} className="flex items-center justify-between bg-slate-800 rounded-lg p-2">
                          <div className="flex items-center gap-2">
                            {category && <category.icon className="h-4 w-4 text-slate-400" />}
                            <span>{item.name}</span>
                          </div>
                          <Badge variant="outline">x{item.quantity}</Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1 bg-cyan-600 hover:bg-cyan-700">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Contrato
                  </Button>
                  <Button variant="outline" className="flex-1 border-slate-600">
                    Editar
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

