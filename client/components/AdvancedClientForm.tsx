import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  X, Plus, Trash2, User, Building2, Phone, Mail, MapPin, 
  FileText, Calendar, Shield, AlertTriangle, CheckCircle,
  Upload, Download, Eye, Edit, Save, Users, CreditCard, Search, Loader2, Settings
} from 'lucide-react';
import { DocumentService } from '@/lib/documentService';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  isMain: boolean;
  hasSystemAccess: boolean;
}

interface Address {
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface Document {
  id: string;
  type: 'cnh_digital' | 'rg_digital' | 'dados_govbr' | 'cnpj_digital' | 'ie_digital' | 'contrato_social_digital';
  number: string;
  issuer?: string;
  issueDate?: string;
  expiryDate?: string;
  verified: boolean;
  verifiedAt?: string;
  verifiedBy?: string;
  filePath?: string;
  qrCode?: string; // Para verificação de autenticidade
  digitalSignature?: string; // Assinatura digital do documento
  govBrValidation?: boolean; // Validado via gov.br
  notes?: string;
}

interface ClientFormData {
  // Dados Básicos
  type: 'cliente' | 'fornecedor' | 'ambos';
  personType: 'fisica' | 'juridica';
  name: string;
  tradeName?: string;
  cpfCnpj: string;
  rgIe?: string;
  
  // Contatos
  contacts: Contact[];
  
  // Endereço
  address: Address;
  
  // Documentos
  documents: Document[];
  
  // Informações Financeiras
  creditLimit?: number;
  paymentTerms?: string;
  bankAccount?: {
    bank: string;
    agency: string;
    account: string;
    accountType: 'corrente' | 'poupanca';
    pix?: string;
  };
  
  // Controle
  isActive: boolean;
  registrationExpiryDate: string;
  lastVerificationDate?: string;
  nextVerificationDate: string;
  riskLevel: 'baixo' | 'medio' | 'alto';
  notes?: string;
  
  // Configurações de Sistema
  allowOnlineAccess: boolean;
  requireApproval: boolean;
  autoApproveLimit?: number;
}

interface AdvancedClientFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ClientFormData) => void;
  editingClient?: Partial<ClientFormData>;
}

