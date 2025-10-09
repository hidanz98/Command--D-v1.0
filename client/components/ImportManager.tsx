import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Upload,
  Download,
  FileText,
  Users,
  Package,
  Calendar,
  Settings,
  CheckCircle,
  AlertTriangle,
  X,
  Database,
  RefreshCw,
  Eye,
  FileSpreadsheet,
} from "lucide-react";

interface ImportedData {
  type: "clients" | "products" | "rentals" | "services";
  total: number;
  imported: number;
  errors: string[];
  status: "pending" | "importing" | "completed" | "error";
}

export function ImportManager() {
  const [showImportModal, setShowImportModal] = useState(false);
  const [importType, setImportType] = useState<
    "clients" | "products" | "rentals" | "services" | null
  >(null);
  const [importProgress, setImportProgress] = useState<ImportedData[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [systemFile, setSystemFile] = useState<File | null>(null);

  // Mock data for external system connection settings
  const [connectionSettings, setConnectionSettings] = useState({
    systemPath: "",
    databaseType: "access",
    backupBeforeImport: true,
    validateData: true,
    skipDuplicates: true,
  });

  const [importHistory] = useState([
    {
      id: "IMP-001",
      date: "2025-01-15",
      type: "Clientes",
      total: 150,
      imported: 148,
      errors: 2,
      status: "completed",
    },
    {
      id: "IMP-002",
      date: "2025-01-14",
      type: "Produtos",
      total: 85,
      imported: 85,
      errors: 0,
      status: "completed",
    },
    {
      id: "IMP-003",
      date: "2025-01-13",
      type: "Locações",
      total: 45,
      imported: 42,
      errors: 3,
      status: "completed",
    },
  ]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSystemFile(file);
    }
  };

  const startImport = async (
    type: "clients" | "products" | "rentals" | "services",
  ) => {
    if (!systemFile && !connectionSettings.systemPath) {
      alert(
        "Por favor, selecione um arquivo ou configure o caminho do sistema",
      );
      return;
    }

    setIsImporting(true);
    setImportType(type);

    // Mock import process
    const mockData: ImportedData = {
      type,
      total: Math.floor(Math.random() * 100) + 50,
      imported: 0,
      errors: [],
      status: "importing",
    };

    setImportProgress([...importProgress, mockData]);

    // Simulate import progress
    const simulateProgress = async () => {
      for (let i = 0; i <= mockData.total; i++) {
        await new Promise((resolve) => setTimeout(resolve, 100));

        setImportProgress((prev) =>
          prev.map((item) =>
            item.type === type && item.status === "importing"
              ? {
                  ...item,
                  imported: i,
                  status: i === mockData.total ? "completed" : "importing",
                }
              : item,
          ),
        );
      }

      setIsImporting(false);
      setShowImportModal(false);
      alert(`Importação de ${getTypeLabel(type)} concluída com sucesso!`);
    };

    simulateProgress();
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "clients":
        return "Clientes";
      case "products":
        return "Produtos";
      case "rentals":
        return "Locações";
      case "services":
        return "Serviços";
      default:
        return type;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "clients":
      case "Clientes":
        return Users;
      case "products":
      case "Produtos":
        return Package;
      case "rentals":
      case "Locações":
        return Calendar;
      case "services":
      case "Serviços":
        return Settings;
      default:
        return FileText;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-400";
      case "importing":
        return "text-blue-400";
      case "error":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const importCards = [
    {
      id: "clients" as const,
      title: "Importar Clientes",
      description: "Importar base de clientes e fornecedores",
      icon: Users,
      color: "bg-blue-500/20 text-blue-400",
    },
    {
      id: "products" as const,
      title: "Importar Produtos",
      description: "Importar catálogo de equipamentos e produtos",
      icon: Package,
      color: "bg-green-500/20 text-green-400",
    },
    {
      id: "rentals" as const,
      title: "Importar Locações",
      description: "Importar histórico de locações e pedidos",
      icon: Calendar,
      color: "bg-yellow-500/20 text-yellow-400",
    },
    {
      id: "services" as const,
      title: "Importar Serviços",
      description: "Importar catálogo de serviços oferecidos",
      icon: Settings,
      color: "bg-purple-500/20 text-purple-400",
    },
  ];

  return (
    <div className="h-full bg-cinema-dark-lighter p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Importação de Dados
            </h2>
            <p className="text-gray-400">
              Importe dados do seu sistema para a locadora
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              className="text-cinema-yellow border-cinema-yellow"
              onClick={() => setShowImportModal(true)}
            >
              <Database className="w-4 h-4 mr-2" />
              Configurar Conexão
            </Button>
            <Button
              variant="outline"
              className="text-cinema-yellow border-cinema-yellow"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar Dados
            </Button>
          </div>
        </div>
      </div>

      {/* Import Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {importCards.map((card) => {
          const Icon = card.icon;
          const currentProgress = importProgress.find(
            (p) => p.type === card.id,
          );

          return (
            <Card
              key={card.id}
              className="bg-cinema-gray border-cinema-gray-light"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`p-3 rounded-lg ${card.color.split(" ")[0]}/20`}
                  >
                    <Icon className={`w-6 h-6 ${card.color.split(" ")[1]}`} />
                  </div>
                  {currentProgress && (
                    <div className="text-right">
                      <div
                        className={`text-sm ${getStatusColor(currentProgress.status)}`}
                      >
                        {currentProgress.status === "importing"
                          ? "Importando..."
                          : currentProgress.status === "completed"
                            ? "Concluído"
                            : "Pendente"}
                      </div>
                      <div className="text-xs text-gray-400">
                        {currentProgress.imported}/{currentProgress.total}
                      </div>
                    </div>
                  )}
                </div>

                <h3 className="text-white font-semibold mb-2">{card.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{card.description}</p>

                {currentProgress && currentProgress.status === "importing" && (
                  <div className="w-full bg-cinema-dark-lighter rounded-full h-2 mb-4">
                    <div
                      className="bg-cinema-yellow h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(currentProgress.imported / currentProgress.total) * 100}%`,
                      }}
                    />
                  </div>
                )}

                <Button
                  size="sm"
                  className="w-full bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
                  onClick={() => startImport(card.id)}
                  disabled={isImporting}
                >
                  {isImporting && importType === card.id ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Importando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Importar
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Import History */}
      <Card className="bg-cinema-gray border-cinema-gray-light mb-6">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Histórico de Importações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-cinema-gray-light">
                <tr>
                  <th className="px-4 py-2 text-left text-cinema-yellow font-medium">
                    ID
                  </th>
                  <th className="px-4 py-2 text-left text-cinema-yellow font-medium">
                    Data
                  </th>
                  <th className="px-4 py-2 text-left text-cinema-yellow font-medium">
                    Tipo
                  </th>
                  <th className="px-4 py-2 text-left text-cinema-yellow font-medium">
                    Total
                  </th>
                  <th className="px-4 py-2 text-left text-cinema-yellow font-medium">
                    Importados
                  </th>
                  <th className="px-4 py-2 text-left text-cinema-yellow font-medium">
                    Erros
                  </th>
                  <th className="px-4 py-2 text-left text-cinema-yellow font-medium">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left text-cinema-yellow font-medium">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {importHistory.map((item) => {
                  const Icon = getTypeIcon(item.type);

                  return (
                    <tr
                      key={item.id}
                      className="border-b border-cinema-gray-light hover:bg-cinema-dark-lighter"
                    >
                      <td className="px-4 py-3 text-white font-medium">
                        {item.id}
                      </td>
                      <td className="px-4 py-3 text-gray-400">{item.date}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center text-white">
                          <Icon className="w-4 h-4 mr-2 text-cinema-yellow" />
                          {item.type}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white">{item.total}</td>
                      <td className="px-4 py-3 text-green-400">
                        {item.imported}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            item.errors > 0 ? "text-red-400" : "text-green-400"
                          }
                        >
                          {item.errors}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1 text-green-400" />
                          <span className="text-green-400 text-sm">
                            Concluído
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-cinema-yellow border-cinema-yellow"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-cinema-yellow border-cinema-yellow"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-cinema-gray border border-cinema-gray-light rounded-lg p-6 w-full max-w-lg mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">
                Configurar Importação
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowImportModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Connection Method */}
              <div>
                <Label className="text-white text-sm font-medium mb-3 block">
                  Método de Conexão
                </Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-cinema-dark-lighter rounded-lg border border-cinema-gray-light">
                    <input
                      type="radio"
                      id="file-upload"
                      name="connection-method"
                      className="text-cinema-yellow"
                      defaultChecked
                    />
                    <label htmlFor="file-upload" className="text-white flex-1">
                      Upload de Arquivo
                      <p className="text-gray-400 text-xs mt-1">
                        Faça upload do arquivo de backup (.mdb, .accdb, .sql)
                      </p>
                    </label>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-cinema-dark-lighter rounded-lg border border-cinema-gray-light">
                    <input
                      type="radio"
                      id="direct-connection"
                      name="connection-method"
                      className="text-cinema-yellow"
                    />
                    <label
                      htmlFor="direct-connection"
                      className="text-white flex-1"
                    >
                      Conexão Direta
                      <p className="text-gray-400 text-xs mt-1">
                        Conectar diretamente ao banco de dados
                      </p>
                    </label>
                  </div>
                </div>
              </div>

              {/* File Upload */}
              <div>
                <Label htmlFor="file-upload-input" className="text-white">
                  Arquivo do Sistema
                </Label>
                <div className="mt-2">
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-cinema-gray-light border-dashed rounded-lg cursor-pointer bg-cinema-dark-lighter hover:bg-cinema-dark">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FileSpreadsheet className="w-8 h-8 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-400">
                          <span className="font-semibold">
                            Clique para upload
                          </span>{" "}
                          ou arraste o arquivo
                        </p>
                        <p className="text-xs text-gray-400">
                          .MDB, .ACCDB, .SQL (MAX. 100MB)
                        </p>
                      </div>
                      <input
                        id="file-upload-input"
                        type="file"
                        className="hidden"
                        accept=".mdb,.accdb,.sql,.xlsx,.csv"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>
                  {systemFile && (
                    <p className="mt-2 text-sm text-cinema-yellow">
                      Arquivo selecionado: {systemFile.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Database Path */}
              <div>
                <Label htmlFor="system-path" className="text-white">
                  Caminho do Sistema (opcional)
                </Label>
                <Input
                  id="system-path"
                  value={connectionSettings.systemPath}
                  onChange={(e) =>
                    setConnectionSettings((prev) => ({
                      ...prev,
                      systemPath: e.target.value,
                    }))
                  }
                  className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                  placeholder="C:\Sistema\Data\database.mdb"
                />
              </div>

              {/* Import Options */}
              <div>
                <Label className="text-white text-sm font-medium mb-3 block">
                  Opções de Importação
                </Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="backup-before"
                      checked={connectionSettings.backupBeforeImport}
                      onChange={(e) =>
                        setConnectionSettings((prev) => ({
                          ...prev,
                          backupBeforeImport: e.target.checked,
                        }))
                      }
                      className="rounded border-cinema-gray-light"
                    />
                    <label
                      htmlFor="backup-before"
                      className="text-white text-sm"
                    >
                      Fazer backup antes da importação
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="validate-data"
                      checked={connectionSettings.validateData}
                      onChange={(e) =>
                        setConnectionSettings((prev) => ({
                          ...prev,
                          validateData: e.target.checked,
                        }))
                      }
                      className="rounded border-cinema-gray-light"
                    />
                    <label
                      htmlFor="validate-data"
                      className="text-white text-sm"
                    >
                      Validar dados antes de importar
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="skip-duplicates"
                      checked={connectionSettings.skipDuplicates}
                      onChange={(e) =>
                        setConnectionSettings((prev) => ({
                          ...prev,
                          skipDuplicates: e.target.checked,
                        }))
                      }
                      className="rounded border-cinema-gray-light"
                    />
                    <label
                      htmlFor="skip-duplicates"
                      className="text-white text-sm"
                    >
                      Pular registros duplicados
                    </label>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <Button
                  className="flex-1 bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
                  onClick={() => {
                    alert("Configurações salvas com sucesso!");
                    setShowImportModal(false);
                  }}
                >
                  Salvar Configurações
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowImportModal(false)}
                  className="flex-1 text-gray-400 border-gray-400 hover:text-white hover:border-white"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
