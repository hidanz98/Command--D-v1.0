import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Layout, ShoppingCart, Users, FileText, Camera, Package, Star, Heart,
  Clock, Shield, Play, Grid3X3, LayoutDashboard, Monitor, Smartphone,
  Copy, Download, Eye, Edit, Trash2, Plus, Search, Filter, X
} from 'lucide-react';

interface PageTemplate {
  id: string;
  name: string;
  description: string;
  category: 'business' | 'ecommerce' | 'portfolio' | 'blog' | 'landing';
  thumbnail: string;
  isPremium: boolean;
  elements: any[];
  settings: {
    title: string;
    description: string;
    backgroundColor: string;
    maxWidth: string;
    padding: string;
  };
}

const PAGE_TEMPLATES: PageTemplate[] = [
  {
    id: 'template_1',
    name: 'E-commerce Completo',
    description: 'Página completa para loja online com hero, produtos, depoimentos e footer',
    category: 'ecommerce',
    thumbnail: '/placeholder.svg',
    isPremium: false,
    elements: [
      {
        id: 'hero_1',
        type: 'hero_section',
        props: {
          title: 'Equipamentos Profissionais de Cinema',
          subtitle: 'Aluguel de equipamentos de alta qualidade para suas produções',
          buttonText: 'Ver Catálogo',
          backgroundImage: '/placeholder.svg'
        },
        styles: {}
      },
      {
        id: 'products_1',
        type: 'product_grid',
        props: {
          columns: 3,
          gap: '24px',
          showPrice: true,
          showDescription: true,
          buttonText: 'Ver Detalhes'
        },
        styles: { padding: '60px 20px' }
      },
      {
        id: 'features_1',
        type: 'features',
        props: {
          title: 'Por que nos escolher?',
          features: [
            {
              icon: 'package',
              title: 'Equipamentos Premium',
              description: 'Equipamentos de última geração sempre atualizados'
            },
            {
              icon: 'shield',
              title: 'Seguro Incluso',
              description: 'Proteção total durante todo o período de aluguel'
            },
            {
              icon: 'clock',
              title: 'Entrega Rápida',
              description: 'Entregamos em até 2 horas na região metropolitana'
            }
          ]
        },
        styles: { padding: '60px 20px', backgroundColor: '#f8f9fa' }
      }
    ],
    settings: {
      title: 'Loja Online - Equipamentos de Cinema',
      description: 'Aluguel de equipamentos profissionais',
      backgroundColor: '#ffffff',
      maxWidth: '1200px',
      padding: '0'
    }
  },
  {
    id: 'template_2',
    name: 'Landing Page Simples',
    description: 'Página de conversão focada em um produto ou serviço específico',
    category: 'landing',
    thumbnail: '/placeholder.svg',
    isPremium: false,
    elements: [
      {
        id: 'hero_2',
        type: 'hero_section',
        props: {
          title: 'Sony FX6 - Disponível para Aluguel',
          subtitle: 'A câmera profissional que vai transformar sua produção',
          buttonText: 'Alugar Agora',
          buttonColor: '#FFD700'
        },
        styles: { minHeight: '100vh' }
      },
      {
        id: 'cta_1',
        type: 'call_to_action',
        props: {
          title: 'Pronto para começar?',
          description: 'Entre em contato conosco e reserve seu equipamento hoje mesmo',
          buttonText: 'Fazer Orçamento',
          buttonStyle: 'solid'
        },
        styles: { padding: '80px 20px' }
      }
    ],
    settings: {
      title: 'Sony FX6 - Aluguel',
      description: 'Alugue a Sony FX6 para sua próxima produção',
      backgroundColor: '#1a1a1a',
      maxWidth: '100%',
      padding: '0'
    }
  },
  {
    id: 'template_3',
    name: 'Portfólio Criativo',
    description: 'Showcase de trabalhos e projetos realizados',
    category: 'portfolio',
    thumbnail: '/placeholder.svg',
    isPremium: true,
    elements: [
      {
        id: 'hero_3',
        type: 'hero_section',
        props: {
          title: 'Nossos Projetos',
          subtitle: 'Conheça alguns dos trabalhos realizados com nossos equipamentos',
          buttonText: 'Ver Galeria'
        },
        styles: {}
      },
      {
        id: 'gallery_1',
        type: 'gallery',
        props: {
          columns: 3,
          images: [
            { src: '/placeholder.svg', alt: 'Projeto 1', title: 'Filme Independente' },
            { src: '/placeholder.svg', alt: 'Projeto 2', title: 'Comercial TV' },
            { src: '/placeholder.svg', alt: 'Projeto 3', title: 'Documentário' }
          ]
        },
        styles: { padding: '60px 20px' }
      },
      {
        id: 'testimonials_1',
        type: 'testimonials',
        props: {
          testimonials: [
            {
              text: 'Equipamentos de qualidade excepcional e atendimento impecável.',
              author: 'João Diretor',
              role: 'Diretor de Cinema',
              avatar: '/placeholder.svg'
            }
          ]
        },
        styles: { padding: '60px 20px', backgroundColor: '#f8f9fa' }
      }
    ],
    settings: {
      title: 'Portfólio - Bil\'s Cinema',
      description: 'Projetos realizados com nossos equipamentos',
      backgroundColor: '#ffffff',
      maxWidth: '1200px',
      padding: '0'
    }
  },
  {
    id: 'template_4',
    name: 'Página de Serviços',
    description: 'Apresentação completa de todos os serviços oferecidos',
    category: 'business',
    thumbnail: '/placeholder.svg',
    isPremium: false,
    elements: [
      {
        id: 'hero_4',
        type: 'hero_section',
        props: {
          title: 'Nossos Serviços',
          subtitle: 'Soluções completas para sua produção audiovisual',
          buttonText: 'Solicitar Orçamento'
        },
        styles: {}
      },
      {
        id: 'services_1',
        type: 'icon_box',
        props: {
          services: [
            {
              icon: 'camera',
              title: 'Aluguel de Equipamentos',
              description: 'Câmeras, lentes, áudio e iluminação profissional'
            },
            {
              icon: 'play',
              title: 'Produção Completa',
              description: 'Serviços de gravação e pós-produção'
            },
            {
              icon: 'users',
              title: 'Consultoria Técnica',
              description: 'Apoio especializado para sua produção'
            }
          ]
        },
        styles: { padding: '60px 20px' }
      },
      {
        id: 'pricing_1',
        type: 'pricing_table',
        props: {
          plans: [
            {
              name: 'Básico',
              price: 'R$ 150',
              period: '/dia',
              features: ['1 Câmera', '2 Lentes', 'Suporte Básico']
            },
            {
              name: 'Profissional',
              price: 'R$ 350',
              period: '/dia',
              features: ['Câmera Premium', '5 Lentes', 'Áudio Completo', 'Suporte 24h'],
              highlighted: true
            }
          ]
        },
        styles: { padding: '60px 20px', backgroundColor: '#f8f9fa' }
      }
    ],
    settings: {
      title: 'Serviços - Bil\'s Cinema',
      description: 'Conheça todos os nossos serviços',
      backgroundColor: '#ffffff',
      maxWidth: '1200px',
      padding: '0'
    }
  },
  {
    id: 'template_5',
    name: 'Blog/Notícias',
    description: 'Layout para artigos, notícias e conteúdo educativo',
    category: 'blog',
    thumbnail: '/placeholder.svg',
    isPremium: true,
    elements: [
      {
        id: 'hero_5',
        type: 'hero_section',
        props: {
          title: 'Blog Bil\'s Cinema',
          subtitle: 'Dicas, tutoriais e novidades do mundo audiovisual',
          buttonText: 'Explorar Artigos'
        },
        styles: {}
      },
      {
        id: 'blog_1',
        type: 'blog_grid',
        props: {
          posts: [
            {
              title: 'Como escolher a câmera ideal para seu projeto',
              excerpt: 'Guia completo para selecionar o equipamento certo...',
              date: '2024-01-15',
              category: 'Tutoriais',
              image: '/placeholder.svg'
            },
            {
              title: 'Tendências em cinematografia 2024',
              excerpt: 'As principais tendências que estão moldando...',
              date: '2024-01-10',
              category: 'Tendências',
              image: '/placeholder.svg'
            }
          ]
        },
        styles: { padding: '60px 20px' }
      }
    ],
    settings: {
      title: 'Blog - Bil\'s Cinema',
      description: 'Conteúdo sobre cinema e audiovisual',
      backgroundColor: '#ffffff',
      maxWidth: '800px',
      padding: '20px'
    }
  }
];

