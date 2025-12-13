import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Building2,
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  FileText,
  Camera,
  Shield,
  AlertTriangle,
  Search,
  Filter,
  ChevronRight,
  Phone,
  Mail,
  Calendar,
  X,
  Loader2,
  Download,
  ZoomIn
} from 'lucide-react';

interface CadastroPendente {
  id: string;
  tipo: 'pf' | 'pj';
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'em_analise';
  dataCadastro: string;
  // Pessoa Física
  nome?: string;
  cpf?: string;
  // Pessoa Jurídica
  razaoSocial?: string;
  cnpj?: string;
  responsavelNome?: string;
  responsavelCpf?: string;
  // Comum
  email: string;
  telefone: string;
  selfieUrl?: string;
  documentoUrl?: string;
  comprovanteUrl?: string;
  // Validação
  validacaoAutomatica?: {
    cpfValido: boolean;
    nomeConfere: boolean;
    faceMatch: boolean;
    faceMatchScore: number;
    sandbox: boolean;
  };
  observacoes?: string;
}

// Mock de cadastros pendentes
const MOCK_CADASTROS: CadastroPendente[] = [
  {
    id: '1',
    tipo: 'pf',
    status: 'pendente',
    dataCadastro: '2025-12-12T14:30:00',
    nome: 'João Silva Santos',
    cpf: '123.456.789-00',
    email: 'joao.silva@email.com',
    telefone: '(31) 99999-1234',
    selfieUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
    validacaoAutomatica: {
      cpfValido: true,
      nomeConfere: true,
      faceMatch: true,
      faceMatchScore: 0.95,
      sandbox: true
    }
  },
  {
    id: '2',
    tipo: 'pj',
    status: 'em_analise',
    dataCadastro: '2025-12-12T10:15:00',
    razaoSocial: 'Produtora XYZ Ltda',
    cnpj: '12.345.678/0001-90',
    responsavelNome: 'Maria Oliveira',
    responsavelCpf: '987.654.321-00',
    email: 'contato@produtoraxyz.com',
    telefone: '(31) 3333-4444',
    selfieUrl: 'https://randomuser.me/api/portraits/women/1.jpg',
    validacaoAutomatica: {
      cpfValido: true,
      nomeConfere: true,
      faceMatch: true,
      faceMatchScore: 0.92,
      sandbox: true
    }
  },
  {
    id: '3',
    tipo: 'pf',
    status: 'pendente',
    dataCadastro: '2025-12-11T16:45:00',
    nome: 'Carlos Mendes',
    cpf: '111.222.333-44',
    email: 'carlos.mendes@email.com',
    telefone: '(31) 98888-5555',
    selfieUrl: 'https://randomuser.me/api/portraits/men/2.jpg',
    validacaoAutomatica: {
      cpfValido: true,
      nomeConfere: false,
      faceMatch: false,
      faceMatchScore: 0.45,
      sandbox: true
    }
  }
];

