import { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner, Html5QrcodeScannerState } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScanLine, Keyboard, Package, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface ProductScannerProps {
  onProductScanned: (product: any) => void;
  mode?: "checkout" | "checkin" | "general";
}

export function ProductScanner({ 
  onProductScanned, 
  mode = "general" 
}: ProductScannerProps) {
  const [open, setOpen] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<any>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [isEnabled, setIsEnabled] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const scannerInitialized = useRef(false);

  // Verifica se a funcionalidade está habilitada
  useEffect(() => {
    checkIfEnabled();
  }, [mode]);

  const checkIfEnabled = async () => {
    setSettingsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/settings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const settings = await response.json();
        
        // Verifica se a conferência está habilitada para o modo específico
        if (mode === "checkout") {
          setIsEnabled(settings.enableCheckoutScanner || false);
        } else if (mode === "checkin") {
          setIsEnabled(settings.enableCheckinScanner || false);
        } else {
          // Modo geral sempre habilitado
          setIsEnabled(true);
        }
      } else {
        // Se não conseguir carregar, considera habilitado
        setIsEnabled(true);
      }
    } catch (error) {
      console.error("Erro ao verificar configurações:", error);
      // Em caso de erro, considera habilitado
      setIsEnabled(true);
    } finally {
      setSettingsLoading(false);
    }
  };

  const getModeText = () => {
    switch (mode) {
      case "checkout":
        return { title: "Conferir Saída", desc: "Escaneie ou digite o código do produto" };
      case "checkin":
        return { title: "Conferir Devolução", desc: "Escaneie ou digite o código do produto" };
      default:
        return { title: "Escanear Produto", desc: "Escaneie ou digite o código do produto" };
    }
  };

  const searchProduct = async (code: string) => {
    setLoading(true);
    setScannedProduct(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/products/scan/${encodeURIComponent(code)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          toast.error("Produto não encontrado");
          return;
        }
        throw new Error("Erro ao buscar produto");
      }

      const data = await response.json();
      setScannedProduct(data.product);
      onProductScanned(data.product);
      
      toast.success(`Produto encontrado: ${data.product.name}`);
    } catch (error) {
      console.error("Erro ao buscar produto:", error);
      toast.error("Erro ao buscar produto");
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      searchProduct(manualCode.trim());
    }
  };

  const initializeScanner = () => {
    if (scannerInitialized.current || scannerRef.current) return;

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      false
    );

    scanner.render(
      (decodedText) => {
        // Sucesso ao escanear
        searchProduct(decodedText);
        
        // Para o scanner temporariamente
        if (scanner.getState() === Html5QrcodeScannerState.SCANNING) {
          scanner.pause(true);
        }
      },
      (errorMessage) => {
        // Erro ao escanear (normal durante o processo)
        // Não exibir mensagem para não poluir a interface
      }
    );

    scannerRef.current = scanner;
    scannerInitialized.current = true;
  };

  const cleanupScanner = () => {
    if (scannerRef.current) {
      try {
        scannerRef.current.clear();
      } catch (error) {
        console.error("Erro ao limpar scanner:", error);
      }
      scannerRef.current = null;
      scannerInitialized.current = false;
    }
  };

  useEffect(() => {
    if (open) {
      // Aguarda um pouco para o DOM estar pronto
      const timer = setTimeout(() => {
        initializeScanner();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      cleanupScanner();
      setScannedProduct(null);
      setManualCode("");
    }
  }, [open]);

  const modeText = getModeText();

  // Se não está habilitado e não é modo geral, não renderiza
  if (!settingsLoading && !isEnabled && mode !== "general") {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={settingsLoading}>
          <ScanLine className="w-4 h-4 mr-2" />
          {settingsLoading ? "Carregando..." : modeText.title}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{modeText.title}</DialogTitle>
          <DialogDescription>{modeText.desc}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="scan" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="scan">
              <ScanLine className="w-4 h-4 mr-2" />
              Escanear
            </TabsTrigger>
            <TabsTrigger value="manual">
              <Keyboard className="w-4 h-4 mr-2" />
              Manual
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scan" className="space-y-4">
            <div className="border rounded-lg p-4 bg-muted/50">
              <div id="qr-reader" className="w-full"></div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                Aponte a câmera para o QR Code ou código de barras do produto
              </p>
            </div>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Código do Produto</Label>
                <Input
                  id="code"
                  placeholder="Digite o QR Code ou código de barras"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  autoFocus
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading || !manualCode.trim()}>
                {loading ? "Buscando..." : "Buscar Produto"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        {loading && (
          <div className="flex items-center justify-center py-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
            <span className="text-sm text-muted-foreground">Buscando produto...</span>
          </div>
        )}

        {scannedProduct && !loading && (
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Package className="w-5 h-5 mt-1 text-primary" />
                <div>
                  <h4 className="font-semibold">{scannedProduct.name}</h4>
                  {scannedProduct.sku && (
                    <p className="text-sm text-muted-foreground">SKU: {scannedProduct.sku}</p>
                  )}
                  {scannedProduct.category && (
                    <p className="text-sm text-muted-foreground">
                      Categoria: {scannedProduct.category.name}
                    </p>
                  )}
                </div>
              </div>
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Status:</span>
                <span className="ml-2 font-medium">{scannedProduct.status}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Quantidade:</span>
                <span className="ml-2 font-medium">{scannedProduct.quantity}</span>
              </div>
            </div>

            {mode === "checkout" && scannedProduct.status === "RENTED" && (
              <div className="bg-yellow-50 dark:bg-yellow-950 p-3 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 text-yellow-600 dark:text-yellow-400" />
                <p className="text-sm text-yellow-900 dark:text-yellow-100">
                  Este produto já está alugado
                </p>
              </div>
            )}

            {mode === "checkin" && scannedProduct.status !== "RENTED" && (
              <div className="bg-yellow-50 dark:bg-yellow-950 p-3 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 text-yellow-600 dark:text-yellow-400" />
                <p className="text-sm text-yellow-900 dark:text-yellow-100">
                  Este produto não está marcado como alugado
                </p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

