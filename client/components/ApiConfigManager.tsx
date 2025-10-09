import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Settings, Globe, Key, CheckCircle, XCircle, AlertTriangle,
  Zap, Shield, Clock, Database, ExternalLink, Info
} from 'lucide-react';

interface APIConfig {
  enabled: boolean;
  apiKey?: string;
  rateLimit: number;
  priority: number;
}

interface APISettings {
  cpf: {
    cpfBrasil: APIConfig;
    serasa: APIConfig;
    spc: APIConfig;
  };
  cnpj: {
    brasilApi: APIConfig;
    receitaWs: APIConfig;
    cnpja: APIConfig;
    consultaApi: APIConfig;
  };
  cep: {
    viaCep: APIConfig;
    correios: APIConfig;
  };
}

export const ApiConfigManager: React.FC = () => {
  const [settings, setSettings] = useState<APISettings>({
    cpf: {
      cpfBrasil: { enabled: true, rateLimit: 100, priority: 1 },
      serasa: { enabled: false, apiKey: '', rateLimit: 1000, priority: 2 },
      spc: { enabled: false, apiKey: '', rateLimit: 500, priority: 3 }
    },
    cnpj: {
      brasilApi: { enabled: true, rateLimit: 200, priority: 1 },
      receitaWs: { enabled: true, rateLimit: 100, priority: 2 },
      cnpja: { enabled: true, rateLimit: 300, priority: 3 },
      consultaApi: { enabled: false, apiKey: '', rateLimit: 1000, priority: 4 }
    },
    cep: {
      viaCep: { enabled: true, rateLimit: 1000, priority: 1 },
      correios: { enabled: false, apiKey: '', rateLimit: 500, priority: 2 }
    }
  });

  const [testResults, setTestResults] = useState<Record<string, 'success' | 'error' | 'testing'>>({});

  useEffect(() => {
    // Carregar configurações do localStorage
    const saved = localStorage.getItem('api-settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const saveSettings = () => {
    localStorage.setItem('api-settings', JSON.stringify(settings));
    alert('Configurações salvas com sucesso!');
  };

  const testAPI = async (apiName: string, type: 'cpf' | 'cnpj' | 'cep') => {
    setTestResults(prev => ({ ...prev, [apiName]: 'testing' }));
    
    try {
      // Simular teste de API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular sucesso/erro baseado na configuração
      const isEnabled = type === 'cpf' ? 
        settings.cpf[apiName as keyof typeof settings.cpf]?.enabled :
        type === 'cnpj' ?
        settings.cnpj[apiName as keyof typeof settings.cnpj]?.enabled :
        settings.cep[apiName as keyof typeof settings.cep]?.enabled;
      
      setTestResults(prev => ({ 
        ...prev, 
        [apiName]: isEnabled ? 'success' : 'error' 
      }));
    } catch (error) {
      setTestResults(prev => ({ ...prev, [apiName]: 'error' }));
    }
  };

  const updateApiConfig = (type: 'cpf' | 'cnpj' | 'cep', apiName: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [apiName]: {
          ...(prev[type][apiName as keyof typeof prev[typeof type]] as object || {}),
          [field]: value
        }
      }
    }));
  };

  const getStatusIcon = (apiName: string) => {
    const status = testResults[apiName];
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'testing': return <Clock className="w-4 h-4 animate-spin text-yellow-400" />;
      default: return <Database className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configuração de APIs de Consulta
          </CardTitle>
          <CardDescription>
            Configure e teste as APIs para consulta automática de CPF, CNPJ e CEP
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Alerta sobre APIs Gratuitas */}
          <div className="bg-blue-900/20 border border-blue-500/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-5 h-5 text-blue-400" />
              <h4 className="text-blue-400 font-medium">💡 APIs Gratuitas Disponíveis</h4>
            </div>
            <div className="text-blue-300 text-sm space-y-1">
              <p>✅ <strong>Recomendadas e funcionais:</strong></p>
              <ul className="ml-4 space-y-1">
                <li>• 🏢 <strong>BrasilAPI</strong> - CNPJ oficial do governo (gratuita)</li>
                <li>• 🏠 <strong>ViaCEP</strong> - CEP dos Correios (gratuita)</li>
                <li>• 🔍 <strong>ReceitaWS</strong> - CNPJ não oficial mas estável</li>
                <li>• 📊 <strong>CNPJá</strong> - 5 consultas/minuto gratuitas</li>
              </ul>
            </div>
          </div>

          {/* Configurações CPF */}
          <Card className="bg-cinema-dark-lighter border-cinema-gray-light">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                👤 Consulta de CPF
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* CPF Brasil */}
              <div className="flex items-center justify-between p-3 bg-cinema-dark border border-cinema-gray-light rounded">
                <div className="flex items-center gap-3">
                  {getStatusIcon('cpfBrasil')}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">CPF Brasil</span>
                      <Badge variant="outline" className="text-green-400 border-green-400">
                        Gratuita
                      </Badge>
                      <a 
                        href="https://cpf-brasil.org" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <p className="text-gray-400 text-sm">100 consultas/mês gratuitas</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={settings.cpf.cpfBrasil.enabled}
                    onCheckedChange={(checked) => updateApiConfig('cpf', 'cpfBrasil', 'enabled', checked)}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => testAPI('cpfBrasil', 'cpf')}
                    disabled={testResults.cpfBrasil === 'testing'}
                  >
                    Testar
                  </Button>
                </div>
              </div>

              {/* Serasa (Paga) */}
              <div className="flex items-center justify-between p-3 bg-cinema-dark border border-cinema-gray-light rounded opacity-60">
                <div className="flex items-center gap-3">
                  {getStatusIcon('serasa')}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">Serasa</span>
                      <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                        Paga
                      </Badge>
                    </div>
                    <p className="text-gray-400 text-sm">API profissional - requer contrato</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    placeholder="API Key"
                    className="w-32 bg-cinema-dark-lighter border-cinema-gray-light text-white text-xs"
                    value={settings.cpf.serasa.apiKey || ''}
                    onChange={(e) => updateApiConfig('cpf', 'serasa', 'apiKey', e.target.value)}
                  />
                  <Switch
                    checked={settings.cpf.serasa.enabled}
                    onCheckedChange={(checked) => updateApiConfig('cpf', 'serasa', 'enabled', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configurações CNPJ */}
          <Card className="bg-cinema-dark-lighter border-cinema-gray-light">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                🏢 Consulta de CNPJ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* BrasilAPI */}
              <div className="flex items-center justify-between p-3 bg-cinema-dark border border-cinema-gray-light rounded">
                <div className="flex items-center gap-3">
                  {getStatusIcon('brasilApi')}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">BrasilAPI</span>
                      <Badge variant="outline" className="text-green-400 border-green-400">
                        Oficial
                      </Badge>
                      <Badge variant="outline" className="text-green-400 border-green-400">
                        Gratuita
                      </Badge>
                    </div>
                    <p className="text-gray-400 text-sm">API oficial do governo brasileiro</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={settings.cnpj.brasilApi.enabled}
                    onCheckedChange={(checked) => updateApiConfig('cnpj', 'brasilApi', 'enabled', checked)}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => testAPI('brasilApi', 'cnpj')}
                    disabled={testResults.brasilApi === 'testing'}
                  >
                    Testar
                  </Button>
                </div>
              </div>

              {/* ReceitaWS */}
              <div className="flex items-center justify-between p-3 bg-cinema-dark border border-cinema-gray-light rounded">
                <div className="flex items-center gap-3">
                  {getStatusIcon('receitaWs')}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">ReceitaWS</span>
                      <Badge variant="outline" className="text-green-400 border-green-400">
                        Gratuita
                      </Badge>
                    </div>
                    <p className="text-gray-400 text-sm">API não oficial mas estável</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={settings.cnpj.receitaWs.enabled}
                    onCheckedChange={(checked) => updateApiConfig('cnpj', 'receitaWs', 'enabled', checked)}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => testAPI('receitaWs', 'cnpj')}
                    disabled={testResults.receitaWs === 'testing'}
                  >
                    Testar
                  </Button>
                </div>
              </div>

              {/* CNPJá */}
              <div className="flex items-center justify-between p-3 bg-cinema-dark border border-cinema-gray-light rounded">
                <div className="flex items-center gap-3">
                  {getStatusIcon('cnpja')}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">CNPJá</span>
                      <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                        Limitada
                      </Badge>
                    </div>
                    <p className="text-gray-400 text-sm">5 consultas/minuto gratuitas</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={settings.cnpj.cnpja.enabled}
                    onCheckedChange={(checked) => updateApiConfig('cnpj', 'cnpja', 'enabled', checked)}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => testAPI('cnpja', 'cnpj')}
                    disabled={testResults.cnpja === 'testing'}
                  >
                    Testar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configurações CEP */}
          <Card className="bg-cinema-dark-lighter border-cinema-gray-light">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                🏠 Consulta de CEP
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* ViaCEP */}
              <div className="flex items-center justify-between p-3 bg-cinema-dark border border-cinema-gray-light rounded">
                <div className="flex items-center gap-3">
                  {getStatusIcon('viaCep')}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">ViaCEP</span>
                      <Badge variant="outline" className="text-green-400 border-green-400">
                        Gratuita
                      </Badge>
                      <Badge variant="outline" className="text-green-400 border-green-400">
                        Oficial
                      </Badge>
                    </div>
                    <p className="text-gray-400 text-sm">Base dos Correios - 100% gratuita</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={settings.cep.viaCep.enabled}
                    onCheckedChange={(checked) => updateApiConfig('cep', 'viaCep', 'enabled', checked)}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => testAPI('viaCep', 'cep')}
                    disabled={testResults.viaCep === 'testing'}
                  >
                    Testar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resumo e Ações */}
          <div className="flex items-center justify-between p-4 bg-green-900/20 border border-green-500/50 rounded-lg">
            <div>
              <h4 className="text-green-400 font-medium">✅ Sistema Configurado</h4>
              <p className="text-green-300 text-sm">
                APIs ativas: {Object.values(settings.cnpj).filter(api => api.enabled).length} CNPJ, 
                {Object.values(settings.cpf).filter(api => api.enabled).length} CPF, 
                {Object.values(settings.cep).filter(api => api.enabled).length} CEP
              </p>
            </div>
            <Button 
              onClick={saveSettings}
              className="bg-green-600 hover:bg-green-700"
            >
              <Shield className="w-4 h-4 mr-2" />
              Salvar Configurações
            </Button>
          </div>

          {/* Guia de Implementação */}
          <Card className="bg-yellow-900/20 border-yellow-500/50">
            <CardHeader>
              <CardTitle className="text-yellow-400 text-lg flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Guia Rápido de Implementação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-yellow-300">
                <div>
                  <p className="font-medium">🚀 Para começar rapidamente:</p>
                  <ol className="ml-4 space-y-1 mt-2">
                    <li>1. ✅ Mantenha <strong>BrasilAPI</strong> ativa (CNPJ oficial)</li>
                    <li>2. ✅ Mantenha <strong>ViaCEP</strong> ativa (CEP gratuito)</li>
                    <li>3. ✅ Use <strong>ReceitaWS</strong> como backup para CNPJ</li>
                    <li>4. 💰 Configure APIs pagas apenas se precisar de volume alto</li>
                  </ol>
                </div>
                
                <Separator className="bg-yellow-500/30" />
                
                <div>
                  <p className="font-medium">⚡ Rate Limits recomendados:</p>
                  <ul className="ml-4 space-y-1 mt-2">
                    <li>• BrasilAPI: 200 req/min</li>
                    <li>• ViaCEP: 1000 req/min</li>
                    <li>• ReceitaWS: 100 req/min</li>
                    <li>• CNPJá: 5 req/min (limite da API)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};
