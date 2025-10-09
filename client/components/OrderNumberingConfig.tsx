import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Hash, Save, RefreshCw, FileText, Upload } from 'lucide-react';
import { useTenant } from '@/context/TenantContext';

interface OrderNumberingSettings {
  prefix: string;
  currentNumber: number;
  format: string;
  totalDigits: number;
  autoIncrement: boolean;
  resetPeriod: 'never' | 'yearly' | 'monthly';
  yearPrefix: boolean;
  monthPrefix: boolean;
}

export const OrderNumberingConfig: React.FC = () => {
  const { currentTenant } = useTenant();
  const [settings, setSettings] = useState<OrderNumberingSettings>({
    prefix: '',
    currentNumber: 5066,
    format: '000000',
    totalDigits: 6,
    autoIncrement: true,
    resetPeriod: 'never',
    yearPrefix: false,
    monthPrefix: false
  });

  const [previewNumber, setPreviewNumber] = useState('');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importStartNumber, setImportStartNumber] = useState('');
  const [importEndNumber, setImportEndNumber] = useState('');

  // Carrega configurações salvas do localStorage
  useEffect(() => {
    if (currentTenant) {
      const saved = localStorage.getItem(`orderNumbering_${currentTenant.slug}`);
      if (saved) {
        const parsedSettings = JSON.parse(saved);
        setSettings(parsedSettings);
      }
    }
  }, [currentTenant]);

  // Atualiza preview sempre que as configurações mudam
  useEffect(() => {
    updatePreview();
  }, [settings]);

  const updatePreview = () => {
    let preview = '';
    
    // Adiciona prefixo de ano se habilitado
    if (settings.yearPrefix) {
      preview += new Date().getFullYear().toString().slice(-2);
    }
    
    // Adiciona prefixo de mês se habilitado
    if (settings.monthPrefix) {
      preview += String(new Date().getMonth() + 1).padStart(2, '0');
    }
    
    // Adiciona prefixo personalizado
    if (settings.prefix) {
      preview += settings.prefix;
    }
    
    // Adiciona número formatado
    const numberStr = String(settings.currentNumber).padStart(settings.totalDigits, '0');
    preview += numberStr;
    
    setPreviewNumber(preview);
  };

  const handleSave = () => {
    if (currentTenant) {
      localStorage.setItem(`orderNumbering_${currentTenant.slug}`, JSON.stringify(settings));
      alert('Configurações de numeração salvas com sucesso!');
    }
  };

  const handleReset = () => {
    if (confirm('Tem certeza que deseja resetar as configurações?')) {
      setSettings({
        prefix: '',
        currentNumber: 1,
        format: '000000',
        totalDigits: 6,
        autoIncrement: true,
        resetPeriod: 'never',
        yearPrefix: false,
        monthPrefix: false
      });
    }
  };

  const generateNextNumber = (): string => {
    let nextNum = settings.currentNumber;
    
    // Se auto incremento está habilitado, incrementa o número
    if (settings.autoIncrement) {
      nextNum += 1;
      setSettings(prev => ({ ...prev, currentNumber: nextNum }));
    }
    
    let result = '';
    
    // Adiciona prefixo de ano se habilitado
    if (settings.yearPrefix) {
      result += new Date().getFullYear().toString().slice(-2);
    }
    
    // Adiciona prefixo de mês se habilitado
    if (settings.monthPrefix) {
      result += String(new Date().getMonth() + 1).padStart(2, '0');
    }
    
    // Adiciona prefixo personalizado
    if (settings.prefix) {
      result += settings.prefix;
    }
    
    // Adiciona número formatado
    const numberStr = String(nextNum).padStart(settings.totalDigits, '0');
    result += numberStr;
    
    return result;
  };

  const handleImportRange = () => {
    const start = parseInt(importStartNumber);
    const end = parseInt(importEndNumber);
    
    if (start && end && start <= end) {
      // Aqui você pode implementar a lógica para criar pedidos em lote
      // ou marcar números como já utilizados
      alert(`Preparando importação de pedidos ${start} a ${end}`);
      setShowImportDialog(false);
    } else {
      alert('Por favor, insira um intervalo válido.');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="w-5 h-5" />
            Configuração de Numeração de Pedidos
          </CardTitle>
          <CardDescription>
            Configure como os números dos pedidos serão gerados automaticamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Preview do número atual */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <Label className="text-sm font-medium">Próximo número será:</Label>
            <div className="text-2xl font-mono font-bold text-blue-600 dark:text-blue-400 mt-2">
              {previewNumber}
            </div>
          </div>

          {/* Configurações principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentNumber">Número Atual</Label>
              <Input
                id="currentNumber"
                type="number"
                value={settings.currentNumber}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  currentNumber: parseInt(e.target.value) || 0 
                }))}
                placeholder="5066"
              />
              <p className="text-xs text-gray-500">
                O próximo pedido terá este número + 1
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalDigits">Total de Dígitos</Label>
              <Input
                id="totalDigits"
                type="number"
                min="3"
                max="10"
                value={settings.totalDigits}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  totalDigits: parseInt(e.target.value) || 6 
                }))}
              />
              <p className="text-xs text-gray-500">
                Número de dígitos no formato (ex: 6 = 000000)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prefix">Prefixo Personalizado</Label>
              <Input
                id="prefix"
                value={settings.prefix}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  prefix: e.target.value.toUpperCase() 
                }))}
                placeholder="ORD"
                maxLength={5}
              />
              <p className="text-xs text-gray-500">
                Prefixo opcional antes do número (ex: ORD, LOC)
              </p>
            </div>

            <div className="space-y-2">
              <Label>Opções de Data</Label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.yearPrefix}
                    onChange={(e) => setSettings(prev => ({ 
                      ...prev, 
                      yearPrefix: e.target.checked 
                    }))}
                    className="rounded"
                  />
                  <span className="text-sm">Incluir ano (25)</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.monthPrefix}
                    onChange={(e) => setSettings(prev => ({ 
                      ...prev, 
                      monthPrefix: e.target.checked 
                    }))}
                    className="rounded"
                  />
                  <span className="text-sm">Incluir mês (09)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Exemplos de formatação */}
          <div className="space-y-2">
            <Label>Exemplos de Numeração:</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Badge variant="outline">005067</Badge>
              <Badge variant="outline">ORD005067</Badge>
              <Badge variant="outline">25005067</Badge>
              <Badge variant="outline">2509ORD005067</Badge>
            </div>
          </div>

          {/* Ações */}
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Salvar Configurações
            </Button>
            
            <Button variant="outline" onClick={handleReset} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Resetar
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setShowImportDialog(true)}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Importar Numeração
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Importação */}
      {showImportDialog && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Importar Numeração Existente
            </CardTitle>
            <CardDescription>
              Defina um intervalo de números já utilizados para evitar conflitos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="importStart">Número Inicial</Label>
                <Input
                  id="importStart"
                  type="number"
                  value={importStartNumber}
                  onChange={(e) => setImportStartNumber(e.target.value)}
                  placeholder="1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="importEnd">Número Final</Label>
                <Input
                  id="importEnd"
                  type="number"
                  value={importEndNumber}
                  onChange={(e) => setImportEndNumber(e.target.value)}
                  placeholder="5066"
                />
              </div>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button onClick={handleImportRange}>
                Confirmar Importação
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowImportDialog(false)}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Hook para usar o sistema de numeração
export const useOrderNumbering = () => {
  const { currentTenant } = useTenant();
  
  const generateOrderNumber = (): string => {
    if (!currentTenant) return '';
    
    const saved = localStorage.getItem(`orderNumbering_${currentTenant.slug}`);
    let settings: OrderNumberingSettings = {
      prefix: '',
      currentNumber: 1,
      format: '000000',
      totalDigits: 6,
      autoIncrement: true,
      resetPeriod: 'never',
      yearPrefix: false,
      monthPrefix: false
    };
    
    if (saved) {
      settings = JSON.parse(saved);
    }
    
    // Incrementa o número
    const nextNumber = settings.currentNumber + 1;
    
    // Atualiza o número atual no localStorage
    const updatedSettings = { ...settings, currentNumber: nextNumber };
    localStorage.setItem(`orderNumbering_${currentTenant.slug}`, JSON.stringify(updatedSettings));
    
    // Gera o número formatado
    let result = '';
    
    if (settings.yearPrefix) {
      result += new Date().getFullYear().toString().slice(-2);
    }
    
    if (settings.monthPrefix) {
      result += String(new Date().getMonth() + 1).padStart(2, '0');
    }
    
    if (settings.prefix) {
      result += settings.prefix;
    }
    
    const numberStr = String(nextNumber).padStart(settings.totalDigits, '0');
    result += numberStr;
    
    return result;
  };
  
  return { generateOrderNumber };
};
