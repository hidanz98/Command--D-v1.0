import React, { useState, useRef, useCallback } from "react";
import {
  Upload,
  FileSpreadsheet,
  FileText,
  Database,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Download,
  Trash2,
  Eye,
  ArrowRight,
  RefreshCw,
  Package,
  Users,
  ShoppingCart,
  Settings,
  HelpCircle,
  FileUp,
  Table,
  Columns,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Info,
  Zap,
  FolderOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

// Tipos
interface ImportFile {
  id: string;
  name: string;
  size: number;
  type: string;
  data: any[];
  headers: string[];
  status: 'pending' | 'processing' | 'success' | 'error';
  progress: number;
  errorMessage?: string;
  mappings?: Record<string, string>;
}

interface ColumnMapping {
  source: string;
  target: string;
  required: boolean;
}

// Colunas esperadas para cada tipo de dado
const EXPECTED_COLUMNS = {
  products: [
    { key: 'name', label: 'Nome do Produto', required: true },
    { key: 'description', label: 'Descrição', required: false },
    { key: 'sku', label: 'Código/SKU', required: false },
    { key: 'category', label: 'Categoria', required: false },
    { key: 'dailyRate', label: 'Valor Diária (R$)', required: true },
    { key: 'weeklyRate', label: 'Valor Semanal (R$)', required: false },
    { key: 'monthlyRate', label: 'Valor Mensal (R$)', required: false },
    { key: 'quantity', label: 'Quantidade', required: false },
    { key: 'brand', label: 'Marca', required: false },
    { key: 'model', label: 'Modelo', required: false },
    { key: 'serialNumber', label: 'Número de Série', required: false },
    { key: 'condition', label: 'Condição', required: false },
    { key: 'notes', label: 'Observações', required: false },
  ],
  clients: [
    { key: 'name', label: 'Nome Completo', required: true },
    { key: 'email', label: 'E-mail', required: false },
    { key: 'phone', label: 'Telefone', required: true },
    { key: 'cpfCnpj', label: 'CPF/CNPJ', required: false },
    { key: 'address', label: 'Endereço', required: false },
    { key: 'city', label: 'Cidade', required: false },
    { key: 'state', label: 'Estado', required: false },
    { key: 'zipCode', label: 'CEP', required: false },
    { key: 'notes', label: 'Observações', required: false },
  ],
  orders: [
    { key: 'clientName', label: 'Nome do Cliente', required: true },
    { key: 'productName', label: 'Produto', required: true },
    { key: 'startDate', label: 'Data Início', required: true },
    { key: 'endDate', label: 'Data Fim', required: true },
    { key: 'totalValue', label: 'Valor Total', required: false },
    { key: 'status', label: 'Status', required: false },
    { key: 'notes', label: 'Observações', required: false },
  ]
};

// Mapeamento de colunas do Prime Start
const PRIME_START_MAPPINGS = {
  products: {
    'DESCRICAO': 'name',
    'DESCRICAO_COMPLETA': 'description',
    'CODIGO': 'sku',
    'GRUPO': 'category',
    'VALOR_DIARIA': 'dailyRate',
    'VALOR_SEMANAL': 'weeklyRate',
    'VALOR_MENSAL': 'monthlyRate',
    'ESTOQUE': 'quantity',
    'MARCA': 'brand',
    'MODELO': 'model',
    'NUMERO_SERIE': 'serialNumber',
    'ESTADO': 'condition',
    'OBS': 'notes',
  },
  clients: {
    'NOME': 'name',
    'EMAIL': 'email',
    'TELEFONE': 'phone',
    'CELULAR': 'phone',
    'CPF': 'cpfCnpj',
    'CNPJ': 'cpfCnpj',
    'ENDERECO': 'address',
    'CIDADE': 'city',
    'UF': 'state',
    'CEP': 'zipCode',
    'OBSERVACAO': 'notes',
  }
};

export default function Importacao() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estados
  const [importType, setImportType] = useState<'products' | 'clients' | 'orders'>('products');
  const [importSource, setImportSource] = useState<'excel' | 'csv' | 'primestart'>('excel');
  const [files, setFiles] = useState<ImportFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<ImportFile | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showMapping, setShowMapping] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<{
    success: number;
    errors: number;
    messages: string[];
  } | null>(null);
  const [columnMappings, setColumnMappings] = useState<Record<string, string>>({});
  const [skipFirstRow, setSkipFirstRow] = useState(true);
  const [updateExisting, setUpdateExisting] = useState(false);

  // Função para ler arquivo Excel/CSV
  const parseFile = async (file: File): Promise<{ headers: string[]; data: any[] }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n').filter(line => line.trim());
          
          if (lines.length === 0) {
            reject(new Error('Arquivo vazio'));
            return;
          }
          
          // Detectar separador (vírgula, ponto-e-vírgula ou tab)
          const firstLine = lines[0];
          let separator = ',';
          if (firstLine.includes(';')) separator = ';';
          else if (firstLine.includes('\t')) separator = '\t';
          
          const headers = lines[0].split(separator).map(h => h.trim().replace(/^["']|["']$/g, ''));
          const data = [];
          
          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(separator).map(v => v.trim().replace(/^["']|["']$/g, ''));
            const row: Record<string, string> = {};
            
            headers.forEach((header, index) => {
              row[header] = values[index] || '';
            });
            
            data.push(row);
          }
          
          resolve({ headers, data });
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsText(file, 'UTF-8');
    });
  };

  // Handler de upload de arquivo
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (!uploadedFiles) return;
    
    const newFiles: ImportFile[] = [];
    
    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];
      
      try {
        const { headers, data } = await parseFile(file);
        
        // Auto-detectar mapeamentos se for Prime Start
        let autoMappings: Record<string, string> = {};
        if (importSource === 'primestart') {
          const primeMap = PRIME_START_MAPPINGS[importType as keyof typeof PRIME_START_MAPPINGS] || {};
          headers.forEach(header => {
            const upperHeader = header.toUpperCase();
            if (primeMap[upperHeader as keyof typeof primeMap]) {
              autoMappings[header] = primeMap[upperHeader as keyof typeof primeMap];
            }
          });
        }
        
        newFiles.push({
          id: `file-${Date.now()}-${i}`,
          name: file.name,
          size: file.size,
          type: file.type,
          data,
          headers,
          status: 'pending',
          progress: 0,
          mappings: autoMappings
        });
        
      } catch (error: any) {
        toast({
          title: "Erro ao ler arquivo",
          description: error.message || file.name,
          variant: "destructive"
        });
      }
    }
    
    setFiles(prev => [...prev, ...newFiles]);
    
    if (newFiles.length > 0) {
      setSelectedFile(newFiles[0]);
      setColumnMappings(newFiles[0].mappings || {});
      
      toast({
        title: "Arquivo carregado!",
        description: `${newFiles.length} arquivo(s) pronto(s) para importação`,
      });
    }
    
    // Limpar input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remover arquivo
  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    if (selectedFile?.id === fileId) {
      setSelectedFile(null);
    }
  };

  // Atualizar mapeamento de coluna
  const updateMapping = (sourceColumn: string, targetColumn: string) => {
    setColumnMappings(prev => ({
      ...prev,
      [sourceColumn]: targetColumn
    }));
  };

  // Auto-mapear colunas
  const autoMapColumns = () => {
    if (!selectedFile) return;
    
    const expectedCols = EXPECTED_COLUMNS[importType];
    const newMappings: Record<string, string> = {};
    
    selectedFile.headers.forEach(header => {
      const normalizedHeader = header.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      
      // Tentar encontrar correspondência
      for (const col of expectedCols) {
        const normalizedTarget = col.label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const normalizedKey = col.key.toLowerCase();
        
        if (normalizedHeader.includes(normalizedTarget) || 
            normalizedHeader.includes(normalizedKey) ||
            normalizedTarget.includes(normalizedHeader)) {
          newMappings[header] = col.key;
          break;
        }
      }
    });
    
    setColumnMappings(newMappings);
    
    toast({
      title: "Mapeamento automático aplicado",
      description: `${Object.keys(newMappings).length} colunas mapeadas`,
    });
  };

  // Iniciar importação
  const startImport = async () => {
    if (!selectedFile) return;
    
    // Verificar se colunas obrigatórias estão mapeadas
    const requiredCols = EXPECTED_COLUMNS[importType].filter(c => c.required);
    const mappedCols = Object.values(columnMappings);
    const missingRequired = requiredCols.filter(c => !mappedCols.includes(c.key));
    
    if (missingRequired.length > 0) {
      toast({
        title: "Colunas obrigatórias faltando",
        description: `Mapeie: ${missingRequired.map(c => c.label).join(', ')}`,
        variant: "destructive"
      });
      return;
    }
    
    setImporting(true);
    setImportProgress(0);
    setImportResults(null);
    
    const results = {
      success: 0,
      errors: 0,
      messages: [] as string[]
    };
    
    try {
      const dataToImport = selectedFile.data;
      const total = dataToImport.length;
      
      for (let i = 0; i < total; i++) {
        const row = dataToImport[i];
        
        // Transformar dados usando mapeamento
        const mappedData: Record<string, any> = {};
        for (const [source, target] of Object.entries(columnMappings)) {
          if (row[source] !== undefined && row[source] !== '') {
            // Converter valores numéricos
            if (['dailyRate', 'weeklyRate', 'monthlyRate', 'quantity'].includes(target)) {
              mappedData[target] = parseFloat(row[source].replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
            } else {
              mappedData[target] = row[source];
            }
          }
        }
        
        // Simular envio para API
        try {
          // Em produção, aqui seria a chamada real para a API
          // await fetch(`/api/${importType}`, { method: 'POST', body: JSON.stringify(mappedData) });
          
          // Simulação de delay
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Simular sucesso (90% das vezes)
          if (Math.random() > 0.1) {
            results.success++;
          } else {
            results.errors++;
            results.messages.push(`Linha ${i + 2}: Erro ao importar "${mappedData.name || 'item'}"`);
          }
        } catch (error: any) {
          results.errors++;
          results.messages.push(`Linha ${i + 2}: ${error.message}`);
        }
        
        setImportProgress(Math.round(((i + 1) / total) * 100));
      }
      
      // Atualizar status do arquivo
      setFiles(prev => prev.map(f => 
        f.id === selectedFile.id 
          ? { ...f, status: results.errors === 0 ? 'success' : 'error', progress: 100 }
          : f
      ));
      
      setImportResults(results);
      
      toast({
        title: results.errors === 0 ? "Importação concluída!" : "Importação finalizada com erros",
        description: `${results.success} registros importados, ${results.errors} erros`,
        variant: results.errors === 0 ? "default" : "destructive"
      });
      
    } catch (error: any) {
      toast({
        title: "Erro na importação",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setImporting(false);
    }
  };

  // Download modelo de planilha
  const downloadTemplate = () => {
    const columns = EXPECTED_COLUMNS[importType];
    const headers = columns.map(c => c.label).join(';');
    const exampleRow = columns.map(c => {
      switch (c.key) {
        case 'name': return importType === 'products' ? 'Câmera Canon 5D' : 'João Silva';
        case 'email': return 'email@exemplo.com';
        case 'phone': return '(11) 99999-9999';
        case 'dailyRate': return '150.00';
        case 'weeklyRate': return '750.00';
        case 'monthlyRate': return '2500.00';
        case 'quantity': return '5';
        case 'category': return 'Câmeras';
        case 'brand': return 'Canon';
        case 'cpfCnpj': return '123.456.789-00';
        case 'city': return 'São Paulo';
        case 'state': return 'SP';
        default: return '';
      }
    }).join(';');
    
    const csv = `${headers}\n${exampleRow}`;
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `modelo_${importType}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Modelo baixado!",
      description: "Use este arquivo como base para sua importação",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-xl border-b border-slate-700/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl">
                <Upload className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Importação de Dados</h1>
                <p className="text-sm text-slate-400">Excel, CSV e Prime Start</p>
              </div>
            </div>
            
            <Button
              variant="outline"
              onClick={downloadTemplate}
              className="border-slate-600 hover:bg-slate-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar Modelo
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Seleção de Tipo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tipo de Dados */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-base">O que você quer importar?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={importType === 'products' ? 'default' : 'outline'}
                  onClick={() => setImportType('products')}
                  className={importType === 'products' ? 'bg-emerald-600' : 'border-slate-600'}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Produtos
                </Button>
                <Button
                  variant={importType === 'clients' ? 'default' : 'outline'}
                  onClick={() => setImportType('clients')}
                  className={importType === 'clients' ? 'bg-emerald-600' : 'border-slate-600'}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Clientes
                </Button>
                <Button
                  variant={importType === 'orders' ? 'default' : 'outline'}
                  onClick={() => setImportType('orders')}
                  className={importType === 'orders' ? 'bg-emerald-600' : 'border-slate-600'}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Pedidos
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Fonte dos Dados */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-base">De onde vêm os dados?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={importSource === 'excel' ? 'default' : 'outline'}
                  onClick={() => setImportSource('excel')}
                  className={importSource === 'excel' ? 'bg-green-600' : 'border-slate-600'}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Excel
                </Button>
                <Button
                  variant={importSource === 'csv' ? 'default' : 'outline'}
                  onClick={() => setImportSource('csv')}
                  className={importSource === 'csv' ? 'bg-green-600' : 'border-slate-600'}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  CSV
                </Button>
                <Button
                  variant={importSource === 'primestart' ? 'default' : 'outline'}
                  onClick={() => setImportSource('primestart')}
                  className={importSource === 'primestart' ? 'bg-blue-600' : 'border-slate-600'}
                >
                  <Database className="h-4 w-4 mr-2" />
                  Prime Start
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Área de Upload */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div
              className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center hover:border-emerald-500/50 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const dt = e.dataTransfer;
                if (dt.files) {
                  const input = fileInputRef.current;
                  if (input) {
                    input.files = dt.files;
                    handleFileUpload({ target: input } as any);
                  }
                }
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls,.txt"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
              
              <div className="p-4 bg-emerald-500/20 rounded-full w-fit mx-auto mb-4">
                <FileUp className="h-10 w-10 text-emerald-400" />
              </div>
              
              <h3 className="text-lg font-medium mb-2">
                Arraste seu arquivo aqui ou clique para selecionar
              </h3>
              <p className="text-sm text-slate-400 mb-4">
                Formatos aceitos: CSV, Excel (.xlsx, .xls), TXT
              </p>
              
              {importSource === 'primestart' && (
                <div className="p-3 bg-blue-950/30 border border-blue-500/30 rounded-lg max-w-md mx-auto">
                  <p className="text-sm text-blue-400">
                    💡 Para Prime Start: Exporte seus dados pelo menu Relatórios → Exportar → CSV
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Lista de Arquivos */}
        {files.length > 0 && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-emerald-400" />
                Arquivos Carregados ({files.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {files.map(file => (
                  <div
                    key={file.id}
                    className={`p-4 rounded-lg border transition-all cursor-pointer ${
                      selectedFile?.id === file.id
                        ? 'bg-emerald-950/30 border-emerald-500/50'
                        : 'bg-slate-700/30 border-slate-600 hover:border-slate-500'
                    }`}
                    onClick={() => {
                      setSelectedFile(file);
                      setColumnMappings(file.mappings || {});
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-700 rounded-lg">
                          {file.name.endsWith('.csv') ? (
                            <FileText className="h-5 w-5 text-green-400" />
                          ) : (
                            <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-slate-400">
                            {file.data.length} registros • {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {file.status === 'success' && (
                          <Badge className="bg-green-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Importado
                          </Badge>
                        )}
                        {file.status === 'error' && (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            Erro
                          </Badge>
                        )}
                        {file.status === 'pending' && (
                          <Badge variant="outline" className="border-slate-500">
                            Pendente
                          </Badge>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(file);
                            setShowPreview(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(file.id);
                          }}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mapeamento de Colunas */}
        {selectedFile && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Columns className="h-5 w-5 text-amber-400" />
                    Mapeamento de Colunas
                  </CardTitle>
                  <CardDescription>
                    Associe as colunas do arquivo com os campos do sistema
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={autoMapColumns}
                  className="border-amber-500/50 text-amber-400 hover:bg-amber-950/30"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Auto Mapear
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedFile.headers.map(header => {
                  const targetCol = EXPECTED_COLUMNS[importType].find(c => c.key === columnMappings[header]);
                  const isRequired = targetCol?.required;
                  
                  return (
                    <div key={header} className="flex items-center gap-4 p-3 bg-slate-700/30 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{header}</p>
                        <p className="text-xs text-slate-500">
                          Exemplo: {selectedFile.data[0]?.[header] || '-'}
                        </p>
                      </div>
                      
                      <ArrowRight className="h-4 w-4 text-slate-500" />
                      
                      <div className="flex-1">
                        <Select
                          value={columnMappings[header] || 'ignore'}
                          onValueChange={(value) => updateMapping(header, value)}
                        >
                          <SelectTrigger className="bg-slate-700 border-slate-600">
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ignore">
                              <span className="text-slate-400">— Ignorar —</span>
                            </SelectItem>
                            {EXPECTED_COLUMNS[importType].map(col => (
                              <SelectItem key={col.key} value={col.key}>
                                {col.label} {col.required && <span className="text-red-400">*</span>}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {columnMappings[header] && columnMappings[header] !== 'ignore' && (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Legenda */}
              <div className="mt-4 p-3 bg-slate-700/20 rounded-lg">
                <p className="text-sm text-slate-400">
                  <span className="text-red-400">*</span> Campos obrigatórios: {' '}
                  {EXPECTED_COLUMNS[importType].filter(c => c.required).map(c => c.label).join(', ')}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Opções de Importação */}
        {selectedFile && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-slate-400" />
                Opções de Importação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Pular primeira linha (cabeçalho)</p>
                    <p className="text-sm text-slate-400">A primeira linha contém os nomes das colunas</p>
                  </div>
                  <Switch
                    checked={skipFirstRow}
                    onCheckedChange={setSkipFirstRow}
                  />
                </div>
                
                <Separator className="bg-slate-700" />
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Atualizar registros existentes</p>
                    <p className="text-sm text-slate-400">Se o registro já existir, atualizar com novos dados</p>
                  </div>
                  <Switch
                    checked={updateExisting}
                    onCheckedChange={setUpdateExisting}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progresso da Importação */}
        {importing && (
          <Card className="bg-emerald-950/30 border-emerald-500/50">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
                  <div className="flex-1">
                    <p className="font-medium">Importando dados...</p>
                    <p className="text-sm text-slate-400">{importProgress}% concluído</p>
                  </div>
                </div>
                <Progress value={importProgress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resultados da Importação */}
        {importResults && (
          <Card className={`${importResults.errors === 0 ? 'bg-green-950/30 border-green-500/50' : 'bg-amber-950/30 border-amber-500/50'}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {importResults.errors === 0 ? (
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-400" />
                )}
                Resultado da Importação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-4 bg-green-500/20 rounded-lg text-center">
                  <p className="text-3xl font-bold text-green-400">{importResults.success}</p>
                  <p className="text-sm text-slate-400">Importados com sucesso</p>
                </div>
                <div className="p-4 bg-red-500/20 rounded-lg text-center">
                  <p className="text-3xl font-bold text-red-400">{importResults.errors}</p>
                  <p className="text-sm text-slate-400">Erros</p>
                </div>
              </div>
              
              {importResults.messages.length > 0 && (
                <Accordion type="single" collapsible>
                  <AccordionItem value="errors" className="border-slate-700">
                    <AccordionTrigger className="text-amber-400">
                      Ver detalhes dos erros ({importResults.messages.length})
                    </AccordionTrigger>
                    <AccordionContent>
                      <ScrollArea className="h-40">
                        <div className="space-y-2">
                          {importResults.messages.map((msg, idx) => (
                            <p key={idx} className="text-sm text-slate-300 p-2 bg-slate-800 rounded">
                              {msg}
                            </p>
                          ))}
                        </div>
                      </ScrollArea>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </CardContent>
          </Card>
        )}

        {/* Botão de Importar */}
        {selectedFile && !importing && (
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedFile(null);
                setColumnMappings({});
                setImportResults(null);
              }}
              className="border-slate-600"
            >
              Cancelar
            </Button>
            <Button
              onClick={startImport}
              className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
              disabled={Object.keys(columnMappings).length === 0}
            >
              <Upload className="h-4 w-4 mr-2" />
              Iniciar Importação
            </Button>
          </div>
        )}

        {/* Ajuda */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-blue-400" />
              Ajuda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="space-y-2">
              <AccordionItem value="excel" className="border-slate-700 rounded-lg px-4">
                <AccordionTrigger>Como preparar planilha do Excel?</AccordionTrigger>
                <AccordionContent>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-slate-300">
                    <li>Abra sua planilha no Excel</li>
                    <li>Certifique-se que a primeira linha contém os nomes das colunas</li>
                    <li>Salve como CSV (Arquivo → Salvar Como → CSV UTF-8)</li>
                    <li>Faça upload do arquivo CSV aqui</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="primestart" className="border-slate-700 rounded-lg px-4">
                <AccordionTrigger>Como exportar do Prime Start?</AccordionTrigger>
                <AccordionContent>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-slate-300">
                    <li>No Prime Start, vá em Relatórios</li>
                    <li>Selecione o tipo de dados (Produtos, Clientes, etc.)</li>
                    <li>Clique em Exportar → CSV ou Excel</li>
                    <li>Faça upload do arquivo exportado aqui</li>
                    <li>O sistema reconhecerá automaticamente as colunas do Prime Start</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="errors" className="border-slate-700 rounded-lg px-4">
                <AccordionTrigger>O que fazer se der erro?</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc list-inside space-y-2 text-sm text-slate-300">
                    <li>Verifique se o arquivo está no formato correto (CSV ou Excel)</li>
                    <li>Certifique-se que os campos obrigatórios estão preenchidos</li>
                    <li>Valores numéricos devem usar ponto ou vírgula como separador decimal</li>
                    <li>Datas devem estar no formato DD/MM/AAAA ou AAAA-MM-DD</li>
                    <li>Se o problema persistir, baixe o modelo e use como referência</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </main>

      {/* Modal de Preview */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Preview: {selectedFile?.name}</DialogTitle>
            <DialogDescription>
              Mostrando primeiras 10 linhas de {selectedFile?.data.length} registros
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[400px]">
            <UITable>
              <TableHeader>
                <TableRow className="border-slate-700">
                  {selectedFile?.headers.map(header => (
                    <TableHead key={header} className="text-slate-300">
                      {header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedFile?.data.slice(0, 10).map((row, idx) => (
                  <TableRow key={idx} className="border-slate-700">
                    {selectedFile.headers.map(header => (
                      <TableCell key={header} className="text-slate-400">
                        {row[header] || '-'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </UITable>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

