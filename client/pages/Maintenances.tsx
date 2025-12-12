import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Wrench,
  Plus,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  Pause,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import {
  ProductMaintenance,
  MaintenanceType,
  MaintenanceStatus,
  MaintenancePriority,
} from "@shared/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const MAINTENANCE_TYPES: { value: MaintenanceType; label: string }[] = [
  { value: "PREVENTIVE", label: "Preventiva" },
  { value: "CORRECTIVE", label: "Corretiva" },
  { value: "PREDICTIVE", label: "Preditiva" },
  { value: "EMERGENCY", label: "Emergência" },
  { value: "INSPECTION", label: "Inspeção" },
  { value: "CALIBRATION", label: "Calibração" },
  { value: "CLEANING", label: "Limpeza" },
  { value: "UPGRADE", label: "Atualização" },
];

const MAINTENANCE_STATUS: { value: MaintenanceStatus; label: string; icon: any; color: string }[] = [
  { value: "SCHEDULED", label: "Agendada", icon: Calendar, color: "blue" },
  { value: "PENDING", label: "Pendente", icon: Clock, color: "yellow" },
  { value: "IN_PROGRESS", label: "Em Andamento", icon: Wrench, color: "orange" },
  { value: "COMPLETED", label: "Concluída", icon: CheckCircle2, color: "green" },
  { value: "CANCELLED", label: "Cancelada", icon: XCircle, color: "red" },
  { value: "ON_HOLD", label: "Em Espera", icon: Pause, color: "gray" },
];

const PRIORITIES: { value: MaintenancePriority; label: string; color: string }[] = [
  { value: "LOW", label: "Baixa", color: "gray" },
  { value: "MEDIUM", label: "Média", color: "blue" },
  { value: "HIGH", label: "Alta", color: "orange" },
  { value: "URGENT", label: "Urgente", color: "red" },
];

