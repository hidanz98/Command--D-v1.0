import React, { useState, useRef, useCallback, useMemo } from 'react';
import { DndProvider, useDrag, useDrop, DropTargetMonitor } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductManager } from './ProductManager';
import { PageTemplates } from './PageTemplates';
import {
  X, Plus, Settings, Eye, Smartphone, Monitor, Tablet, Save, Undo, Redo,
  Type, Image, Video, Package, ShoppingCart, FileText, Grid3X3, Layout,
  Palette, Camera, Lightbulb, Layers, Copy, Trash2, ArrowUp, ArrowDown,
  Edit, Download, Upload, Search, Filter, Star, Heart, Quote, Menu,
  Phone, Mail, MapPin, Clock, Users, Shield, CheckCircle, Play,
  ChevronLeft, ChevronRight, ChevronDown, MoreHorizontal, Code, MousePointer, Globe,
  Maximize, Minimize, RotateCcw, ZoomIn, ZoomOut, Move3D, Crop,
  AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline,
  PaintBucket, Minus, Plus as PlusIcon, BoxSelect, Target, Zap, Megaphone
} from 'lucide-react';

// Types for drag and drop
const ItemTypes = {
  WIDGET: 'widget',
  ELEMENT: 'element'
};

// Widget types available
const WIDGET_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  BUTTON: 'button',
  HEADING: 'heading',
  PARAGRAPH: 'paragraph',
  DIVIDER: 'divider',
  SPACER: 'spacer',
  VIDEO: 'video',
  GALLERY: 'gallery',
  PRODUCT_GRID: 'product_grid',
  PRODUCT_CARD: 'product_card',
  HERO_SECTION: 'hero_section',
  FEATURES: 'features',
  TESTIMONIALS: 'testimonials',
  CONTACT_FORM: 'contact_form',
  NEWSLETTER: 'newsletter',
  PRICING_TABLE: 'pricing_table',
  TEAM_MEMBERS: 'team_members',
  FAQ: 'faq',
  COUNTDOWN: 'countdown',
  PROGRESS_BAR: 'progress_bar',
  SOCIAL_ICONS: 'social_icons',
  MAP: 'map',
  SLIDER: 'slider',
  TABS: 'tabs',
  ACCORDION: 'accordion',
  CALL_TO_ACTION: 'call_to_action',
  ICON_BOX: 'icon_box',
  COUNTER: 'counter',
  NAVBAR: 'navbar',
  FOOTER: 'footer',
  SIDEBAR: 'sidebar',
  BREADCRUMB: 'breadcrumb',
  PAGINATION: 'pagination',
  SEARCH_BAR: 'search_bar'
};

// Widget categories
const WIDGET_CATEGORIES = {
  BASIC: [
    { type: WIDGET_TYPES.TEXT, label: 'Texto', icon: Type },
    { type: WIDGET_TYPES.HEADING, label: 'Título', icon: Type },
    { type: WIDGET_TYPES.PARAGRAPH, label: 'Parágrafo', icon: FileText },
    { type: WIDGET_TYPES.BUTTON, label: 'Botão', icon: MousePointer },
    { type: WIDGET_TYPES.IMAGE, label: 'Imagem', icon: Image },
    { type: WIDGET_TYPES.VIDEO, label: 'Vídeo', icon: Video },
    { type: WIDGET_TYPES.DIVIDER, label: 'Divisor', icon: Minus },
    { type: WIDGET_TYPES.SPACER, label: 'Espaçamento', icon: PlusIcon }
  ],
  ECOMMERCE: [
    { type: WIDGET_TYPES.PRODUCT_GRID, label: 'Grade de Produtos', icon: Grid3X3 },
    { type: WIDGET_TYPES.PRODUCT_CARD, label: 'Card Produto', icon: Package },
    { type: WIDGET_TYPES.PRICING_TABLE, label: 'Tabela Preços', icon: ShoppingCart },
    { type: WIDGET_TYPES.CALL_TO_ACTION, label: 'Call to Action', icon: Target }
  ],
  LAYOUT: [
    { type: WIDGET_TYPES.HERO_SECTION, label: 'Seção Hero', icon: Layout },
    { type: WIDGET_TYPES.NAVBAR, label: 'Menu Navegação', icon: Menu },
    { type: WIDGET_TYPES.FOOTER, label: 'Rodapé', icon: Layout },
    { type: WIDGET_TYPES.SIDEBAR, label: 'Barra Lateral', icon: Layout },
    { type: WIDGET_TYPES.SLIDER, label: 'Slider', icon: ChevronRight },
    { type: WIDGET_TYPES.TABS, label: 'Abas', icon: BoxSelect },
    { type: WIDGET_TYPES.ACCORDION, label: 'Accordion', icon: ChevronDown }
  ],
  CONTENT: [
    { type: WIDGET_TYPES.GALLERY, label: 'Galeria', icon: Camera },
    { type: WIDGET_TYPES.TESTIMONIALS, label: 'Depoimentos', icon: Quote },
    { type: WIDGET_TYPES.FEATURES, label: 'Recursos', icon: Star },
    { type: WIDGET_TYPES.TEAM_MEMBERS, label: 'Equipe', icon: Users },
    { type: WIDGET_TYPES.FAQ, label: 'FAQ', icon: FileText },
    { type: WIDGET_TYPES.ICON_BOX, label: 'Caixa Ícone', icon: BoxSelect }
  ],
  FORMS: [
    { type: WIDGET_TYPES.CONTACT_FORM, label: 'Formulário Contato', icon: Mail },
    { type: WIDGET_TYPES.NEWSLETTER, label: 'Newsletter', icon: Megaphone },
    { type: WIDGET_TYPES.SEARCH_BAR, label: 'Barra Busca', icon: Search }
  ],
  ADVANCED: [
    { type: WIDGET_TYPES.COUNTDOWN, label: 'Contador Tempo', icon: Clock },
    { type: WIDGET_TYPES.PROGRESS_BAR, label: 'Barra Progresso', icon: Zap },
    { type: WIDGET_TYPES.COUNTER, label: 'Contador', icon: Target },
    { type: WIDGET_TYPES.SOCIAL_ICONS, label: 'Ícones Sociais', icon: Heart },
    { type: WIDGET_TYPES.MAP, label: 'Mapa', icon: MapPin }
  ]
};

