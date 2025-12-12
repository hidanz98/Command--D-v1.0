import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  UserCheck,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  Calendar,
  Mail,
  Phone,
  FileText,
  AlertTriangle
} from "lucide-react";

interface PendingClient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  cpfCnpj?: string;
  status: string;
  createdAt: string;
  documents?: any[];
}

const Aprovacoes = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState<PendingClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<PendingClient | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPendingClients();
  }, []);

  const fetchPendingClients = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/clients/pending-approval', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setClients(data.clients || []);
      }
    } catch (error) {
      console.error('Erro ao buscar clientes pendentes:', error);
      toast.error('Erro ao carregar clientes pendentes');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (clientId: string) => {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/clients/${clientId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Cliente aprovado com sucesso!');
        fetchPendingClients();
      } else {
        toast.error('Erro ao aprovar cliente');
      }
    } catch (error) {
      console.error('Erro ao aprovar:', error);
      toast.error('Erro ao aprovar cliente');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedClient || !rejectionReason.trim()) {
      toast.error('Por favor, informe o motivo da rejeição');
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch(`/api/clients/${selectedClient.id}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: rejectionReason })
      });

      if (response.ok) {
        toast.success('Cliente rejeitado');
        setShowRejectDialog(false);
        setRejectionReason("");
        setSelectedClient(null);
        fetchPendingClients();
      } else {
        toast.error('Erro ao rejeitar cliente');
      }
    } catch (error) {
      console.error('Erro ao rejeitar:', error);
      toast.error('Erro ao rejeitar cliente');
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectDialog = (client: PendingClient) => {
    setSelectedClient(client);
    setShowRejectDialog(true);
  };

  const filteredClients = clients.filter(client =>
    client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.cpfCnpj?.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <UserCheck className="h-8 w-8 text-indigo-600" />
              Aprovações de Cadastro
            </h1>
            <p className="text-gray-600 mt-1">Analise e aprove cadastros de novos clientes</p>
          </div>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nome, email ou CPF/CNPJ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Clients List */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Carregando cadastros pendentes...</p>
            </CardContent>
          </Card>
        ) : filteredClients.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600 text-lg font-medium">
                {searchTerm ? "Nenhum cadastro encontrado" : "Nenhum cadastro pendente"}
              </p>
              <p className="text-gray-500 mt-2">
                {searchTerm
                  ? "Tente ajustar os termos de busca"
                  : "Todos os cadastros foram processados"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredClients.map((client) => (
              <Card key={client.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4">
                    {/* Client Info */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-bold text-gray-900">{client.name}</h3>
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            <Clock className="h-3 w-3 mr-1" />
                            Pendente
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          {client.email && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <Mail className="h-4 w-4" />
                              <span>{client.email}</span>
                            </div>
                          )}
                          {client.phone && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <Phone className="h-4 w-4" />
                              <span>{client.phone}</span>
                            </div>
                          )}
                          {client.cpfCnpj && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <FileText className="h-4 w-4" />
                              <span>{client.cpfCnpj}</span>
                            </div>
                          )}
                        </div>
                        <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Cadastrado em {new Date(client.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>

                    {/* Documents Info */}
                    {client.documents && client.documents.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          📄 {client.documents.length} documento(s) enviado(s)
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        onClick={() => handleApprove(client.id)}
                        disabled={actionLoading}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Aprovar
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => openRejectDialog(client)}
                        disabled={actionLoading}
                        className="flex-1"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Rejeitar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Rejeitar Cadastro
            </DialogTitle>
            <DialogDescription>
              Informe o motivo da rejeição do cadastro de <strong>{selectedClient?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Motivo da rejeição..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={actionLoading || !rejectionReason.trim()}
            >
              Confirmar Rejeição
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Aprovacoes;

