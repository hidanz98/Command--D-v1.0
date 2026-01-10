import React, { useState, useEffect } from "react";
import {
  Monitor,
  Cpu,
  HardDrive,
  MemoryStick,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Download,
  Clock,
  Activity,
  Laptop,
  Wrench,
  FileText,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Info,
  XCircle,
  Zap,
  History,
  Settings,
  Shield,
  Loader2,
  Package,
  PcCase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import type {
  DiagnosticsResponse,
  SystemLog,
  DeviceInfo,
  SystemChange,
  CompatibilityIssue
} from "@shared/diagnostics";

export default function Diagnostics() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [diagnostics, setDiagnostics] = useState<DiagnosticsResponse | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<DeviceInfo | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<CompatibilityIssue | null>(null);
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  // Carregar diagnóstico inicial
  useEffect(() => {
    loadDiagnostics();
  }, []);

  const loadDiagnostics = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/diagnostics");
      if (!response.ok) throw new Error("Erro ao carregar diagnóstico");
      const data = await response.json();
      setDiagnostics(data);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível carregar o diagnóstico",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshDiagnostics = async () => {
    try {
      setRefreshing(true);
      await loadDiagnostics();
      toast({
        title: "Atualizado!",
        description: "Diagnóstico atualizado com sucesso",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const exportReport = async () => {
    if (!diagnostics) return;
    
    try {
      setExporting(true);
      const response = await fetch("/api/diagnostics/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(diagnostics)
      });
      
      if (!response.ok) throw new Error("Erro ao exportar");
      
      const data = await response.json();
      
      // Baixar arquivo
      const blob = new Blob([data.report], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.filename;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Exportado!",
        description: `Relatório salvo como ${data.filename}`,
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setExporting(false);
    }
  };

  // Filtrar logs
  const filteredLogs = diagnostics?.logs.filter(log => {
    const matchesSearch = !searchTerm || 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.source.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === "all" || log.level === levelFilter;
    return matchesSearch && matchesLevel;
  }) || [];

  // Ícones de nível
  const getLevelIcon = (level: string) => {
    switch (level) {
      case "critical": return <XCircle className="h-4 w-4 text-red-600" />;
      case "error": return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getLevelBadge = (level: string) => {
    const variants: Record<string, "destructive" | "default" | "secondary" | "outline"> = {
      critical: "destructive",
      error: "destructive",
      warning: "default",
      info: "secondary"
    };
    return variants[level] || "outline";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ok": return "text-green-500";
      case "warning": return "text-yellow-500";
      case "error": return "text-red-500";
      default: return "text-gray-500";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-600";
      case "high": return "bg-red-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  const getChangeTypeIcon = (type: string) => {
    switch (type) {
      case "install": return <Package className="h-4 w-4 text-green-500" />;
      case "uninstall": return <XCircle className="h-4 w-4 text-red-500" />;
      case "update": return <RefreshCw className="h-4 w-4 text-blue-500" />;
      case "driver": return <Settings className="h-4 w-4 text-purple-500" />;
      case "hardware": return <PcCase className="h-4 w-4 text-orange-500" />;
      default: return <History className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-cyan-500 mx-auto" />
          <p className="text-slate-300 text-lg">Analisando sistema...</p>
          <p className="text-slate-500 text-sm">Coletando logs, dispositivos e informações</p>
        </div>
      </div>
    );
  }

  if (!diagnostics) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Card className="w-96 bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <p className="text-slate-300">Não foi possível carregar o diagnóstico</p>
            <Button onClick={loadDiagnostics} variant="outline">
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { systemInfo, logs, devices, changes, issues } = diagnostics;
  const errorDevices = devices.filter(d => d.status === 'error');
  const criticalIssues = issues.filter(i => i.severity === 'critical' || i.severity === 'high');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
                <Monitor className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Diagnóstico do Sistema</h1>
                <p className="text-sm text-slate-400">
                  Última análise: {new Date(diagnostics.generatedAt).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshDiagnostics}
                disabled={refreshing}
                className="border-slate-600 hover:bg-slate-700"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportReport}
                disabled={exporting}
                className="border-slate-600 hover:bg-slate-700"
              >
                <Download className={`h-4 w-4 mr-2 ${exporting ? 'animate-pulse' : ''}`} />
                Exportar
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Alertas Críticos */}
        {(criticalIssues.length > 0 || errorDevices.length > 0) && (
          <Card className="bg-red-950/30 border-red-500/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-red-400 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Problemas Detectados ({criticalIssues.length + errorDevices.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {criticalIssues.map(issue => (
                  <div 
                    key={issue.id} 
                    className="flex items-center justify-between p-3 bg-red-900/20 rounded-lg cursor-pointer hover:bg-red-900/30"
                    onClick={() => setSelectedIssue(issue)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${getSeverityColor(issue.severity)}`} />
                      <span className="font-medium">{issue.device}</span>
                      <span className="text-slate-400 text-sm">{issue.issue.substring(0, 60)}...</span>
                    </div>
                    <Badge variant="destructive">{issue.severity.toUpperCase()}</Badge>
                  </div>
                ))}
                {errorDevices.map(device => (
                  <div 
                    key={device.id} 
                    className="flex items-center justify-between p-3 bg-red-900/20 rounded-lg cursor-pointer hover:bg-red-900/30"
                    onClick={() => setSelectedDevice(device)}
                  >
                    <div className="flex items-center gap-3">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="font-medium">{device.name}</span>
                      <span className="text-slate-400 text-sm">Código: {device.problemCode}</span>
                    </div>
                    <Button size="sm" variant="outline" className="border-red-500/50 text-red-400">
                      Ver Solução
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cards de Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* CPU */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Cpu className="h-5 w-5 text-blue-400" />
                </div>
                <span className="text-2xl font-bold text-blue-400">{systemInfo.cpu.usage}%</span>
              </div>
              <p className="text-sm font-medium text-slate-300 truncate">{systemInfo.cpu.name}</p>
              <p className="text-xs text-slate-500">{systemInfo.cpu.cores} núcleos | {systemInfo.cpu.threads} threads</p>
              <Progress value={systemInfo.cpu.usage} className="mt-3 h-2" />
            </CardContent>
          </Card>

          {/* Memória */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <MemoryStick className="h-5 w-5 text-purple-400" />
                </div>
                <span className="text-2xl font-bold text-purple-400">{systemInfo.memory.usagePercent}%</span>
              </div>
              <p className="text-sm font-medium text-slate-300">Memória RAM</p>
              <p className="text-xs text-slate-500">
                {systemInfo.memory.used.toFixed(1)} GB / {systemInfo.memory.total.toFixed(1)} GB
              </p>
              <Progress 
                value={systemInfo.memory.usagePercent} 
                className={`mt-3 h-2 ${systemInfo.memory.usagePercent > 90 ? 'bg-red-900' : ''}`} 
              />
            </CardContent>
          </Card>

          {/* Disco */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <HardDrive className="h-5 w-5 text-green-400" />
                </div>
                <span className="text-2xl font-bold text-green-400">
                  {systemInfo.disk.drives[0]?.usagePercent || 0}%
                </span>
              </div>
              <p className="text-sm font-medium text-slate-300">
                Disco {systemInfo.disk.drives[0]?.letter || 'C:'}
              </p>
              <p className="text-xs text-slate-500">
                {systemInfo.disk.drives[0]?.free.toFixed(0) || 0} GB livres de {systemInfo.disk.drives[0]?.total.toFixed(0) || 0} GB
              </p>
              <Progress 
                value={systemInfo.disk.drives[0]?.usagePercent || 0} 
                className="mt-3 h-2" 
              />
            </CardContent>
          </Card>

          {/* Uptime */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-cyan-500/20 rounded-lg">
                  <Clock className="h-5 w-5 text-cyan-400" />
                </div>
                <span className="text-2xl font-bold text-cyan-400">{systemInfo.uptime.toFixed(1)}h</span>
              </div>
              <p className="text-sm font-medium text-slate-300">Tempo Ligado</p>
              <p className="text-xs text-slate-500">
                Último boot: {new Date(systemInfo.lastBoot).toLocaleString('pt-BR')}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-xs text-green-400">Sistema estável</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Informações do Sistema */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Laptop className="h-5 w-5 text-cyan-400" />
              Informações do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <p className="text-sm text-slate-400">Sistema Operacional</p>
                <p className="font-medium">{systemInfo.os.name}</p>
                <p className="text-sm text-slate-500">
                  Versão {systemInfo.os.version} (Build {systemInfo.os.build})
                </p>
                <Badge variant="outline">{systemInfo.os.architecture}</Badge>
              </div>
              
              {systemInfo.gpu && (
                <div className="space-y-2">
                  <p className="text-sm text-slate-400">Placa de Vídeo</p>
                  <p className="font-medium">{systemInfo.gpu.name}</p>
                  <p className="text-sm text-slate-500">Driver: {systemInfo.gpu.driver}</p>
                  <Badge variant="outline">{systemInfo.gpu.memory}</Badge>
                </div>
              )}
              
              <div className="space-y-2">
                <p className="text-sm text-slate-400">Discos</p>
                {systemInfo.disk.drives.map(drive => (
                  <div key={drive.letter} className="flex items-center justify-between">
                    <span className="font-medium">{drive.letter}</span>
                    <span className="text-sm text-slate-500">
                      {drive.free.toFixed(0)} GB livres
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs de Conteúdo */}
        <Tabs defaultValue="logs" className="space-y-4">
          <TabsList className="bg-slate-800 border border-slate-700">
            <TabsTrigger value="logs" className="data-[state=active]:bg-slate-700">
              <FileText className="h-4 w-4 mr-2" />
              Logs ({logs.length})
            </TabsTrigger>
            <TabsTrigger value="devices" className="data-[state=active]:bg-slate-700">
              <Settings className="h-4 w-4 mr-2" />
              Dispositivos ({devices.length})
            </TabsTrigger>
            <TabsTrigger value="changes" className="data-[state=active]:bg-slate-700">
              <History className="h-4 w-4 mr-2" />
              Alterações ({changes.length})
            </TabsTrigger>
            <TabsTrigger value="issues" className="data-[state=active]:bg-slate-700">
              <Shield className="h-4 w-4 mr-2" />
              Compatibilidade ({issues.length})
            </TabsTrigger>
          </TabsList>

          {/* Tab: Logs */}
          <TabsContent value="logs">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <CardTitle>Logs do Sistema</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Buscar nos logs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64 bg-slate-700 border-slate-600"
                      />
                    </div>
                    <Select value={levelFilter} onValueChange={setLevelFilter}>
                      <SelectTrigger className="w-40 bg-slate-700 border-slate-600">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filtrar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="critical">Crítico</SelectItem>
                        <SelectItem value="error">Erro</SelectItem>
                        <SelectItem value="warning">Aviso</SelectItem>
                        <SelectItem value="info">Info</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {filteredLogs.map((log, idx) => (
                      <div
                        key={`${log.id}-${idx}`}
                        className="p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 cursor-pointer transition-colors"
                        onClick={() => setSelectedLog(log)}
                      >
                        <div className="flex items-start gap-3">
                          {getLevelIcon(log.level)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant={getLevelBadge(log.level)} className="text-xs">
                                {log.level.toUpperCase()}
                              </Badge>
                              <span className="text-xs text-slate-400">{log.source}</span>
                              <span className="text-xs text-slate-500">ID: {log.eventId}</span>
                            </div>
                            <p className="text-sm text-slate-300 truncate">{log.message}</p>
                            <p className="text-xs text-slate-500 mt-1">
                              {new Date(log.timestamp).toLocaleString('pt-BR')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {filteredLogs.length === 0 && (
                      <div className="text-center py-8 text-slate-500">
                        <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500/50" />
                        <p>Nenhum log encontrado com os filtros atuais</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Dispositivos */}
          <TabsContent value="devices">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle>Dispositivos do Sistema</CardTitle>
                <CardDescription>
                  {errorDevices.length > 0 
                    ? `${errorDevices.length} dispositivo(s) com problema` 
                    : 'Todos os dispositivos funcionando'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {devices.map((device, idx) => (
                    <div
                      key={`${device.id}-${idx}`}
                      className={`p-4 rounded-lg border cursor-pointer transition-all hover:scale-[1.02] ${
                        device.status === 'error' 
                          ? 'bg-red-950/30 border-red-500/50 hover:bg-red-950/50' 
                          : 'bg-slate-700/50 border-slate-600 hover:bg-slate-700'
                      }`}
                      onClick={() => setSelectedDevice(device)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          device.status === 'error' ? 'bg-red-500/20' : 'bg-green-500/20'
                        }`}>
                          {device.status === 'error' 
                            ? <XCircle className="h-5 w-5 text-red-400" />
                            : <CheckCircle2 className="h-5 w-5 text-green-400" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{device.name}</p>
                          <p className="text-sm text-slate-400">{device.manufacturer || 'Fabricante desconhecido'}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {device.driverVersion || 'N/A'}
                            </Badge>
                            {device.status === 'error' && device.problemCode && (
                              <Badge variant="destructive" className="text-xs">
                                Erro {device.problemCode}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Alterações */}
          <TabsContent value="changes">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle>Alterações Recentes</CardTitle>
                <CardDescription>Instalações, atualizações e mudanças no sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {changes.map((change, idx) => (
                      <div key={`${change.id}-${idx}`} className="flex items-start gap-4 p-3 bg-slate-700/30 rounded-lg">
                        <div className="p-2 bg-slate-700 rounded-lg">
                          {getChangeTypeIcon(change.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs capitalize">
                              {change.type}
                            </Badge>
                            <span className="text-xs text-slate-500">
                              {new Date(change.timestamp).toLocaleString('pt-BR')}
                            </span>
                          </div>
                          <p className="font-medium text-slate-200">{change.description}</p>
                          {change.details && (
                            <p className="text-sm text-slate-400 mt-1">{change.details}</p>
                          )}
                        </div>
                      </div>
                    ))}
                    {changes.length === 0 && (
                      <div className="text-center py-8 text-slate-500">
                        <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhuma alteração recente registrada</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Compatibilidade */}
          <TabsContent value="issues">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle>Problemas de Compatibilidade</CardTitle>
                <CardDescription>Análise automática de problemas e soluções sugeridas</CardDescription>
              </CardHeader>
              <CardContent>
                {issues.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-green-400 mb-2">
                      Nenhum Problema Detectado!
                    </h3>
                    <p className="text-slate-400">
                      Seu sistema está funcionando corretamente sem problemas de compatibilidade.
                    </p>
                  </div>
                ) : (
                  <Accordion type="single" collapsible className="space-y-2">
                    {issues.map((issue, idx) => (
                      <AccordionItem 
                        key={`${issue.id}-${idx}`} 
                        value={issue.id}
                        className="border border-slate-700 rounded-lg px-4"
                      >
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${getSeverityColor(issue.severity)}`} />
                            <span className="font-medium">{issue.device}</span>
                            <Badge variant={issue.severity === 'critical' || issue.severity === 'high' ? 'destructive' : 'outline'}>
                              {issue.severity.toUpperCase()}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4 pt-2">
                            <div>
                              <p className="text-sm text-slate-400 mb-1">Problema:</p>
                              <p className="text-slate-200">{issue.issue}</p>
                            </div>
                            <div>
                              <p className="text-sm text-slate-400 mb-2">Soluções Possíveis:</p>
                              <div className="space-y-2">
                                {issue.possibleSolutions.map((solution, sIdx) => (
                                  <div key={sIdx} className="flex items-start gap-2 p-2 bg-slate-700/50 rounded">
                                    <Wrench className="h-4 w-4 text-cyan-400 mt-0.5" />
                                    <span className="text-sm">{solution}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="text-xs text-slate-500">
                              Detectado em: {new Date(issue.detectedAt).toLocaleString('pt-BR')}
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Modal: Detalhes do Log */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedLog && getLevelIcon(selectedLog.level)}
              Detalhes do Log
            </DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400">Nível</p>
                  <Badge variant={getLevelBadge(selectedLog.level)}>
                    {selectedLog.level.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-400">ID do Evento</p>
                  <p className="font-mono">{selectedLog.eventId}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Fonte</p>
                  <p>{selectedLog.source}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Categoria</p>
                  <p>{selectedLog.category}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-slate-400">Data/Hora</p>
                  <p>{new Date(selectedLog.timestamp).toLocaleString('pt-BR')}</p>
                </div>
              </div>
              <Separator className="bg-slate-700" />
              <div>
                <p className="text-sm text-slate-400 mb-2">Mensagem</p>
                <div className="p-4 bg-slate-900 rounded-lg font-mono text-sm whitespace-pre-wrap">
                  {selectedLog.message}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal: Detalhes do Dispositivo */}
      <Dialog open={!!selectedDevice} onOpenChange={() => setSelectedDevice(null)}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedDevice?.status === 'error' 
                ? <XCircle className="h-5 w-5 text-red-500" />
                : <CheckCircle2 className="h-5 w-5 text-green-500" />
              }
              {selectedDevice?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedDevice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400">Status</p>
                  <Badge variant={selectedDevice.status === 'error' ? 'destructive' : 'default'}>
                    {selectedDevice.status === 'ok' ? 'Funcionando' : 'Com Problema'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Fabricante</p>
                  <p>{selectedDevice.manufacturer || 'Desconhecido'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Driver</p>
                  <p>{selectedDevice.driver || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Versão do Driver</p>
                  <p className="font-mono">{selectedDevice.driverVersion || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Data do Driver</p>
                  <p>{selectedDevice.driverDate || 'N/A'}</p>
                </div>
                {selectedDevice.problemCode && selectedDevice.problemCode > 0 && (
                  <div>
                    <p className="text-sm text-slate-400">Código do Erro</p>
                    <Badge variant="destructive">{selectedDevice.problemCode}</Badge>
                  </div>
                )}
              </div>
              
              {selectedDevice.problemDescription && (
                <>
                  <Separator className="bg-slate-700" />
                  <div className="p-4 bg-red-950/30 border border-red-500/30 rounded-lg">
                    <p className="text-sm text-red-400 font-medium mb-2">Problema Detectado:</p>
                    <p className="text-slate-200">{selectedDevice.problemDescription}</p>
                  </div>
                </>
              )}
              
              {selectedDevice.solution && (
                <div className="p-4 bg-cyan-950/30 border border-cyan-500/30 rounded-lg">
                  <p className="text-sm text-cyan-400 font-medium mb-2">Solução Recomendada:</p>
                  <p className="text-slate-200">{selectedDevice.solution}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal: Detalhes do Issue */}
      <Dialog open={!!selectedIssue} onOpenChange={() => setSelectedIssue(null)}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Problema de Compatibilidade
            </DialogTitle>
          </DialogHeader>
          {selectedIssue && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${getSeverityColor(selectedIssue.severity)}`} />
                <span className="font-medium text-lg">{selectedIssue.device}</span>
                <Badge variant={selectedIssue.severity === 'critical' || selectedIssue.severity === 'high' ? 'destructive' : 'outline'}>
                  {selectedIssue.severity.toUpperCase()}
                </Badge>
              </div>
              
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <p className="text-slate-200">{selectedIssue.issue}</p>
              </div>
              
              <div>
                <p className="text-sm text-slate-400 mb-3">Soluções Possíveis:</p>
                <div className="space-y-2">
                  {selectedIssue.possibleSolutions.map((solution, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-cyan-950/30 border border-cyan-500/30 rounded-lg">
                      <span className="flex-shrink-0 w-6 h-6 bg-cyan-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {idx + 1}
                      </span>
                      <span className="text-slate-200">{solution}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <p className="text-xs text-slate-500">
                Detectado em: {new Date(selectedIssue.detectedAt).toLocaleString('pt-BR')}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