// Default widget configurations
const DEFAULT_WIDGETS = {
  [WIDGET_TYPES.TEXT]: {
    content: 'Digite seu texto aqui...',
    fontSize: '16px',
    color: '#333333',
    fontFamily: 'Inter',
    fontWeight: 'normal',
    textAlign: 'left',
    lineHeight: '1.5'
  },
  [WIDGET_TYPES.HEADING]: {
    content: 'Título Principal',
    level: 'h1',
    fontSize: '32px',
    color: '#FFD700',
    fontFamily: 'Inter',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  [WIDGET_TYPES.BUTTON]: {
    text: 'Clique Aqui',
    url: '#',
    style: 'solid',
    backgroundColor: '#FFD700',
    textColor: '#1a1a1a',
    borderRadius: '6px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: 'medium'
  },
  [WIDGET_TYPES.IMAGE]: {
    src: '/placeholder.svg',
    alt: 'Imagem',
    width: '100%',
    height: 'auto',
    borderRadius: '0px',
    objectFit: 'cover'
  },
  [WIDGET_TYPES.PRODUCT_GRID]: {
    columns: 3,
    gap: '24px',
    showPrice: true,
    showDescription: true,
    cardStyle: 'shadow',
    buttonText: 'Ver Mais'
  }
};

// Interface for page elements
interface PageElement {
  id: string;
  type: string;
  props: Record<string, any>;
  styles: Record<string, any>;
  children?: PageElement[];
  parentId?: string;
}

// Interface for page structure
interface Page {
  id: string;
  name: string;
  slug: string;
  elements: PageElement[];
  settings: {
    title: string;
    description: string;
    backgroundColor: string;
    backgroundImage?: string;
    maxWidth: string;
    padding: string;
  };
}

// Mock products data
const MOCK_PRODUCTS = [
  {
    id: 1,
    name: 'Sony FX6 Full Frame',
    price: 350,
    image: '/placeholder.svg',
    description: 'Câmera cinematográfica profissional',
    category: 'Câmeras'
  },
  {
    id: 2,
    name: 'Canon EOS R5C',
    price: 280,
    image: '/placeholder.svg',
    description: 'Câmera híbrida de alta qualidade',
    category: 'Câmeras'
  },
  {
    id: 3,
    name: 'Zeiss CP.3 85mm',
    price: 120,
    image: '/placeholder.svg',
    description: 'Lente cinematográfica profissional',
    category: 'Lentes'
  }
];

// Draggable Widget Component
const DraggableWidget: React.FC<{ widget: any }> = ({ widget }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.WIDGET,
    item: { type: widget.type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const IconComponent = widget.icon;

  return (
    <div
      ref={drag}
      className={`flex items-center space-x-3 p-3 bg-cinema-dark rounded-lg cursor-grab hover:bg-cinema-yellow/10 hover:border-cinema-yellow/30 border border-transparent transition-all duration-200 ${
        isDragging ? 'opacity-50 scale-95' : 'hover:scale-[1.02]'
      }`}
    >
      <div className="w-8 h-8 bg-cinema-yellow/20 rounded-lg flex items-center justify-center">
        <IconComponent className="w-4 h-4 text-cinema-yellow" />
      </div>
      <div className="flex-1">
        <span className="text-white text-sm font-medium block">{widget.label}</span>
        <span className="text-gray-400 text-xs">Arraste para adicionar</span>
      </div>
    </div>
  );
};

// Page Element Component
const PageElement: React.FC<{
  element: PageElement;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<PageElement>) => void;
  onDelete: (id: string) => void;
}> = ({ element, isSelected, onSelect, onUpdate, onDelete }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.WIDGET,
    drop: (item: { type: string }) => {
      // Handle dropping widgets onto existing elements
      console.log('Dropped widget:', item.type, 'onto element:', element.id);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const renderElement = () => {
    switch (element.type) {
      case WIDGET_TYPES.TEXT:
        return (
          <div 
            style={{
              fontSize: element.props.fontSize,
              color: element.props.color,
              fontFamily: element.props.fontFamily,
              fontWeight: element.props.fontWeight,
              textAlign: element.props.textAlign,
              lineHeight: element.props.lineHeight,
              ...element.styles
            }}
            dangerouslySetInnerHTML={{ __html: element.props.content }}
          />
        );
      
      case WIDGET_TYPES.HEADING:
        const HeadingTag = element.props.level || 'h1';
        return React.createElement(
          HeadingTag,
          {
            style: {
              fontSize: element.props.fontSize,
              color: element.props.color,
              fontFamily: element.props.fontFamily,
              fontWeight: element.props.fontWeight,
              textAlign: element.props.textAlign,
              margin: 0,
              ...element.styles
            }
          },
          element.props.content
        );
      
      case WIDGET_TYPES.BUTTON:
        return (
          <button
            style={{
              backgroundColor: element.props.backgroundColor,
              color: element.props.textColor,
              borderRadius: element.props.borderRadius,
              padding: element.props.padding,
              fontSize: element.props.fontSize,
              fontWeight: element.props.fontWeight,
              border: element.props.style === 'outline' ? `2px solid ${element.props.backgroundColor}` : 'none',
              cursor: 'pointer',
              ...element.styles
            }}
            className="transition-all hover:opacity-90"
          >
            {element.props.text}
          </button>
        );
      
      case WIDGET_TYPES.IMAGE:
        return (
          <img
            src={element.props.src}
            alt={element.props.alt}
            style={{
              width: element.props.width,
              height: element.props.height,
              borderRadius: element.props.borderRadius,
              objectFit: element.props.objectFit,
              ...element.styles
            }}
          />
        );
      
      case WIDGET_TYPES.PRODUCT_GRID:
        return (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${element.props.columns}, 1fr)`,
              gap: element.props.gap,
              ...element.styles
            }}
          >
            {MOCK_PRODUCTS.slice(0, element.props.columns * 2).map((product) => (
              <div key={product.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="font-medium text-gray-800 mb-2">{product.name}</h3>
                  {element.props.showDescription && (
                    <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                  )}
                  <div className="flex justify-between items-center">
                    {element.props.showPrice && (
                      <span className="text-cinema-yellow font-bold">R$ {product.price}/dia</span>
                    )}
                    <button 
                      className="bg-cinema-yellow text-cinema-dark px-3 py-1 rounded text-sm"
                      style={{ borderRadius: element.props.buttonStyle?.borderRadius || '6px' }}
                    >
                      {element.props.buttonText}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      
      case WIDGET_TYPES.PRODUCT_CARD:
        return (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm" style={element.styles}>
            <img
              src={element.props.image}
              alt={element.props.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="font-medium text-gray-800 mb-2">{element.props.name}</h3>
              {element.props.showDescription && (
                <p className="text-gray-600 text-sm mb-3">{element.props.description}</p>
              )}
              <div className="flex justify-between items-center">
                {element.props.showPrice && (
                  <span className="text-cinema-yellow font-bold">R$ {element.props.price}/dia</span>
                )}
                <button className="bg-cinema-yellow text-cinema-dark px-3 py-1 rounded text-sm">
                  {element.props.buttonText}
                </button>
              </div>
            </div>
          </div>
        );

      case WIDGET_TYPES.HERO_SECTION:
        return (
          <div
            style={{
              background: element.props.backgroundImage
                ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${element.props.backgroundImage})`
                : element.props.backgroundColor || '#1a1a1a',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              color: 'white',
              padding: element.props.padding || '80px 20px',
              textAlign: 'center',
              ...element.styles
            }}
          >
            <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '16px' }}>
              {element.props.title || 'Título Principal'}
            </h1>
            <p style={{ fontSize: '18px', marginBottom: '32px', opacity: 0.9 }}>
              {element.props.subtitle || 'Subtítulo descritivo'}
            </p>
            <button
              style={{
                backgroundColor: element.props.buttonColor || '#FFD700',
                color: element.props.buttonTextColor || '#1a1a1a',
                padding: '16px 32px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '16px',
                fontWeight: 'medium',
                cursor: 'pointer'
              }}
            >
              {element.props.buttonText || 'Call to Action'}
            </button>
          </div>
        );
      
      default:
        return (
          <div className="p-4 bg-gray-100 border-2 border-dashed border-gray-300 text-center">
            <span className="text-gray-500">Widget: {element.type}</span>
          </div>
        );
    }
  };

  return (
    <div
      ref={drop}
      className={`relative group ${isSelected ? 'ring-2 ring-cinema-yellow' : ''} ${
        isOver ? 'ring-2 ring-blue-400' : ''
      }`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(element.id);
      }}
    >
      {renderElement()}
      
      {/* Element Controls */}
      {isSelected && (
        <div className="absolute -top-8 left-0 flex space-x-1 bg-cinema-yellow text-cinema-dark px-2 py-1 rounded text-xs">
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Duplicate element
            }}
            className="hover:bg-cinema-yellow-dark p-1 rounded"
          >
            <Copy className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(element.id);
            }}
            className="hover:bg-red-500 hover:text-white p-1 rounded"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};

