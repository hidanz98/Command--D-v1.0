/**
 * FORMULÁRIO DE CADASTRO DE CLIENTE COM DOCUMENTOS
 * 
 * Cadastro completo com upload de documentos obrigatórios
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { useToast } from '../hooks/use-toast';
import {
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  FileCheck
} from 'lucide-react';

interface DocumentUpload {
  type: string;
  file: File | null;
  preview?: string;
}

const DOCUMENT_TYPES_FISICA = [
  { value: 'CPF', label: 'CPF (PDF oficial da Receita Federal)', required: true },
  { value: 'RG', label: 'RG Digital (com QR Code)', required: false },
  { value: 'CNH', label: 'CNH Digital (com QR Code)', required: false },
  { value: 'PROOF_OF_ADDRESS', label: 'Comprovante de Endereço (no seu nome)', required: true }
];

const DOCUMENT_TYPES_JURIDICA = [
  { value: 'CNPJ', label: 'CNPJ (PDF oficial da Receita Federal)', required: true },
  { value: 'SOCIAL_CONTRACT', label: 'Contrato Social', required: true },
  { value: 'PROOF_OF_ADDRESS', label: 'Comprovante de Endereço da Empresa', required: true }
];

export default function ClientRegistrationWithDocuments() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  // Dados do cliente
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpfCnpj: '',
    personType: 'fisica',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });

  // Documentos
  const [documents, setDocuments] = useState<DocumentUpload[]>([]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePersonTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, personType: value }));
    setDocuments([]); // Reset documents when changing person type
  };

  const addDocument = (type: string) => {
    if (documents.some((doc) => doc.type === type)) {
      toast({
        title: 'Atenção',
        description: 'Você já adicionou este tipo de documento',
        variant: 'destructive'
      });
      return;
    }

    setDocuments((prev) => [...prev, { type, file: null }]);
  };

  const removeDocument = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileSelect = (index: number, file: File) => {
    // Validar se é PDF
    if (file.type !== 'application/pdf') {
      toast({
        title: 'Arquivo inválido',
        description: 'Apenas arquivos PDF são permitidos',
        variant: 'destructive'
      });
      return;
    }

    // Validar tamanho (máx 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O arquivo deve ter no máximo 10MB',
        variant: 'destructive'
      });
      return;
    }

    setDocuments((prev) =>
      prev.map((doc, i) => (i === index ? { ...doc, file } : doc))
    );

    toast({
      title: 'Arquivo selecionado',
      description: `${file.name} (${(file.size / 1024).toFixed(0)} KB)`,
      variant: 'default'
    });
  };

  // Função para validar CPF na API Brasil
  const validateCPF = async (cpf: string) => {
    try {
      // Remove formatação
      const cleanCPF = cpf.replace(/\D/g, '');
      
      // Validação básica
      if (cleanCPF.length !== 11) return false;
      
      // TODO: Integrar com API Brasil
      // const response = await fetch(`https://brasilapi.com.br/api/cpf/v1/${cleanCPF}`);
      // const data = await response.json();
      // return data.valido;
      
      // Por enquanto, validação básica de CPF
      return validateCPFAlgorithm(cleanCPF);
    } catch (error) {
      console.error('Erro ao validar CPF:', error);
      return false;
    }
  };

  // Algoritmo de validação de CPF
  const validateCPFAlgorithm = (cpf: string) => {
    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false; // Verifica se todos os dígitos são iguais

    let sum = 0;
    let remainder;

    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;

    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) return false;

    return true;
  };

  // Função para validar CNPJ na API Brasil
  const validateCNPJ = async (cnpj: string) => {
    try {
      const cleanCNPJ = cnpj.replace(/\D/g, '');
      
      if (cleanCNPJ.length !== 14) return false;
      
      // Integração com API Brasil
      try {
        const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCNPJ}`);
        if (response.ok) {
          const data = await response.json();
          return !!data.cnpj;
        }
      } catch {
        // Se API falhar, usa validação local
      }
      
      return validateCNPJAlgorithm(cleanCNPJ);
    } catch (error) {
      console.error('Erro ao validar CNPJ:', error);
      return false;
    }
  };

  // Algoritmo de validação de CNPJ
  const validateCNPJAlgorithm = (cnpj: string) => {
    if (cnpj.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(cnpj)) return false;

    let size = cnpj.length - 2;
    let numbers = cnpj.substring(0, size);
    const digits = cnpj.substring(size);
    let sum = 0;
    let pos = size - 7;

    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) return false;

    size = size + 1;
    numbers = cnpj.substring(0, size);
    sum = 0;
    pos = size - 7;

    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(1))) return false;

    return true;
  };

  // Função para buscar CEP na API Brasil
  const searchCEP = async (cep: string) => {
    try {
      const cleanCEP = cep.replace(/\D/g, '');
      
      if (cleanCEP.length !== 8) return null;
      
      const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${cleanCEP}`);
      
      if (!response.ok) return null;
      
      const data = await response.json();
      
      return {
        street: data.street,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state
      };
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      return null;
    }
  };

  const validateStep1 = async () => {
    if (!formData.name || !formData.email || !formData.cpfCnpj) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive'
      });
      return false;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: 'Email inválido',
        description: 'Digite um email válido',
        variant: 'destructive'
      });
      return false;
    }

    // Validar CPF/CNPJ com API Brasil
    if (formData.personType === 'fisica') {
      const isValid = await validateCPF(formData.cpfCnpj);
      if (!isValid) {
        toast({
          title: 'CPF inválido',
          description: 'Digite um CPF válido',
          variant: 'destructive'
        });
        return false;
      }
    } else {
      const isValid = await validateCNPJ(formData.cpfCnpj);
      if (!isValid) {
        toast({
          title: 'CNPJ inválido',
          description: 'Digite um CNPJ válido',
          variant: 'destructive'
        });
        return false;
      }
    }

    return true;
  };

  const validateStep2 = () => {
    const requiredTypes =
      formData.personType === 'fisica'
        ? DOCUMENT_TYPES_FISICA.filter((t) => t.required)
        : DOCUMENT_TYPES_JURIDICA.filter((t) => t.required);

    // Verificar documentos obrigatórios
    for (const reqType of requiredTypes) {
      const hasDoc = documents.some(
        (doc) => doc.type === reqType.value && doc.file !== null
      );

      if (!hasDoc) {
        toast({
          title: 'Documentos incompletos',
          description: `Você precisa enviar: ${reqType.label}`,
          variant: 'destructive'
        });
        return false;
      }
    }

    // Verificar se pelo menos RG ou CNH foi enviado (para pessoa física)
    if (formData.personType === 'fisica') {
      const hasIdentity = documents.some(
        (doc) => (doc.type === 'RG' || doc.type === 'CNH') && doc.file !== null
      );

      if (!hasIdentity) {
        toast({
          title: 'Documento de identidade obrigatório',
          description: 'Você precisa enviar RG Digital ou CNH Digital',
          variant: 'destructive'
        });
        return false;
      }
    }

    return true;
  };

  const handleNextStep = async () => {
    if (step === 1) {
      const isValid = await validateStep1();
      if (!isValid) return;
    }
    if (step === 2 && !validateStep2()) return;
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    setLoading(true);

    try {
      // Preparar FormData
      const formDataToSend = new FormData();

      // Adicionar dados do cliente
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });

      // Adicionar documentos
      const documentTypes: string[] = [];
      documents.forEach((doc) => {
        if (doc.file) {
          formDataToSend.append('documents', doc.file);
          documentTypes.push(doc.type);
        }
      });

      // Adicionar tipos de documento
      formDataToSend.append('documentTypes', JSON.stringify(documentTypes));

      // Enviar para API
      const response = await fetch('/api/clients/register', {
        method: 'POST',
        body: formDataToSend
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao enviar cadastro');
      }

      const result = await response.json();

      setSubmitted(true);
      toast({
        title: 'Cadastro enviado!',
        description: 'Seus documentos serão analisados em breve.',
        variant: 'default'
      });
    } catch (error: any) {
      console.error('Erro:', error);
      toast({
        title: 'Erro ao enviar cadastro',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getDocumentLabel = (type: string) => {
    const allTypes = [...DOCUMENT_TYPES_FISICA, ...DOCUMENT_TYPES_JURIDICA];
    return allTypes.find((t) => t.value === type)?.label || type;
  };

  const documentTypes =
    formData.personType === 'fisica'
      ? DOCUMENT_TYPES_FISICA
      : DOCUMENT_TYPES_JURIDICA;

  if (submitted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="py-12 text-center">
          <CheckCircle className="w-20 h-20 mx-auto mb-6 text-green-500" />
          <h2 className="text-2xl font-bold mb-4">Cadastro Enviado com Sucesso!</h2>
          <p className="text-muted-foreground mb-6">
            Seus documentos foram enviados e estão aguardando aprovação da nossa equipe.
            Você receberá um email assim que seu cadastro for aprovado.
          </p>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Tempo médio de análise:</strong> 1 a 2 dias úteis
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`flex items-center ${s < 3 ? 'flex-1' : ''}`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step >= s
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {step > s ? <CheckCircle className="w-5 h-5" /> : s}
            </div>
            {s < 3 && (
              <div
                className={`h-1 flex-1 mx-2 ${
                  step > s ? 'bg-primary' : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Dados Pessoais */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Dados Pessoais
            </CardTitle>
            <CardDescription>Informações básicas do cadastro</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="personType">Tipo de Pessoa *</Label>
              <Select value={formData.personType} onValueChange={handlePersonTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fisica">Pessoa Física</SelectItem>
                  <SelectItem value="juridica">Pessoa Jurídica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo / Razão Social *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Digite seu nome completo"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="seu@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpfCnpj">
                {formData.personType === 'fisica' ? 'CPF' : 'CNPJ'} *
              </Label>
              <Input
                id="cpfCnpj"
                value={formData.cpfCnpj}
                onChange={(e) => handleInputChange('cpfCnpj', e.target.value)}
                placeholder={
                  formData.personType === 'fisica'
                    ? '000.000.000-00'
                    : '00.000.000/0000-00'
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Rua, número, complemento"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="SP"
                  maxLength={2}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleNextStep}>
                Próximo: Documentos
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Documentos */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Documentos Obrigatórios
            </CardTitle>
            <CardDescription>
              Envie apenas PDFs oficiais emitidos pelo governo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <FileCheck className="h-4 w-4" />
              <AlertDescription>
                <strong>Importante:</strong> Todos os documentos devem ser em formato PDF e
                emitidos oficialmente. Comprovante de endereço deve estar no nome do titular.
              </AlertDescription>
            </Alert>

            {/* Lista de tipos disponíveis */}
            <div>
              <Label className="mb-3 block">Adicionar Documento:</Label>
              <div className="flex flex-wrap gap-2">
                {documentTypes.map((type) => (
                  <Button
                    key={type.value}
                    variant="outline"
                    size="sm"
                    onClick={() => addDocument(type.value)}
                    disabled={documents.some((d) => d.type === type.value)}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {type.label}
                    {type.required && <span className="text-red-500 ml-1">*</span>}
                  </Button>
                ))}
              </div>
            </div>

            {/* Documentos adicionados */}
            <div className="space-y-3">
              {documents.map((doc, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      <span className="font-medium">{getDocumentLabel(doc.type)}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDocument(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileSelect(index, file);
                      }}
                    />
                    {doc.file && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        {doc.file.name} ({(doc.file.size / 1024).toFixed(0)} KB)
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {documents.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Adicione os documentos obrigatórios acima</p>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(1)}>
                Voltar
              </Button>
              <Button onClick={handleNextStep}>
                Próximo: Revisar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Revisão */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Revisão do Cadastro</CardTitle>
            <CardDescription>Confira seus dados antes de enviar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Dados pessoais */}
            <div>
              <h3 className="font-semibold mb-3">Dados Pessoais</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Nome</p>
                  <p className="font-medium">{formData.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{formData.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">
                    {formData.personType === 'fisica' ? 'CPF' : 'CNPJ'}
                  </p>
                  <p className="font-medium">{formData.cpfCnpj}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Telefone</p>
                  <p className="font-medium">{formData.phone || '-'}</p>
                </div>
              </div>
            </div>

            {/* Documentos */}
            <div>
              <h3 className="font-semibold mb-3">Documentos ({documents.length})</h3>
              <div className="space-y-2">
                {documents.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-medium text-sm">{getDocumentLabel(doc.type)}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.file?.name}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      Pronto
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Ao enviar, seus documentos serão analisados por nossa equipe.
                Você receberá um email com o resultado em até 2 dias úteis.
              </AlertDescription>
            </Alert>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(2)} disabled={loading}>
                Voltar
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Enviar Cadastro
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

