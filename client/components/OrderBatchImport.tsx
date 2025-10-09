import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Upload, FileText, Download, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useTenant } from '@/context/TenantContext';

interface ImportOrder {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  equipment: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: 'pending' | 'approved' | 'active' | 'returned' | 'cancelled';
  notes?: string;
}

interface ImportResult {
  success: boolean;
  orderNumber: string;
  error?: string;
}

export const OrderBatchImport: React.FC = () => {
  const { addOrder } = useTenant();
  const [importData, setImportData] = useState<ImportOrder[]>([]);
  const [importResults, setImportResults] = useState<ImportResult[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Template para download
  const downloadTemplate = () => {
    const template = [
      {
        orderNumber: '005067',
        customerName: 'João Silva',
        customerEmail: 'joao@email.com',
        equipment: 'Sony FX6',
        startDate: '2025-01-20',
        endDate: '2025-01-22',
        totalAmount: 1200,
        status: 'active',
        notes: 'Pedido de exemplo'
      },
      {
        orderNumber: '005068',
        customerName: 'Maria Santos',
        customerEmail: 'maria@email.com',
        equipment: 'Canon R5C',
        startDate: '2025-01-21',
        endDate: '2025-01-23',
        totalAmount: 850,
        status: 'pending',
        notes: 'Aguardando confirmação'
      }
    ];

    const csvContent = [
      // Cabeçalho
      'orderNumber,customerName,customerEmail,equipment,startDate,endDate,totalAmount,status,notes',
      // Dados
      ...template.map(order => 
        `${order.orderNumber},${order.customerName},${order.customerEmail},${order.equipment},${order.startDate},${order.endDate},${order.totalAmount},${order.status},"${order.notes}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_pedidos.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Processar arquivo CSV
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      const lines = csv.split('\n');
      const headers = lines[0].split(',');
      
      const orders: ImportOrder[] = lines.slice(1)
        .filter(line => line.trim())
        .map(line => {
          const values = line.split(',');
          return {
            orderNumber: values[0]?.replace(/"/g, '') || '',
            customerName: values[1]?.replace(/"/g, '') || '',
            customerEmail: values[2]?.replace(/"/g, '') || '',
            equipment: values[3]?.replace(/"/g, '') || '',
            startDate: values[4]?.replace(/"/g, '') || '',
            endDate: values[5]?.replace(/"/g, '') || '',
            totalAmount: parseFloat(values[6]?.replace(/"/g, '') || '0'),
            status: (values[7]?.replace(/"/g, '') as ImportOrder['status']) || 'pending',
            notes: values[8]?.replace(/"/g, '') || ''
          };
        });

      setImportData(orders);
    };

    reader.readAsText(file);
  };

  // Importar pedidos
  const handleImport = async () => {
    if (importData.length === 0) return;

    setIsImporting(true);
    const results: ImportResult[] = [];

    for (const orderData of importData) {
      try {
        // Validar dados obrigatórios
        if (!orderData.orderNumber || !orderData.customerName || !orderData.customerEmail) {
          results.push({
            success: false,
            orderNumber: orderData.orderNumber || 'N/A',
            error: 'Dados obrigatórios faltando (número, nome ou email)'
          });
          continue;
        }

        // Criar pedido usando o contexto
        const createdOrderNumber = addOrder({
          customerId: orderData.customerName, // Em produção seria o ID
          customerName: orderData.customerName,
          customerEmail: orderData.customerEmail,
          items: [{
            productId: orderData.equipment,
            productName: orderData.equipment,
            quantity: 1,
            dailyRate: orderData.totalAmount,
            totalDays: 1,
            totalPrice: orderData.totalAmount
          }],
          startDate: new Date(orderData.startDate),
          endDate: new Date(orderData.endDate),
          totalAmount: orderData.totalAmount,
          status: orderData.status,
          notes: orderData.notes
        });

        // Atualizar o localStorage para manter a numeração específica
        const tenantSlug = localStorage.getItem('currentTenant') || 'default';
        const saved = localStorage.getItem(`orderNumbering_${tenantSlug}`);
        let settings = { currentNumber: 5066 };
        
        if (saved) {
          settings = JSON.parse(saved);
        }

        // Se o número importado for maior que o atual, atualizar
        const importedNumber = parseInt(orderData.orderNumber.replace(/\D/g, ''));
        if (importedNumber > settings.currentNumber) {
          settings.currentNumber = importedNumber;
          localStorage.setItem(`orderNumbering_${tenantSlug}`, JSON.stringify(settings));
        }

        results.push({
          success: true,
          orderNumber: orderData.orderNumber
        });

      } catch (error) {
        results.push({
          success: false,
          orderNumber: orderData.orderNumber,
          error: `Erro ao criar pedido: ${error}`
        });
      }
    }

    setImportResults(results);
    setShowResults(true);
    setIsImporting(false);
  };

  const resetImport = () => {
    setImportData([]);
    setImportResults([]);
    setShowResults(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Importação em Lote de Pedidos
          </CardTitle>
          <CardDescription>
            Importe múltiplos pedidos de uma vez usando um arquivo CSV com numeração personalizada
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!showResults ? (
            <>
              {/* Download do Template */}
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div>
                  <h3 className="font-medium">1. Baixe o Template</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Baixe o modelo CSV com os campos necessários
                  </p>
                </div>
                <Button onClick={downloadTemplate} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Template
                </Button>
              </div>

              {/* Upload do Arquivo */}
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h3 className="font-medium mb-2">2. Faça Upload do Arquivo</h3>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="max-w-sm"
                  />
                  <span className="text-sm text-gray-500">
                    Apenas arquivos .csv
                  </span>
                </div>
              </div>

              {/* Preview dos Dados */}
              {importData.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">3. Preview dos Dados ({importData.length} pedidos)</h3>
                    <div className="flex gap-2">
                      <Button onClick={resetImport} variant="outline" size="sm">
                        <X className="w-4 h-4 mr-2" />
                        Cancelar
                      </Button>
                      <Button 
                        onClick={handleImport} 
                        disabled={isImporting}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isImporting ? 'Importando...' : 'Confirmar Importação'}
                      </Button>
                    </div>
                  </div>

                  <div className="max-h-64 overflow-y-auto border rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                        <tr>
                          <th className="p-2 text-left">Número</th>
                          <th className="p-2 text-left">Cliente</th>
                          <th className="p-2 text-left">Equipamento</th>
                          <th className="p-2 text-left">Período</th>
                          <th className="p-2 text-left">Valor</th>
                          <th className="p-2 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importData.map((order, index) => (
                          <tr key={index} className="border-t">
                            <td className="p-2 font-mono">{order.orderNumber}</td>
                            <td className="p-2">{order.customerName}</td>
                            <td className="p-2">{order.equipment}</td>
                            <td className="p-2">{order.startDate} a {order.endDate}</td>
                            <td className="p-2">R$ {order.totalAmount.toFixed(2)}</td>
                            <td className="p-2">
                              <Badge variant={order.status === 'active' ? 'default' : 'secondary'}>
                                {order.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Resultados da Importação */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Resultados da Importação</h3>
                <Button onClick={resetImport} variant="outline">
                  Nova Importação
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <div>
                        <div className="font-medium">Sucessos</div>
                        <div className="text-2xl font-bold text-green-600">
                          {importResults.filter(r => r.success).length}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      <div>
                        <div className="font-medium">Erros</div>
                        <div className="text-2xl font-bold text-red-600">
                          {importResults.filter(r => !r.success).length}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-500" />
                      <div>
                        <div className="font-medium">Total</div>
                        <div className="text-2xl font-bold text-blue-600">
                          {importResults.length}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detalhes dos Resultados */}
              <div className="max-h-64 overflow-y-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                    <tr>
                      <th className="p-2 text-left">Status</th>
                      <th className="p-2 text-left">Número do Pedido</th>
                      <th className="p-2 text-left">Resultado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importResults.map((result, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-2">
                          {result.success ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          )}
                        </td>
                        <td className="p-2 font-mono">{result.orderNumber}</td>
                        <td className="p-2">
                          {result.success ? (
                            <span className="text-green-600">Importado com sucesso</span>
                          ) : (
                            <span className="text-red-600">{result.error}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