// Drop Zone Component
const DropZone: React.FC<{
  onDrop: (widgetType: string, position: number) => void;
  position: number;
}> = ({ onDrop, position }) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.WIDGET,
    drop: (item: { type: string }) => {
      onDrop(item.type, position);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`h-2 transition-all ${
        isOver && canDrop
          ? 'h-12 bg-cinema-yellow/20 border-2 border-dashed border-cinema-yellow'
          : 'hover:h-6 hover:bg-gray-100'
      }`}
    >
      {isOver && canDrop && (
        <div className="flex items-center justify-center h-full">
          <span className="text-cinema-yellow text-sm font-medium">Solte o widget aqui</span>
        </div>
      )}
    </div>
  );
};

// Properties Panel Component
const PropertiesPanel: React.FC<{
  selectedElement: PageElement | null;
  onUpdate: (updates: Partial<PageElement>) => void;
}> = ({ selectedElement, onUpdate }) => {
  if (!selectedElement) {
    return (
      <div className="p-6 text-center text-gray-400 h-full flex items-center justify-center">
        <div>
          <Settings className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">Nenhum elemento selecionado</h3>
          <p className="text-sm text-gray-500">Clique em um elemento no canvas para editar suas propriedades</p>
        </div>
      </div>
    );
  }

  const updateProp = (key: string, value: any) => {
    onUpdate({
      props: {
        ...selectedElement.props,
        [key]: value
      }
    });
  };

  const updateStyle = (key: string, value: any) => {
    onUpdate({
      styles: {
        ...selectedElement.styles,
        [key]: value
      }
    });
  };

  const renderProperties = () => {
    switch (selectedElement.type) {
      case WIDGET_TYPES.TEXT:
      case WIDGET_TYPES.HEADING:
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-white">Conteúdo</Label>
              <textarea
                value={selectedElement.props.content || ''}
                onChange={(e) => updateProp('content', e.target.value)}
                className="w-full bg-cinema-dark-lighter border border-cinema-gray-light text-white rounded-md px-3 py-2 h-24 resize-none"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-white">Tamanho</Label>
                <Input
                  value={selectedElement.props.fontSize || '16px'}
                  onChange={(e) => updateProp('fontSize', e.target.value)}
                  className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                />
              </div>
              <div>
                <Label className="text-white">Cor</Label>
                <Input
                  type="color"
                  value={selectedElement.props.color || '#333333'}
                  onChange={(e) => updateProp('color', e.target.value)}
                  className="bg-cinema-dark-lighter border-cinema-gray-light"
                />
              </div>
            </div>

            <div>
              <Label className="text-white">Alinhamento</Label>
              <div className="flex space-x-2 mt-1">
                <Button
                  size="sm"
                  variant={selectedElement.props.textAlign === 'left' ? 'default' : 'outline'}
                  onClick={() => updateProp('textAlign', 'left')}
                  className="flex-1"
                >
                  <AlignLeft className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant={selectedElement.props.textAlign === 'center' ? 'default' : 'outline'}
                  onClick={() => updateProp('textAlign', 'center')}
                  className="flex-1"
                >
                  <AlignCenter className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant={selectedElement.props.textAlign === 'right' ? 'default' : 'outline'}
                  onClick={() => updateProp('textAlign', 'right')}
                  className="flex-1"
                >
                  <AlignRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        );

      case WIDGET_TYPES.BUTTON:
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-white">Texto do Botão</Label>
              <Input
                value={selectedElement.props.text || ''}
                onChange={(e) => updateProp('text', e.target.value)}
                className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
              />
            </div>

            <div>
              <Label className="text-white">URL/Link</Label>
              <Input
                value={selectedElement.props.url || ''}
                onChange={(e) => updateProp('url', e.target.value)}
                className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-white">Cor de Fundo</Label>
                <Input
                  type="color"
                  value={selectedElement.props.backgroundColor || '#FFD700'}
                  onChange={(e) => updateProp('backgroundColor', e.target.value)}
                  className="bg-cinema-dark-lighter border-cinema-gray-light"
                />
              </div>
              <div>
                <Label className="text-white">Cor do Texto</Label>
                <Input
                  type="color"
                  value={selectedElement.props.textColor || '#1a1a1a'}
                  onChange={(e) => updateProp('textColor', e.target.value)}
                  className="bg-cinema-dark-lighter border-cinema-gray-light"
                />
              </div>
            </div>

            <div>
              <Label className="text-white">Borda Arredondada</Label>
              <Input
                value={selectedElement.props.borderRadius || '6px'}
                onChange={(e) => updateProp('borderRadius', e.target.value)}
                className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                placeholder="6px"
              />
            </div>
          </div>
        );

      case WIDGET_TYPES.IMAGE:
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-white">URL da Imagem</Label>
              <Input
                value={selectedElement.props.src || ''}
                onChange={(e) => updateProp('src', e.target.value)}
                className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                placeholder="https://..."
              />
            </div>

            <div>
              <Label className="text-white">Texto Alternativo</Label>
              <Input
                value={selectedElement.props.alt || ''}
                onChange={(e) => updateProp('alt', e.target.value)}
                className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-white">Largura</Label>
                <Input
                  value={selectedElement.props.width || '100%'}
                  onChange={(e) => updateProp('width', e.target.value)}
                  className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                />
              </div>
              <div>
                <Label className="text-white">Altura</Label>
                <Input
                  value={selectedElement.props.height || 'auto'}
                  onChange={(e) => updateProp('height', e.target.value)}
                  className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                />
              </div>
            </div>
          </div>
        );

      case WIDGET_TYPES.PRODUCT_CARD:
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-white">Nome do Produto</Label>
              <Input
                value={selectedElement.props.name || ''}
                onChange={(e) => updateProp('name', e.target.value)}
                className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
              />
            </div>

            <div>
              <Label className="text-white">Descrição</Label>
              <textarea
                value={selectedElement.props.description || ''}
                onChange={(e) => updateProp('description', e.target.value)}
                className="w-full bg-cinema-dark-lighter border border-cinema-gray-light text-white rounded-md px-3 py-2 h-20 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-white">Preço (R$/dia)</Label>
                <Input
                  type="number"
                  value={selectedElement.props.price || 0}
                  onChange={(e) => updateProp('price', parseFloat(e.target.value) || 0)}
                  className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                />
              </div>
              <div>
                <Label className="text-white">Categoria</Label>
                <Input
                  value={selectedElement.props.category || ''}
                  onChange={(e) => updateProp('category', e.target.value)}
                  className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                />
              </div>
            </div>

            <div>
              <Label className="text-white">URL da Imagem</Label>
              <Input
                value={selectedElement.props.image || ''}
                onChange={(e) => updateProp('image', e.target.value)}
                className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                placeholder="https://..."
              />
            </div>

            <div>
              <Label className="text-white">Texto do Botão</Label>
              <Input
                value={selectedElement.props.buttonText || 'Ver Detalhes'}
                onChange={(e) => updateProp('buttonText', e.target.value)}
                className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedElement.props.showPrice !== false}
                  onChange={(e) => updateProp('showPrice', e.target.checked)}
                  className="rounded"
                />
                <Label className="text-white">Mostrar Preço</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedElement.props.showDescription !== false}
                  onChange={(e) => updateProp('showDescription', e.target.checked)}
                  className="rounded"
                />
                <Label className="text-white">Mostrar Descrição</Label>
              </div>
            </div>
          </div>
        );

      case WIDGET_TYPES.PRODUCT_GRID:
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-white">Colunas</Label>
              <select
                value={selectedElement.props.columns || 3}
                onChange={(e) => updateProp('columns', parseInt(e.target.value))}
                className="w-full bg-cinema-dark-lighter border border-cinema-gray-light text-white rounded-md px-3 py-2"
              >
                <option value={1}>1 Coluna</option>
                <option value={2}>2 Colunas</option>
                <option value={3}>3 Colunas</option>
                <option value={4}>4 Colunas</option>
                <option value={5}>5 Colunas</option>
              </select>
            </div>

            <div>
              <Label className="text-white">Espaçamento</Label>
              <Input
                value={selectedElement.props.gap || '24px'}
                onChange={(e) => updateProp('gap', e.target.value)}
                className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedElement.props.showPrice !== false}
                  onChange={(e) => updateProp('showPrice', e.target.checked)}
                  className="rounded"
                />
                <Label className="text-white">Mostrar Preço</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedElement.props.showDescription !== false}
                  onChange={(e) => updateProp('showDescription', e.target.checked)}
                  className="rounded"
                />
                <Label className="text-white">Mostrar Descrição</Label>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center text-gray-400 py-8">
            <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Propriedades não disponíveis para este elemento</p>
          </div>
        );
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Content Properties */}
      <div className="bg-cinema-dark rounded-lg p-4">
        <h4 className="text-white font-medium mb-4 flex items-center">
          <Edit className="w-4 h-4 mr-2 text-cinema-yellow" />
          Conteúdo
        </h4>
        {renderProperties()}
      </div>

      {/* Advanced Styles */}
      <div className="bg-cinema-dark rounded-lg p-4">
        <h4 className="text-white font-medium mb-4 flex items-center">
          <Palette className="w-4 h-4 mr-2 text-cinema-yellow" />
          Estilos Avançados
        </h4>

        <div className="space-y-4">
          <div>
            <Label className="text-white text-sm font-medium mb-3 block">Espaçamento</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-gray-400 text-xs">Margin</Label>
                <Input
                  value={selectedElement.styles?.margin || '0'}
                  onChange={(e) => updateStyle('margin', e.target.value)}
                  className="bg-cinema-dark-lighter border-cinema-gray-light text-white text-sm"
                  placeholder="0px"
                />
              </div>
              <div>
                <Label className="text-gray-400 text-xs">Padding</Label>
                <Input
                  value={selectedElement.styles?.padding || '0'}
                  onChange={(e) => updateStyle('padding', e.target.value)}
                  className="bg-cinema-dark-lighter border-cinema-gray-light text-white text-sm"
                  placeholder="0px"
                />
              </div>
            </div>
          </div>

          <div>
            <Label className="text-white text-sm font-medium mb-3 block">Aparência</Label>
            <div className="space-y-3">
              <div>
                <Label className="text-gray-400 text-xs">Cor de Fundo</Label>
                <div className="flex space-x-2">
                  <Input
                    type="color"
                    value={selectedElement.styles?.backgroundColor || '#transparent'}
                    onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                    className="w-12 h-8 p-0 border-0 bg-transparent"
                  />
                  <Input
                    value={selectedElement.styles?.backgroundColor || 'transparent'}
                    onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                    className="flex-1 bg-cinema-dark-lighter border-cinema-gray-light text-white text-sm"
                    placeholder="transparent"
                  />
                </div>
              </div>

              <div>
                <Label className="text-gray-400 text-xs">Border</Label>
                <Input
                  value={selectedElement.styles?.border || 'none'}
                  onChange={(e) => updateStyle('border', e.target.value)}
                  className="bg-cinema-dark-lighter border-cinema-gray-light text-white text-sm"
                  placeholder="1px solid #ccc"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex space-x-2">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 text-cinema-yellow border-cinema-yellow"
          onClick={() => {
            // Duplicate element
            console.log('Duplicate element');
          }}
        >
          <Copy className="w-4 h-4 mr-1" />
          Duplicar
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="text-red-400 border-red-400"
          onClick={() => {
            // Delete element
            console.log('Delete element');
          }}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

