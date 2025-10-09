import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Upload, Download, FileSpreadsheet, Users, AlertTriangle, 
  CheckCircle, X, Eye, Calendar, Clock, RefreshCw, Database
} from 'lucide-react';

interface ImportedClient {
  id?: string;
  name: string;
  cpfCnpj: string;
  email: string;
  phone: string;
  type: 'cliente' | 'fornecedor' | 'ambos';
  company?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  registrationDate?: string;
  lastUpdate?: string;
  status: 'novo' | 'existente' | 'conflito' | 'erro';
  needsUpdate?: boolean;
  errorMessage?: string;
  // Campos específicos do Prime Start
  primeStartId?: string;
  totalOrders?: number;
  totalSpent?: number;
  lastOrder?: string;
  creditLimit?: number;
  riskLevel?: 'baixo' | 'medio' | 'alto';
}

interface ImportStats {
  total: number;
  novos: number;
  existentes: number;
  conflitos: number;
  erros: number;
  precisamAtualizacao: number;
}

export const ClientImportManager: React.FC = () => {
  const [importData, setImportData] = useState<ImportedClient[]>([]);
  const [importStats, setImportStats] = useState<ImportStats>({
    total: 0,
    novos: 0,
    existentes: 0,
    conflitos: 0,
    erros: 0,
    precisamAtualizacao: 0
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [selectedForUpdate, setSelectedForUpdate] = useState<string[]>([]);

  // Template para download
  const downloadTemplate = () => {
    const template = [
      {
        name: 'João Silva',
        cpfCnpj: '123.456.789-00',
        email: 'joao@email.com',
        phone: '(31) 99999-9999',
        type: 'cliente',
        company: '',
        address: 'Rua das Flores, 123',
        city: 'Belo Horizonte',
        state: 'MG',
        zipCode: '30000-000',
        registrationDate: '2024-01-15',
        primeStartId: 'PS001',
        totalOrders: 5,
        totalSpent: 2500.00,
        lastOrder: '2024-12-01',
        creditLimit: 5000.00,
        riskLevel: 'baixo'
      },
      {
        name: 'Empresa XYZ LTDA',
        cpfCnpj: '12.345.678/0001-90',
        email: 'contato@empresa.com',
        phone: '(31) 3333-3333',
        type: 'ambos',
        company: 'Empresa XYZ LTDA',
        address: 'Av. Principal, 456',
        city: 'Contagem',
        state: 'MG',
        zipCode: '32000-000',
        registrationDate: '2023-06-20',
        primeStartId: 'PS002',
        totalOrders: 12,
        totalSpent: 15000.00,
        lastOrder: '2024-11-28',
        creditLimit: 25000.00,
        riskLevel: 'medio'
      }
    ];

    const csvContent = [
      // Cabeçalho
      'name,cpfCnpj,email,phone,type,company,address,city,state,zipCode,registrationDate,primeStartId,totalOrders,totalSpent,lastOrder,creditLimit,riskLevel',
      // Dados
      ...template.map(client => 
        `"${client.name}","${client.cpfCnpj}","${client.email}","${client.phone}","${client.type}","${client.company}","${client.address}","${client.city}","${client.state}","${client.zipCode}","${client.registrationDate}","${client.primeStartId}",${client.totalOrders},${client.totalSpent},"${client.lastOrder}",${client.creditLimit},"${client.riskLevel}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_clientes_prime_start.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Processar arquivo CSV
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setImportProgress(0);

    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      const lines = csv.split('\n');
      const headers = lines[0].split(',');
      
      const clients: ImportedClient[] = lines.slice(1)
        .filter(line => line.trim())
        .map((line, index) => {
          setImportProgress(((index + 1) / (lines.length - 1)) * 50);
          
          const values = line.split(',').map(v => v.replace(/"/g, ''));
          
          // Validação básica
          const client: ImportedClient = {
            name: values[0] || '',
            cpfCnpj: values[1] || '',
            email: values[2] || '',
            phone: values[3] || '',
            type: (values[4] as any) || 'cliente',
            company: values[5] || '',
            address: values[6] || '',
            city: values[7] || '',
            state: values[8] || '',
            zipCode: values[9] || '',
            registrationDate: values[10] || '',
            primeStartId: values[11] || '',
            totalOrders: parseInt(values[12]) || 0,
            totalSpent: parseFloat(values[13]) || 0,
            lastOrder: values[14] || '',
            creditLimit: parseFloat(values[15]) || 0,
            riskLevel: (values[16] as any) || 'medio',
            status: 'novo',
            needsUpdate: false
          };

          // Validações
          if (!client.name || !client.cpfCnpj || !client.email) {
            client.status = 'erro';
            client.errorMessage = 'Dados obrigatórios faltando (nome, CPF/CNPJ ou email)';
          }

          // Simular verificação de clientes existentes
          // Em produção, isso seria uma consulta ao banco
          if (client.cpfCnpj === '123.456.789-00' || client.cpfCnpj === '12.345.678/0001-90') {
            client.status = 'existente';
            // Verificar se precisa atualização (registros antigos)
            if (client.registrationDate && new Date(client.registrationDate) < new Date('2024-01-01')) {
              client.needsUpdate = true;
            }
          }

          return client;
        });

      // Calcular estatísticas
      const stats: ImportStats = {
        total: clients.length,
        novos: clients.filter(c => c.status === 'novo').length,
        existentes: clients.filter(c => c.status === 'existente').length,
        conflitos: clients.filter(c => c.status === 'conflito').length,
        erros: clients.filter(c => c.status === 'erro').length,
        precisamAtualizacao: clients.filter(c => c.needsUpdate).length
      };

      setImportData(clients);
      setImportStats(stats);
      setImportProgress(100);
      setShowResults(true);
      setIsProcessing(false);
    };

    reader.readAsText(file);
  };

  // Importar clientes selecionados
  const handleImport = async () => {
    setIsProcessing(true);
    
    // Simular importação
    for (let i = 0; i < importData.length; i++) {
      setImportProgress(((i + 1) / importData.length) * 100);
      await new Promise(resolve => setTimeout(resolve, 100)); // Simular processamento
    }
    
    setIsProcessing(false);
    alert(`Importação concluída! ${importStats.novos} novos clientes adicionados.`);
  };

  // Marcar para atualização gradual
  const scheduleGradualUpdate = () => {
    const clientsToUpdate = importData.filter(c => c.needsUpdate);
    setSelectedForUpdate(clientsToUpdate.map(c => c.cpfCnpj));
    alert(`${clientsToUpdate.length} clientes agendados para atualização gradual nos próximos 30 dias.`);
  };

  const resetImport = () => {
    setImportData([]);
    setImportStats({
      total: 0,
      novos: 0,
      existentes: 0,
      conflitos: 0,
      erros: 0,
      precisamAtualizacao: 0
    });
    setShowResults(false);
    setImportProgress(0);
    setSelectedForUpdate([]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'novo': return 'bg-green-600';
      case 'existente': return 'bg-blue-600';
      case 'conflito': return 'bg-yellow-600';
      case 'erro': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'novo': return <CheckCircle className="w-4 h-4" />;
      case 'existente': return <Database className="w-4 h-4" />;
      case 'conflito': return <AlertTriangle className="w-4 h-4" />;
      case 'erro': return <X className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Importação de Clientes do Prime Start
          </CardTitle>
          <CardDescription>
            Importe sua base de clientes existente e configure atualizações graduais
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {!showResults ? (
            <>
              {/* Alerta de Segurança */}
              <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <h4 className="text-red-400 font-medium">⚠️ IMPORTANTE - ATUALIZAÇÃO DE SEGURANÇA</h4>
                </div>
                <div className="text-red-300 text-sm space-y-2">
                  <p>📋 <strong>Clientes importados precisarão atualizar documentação:</strong></p>
                  <ul className="space-y-1 ml-4">
                    <li>• 🔄 Substituir documentos físicos por digitais oficiais</li>
                    <li>• 📱 Enviar CNH Digital, RG Digital ou Dados gov.br</li>
                    <li>• ⏰ Prazo de 12 meses para regularização</li>
                    <li>• 🚫 Após prazo: bloqueio para novos pedidos</li>
                  </ul>
                </div>
              </div>

              {/* Download do Template */}
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div>
                  <h3 className="font-medium text-white">1. Baixe o Template</h3>
                  <p className="text-sm text-gray-400">
                    Template compatível com dados do Prime Start
                  </p>
                </div>
                <Button onClick={downloadTemplate} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Template
                </Button>
              </div>

              {/* Upload do Arquivo */}
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h3 className="font-medium mb-2 text-white">2. Faça Upload do Arquivo</h3>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept=".csv,.xlsx"
                    onChange={handleFileUpload}
                    className="max-w-sm bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    disabled={isProcessing}
                  />
                  <span className="text-sm text-gray-400">
                    Arquivos .csv ou .xlsx
                  </span>
                </div>
                
                {isProcessing && (
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-cinema-yellow" />
                      <span className="text-sm text-white">Processando arquivo...</span>
                    </div>
                    <div className="w-full bg-cinema-dark-lighter rounded-full h-2">
                      <div 
                        className="bg-cinema-yellow h-2 rounded-full transition-all duration-300"
                        style={{ width: `${importProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Resultados da Importação */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-white text-lg">Análise dos Dados Importados</h3>
                <Button onClick={resetImport} variant="outline">
                  Nova Importação
                </Button>
              </div>

              {/* Estatísticas */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400">{importStats.total}</div>
                    <div className="text-sm text-gray-400">Total</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-400">{importStats.novos}</div>
                    <div className="text-sm text-gray-400">Novos</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400">{importStats.existentes}</div>
                    <div className="text-sm text-gray-400">Existentes</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-400">{importStats.precisamAtualizacao}</div>
                    <div className="text-sm text-gray-400">Precisam Atualizar</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-400">{importStats.erros}</div>
                    <div className="text-sm text-gray-400">Erros</div>
                  </CardContent>
                </Card>
              </div>

              {/* Ações Rápidas */}
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={handleImport}
                  disabled={isProcessing || importStats.novos === 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Importar {importStats.novos} Novos Clientes
                </Button>

                {importStats.precisamAtualizacao > 0 && (
                  <Button 
                    onClick={scheduleGradualUpdate}
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Agendar Atualização Gradual ({importStats.precisamAtualizacao})
                  </Button>
                )}
              </div>

              {/* Lista de Clientes */}
              <div className="max-h-96 overflow-y-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                    <tr>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-left">Nome</th>
                      <th className="p-3 text-left">CPF/CNPJ</th>
                      <th className="p-3 text-left">Email</th>
                      <th className="p-3 text-left">Tipo</th>
                      <th className="p-3 text-left">Prime Start ID</th>
                      <th className="p-3 text-left">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importData.map((client, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(client.status)}>
                              {getStatusIcon(client.status)}
                              <span className="ml-1 capitalize">{client.status}</span>
                            </Badge>
                            {client.needsUpdate && (
                              <Badge className="bg-orange-600">
                                <Clock className="w-3 h-3 mr-1" />
                                Precisa Atualizar
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-3 font-medium">{client.name}</td>
                        <td className="p-3 font-mono text-xs">{client.cpfCnpj}</td>
                        <td className="p-3">{client.email}</td>
                        <td className="p-3 capitalize">{client.type}</td>
                        <td className="p-3 font-mono text-xs">{client.primeStartId}</td>
                        <td className="p-3">
                          <Button size="sm" variant="outline">
                            <Eye className="w-3 h-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Plano de Atualização */}
              {importStats.precisamAtualizacao > 0 && (
                <Card className="bg-yellow-900/20 border-yellow-500/50">
                  <CardHeader>
                    <CardTitle className="text-yellow-400 text-lg flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Plano de Atualização Gradual
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-yellow-300 font-medium">Mês 1-3: Notificação</p>
                          <p className="text-yellow-200">Email e WhatsApp sobre nova política</p>
                        </div>
                        <div>
                          <p className="text-yellow-300 font-medium">Mês 4-9: Cobrança Ativa</p>
                          <p className="text-yellow-200">Solicitação de documentos digitais</p>
                        </div>
                        <div>
                          <p className="text-yellow-300 font-medium">Mês 10-12: Prazo Final</p>
                          <p className="text-yellow-200">Bloqueio progressivo para não regularizados</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
