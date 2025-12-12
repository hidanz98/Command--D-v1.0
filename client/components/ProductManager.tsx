import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Plus, Edit, Trash2, Image, Package, DollarSign, Tag, Save, X,
  Upload, Eye, Copy, Star, Calendar, Zap, Grid3X3, List, Search,
  Filter, SortAsc, SortDesc, MoreVertical, ShoppingCart, Heart
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  subcategory?: string;
  brand?: string;
  serialNumber?: string;
  ecommerceEnabled: boolean;
  visibility: 'PUBLIC' | 'PRIVATE' | 'ECOMMERCE';
  isKit: boolean;
  kitItems?: string[];
  tags: string[];
  availability: 'available' | 'rented' | 'maintenance';
  featured: boolean;
  dailyRate: number;
  weeklyRate?: number;
  monthlyRate?: number;
  specifications: Record<string, string>;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Sony FX6 Full Frame',
    description: 'Câmera cinematográfica profissional de cinema full frame com gravação 4K interna',
    price: 350,
    image: '/placeholder.svg',
    category: 'Câmeras',
    subcategory: 'Câmeras de Cinema',
    brand: 'Sony',
    serialNumber: 'SN001234',
    ecommerceEnabled: true,
    visibility: 'PUBLIC',
    isKit: false,
    kitItems: [],
    tags: ['cinema', 'full-frame', '4k', 'profissional'],
    availability: 'available',
    featured: true,
    dailyRate: 350,
    weeklyRate: 2000,
    monthlyRate: 7000,
    specifications: {
      'Resolução': '4K UHD',
      'Sensor': 'Full Frame',
      'Gravação': 'ProRes 422 HQ',
      'ISO': '800-12800'
    },
    images: ['/placeholder.svg'],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'Canon EOS R5C',
    description: 'Câmera híbrida de alta qualidade para cinema e fotografia',
    price: 280,
    image: '/placeholder.svg',
    category: 'Câmeras',
    subcategory: 'Câmeras Híbridas',
    brand: 'Canon',
    serialNumber: 'CN005678',
    ecommerceEnabled: true,
    visibility: 'PUBLIC',
    isKit: false,
    kitItems: [],
    tags: ['híbrida', 'canon', '8k', 'fotografia'],
    availability: 'available',
    featured: true,
    dailyRate: 280,
    weeklyRate: 1600,
    monthlyRate: 5600,
    specifications: {
      'Resolução': '8K RAW',
      'Sensor': 'Full Frame CMOS',
      'Estabilização': 'IBIS',
      'Autofoco': 'Dual Pixel CMOS AF II'
    },
    images: ['/placeholder.svg'],
    createdAt: '2024-01-05',
    updatedAt: '2024-01-10'
  },
  {
    id: '3',
    name: 'Zeiss CP.3 85mm T2.1',
    description: 'Lente cinematográfica profissional com abertura T2.1',
    price: 120,
    image: '/placeholder.svg',
    category: 'Lentes',
    subcategory: 'Lentes Prime',
    brand: 'Zeiss',
    serialNumber: 'ZS009876',
    ecommerceEnabled: false,
    visibility: 'PRIVATE',
    isKit: false,
    kitItems: [],
    tags: ['zeiss', 'cinema', 'prime', '85mm'],
    availability: 'rented',
    featured: false,
    dailyRate: 120,
    weeklyRate: 700,
    monthlyRate: 2500,
    specifications: {
      'Distância Focal': '85mm',
      'Abertura': 'T2.1-T22',
      'Mount': 'PL/EF/E',
      'Peso': '2.1kg'
    },
    images: ['/placeholder.svg'],
    createdAt: '2024-01-03',
    updatedAt: '2024-01-12'
  }
];

const CATEGORIES = ['Todas', 'Câmeras', 'Lentes', 'Áudio', 'Iluminação', 'Estabilizadores', 'Monitores', 'Acessórios'];

