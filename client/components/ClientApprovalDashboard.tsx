/**
 * DASHBOARD DE APROVAÇÃO DE CADASTROS
 * 
 * Interface para funcionários e admins aprovarem/rejeitarem
 * cadastros de clientes pendentes
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { useToast } from '../hooks/use-toast';
import { FileText, CheckCircle, XCircle, Download, AlertTriangle, User, Mail, Phone, MapPin } from 'lucide-react';

interface Document {
  id: string;
  type: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  fileHash: string;
  uploadedAt: string;
  isValid: boolean;
  validationResult: any;
}

interface PendingClient {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpfCnpj: string;
  personType: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  status: string;
  createdAt: string;
  documents: Document[];
}

export default function ClientApprovalDashboard() {
  const [pendingClients, setPendingClients] = useState<PendingClient[]>([]);
  const [selectedClient, setSelectedClient] = useState<PendingClient | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPendingClients();
  }, []);

  const loadPendingClients = async () => {
    try {
      const response = await fetch('/api/clients/pending');
      if (!response.ok) throw new Error('Erro ao carregar cadastros pendentes');
      const data = await response.json();
      setPendingClients(data);
    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os cadastros pendentes',
        variant: 'destructive'
      });
    }
  };

  const handleApprove = async (clientId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/clients/${clientId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao aprovar cadastro');
      }

      toast({
        title: 'Cadastro aprovado!',
        description: 'O cliente foi notificado e já pode realizar locações.',
        variant: 'default'
      });

      setShowApproveDialog(false);
      setSelectedClient(null);
      loadPendingClients();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (clientId: string) => {
    if (!rejectionReason.trim()) {
      toast({
        title: 'Atenção',
        description: 'Informe o motivo da rejeição',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/clients/${clientId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao rejeitar cadastro');
      }

      toast({
        title: 'Cadastro rejeitado',
        description: 'O cliente foi notificado sobre a rejeição.',
        variant: 'default'
      });

      setShowRejectDialog(false);
      setSelectedClient(null);
      setRejectionReason('');
      loadPendingClients();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDocument = async (clientId: string, documentId: string, fileName: string) => {
    try {
      const response = await fetch(`/api/clients/${clientId}/documents/${documentId}/download`);
      if (!response.ok) throw new Error('Erro ao baixar documento');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Download iniciado',
        description: `Baixando ${fileName}`,
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível baixar o documento',
        variant: 'destructive'
      });
    }
  };

  const getDocumentTypeName = (type: string) => {
    const types: Record<string, string> = {
      'CPF': 'CPF',
      'RG': 'RG',
      'CNH': 'CNH',
      'CNPJ': 'CNPJ',
      'PROOF_OF_ADDRESS': 'Comprovante de Endereço',
      'SOCIAL_CONTRACT': 'Contrato Social',
      'OTHER': 'Outro'
    };
    return types[type] || type;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Aprovação de Cadastros</h2>
          <p className="text-muted-foreground">
            {pendingClients.length} cadastro(s) aguardando aprovação
          </p>
        </div>
        <Button onClick={loadPendingClients} variant="outline">
          Atualizar
        </Button>
      </div>

      {pendingClients.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-semibold mb-2">Nenhum cadastro pendente</h3>
            <p className="text-muted-foreground">
              Todos os cadastros foram processados!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {pendingClients.map((client) => (
            <Card key={client.id} className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      {client.name}
                    </CardTitle>
                    <CardDescription className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {client.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {client.phone}
                      </div>
                      {client.address && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {client.address}, {client.city} - {client.state}
                        </div>
                      )}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    Pendente
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Informações do Cliente */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {client.personType === 'FISICA' ? 'CPF' : 'CNPJ'}
                      </p>
                      <p className="text-sm font-semibold">{client.cpfCnpj}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Tipo</p>
                      <p className="text-sm font-semibold">
                        {client.personType === 'FISICA' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-muted-foreground">Cadastrado em</p>
                      <p className="text-sm font-semibold">
                        {new Date(client.createdAt).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  {/* Documentos */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Documentos Enviados ({client.documents.length})
                    </h4>
                    <div className="space-y-2">
                      {client.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <FileText className="w-5 h-5 text-red-500" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{doc.fileName}</p>
                              <p className="text-xs text-muted-foreground">
                                {getDocumentTypeName(doc.type)} • {formatFileSize(doc.fileSize)}
                              </p>
                            </div>
                            {doc.isValid ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Válido
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Inválido
                              </Badge>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDownloadDocument(client.id, doc.id, doc.fileName)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Alertas de Validação */}
                  {client.documents.some((doc) => !doc.isValid) && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-semibold text-red-900">Documentos inválidos detectados</p>
                        <p className="text-red-700">
                          Alguns documentos não passaram na validação. Revise antes de aprovar.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Ações */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      className="flex-1"
                      onClick={() => {
                        setSelectedClient(client);
                        setShowApproveDialog(true);
                      }}
                      disabled={loading}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Aprovar Cadastro
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => {
                        setSelectedClient(client);
                        setShowRejectDialog(true);
                      }}
                      disabled={loading}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Rejeitar Cadastro
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog de Aprovação */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Aprovação</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja aprovar o cadastro de <strong>{selectedClient?.name}</strong>?
              O cliente será notificado e poderá realizar locações.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button
              onClick={() => selectedClient && handleApprove(selectedClient.id)}
              disabled={loading}
            >
              {loading ? 'Aprovando...' : 'Confirmar Aprovação'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Rejeição */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Cadastro</DialogTitle>
            <DialogDescription>
              Informe o motivo da rejeição. O cliente será notificado.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Ex: Documento ilegível, CPF inválido, comprovante de endereço não está no nome do titular..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedClient && handleReject(selectedClient.id)}
              disabled={loading || !rejectionReason.trim()}
            >
              {loading ? 'Rejeitando...' : 'Confirmar Rejeição'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