export const CadastrosPendentes: React.FC = () => {
  const [cadastros, setCadastros] = useState<CadastroPendente[]>(MOCK_CADASTROS);
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [cadastroSelecionado, setCadastroSelecionado] = useState<CadastroPendente | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showImageModal, setShowImageModal] = useState<string | null>(null);

  // Filtrar cadastros
  const cadastrosFiltrados = cadastros.filter(c => {
    if (filtroStatus !== 'todos' && c.status !== filtroStatus) return false;
    if (filtroTipo !== 'todos' && c.tipo !== filtroTipo) return false;
    return true;
  });

  // Contadores
  const pendentes = cadastros.filter(c => c.status === 'pendente').length;
  const emAnalise = cadastros.filter(c => c.status === 'em_analise').length;

  // Aprovar cadastro
  const aprovarCadastro = async (id: string) => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setCadastros(prev => prev.map(c => 
      c.id === id ? { ...c, status: 'aprovado' as const } : c
    ));
    setCadastroSelecionado(null);
    setIsLoading(false);
    alert('✅ Cadastro aprovado com sucesso!');
  };

  // Rejeitar cadastro
  const rejeitarCadastro = async (id: string, motivo?: string) => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setCadastros(prev => prev.map(c => 
      c.id === id ? { ...c, status: 'rejeitado' as const, observacoes: motivo } : c
    ));
    setCadastroSelecionado(null);
    setIsLoading(false);
    alert('❌ Cadastro rejeitado.');
  };

  // Status badge
  const StatusBadge = ({ status }: { status: string }) => {
    const configs: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      pendente: { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: <Clock className="w-3 h-3" /> },
      em_analise: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: <Eye className="w-3 h-3" /> },
      aprovado: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: <CheckCircle className="w-3 h-3" /> },
      rejeitado: { bg: 'bg-red-500/20', text: 'text-red-400', icon: <XCircle className="w-3 h-3" /> }
    };
    const config = configs[status] || configs.pendente;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.icon}
        {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
      </span>
    );
  };

  // Validação badge
  const ValidacaoBadge = ({ validacao }: { validacao?: CadastroPendente['validacaoAutomatica'] }) => {
    if (!validacao) return null;
    
    const allValid = validacao.cpfValido && validacao.nomeConfere && validacao.faceMatch;
    
    return (
      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
        allValid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
      }`}>
        {allValid ? <Shield className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
        {validacao.sandbox ? 'Sandbox' : allValid ? 'Validado' : 'Atenção'}
        {validacao.faceMatchScore > 0 && (
          <span className="ml-1">({(validacao.faceMatchScore * 100).toFixed(0)}%)</span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header com contadores */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-400 text-sm">Pendentes</p>
                <p className="text-2xl font-bold text-white">{pendentes}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-400 text-sm">Em Análise</p>
                <p className="text-2xl font-bold text-white">{emAnalise}</p>
              </div>
              <Eye className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-emerald-500/10 border-emerald-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-400 text-sm">Aprovados</p>
                <p className="text-2xl font-bold text-white">
                  {cadastros.filter(c => c.status === 'aprovado').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-400 text-sm">Rejeitados</p>
                <p className="text-2xl font-bold text-white">
                  {cadastros.filter(c => c.status === 'rejeitado').length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm"
        >
          <option value="todos">Todos os status</option>
          <option value="pendente">Pendentes</option>
          <option value="em_analise">Em análise</option>
          <option value="aprovado">Aprovados</option>
          <option value="rejeitado">Rejeitados</option>
        </select>

        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm"
        >
          <option value="todos">Todos os tipos</option>
          <option value="pf">Pessoa Física</option>
          <option value="pj">Pessoa Jurídica</option>
        </select>
      </div>

      {/* Lista de cadastros */}
      <div className="space-y-3">
        {cadastrosFiltrados.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-400">Nenhum cadastro encontrado</p>
            </CardContent>
          </Card>
        ) : (
          cadastrosFiltrados.map((cadastro) => (
            <Card 
              key={cadastro.id} 
              className={`bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition cursor-pointer ${
                cadastro.status === 'pendente' ? 'border-l-4 border-l-amber-500' : ''
              }`}
              onClick={() => setCadastroSelecionado(cadastro)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Avatar/Selfie */}
                  <div className="relative">
                    {cadastro.selfieUrl ? (
                      <img 
                        src={cadastro.selfieUrl} 
                        alt="Selfie" 
                        className="w-14 h-14 rounded-full object-cover border-2 border-zinc-700"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center">
                        {cadastro.tipo === 'pf' ? (
                          <User className="w-6 h-6 text-zinc-500" />
                        ) : (
                          <Building2 className="w-6 h-6 text-zinc-500" />
                        )}
                      </div>
                    )}
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${
                      cadastro.tipo === 'pf' ? 'bg-blue-500' : 'bg-amber-500'
                    }`}>
                      {cadastro.tipo === 'pf' ? (
                        <User className="w-3 h-3 text-white" />
                      ) : (
                        <Building2 className="w-3 h-3 text-white" />
                      )}
                    </div>
                  </div>

                  {/* Informações */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white truncate">
                        {cadastro.tipo === 'pf' ? cadastro.nome : cadastro.razaoSocial}
                      </h3>
                      <StatusBadge status={cadastro.status} />
                    </div>
                    <p className="text-zinc-400 text-sm">
                      {cadastro.tipo === 'pf' ? cadastro.cpf : cadastro.cnpj}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {cadastro.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(cadastro.dataCadastro).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>

                  {/* Validação */}
                  <div className="hidden md:block">
                    <ValidacaoBadge validacao={cadastro.validacaoAutomatica} />
                  </div>

                  <ChevronRight className="w-5 h-5 text-zinc-500" />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal de detalhes */}
      {cadastroSelecionado && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <Card className="bg-zinc-900 border-zinc-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  {cadastroSelecionado.tipo === 'pf' ? (
                    <User className="w-5 h-5 text-blue-400" />
                  ) : (
                    <Building2 className="w-5 h-5 text-amber-400" />
                  )}
                  Análise de Cadastro
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setCadastroSelecionado(null)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Selfie e Status */}
              <div className="flex items-start gap-6">
                <div className="text-center">
                  {cadastroSelecionado.selfieUrl ? (
                    <img 
                      src={cadastroSelecionado.selfieUrl}
                      alt="Selfie"
                      className="w-32 h-32 rounded-xl object-cover border-2 border-zinc-700 cursor-pointer hover:border-amber-400 transition"
                      onClick={() => setShowImageModal(cadastroSelecionado.selfieUrl!)}
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-xl bg-zinc-800 flex items-center justify-center">
                      <Camera className="w-10 h-10 text-zinc-600" />
                    </div>
                  )}
                  <p className="text-zinc-400 text-xs mt-2">Selfie</p>
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={cadastroSelecionado.status} />
                    <ValidacaoBadge validacao={cadastroSelecionado.validacaoAutomatica} />
                  </div>

                  {/* Validação automática */}
                  {cadastroSelecionado.validacaoAutomatica && (
                    <div className="bg-zinc-800 rounded-lg p-3 space-y-2">
                      <p className="text-sm font-medium text-white mb-2">Validação Automática:</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className={`flex items-center gap-2 ${
                          cadastroSelecionado.validacaoAutomatica.cpfValido ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {cadastroSelecionado.validacaoAutomatica.cpfValido ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          CPF Válido
                        </div>
                        <div className={`flex items-center gap-2 ${
                          cadastroSelecionado.validacaoAutomatica.nomeConfere ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {cadastroSelecionado.validacaoAutomatica.nomeConfere ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          Nome Confere
                        </div>
                        <div className={`flex items-center gap-2 ${
                          cadastroSelecionado.validacaoAutomatica.faceMatch ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {cadastroSelecionado.validacaoAutomatica.faceMatch ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          Face Match ({(cadastroSelecionado.validacaoAutomatica.faceMatchScore * 100).toFixed(0)}%)
                        </div>
                        {cadastroSelecionado.validacaoAutomatica.sandbox && (
                          <div className="flex items-center gap-2 text-amber-400">
                            <AlertTriangle className="w-4 h-4" />
                            Modo Sandbox
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Dados */}
              <div className="grid grid-cols-2 gap-4">
                {cadastroSelecionado.tipo === 'pf' ? (
                  <>
                    <div>
                      <p className="text-zinc-400 text-xs mb-1">Nome Completo</p>
                      <p className="text-white font-medium">{cadastroSelecionado.nome}</p>
                    </div>
                    <div>
                      <p className="text-zinc-400 text-xs mb-1">CPF</p>
                      <p className="text-white font-medium">{cadastroSelecionado.cpf}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="col-span-2">
                      <p className="text-zinc-400 text-xs mb-1">Razão Social</p>
                      <p className="text-white font-medium">{cadastroSelecionado.razaoSocial}</p>
                    </div>
                    <div>
                      <p className="text-zinc-400 text-xs mb-1">CNPJ</p>
                      <p className="text-white font-medium">{cadastroSelecionado.cnpj}</p>
                    </div>
                    <div>
                      <p className="text-zinc-400 text-xs mb-1">Responsável</p>
                      <p className="text-white font-medium">{cadastroSelecionado.responsavelNome}</p>
                    </div>
                    <div>
                      <p className="text-zinc-400 text-xs mb-1">CPF Responsável</p>
                      <p className="text-white font-medium">{cadastroSelecionado.responsavelCpf}</p>
                    </div>
                  </>
                )}
                <div>
                  <p className="text-zinc-400 text-xs mb-1">Email</p>
                  <p className="text-white font-medium">{cadastroSelecionado.email}</p>
                </div>
                <div>
                  <p className="text-zinc-400 text-xs mb-1">Telefone</p>
                  <p className="text-white font-medium">{cadastroSelecionado.telefone}</p>
                </div>
                <div>
                  <p className="text-zinc-400 text-xs mb-1">Data do Cadastro</p>
                  <p className="text-white font-medium">
                    {new Date(cadastroSelecionado.dataCadastro).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>

              {/* Ações */}
              {cadastroSelecionado.status === 'pendente' || cadastroSelecionado.status === 'em_analise' ? (
                <div className="flex gap-3 pt-4 border-t border-zinc-800">
                  <Button
                    onClick={() => aprovarCadastro(cadastroSelecionado.id)}
                    disabled={isLoading}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                    Aprovar Cadastro
                  </Button>
                  <Button
                    onClick={() => {
                      const motivo = prompt('Motivo da rejeição (opcional):');
                      rejeitarCadastro(cadastroSelecionado.id, motivo || undefined);
                    }}
                    disabled={isLoading}
                    variant="outline"
                    className="flex-1 border-red-500 text-red-400 hover:bg-red-500/10"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Rejeitar
                  </Button>
                </div>
              ) : (
                <div className="pt-4 border-t border-zinc-800 text-center">
                  <p className={`text-sm ${
                    cadastroSelecionado.status === 'aprovado' ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    Cadastro {cadastroSelecionado.status === 'aprovado' ? 'aprovado' : 'rejeitado'}
                    {cadastroSelecionado.observacoes && `: ${cadastroSelecionado.observacoes}`}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de imagem ampliada */}
      {showImageModal && (
        <div 
          className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4"
          onClick={() => setShowImageModal(null)}
        >
          <img 
            src={showImageModal} 
            alt="Imagem ampliada" 
            className="max-w-full max-h-full rounded-lg"
          />
          <button 
            className="absolute top-4 right-4 text-white bg-zinc-800 rounded-full p-2"
            onClick={() => setShowImageModal(null)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
};

export default CadastrosPendentes;