// Main Editor Component
export const AdvancedPageEditor: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('widgets');
  const [selectedDevice, setSelectedDevice] = useState('desktop');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>({
    id: '1',
    name: 'Página Inicial',
    slug: 'home',
    elements: [],
    settings: {
      title: 'Página Inicial',
      description: 'Descrição da página',
      backgroundColor: '#ffffff',
      maxWidth: '1200px',
      padding: '20px'
    }
  });
  const [pages, setPages] = useState<Page[]>([currentPage]);
  const [history, setHistory] = useState<Page[]>([currentPage]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [activeWidgetCategory, setActiveWidgetCategory] = useState('BASIC');

  // Generate unique ID
  const generateId = () => `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Add widget to page
  const addWidget = useCallback((widgetType: string, position: number) => {
    const newElement: PageElement = {
      id: generateId(),
      type: widgetType,
      props: { ...DEFAULT_WIDGETS[widgetType] },
      styles: {}
    };

    const newElements = [...currentPage.elements];
    newElements.splice(position, 0, newElement);

    const updatedPage = {
      ...currentPage,
      elements: newElements
    };

    setCurrentPage(updatedPage);
    addToHistory(updatedPage);
    setSelectedElementId(newElement.id);
  }, [currentPage]);

  // Update element
  const updateElement = useCallback((elementId: string, updates: Partial<PageElement>) => {
    const updatedElements = currentPage.elements.map(element =>
      element.id === elementId ? { ...element, ...updates } : element
    );

    const updatedPage = {
      ...currentPage,
      elements: updatedElements
    };

    setCurrentPage(updatedPage);
    addToHistory(updatedPage);
  }, [currentPage]);

  // Delete element
  const deleteElement = useCallback((elementId: string) => {
    const updatedElements = currentPage.elements.filter(element => element.id !== elementId);
    
    const updatedPage = {
      ...currentPage,
      elements: updatedElements
    };

    setCurrentPage(updatedPage);
    addToHistory(updatedPage);
    setSelectedElementId(null);
  }, [currentPage]);

  // History management
  const addToHistory = (page: Page) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(page);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCurrentPage(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCurrentPage(history[historyIndex + 1]);
    }
  };

  const selectedElement = selectedElementId 
    ? currentPage.elements.find(el => el.id === selectedElementId) 
    : null;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-cinema-gray border border-cinema-gray-light rounded-lg w-full max-w-7xl mx-4 h-[95vh] flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-cinema-gray-light">
            <div className="flex items-center space-x-4">
              <h3 className="text-xl font-bold text-white">Editor Avançado - Elementor Style</h3>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={undo}
                  disabled={historyIndex <= 0}
                  className="text-gray-400 border-gray-400"
                >
                  <Undo className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={redo}
                  disabled={historyIndex >= history.length - 1}
                  className="text-gray-400 border-gray-400"
                >
                  <Redo className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Device Selector */}
              <div className="flex space-x-1 bg-cinema-dark-lighter rounded-lg p-1">
                <Button
                  size="sm"
                  variant={selectedDevice === 'desktop' ? 'default' : 'ghost'}
                  onClick={() => setSelectedDevice('desktop')}
                  className="text-white"
                >
                  <Monitor className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant={selectedDevice === 'tablet' ? 'default' : 'ghost'}
                  onClick={() => setSelectedDevice('tablet')}
                  className="text-white"
                >
                  <Tablet className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant={selectedDevice === 'mobile' ? 'default' : 'ghost'}
                  onClick={() => setSelectedDevice('mobile')}
                  className="text-white"
                >
                  <Smartphone className="w-4 h-4" />
                </Button>
              </div>

              <Button
                size="sm"
                className="bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Editor Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left Panel */}
            <div className="w-96 bg-cinema-dark-lighter border-r border-cinema-gray-light flex flex-col">
              {/* Panel Header */}
              <div className="p-4 border-b border-cinema-gray-light">
                <h3 className="text-lg font-semibold text-white mb-3">Editor de Conteúdo</h3>

                {/* Panel Tabs */}
                <div className="grid grid-cols-2 gap-1 bg-cinema-dark rounded-lg p-1">
                  <button
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                      activeTab === 'widgets'
                        ? 'bg-cinema-yellow text-cinema-dark shadow-sm'
                        : 'text-gray-400 hover:text-white hover:bg-cinema-dark-lighter'
                    }`}
                    onClick={() => setActiveTab('widgets')}
                  >
                    <Grid3X3 className="w-4 h-4 mr-2 inline" />
                    Widgets
                  </button>
                  <button
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                      activeTab === 'templates'
                        ? 'bg-cinema-yellow text-cinema-dark shadow-sm'
                        : 'text-gray-400 hover:text-white hover:bg-cinema-dark-lighter'
                    }`}
                    onClick={() => setActiveTab('templates')}
                  >
                    <Layout className="w-4 h-4 mr-2 inline" />
                    Templates
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-1 bg-cinema-dark rounded-lg p-1 mt-2">
                  <button
                    className={`px-3 py-2 text-xs font-medium rounded-md transition-all ${
                      activeTab === 'products'
                        ? 'bg-cinema-yellow text-cinema-dark shadow-sm'
                        : 'text-gray-400 hover:text-white hover:bg-cinema-dark-lighter'
                    }`}
                    onClick={() => {
                      console.log('Switching to products tab');
                      setActiveTab('products');
                    }}
                  >
                    <Package className="w-3 h-3 mr-1 inline" />
                    Produtos
                  </button>
                  <button
                    className={`px-3 py-2 text-xs font-medium rounded-md transition-all ${
                      activeTab === 'layers'
                        ? 'bg-cinema-yellow text-cinema-dark shadow-sm'
                        : 'text-gray-400 hover:text-white hover:bg-cinema-dark-lighter'
                    }`}
                    onClick={() => setActiveTab('layers')}
                  >
                    <Layers className="w-3 h-3 mr-1 inline" />
                    Camadas
                  </button>
                  <button
                    className={`px-3 py-2 text-xs font-medium rounded-md transition-all ${
                      activeTab === 'pages'
                        ? 'bg-cinema-yellow text-cinema-dark shadow-sm'
                        : 'text-gray-400 hover:text-white hover:bg-cinema-dark-lighter'
                    }`}
                    onClick={() => setActiveTab('pages')}
                  >
                    <FileText className="w-3 h-3 mr-1 inline" />
                    Páginas
                  </button>
                </div>
              </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-y-auto bg-cinema-dark-lighter">
                {activeTab === 'widgets' && (
                  <div className="h-full flex flex-col">
                    {/* Search */}
                    <div className="p-4 pb-3 border-b border-cinema-gray-light/50">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Buscar widgets..."
                          className="pl-10 bg-cinema-dark border-cinema-gray-light text-white rounded-lg"
                        />
                      </div>
                    </div>

                    {/* Categories */}
                    <div className="p-4 pb-3">
                      <Label className="text-white text-sm font-medium mb-3 block">Categorias</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.keys(WIDGET_CATEGORIES).map((category) => (
                          <Button
                            key={category}
                            size="sm"
                            variant={activeWidgetCategory === category ? 'default' : 'outline'}
                            onClick={() => setActiveWidgetCategory(category)}
                            className={`text-xs justify-start ${
                              activeWidgetCategory === category
                                ? 'bg-cinema-yellow text-cinema-dark border-cinema-yellow'
                                : 'text-gray-300 border-cinema-gray-light hover:border-cinema-yellow hover:text-cinema-yellow'
                            }`}
                          >
                            {category.toLowerCase()}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Widgets List */}
                    <div className="flex-1 overflow-y-auto px-4 pb-4">
                      <Label className="text-white text-sm font-medium mb-3 block">
                        {activeWidgetCategory} ({WIDGET_CATEGORIES[activeWidgetCategory]?.length || 0})
                      </Label>
                      <div className="space-y-2">
                        {WIDGET_CATEGORIES[activeWidgetCategory]?.map((widget) => (
                          <DraggableWidget key={widget.type} widget={widget} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'templates' && (
                  <PageTemplates
                    onTemplateSelect={(template) => {
                      const newPage = {
                        ...currentPage,
                        elements: template.elements,
                        settings: template.settings
                      };
                      setCurrentPage(newPage);
                      addToHistory(newPage);
                      setActiveTab('widgets');
                    }}
                  />
                )}

                {activeTab === 'products' && (
                  <div className="h-full">
                    <div className="p-4 border-b border-cinema-gray-light/50">
                      <h3 className="text-lg font-semibold text-white">Adicionar Produtos</h3>
                      <p className="text-gray-400 text-xs mt-1">
                        Selecione produtos para adicionar à página
                      </p>
                    </div>
                    <div className="flex-1" style={{ height: 'calc(100% - 80px)' }}>
                      <ProductManager
                        mode="select"
                        onProductSelect={(product) => {
                          console.log('Product selected:', product);

                          try {
                            // Add product as a card widget
                            const productCard = {
                              id: generateId(),
                              type: WIDGET_TYPES.PRODUCT_CARD,
                              props: {
                                productId: product.id,
                                name: product.name,
                                description: product.description,
                                price: product.price,
                                image: product.image,
                                category: product.category,
                                showPrice: true,
                                showDescription: true,
                                buttonText: 'Ver Detalhes'
                              },
                              styles: {}
                            };

                            const newElements = [...currentPage.elements, productCard];
                            const updatedPage = {
                              ...currentPage,
                              elements: newElements
                            };

                            setCurrentPage(updatedPage);
                            addToHistory(updatedPage);
                            setSelectedElementId(productCard.id);

                            // Show success message
                            console.log('Product added to page successfully:', productCard);

                          } catch (error) {
                            console.error('Error adding product to page:', error);
                          }
                        }}
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'layers' && (
                  <div className="h-full flex flex-col">
                    <div className="p-4 border-b border-cinema-gray-light/50">
                      <h4 className="text-white font-medium flex items-center">
                        <Layers className="w-4 h-4 mr-2" />
                        Estrutura da Página
                      </h4>
                      <p className="text-gray-400 text-xs mt-1">
                        {currentPage.elements.length} elementos
                      </p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                      {currentPage.elements.length > 0 ? (
                        <div className="space-y-2">
                          {currentPage.elements.map((element, index) => (
                            <div
                              key={element.id}
                              className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                                selectedElementId === element.id
                                  ? 'bg-cinema-yellow text-cinema-dark shadow-sm'
                                  : 'bg-cinema-dark text-white hover:bg-cinema-dark-lighter border border-transparent hover:border-cinema-gray-light'
                              }`}
                              onClick={() => setSelectedElementId(element.id)}
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-6 h-6 bg-cinema-yellow/20 rounded flex items-center justify-center text-xs font-medium">
                                  {index + 1}
                                </div>
                                <span className="text-sm font-medium capitalize">
                                  {element.type.replace('_', ' ')}
                                </span>
                              </div>
                              <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-1 hover:bg-black/20 rounded">
                                  <Eye className="w-3 h-3" />
                                </button>
                                <button
                                  className="p-1 hover:bg-red-500 rounded"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteElement(element.id);
                                  }}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Layers className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-400 text-sm">Nenhum elemento adicionado</p>
                          <p className="text-gray-500 text-xs">Arraste widgets para começar</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'pages' && (
                  <div className="h-full flex flex-col">
                    <div className="p-4 border-b border-cinema-gray-light/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">Páginas do Site</h4>
                          <p className="text-gray-400 text-xs mt-1">
                            Gerencie suas páginas
                          </p>
                        </div>
                        <Button size="sm" className="bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark">
                          <Plus className="w-4 h-4 mr-1" />
                          Nova
                        </Button>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                      <div className="space-y-3">
                        {pages.map((page) => (
                          <div
                            key={page.id}
                            className={`group p-4 rounded-lg cursor-pointer transition-all border ${
                              currentPage.id === page.id
                                ? 'bg-cinema-yellow text-cinema-dark border-cinema-yellow shadow-sm'
                                : 'bg-cinema-dark text-white hover:bg-cinema-dark-lighter border-cinema-gray-light hover:border-cinema-yellow/50'
                            }`}
                            onClick={() => setCurrentPage(page)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="font-medium text-sm mb-1">{page.name}</div>
                                <div className="text-xs opacity-70 flex items-center">
                                  <Globe className="w-3 h-3 mr-1" />
                                  /{page.slug}
                                </div>
                                <div className="text-xs opacity-60 mt-1">
                                  {page.elements.length} elementos
                                </div>
                              </div>
                              <button className="p-2 hover:bg-black/20 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Center Panel - Canvas */}
            <div className="flex-1 bg-gray-100 relative overflow-auto">
              <div className="flex items-center justify-center min-h-full p-8">
                <div 
                  className={`bg-white shadow-2xl overflow-hidden ${
                    selectedDevice === 'mobile' ? 'w-96 min-h-screen' :
                    selectedDevice === 'tablet' ? 'w-2/3 min-h-screen' :
                    'w-full max-w-6xl min-h-screen'
                  }`}
                  style={{ backgroundColor: currentPage.settings.backgroundColor }}
                  onClick={() => setSelectedElementId(null)}
                >
                  {/* Canvas Content */}
                  <div className="relative">
                    <DropZone onDrop={addWidget} position={0} />
                    
                    {currentPage.elements.map((element, index) => (
                      <React.Fragment key={element.id}>
                        <PageElement
                          element={element}
                          isSelected={selectedElementId === element.id}
                          onSelect={setSelectedElementId}
                          onUpdate={updateElement}
                          onDelete={deleteElement}
                        />
                        <DropZone onDrop={addWidget} position={index + 1} />
                      </React.Fragment>
                    ))}

                    {/* Empty State */}
                    {currentPage.elements.length === 0 && (
                      <div className="text-center py-32">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Layout className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-medium text-gray-600 mb-2">
                          Página em Branco
                        </h3>
                        <p className="text-gray-400 mb-6">
                          Arraste widgets da barra lateral para começar a construir sua página
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Properties */}
            <div className="w-96 bg-cinema-dark-lighter border-l border-cinema-gray-light flex flex-col">
              <div className="p-4 border-b border-cinema-gray-light/50">
                <h3 className="text-lg font-semibold text-white">Propriedades</h3>
                <p className="text-gray-400 text-xs mt-1">
                  {selectedElement ? `Editando: ${selectedElement.type.replace('_', ' ')}` : 'Selecione um elemento'}
                </p>
              </div>
              <div className="flex-1 overflow-y-auto">
                <PropertiesPanel
                  selectedElement={selectedElement}
                  onUpdate={(updates) => selectedElementId && updateElement(selectedElementId, updates)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
};