export default function Maintenances() {
  const navigate = useNavigate();
  const [maintenances, setMaintenances] = useState<ProductMaintenance[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState<ProductMaintenance | null>(null);
  
  // Filtros
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Form state para nova manutenção
  const [formData, setFormData] = useState({
    productId: "",
    title: "",
    description: "",
    type: "PREVENTIVE" as MaintenanceType,
    status: "SCHEDULED" as MaintenanceStatus,
    priority: "MEDIUM" as MaintenancePriority,
    scheduledDate: "",
    technician: "",
    cost: "",
    issue: "",
    solution: "",
    notes: "",
  });

  useEffect(() => {
    loadMaintenances();
    loadProducts();
  }, [statusFilter, typeFilter]);

  const loadMaintenances = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (typeFilter !== "all") params.append("type", typeFilter);

      const response = await fetch(`/api/maintenances?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Erro ao carregar manutenções");

      const data = await response.json();
      setMaintenances(data);
    } catch (error) {
      console.error("Erro ao carregar manutenções:", error);
      toast.error("Erro ao carregar manutenções");
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      // Buscar todos os produtos (limite alto)
      const response = await fetch("/api/products?limit=1000", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Erro ao carregar produtos");

      const result = await response.json();
      // A API retorna { success: true, data: { products: [...], pagination: {...} } }
      if (result.success && result.data && result.data.products) {
        setProducts(result.data.products);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      toast.error("Erro ao carregar produtos");
    }
  };

  const handleCreateMaintenance = async () => {
    if (!formData.productId || !formData.title) {
      toast.error("Preencha o produto e o título");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const payload = {
        ...formData,
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        scheduledDate: formData.scheduledDate ? new Date(formData.scheduledDate).toISOString() : undefined,
      };

      const response = await fetch("/api/maintenances", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Erro ao criar manutenção");

      toast.success("Manutenção criada com sucesso!");
      setDialogOpen(false);
      loadMaintenances();
      
      // Reset form
      setFormData({
        productId: "",
        title: "",
        description: "",
        type: "PREVENTIVE",
        status: "SCHEDULED",
        priority: "MEDIUM",
        scheduledDate: "",
        technician: "",
        cost: "",
        issue: "",
        solution: "",
        notes: "",
      });
    } catch (error) {
      console.error("Erro ao criar manutenção:", error);
      toast.error("Erro ao criar manutenção");
    }
  };

  const getStatusBadge = (status: MaintenanceStatus) => {
    const statusConfig = MAINTENANCE_STATUS.find((s) => s.value === status);
    if (!statusConfig) return null;

    const Icon = statusConfig.icon;
    return (
      <Badge variant="outline" className={`bg-${statusConfig.color}-50 text-${statusConfig.color}-700 border-${statusConfig.color}-200`}>
        <Icon className="w-3 h-3 mr-1" />
        {statusConfig.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: MaintenancePriority) => {
    const priorityConfig = PRIORITIES.find((p) => p.value === priority);
    if (!priorityConfig) return null;

    return (
      <Badge variant="outline" className={`bg-${priorityConfig.color}-50 text-${priorityConfig.color}-700 border-${priorityConfig.color}-200`}>
        {priorityConfig.label}
      </Badge>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return "-";
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/painel-admin')}
            className="shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Wrench className="w-8 h-8" />
              Manutenções
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie as manutenções dos equipamentos
            </p>
          </div>
        </div>
        <Button onClick={() => { setSelectedMaintenance(null); setDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Manutenção
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <Label>Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {MAINTENANCE_STATUS.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <Label>Tipo</Label>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {MAINTENANCE_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline" onClick={loadMaintenances}>
          Atualizar
        </Button>
      </div>

      {/* Tabela */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead>Agendado</TableHead>
              <TableHead>Custo</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : maintenances.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Nenhuma manutenção encontrada
                </TableCell>
              </TableRow>
            ) : (
              maintenances.map((maintenance) => (
                <TableRow key={maintenance.id}>
                  <TableCell className="font-medium">
                    {(maintenance as any).product?.name || "-"}
                  </TableCell>
                  <TableCell>{maintenance.title}</TableCell>
                  <TableCell>
                    {MAINTENANCE_TYPES.find((t) => t.value === maintenance.type)?.label}
                  </TableCell>
                  <TableCell>{getStatusBadge(maintenance.status)}</TableCell>
                  <TableCell>{getPriorityBadge(maintenance.priority)}</TableCell>
                  <TableCell>{formatDate(maintenance.scheduledDate)}</TableCell>
                  <TableCell>
                    {maintenance.cost ? `R$ ${maintenance.cost.toFixed(2)}` : "-"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedMaintenance(maintenance);
                        setDialogOpen(true);
                      }}
                    >
                      Ver detalhes
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog para criar/editar manutenção */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedMaintenance ? "Detalhes da Manutenção" : "Nova Manutenção"}
            </DialogTitle>
            <DialogDescription>
              {selectedMaintenance 
                ? "Visualize e edite as informações da manutenção" 
                : "Preencha os dados para criar uma nova manutenção"}
            </DialogDescription>
          </DialogHeader>

          {selectedMaintenance && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Produto</Label>
                  <p className="font-medium">{(selectedMaintenance as any).product?.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedMaintenance.status)}</div>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Título</Label>
                <p className="font-medium">{selectedMaintenance.title}</p>
              </div>

              {selectedMaintenance.description && (
                <div>
                  <Label className="text-muted-foreground">Descrição</Label>
                  <p className="text-sm">{selectedMaintenance.description}</p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-muted-foreground">Tipo</Label>
                  <p className="text-sm">
                    {MAINTENANCE_TYPES.find((t) => t.value === selectedMaintenance.type)?.label}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Prioridade</Label>
                  <div className="mt-1">{getPriorityBadge(selectedMaintenance.priority)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Custo</Label>
                  <p className="text-sm">
                    {selectedMaintenance.cost ? `R$ ${selectedMaintenance.cost.toFixed(2)}` : "-"}
                  </p>
                </div>
              </div>

              {selectedMaintenance.issue && (
                <div>
                  <Label className="text-muted-foreground">Problema</Label>
                  <p className="text-sm">{selectedMaintenance.issue}</p>
                </div>
              )}

              {selectedMaintenance.solution && (
                <div>
                  <Label className="text-muted-foreground">Solução</Label>
                  <p className="text-sm">{selectedMaintenance.solution}</p>
                </div>
              )}

              {selectedMaintenance.technician && (
                <div>
                  <Label className="text-muted-foreground">Técnico</Label>
                  <p className="text-sm">{selectedMaintenance.technician}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {selectedMaintenance.scheduledDate && (
                  <div>
                    <Label className="text-muted-foreground">Agendado para</Label>
                    <p className="text-sm">{formatDate(selectedMaintenance.scheduledDate)}</p>
                  </div>
                )}
                {selectedMaintenance.completedAt && (
                  <div>
                    <Label className="text-muted-foreground">Concluído em</Label>
                    <p className="text-sm">{formatDate(selectedMaintenance.completedAt)}</p>
                  </div>
                )}
              </div>

              {selectedMaintenance.notes && (
                <div>
                  <Label className="text-muted-foreground">Observações</Label>
                  <p className="text-sm whitespace-pre-wrap">{selectedMaintenance.notes}</p>
                </div>
              )}
            </div>
          )}

          {!selectedMaintenance && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="product">Produto *</Label>
                <Select
                  value={formData.productId}
                  onValueChange={(value) => setFormData({ ...formData, productId: value })}
                >
                  <SelectTrigger id="product">
                    <SelectValue placeholder="Selecione um produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Troca de lente"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva a manutenção"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value as MaintenanceType })}
                  >
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MAINTENANCE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value as MaintenancePriority })}
                  >
                    <SelectTrigger id="priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as MaintenanceStatus })}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MAINTENANCE_STATUS.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheduledDate">Data Agendada</Label>
                  <Input
                    id="scheduledDate"
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="technician">Técnico</Label>
                  <Input
                    id="technician"
                    value={formData.technician}
                    onChange={(e) => setFormData({ ...formData, technician: e.target.value })}
                    placeholder="Nome do técnico"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cost">Custo (R$)</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="issue">Problema Identificado</Label>
                <Textarea
                  id="issue"
                  value={formData.issue}
                  onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                  placeholder="Descrição do problema"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="solution">Solução Aplicada</Label>
                <Textarea
                  id="solution"
                  value={formData.solution}
                  onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                  placeholder="Descrição da solução"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Observações adicionais"
                  rows={2}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            {!selectedMaintenance && (
              <Button onClick={handleCreateMaintenance}>
                Criar Manutenção
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

