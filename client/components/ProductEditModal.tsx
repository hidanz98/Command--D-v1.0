import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Upload, Save, X, Star, Package, Globe, Wrench, DollarSign, Settings, QrCode, Barcode, Calendar } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface ProductEditModalProps {
  open: boolean;
  onClose: () => void;
  product: any | null;
  onSave: () => void;
}

export function ProductEditModal({ open, onClose, product, onSave }: ProductEditModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    // ABA 1 - PRODUTO (Interno)
    internalName: "",
    isKit: false,
    kitParentId: "",
    serialNumber: "",
    category: "",
    brand: "",
    model: "",
    warehouse: "",
    internalImage: "",
    quantity: 0,
    quantityEntry: 0,
    quantityExit: 0,
    quantityObservation: "",
    
    // ABA 2 - E-COMMERCE (Público)
    name: "",
    description: "",
    images: [] as string[],
    mainImage: "",
    enableEcommerce: true,
    featured: false,
    
    // ABA 3 - AVANÇADO
    qrCode: "",
    barcode: "",
    codeSize: "medium",
    uniqueCode: "",
    dailyPrice: 0,
    weeklyPrice: 0,
    monthlyPrice: 0,
    
    // ABA 4 - VALORES (Custos)
    costUSD: 0,
    costBRL: 0,
    exchangeRate: 0,
    
    // ABA 5 - MANUTENÇÃO
    inMaintenance: false,
    maintenanceQuantity: 0,
    maintenanceEntry: "",
    maintenanceReturn: "",
    maintenanceObservation: "",
    maintenanceExitBy: "",
    maintenanceStartDate: "",
    maintenanceEndDate: "",
    maintenanceNotes: "",
  });
  
  // Imagens públicas (site)
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [internalImageFile, setInternalImageFile] = useState<File | null>(null);
  const [internalImagePreview, setInternalImagePreview] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(5.50); // Cotação exemplo
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Preencher formulário quando produto mudar
  useEffect(() => {
    if (product) {
      setFormData({
        // ABA 1 - PRODUTO
        internalName: product.internalName || product.name || "",
        isKit: product.isKit || false,
        kitParentId: product.kitParentId || "",
        serialNumber: product.serialNumber || "",
        category: product.category || "",
        brand: product.brand || "",
        model: product.model || "",
        warehouse: product.warehouse || "principal",
        internalImage: product.internalImage || "",
        quantity: product.quantity ?? product.total ?? 0,
        quantityEntry: 0,
        quantityExit: 0,
        quantityObservation: "",
        
        // ABA 2 - E-COMMERCE
        name: product.name || "",
        description: product.description || "",
        images: product.images || [],
        mainImage: product.images?.[0] || "",
        enableEcommerce: product.visibility !== "PRIVATE",
        featured: product.featured || false,
        
        // ABA 3 - AVANÇADO
        qrCode: product.qrCode || "",
        barcode: product.barcode || "",
        codeSize: product.codeSize || "medium",
        uniqueCode: product.uniqueCode || `PROD-${Date.now()}`,
        dailyPrice: product.dailyPrice || 0,
        weeklyPrice: product.weeklyPrice || 0,
        monthlyPrice: product.monthlyPrice || 0,
        
        // ABA 4 - VALORES
        costUSD: product.costUSD || 0,
        costBRL: product.costBRL || 0,
        exchangeRate: product.exchangeRate || 5.50,
        
        // ABA 5 - MANUTENÇÃO
        inMaintenance: product.inMaintenance || false,
        maintenanceQuantity: product.maintenanceQuantity ?? 0,
        maintenanceEntry: "",
        maintenanceReturn: "",
        maintenanceObservation: "",
        maintenanceExitBy: product.maintenanceExitBy || "",
        maintenanceStartDate: product.maintenanceStartDate || "",
        maintenanceEndDate: product.maintenanceEndDate || "",
        maintenanceNotes: product.maintenanceNotes || "",
      });
      
      // Preview das imagens já salvas no produto
      if (product.images && product.images.length > 0) {
        setImagePreviews(product.images);
      } else {
        setImagePreviews([]);
      }
      
      if (product.internalImage) {
        setInternalImagePreview(product.internalImage);
      }
    } else {
      // Reset para novo produto
      setFormData({
        internalName: "",
        isKit: false,
        kitParentId: "",
        serialNumber: "",
        category: "",
        brand: "",
        model: "",
        warehouse: "principal",
        internalImage: "",
        quantity: 0,
        quantityEntry: 0,
        quantityExit: 0,
        quantityObservation: "",
        name: "",
        description: "",
        images: [],
        mainImage: "",
        enableEcommerce: true,
        featured: false,
        qrCode: "",
        barcode: "",
        codeSize: "medium",
        uniqueCode: `PROD-${Date.now()}`,
        dailyPrice: 0,
        weeklyPrice: 0,
        monthlyPrice: 0,
        costUSD: 0,
        costBRL: 0,
        exchangeRate: 5.50,
        inMaintenance: false,
        maintenanceQuantity: 0,
        maintenanceEntry: "",
        maintenanceReturn: "",
        maintenanceObservation: "",
        maintenanceExitBy: "",
        maintenanceStartDate: "",
        maintenanceEndDate: "",
        maintenanceNotes: "",
      });
      setImagePreviews([]);
      setImageFiles([]);
      setInternalImagePreview("");
      setInternalImageFile(null);
    }
  }, [product]);

  useEffect(() => {
    if (!open || !product?.id) {
      setHistory([]);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setHistory([]);
      return;
    }

    setHistoryLoading(true);
    fetch(`/api/products/${product.id}/history`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((json) => {
        if (json?.success && Array.isArray(json.data)) {
          setHistory(json.data);
        } else {
          setHistory([]);
        }
      })
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false));
  }, [open, product?.id]);

  const getNowLocalInput = () => {
    const now = new Date();
    const offsetMs = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offsetMs).toISOString().slice(0, 16);
  };

  useEffect(() => {
    if (!formData.inMaintenance) return;

    const now = getNowLocalInput();
    if (!formData.maintenanceStartDate) {
      setFormData((prev) => ({ ...prev, maintenanceStartDate: now }));
    }
    if (!formData.maintenanceExitBy && user?.name) {
      setFormData((prev) => ({ ...prev, maintenanceExitBy: user.name }));
    }
  }, [formData.inMaintenance, formData.maintenanceStartDate, formData.maintenanceExitBy, user?.name]);

  useEffect(() => {
    if (!formData.inMaintenance) return;

    const now = getNowLocalInput();
    if (Number(formData.maintenanceEntry || 0) > 0 && !formData.maintenanceStartDate) {
      setFormData((prev) => ({ ...prev, maintenanceStartDate: now }));
    }
    if (Number(formData.maintenanceReturn || 0) > 0 && !formData.maintenanceEndDate) {
      setFormData((prev) => ({ ...prev, maintenanceEndDate: now }));
    }
  }, [formData.inMaintenance, formData.maintenanceEntry, formData.maintenanceReturn, formData.maintenanceStartDate, formData.maintenanceEndDate]);

  // Handler para múltiplas imagens (e-commerce)
  const handleMultipleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // Acumular novas imagens junto com as existentes
      setImageFiles((prev) => [...prev, ...files]);

      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  // Remover imagem (tanto existente quanto recém-adicionada)
  const handleRemoveImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));

    setFormData((prev) => {
      const existingCount = prev.images.length;

      if (index < existingCount) {
        // Remover imagem já salva no produto
        const newImages = prev.images.filter((_, i) => i !== index);
        return { ...prev, images: newImages };
      }

      // Remover uma das novas imagens (não salvas ainda)
      const newIndex = index - existingCount;
      setImageFiles((files) => files.filter((_, i) => i !== newIndex));
      return prev;
    });
  };

  // Handler para imagem interna (sistema)
  const handleInternalImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setInternalImageFile(file);
      setInternalImagePreview(URL.createObjectURL(file));
    }
  };

  // Atualizar BRL quando USD mudar
  useEffect(() => {
    if (formData.costUSD > 0) {
      setFormData(prev => ({
        ...prev,
        costBRL: prev.costUSD * exchangeRate
      }));
    }
  }, [formData.costUSD, exchangeRate]);

  const handleSave = async () => {
    if (!formData.internalName && !formData.name) {
      toast.error("Nome do produto é obrigatório!");
      return;
    }

    const entryQty = Math.max(0, Number(formData.quantityEntry || 0));
    const exitQty = Math.max(0, Number(formData.quantityExit || 0));
    const maintenanceEntryQty = Math.max(0, Number(formData.maintenanceEntry || 0));
    const maintenanceReturnQty = Math.max(0, Number(formData.maintenanceReturn || 0));
    const baseQty = Number(formData.quantity || 0);
    const quantityChanged = entryQty !== 0 || exitQty !== 0 || (!product && baseQty !== 0);
    const newQuantity = baseQty + entryQty - exitQty;
    const baseMaintenanceQty = Number(formData.maintenanceQuantity || 0);
    const maintenanceChanged =
      maintenanceEntryQty !== 0 || maintenanceReturnQty !== 0;
    const newMaintenanceQty =
      baseMaintenanceQty + maintenanceEntryQty - maintenanceReturnQty;

    if (newQuantity < 0) {
      toast.error("A saída não pode deixar a quantidade negativa.");
      return;
    }

    if (newMaintenanceQty < 0) {
      toast.error("A saída da manutenção não pode deixar negativo.");
      return;
    }

    if (product && (entryQty !== 0 || exitQty !== 0) && !formData.quantityObservation?.trim()) {
      toast.error("Informe a observação para a entrada/saída.");
      return;
    }

    if (product && maintenanceChanged && !formData.maintenanceObservation?.trim()) {
      toast.error("Informe a observação para a manutenção.");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Sessão inválida. Faça login novamente.");
        return;
      }
      toast.info("Salvando produto...");
      
      // Upload de imagens públicas (site)
      let uploadedImages: string[] = [...formData.images];
      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          const formDataUpload = new FormData();
          formDataUpload.append("image", file);
          
          const uploadResponse = await fetch("/api/upload/product-image", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formDataUpload,
          });
          
          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json();
            if (uploadData?.success && uploadData.url) {
              uploadedImages.push(uploadData.url);
            }
          }
        }
      }

      // Upload de imagem interna
      let internalImageUrl = formData.internalImage;
      if (internalImageFile) {
        const formDataUpload = new FormData();
        formDataUpload.append("image", internalImageFile);
        
        const uploadResponse = await fetch("/api/upload/product-image", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataUpload,
        });
        
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          internalImageUrl = uploadData.url;
        }
      }

      // Preparar dados para salvar
      const productData = {
        // Dados internos
        internalName: formData.internalName,
        isKit: formData.isKit,
        kitParentId: formData.kitParentId,
        serialNumber: formData.serialNumber,
        category: formData.category,
        brand: formData.brand,
        model: formData.model,
        warehouse: formData.warehouse,
        internalImage: internalImageUrl,
        quantity: quantityChanged ? newQuantity : baseQty,
        quantityObservation: quantityChanged ? formData.quantityObservation : undefined,
        
        // Dados públicos
        name: formData.name || formData.internalName,
        description: formData.description,
        images: uploadedImages,
        featured: formData.featured,
        isActive: product?.isActive ?? true,
        visibility: formData.enableEcommerce ? "PUBLIC" : "PRIVATE",
        
        // Preços
        dailyPrice: formData.dailyPrice,
        weeklyPrice: formData.weeklyPrice,
        monthlyPrice: formData.monthlyPrice,
        
        // Códigos
        qrCode: formData.qrCode,
        barcode: formData.barcode,
        uniqueCode: formData.uniqueCode,
        
        // Custos
        costUSD: formData.costUSD,
        costBRL: formData.costBRL,
        exchangeRate: exchangeRate,
        
        // Manutenção
        maintenanceQuantity: maintenanceChanged ? newMaintenanceQty : baseMaintenanceQty,
        maintenanceObservation: maintenanceChanged ? formData.maintenanceObservation : undefined,
        inMaintenance: (maintenanceChanged ? newMaintenanceQty : baseMaintenanceQty) > 0 || formData.inMaintenance,
        maintenanceExitBy: formData.maintenanceExitBy,
        maintenanceStartDate: formData.maintenanceStartDate,
        maintenanceEndDate: formData.maintenanceEndDate,
        maintenanceNotes: formData.maintenanceNotes,
      };

      const url = product 
        ? `/api/products/${product.id}`
        : "/api/products";
      
      const method = product ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        let errorText = "";
        try {
          errorText = await response.text();
        } catch {}

        console.error("Erro da API ao salvar produto:", response.status, errorText);

        if (response.status === 401 || response.status === 403) {
          toast.error("Sua sessão expirou. Faça login novamente para salvar as alterações.");
          // Limpar token inválido
          localStorage.removeItem("token");
          return;
        }

        toast.error(errorText || "Erro ao salvar produto");
        return;
      }

      if (maintenanceChanged) {
        setFormData((prev) => ({
          ...prev,
          maintenanceQuantity: newMaintenanceQty,
          maintenanceEntry: "",
          maintenanceReturn: "",
        }));
      }

      toast.success(product ? "Produto atualizado com sucesso!" : "Produto criado com sucesso!");
      onSave();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar produto");
    } finally {
      setSaving(false);
    }
  };

  const entryQty = Math.max(0, Number(formData.quantityEntry || 0));
  const exitQty = Math.max(0, Number(formData.quantityExit || 0));
  const adjustedQuantity = Math.max(0, Number(formData.quantity || 0) + entryQty - exitQty);
  const maintenanceEntryQty = Math.max(0, Number(formData.maintenanceEntry || 0));
  const maintenanceReturnQty = Math.max(0, Number(formData.maintenanceReturn || 0));
  const adjustedMaintenanceQuantity = Math.max(
    0,
    Number(formData.maintenanceQuantity || 0) + maintenanceEntryQty - maintenanceReturnQty,
  );
  const hasMaintenanceDelta = maintenanceEntryQty !== 0 || maintenanceReturnQty !== 0;
  const displayMaintenanceQuantity = hasMaintenanceDelta
    ? adjustedMaintenanceQuantity
    : Number(formData.maintenanceQuantity || 0);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden bg-cinema-gray border-cinema-gray-light">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">
            {product ? "✏️ Editar Produto" : "➕ Novo Produto"}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="produto" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-cinema-dark-lighter">
            <TabsTrigger value="produto" className="data-[state=active]:bg-cinema-yellow data-[state=active]:text-cinema-dark">
              <Package className="w-4 h-4 mr-2" />
              Produto
            </TabsTrigger>
            <TabsTrigger value="ecommerce" className="data-[state=active]:bg-cinema-yellow data-[state=active]:text-cinema-dark">
              <Globe className="w-4 h-4 mr-2" />
              E-commerce
            </TabsTrigger>
            <TabsTrigger value="avancado" className="data-[state=active]:bg-cinema-yellow data-[state=active]:text-cinema-dark">
              <Settings className="w-4 h-4 mr-2" />
              Avançado
            </TabsTrigger>
            <TabsTrigger value="valores" className="data-[state=active]:bg-cinema-yellow data-[state=active]:text-cinema-dark">
              <DollarSign className="w-4 h-4 mr-2" />
              Valores
            </TabsTrigger>
            <TabsTrigger value="manutencao" className="data-[state=active]:bg-cinema-yellow data-[state=active]:text-cinema-dark">
              <Wrench className="w-4 h-4 mr-2" />
              Manutenção
            </TabsTrigger>
          </TabsList>

          {/* ABA 1 - PRODUTO (Interno) */}
          <TabsContent value="produto" className="max-h-[55vh] overflow-y-auto space-y-4 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Nome Interno *</Label>
                <Input
                  value={formData.internalName}
                  onChange={(e) => setFormData({ ...formData, internalName: e.target.value })}
                  placeholder="Ex: Canon EOS R5 #001"
                  className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                />
                <p className="text-xs text-gray-400">Apenas para controle interno</p>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Número de Série</Label>
                <Input
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  placeholder="Ex: SN123456789"
                  className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Categoria</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger className="bg-cinema-dark-lighter border-cinema-gray-light text-white">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="bg-cinema-dark-lighter border-cinema-gray-light text-white">
                    <SelectItem value="cameras">Câmeras</SelectItem>
                    <SelectItem value="lenses">Lentes</SelectItem>
                    <SelectItem value="lights">Iluminação</SelectItem>
                    <SelectItem value="audio">Áudio</SelectItem>
                    <SelectItem value="accessories">Acessórios</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Marca</Label>
                <Input
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="Ex: Canon, Sony, Nikon"
                  className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Modelo</Label>
                <Input
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="Ex: EOS R5"
                  className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Estoque</Label>
                <Select value={formData.warehouse} onValueChange={(value) => setFormData({ ...formData, warehouse: value })}>
                  <SelectTrigger className="bg-cinema-dark-lighter border-cinema-gray-light text-white">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="bg-cinema-dark-lighter border-cinema-gray-light text-white">
                    <SelectItem value="principal">Principal</SelectItem>
                    <SelectItem value="secundario">Secundário</SelectItem>
                    <SelectItem value="manutencao">Manutenção</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2 grid grid-cols-2 gap-4 p-4 bg-cinema-dark-lighter border border-cinema-gray-light rounded-lg">
                <div className="space-y-2">
                  <Label className="text-white">Quantidade Atual</Label>
                  <Input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                    className="bg-cinema-dark border-cinema-gray-light text-white"
                    readOnly={!!product}
                  />
                  <p className="text-xs text-gray-400">
                    {product ? "Atualizada automaticamente via entrada/saída" : "Defina a quantidade inicial"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Quantidade após ajuste</Label>
                  <Input
                    type="number"
                    value={adjustedQuantity}
                    className="bg-cinema-dark border-cinema-gray-light text-white"
                    readOnly
                  />
                  <p className="text-xs text-gray-400">Pré-visualização do saldo</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Entrada</Label>
                  <Input
                    type="number"
                    min={0}
                    value={formData.quantityEntry}
                    onChange={(e) => setFormData({ ...formData, quantityEntry: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                    className="bg-cinema-dark border-cinema-gray-light text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Saída</Label>
                  <Input
                    type="number"
                    min={0}
                    value={formData.quantityExit}
                    onChange={(e) => setFormData({ ...formData, quantityExit: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                    className="bg-cinema-dark border-cinema-gray-light text-white"
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <Label className="text-white">Observação (entrada/saída)</Label>
                  <Textarea
                    value={formData.quantityObservation}
                    onChange={(e) => setFormData({ ...formData, quantityObservation: e.target.value })}
                    placeholder="Ex: Entrada por compra / Saída para manutenção"
                    rows={2}
                    className="bg-cinema-dark border-cinema-gray-light text-white"
                  />
                  <p className="text-xs text-gray-400">
                    Obrigatório quando houver entrada/saída.
                  </p>
                </div>
              </div>

              <div className="col-span-2 space-y-2">
                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isKit"
                      checked={formData.isKit}
                      onCheckedChange={(checked) => setFormData({ ...formData, isKit: checked as boolean })}
                      className="border-cinema-yellow data-[state=checked]:bg-cinema-yellow data-[state=checked]:text-cinema-dark"
                    />
                    <Label htmlFor="isKit" className="text-white cursor-pointer">
                      É um Kit?
                    </Label>
                  </div>

                  {formData.isKit && (
                    <Input
                      value={formData.kitParentId}
                      onChange={(e) => setFormData({ ...formData, kitParentId: e.target.value })}
                      placeholder="ID do produto pai"
                      className="flex-1 bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    />
                  )}
                </div>
              </div>

              <div className="col-span-2 space-y-2">
                <Label className="text-white">📷 Foto Interna (Sistema)</Label>
                <div className="border-2 border-dashed border-cinema-gray-light rounded-lg p-4">
                  <input
                    id="internalImage"
                    type="file"
                    accept="image/*"
                    onChange={handleInternalImageChange}
                    className="hidden"
                  />
                  
                  {internalImagePreview ? (
                    <div className="flex items-center gap-4">
                      <img src={internalImagePreview} alt="Preview" className="w-32 h-32 object-cover rounded" />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("internalImage")?.click()}
                        className="text-cinema-yellow border-cinema-yellow"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Trocar
                      </Button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => document.getElementById("internalImage")?.click()}
                      className="w-full text-center py-8"
                    >
                      <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-white text-sm">Escolher Imagem</p>
                      <p className="text-gray-400 text-xs">Foto para uso interno</p>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ABA 2 - E-COMMERCE (Público) */}
          <TabsContent value="ecommerce" className="max-h-[55vh] overflow-y-auto space-y-4 p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-cinema-dark-lighter rounded-lg border border-cinema-gray-light">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="enableEcommerce"
                    checked={formData.enableEcommerce}
                    onCheckedChange={(checked) => setFormData({ ...formData, enableEcommerce: checked as boolean })}
                    className="border-cinema-yellow data-[state=checked]:bg-cinema-yellow data-[state=checked]:text-cinema-dark"
                  />
                  <Label htmlFor="enableEcommerce" className="text-white cursor-pointer font-semibold">
                    🌐 Habilitar no E-commerce (http://localhost:8080/equipamentos)
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Nome Público (Site) *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Câmera Canon EOS R5 - Cinema 4K"
                  className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                  disabled={!formData.enableEcommerce}
                />
                <p className="text-xs text-green-400">✓ Este nome aparece no site</p>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Descrição Pública (Site)</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição completa para o cliente..."
                  rows={4}
                  className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                  disabled={!formData.enableEcommerce}
                />
                <p className="text-xs text-green-400">✓ Esta descrição aparece no site</p>
              </div>

              <div className="space-y-2">
                <Label className="text-white">📷 Fotos do Produto (Site)</Label>
                <div className="border-2 border-dashed border-cinema-gray-light rounded-lg p-4">
                  <input
                    id="multipleImages"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleMultipleImagesChange}
                    className="hidden"
                    disabled={!formData.enableEcommerce}
                  />
                  
                  {imagePreviews.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-2">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img src={preview} alt={`Preview ${index}`} className="w-full h-32 object-cover rounded" />
                            {index === 0 && (
                              <div className="absolute top-1 left-1 bg-cinema-yellow text-cinema-dark text-xs px-2 py-1 rounded">
                                Principal
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Remover esta foto"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const input = document.getElementById("multipleImages") as HTMLInputElement | null;
                          if (input) {
                            input.value = "";
                            input.click();
                          }
                        }}
                        className="w-full text-cinema-yellow border-cinema-yellow"
                        disabled={!formData.enableEcommerce}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Adicionar Mais Fotos
                      </Button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById("multipleImages") as HTMLInputElement | null;
                        if (input) {
                          input.value = "";
                          input.click();
                        }
                      }}
                      className="w-full text-center py-8"
                      disabled={!formData.enableEcommerce}
                    >
                      <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-white text-sm">Escolher Fotos</p>
                      <p className="text-gray-400 text-xs">Múltiplas imagens - A 1ª será a principal</p>
                    </button>
                  )}
                </div>
                <p className="text-xs text-green-400">✓ Estas fotos aparecem no site</p>
              </div>

              <div className="space-y-2">
                <Label className="text-white font-semibold">💰 Preço Diário (Site)</Label>
                <Input
                  type="number"
                  value={formData.dailyPrice}
                  onChange={(e) => setFormData({ ...formData, dailyPrice: parseFloat(e.target.value) || 0 })}
                  placeholder="Ex: 350.00"
                  className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                  disabled={!formData.enableEcommerce}
                />
                <p className="text-xs text-green-400">✓ Este preço aparece no site</p>
              </div>

              <div className="flex items-center space-x-2 p-3 bg-cinema-dark-lighter rounded-lg border border-cinema-gray-light">
                <Checkbox
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, featured: checked as boolean })}
                  className="border-cinema-yellow data-[state=checked]:bg-cinema-yellow data-[state=checked]:text-cinema-dark"
                  disabled={!formData.enableEcommerce}
                />
                <Label htmlFor="featured" className="text-white cursor-pointer flex items-center">
                  <Star className="w-4 h-4 mr-2 text-cinema-yellow" />
                  ⭐ Em Destaque na Home (http://localhost:8080/)
                </Label>
              </div>
            </div>
          </TabsContent>

          {/* ABA 3 - AVANÇADO */}
          <TabsContent value="avancado" className="max-h-[55vh] overflow-y-auto space-y-4 p-4">
            <div className="space-y-4">
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">🔍 Códigos de Identificação</h3>
                <p className="text-gray-400 text-sm">Gere QR Codes e Códigos de Barras para identificação e conferência de equipamentos</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-white font-semibold mb-3">Códigos de Identificação</h3>
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-white">Código Único do Produto</Label>
                    <Input
                      value={formData.uniqueCode}
                      onChange={(e) => setFormData({ ...formData, uniqueCode: e.target.value })}
                      placeholder="PROD-1234567890"
                      className="bg-cinema-dark-lighter border-cinema-gray-light text-white font-mono"
                      readOnly
                    />
                    <p className="text-xs text-gray-400">Código único gerado automaticamente</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white flex items-center gap-2">
                        <QrCode className="w-4 h-4" />
                        QR Code
                      </Label>
                      <Input
                        value={formData.qrCode}
                        placeholder="Será gerado automaticamente"
                        className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                        readOnly
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="w-full text-cinema-yellow border-cinema-yellow"
                        onClick={() => {
                          // Gerar QR Code
                          const qr = `QR-${formData.uniqueCode}`;
                          setFormData({ ...formData, qrCode: qr });
                          toast.success("QR Code gerado!");
                        }}
                      >
                        <QrCode className="w-4 h-4 mr-2" />
                        Gerar QR Code
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white flex items-center gap-2">
                        <Barcode className="w-4 h-4" />
                        Código de Barras
                      </Label>
                      <Input
                        value={formData.barcode}
                        placeholder="Será gerado automaticamente"
                        className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                        readOnly
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="w-full text-cinema-yellow border-cinema-yellow"
                        onClick={() => {
                          // Gerar Barcode
                          const bc = `BC-${Date.now()}`;
                          setFormData({ ...formData, barcode: bc });
                          toast.success("Código de barras gerado!");
                        }}
                      >
                        <Barcode className="w-4 h-4 mr-2" />
                        Gerar Código
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Tamanho de Impressão</Label>
                    <Select value={formData.codeSize} onValueChange={(value) => setFormData({ ...formData, codeSize: value })}>
                      <SelectTrigger className="bg-cinema-dark-lighter border-cinema-gray-light text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-cinema-dark-lighter border-cinema-gray-light text-white">
                        <SelectItem value="small">Pequeno (3x2cm) - Para cabos, acessórios</SelectItem>
                        <SelectItem value="medium">Médio (5x4cm) - Para equipamentos padrão</SelectItem>
                        <SelectItem value="large">Grande (8x6cm) - Para cases, maletas</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-400">📏 Escolha o tamanho ideal para o produto</p>
                  </div>

                  <div className="bg-cinema-dark-lighter border border-cinema-gray-light rounded-lg p-3">
                    <p className="text-xs text-gray-400">
                      💡 <strong className="text-white">Uso dos Códigos:</strong> Imprima e cole nos equipamentos para usar o leitor de QR Code/Código de Barras na conferência de checkout e check-in.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-cinema-gray-light pt-4">
                <h3 className="text-white font-semibold mb-2">📜 Histórico de Movimentações</h3>
                <p className="text-gray-400 text-sm mb-3">
                  Registro automático de entradas/saídas e alterações de quantidade.
                </p>

                {historyLoading ? (
                  <div className="text-sm text-gray-400">Carregando histórico...</div>
                ) : history.length === 0 ? (
                  <div className="text-sm text-gray-500">Nenhum registro encontrado.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b border-cinema-gray-light">
                        <tr>
                          <th className="text-left text-cinema-yellow font-medium py-2 pr-4">Data/Hora</th>
                          <th className="text-left text-cinema-yellow font-medium py-2 pr-4">Usuário</th>
                          <th className="text-left text-cinema-yellow font-medium py-2 pr-4">Alteração</th>
                          <th className="text-left text-cinema-yellow font-medium py-2 pr-4">Observação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((item) => (
                          <tr key={item.id} className="border-b border-cinema-gray-light/50">
                            <td className="py-2 pr-4 text-gray-300">
                              {new Date(item.createdAt).toLocaleString("pt-BR")}
                            </td>
                            <td className="py-2 pr-4 text-gray-300">
                              {item.userName || "Usuário"}
                            </td>
                            <td className="py-2 pr-4 text-gray-300">
                              {item.field === "quantity" ? (
                                <span>
                                  {item.oldValue ?? "-"} → {item.newValue ?? "-"}
                                </span>
                              ) : (
                                <span>{item.action}</span>
                              )}
                            </td>
                            <td className="py-2 pr-4 text-gray-400">
                              {item.observation || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ABA 4 - VALORES (Custos) */}
          <TabsContent value="valores" className="max-h-[55vh] overflow-y-auto space-y-4 p-4">
            <div className="space-y-4">
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">💰 Controle de Custos (Interno)</h3>
                <p className="text-gray-400 text-sm">Acompanhe custos, preços alternativos e variação cambial</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-white font-semibold">📊 Preços Alternativos (Referência Interna)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Preço Semanal (R$)</Label>
                    <Input
                      type="number"
                      value={formData.weeklyPrice}
                      onChange={(e) => setFormData({ ...formData, weeklyPrice: parseFloat(e.target.value) || 0 })}
                      placeholder="2000.00"
                      className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    />
                    <p className="text-xs text-gray-400">Para ter noção - não aparece no site</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Preço Mensal (R$)</Label>
                    <Input
                      type="number"
                      value={formData.monthlyPrice}
                      onChange={(e) => setFormData({ ...formData, monthlyPrice: parseFloat(e.target.value) || 0 })}
                      placeholder="7000.00"
                      className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    />
                    <p className="text-xs text-gray-400">Para ter noção - não aparece no site</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-cinema-gray-light pt-4">
                <h3 className="text-white font-semibold mb-3">💵 Custo do Equipamento</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Custo em Dólar (USD)</Label>
                  <Input
                    type="number"
                    value={formData.costUSD}
                    onChange={(e) => setFormData({ ...formData, costUSD: parseFloat(e.target.value) || 0 })}
                    placeholder="5000.00"
                    className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                  />
                  <p className="text-xs text-gray-400">Valor pago pelo equipamento</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Cotação do Dólar Turismo</Label>
                  <Input
                    type="number"
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 5.50)}
                    placeholder="5.50"
                    className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                  />
                  <p className="text-xs text-gray-400">R$ {exchangeRate.toFixed(2)} por dólar</p>
                </div>
              </div>

              <div className="bg-cinema-dark-lighter border border-cinema-gray-light rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold">Custo em Reais (BRL)</span>
                  <span className="text-cinema-yellow text-2xl font-bold">
                    R$ {formData.costBRL.toFixed(2)}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">Calculado automaticamente: USD {formData.costUSD.toFixed(2)} × R$ {exchangeRate.toFixed(2)}</p>
              </div>

              {formData.dailyPrice > 0 && formData.costBRL > 0 && (
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">📊 Análise de Retorno</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Diárias necessárias para cobrir custo:</span>
                      <span className="text-white font-semibold">
                        {Math.ceil(formData.costBRL / formData.dailyPrice)} diárias
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Margem por diária:</span>
                      <span className="text-green-400 font-semibold">
                        {((formData.dailyPrice / formData.costBRL) * 100).toFixed(1)}% do custo
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-cinema-dark-lighter border border-cinema-gray-light rounded-lg p-3">
                <p className="text-xs text-gray-400">
                  💡 <strong className="text-white">Informações Internas:</strong> Estes valores não aparecem no site, são apenas para controle financeiro da locadora.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* ABA 5 - MANUTENÇÃO */}
          <TabsContent value="manutencao" className="max-h-[55vh] overflow-y-auto space-y-4 p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent rounded-2xl border border-orange-500/20">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="inMaintenance"
                    checked={formData.inMaintenance}
                    onCheckedChange={(checked) => setFormData({ ...formData, inMaintenance: checked as boolean })}
                    className="border-cinema-yellow data-[state=checked]:bg-cinema-yellow data-[state=checked]:text-cinema-dark"
                  />
                  <Label htmlFor="inMaintenance" className="text-white cursor-pointer font-semibold">
                    🔧 Produto em Manutenção
                  </Label>
                </div>
                {formData.inMaintenance && (
                  <span className="px-3 py-1 bg-orange-500/20 text-orange-200 rounded-full text-xs font-semibold tracking-wide">
                    Em Manutenção
                  </span>
                )}
              </div>

              {formData.inMaintenance && (
                <>
                  <div className="bg-cinema-dark/40 border border-orange-500/15 rounded-2xl p-5">
                    <h3 className="text-white font-semibold mb-4">Controle de Manutenção (Quantidade)</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white">Enviar para manutenção (quantidade)</Label>
                        <Input
                          type="number"
                          min={0}
                          value={formData.maintenanceEntry}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              maintenanceEntry: e.target.value,
                            })
                          }
                          className="bg-cinema-dark/70 border-cinema-gray-light/60 text-white"
                          placeholder="Ex: 2"
                        />
                        <p className="text-xs text-gray-400">
                          Digite quantas unidades vão para manutenção.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white">Retornar da manutenção (quantidade)</Label>
                        <Input
                          type="number"
                          min={0}
                          value={formData.maintenanceReturn}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              maintenanceReturn: e.target.value,
                            })
                          }
                          className="bg-cinema-dark/70 border-cinema-gray-light/60 text-white"
                          placeholder="Ex: 1"
                        />
                        <p className="text-xs text-gray-400">
                          Digite quantas unidades voltaram do conserto.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white">Quantidade em manutenção</Label>
                        <Input
                          type="number"
                          value={displayMaintenanceQuantity}
                          className="bg-cinema-dark/70 border-cinema-gray-light/60 text-white"
                          readOnly
                        />
                        <p className="text-xs text-gray-400">
                          {hasMaintenanceDelta
                            ? "Prévia do total após salvar"
                            : "Atualizada automaticamente por entrada/retorno"}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white">Quantidade após ajuste</Label>
                        <Input
                          type="number"
                          value={adjustedMaintenanceQuantity}
                          className="bg-cinema-dark/70 border-cinema-gray-light/60 text-white"
                          readOnly
                        />
                        <p className="text-xs text-gray-400">Pré-visualização do saldo em manutenção</p>
                      </div>
                    </div>

                    <div className="space-y-2 mt-4">
                      <Label className="text-white">Observação (manutenção)</Label>
                      <Textarea
                        value={formData.maintenanceObservation}
                        onChange={(e) =>
                          setFormData({ ...formData, maintenanceObservation: e.target.value })
                        }
                        placeholder="Ex: Enviado 2 unidades para conserto / Retorno de 1 unidade"
                        rows={2}
                        className="bg-cinema-dark/70 border-cinema-gray-light/60 text-white"
                      />
                      <p className="text-xs text-gray-400">
                        Obrigatório quando houver entrada/retorno de manutenção.
                      </p>
                    </div>
                  </div>
                  <div className="bg-orange-900/20 border border-orange-500/30 rounded-2xl p-4">
                    <p className="text-orange-300 text-sm">
                      ⚠️ Quando marcado como "Em Manutenção", o produto:
                    </p>
                    <ul className="list-disc list-inside text-gray-400 text-sm mt-2 space-y-1">
                      <li>Será removido automaticamente do site</li>
                      <li>Aparecerá como "Indisponível" para novos pedidos</li>
                      <li>Ficará visível apenas no painel administrativo</li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Data de Entrada
                      </Label>
                      <Input
                        type="datetime-local"
                        value={formData.maintenanceStartDate}
                        onChange={(e) => setFormData({ ...formData, maintenanceStartDate: e.target.value })}
                        className="bg-cinema-dark/70 border-cinema-gray-light/60 text-white"
                        readOnly
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Data de Saída (Retorno)
                      </Label>
                      <Input
                        type="datetime-local"
                        value={formData.maintenanceEndDate}
                        onChange={(e) => setFormData({ ...formData, maintenanceEndDate: e.target.value })}
                        className="bg-cinema-dark/70 border-cinema-gray-light/60 text-white"
                      />
                      <p className="text-xs text-gray-400">Deixe vazio se ainda não retornou</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Pessoa responsável pela saída</Label>
                    <Input
                      value={formData.maintenanceExitBy}
                      onChange={(e) => setFormData({ ...formData, maintenanceExitBy: e.target.value })}
                      placeholder="Ex: João da Silva"
                      className="bg-cinema-dark/70 border-cinema-gray-light/60 text-white"
                      readOnly
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Observações da Manutenção</Label>
                    <Textarea
                      value={formData.maintenanceNotes}
                      onChange={(e) => setFormData({ ...formData, maintenanceNotes: e.target.value })}
                      placeholder="Descreva o problema, peças trocadas, etc..."
                      rows={4}
                      className="bg-cinema-dark/70 border-cinema-gray-light/60 text-white"
                    />
                  </div>
                </>
              )}

              {!formData.inMaintenance && (
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 text-center py-12">
                  <Wrench className="w-16 h-16 mx-auto text-green-400 mb-4" />
                  <p className="text-green-300 font-semibold mb-2">Produto Disponível</p>
                  <p className="text-gray-400 text-sm">
                    Este produto está ativo e disponível para locação
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="border-t border-cinema-gray-light pt-4 mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={saving}
            className="border-gray-400 text-gray-400"
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark font-semibold"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Salvando..." : "💾 Salvar Produto"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