export const PageTemplates: React.FC<{
  onTemplateSelect: (template: PageTemplate) => void;
  onClose?: () => void;
}> = ({ onTemplateSelect, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);

  const categories = [
    { value: 'all', label: 'Todos' },
    { value: 'ecommerce', label: 'E-commerce' },
    { value: 'landing', label: 'Landing Page' },
    { value: 'business', label: 'Negócios' },
    { value: 'portfolio', label: 'Portfólio' },
    { value: 'blog', label: 'Blog' }
  ];

  const filteredTemplates = PAGE_TEMPLATES.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesPremium = !showPremiumOnly || template.isPremium;
    
    return matchesSearch && matchesCategory && matchesPremium;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ecommerce': return ShoppingCart;
      case 'landing': return LayoutDashboard;
      case 'business': return Users;
      case 'portfolio': return Camera;
      case 'blog': return FileText;
      default: return Layout;
    }
  };

  return (
    <div className="h-full bg-cinema-dark-lighter">
      {/* Header */}
      <div className="p-4">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white mb-2">Templates Prontos</h2>
          <p className="text-gray-400 text-sm">
            Escolha um template para começar rapidamente
          </p>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-cinema-dark border-cinema-gray-light text-white rounded-lg"
            />
          </div>
        </div>

        {/* Quick Filters */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {categories.slice(0, 4).map(category => (
              <Button
                key={category.value}
                size="sm"
                variant={selectedCategory === category.value ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category.value)}
                className={selectedCategory === category.value
                  ? 'bg-cinema-yellow text-cinema-dark'
                  : 'text-gray-300 border-cinema-gray-light hover:border-cinema-yellow hover:text-cinema-yellow'
                }
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-gray-400 text-sm">
          <span>{filteredTemplates.length} templates disponíveis</span>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showPremiumOnly}
              onChange={(e) => setShowPremiumOnly(e.target.checked)}
              className="rounded"
            />
            <Label className="text-gray-400 text-xs">Premium</Label>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="px-4 pb-4 overflow-y-auto border-t border-cinema-gray-light/50" style={{ height: 'calc(100% - 180px)' }}>
        <div className="pt-4 space-y-3">
          {filteredTemplates.map((template) => {
            const CategoryIcon = getCategoryIcon(template.category);

            return (
              <div
                key={template.id}
                className="group bg-cinema-dark rounded-lg border border-cinema-gray-light hover:border-cinema-yellow/50 transition-all"
              >
                <div className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative w-20 h-16 flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={template.thumbnail}
                        alt={template.name}
                        className="w-full h-full object-cover"
                      />
                      {template.isPremium && (
                        <div className="absolute top-1 right-1 w-3 h-3 bg-cinema-yellow rounded-full flex items-center justify-center">
                          <Star className="w-2 h-2 text-cinema-dark" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium text-sm mb-1">{template.name}</h3>
                      <p className="text-gray-400 text-xs mb-2 line-clamp-1">{template.description}</p>
                      <div className="flex items-center space-x-3 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <CategoryIcon className="w-3 h-3" />
                          <span>{categories.find(c => c.value === template.category)?.label}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <LayoutDashboard className="w-3 h-3" />
                          <span>{template.elements.length} elementos</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-4 pb-4">
                  <Button
                    size="sm"
                    className="w-full bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
                    onClick={() => onTemplateSelect(template)}
                  >
                    Usar Template
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-8">
            <Layout className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">Nenhum template encontrado</h3>
            <p className="text-gray-500 text-sm">Tente ajustar os filtros</p>
          </div>
        )}

        {/* Create Custom Template */}
        {filteredTemplates.length > 0 && (
          <div className="mt-4 p-4 bg-cinema-dark rounded-lg border border-dashed border-cinema-gray-light hover:border-cinema-yellow/50 transition-colors cursor-pointer text-center">
            <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <h3 className="text-white font-medium text-sm mb-1">Página em Branco</h3>
            <p className="text-gray-400 text-xs mb-3">Comece do zero</p>
            <Button
              size="sm"
              variant="outline"
              className="text-cinema-yellow border-cinema-yellow"
            >
              Criar Nova
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