export const AdvancedClientForm: React.FC<AdvancedClientFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingClient
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ClientFormData>({
    type: 'cliente',
    personType: 'fisica',
    name: '',
    cpfCnpj: '',
    contacts: [{
      id: '1',
      name: '',
      email: '',
      phone: '',
      position: '',
      isMain: true,
      hasSystemAccess: false
    }],
    address: {
      street: '',
      number: '',
      district: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Brasil'
    },
    documents: [],
    isActive: true,
    registrationExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    nextVerificationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    riskLevel: 'medio',
    allowOnlineAccess: false,
    requireApproval: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoadingCpfCnpj, setIsLoadingCpfCnpj] = useState(false);
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [lastSearchedDoc, setLastSearchedDoc] = useState('');
  const [dataLoadedSuccess, setDataLoadedSuccess] = useState('');
  const totalSteps = 5;

  useEffect(() => {
    if (editingClient) {
      setFormData({ ...formData, ...editingClient });
    }
  }, [editingClient]);

  // Validação de CPF/CNPJ
  const validateCpfCnpj = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (formData.personType === 'fisica') {
      return numbers.length === 11; // CPF
    } else {
      return numbers.length === 14; // CNPJ
    }
  };

  // Formatação de CPF/CNPJ
  const formatCpfCnpj = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (formData.personType === 'fisica') {
      return DocumentService.formatCPF(numbers);
    } else {
      return DocumentService.formatCNPJ(numbers);
    }
  };

  // Busca automática por CPF/CNPJ
  const handleCpfCnpjSearch = async (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    
    console.log('🔍 Iniciando busca para:', cleanValue);
    
    // Evitar buscar o mesmo documento novamente
    if (cleanValue === lastSearchedDoc || cleanValue.length < 11) {
      console.log('⏭️ Pulando busca (mesmo documento ou inválido)');
      return;
    }

    try {
      setIsLoadingCpfCnpj(true);
      setLastSearchedDoc(cleanValue);

      if (formData.personType === 'fisica' && cleanValue.length === 11) {
        console.log('👤 Buscando dados do CPF:', cleanValue);
        // Buscar CPF
        if (DocumentService.isValidCPF(cleanValue)) {
          console.log('✅ CPF válido, consultando APIs...');
          const cpfData = await DocumentService.consultarCPF(cleanValue);
          
          console.log('📋 Resultado da consulta:', cpfData);
          
          if (cpfData) {
            console.log('🎯 Preenchendo dados:', { nome: cpfData.nome, rg: cpfData.rg });
            setFormData(prev => ({
              ...prev,
              name: cpfData.nome || prev.name,
              cpfCnpj: cleanValue,
              // Só preenche RG se estiver vazio e se houver RG nos dados
              rgIe: (!prev.rgIe && cpfData.rg) ? cpfData.rg : prev.rgIe
            }));
            
            // Atualizar contato principal se nome foi encontrado
            if (cpfData.nome && formData.contacts.length > 0) {
              const updatedContacts = [...formData.contacts];
              updatedContacts[0] = {
                ...updatedContacts[0],
                name: cpfData.nome
              };
              setFormData(prev => ({ ...prev, contacts: updatedContacts }));
            }

            // Mostrar feedback visual de sucesso
            const nomeInfo = cpfData.nome || 'Nome não disponível';
            const rgInfo = cpfData.rg ? ` | RG: ${cpfData.rg}` : ' | RG: Preencher manualmente';
            setDataLoadedSuccess(`✅ Dados CPF carregados: ${nomeInfo}${rgInfo}`);
            setTimeout(() => setDataLoadedSuccess(''), 5000);
            console.log('✅ Feedback exibido:', `${nomeInfo}${rgInfo}`);
          }
        }
      } else if (formData.personType === 'juridica' && cleanValue.length === 14) {
        // Buscar CNPJ
        if (DocumentService.isValidCNPJ(cleanValue)) {
          const cnpjData = await DocumentService.consultarCNPJ(cleanValue);
          
          if (cnpjData) {
            setFormData(prev => ({
              ...prev,
              name: cnpjData.razao_social,
              tradeName: cnpjData.nome_fantasia,
              cpfCnpj: cleanValue,
              rgIe: cnpjData.inscricao_estadual,
              address: {
                ...prev.address,
                street: cnpjData.endereco.logradouro,
                number: cnpjData.endereco.numero,
                complement: cnpjData.endereco.complemento,
                district: cnpjData.endereco.bairro,
                city: cnpjData.endereco.cidade,
                state: cnpjData.endereco.uf,
                zipCode: cnpjData.endereco.cep
              }
            }));

            // Atualizar contato principal
            if (formData.contacts.length > 0) {
              const updatedContacts = [...formData.contacts];
              updatedContacts[0] = {
                ...updatedContacts[0],
                phone: cnpjData.contato.telefone || updatedContacts[0].phone,
                email: cnpjData.contato.email || updatedContacts[0].email
              };
              setFormData(prev => ({ ...prev, contacts: updatedContacts }));
            }

            // Mostrar feedback visual de sucesso
            setDataLoadedSuccess(`✅ Dados CNPJ carregados: ${cnpjData.razao_social} | IE: ${cnpjData.inscricao_estadual}`);
            setTimeout(() => setDataLoadedSuccess(''), 5000);
          }
        }
      }
    } catch (error) {
      console.error('Erro na busca:', error);
      // Mostrar erro para o usuário se necessário
    } finally {
      setIsLoadingCpfCnpj(false);
    }
  };

  // Busca automática por CEP
  const handleCepSearch = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    
    if (cleanCep.length === 8) {
      try {
        setIsLoadingCep(true);
        const cepData = await DocumentService.consultarCEP(cleanCep);
        
        if (cepData) {
          setFormData(prev => ({
            ...prev,
            address: {
              ...prev.address,
              street: cepData.logradouro,
              district: cepData.bairro,
              city: cepData.localidade,
              state: cepData.uf,
              zipCode: cleanCep
            }
          }));

          // Mostrar feedback visual de sucesso
          setDataLoadedSuccess(`✅ Endereço carregado: ${cepData.logradouro}, ${cepData.bairro} - ${cepData.localidade}/${cepData.uf}`);
          setTimeout(() => setDataLoadedSuccess(''), 5000);
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      } finally {
        setIsLoadingCep(false);
      }
    }
  };

  // Adicionar contato
  const addContact = () => {
    const newContact: Contact = {
      id: Date.now().toString(),
      name: '',
      email: '',
      phone: '',
      position: '',
      isMain: false,
      hasSystemAccess: false
    };
    setFormData(prev => ({
      ...prev,
      contacts: [...prev.contacts, newContact]
    }));
  };

  // Remover contato
  const removeContact = (id: string) => {
    if (formData.contacts.length > 1) {
      setFormData(prev => ({
        ...prev,
        contacts: prev.contacts.filter(c => c.id !== id)
      }));
    }
  };

  // Adicionar documento
  const addDocument = () => {
    const newDoc: Document = {
      id: Date.now().toString(),
      type: 'cnh_digital',
      number: '',
      verified: false
    };
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, newDoc]
    }));
  };

  // Validar step atual
  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
      if (!formData.cpfCnpj.trim()) newErrors.cpfCnpj = 'CPF/CNPJ é obrigatório';
      if (!validateCpfCnpj(formData.cpfCnpj)) newErrors.cpfCnpj = 'CPF/CNPJ inválido';
    }

    if (step === 2) {
      const mainContact = formData.contacts.find(c => c.isMain);
      if (!mainContact?.name.trim()) newErrors.mainContactName = 'Nome do contato principal é obrigatório';
      if (!mainContact?.email.trim()) newErrors.mainContactEmail = 'Email do contato principal é obrigatório';
      if (!mainContact?.phone.trim()) newErrors.mainContactPhone = 'Telefone do contato principal é obrigatório';
    }

    if (step === 3) {
      if (!formData.address.street.trim()) newErrors.street = 'Logradouro é obrigatório';
      if (!formData.address.number.trim()) newErrors.number = 'Número é obrigatório';
      if (!formData.address.district.trim()) newErrors.district = 'Bairro é obrigatório';
      if (!formData.address.city.trim()) newErrors.city = 'Cidade é obrigatória';
      if (!formData.address.state.trim()) newErrors.state = 'Estado é obrigatório';
      if (!formData.address.zipCode.trim()) newErrors.zipCode = 'CEP é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      onSubmit(formData);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="bg-cinema-gray border-cinema-gray-light w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="w-5 h-5" />
                {editingClient ? 'Editar Cliente/Fornecedor' : 'Novo Cliente/Fornecedor'}
              </CardTitle>
              <p className="text-gray-400 text-sm mt-1">
                Passo {currentStep} de {totalSteps} - Cadastro completo para emissão de NF
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-cinema-dark-lighter rounded-full h-2 mt-4">
            <div 
              className="bg-cinema-yellow h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Dados Básicos */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-cinema-yellow" />
                <h3 className="text-lg font-semibold text-white">Dados Básicos</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Tipo *</Label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full mt-2 p-2 bg-cinema-dark-lighter border border-cinema-gray-light rounded text-white"
                  >
                    <option value="cliente">Cliente</option>
                    <option value="fornecedor">Fornecedor</option>
                    <option value="ambos">Cliente + Fornecedor</option>
                  </select>
                </div>

                <div>
                  <Label className="text-white">Pessoa *</Label>
                  <select
                    value={formData.personType}
                    onChange={(e) => setFormData(prev => ({ ...prev, personType: e.target.value as any }))}
                    className="w-full mt-2 p-2 bg-cinema-dark-lighter border border-cinema-gray-light rounded text-white"
                  >
                    <option value="fisica">Pessoa Física</option>
                    <option value="juridica">Pessoa Jurídica</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">
                    {formData.personType === 'fisica' ? 'Nome Completo' : 'Razão Social'} *
                  </Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    placeholder={formData.personType === 'fisica' ? 'João Silva' : 'Empresa LTDA'}
                  />
                  {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                </div>

                {formData.personType === 'juridica' && (
                  <div>
                    <Label className="text-white">Nome Fantasia</Label>
                    <Input
                      value={formData.tradeName || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, tradeName: e.target.value }))}
                      className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                      placeholder="Nome comercial"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">
                    {formData.personType === 'fisica' ? 'CPF' : 'CNPJ'} *
                  </Label>
                  <div className="relative">
                    <Input
                      value={formatCpfCnpj(formData.cpfCnpj)}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData(prev => ({ ...prev, cpfCnpj: value }));
                        
                        // Busca automática quando o documento estiver completo
                        const cleanValue = value.replace(/\D/g, '');
                        if ((formData.personType === 'fisica' && cleanValue.length === 11) ||
                            (formData.personType === 'juridica' && cleanValue.length === 14)) {
                          handleCpfCnpjSearch(value);
                        }
                      }}
                      className="bg-cinema-dark-lighter border-cinema-gray-light text-white pr-10"
                      placeholder={formData.personType === 'fisica' ? '000.000.000-00' : '00.000.000/0000-00'}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {isLoadingCpfCnpj ? (
                        <Loader2 className="w-4 h-4 animate-spin text-cinema-yellow" />
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="p-1 h-6 w-6"
                          onClick={() => handleCpfCnpjSearch(formData.cpfCnpj)}
                          disabled={!formData.cpfCnpj}
                        >
                          <Search className="w-3 h-3 text-cinema-yellow" />
                        </Button>
                      )}
                    </div>
                  </div>
                  {errors.cpfCnpj && <p className="text-red-400 text-sm mt-1">{errors.cpfCnpj}</p>}
                  <p className="text-xs text-yellow-400 mt-1">
                    {formData.personType === 'fisica' 
                      ? '✅ CPF validado automaticamente (nome manual por privacidade)'
                      : '✨ Dados preenchidos automaticamente ao digitar'
                    }
                  </p>
                </div>

                <div>
                  <Label className="text-white">
                    {formData.personType === 'fisica' ? 'RG' : 'Inscrição Estadual'}
                  </Label>
                  <Input
                    value={formData.rgIe || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, rgIe: e.target.value }))}
                    className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    placeholder={formData.personType === 'fisica' ? '00.000.000-0' : '000.000.000.000'}
                  />
                  {formData.personType === 'fisica' && (
                    <p className="text-xs text-yellow-400 mt-1">
                      📝 Preencha com o RG real do documento
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-white">Nível de Risco *</Label>
                  <select
                    value={formData.riskLevel}
                    onChange={(e) => setFormData(prev => ({ ...prev, riskLevel: e.target.value as any }))}
                    className="w-full mt-2 p-2 bg-cinema-dark-lighter border border-cinema-gray-light rounded text-white"
                  >
                    <option value="baixo">🟢 Baixo Risco</option>
                    <option value="medio">🟡 Médio Risco</option>
                    <option value="alto">🔴 Alto Risco</option>
                  </select>
                </div>

                <div>
                  <Label className="text-white">Vencimento do Cadastro *</Label>
                  <Input
                    type="date"
                    value={formData.registrationExpiryDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, registrationExpiryDate: e.target.value }))}
                    className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                  />
                </div>

                <div>
                  <Label className="text-white">Próxima Verificação *</Label>
                  <Input
                    type="date"
                    value={formData.nextVerificationDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, nextVerificationDate: e.target.value }))}
                    className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Contatos */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-cinema-yellow" />
                  <h3 className="text-lg font-semibold text-white">Contatos</h3>
                </div>
                <Button onClick={addContact} size="sm" className="bg-cinema-yellow text-cinema-dark">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Contato
                </Button>
              </div>

              {formData.contacts.map((contact, index) => (
                <Card key={contact.id} className="bg-cinema-dark-lighter border-cinema-gray-light">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Badge variant={contact.isMain ? "default" : "secondary"}>
                          {contact.isMain ? "Contato Principal" : `Contato ${index + 1}`}
                        </Badge>
                        {contact.hasSystemAccess && (
                          <Badge className="bg-green-600">Acesso ao Sistema</Badge>
                        )}
                      </div>
                      {!contact.isMain && (
                        <Button
                          onClick={() => removeContact(contact.id)}
                          size="sm"
                          variant="ghost"
                          className="text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label className="text-white">Nome *</Label>
                        <Input
                          value={contact.name}
                          onChange={(e) => {
                            const updatedContacts = formData.contacts.map(c =>
                              c.id === contact.id ? { ...c, name: e.target.value } : c
                            );
                            setFormData(prev => ({ ...prev, contacts: updatedContacts }));
                          }}
                          className="bg-cinema-dark border-cinema-gray-light text-white"
                        />
                      </div>

                      <div>
                        <Label className="text-white">Cargo/Posição</Label>
                        <Input
                          value={contact.position}
                          onChange={(e) => {
                            const updatedContacts = formData.contacts.map(c =>
                              c.id === contact.id ? { ...c, position: e.target.value } : c
                            );
                            setFormData(prev => ({ ...prev, contacts: updatedContacts }));
                          }}
                          className="bg-cinema-dark border-cinema-gray-light text-white"
                          placeholder="Gerente, Diretor, etc."
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label className="text-white">Email *</Label>
                        <Input
                          type="email"
                          value={contact.email}
                          onChange={(e) => {
                            const updatedContacts = formData.contacts.map(c =>
                              c.id === contact.id ? { ...c, email: e.target.value } : c
                            );
                            setFormData(prev => ({ ...prev, contacts: updatedContacts }));
                          }}
                          className="bg-cinema-dark border-cinema-gray-light text-white"
                        />
                      </div>

                      <div>
                        <Label className="text-white">Telefone *</Label>
                        <Input
                          value={contact.phone}
                          onChange={(e) => {
                            const updatedContacts = formData.contacts.map(c =>
                              c.id === contact.id ? { ...c, phone: e.target.value } : c
                            );
                            setFormData(prev => ({ ...prev, contacts: updatedContacts }));
                          }}
                          className="bg-cinema-dark border-cinema-gray-light text-white"
                          placeholder="(00) 00000-0000"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 text-white">
                        <input
                          type="checkbox"
                          checked={contact.isMain}
                          onChange={(e) => {
                            if (e.target.checked) {
                              const updatedContacts = formData.contacts.map(c => ({
                                ...c,
                                isMain: c.id === contact.id
                              }));
                              setFormData(prev => ({ ...prev, contacts: updatedContacts }));
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">Contato Principal</span>
                      </label>

                      <label className="flex items-center gap-2 text-white">
                        <input
                          type="checkbox"
                          checked={contact.hasSystemAccess}
                          onChange={(e) => {
                            const updatedContacts = formData.contacts.map(c =>
                              c.id === contact.id ? { ...c, hasSystemAccess: e.target.checked } : c
                            );
                            setFormData(prev => ({ ...prev, contacts: updatedContacts }));
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">Acesso ao Sistema</span>
                      </label>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {errors.mainContactName && <p className="text-red-400 text-sm">{errors.mainContactName}</p>}
              {errors.mainContactEmail && <p className="text-red-400 text-sm">{errors.mainContactEmail}</p>}
              {errors.mainContactPhone && <p className="text-red-400 text-sm">{errors.mainContactPhone}</p>}
            </div>
          )}

          {/* Step 3: Endereço */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-cinema-yellow" />
                <h3 className="text-lg font-semibold text-white">Endereço</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <Label className="text-white">Logradouro *</Label>
                  <Input
                    value={formData.address.street}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      address: { ...prev.address, street: e.target.value }
                    }))}
                    className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    placeholder="Rua, Avenida, etc."
                  />
                  {errors.street && <p className="text-red-400 text-sm mt-1">{errors.street}</p>}
                </div>

                <div>
                  <Label className="text-white">Número *</Label>
                  <Input
                    value={formData.address.number}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      address: { ...prev.address, number: e.target.value }
                    }))}
                    className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                  />
                  {errors.number && <p className="text-red-400 text-sm mt-1">{errors.number}</p>}
                </div>

                <div>
                  <Label className="text-white">Complemento</Label>
                  <Input
                    value={formData.address.complement || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      address: { ...prev.address, complement: e.target.value }
                    }))}
                    className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    placeholder="Apt, Sala, etc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-white">Bairro *</Label>
                  <Input
                    value={formData.address.district}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      address: { ...prev.address, district: e.target.value }
                    }))}
                    className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                  />
                  {errors.district && <p className="text-red-400 text-sm mt-1">{errors.district}</p>}
                </div>

                <div>
                  <Label className="text-white">Cidade *</Label>
                  <Input
                    value={formData.address.city}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      address: { ...prev.address, city: e.target.value }
                    }))}
                    className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                  />
                  {errors.city && <p className="text-red-400 text-sm mt-1">{errors.city}</p>}
                </div>

                <div>
                  <Label className="text-white">Estado *</Label>
                  <select
                    value={formData.address.state}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      address: { ...prev.address, state: e.target.value }
                    }))}
                    className="w-full mt-2 p-2 bg-cinema-dark-lighter border border-cinema-gray-light rounded text-white"
                  >
                    <option value="">Selecione...</option>
                    <option value="AC">Acre</option>
                    <option value="AL">Alagoas</option>
                    <option value="AP">Amapá</option>
                    <option value="AM">Amazonas</option>
                    <option value="BA">Bahia</option>
                    <option value="CE">Ceará</option>
                    <option value="DF">Distrito Federal</option>
                    <option value="ES">Espírito Santo</option>
                    <option value="GO">Goiás</option>
                    <option value="MA">Maranhão</option>
                    <option value="MT">Mato Grosso</option>
                    <option value="MS">Mato Grosso do Sul</option>
                    <option value="MG">Minas Gerais</option>
                    <option value="PA">Pará</option>
                    <option value="PB">Paraíba</option>
                    <option value="PR">Paraná</option>
                    <option value="PE">Pernambuco</option>
                    <option value="PI">Piauí</option>
                    <option value="RJ">Rio de Janeiro</option>
                    <option value="RN">Rio Grande do Norte</option>
                    <option value="RS">Rio Grande do Sul</option>
                    <option value="RO">Rondônia</option>
                    <option value="RR">Roraima</option>
                    <option value="SC">Santa Catarina</option>
                    <option value="SP">São Paulo</option>
                    <option value="SE">Sergipe</option>
                    <option value="TO">Tocantins</option>
                  </select>
                  {errors.state && <p className="text-red-400 text-sm mt-1">{errors.state}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">CEP *</Label>
                  <div className="relative">
                    <Input
                      value={DocumentService.formatCEP(formData.address.zipCode)}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          address: { ...prev.address, zipCode: value }
                        }));
                        
                        // Busca automática quando CEP estiver completo
                        const cleanCep = value.replace(/\D/g, '');
                        if (cleanCep.length === 8) {
                          handleCepSearch(value);
                        }
                      }}
                      className="bg-cinema-dark-lighter border-cinema-gray-light text-white pr-10"
                      placeholder="00000-000"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {isLoadingCep ? (
                        <Loader2 className="w-4 h-4 animate-spin text-cinema-yellow" />
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="p-1 h-6 w-6"
                          onClick={() => handleCepSearch(formData.address.zipCode)}
                          disabled={!formData.address.zipCode}
                        >
                          <Search className="w-3 h-3 text-cinema-yellow" />
                        </Button>
                      )}
                    </div>
                  </div>
                  {errors.zipCode && <p className="text-red-400 text-sm mt-1">{errors.zipCode}</p>}
                  <p className="text-xs text-green-400 mt-1">
                    ✨ Endereço preenchido automaticamente
                  </p>
                </div>

                <div>
                  <Label className="text-white">País</Label>
                  <Input
                    value={formData.address.country}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      address: { ...prev.address, country: e.target.value }
                    }))}
                    className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Documentos */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cinema-yellow" />
                  <h3 className="text-lg font-semibold text-white">Documentos</h3>
                </div>
                <Button onClick={addDocument} size="sm" className="bg-cinema-yellow text-cinema-dark">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Documento
                </Button>
              </div>

              <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-lg mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-red-400" />
                  <h4 className="text-red-400 font-medium">🔒 POLÍTICA DE SEGURANÇA - DOCUMENTOS DIGITAIS OFICIAIS</h4>
                </div>
                <div className="text-red-300 text-sm space-y-2">
                  <p className="font-medium">⚠️ ACEITAMOS APENAS DOCUMENTOS DIGITAIS OFICIAIS:</p>
                  <ul className="space-y-1 ml-4">
                    <li>• 📱 <strong>CNH Digital</strong> (app Carteira Digital de Trânsito)</li>
                    <li>• 🆔 <strong>RG Digital</strong> (app do seu estado)</li>
                    <li>• 🏛️ <strong>Dados gov.br</strong> (PDF gerado no portal gov.br)</li>
                    <li>• 🏢 <strong>CNPJ Digital</strong> (Receita Federal)</li>
                  </ul>
                  <p className="text-xs mt-2 font-medium">
                    📋 Todos os documentos devem conter QR Code para verificação de autenticidade
                  </p>
                </div>
              </div>

              <div className="bg-green-900/20 border border-green-500/50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <h4 className="text-green-400 font-medium">Documentos Obrigatórios</h4>
                </div>
                <ul className="text-green-300 text-sm space-y-1">
                  <li>• {formData.personType === 'fisica' ? '📱 CNH Digital OU 🆔 RG Digital' : '🏢 CNPJ Digital'}</li>
                  <li>• 🏛️ Dados gov.br (PDF com QR Code)</li>
                  <li>• {formData.personType === 'juridica' ? '📄 Contrato Social Digital' : '💰 Comprovante de renda digital'}</li>
                </ul>
              </div>

              {/* Indicador de Preenchimento Automático */}
              {(isLoadingCpfCnpj || isLoadingCep) && (
                <div className="bg-blue-900/20 border border-blue-500/50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                    <div>
                      <h4 className="text-blue-400 font-medium">🔍 Buscando Dados Automaticamente</h4>
                      <p className="text-blue-300 text-sm">
                        {isLoadingCpfCnpj && formData.personType === 'fisica' && '🔥 Consultando APICPF (API Real) → Fallback...'}
                        {isLoadingCpfCnpj && formData.personType === 'juridica' && 'Consultando: BrasilAPI → ReceitaWS...'}
                        {isLoadingCep && 'Buscando endereço no ViaCEP...'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Indicador de Sucesso */}
              {dataLoadedSuccess && (
                <div className="bg-green-900/20 border border-green-500/50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <div>
                      <h4 className="text-green-400 font-medium">🎉 Dados Carregados com Sucesso!</h4>
                      <p className="text-green-300 text-sm">{dataLoadedSuccess}</p>
                    </div>
                  </div>
                </div>
              )}

              {formData.documents.map((doc) => (
                <Card key={doc.id} className="bg-cinema-dark-lighter border-cinema-gray-light">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <Label className="text-white">Tipo de Documento</Label>
                        <select
                          value={doc.type}
                          onChange={(e) => {
                            const updatedDocs = formData.documents.map(d =>
                              d.id === doc.id ? { ...d, type: e.target.value as any } : d
                            );
                            setFormData(prev => ({ ...prev, documents: updatedDocs }));
                          }}
                          className="w-full mt-2 p-2 bg-cinema-dark border border-cinema-gray-light rounded text-white"
                        >
                          <option value="cnh_digital">📱 CNH Digital</option>
                          <option value="rg_digital">🆔 RG Digital</option>
                          <option value="dados_govbr">🏛️ Dados gov.br (PDF)</option>
                          <option value="cnpj_digital">🏢 CNPJ Digital</option>
                          <option value="ie_digital">📋 Inscrição Estadual Digital</option>
                          <option value="contrato_social_digital">📄 Contrato Social Digital</option>
                        </select>
                      </div>

                      <div>
                        <Label className="text-white">Número do Documento</Label>
                        <Input
                          value={doc.number}
                          onChange={(e) => {
                            const updatedDocs = formData.documents.map(d =>
                              d.id === doc.id ? { ...d, number: e.target.value } : d
                            );
                            setFormData(prev => ({ ...prev, documents: updatedDocs }));
                          }}
                          className="bg-cinema-dark border-cinema-gray-light text-white"
                        />
                      </div>

                      <div>
                        <Label className="text-white">Status</Label>
                        <div className="flex items-center gap-2 mt-2">
                          {doc.verified ? (
                            <Badge className="bg-green-600">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verificado
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Pendente
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label className="text-white">Data de Emissão</Label>
                        <Input
                          type="date"
                          value={doc.issueDate || ''}
                          onChange={(e) => {
                            const updatedDocs = formData.documents.map(d =>
                              d.id === doc.id ? { ...d, issueDate: e.target.value } : d
                            );
                            setFormData(prev => ({ ...prev, documents: updatedDocs }));
                          }}
                          className="bg-cinema-dark border-cinema-gray-light text-white"
                        />
                      </div>

                      <div>
                        <Label className="text-white">Data de Vencimento</Label>
                        <Input
                          type="date"
                          value={doc.expiryDate || ''}
                          onChange={(e) => {
                            const updatedDocs = formData.documents.map(d =>
                              d.id === doc.id ? { ...d, expiryDate: e.target.value } : d
                            );
                            setFormData(prev => ({ ...prev, documents: updatedDocs }));
                          }}
                          className="bg-cinema-dark border-cinema-gray-light text-white"
                        />
                      </div>
                    </div>

                    {/* Campos específicos para documentos digitais */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label className="text-white">QR Code (Para Verificação)</Label>
                        <Input
                          value={doc.qrCode || ''}
                          onChange={(e) => {
                            const updatedDocs = formData.documents.map(d =>
                              d.id === doc.id ? { ...d, qrCode: e.target.value } : d
                            );
                            setFormData(prev => ({ ...prev, documents: updatedDocs }));
                          }}
                          className="bg-cinema-dark border-cinema-gray-light text-white"
                          placeholder="Cole o conteúdo do QR Code aqui"
                        />
                      </div>

                      <div>
                        <Label className="text-white">Validação gov.br</Label>
                        <div className="flex items-center gap-2 mt-2">
                          <label className="flex items-center gap-2 text-white">
                            <input
                              type="checkbox"
                              checked={doc.govBrValidation || false}
                              onChange={(e) => {
                                const updatedDocs = formData.documents.map(d =>
                                  d.id === doc.id ? { ...d, govBrValidation: e.target.checked } : d
                                );
                                setFormData(prev => ({ ...prev, documents: updatedDocs }));
                              }}
                              className="rounded"
                            />
                            <span className="text-sm">Validado via gov.br</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="text-cinema-yellow border-cinema-yellow">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload
                        </Button>
                        {doc.filePath && (
                          <Button size="sm" variant="outline" className="text-green-400 border-green-400">
                            <Eye className="w-4 h-4 mr-2" />
                            Visualizar
                          </Button>
                        )}
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const updatedDocs = formData.documents.filter(d => d.id !== doc.id);
                          setFormData(prev => ({ ...prev, documents: updatedDocs }));
                        }}
                        className="text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Step 5: Configurações Finais */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-cinema-yellow" />
                <h3 className="text-lg font-semibold text-white">Configurações Finais</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informações Financeiras */}
                <Card className="bg-cinema-dark-lighter border-cinema-gray-light">
                  <CardHeader>
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Informações Financeiras
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-white">Limite de Crédito (R$)</Label>
                      <Input
                        type="number"
                        value={formData.creditLimit || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, creditLimit: parseFloat(e.target.value) }))}
                        className="bg-cinema-dark border-cinema-gray-light text-white"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <Label className="text-white">Prazo de Pagamento</Label>
                      <select
                        value={formData.paymentTerms || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, paymentTerms: e.target.value }))}
                        className="w-full mt-2 p-2 bg-cinema-dark border border-cinema-gray-light rounded text-white"
                      >
                        <option value="">Selecione...</option>
                        <option value="avista">À Vista</option>
                        <option value="7dias">7 dias</option>
                        <option value="15dias">15 dias</option>
                        <option value="30dias">30 dias</option>
                        <option value="45dias">45 dias</option>
                        <option value="60dias">60 dias</option>
                      </select>
                    </div>

                    <div>
                      <Label className="text-white">Limite Auto-Aprovação (R$)</Label>
                      <Input
                        type="number"
                        value={formData.autoApproveLimit || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, autoApproveLimit: parseFloat(e.target.value) }))}
                        className="bg-cinema-dark border-cinema-gray-light text-white"
                        placeholder="0.00"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Pedidos até este valor são aprovados automaticamente
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Configurações de Sistema */}
                <Card className="bg-cinema-dark-lighter border-cinema-gray-light">
                  <CardHeader>
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Configurações de Sistema
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 text-white">
                        <input
                          type="checkbox"
                          checked={formData.allowOnlineAccess}
                          onChange={(e) => setFormData(prev => ({ ...prev, allowOnlineAccess: e.target.checked }))}
                          className="rounded"
                        />
                        <span>Permitir acesso online</span>
                      </label>

                      <label className="flex items-center gap-3 text-white">
                        <input
                          type="checkbox"
                          checked={formData.requireApproval}
                          onChange={(e) => setFormData(prev => ({ ...prev, requireApproval: e.target.checked }))}
                          className="rounded"
                        />
                        <span>Requer aprovação para pedidos</span>
                      </label>

                      <label className="flex items-center gap-3 text-white">
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                          className="rounded"
                        />
                        <span>Cliente ativo</span>
                      </label>
                    </div>

                    <div>
                      <Label className="text-white">Observações</Label>
                      <textarea
                        value={formData.notes || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        rows={4}
                        className="w-full p-2 bg-cinema-dark border border-cinema-gray-light rounded text-white placeholder:text-gray-400"
                        placeholder="Observações gerais sobre o cliente..."
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Resumo */}
              <Card className="bg-green-900/20 border-green-500/50">
                <CardHeader>
                  <CardTitle className="text-green-400 text-lg">Resumo do Cadastro</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Nome/Razão Social:</p>
                      <p className="text-white font-medium">{formData.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">CPF/CNPJ:</p>
                      <p className="text-white font-medium">{formatCpfCnpj(formData.cpfCnpj)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Tipo:</p>
                      <p className="text-white font-medium capitalize">{formData.type}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Contatos:</p>
                      <p className="text-white font-medium">{formData.contacts.length} contato(s)</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Documentos:</p>
                      <p className="text-white font-medium">{formData.documents.length} documento(s)</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Vencimento:</p>
                      <p className="text-white font-medium">
                        {new Date(formData.registrationExpiryDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t border-cinema-gray-light">
            <Button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              variant="outline"
              className="text-cinema-yellow border-cinema-yellow"
            >
              Anterior
            </Button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i + 1 === currentStep
                      ? 'bg-cinema-yellow'
                      : i + 1 < currentStep
                      ? 'bg-green-500'
                      : 'bg-cinema-gray-light'
                  }`}
                />
              ))}
            </div>

            {currentStep < totalSteps ? (
              <Button onClick={handleNext} className="bg-cinema-yellow text-cinema-dark">
                Próximo
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="bg-green-600 text-white">
                <Save className="w-4 h-4 mr-2" />
                Salvar Cliente
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