export const ProductManager: React.FC<{
  onProductSelect?: (product: Product) => void;
  onClose?: () => void;
  mode?: 'manage' | 'select';
}> = ({ onProductSelect, onClose, mode = 'manage' }) => {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/public/products');
        const json = await res.json();
        if (json?.success) {
          const mapped: Product[] = json.data.map((p: any, idx: number) => ({
            id: p.id ?? String(idx + 1),
            name: p.name,
            description: p.description ?? '',
            price: p.dailyPrice ?? 0,
            image: (p.images?.[0]) ?? '/placeholder.svg',
            category: p.category ?? 'REFLETORES',
            ecommerceEnabled: true,
            isKit: false,
            kitItems: [],
            tags: p.tags ?? [],
            availability: (p.available ?? true) ? 'available' : 'maintenance',
            featured: (p.tags ?? []).includes('featured'),
            dailyRate: p.dailyPrice ?? 0,
            weeklyRate: undefined,
            monthlyRate: undefined,
            specifications: {},
            images: p.images && p.images.length ? p.images : ['/placeholder.svg'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));
          if (mapped.length) setProducts(mapped);
        }
      } catch {}
    })();
  }, []);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'category' | 'created'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    category: 'Câmeras',
    subcategory: '',
    brand: '',
    serialNumber: '',
    ecommerceEnabled: true,
    visibility: 'PUBLIC',
    isKit: false,
    kitItems: [],
    tags: [],
    availability: 'available',
    featured: false,
    dailyRate: 0,
    specifications: {},
    images: ['/placeholder.svg']
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'Todas' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleImageUpload = async (file: File): Promise<string | null> => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/upload/product-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();
      if (result.success && result.url) {
        return result.url;
      }

      console.error('Upload failed:', result.error || 'Unknown upload error');
      return null;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) return;

    try {
      const token = localStorage.getItem('token');
      
      const productData = {
        name: newProduct.name,
        description: newProduct.description || '',
        dailyPrice: newProduct.price,
        weeklyPrice: newProduct.weeklyRate,
        monthlyPrice: newProduct.monthlyRate,
        category: newProduct.category || 'Câmeras',
        brand: newProduct.brand || '',
        sku: newProduct.serialNumber || '',
        images: newProduct.images || ['/placeholder.svg'],
        tags: newProduct.featured ? [...(newProduct.tags || []), 'featured'] : (newProduct.tags || []),
        status: newProduct.availability?.toUpperCase() || 'AVAILABLE',
        featured: newProduct.featured || false,
        visibility: newProduct.visibility || 'PUBLIC',
        quantity: 1,
        isActive: true
      };

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });

      const result = await response.json();
      
      if (result.success) {
        // Recarregar produtos
        const res = await fetch('/api/public/products');
        const json = await res.json();
        if (json?.success) {
          const mapped: Product[] = json.data.map((p: any, idx: number) => ({
            id: p.id ?? String(idx + 1),
            name: p.name,
            description: p.description ?? '',
            price: p.dailyPrice ?? 0,
            image: (p.images?.[0]) ?? '/placeholder.svg',
            category: p.category ?? 'REFLETORES',
            ecommerceEnabled: true,
            visibility: p.visibility ?? 'PUBLIC',
            isKit: false,
            kitItems: [],
            tags: p.tags ?? [],
            availability: (p.available ?? true) ? 'available' : 'maintenance',
            featured: p.featured ?? false,
            dailyRate: p.dailyPrice ?? 0,
            specifications: {},
            images: p.images && p.images.length ? p.images : ['/placeholder.svg'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));
          if (mapped.length) setProducts(mapped);
        }
        
        setNewProduct({
          name: '',
          description: '',
          price: 0,
          category: 'Câmeras',
          subcategory: '',
          brand: '',
          serialNumber: '',
          ecommerceEnabled: true,
          visibility: 'PUBLIC',
          isKit: false,
          kitItems: [],
          tags: [],
          availability: 'available',
          featured: false,
          dailyRate: 0,
          specifications: {},
          images: ['/placeholder.svg']
        });
        setShowAddModal(false);
      } else {
        console.error('Erro ao criar produto:', result.error);
        alert('Erro ao criar produto: ' + result.error);
      }
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      alert('Erro ao criar produto');
    }
  };

  const handleEditProduct = async (updatedProduct: Product) => {
    try {
      const token = localStorage.getItem('token');
      
      const productData = {
        name: updatedProduct.name,
        description: updatedProduct.description || '',
        dailyPrice: updatedProduct.price,
        weeklyPrice: updatedProduct.weeklyRate,
        monthlyPrice: updatedProduct.monthlyRate,
        category: updatedProduct.category || 'Câmeras',
        brand: updatedProduct.brand || '',
        sku: updatedProduct.serialNumber || '',
        images: updatedProduct.images || ['/placeholder.svg'],
        tags: updatedProduct.featured ? [...(updatedProduct.tags || []), 'featured'] : (updatedProduct.tags || []),
        status: updatedProduct.availability?.toUpperCase() || 'AVAILABLE',
        featured: updatedProduct.featured || false,
        visibility: updatedProduct.visibility || 'PUBLIC',
        isActive: true
      };

      const response = await fetch(`/api/products/${updatedProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });

      const result = await response.json();
      
      if (result.success) {
        // Recarregar produtos
        const res = await fetch('/api/public/products');
        const json = await res.json();
        if (json?.success) {
          const mapped: Product[] = json.data.map((p: any, idx: number) => ({
            id: p.id ?? String(idx + 1),
            name: p.name,
            description: p.description ?? '',
            price: p.dailyPrice ?? 0,
            image: (p.images?.[0]) ?? '/placeholder.svg',
            category: p.category ?? 'REFLETORES',
            ecommerceEnabled: true,
            visibility: p.visibility ?? 'PUBLIC',
            isKit: false,
            kitItems: [],
            tags: p.tags ?? [],
            availability: (p.available ?? true) ? 'available' : 'maintenance',
            featured: p.featured ?? false,
            dailyRate: p.dailyPrice ?? 0,
            specifications: {},
            images: p.images && p.images.length ? p.images : ['/placeholder.svg'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));
          if (mapped.length) setProducts(mapped);
        }
        
        setEditingProduct(null);
      } else {
        console.error('Erro ao atualizar produto:', result.error);
        alert('Erro ao atualizar produto: ' + result.error);
      }
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      alert('Erro ao atualizar produto');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Tem certeza que deseja deletar este produto?')) return;
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        // Recarregar produtos
        const res = await fetch('/api/public/products');
        const json = await res.json();
        if (json?.success) {
          const mapped: Product[] = json.data.map((p: any, idx: number) => ({
            id: p.id ?? String(idx + 1),
            name: p.name,
            description: p.description ?? '',
            price: p.dailyPrice ?? 0,
            image: (p.images?.[0]) ?? '/placeholder.svg',
            category: p.category ?? 'REFLETORES',
            ecommerceEnabled: true,
            visibility: p.visibility ?? 'PUBLIC',
            isKit: false,
            kitItems: [],
            tags: p.tags ?? [],
            availability: (p.available ?? true) ? 'available' : 'maintenance',
            featured: p.featured ?? false,
            dailyRate: p.dailyPrice ?? 0,
            specifications: {},
            images: p.images && p.images.length ? p.images : ['/placeholder.svg'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));
          if (mapped.length) setProducts(mapped);
        }
      } else {
        console.error('Erro ao deletar produto:', result.error);
        alert('Erro ao deletar produto: ' + result.error);
      }
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      alert('Erro ao deletar produto');
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-500';
      case 'rented': return 'bg-red-500';
      case 'maintenance': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getAvailabilityText = (availability: string) => {
    switch (availability) {
      case 'available': return 'Disponível';
      case 'rented': return 'Alugado';
      case 'maintenance': return 'Manutenção';
      default: return 'Desconhecido';
    }
  };

  return (
    <div className="h-full bg-cinema-dark-lighter">
      {/* Header */}
      <div className="p-4">
        <div className="mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-semibold text-white mb-2">
                {mode === 'select' ? 'Adicionar Produto' : 'Gerenciar Produtos'}
              </h2>
              <p className="text-gray-400 text-sm">
                {mode === 'select' ? 'Selecione um produto para adicionar à página' : 'Gerencie o catálogo de produtos'}
              </p>
            </div>
            {mode === 'manage' && (
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Produto
              </Button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-cinema-dark border-cinema-gray-light text-white rounded-lg"
            />
          </div>
        </div>

        {/* Quick Filters */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={selectedCategory === 'Todas' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('Todas')}
              className={selectedCategory === 'Todas'
                ? 'bg-cinema-yellow text-cinema-dark'
                : 'text-gray-300 border-cinema-gray-light hover:border-cinema-yellow hover:text-cinema-yellow'
              }
            >
              Todos
            </Button>
            {CATEGORIES.filter(cat => cat !== 'Todas').slice(0, 3).map(category => (
              <Button
                key={category}
                size="sm"
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category
                  ? 'bg-cinema-yellow text-cinema-dark'
                  : 'text-gray-300 border-cinema-gray-light hover:border-cinema-yellow hover:text-cinema-yellow'
                }
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* View Options */}
        <div className="flex items-center justify-between">
          <div className="text-gray-400 text-sm">
            {filteredProducts.length} produtos encontrados
          </div>
          <div className="flex space-x-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-cinema-yellow text-cinema-dark' : 'text-gray-400 border-gray-400'}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-cinema-yellow text-cinema-dark' : 'text-gray-400 border-gray-400'}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Products Display */}
      <div className="px-4 pb-4 overflow-y-auto border-t border-cinema-gray-light/50" style={{ height: 'calc(100% - 200px)' }}>
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 gap-3 pt-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group bg-cinema-dark rounded-lg p-4 border border-cinema-gray-light hover:border-cinema-yellow/50 transition-all cursor-pointer"
                onClick={() => mode === 'select' && onProductSelect && onProductSelect(product)}
              >
                <div className="flex items-center space-x-4">
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <div className={`absolute -top-1 -right-1 w-4 h-4 ${getAvailabilityColor(product.availability)} rounded-full border-2 border-cinema-dark`}></div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-white font-medium text-sm truncate">{product.name}</h3>
                        <p className="text-gray-400 text-xs mt-1 line-clamp-1">{product.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-cinema-yellow font-bold text-sm">R$ {product.price}/dia</span>
                          <span className="text-gray-500 text-xs">{product.category}</span>
                        </div>
                      </div>

                      {mode === 'select' ? (
                        <Button
                          size="sm"
                          className="bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark ml-3"
                          onClick={(e) => {
                            e.stopPropagation();
                            onProductSelect && onProductSelect(product);
                          }}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      ) : (
                        <div className="flex space-x-1 ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingProduct(product);
                            }}
                            className="text-cinema-yellow border-cinema-yellow"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProduct(product.id);
                            }}
                            className="text-red-400 border-red-400"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="bg-cinema-gray border-cinema-gray-light">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-white font-semibold">{product.name}</h3>
                        {product.featured && (
                          <Star className="w-4 h-4 text-cinema-yellow fill-current" />
                        )}
                        <div className={`${getAvailabilityColor(product.availability)} text-white px-2 py-1 rounded text-xs`}>
                          {getAvailabilityText(product.availability)}
                        </div>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-cinema-yellow font-bold">R$ {product.price}/dia</span>
                        <span className="text-gray-400 text-sm">{product.category}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {mode === 'select' && onProductSelect ? (
                        <Button
                          onClick={() => onProductSelect(product)}
                          className="bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
                        >
                          Selecionar
                        </Button>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingProduct(product)}
                            className="text-cinema-yellow border-cinema-yellow"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-400 border-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-400 mb-2">Nenhum produto encontrado</h3>
            <p className="text-gray-500">Tente ajustar os filtros ou adicionar novos produtos</p>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-cinema-gray border border-cinema-gray-light rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Adicionar Produto</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Nome do Produto</Label>
                  <Input
                    value={newProduct.name || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    required
                  />
                </div>
                <div>
                  <Label className="text-white">Categoria</Label>
                  <select
                    value={newProduct.category || 'Câmeras'}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full bg-cinema-dark-lighter border border-cinema-gray-light text-white rounded-md px-3 py-2"
                  >
                    {CATEGORIES.filter(c => c !== 'Todas').map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Sub Categoria</Label>
                  <Input
                    value={newProduct.subcategory || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, subcategory: e.target.value })}
                    className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    placeholder="Ex: Câmeras de Cinema, Lentes Prime..."
                  />
                </div>
                <div>
                  <Label className="text-white">Marca</Label>
                  <Input
                    value={newProduct.brand || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                    className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    placeholder="Ex: Sony, Canon, Zeiss..."
                  />
                </div>
              </div>

              <div>
                <Label className="text-white mb-2 block">Imagem do Produto</Label>
                <div className="flex items-center space-x-4">
                  {newProduct.images && newProduct.images[0] && newProduct.images[0] !== '/placeholder.svg' && (
                    <img 
                      src={newProduct.images[0]} 
                      alt="Preview" 
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const imageUrl = await handleImageUpload(file);
                          if (imageUrl) {
                            setNewProduct({ ...newProduct, images: [imageUrl] });
                          }
                        }
                      }}
                      className="hidden"
                      id="product-image-upload"
                      disabled={uploadingImage}
                    />
                    <label
                      htmlFor="product-image-upload"
                      className="inline-flex items-center px-4 py-2 bg-cinema-dark-lighter border border-cinema-gray-light text-white rounded-md cursor-pointer hover:bg-cinema-gray transition-colors"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadingImage ? 'Enviando...' : 'Escolher Imagem'}
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Número de Série</Label>
                  <Input
                    value={newProduct.serialNumber || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, serialNumber: e.target.value })}
                    className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    placeholder="Ex: SN001234"
                  />
                </div>
                <div>
                  <Label className="text-white">Visibilidade</Label>
                  <select
                    value={newProduct.visibility || 'PUBLIC'}
                    onChange={(e) => setNewProduct({ ...newProduct, visibility: e.target.value as any })}
                    className="w-full bg-cinema-dark-lighter border border-cinema-gray-light text-white rounded-md px-3 py-2"
                  >
                    <option value="PUBLIC">Público (E-commerce + Locadora)</option>
                    <option value="PRIVATE">Privado (Apenas Locadora)</option>
                    <option value="ECOMMERCE">E-commerce</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newProduct.isKit || false}
                    onChange={(e) => setNewProduct({ ...newProduct, isKit: e.target.checked, kitItems: e.target.checked ? newProduct.kitItems || [] : [] })}
                    className="rounded"
                  />
                  <Label className="text-white">Este produto é um Kit</Label>
                </div>
                {newProduct.isKit && (
                  <div className="space-y-4">
                    <Label className="text-white">Produtos do Kit</Label>

                    {/* Available Products */}
                    <div className="bg-cinema-dark border border-cinema-gray-light rounded-lg p-3">
                      <h4 className="text-white text-sm font-medium mb-3">Produtos Disponíveis</h4>

                      {/* Search for products */}
                      <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Buscar produtos para o kit..."
                          value={''}
                          onChange={(e) => setNewProduct({ ...newProduct })}
                          className="pl-10 bg-cinema-dark-lighter border-cinema-gray-light text-white rounded-lg h-8 text-xs"
                        />
                      </div>

                      <div className="max-h-32 overflow-y-auto space-y-2">
                        {products
                          .filter(p => p.id !== 'temp' && !newProduct.kitItems?.includes(p.name))
                          .filter(p => {
                            const searchTerm = ''.toLowerCase();
                            return !searchTerm ||
                                   p.name.toLowerCase().includes(searchTerm) ||
                                   p.category.toLowerCase().includes(searchTerm) ||
                                   (p.brand && p.brand.toLowerCase().includes(searchTerm));
                          })
                          .map(product => (
                          <div key={product.id} className="flex items-center justify-between p-2 bg-cinema-dark-lighter rounded border border-cinema-gray-light/30">
                            <div className="flex items-center space-x-2">
                              <img src={product.image} alt={product.name} className="w-8 h-8 object-cover rounded" />
                              <div>
                                <p className="text-white text-xs font-medium">{product.name}</p>
                                <p className="text-gray-400 text-xs">{product.category}</p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => {
                                const currentItems = newProduct.kitItems || [];
                                setNewProduct({ ...newProduct, kitItems: [...currentItems, product.name] });
                              }}
                              className="h-6 px-2 bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark text-xs"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Selected Products */}
                    {newProduct.kitItems && newProduct.kitItems.length > 0 && (
                      <div className="bg-cinema-dark border border-cinema-gray-light rounded-lg p-3">
                        <h4 className="text-white text-sm font-medium mb-3">Produtos Selecionados ({newProduct.kitItems.length})</h4>
                        <div className="space-y-2">
                          {newProduct.kitItems.map((itemName, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-cinema-dark-lighter rounded border border-cinema-gray-light/30">
                              <span className="text-white text-xs">{itemName}</span>
                              <Button
                                size="sm"
                                onClick={() => {
                                  const currentItems = newProduct.kitItems || [];
                                  setNewProduct({ ...newProduct, kitItems: currentItems.filter((_, i) => i !== index) });
                                }}
                                className="h-6 px-2 text-red-400 border-red-400 hover:bg-red-400 hover:text-white text-xs"
                                variant="outline"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <Label className="text-white">Descrição</Label>
                <textarea
                  value={newProduct.description || ''}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full bg-cinema-dark-lighter border border-cinema-gray-light text-white rounded-md px-3 py-2 h-20 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-white">Preço Diário (R$)</Label>
                  <Input
                    type="number"
                    value={newProduct.price || 0}
                    onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })}
                    className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    required
                  />
                </div>
                <div>
                  <Label className="text-white">Disponibilidade</Label>
                  <select
                    value={newProduct.availability || 'available'}
                    onChange={(e) => setNewProduct({ ...newProduct, availability: e.target.value as any })}
                    className="w-full bg-cinema-dark-lighter border border-cinema-gray-light text-white rounded-md px-3 py-2"
                  >
                    <option value="available">Disponível</option>
                    <option value="rented">Alugado</option>
                    <option value="maintenance">Manutenção</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    checked={newProduct.featured || false}
                    onChange={(e) => setNewProduct({ ...newProduct, featured: e.target.checked })}
                    className="rounded"
                  />
                  <Label className="text-white">Produto em Destaque</Label>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={handleAddProduct}
                  className="flex-1 bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Produto
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 text-gray-400 border-gray-400 hover:text-white hover:border-white"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-cinema-gray border border-cinema-gray-light rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Editar Produto</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingProduct(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Nome do Produto</Label>
                  <Input
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    required
                  />
                </div>
                <div>
                  <Label className="text-white">Categoria</Label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full bg-cinema-dark-lighter border border-cinema-gray-light text-white rounded-md px-3 py-2"
                  >
                    {CATEGORIES.filter(c => c !== 'Todas').map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Sub Categoria</Label>
                  <Input
                    value={editingProduct.subcategory || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, subcategory: e.target.value })}
                    className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    placeholder="Ex: Câmeras de Cinema, Lentes Prime..."
                  />
                </div>
                <div>
                  <Label className="text-white">Marca</Label>
                  <Input
                    value={editingProduct.brand || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                    className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    placeholder="Ex: Sony, Canon, Zeiss..."
                  />
                </div>
              </div>

              <div>
                <Label className="text-white mb-2 block">Imagem do Produto</Label>
                <div className="flex items-center space-x-4">
                  {editingProduct.images && editingProduct.images[0] && editingProduct.images[0] !== '/placeholder.svg' && (
                    <img 
                      src={editingProduct.images[0]} 
                      alt="Preview" 
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const imageUrl = await handleImageUpload(file);
                          if (imageUrl) {
                            setEditingProduct({ ...editingProduct, images: [imageUrl] });
                          }
                        }
                      }}
                      className="hidden"
                      id="edit-product-image-upload"
                      disabled={uploadingImage}
                    />
                    <label
                      htmlFor="edit-product-image-upload"
                      className="inline-flex items-center px-4 py-2 bg-cinema-dark-lighter border border-cinema-gray-light text-white rounded-md cursor-pointer hover:bg-cinema-gray transition-colors"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadingImage ? 'Enviando...' : 'Escolher Imagem'}
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Número de Série</Label>
                  <Input
                    value={editingProduct.serialNumber || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, serialNumber: e.target.value })}
                    className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    placeholder="Ex: SN001234"
                  />
                </div>
                <div>
                  <Label className="text-white">Visibilidade</Label>
                  <select
                    value={editingProduct.visibility || 'PUBLIC'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, visibility: e.target.value as any })}
                    className="w-full bg-cinema-dark-lighter border border-cinema-gray-light text-white rounded-md px-3 py-2"
                  >
                    <option value="PUBLIC">Público (E-commerce + Locadora)</option>
                    <option value="PRIVATE">Privado (Apenas Locadora)</option>
                    <option value="ECOMMERCE">E-commerce</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={editingProduct.isKit || false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isKit: e.target.checked, kitItems: e.target.checked ? editingProduct.kitItems || [] : [] })}
                    className="rounded"
                  />
                  <Label className="text-white">Este produto é um Kit</Label>
                </div>
                {editingProduct.isKit && (
                  <div className="space-y-4">
                    <Label className="text-white">Produtos do Kit</Label>

                    {/* Available Products */}
                    <div className="bg-cinema-dark border border-cinema-gray-light rounded-lg p-3">
                      <h4 className="text-white text-sm font-medium mb-3">Produtos Disponíveis</h4>

                      {/* Search for products */}
                      <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Buscar produtos para o kit..."
                          value={''}
                          onChange={(e) => setEditingProduct({ ...editingProduct })}
                          className="pl-10 bg-cinema-dark-lighter border-cinema-gray-light text-white rounded-lg h-8 text-xs"
                        />
                      </div>

                      <div className="max-h-32 overflow-y-auto space-y-2">
                        {products
                          .filter(p => p.id !== editingProduct.id && !editingProduct.kitItems?.includes(p.name))
                          .filter(p => {
                            const searchTerm = ''.toLowerCase();
                            return !searchTerm ||
                                   p.name.toLowerCase().includes(searchTerm) ||
                                   p.category.toLowerCase().includes(searchTerm) ||
                                   (p.brand && p.brand.toLowerCase().includes(searchTerm));
                          })
                          .map(product => (
                          <div key={product.id} className="flex items-center justify-between p-2 bg-cinema-dark-lighter rounded border border-cinema-gray-light/30">
                            <div className="flex items-center space-x-2">
                              <img src={product.image} alt={product.name} className="w-8 h-8 object-cover rounded" />
                              <div>
                                <p className="text-white text-xs font-medium">{product.name}</p>
                                <p className="text-gray-400 text-xs">{product.category}</p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => {
                                const currentItems = editingProduct.kitItems || [];
                                setEditingProduct({ ...editingProduct, kitItems: [...currentItems, product.name] });
                              }}
                              className="h-6 px-2 bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark text-xs"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Selected Products */}
                    {editingProduct.kitItems && editingProduct.kitItems.length > 0 && (
                      <div className="bg-cinema-dark border border-cinema-gray-light rounded-lg p-3">
                        <h4 className="text-white text-sm font-medium mb-3">Produtos Selecionados ({editingProduct.kitItems.length})</h4>
                        <div className="space-y-2">
                          {editingProduct.kitItems.map((itemName, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-cinema-dark-lighter rounded border border-cinema-gray-light/30">
                              <span className="text-white text-xs">{itemName}</span>
                              <Button
                                size="sm"
                                onClick={() => {
                                  const currentItems = editingProduct.kitItems || [];
                                  setEditingProduct({ ...editingProduct, kitItems: currentItems.filter((_, i) => i !== index) });
                                }}
                                className="h-6 px-2 text-red-400 border-red-400 hover:bg-red-400 hover:text-white text-xs"
                                variant="outline"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <Label className="text-white">Descrição</Label>
                <textarea
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full bg-cinema-dark-lighter border border-cinema-gray-light text-white rounded-md px-3 py-2 h-20 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-white">Preço Diário (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                    className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    required
                  />
                </div>
                <div>
                  <Label className="text-white">Disponibilidade</Label>
                  <select
                    value={editingProduct.availability}
                    onChange={(e) => setEditingProduct({ ...editingProduct, availability: e.target.value as any })}
                    className="w-full bg-cinema-dark-lighter border border-cinema-gray-light text-white rounded-md px-3 py-2"
                  >
                    <option value="available">Disponível</option>
                    <option value="rented">Alugado</option>
                    <option value="maintenance">Manutenção</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    checked={editingProduct.featured}
                    onChange={(e) => setEditingProduct({ ...editingProduct, featured: e.target.checked })}
                    className="rounded"
                  />
                  <Label className="text-white">Produto em Destaque</Label>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={() => {
                    handleEditProduct(editingProduct);
                  }}
                  className="flex-1 bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingProduct(null)}
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
};
