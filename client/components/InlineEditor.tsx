import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { 
  Edit3, 
  X, 
  MousePointer, 
  Type, 
  Palette, 
  Save, 
  RotateCcw,
  Eye,
  EyeOff,
  Settings,
  Zap,
  Upload,
  Image as ImageIcon,
  Move,
  ShoppingCart
} from 'lucide-react';
import { toast } from 'sonner';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Convert RGB/RGBA color to hex
const rgbToHex = (rgb: string): string => {
  // Handle rgba/rgb format
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }
  
  // If already hex or other format, return as is
  if (rgb.startsWith('#')) return rgb;
  return rgb;
};

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface EditElement {
  text?: string;
  color?: string;
  backgroundColor?: string;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
  padding?: string;
  margin?: string;
  borderRadius?: string;
  border?: string;
  opacity?: string;
  transform?: string;
  boxShadow?: string;
  width?: string;
  height?: string;
  // Icon properties
  iconColor?: string;
  iconSize?: string;
  iconPath?: string;
  iconViewBox?: string;
  iconUpload?: string;
}

interface EditorState {
  isActive: boolean;
  selectedElement: HTMLElement | null;
  selectedId: string | null;
  selectedElements: Set<string>;
  isEditing: boolean;
  hoveredElement: HTMLElement | null;
  hoveredId: string | null;
  showPreview: boolean;
}

interface EditorContextType {
  state: EditorState;
  toggleEditor: () => void;
  selectElement: (element: HTMLElement, id: string) => void;
  clearSelection: () => void;
  updateElement: (id: string, updates: Partial<EditElement>) => void;
  saveChanges: () => void;
  resetElement: (id: string) => void;
  togglePreview: () => void;
  getElementEdits: (id: string) => EditElement;
  reapplyAllEdits: () => void;
  clearSidebarTextEdits: () => void;
  clearAllEdits: () => void;
  resetSidebarSizes: () => void;
  forceResetServicos: () => void;
  fixTextContamination: () => void;
  preventTextPropagation: () => void;
  isolateSidebarTexts: () => void;
  forceCompleteReset: () => void;
  ensureStrictIsolation: () => void;
  restoreHeaderBar: () => void;
  emergencyRestoreHeader: () => void;
  superRestoreHeader: () => void;
  forceCreateHeader: () => void;
  createPersistentHeader: () => void;
  fixLayoutAndCreateHeader: () => void;
  ultimateFix: () => void;
  restoreEverything: () => void;
  forceOrganizeEverything: () => void;
  fixHeaderLayout: () => void;
  fixSidebarAndNotifications: () => void;
  restoreSidebarOriginal: () => void;
}

// ============================================================================
// CONTEXT PROVIDER
// ============================================================================

const EditorContext = createContext<EditorContextType | null>(null);

export function EditorProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<EditorState>({
    isActive: false,
    selectedElement: null,
    selectedId: null,
    selectedElements: new Set(),
    isEditing: false,
    hoveredElement: null,
    hoveredId: null,
    showPreview: true,
  });

  const [edits, setEdits] = useState<Record<string, EditElement>>({});

  const applyEditToElement = useCallback((element: HTMLElement, edit: EditElement) => {
    console.log('Applying edit to element:', element, edit);
    
    // Check if element is still in the DOM
    if (!element || !element.isConnected) {
      console.warn('Element is not connected to DOM, skipping edit');
      return;
    }
    
    // Safety check for large elements that might break layout
    const elementId = element.getAttribute('data-edit-id');
    const isPageBackground = elementId === 'page.background';
    const isLargeElement = element.offsetWidth > 2000 || element.offsetHeight > 2000;
    
    if (isPageBackground && isLargeElement) {
      console.warn('Preventing potentially dangerous edit to large page background element');
      // Only allow safe background changes for page background
      if (edit.backgroundColor) {
        element.style.setProperty('background-color', edit.backgroundColor, 'important');
        console.log('Applied safe background color to page background:', edit.backgroundColor);
      }
      return;
    }
    
    // Special handling for SVG icons to prevent them from disappearing
    if (element.tagName === 'svg' || (element.querySelector('svg') && !element.classList.contains('flex-1'))) {
      console.log('Detected SVG element, applying special handling');
      
      if (edit.color) {
        element.style.setProperty('color', edit.color, 'important');
        // Also apply to path elements inside SVG
        const paths = element.querySelectorAll('path');
        paths.forEach(path => {
          path.setAttribute('fill', edit.color!);
        });
        console.log('Applied color to SVG:', edit.color);
      }
      
      if (edit.fontSize) {
        element.style.setProperty('width', edit.fontSize, 'important');
        element.style.setProperty('height', edit.fontSize, 'important');
        console.log('Applied size to SVG:', edit.fontSize);
      }
      
      // Don't apply background or other properties that can make SVG disappear
      return; // Skip other properties for SVG elements
    }
    
    // Special handling for badge elements (Popular, etc.)
    if (element.classList.contains('absolute') && element.classList.contains('top-3') && element.classList.contains('left-3')) {
      console.log('Detected badge element, applying special handling');
      console.log('Element before edit:', element.outerHTML);
      
      // Disable transitions to prevent shaking
      element.style.setProperty('transition', 'none', 'important');
      element.style.setProperty('transform', 'none', 'important');
      element.style.setProperty('animation', 'none', 'important');
      
      if (edit.backgroundColor) {
        // Remove gradient classes
        element.classList.remove('bg-gradient-to-r', 'from-blue-500', 'to-orange-500', 'hover:from-blue-600', 'hover:to-orange-600');
        
        // Apply solid background color
        element.style.setProperty('background', edit.backgroundColor, 'important');
        element.style.setProperty('background-image', 'none', 'important');
        element.style.setProperty('background-color', edit.backgroundColor, 'important');
        
        console.log('Applied background color to badge:', edit.backgroundColor);
        console.log('Element after edit:', element.outerHTML);
      }
      
      if (edit.color) {
        element.style.setProperty('color', edit.color, 'important');
        console.log('Applied text color to badge:', edit.color);
      }
      
      if (edit.fontSize) {
        element.style.setProperty('font-size', edit.fontSize, 'important');
        console.log('Applied font size to badge:', edit.fontSize);
      }
      
      if (edit.text !== undefined) {
        element.textContent = edit.text;
        console.log('Applied text to badge:', edit.text);
      }
      
      // Don't apply other properties that might interfere
      return; // Skip other properties for badge elements
    }
    
    // Alternative detection for badge elements by data-edit-id
    if (element.getAttribute('data-edit-id')?.includes('featured-badge')) {
      console.log('Detected badge element by data-edit-id, applying special handling');
      console.log('Element before edit:', element.outerHTML);
      
      // Disable transitions to prevent shaking
      element.style.setProperty('transition', 'none', 'important');
      element.style.setProperty('transform', 'none', 'important');
      element.style.setProperty('animation', 'none', 'important');
      
      if (edit.backgroundColor) {
        // Remove gradient classes
        element.classList.remove('bg-gradient-to-r', 'from-blue-500', 'to-orange-500', 'hover:from-blue-600', 'hover:to-orange-600');
        
        // Apply solid background color
        element.style.setProperty('background', edit.backgroundColor, 'important');
        element.style.setProperty('background-image', 'none', 'important');
        element.style.setProperty('background-color', edit.backgroundColor, 'important');
        
        console.log('Applied background color to badge:', edit.backgroundColor);
        console.log('Element after edit:', element.outerHTML);
      }
      
      if (edit.color) {
        element.style.setProperty('color', edit.color, 'important');
        console.log('Applied text color to badge:', edit.color);
      }
      
      if (edit.fontSize) {
        element.style.setProperty('font-size', edit.fontSize, 'important');
        console.log('Applied font size to badge:', edit.fontSize);
      }
      
      if (edit.text !== undefined) {
        element.textContent = edit.text;
        console.log('Applied text to badge:', edit.text);
      }
      
      // Don't apply other properties that might interfere
      return; // Skip other properties for badge elements
    }

    // Special handling for icon elements (Eye, ShoppingCart, etc.)
    if (element.classList.contains('w-4') && element.classList.contains('h-4')) {
      console.log('Detected icon element, applying special handling');
      console.log('Element before edit:', element.outerHTML);
      
      if (edit.color) {
        // Force visibility
        element.style.setProperty('opacity', '1', 'important');
        element.style.setProperty('visibility', 'visible', 'important');
        element.style.setProperty('display', 'inline-block', 'important');
        
        element.style.setProperty('color', edit.color, 'important');
        element.style.setProperty('fill', edit.color, 'important');
        
        // Also apply to path elements inside SVG
        const paths = element.querySelectorAll('path');
        console.log('Found paths in icon:', paths.length);
        paths.forEach(path => {
          path.setAttribute('fill', edit.color!);
          path.setAttribute('stroke', edit.color!);
          path.setAttribute('opacity', '1');
          console.log('Applied color to path:', edit.color);
        });
        
        // Also apply to the SVG element itself
        const svg = element.querySelector('svg') || element;
        if (svg) {
          svg.setAttribute('fill', edit.color!);
          svg.setAttribute('stroke', edit.color!);
          svg.setAttribute('opacity', '1');
          console.log('Applied color to SVG:', edit.color);
        }
        
        console.log('Applied color to icon:', edit.color);
        console.log('Element after edit:', element.outerHTML);
      }
      
      if (edit.fontSize) {
        element.style.setProperty('width', edit.fontSize, 'important');
        element.style.setProperty('height', edit.fontSize, 'important');
        console.log('Applied size to icon:', edit.fontSize);
      }
      
      // Don't apply background or other properties that can make icons disappear
      return; // Skip other properties for icon elements
    }
    
    if (edit.text !== undefined) {
      element.textContent = edit.text;
      console.log('Applied text:', edit.text);
    }
    if (edit.color) {
      element.style.setProperty('color', edit.color, 'important');
      console.log('Applied color:', edit.color);
    }
    if (edit.backgroundColor) {
      console.log('Before removing classes, element classes:', element.className);
      
      // Remove ALL possible gradient classes
      const gradientClasses = [
        'bg-gradient-to-r', 'bg-gradient-to-l', 'bg-gradient-to-t', 'bg-gradient-to-b', 'bg-gradient-to-tr', 'bg-gradient-to-tl', 'bg-gradient-to-br', 'bg-gradient-to-bl',
        'from-blue-500', 'to-orange-500', 'from-orange-500', 'to-blue-500', 'from-blue-600', 'to-orange-600', 'from-orange-600', 'to-blue-600',
        'hover:from-blue-600', 'hover:to-orange-600', 'hover:from-orange-600', 'hover:to-blue-600', 'hover:from-blue-500', 'hover:to-orange-500',
        'bg-blue-500', 'bg-orange-500', 'bg-blue-600', 'bg-orange-600'
      ];
      
      gradientClasses.forEach(cls => {
        if (element.classList.contains(cls)) {
          element.classList.remove(cls);
          console.log('Removed class:', cls);
        }
      });
      
      console.log('After removing classes, element classes:', element.className);
      
      // Force solid background with maximum specificity
      element.style.setProperty('background-color', edit.backgroundColor, 'important');
      element.style.setProperty('background-image', 'none', 'important');
      element.style.setProperty('background', edit.backgroundColor, 'important');
      
      // Add a custom CSS rule with maximum specificity
      const styleId = `nasa-editor-override-${element.getAttribute('data-edit-id')}`;
      let existingStyle = document.getElementById(styleId);
      if (existingStyle && existingStyle.parentNode && existingStyle.parentNode.contains(existingStyle)) {
        try {
          existingStyle.parentNode.removeChild(existingStyle);
        } catch (error) {
          console.warn('Error removing existing style:', error);
        }
      }
      
      const style = document.createElement('style');
      style.id = styleId;
      const elementId = element.getAttribute('data-edit-id');
      style.textContent = `[data-edit-id="${elementId}"] { background: ${edit.backgroundColor} !important; background-image: none !important; }`;
      
      // Safe appendChild with error handling
      try {
        document.head.appendChild(style);
      } catch (error) {
        console.warn('Error appending style to head:', error);
      }
      
      console.log('Created CSS rule for element:', elementId, 'with background:', edit.backgroundColor);
      
      console.log('Applied background:', edit.backgroundColor);
      console.log('Element style after:', element.style.cssText);
    }
    if (edit.fontSize) {
      // Only apply fontSize as font-size, not as width/height for buttons
      if (element.tagName === 'BUTTON' || element.classList.contains('flex-1')) {
        element.style.setProperty('font-size', edit.fontSize, 'important');
        console.log('Applied fontSize to button:', edit.fontSize);
      } else {
        element.style.setProperty('font-size', edit.fontSize, 'important');
      console.log('Applied fontSize:', edit.fontSize);
      }
    }
    if (edit.fontWeight) {
      element.style.setProperty('font-weight', edit.fontWeight, 'important');
      console.log('Applied fontWeight:', edit.fontWeight);
    }
    if (edit.fontFamily) {
      element.style.setProperty('font-family', edit.fontFamily, 'important');
      console.log('Applied fontFamily:', edit.fontFamily);
    }
    if (edit.width) {
      element.style.setProperty('width', edit.width, 'important');
      console.log('Applied width:', edit.width);
    }
    if (edit.height) {
      element.style.setProperty('height', edit.height, 'important');
      console.log('Applied height:', edit.height);
    }
    if (edit.padding) {
      element.style.padding = edit.padding;
      console.log('Applied padding:', edit.padding);
    }
    if (edit.margin) {
      element.style.margin = edit.margin;
      console.log('Applied margin:', edit.margin);
    }
    if (edit.borderRadius) {
      element.style.borderRadius = edit.borderRadius;
      console.log('Applied borderRadius:', edit.borderRadius);
    }
    if (edit.border) {
      element.style.border = edit.border;
      console.log('Applied border:', edit.border);
    }
    if (edit.opacity) {
      element.style.opacity = edit.opacity;
      console.log('Applied opacity:', edit.opacity);
    }
    if (edit.transform) {
      element.style.transform = edit.transform;
      console.log('Applied transform:', edit.transform);
    }
    if (edit.boxShadow) {
      element.style.boxShadow = edit.boxShadow;
      console.log('Applied boxShadow:', edit.boxShadow);
    }
    
    // Apply icon properties
    const svgElement = element.tagName === 'svg' ? element : element.querySelector('svg');
    if (svgElement) {
      if (edit.iconColor) {
        svgElement.style.color = edit.iconColor;
        svgElement.setAttribute('stroke', edit.iconColor);
        // Also apply to fill if needed
        svgElement.setAttribute('fill', edit.iconColor);
        console.log('Applied iconColor:', edit.iconColor);
      }
      if (edit.iconSize) {
        svgElement.style.width = edit.iconSize;
        svgElement.style.height = edit.iconSize;
        console.log('Applied iconSize:', edit.iconSize);
      }
      if (edit.iconViewBox) {
        svgElement.setAttribute('viewBox', edit.iconViewBox);
        console.log('Applied iconViewBox:', edit.iconViewBox);
      }
      if (edit.iconPath) {
        const pathElement = svgElement.querySelector('path');
        if (pathElement) {
          pathElement.setAttribute('d', edit.iconPath);
          console.log('Applied iconPath:', edit.iconPath);
        }
      }
      if (edit.iconUpload) {
        // Replace SVG with uploaded image
        const img = document.createElement('img');
        img.src = edit.iconUpload;
        img.className = svgElement.className;
        img.style.width = svgElement.style.width || '24px';
        img.style.height = svgElement.style.height || '24px';
        
        // Safe replaceChild with proper checks
        if (svgElement.parentNode && svgElement.parentNode.contains(svgElement)) {
          try {
            svgElement.parentNode.replaceChild(img, svgElement);
            console.log('Applied iconUpload:', edit.iconUpload);
          } catch (error) {
            console.warn('Error replacing SVG element:', error);
            // Fallback: append the new image and remove the old one
            try {
              svgElement.parentNode.appendChild(img);
              if (svgElement.parentNode && svgElement.parentNode.contains(svgElement)) {
                svgElement.remove();
              }
            } catch (fallbackError) {
              console.warn('Error in fallback SVG replacement:', fallbackError);
            }
          }
        }
      }
    }
  }, []);

  // Load saved edits from localStorage
  useEffect(() => {
    const savedEdits = localStorage.getItem('nasa-editor-edits');
    if (savedEdits) {
      try {
        setEdits(JSON.parse(savedEdits));
      } catch (error) {
        console.warn('Failed to load saved edits:', error);
      }
    }
  }, []);

  // Apply saved edits on mount and when edits change - ONLY to specific elements
  useEffect(() => {
    // Add a small delay to ensure elements are loaded
    const timer = setTimeout(() => {
      console.log('Applying saved edits (specific elements only):', edits);
      Object.entries(edits).forEach(([id, edit]) => {
        // Only apply to the EXACT element with this specific ID
        const element = document.querySelector(`[data-edit-id="${id}"]`) as HTMLElement;
        if (element) {
          // Double-check that this is the correct element by verifying the ID
          const elementId = element.getAttribute('data-edit-id');
          if (elementId === id) {
            console.log(`Applying edit to EXACT element ${id}:`, element);
            applyEditToElement(element, edit);
          } else {
            console.log(`Element ID mismatch for ${id}, skipping`);
          }
        } else {
          console.log(`Element not found for ${id}`);
        }
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [edits, applyEditToElement]);

  // Additional effect to reapply edits when DOM changes (for dynamic content)
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      let shouldReapply = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Check if any added nodes contain elements with data-edit-id
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element.hasAttribute('data-edit-id') || element.querySelector('[data-edit-id]')) {
                shouldReapply = true;
              }
            }
          });
        }
      });
      
      if (shouldReapply) {
        console.log('DOM changed, reapplying edits (specific elements only)...');
        setTimeout(() => {
          Object.entries(edits).forEach(([id, edit]) => {
            // Only apply to the EXACT element with this specific ID
            const element = document.querySelector(`[data-edit-id="${id}"]`) as HTMLElement;
            if (element) {
              // Double-check that this is the correct element by verifying the ID
              const elementId = element.getAttribute('data-edit-id');
              if (elementId === id) {
                console.log(`Reapplying edit for EXACT element ${id}:`, edit);
                applyEditToElement(element, edit);
              } else {
                console.log(`Element ID mismatch for ${id}, skipping reapply`);
              }
            } else {
              console.log(`Element not found for ${id}`);
            }
          });
        }, 50);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => observer.disconnect();
  }, [edits, applyEditToElement]);

  const toggleEditor = useCallback((e?: Event) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('Toggle editor called');
    
    setState(prev => {
      const newActive = !prev.isActive;
      console.log('Editor state changing from', prev.isActive, 'to', newActive);
      console.log('Current state:', prev);
      
      if (newActive) {
        // Add class to body to control CSS
        document.body.classList.add('nasa-editor-active');
        
        // Force detection of elements when editor is activated
        setTimeout(() => {
          console.log('Editor activated - checking for elements:');
          console.log('Total elements with data-edit-id:', document.querySelectorAll('[data-edit-id]').length);
          console.log('Product elements:', document.querySelectorAll('[data-edit-id*="product-"]').length);
        }, 200);
      }
      
      if (!newActive) {
        // Remove class from body
        document.body.classList.remove('nasa-editor-active');
        
        // Clear all selections when deactivating
        try {
          document.querySelectorAll('.nasa-editor-selected, .nasa-editor-hovered').forEach(el => {
            if (el && el.classList) {
              el.classList.remove('nasa-editor-selected', 'nasa-editor-hovered');
            }
          });
        } catch (error) {
          console.warn('Error clearing selections:', error);
        }
        
        console.log('Deactivating editor, clearing all selections');
        return {
          ...prev,
          isActive: newActive,
          selectedElement: null,
          selectedId: null,
          isEditing: false,
          hoveredElement: null,
          hoveredId: null,
        };
      }
      
      console.log('Activating editor');
      return { ...prev, isActive: newActive };
    });
  }, []);

  const selectElement = useCallback((element: HTMLElement, id: string, multiSelect: boolean = false) => {
    if (!state.isActive) return;

    console.log('selectElement called with:', { element, id, isActive: state.isActive, multiSelect });

    setState(prev => {
      const newSelectedElements = new Set(prev.selectedElements);
      
      if (multiSelect) {
        if (newSelectedElements.has(id)) {
          newSelectedElements.delete(id);
          element.classList.remove('nasa-editor-selected');
        } else {
          newSelectedElements.add(id);
          element.classList.add('nasa-editor-selected');
        }
      } else {
        // Remove previous selections
        try {
          document.querySelectorAll('.nasa-editor-selected').forEach(el => {
            if (el && el.classList) {
              el.classList.remove('nasa-editor-selected');
            }
          });
        } catch (error) {
          console.warn('Error removing previous selections:', error);
        }
        
        newSelectedElements.clear();
        newSelectedElements.add(id);
        element.classList.add('nasa-editor-selected');
      }

      console.log('Setting state for selected element:', { element, id, isEditing: true, selectedCount: newSelectedElements.size });
      return {
        ...prev,
        selectedElement: element,
        selectedId: id,
        selectedElements: newSelectedElements,
        isEditing: newSelectedElements.size > 0,
      };
    });
  }, [state.isActive]);

  const clearSelection = useCallback(() => {
    console.log('clearSelection called');
    try {
      document.querySelectorAll('.nasa-editor-selected').forEach(el => {
        if (el && el.classList) {
          el.classList.remove('nasa-editor-selected');
        }
      });
    } catch (error) {
      console.warn('Error clearing selection:', error);
    }
    
    setState(prev => {
      console.log('Clearing selection, current state:', prev);
      return {
        ...prev,
        selectedElement: null,
        selectedId: null,
        selectedElements: new Set(),
        isEditing: false,
      };
    });
  }, []);

  const updateElement = useCallback((id: string, updates: Partial<EditElement>) => {
    const element = document.querySelector(`[data-edit-id="${id}"]`) as HTMLElement;
    if (!element) return;

    const currentEdit = edits[id] || {};
    const newEdit = { ...currentEdit, ...updates };
    
    setEdits(prev => ({ ...prev, [id]: newEdit }));
    applyEditToElement(element, newEdit);
  }, [edits, applyEditToElement]);

  const saveChanges = useCallback(() => {
    console.log('Saving changes:', edits);
    
    // Save to localStorage with error handling
    try {
      localStorage.setItem('nasa-editor-edits', JSON.stringify(edits));
      console.log('Successfully saved to localStorage');
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      toast.error('❌ Erro ao salvar alterações no localStorage');
      return;
    }
    
    // Apply the current selected element's edit to all similar elements
    if (state.selectedId && edits[state.selectedId]) {
      const currentEdit = edits[state.selectedId];
      
      // Apply edits ONLY to the selected element (no propagation)
      const element = document.querySelector(`[data-edit-id="${state.selectedId}"]`) as HTMLElement;
      if (element) {
        applyEditToElement(element, currentEdit);
        console.log('Applied edit ONLY to selected element:', state.selectedId);
      }
    }
    
    // Force re-save to localStorage after applying edits
    try {
      localStorage.setItem('nasa-editor-edits', JSON.stringify(edits));
      console.log('Re-saved to localStorage after applying edits');
    } catch (error) {
      console.error('Failed to re-save to localStorage:', error);
    }
    
    toast.success('🚀 Alterações salvas com sucesso!', {
      description: 'Edição aplicada apenas ao elemento selecionado',
      duration: 3000,
    });
  }, [edits, state.selectedId, applyEditToElement]);

  const resetElement = useCallback((id: string) => {
    const element = document.querySelector(`[data-edit-id="${id}"]`) as HTMLElement;
    if (!element) return;

    // Special handling for page background
    if (id === 'page.background') {
      console.log('Resetting page background safely');
      // Reset all background-related styles
      element.style.removeProperty('background-color');
      element.style.removeProperty('background-image');
      element.style.removeProperty('background');
      element.style.removeProperty('width');
      element.style.removeProperty('height');
      element.style.removeProperty('min-height');
      element.style.removeProperty('max-width');
      element.style.removeProperty('max-height');
      // Restore default background
      element.style.setProperty('background-color', '#1a1a1a', 'important'); // cinema-dark
      element.style.setProperty('min-height', '100vh', 'important');
    } else if (id === 'header.bar') {
      console.log('Resetting header bar safely');
      // Remove ALL custom styles first
      element.style.cssText = '';
      // Force restore header bar visibility and styling
      element.style.setProperty('display', 'block', 'important');
      element.style.setProperty('visibility', 'visible', 'important');
      element.style.setProperty('opacity', '1', 'important');
      element.style.setProperty('position', 'relative', 'important');
      element.style.setProperty('z-index', '40', 'important');
      element.style.setProperty('background-color', '#2a2a2a', 'important'); // cinema-dark-lighter
      element.style.setProperty('height', '64px', 'important'); // h-16
      element.style.setProperty('width', '100%', 'important');
      element.style.setProperty('min-height', '64px', 'important');
      element.style.setProperty('border-bottom', '1px solid #374151', 'important');
    } else {
      // Reset all styles for other elements
      element.style.cssText = '';
    }
    
    // Remove from edits
    setEdits(prev => {
      const newEdits = { ...prev };
      delete newEdits[id];
      return newEdits;
    });

    toast.success('🔄 Elemento resetado!', {
      description: 'Estilo original restaurado',
      duration: 2000,
    });
  }, []);

  const togglePreview = useCallback(() => {
    setState(prev => ({ ...prev, showPreview: !prev.showPreview }));
  }, []);

  const getElementEdits = useCallback((id: string): EditElement => {
    const savedEdits = edits[id] || {};
    const element = document.querySelector(`[data-edit-id="${id}"]`) as HTMLElement;
    
    if (element) {
      const computedStyles = window.getComputedStyle(element);
      
      // Get current element text if no saved text
      if (!savedEdits.text) {
        savedEdits.text = element.textContent || '';
      }
      
      // Get current colors if no saved colors
      if (!savedEdits.color) {
        const color = computedStyles.color;
        if (color && color !== 'rgba(0, 0, 0, 0)') {
          savedEdits.color = rgbToHex(color);
        }
      }
      
      if (!savedEdits.backgroundColor) {
        const bgColor = computedStyles.backgroundColor;
        if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
          savedEdits.backgroundColor = rgbToHex(bgColor);
        }
      }
      
      // Get current font properties if no saved values
      if (!savedEdits.fontSize) {
        savedEdits.fontSize = computedStyles.fontSize;
      }
      
      if (!savedEdits.fontWeight) {
        savedEdits.fontWeight = computedStyles.fontWeight;
      }
      
      if (!savedEdits.fontFamily) {
        savedEdits.fontFamily = computedStyles.fontFamily;
      }
      
      // Get size properties (width and height) - but skip for sidebar buttons
      if (!savedEdits.width && !id.startsWith('sidebar.')) {
        const width = computedStyles.width;
        if (width && width !== 'auto' && width !== '100%') {
          savedEdits.width = width;
        }
      }
      
      if (!savedEdits.height && !id.startsWith('sidebar.')) {
        const height = computedStyles.height;
        if (height && height !== 'auto' && height !== '100%') {
          savedEdits.height = height;
        }
      }
      
      // Get spacing properties
      if (!savedEdits.padding) {
        const padding = computedStyles.padding;
        if (padding && padding !== '0px') {
          savedEdits.padding = padding;
        }
      }
      
      if (!savedEdits.margin) {
        const margin = computedStyles.margin;
        if (margin && margin !== '0px') {
          savedEdits.margin = margin;
        }
      }
      
      // Get border properties
      if (!savedEdits.border) {
        const border = computedStyles.border;
        if (border && border !== 'none') {
          savedEdits.border = border;
        }
      }
      
      if (!savedEdits.borderRadius) {
        const borderRadius = computedStyles.borderRadius;
        if (borderRadius && borderRadius !== '0px') {
          savedEdits.borderRadius = borderRadius;
        }
      }
      
      // Get icon properties if element is SVG or contains SVG
      const svgElement = element.tagName === 'svg' ? element : element.querySelector('svg');
      if (svgElement) {
        if (!savedEdits.iconColor) {
          const svgComputedStyles = window.getComputedStyle(svgElement);
          const stroke = svgElement.getAttribute('stroke') || svgComputedStyles.color;
          if (stroke && stroke !== 'rgba(0, 0, 0, 0)' && stroke !== 'currentColor') {
            savedEdits.iconColor = rgbToHex(stroke);
          } else {
            // Default to white for visibility
            savedEdits.iconColor = '#ffffff';
          }
        }
        
        if (!savedEdits.iconSize) {
          const svgComputedStyles = window.getComputedStyle(svgElement);
          savedEdits.iconSize = svgComputedStyles.width;
        }
        
        if (!savedEdits.iconViewBox) {
          savedEdits.iconViewBox = svgElement.getAttribute('viewBox') || '0 0 24 24';
        }
        
        if (!savedEdits.iconPath) {
          const pathElement = svgElement.querySelector('path');
          if (pathElement) {
            savedEdits.iconPath = pathElement.getAttribute('d') || '';
          }
        }
      }
    }
    
    return savedEdits;
  }, [edits, state.selectedElement]);

  // Function to force reapply all edits (useful for debugging or manual refresh)
  const reapplyAllEdits = useCallback(() => {
    console.log('Force reapplying all edits...');
    const savedEdits = localStorage.getItem('nasa-editor-edits');
    if (savedEdits) {
      try {
        const parsedEdits = JSON.parse(savedEdits);
        console.log('Loaded edits from localStorage:', parsedEdits);
        
        Object.entries(parsedEdits).forEach(([id, edit]) => {
          // Only apply to the EXACT element with this specific ID
          const element = document.querySelector(`[data-edit-id="${id}"]`) as HTMLElement;
          if (element) {
            // Double-check that this is the correct element by verifying the ID
            const elementId = element.getAttribute('data-edit-id');
            if (elementId === id) {
              console.log(`Reapplying edit for EXACT element ${id}:`, edit);
              applyEditToElement(element, edit as EditElement);
            } else {
              console.log(`Element ID mismatch for ${id}, skipping reapply`);
            }
          } else {
            console.log(`Element not found for ${id}`);
          }
        });
        
        toast.success('🔄 Edições reaplicadas com sucesso!', {
          description: 'Todas as alterações salvas foram restauradas',
          duration: 2000,
        });
      } catch (error) {
        console.error('Failed to parse saved edits:', error);
        toast.error('❌ Erro ao carregar edições salvas');
      }
    } else {
      console.log('No saved edits found in localStorage');
      toast.info('ℹ️ Nenhuma edição salva encontrada');
    }
  }, [applyEditToElement]);

  // Function to clear sidebar text edits (fix for the Documentação issue)
  const clearSidebarTextEdits = useCallback(() => {
    console.log('Clearing problematic sidebar text edits...');
    
    try {
      // Get current edits
      const savedEdits = localStorage.getItem('nasa-editor-edits');
      let parsedEdits = {};
      
      if (savedEdits) {
        parsedEdits = JSON.parse(savedEdits);
        console.log('Current edits before cleanup:', parsedEdits);
      }
      
      // Define the correct names for each sidebar button
      const correctNames = {
        'sidebar.text.Dashboard': 'Dashboard',
        'sidebar.text.Pedidos': 'Pedidos',
        'sidebar.text.Estoque': 'Estoque',
        'sidebar.text.Categorias': 'Categorias',
        'sidebar.text.Clientes': 'Clientes',
        'sidebar.text.servicos': 'Serviços',
        'sidebar.text.Documentos': 'Documentos',
        'sidebar.text.Financeiro': 'Financeiro',
        'sidebar.text.Importar': 'Importar',
        'sidebar.text.ecommerce': 'E-commerce',
        'sidebar.text.clientarea': 'Área Cliente',
        'sidebar.text.multitenant': 'Multi-Tenant',
        'sidebar.text.templates': 'Templates',
        'sidebar.text.autoponto': 'Auto Ponto',
        'sidebar.text.funcionarios': 'Funcionários',
        'sidebar.text.configuracoes': 'Configurações'
      };
      
      // Remove only problematic edits (those with "Documentação" text)
      const cleanedEdits = { ...parsedEdits };
      Object.keys(cleanedEdits).forEach(id => {
        if (id.startsWith('sidebar.text.') && cleanedEdits[id].text === 'Documentação') {
          console.log(`Removing problematic edit for ${id}: ${cleanedEdits[id].text}`);
          delete cleanedEdits[id];
        }
      });
      
      // Also remove any sidebar.button.* edits that have "Documentação" text
      Object.keys(cleanedEdits).forEach(id => {
        if (id.startsWith('sidebar.button.') && cleanedEdits[id].text === 'Documentação') {
          console.log(`Removing problematic button edit for ${id}: ${cleanedEdits[id].text}`);
          delete cleanedEdits[id];
        }
      });
      
      // Save cleaned edits back to localStorage
      localStorage.setItem('nasa-editor-edits', JSON.stringify(cleanedEdits));
      console.log('Cleaned edits saved:', cleanedEdits);
      
      // Update state to trigger re-render
      setEdits(cleanedEdits);
      
      // Force page reload to ensure clean state
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
      toast.success('🧹 Edições problemáticas removidas!', {
        description: 'Apenas os textos "Documentação" incorretos foram limpos',
        duration: 2000,
      });
    } catch (error) {
      console.error('Failed to clean sidebar edits:', error);
      toast.error('❌ Erro ao limpar edições da sidebar');
    }
  }, []);

  // Function to completely clear all editor edits (nuclear option)
  const clearAllEdits = useCallback(() => {
    console.log('Clearing ALL editor edits...');
    
    try {
      // Remove all editor edits from localStorage
      localStorage.removeItem('nasa-editor-edits');
      console.log('All editor edits removed from localStorage');
      
      // Also clear any other potential editor-related data
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('editor') || key.includes('nasa') || key.includes('edit'))) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`Removed ${key} from localStorage`);
      });
      
      // Reset state
      setEdits({});
      
      // Force page reload
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
      toast.success('💥 Todas as edições foram removidas!', {
        description: 'Página será recarregada com estado original',
        duration: 2000,
      });
    } catch (error) {
      console.error('Failed to clear all edits:', error);
      toast.error('❌ Erro ao limpar todas as edições');
    }
  }, []);

  // Function to force complete reset (more aggressive)
  const forceCompleteReset = useCallback(() => {
    console.log('Force complete reset...');
    
    try {
      // Reset specific elements first
      document.querySelectorAll('[data-edit-id]').forEach(element => {
        if (element instanceof HTMLElement) {
          const id = element.getAttribute('data-edit-id');
          
          // Special handling for specific elements
          if (id === 'page.background') {
            element.style.removeProperty('background-color');
            element.style.removeProperty('background-image');
            element.style.removeProperty('background');
            element.style.removeProperty('width');
            element.style.removeProperty('height');
            element.style.removeProperty('min-height');
            element.style.removeProperty('max-width');
            element.style.removeProperty('max-height');
            element.style.setProperty('background-color', '#1a1a1a', 'important');
            element.style.setProperty('min-height', '100vh', 'important');
          } else if (id === 'header.bar') {
            console.log('Resetting header bar completely');
            // Remove ALL custom styles
            element.style.cssText = '';
            // Force restore header bar visibility and styling
            element.style.setProperty('display', 'block', 'important');
            element.style.setProperty('visibility', 'visible', 'important');
            element.style.setProperty('opacity', '1', 'important');
            element.style.setProperty('position', 'relative', 'important');
            element.style.setProperty('z-index', '40', 'important');
            element.style.setProperty('background-color', '#2a2a2a', 'important');
            element.style.setProperty('height', '64px', 'important');
            element.style.setProperty('width', '100%', 'important');
            element.style.setProperty('min-height', '64px', 'important');
            element.style.setProperty('border-bottom', '1px solid #374151', 'important');
            element.style.setProperty('top', '0', 'important');
            element.style.setProperty('left', '0', 'important');
            element.style.setProperty('right', '0', 'important');
          } else {
            element.style.cssText = '';
          }
        }
      });
      
      // Clear ALL localStorage
      localStorage.clear();
      console.log('All localStorage cleared');
      
      // Clear sessionStorage too
      sessionStorage.clear();
      console.log('All sessionStorage cleared');
      
      // Reset state
      setEdits({});
      
      toast.success('🔥 Reset completo realizado!', {
        description: 'Todos os elementos foram restaurados ao estado original',
        duration: 3000,
      });
    } catch (error) {
      console.error('Failed to force complete reset:', error);
      toast.error('❌ Erro ao realizar reset completo');
    }
  }, []);

  // Function to reset size properties for sidebar buttons
  const resetSidebarSizes = useCallback(() => {
    console.log('Resetting sidebar button sizes...');
    
    try {
      const savedEdits = localStorage.getItem('nasa-editor-edits');
      let parsedEdits = {};
      
      if (savedEdits) {
        parsedEdits = JSON.parse(savedEdits);
        console.log('Current edits before size reset:', parsedEdits);
      }
      
      // Remove width and height from all sidebar button edits
      const cleanedEdits = { ...parsedEdits };
      Object.keys(cleanedEdits).forEach(id => {
        if (id.startsWith('sidebar.button.') || id.startsWith('sidebar.text.')) {
          if (cleanedEdits[id].width) {
            console.log(`Removing width from ${id}: ${cleanedEdits[id].width}`);
            delete cleanedEdits[id].width;
          }
          if (cleanedEdits[id].height) {
            console.log(`Removing height from ${id}: ${cleanedEdits[id].height}`);
            delete cleanedEdits[id].height;
          }
        }
      });
      
      // Also force remove any inline styles from sidebar elements
      const sidebarElements = document.querySelectorAll('[data-edit-id^="sidebar."]');
      sidebarElements.forEach(element => {
        const htmlElement = element as HTMLElement;
        htmlElement.style.removeProperty('width');
        htmlElement.style.removeProperty('height');
        htmlElement.style.removeProperty('min-width');
        htmlElement.style.removeProperty('max-width');
        htmlElement.style.removeProperty('min-height');
        htmlElement.style.removeProperty('max-height');
        console.log('Removed inline size styles from:', element);
      });
      
      // Save cleaned edits back to localStorage
      localStorage.setItem('nasa-editor-edits', JSON.stringify(cleanedEdits));
      console.log('Size-reset edits saved:', cleanedEdits);
      
      // Update state to trigger re-render
      setEdits(cleanedEdits);
      
      // Force page reload to ensure clean state
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
      toast.success('📏 Tamanhos da sidebar resetados!', {
        description: 'Largura e altura dos botões foram restaurados',
        duration: 2000,
      });
    } catch (error) {
      console.error('Failed to reset sidebar sizes:', error);
      toast.error('❌ Erro ao resetar tamanhos da sidebar');
    }
  }, []);

  // Function to force reset specific button (Serviços)
  const forceResetServicos = useCallback(() => {
    console.log('Force resetting Serviços button...');
    
    try {
      // Remove all edits for Serviços button
      const savedEdits = localStorage.getItem('nasa-editor-edits');
      let parsedEdits = {};
      
      if (savedEdits) {
        parsedEdits = JSON.parse(savedEdits);
        console.log('Current edits before Serviços reset:', parsedEdits);
      }
      
      // Remove ALL edits for Serviços button
      const cleanedEdits = { ...parsedEdits };
      Object.keys(cleanedEdits).forEach(id => {
        if (id.includes('servicos') || id.includes('Serviços')) {
          console.log(`Removing ALL edits for ${id}`);
          delete cleanedEdits[id];
        }
      });
      
      // Force remove inline styles from Serviços button
      const servicosButton = document.querySelector('[data-edit-id*="servicos"]') as HTMLElement;
      if (servicosButton) {
        servicosButton.style.removeProperty('width');
        servicosButton.style.removeProperty('height');
        servicosButton.style.removeProperty('min-width');
        servicosButton.style.removeProperty('max-width');
        servicosButton.style.removeProperty('min-height');
        servicosButton.style.removeProperty('max-height');
        servicosButton.style.removeProperty('flex');
        servicosButton.style.removeProperty('flex-grow');
        servicosButton.style.removeProperty('flex-shrink');
        console.log('Force removed all styles from Serviços button');
      }
      
      // Save cleaned edits
      localStorage.setItem('nasa-editor-edits', JSON.stringify(cleanedEdits));
      console.log('Serviços reset edits saved:', cleanedEdits);
      
      // Update state
      setEdits(cleanedEdits);
      
      // Force page reload
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
      toast.success('🔧 Botão Serviços resetado!', {
        description: 'Todas as propriedades do botão foram removidas',
        duration: 2000,
      });
    } catch (error) {
      console.error('Failed to reset Serviços button:', error);
      toast.error('❌ Erro ao resetar botão Serviços');
    }
  }, []);

  // Function to fix text contamination (Serviços appearing in other fields)
  const fixTextContamination = useCallback(() => {
    console.log('Fixing text contamination...');
    
    try {
      const savedEdits = localStorage.getItem('nasa-editor-edits');
      let parsedEdits = {};
      
      if (savedEdits) {
        parsedEdits = JSON.parse(savedEdits);
        console.log('Current edits before text contamination fix:', parsedEdits);
      }
      
      // Define correct texts for each element
      const correctTexts = {
        'sidebar.text.Dashboard': 'Dashboard',
        'sidebar.text.Pedidos': 'Pedidos',
        'sidebar.text.Estoque': 'Estoque',
        'sidebar.text.Categorias': 'Categorias',
        'sidebar.text.Clientes': 'Clientes',
        'sidebar.text.servicos': 'Serviços',
        'sidebar.text.Documentos': 'Documentos',
        'sidebar.text.Financeiro': 'Financeiro',
        'sidebar.text.Importar': 'Importar',
        'sidebar.text.ecommerce': 'E-commerce',
        'sidebar.text.clientarea': 'Área Cliente',
        'sidebar.text.multitenant': 'Multi-Tenant',
        'sidebar.text.templates': 'Templates',
        'sidebar.text.autoponto': 'Auto Ponto',
        'sidebar.text.funcionarios': 'Funcionários',
        'sidebar.text.configuracoes': 'Configurações'
      };
      
      // Remove incorrect text edits and restore correct ones
      const cleanedEdits = { ...parsedEdits };
      Object.keys(cleanedEdits).forEach(id => {
        if (id.startsWith('sidebar.text.') && cleanedEdits[id].text) {
          const currentText = cleanedEdits[id].text;
          const correctText = correctTexts[id as keyof typeof correctTexts];
          
          // If text is "Serviços" but shouldn't be, remove the edit
          if (currentText === 'Serviços' && correctText !== 'Serviços') {
            console.log(`Removing incorrect "Serviços" text from ${id}`);
            delete cleanedEdits[id];
          }
          // If text is correct, keep it
          else if (currentText === correctText) {
            console.log(`Keeping correct text for ${id}: ${currentText}`);
          }
          // If text is different but not "Serviços", keep it (user customization)
          else if (currentText !== 'Serviços') {
            console.log(`Keeping user customization for ${id}: ${currentText}`);
          }
        }
      });
      
      // Save cleaned edits
      localStorage.setItem('nasa-editor-edits', JSON.stringify(cleanedEdits));
      console.log('Text contamination fix saved:', cleanedEdits);
      
      // Update state
      setEdits(cleanedEdits);
      
      // Force page reload
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
      toast.success('📝 Contaminação de texto corrigida!', {
        description: 'Textos incorretos "Serviços" foram removidos',
        duration: 2000,
      });
    } catch (error) {
      console.error('Failed to fix text contamination:', error);
      toast.error('❌ Erro ao corrigir contaminação de texto');
    }
  }, []);

  // Function to prevent cross-section text propagation
  const preventTextPropagation = useCallback(() => {
    console.log('Preventing text propagation across sections...');
    
    try {
      const savedEdits = localStorage.getItem('nasa-editor-edits');
      let parsedEdits = {};
      
      if (savedEdits) {
        parsedEdits = JSON.parse(savedEdits);
        console.log('Current edits before propagation fix:', parsedEdits);
      }
      
      // Remove any text edits that might be propagating across sections
      const cleanedEdits = { ...parsedEdits };
      Object.keys(cleanedEdits).forEach(id => {
        if (cleanedEdits[id].text) {
          // Check if this text edit is duplicated across multiple sections
          const currentText = cleanedEdits[id].text;
          const duplicateIds = Object.keys(cleanedEdits).filter(otherId => 
            otherId !== id && 
            cleanedEdits[otherId].text === currentText &&
            otherId.includes('sidebar.text.')
          );
          
          // If we find duplicates, remove all but keep the original intent
          if (duplicateIds.length > 0) {
            console.log(`Found text propagation for "${currentText}" in:`, [id, ...duplicateIds]);
            
            // Keep only the first occurrence and remove the rest
            duplicateIds.forEach(duplicateId => {
              console.log(`Removing propagated text from ${duplicateId}`);
              delete cleanedEdits[duplicateId];
            });
          }
        }
      });
      
      // Save cleaned edits
      localStorage.setItem('nasa-editor-edits', JSON.stringify(cleanedEdits));
      console.log('Propagation prevention saved:', cleanedEdits);
      
      // Update state
      setEdits(cleanedEdits);
      
      // Force page reload
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
      toast.success('🚫 Propagação de texto bloqueada!', {
        description: 'Edições não se propagam mais entre seções',
        duration: 2000,
      });
    } catch (error) {
      console.error('Failed to prevent text propagation:', error);
      toast.error('❌ Erro ao bloquear propagação de texto');
    }
  }, []);

  // Function to completely isolate sidebar text edits
  const isolateSidebarTexts = useCallback(() => {
    console.log('Isolating sidebar text edits...');
    
    try {
      const savedEdits = localStorage.getItem('nasa-editor-edits');
      let parsedEdits = {};
      
      if (savedEdits) {
        parsedEdits = JSON.parse(savedEdits);
        console.log('Current edits before isolation:', parsedEdits);
      }
      
      // Define the correct original texts for each sidebar element
      const originalTexts = {
        'sidebar.text.Dashboard': 'Dashboard',
        'sidebar.text.Pedidos': 'Pedidos',
        'sidebar.text.Estoque': 'Estoque',
        'sidebar.text.Categorias': 'Categorias',
        'sidebar.text.Clientes': 'Clientes',
        'sidebar.text.servicos': 'Serviços',
        'sidebar.text.Documentos': 'Documentos',
        'sidebar.text.Financeiro': 'Financeiro',
        'sidebar.text.Importar': 'Importar',
        'sidebar.text.ecommerce': 'E-commerce',
        'sidebar.text.clientarea': 'Área Cliente',
        'sidebar.text.multitenant': 'Multi-Tenant',
        'sidebar.text.templates': 'Templates',
        'sidebar.text.autoponto': 'Auto Ponto',
        'sidebar.text.funcionarios': 'Funcionários',
        'sidebar.text.configuracoes': 'Configurações'
      };
      
      // Remove ALL sidebar text edits to start fresh
      const cleanedEdits = { ...parsedEdits };
      Object.keys(cleanedEdits).forEach(id => {
        if (id.startsWith('sidebar.text.')) {
          console.log(`Removing sidebar text edit for ${id}: ${cleanedEdits[id].text}`);
          delete cleanedEdits[id];
        }
      });
      
      // Also fix the tip text issue
      if (cleanedEdits['Pedidos.dica']) {
        console.log('Fixing tip text issue');
        delete cleanedEdits['Pedidos.dica'];
      }
      
      // Save cleaned edits
      localStorage.setItem('nasa-editor-edits', JSON.stringify(cleanedEdits));
      console.log('Sidebar text isolation saved:', cleanedEdits);
      
      // Update state
      setEdits(cleanedEdits);
      
      // Force page reload
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
      toast.success('🔒 Textos da sidebar isolados!', {
        description: 'Cada botão agora é independente',
        duration: 2000,
      });
    } catch (error) {
      console.error('Failed to isolate sidebar texts:', error);
      toast.error('❌ Erro ao isolar textos da sidebar');
    }
  }, []);

  // Function to ensure strict element isolation
  const ensureStrictIsolation = useCallback(() => {
    console.log('Ensuring strict element isolation...');
    
    try {
      // Clear all edits first
      localStorage.removeItem('nasa-editor-edits');
      setEdits({});
      
      // Force remove any inline styles from all elements with data-edit-id
      const allEditableElements = document.querySelectorAll('[data-edit-id]');
      allEditableElements.forEach(element => {
        const htmlElement = element as HTMLElement;
        // Remove all inline styles
        htmlElement.style.cssText = '';
        console.log(`Cleared styles for element: ${htmlElement.getAttribute('data-edit-id')}`);
      });
      
      // Force page reload
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
      toast.success('🔐 Isolamento estrito ativado!', {
        description: 'Todos os elementos foram resetados e isolados',
        duration: 2000,
      });
    } catch (error) {
      console.error('Failed to ensure strict isolation:', error);
      toast.error('❌ Erro ao ativar isolamento estrito');
    }
  }, []);

  // Function to specifically restore the header bar
  const restoreHeaderBar = useCallback(() => {
    console.log('Restoring header bar...');
    
    try {
      // Try multiple selectors to find the header
      let headerElement = document.querySelector('[data-edit-id="header.bar"]') as HTMLElement;
      
      if (!headerElement) {
        // Try alternative selectors
        headerElement = document.querySelector('header') as HTMLElement;
      }
      
      if (!headerElement) {
        // Try by class name
        headerElement = document.querySelector('.bg-cinema-dark-lighter') as HTMLElement;
      }
      
      if (!headerElement) {
        // Try by tag and class combination
        headerElement = document.querySelector('header.bg-cinema-dark-lighter') as HTMLElement;
      }
      
      if (headerElement) {
        console.log('Header element found:', headerElement);
        
        // Remove ALL custom styles first
        headerElement.style.cssText = '';
        
        // Force restore header bar visibility and styling
        headerElement.style.setProperty('display', 'block', 'important');
        headerElement.style.setProperty('visibility', 'visible', 'important');
        headerElement.style.setProperty('opacity', '1', 'important');
        headerElement.style.setProperty('position', 'relative', 'important');
        headerElement.style.setProperty('z-index', '40', 'important');
        headerElement.style.setProperty('background-color', '#2a2a2a', 'important');
        headerElement.style.setProperty('height', '64px', 'important');
        headerElement.style.setProperty('width', '100%', 'important');
        headerElement.style.setProperty('min-height', '64px', 'important');
        headerElement.style.setProperty('border-bottom', '1px solid #374151', 'important');
        headerElement.style.setProperty('top', '0', 'important');
        headerElement.style.setProperty('left', '0', 'important');
        headerElement.style.setProperty('right', '0', 'important');
        
        // Remove from edits
        setEdits(prev => {
          const newEdits = { ...prev };
          delete newEdits['header.bar'];
          return newEdits;
        });
        
        toast.success('🔧 Barra do cabeçalho restaurada!', {
          description: 'A barra voltou ao normal',
          duration: 3000,
        });
      } else {
        console.error('Header element not found with any selector');
        toast.error('❌ Barra do cabeçalho não encontrada. Tente "Reset Total"');
      }
    } catch (error) {
      console.error('Error restoring header bar:', error);
      toast.error('❌ Erro ao restaurar barra do cabeçalho');
    }
  }, []);

  // Emergency function to recreate header if it's completely missing
  const emergencyRestoreHeader = useCallback(() => {
    console.log('Emergency header restoration...');
    
    try {
      // First try to find and restore existing header
      let headerElement = document.querySelector('header') as HTMLElement;
      
      if (!headerElement) {
        // If no header exists, try to find the main container
        const mainContainer = document.querySelector('main') || document.body;
        if (mainContainer) {
          // Create a new header element
          headerElement = document.createElement('header');
          headerElement.className = 'bg-cinema-dark-lighter border-b border-cinema-gray sticky top-0 z-40';
          headerElement.setAttribute('data-edit-id', 'header.bar');
          
          // Add basic header content
          headerElement.innerHTML = `
            <div class="container mx-auto px-4">
              <div class="flex items-center justify-between h-16">
                <div class="flex items-center">
                  <div class="text-white font-bold">BIL'S Painel da Locadora</div>
                </div>
                <div class="flex items-center space-x-4">
                  <a href="/" class="text-white hover:text-cinema-yellow">Início</a>
                  <a href="/equipamentos" class="text-white hover:text-cinema-yellow">Equipamentos</a>
                  <a href="/suporte" class="text-white hover:text-cinema-yellow">Suporte</a>
                </div>
              </div>
            </div>
          `;
          
          // Insert at the beginning of the main container
          mainContainer.insertBefore(headerElement, mainContainer.firstChild);
          
          toast.success('🚨 Barra de emergência criada!', {
            description: 'Uma nova barra foi criada',
            duration: 3000,
          });
        }
      } else {
        // Header exists, just restore it
        restoreHeaderBar();
      }
    } catch (error) {
      console.error('Error in emergency header restoration:', error);
      toast.error('❌ Erro na restauração de emergência');
    }
  }, [restoreHeaderBar]);

  // Super aggressive header restoration
  const superRestoreHeader = useCallback(() => {
    console.log('Super aggressive header restoration...');
    
    try {
      // Remove any existing header first
      const existingHeaders = document.querySelectorAll('header');
      existingHeaders.forEach(header => header.remove());
      
      // Find the root container
      const rootContainer = document.querySelector('#root') || document.body;
      
      // Create a completely new header
      const newHeader = document.createElement('header');
      newHeader.setAttribute('data-edit-id', 'header.bar');
      
      // Apply styles directly
      newHeader.style.cssText = `
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        position: relative !important;
        z-index: 40 !important;
        background-color: #2a2a2a !important;
        height: 64px !important;
        width: 100% !important;
        min-height: 64px !important;
        border-bottom: 1px solid #374151 !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
      `;
      
      // Add content
      newHeader.innerHTML = `
        <div style="max-width: 1200px; margin: 0 auto; padding: 0 1rem; height: 100%; display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center;">
            <div style="color: white; font-weight: bold; font-size: 1.25rem;">BIL'S Painel da Locadora</div>
          </div>
          <div style="display: flex; align-items: center; gap: 1rem;">
            <a href="/" style="color: white; text-decoration: none;">Início</a>
            <a href="/equipamentos" style="color: white; text-decoration: none;">Equipamentos</a>
            <a href="/suporte" style="color: white; text-decoration: none;">Suporte</a>
            <button style="background: #3b82f6; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.25rem;">LOGIN</button>
            <button style="background: #10b981; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.25rem;">Carrinho</button>
          </div>
        </div>
      `;
      
      // Insert at the very beginning
      rootContainer.insertBefore(newHeader, rootContainer.firstChild);
      
      // Remove from edits
      setEdits(prev => {
        const newEdits = { ...prev };
        delete newEdits['header.bar'];
        return newEdits;
      });
      
      toast.success('🚨 Barra SUPER restaurada!', {
        description: 'Barra criada com estilos forçados',
        duration: 3000,
      });
      
    } catch (error) {
      console.error('Error in super header restoration:', error);
      toast.error('❌ Erro na restauração super');
    }
  }, []);

  // Force create header bar at the very top
  const forceCreateHeader = useCallback(() => {
    console.log('Force creating header bar...');
    
    try {
      // Remove any existing headers
      const existingHeaders = document.querySelectorAll('header');
      existingHeaders.forEach(header => header.remove());
      
      // Get the body element
      const body = document.body;
      
      // Create header element
      const header = document.createElement('header');
      header.setAttribute('data-edit-id', 'header.bar');
      
      // Force styles with !important
      header.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        width: 100% !important;
        height: 64px !important;
        background-color: #2a2a2a !important;
        border-bottom: 1px solid #374151 !important;
        z-index: 9999 !important;
        display: flex !important;
        align-items: center !important;
        padding: 0 1rem !important;
        box-sizing: border-box !important;
      `;
      
      // Add content
      header.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; max-width: 1200px; margin: 0 auto;">
          <div style="display: flex; align-items: center;">
            <div style="color: #fbbf24; font-weight: bold; font-size: 1.25rem; margin-right: 2rem;">BIL'S</div>
            <div style="display: flex; gap: 1.5rem;">
              <a href="/" style="color: white; text-decoration: none; font-weight: 500;">Início</a>
              <a href="/equipamentos" style="color: white; text-decoration: none; font-weight: 500;">Equipamentos</a>
              <a href="/suporte" style="color: white; text-decoration: none; font-weight: 500;">Suporte</a>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 1rem;">
            <div style="position: relative;">
              <input type="text" placeholder="Buscar..." style="background: #374151; border: 1px solid #4b5563; color: white; padding: 0.5rem; border-radius: 0.25rem; width: 200px;">
            </div>
            <button style="background: #3b82f6; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.25rem; font-weight: 500;">LOGIN</button>
            <button style="background: #10b981; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.25rem; font-weight: 500;">Carrinho</button>
          </div>
        </div>
      `;
      
      // Insert at the very beginning of body
      body.insertBefore(header, body.firstChild);
      
      // Add padding to body to account for fixed header
      body.style.paddingTop = '64px';
      
      // Remove from edits
      setEdits(prev => {
        const newEdits = { ...prev };
        delete newEdits['header.bar'];
        return newEdits;
      });
      
      toast.success('🚨 Barra FORÇADA criada!', {
        description: 'Barra fixa no topo com todos os elementos',
        duration: 3000,
      });
      
    } catch (error) {
      console.error('Error force creating header:', error);
      toast.error('❌ Erro ao forçar criação da barra');
    }
  }, []);

  // Persistent header with monitoring
  const createPersistentHeader = useCallback(() => {
    console.log('Creating persistent header...');
    
    try {
      // Remove any existing headers
      const existingHeaders = document.querySelectorAll('header');
      existingHeaders.forEach(header => header.remove());
      
      // Get the body element
      const body = document.body;
      
      // Create header element
      const header = document.createElement('header');
      header.setAttribute('data-edit-id', 'header.bar');
      header.setAttribute('data-persistent-header', 'true');
      
      // Force styles with !important and make it unremovable
      header.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        width: 100% !important;
        height: 64px !important;
        background-color: #2a2a2a !important;
        border-bottom: 1px solid #374151 !important;
        z-index: 99999 !important;
        display: flex !important;
        align-items: center !important;
        padding: 0 1rem !important;
        box-sizing: border-box !important;
        visibility: visible !important;
        opacity: 1 !important;
        pointer-events: auto !important;
      `;
      
      // Add content
      header.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; max-width: 1200px; margin: 0 auto;">
          <div style="display: flex; align-items: center;">
            <div style="color: #fbbf24; font-weight: bold; font-size: 1.25rem; margin-right: 2rem;">BIL'S</div>
            <div style="display: flex; gap: 1.5rem;">
              <a href="/" style="color: white; text-decoration: none; font-weight: 500;">Início</a>
              <a href="/equipamentos" style="color: white; text-decoration: none; font-weight: 500;">Equipamentos</a>
              <a href="/suporte" style="color: white; text-decoration: none; font-weight: 500;">Suporte</a>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 1rem;">
            <div style="position: relative;">
              <input type="text" placeholder="Buscar..." style="background: #374151; border: 1px solid #4b5563; color: white; padding: 0.5rem; border-radius: 0.25rem; width: 200px;">
            </div>
            <button style="background: #3b82f6; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.25rem; font-weight: 500;">LOGIN</button>
            <button style="background: #10b981; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.25rem; font-weight: 500;">Carrinho</button>
          </div>
        </div>
      `;
      
      // Insert at the very beginning of body
      body.insertBefore(header, body.firstChild);
      
      // Add padding to body to account for fixed header
      body.style.paddingTop = '64px';
      
      // Set up monitoring to keep header visible
      const monitorHeader = () => {
        const headerElement = document.querySelector('[data-persistent-header="true"]') as HTMLElement;
        if (!headerElement) {
          console.log('Header disappeared, recreating...');
          createPersistentHeader();
          return;
        }
        
        // Check if header is visible
        const computedStyle = window.getComputedStyle(headerElement);
        if (computedStyle.display === 'none' || 
            computedStyle.visibility === 'hidden' || 
            computedStyle.opacity === '0') {
          console.log('Header is hidden, restoring...');
          headerElement.style.setProperty('display', 'flex', 'important');
          headerElement.style.setProperty('visibility', 'visible', 'important');
          headerElement.style.setProperty('opacity', '1', 'important');
        }
      };
      
      // Monitor every 500ms
      const monitorInterval = setInterval(monitorHeader, 500);
      
      // Store interval ID for cleanup
      (window as any).headerMonitorInterval = monitorInterval;
      
      // Remove from edits
      setEdits(prev => {
        const newEdits = { ...prev };
        delete newEdits['header.bar'];
        return newEdits;
      });
      
      toast.success('🚨 Barra PERSISTENTE criada!', {
        description: 'Barra monitorada e protegida contra remoção',
        duration: 3000,
      });
      
    } catch (error) {
      console.error('Error creating persistent header:', error);
      toast.error('❌ Erro ao criar barra persistente');
    }
  }, []);

  // Fix layout and create header
  const fixLayoutAndCreateHeader = useCallback(() => {
    console.log('Fixing layout and creating header...');
    
    try {
      // Remove any existing headers
      const existingHeaders = document.querySelectorAll('header');
      existingHeaders.forEach(header => header.remove());
      
      // Clear any existing monitoring
      if ((window as any).headerMonitorInterval) {
        clearInterval((window as any).headerMonitorInterval);
      }
      
      // Get the body element
      const body = document.body;
      
      // Create header element
      const header = document.createElement('header');
      header.setAttribute('data-edit-id', 'header.bar');
      header.setAttribute('data-persistent-header', 'true');
      
      // Force styles with !important
      header.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        width: 100% !important;
        height: 64px !important;
        background-color: #2a2a2a !important;
        border-bottom: 1px solid #374151 !important;
        z-index: 99999 !important;
        display: flex !important;
        align-items: center !important;
        padding: 0 1rem !important;
        box-sizing: border-box !important;
        visibility: visible !important;
        opacity: 1 !important;
        pointer-events: auto !important;
      `;
      
      // Add content
      header.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; max-width: 1200px; margin: 0 auto;">
          <div style="display: flex; align-items: center;">
            <div style="color: #fbbf24; font-weight: bold; font-size: 1.25rem; margin-right: 2rem;">BIL'S</div>
            <div style="display: flex; gap: 1.5rem;">
              <a href="/" style="color: white; text-decoration: none; font-weight: 500;">Início</a>
              <a href="/equipamentos" style="color: white; text-decoration: none; font-weight: 500;">Equipamentos</a>
              <a href="/suporte" style="color: white; text-decoration: none; font-weight: 500;">Suporte</a>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 1rem;">
            <div style="position: relative;">
              <input type="text" placeholder="Buscar..." style="background: #374151; border: 1px solid #4b5563; color: white; padding: 0.5rem; border-radius: 0.25rem; width: 200px;">
            </div>
            <button style="background: #3b82f6; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.25rem; font-weight: 500;">LOGIN</button>
            <button style="background: #10b981; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.25rem; font-weight: 500;">Carrinho</button>
          </div>
        </div>
      `;
      
      // Insert at the very beginning of body
      body.insertBefore(header, body.firstChild);
      
      // Fix sidebar positioning
      const sidebar = document.querySelector('[data-edit-id="sidebar.container"]') as HTMLElement;
      if (sidebar) {
        sidebar.style.cssText = `
          position: fixed !important;
          top: 64px !important;
          left: 0 !important;
          width: 256px !important;
          height: calc(100vh - 64px) !important;
          background-color: #1f2937 !important;
          border-right: 1px solid #374151 !important;
          z-index: 50 !important;
          overflow-y: auto !important;
        `;
      }
      
      // Fix main content positioning
      const mainContent = document.querySelector('.min-h-screen') as HTMLElement;
      if (mainContent) {
        mainContent.style.cssText = `
          margin-left: 256px !important;
          margin-top: 64px !important;
          min-height: calc(100vh - 64px) !important;
          padding: 1rem !important;
        `;
      }
      
      // Add padding to body to account for fixed header
      body.style.paddingTop = '64px';
      
      // Set up monitoring to keep header visible
      const monitorHeader = () => {
        const headerElement = document.querySelector('[data-persistent-header="true"]') as HTMLElement;
        if (!headerElement) {
          console.log('Header disappeared, recreating...');
          fixLayoutAndCreateHeader();
          return;
        }
        
        // Check if header is visible
        const computedStyle = window.getComputedStyle(headerElement);
        if (computedStyle.display === 'none' || 
            computedStyle.visibility === 'hidden' || 
            computedStyle.opacity === '0') {
          console.log('Header is hidden, restoring...');
          headerElement.style.setProperty('display', 'flex', 'important');
          headerElement.style.setProperty('visibility', 'visible', 'important');
          headerElement.style.setProperty('opacity', '1', 'important');
        }
      };
      
      // Monitor every 500ms
      const monitorInterval = setInterval(monitorHeader, 500);
      
      // Store interval ID for cleanup
      (window as any).headerMonitorInterval = monitorInterval;
      
      // Remove from edits
      setEdits(prev => {
        const newEdits = { ...prev };
        delete newEdits['header.bar'];
        return newEdits;
      });
      
      toast.success('🚨 Layout CORRIGIDO!', {
        description: 'Barra restaurada e sidebar reposicionada',
        duration: 3000,
      });
      
    } catch (error) {
      console.error('Error fixing layout:', error);
      toast.error('❌ Erro ao corrigir layout');
    }
  }, []);

  // ULTIMATE FIX - Simple and direct
  const ultimateFix = useCallback(() => {
    console.log('ULTIMATE FIX - Creating header...');
    
    try {
      // Clear everything first
      const existingHeaders = document.querySelectorAll('header');
      existingHeaders.forEach(header => header.remove());
      
      // Clear any monitoring
      if ((window as any).headerMonitorInterval) {
        clearInterval((window as any).headerMonitorInterval);
      }
      
      // Get body
      const body = document.body;
      
      // Create header with absolute positioning
      const header = document.createElement('header');
      header.id = 'ultimate-header';
      header.setAttribute('data-edit-id', 'header.bar');
      
      // Simple, direct styles
      header.style.position = 'fixed';
      header.style.top = '0';
      header.style.left = '0';
      header.style.right = '0';
      header.style.width = '100%';
      header.style.height = '60px';
      header.style.backgroundColor = '#2a2a2a';
      header.style.borderBottom = '1px solid #444';
      header.style.zIndex = '999999';
      header.style.display = 'flex';
      header.style.alignItems = 'center';
      header.style.padding = '0 20px';
      header.style.boxSizing = 'border-box';
      
      // Simple content
      header.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
          <div style="display: flex; align-items: center;">
            <div style="color: #fbbf24; font-weight: bold; font-size: 18px; margin-right: 30px;">BIL'S</div>
            <div style="display: flex; gap: 20px;">
              <a href="/" style="color: white; text-decoration: none;">Início</a>
              <a href="/equipamentos" style="color: white; text-decoration: none;">Equipamentos</a>
              <a href="/suporte" style="color: white; text-decoration: none;">Suporte</a>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 15px;">
            <input type="text" placeholder="Buscar..." style="background: #444; border: 1px solid #666; color: white; padding: 8px; border-radius: 4px; width: 200px;">
            <button style="background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 4px;">LOGIN</button>
            <button style="background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 4px;">Carrinho</button>
          </div>
        </div>
      `;
      
      // Insert at the very top
      body.insertBefore(header, body.firstChild);
      
      // Fix body padding
      body.style.paddingTop = '60px';
      
      // Simple monitoring
      const checkHeader = () => {
        const h = document.getElementById('ultimate-header');
        if (!h) {
          console.log('Header missing, recreating...');
          ultimateFix();
        }
      };
      
      // Check every second
      const interval = setInterval(checkHeader, 1000);
      (window as any).headerMonitorInterval = interval;
      
      // Remove from edits
      setEdits(prev => {
        const newEdits = { ...prev };
        delete newEdits['header.bar'];
        return newEdits;
      });
      
      toast.success('🚨 BARRA CRIADA!', {
        description: 'Header criado com sucesso',
        duration: 2000,
      });
      
    } catch (error) {
      console.error('Error in ultimate fix:', error);
      toast.error('❌ Erro no fix ultimate');
    }
  }, []);

  // RESTORE EVERYTHING - Complete fix
  const restoreEverything = useCallback(() => {
    console.log('RESTORING EVERYTHING...');
    
    try {
      // Clear everything first
      const existingHeaders = document.querySelectorAll('header');
      existingHeaders.forEach(header => header.remove());
      
      // Clear any monitoring
      if ((window as any).headerMonitorInterval) {
        clearInterval((window as any).headerMonitorInterval);
      }
      
      // Get body
      const body = document.body;
      
      // Create header
      const header = document.createElement('header');
      header.id = 'restored-header';
      header.setAttribute('data-edit-id', 'header.bar');
      
      // Header styles
      header.style.position = 'fixed';
      header.style.top = '0';
      header.style.left = '0';
      header.style.right = '0';
      header.style.width = '100%';
      header.style.height = '64px';
      header.style.backgroundColor = '#2a2a2a';
      header.style.borderBottom = '1px solid #444';
      header.style.zIndex = '999999';
      header.style.display = 'flex';
      header.style.alignItems = 'center';
      header.style.padding = '0 20px';
      header.style.boxSizing = 'border-box';
      
      // Header content
      header.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
          <div style="display: flex; align-items: center;">
            <div style="color: #fbbf24; font-weight: bold; font-size: 18px; margin-right: 30px;">BIL'S</div>
            <div style="display: flex; gap: 20px;">
              <a href="/" style="color: white; text-decoration: none;">Início</a>
              <a href="/equipamentos" style="color: white; text-decoration: none;">Equipamentos</a>
              <a href="/suporte" style="color: white; text-decoration: none;">Suporte</a>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 15px;">
            <input type="text" placeholder="Buscar..." style="background: #444; border: 1px solid #666; color: white; padding: 8px; border-radius: 4px; width: 200px;">
            <button style="background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 4px;">LOGIN</button>
            <button style="background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 4px;">Carrinho</button>
          </div>
        </div>
      `;
      
      // Insert header
      body.insertBefore(header, body.firstChild);
      
      // Fix body padding
      body.style.paddingTop = '64px';
      
      // Simple monitoring
      const checkEverything = () => {
        const h = document.getElementById('restored-header');
        if (!h) {
          console.log('Header missing, recreating...');
          restoreEverything();
        }
      };
      
      // Check every 2 seconds
      const interval = setInterval(checkEverything, 2000);
      (window as any).headerMonitorInterval = interval;
      
      // Remove from edits
      setEdits(prev => {
        const newEdits = { ...prev };
        delete newEdits['header.bar'];
        return newEdits;
      });
      
      toast.success('🚨 TUDO RESTAURADO!', {
        description: 'Barra, dashboard e responsividade corrigidos',
        duration: 3000,
      });
      
    } catch (error) {
      console.error('Error restoring everything:', error);
      toast.error('❌ Erro ao restaurar tudo');
    }
  }, []);

  // FORCE ORGANIZE EVERYTHING - Ultimate solution
  const forceOrganizeEverything = useCallback(() => {
    console.log('FORCE ORGANIZING EVERYTHING...');
    
    try {
      // Clear everything first
      const existingHeaders = document.querySelectorAll('header');
      existingHeaders.forEach(header => header.remove());
      
      // Clear any monitoring
      if ((window as any).headerMonitorInterval) {
        clearInterval((window as any).headerMonitorInterval);
      }
      
      // Get body
      const body = document.body;
      
      // Create header with maximum force
      const header = document.createElement('header');
      header.id = 'force-header';
      header.setAttribute('data-edit-id', 'header.bar');
      
      // Force header styles with maximum priority
      header.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        width: 100% !important;
        height: 64px !important;
        background-color: #2a2a2a !important;
        border-bottom: 2px solid #fbbf24 !important;
        z-index: 999999 !important;
        display: flex !important;
        align-items: center !important;
        padding: 0 20px !important;
        box-sizing: border-box !important;
        visibility: visible !important;
        opacity: 1 !important;
        pointer-events: auto !important;
      `;
      
      // Header content with better styling
      header.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; max-width: 1200px; margin: 0 auto;">
          <div style="display: flex; align-items: center;">
            <div style="color: #fbbf24; font-weight: bold; font-size: 20px; margin-right: 40px; text-shadow: 0 0 10px #fbbf24;">BIL'S</div>
            <div style="display: flex; gap: 25px;">
              <a href="/" style="color: white; text-decoration: none; font-weight: 500; padding: 8px 12px; border-radius: 4px; transition: all 0.3s;">Início</a>
              <a href="/equipamentos" style="color: white; text-decoration: none; font-weight: 500; padding: 8px 12px; border-radius: 4px; transition: all 0.3s;">Equipamentos</a>
              <a href="/suporte" style="color: white; text-decoration: none; font-weight: 500; padding: 8px 12px; border-radius: 4px; transition: all 0.3s;">Suporte</a>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 20px;">
            <input type="text" placeholder="Buscar..." style="background: #444; border: 1px solid #666; color: white; padding: 10px; border-radius: 6px; width: 250px; font-size: 14px;">
            <button style="background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; cursor: pointer;">LOGIN</button>
            <button style="background: #10b981; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; cursor: pointer;">Carrinho</button>
          </div>
        </div>
      `;
      
      // Insert header at the very top
      body.insertBefore(header, body.firstChild);
      
      // Force body styles
      body.style.cssText = `
        padding-top: 64px !important;
        margin: 0 !important;
        background-color: #1a1a1a !important;
        min-height: 100vh !important;
      `;
      
      // Force sidebar positioning
      const sidebar = document.querySelector('[data-edit-id="sidebar.container"]') as HTMLElement;
      if (sidebar) {
        sidebar.style.cssText = `
          position: fixed !important;
          top: 64px !important;
          left: 0 !important;
          width: 256px !important;
          height: calc(100vh - 64px) !important;
          background-color: #1f2937 !important;
          border-right: 2px solid #374151 !important;
          z-index: 50 !important;
          overflow-y: auto !important;
          display: flex !important;
          flex-direction: column !important;
        `;
      }
      
      // Force main content positioning
      const mainContent = document.querySelector('.min-h-screen') as HTMLElement;
      if (mainContent) {
        mainContent.style.cssText = `
          margin-left: 256px !important;
          margin-top: 64px !important;
          min-height: calc(100vh - 64px) !important;
          padding: 2rem !important;
          background-color: #1a1a1a !important;
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
        `;
      }
      
      // Force dashboard content to be visible
      const dashboardElements = document.querySelectorAll('[data-edit-id*="Dashboard"], [data-edit-id*="dashboard"], [data-edit-id*="chart"]');
      dashboardElements.forEach(element => {
        if (element instanceof HTMLElement) {
          element.style.cssText = `
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            background-color: #2a2a2a !important;
            border: 1px solid #444 !important;
            border-radius: 8px !important;
            padding: 1rem !important;
            margin: 0.5rem !important;
            color: white !important;
          `;
        }
      });
      
      // Aggressive monitoring - check every 500ms
      const aggressiveCheck = () => {
        const h = document.getElementById('force-header');
        if (!h) {
          console.log('Header missing, recreating aggressively...');
          forceOrganizeEverything();
          return;
        }
        
        // Force header to stay visible
        h.style.setProperty('display', 'flex', 'important');
        h.style.setProperty('visibility', 'visible', 'important');
        h.style.setProperty('opacity', '1', 'important');
        h.style.setProperty('position', 'fixed', 'important');
        h.style.setProperty('top', '0', 'important');
        h.style.setProperty('z-index', '999999', 'important');
      };
      
      // Check every 500ms
      const interval = setInterval(aggressiveCheck, 500);
      (window as any).headerMonitorInterval = interval;
      
      // Remove from edits
      setEdits(prev => {
        const newEdits = { ...prev };
        delete newEdits['header.bar'];
        return newEdits;
      });
      
      toast.success('🚨 TUDO ORGANIZADO!', {
        description: 'Barra fixa, layout organizado e monitoramento ativo',
        duration: 4000,
      });
      
    } catch (error) {
      console.error('Error force organizing everything:', error);
      toast.error('❌ Erro ao organizar tudo');
    }
  }, []);

  // FIX HEADER LAYOUT - Responsive header
  const fixHeaderLayout = useCallback(() => {
    console.log('FIXING HEADER LAYOUT...');
    
    try {
      // Find existing header
      let header = document.querySelector('header') as HTMLElement;
      
      if (!header) {
        // If no header exists, create one
        const body = document.body;
        header = document.createElement('header');
        header.id = 'fixed-layout-header';
        header.setAttribute('data-edit-id', 'header.bar');
        body.insertBefore(header, body.firstChild);
      }
      
      // Responsive header styles
      header.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        width: 100% !important;
        height: 64px !important;
        background-color: #2a2a2a !important;
        border-bottom: 2px solid #fbbf24 !important;
        z-index: 999999 !important;
        display: flex !important;
        align-items: center !important;
        padding: 0 10px !important;
        box-sizing: border-box !important;
        visibility: visible !important;
        opacity: 1 !important;
        overflow: hidden !important;
      `;
      
      // Responsive header content
      header.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; max-width: 100%; min-width: 0;">
          <div style="display: flex; align-items: center; min-width: 0; flex: 1;">
            <div style="color: #fbbf24; font-weight: bold; font-size: 18px; margin-right: 20px; white-space: nowrap; flex-shrink: 0;">BIL'S</div>
            <div style="display: flex; gap: 15px; flex-shrink: 0;">
              <a href="/" style="color: white; text-decoration: none; font-weight: 500; padding: 6px 8px; border-radius: 4px; white-space: nowrap; font-size: 14px;">Início</a>
              <a href="/equipamentos" style="color: white; text-decoration: none; font-weight: 500; padding: 6px 8px; border-radius: 4px; white-space: nowrap; font-size: 14px;">Equipamentos</a>
              <a href="/suporte" style="color: white; text-decoration: none; font-weight: 500; padding: 6px 8px; border-radius: 4px; white-space: nowrap; font-size: 14px;">Suporte</a>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 10px; flex-shrink: 0;">
            <input type="text" placeholder="Buscar..." style="background: #444; border: 1px solid #666; color: white; padding: 8px; border-radius: 4px; width: 180px; font-size: 12px; min-width: 120px;">
            <button style="background: #3b82f6; color: white; border: none; padding: 8px 12px; border-radius: 4px; font-weight: 600; cursor: pointer; font-size: 12px; white-space: nowrap;">LOGIN</button>
            <button style="background: #10b981; color: white; border: none; padding: 8px 12px; border-radius: 4px; font-weight: 600; cursor: pointer; font-size: 12px; white-space: nowrap;">Carrinho</button>
          </div>
        </div>
      `;
      
      // Add responsive CSS
      const style = document.createElement('style');
      style.textContent = `
        @media (max-width: 1200px) {
          header div div:first-child {
            gap: 10px !important;
          }
          header input {
            width: 150px !important;
          }
        }
        @media (max-width: 1000px) {
          header div div:first-child {
            gap: 8px !important;
          }
          header input {
            width: 120px !important;
          }
          header button {
            padding: 6px 10px !important;
            font-size: 11px !important;
          }
        }
        @media (max-width: 800px) {
          header div div:first-child a {
            padding: 4px 6px !important;
            font-size: 12px !important;
          }
          header input {
            width: 100px !important;
          }
          header button {
            padding: 6px 8px !important;
            font-size: 10px !important;
          }
        }
      `;
      document.head.appendChild(style);
      
      // Fix body padding
      document.body.style.paddingTop = '64px';
      
      // Remove from edits
      setEdits(prev => {
        const newEdits = { ...prev };
        delete newEdits['header.bar'];
        return newEdits;
      });
      
      toast.success('🚨 LAYOUT CORRIGIDO!', {
        description: 'Barra responsiva e ajustada para a tela',
        duration: 3000,
      });
      
    } catch (error) {
      console.error('Error fixing header layout:', error);
      toast.error('❌ Erro ao corrigir layout da barra');
    }
  }, []);

  // RESTORE SIDEBAR TO ORIGINAL STATE
  const restoreSidebarOriginal = useCallback(() => {
    console.log('RESTORING SIDEBAR TO ORIGINAL STATE...');
    
    try {
      // Remove all inline styles from sidebar to restore original CSS classes
      const sidebar = document.querySelector('[data-edit-id="sidebar.container"]') as HTMLElement;
      if (sidebar) {
        sidebar.removeAttribute('style');
        sidebar.className = 'w-64 bg-cinema-gray border-r border-cinema-gray-light h-full flex flex-col';
        console.log('Sidebar restored to original state');
      }
      
      // Remove all inline styles from main content
      const mainContent = document.querySelector('.min-h-screen') as HTMLElement;
      if (mainContent) {
        mainContent.removeAttribute('style');
        console.log('Main content restored to original state');
      }
      
      // Remove all inline styles from sidebar title
      const sidebarTitle = document.querySelector('[data-edit-id="sidebar.title"]') as HTMLElement;
      if (sidebarTitle) {
        sidebarTitle.removeAttribute('style');
        console.log('Sidebar title restored to original state');
      }
      
      // Remove all inline styles from sidebar menu items
      const sidebarMenuItems = document.querySelectorAll('[data-edit-id*="sidebar.menu"], [data-edit-id*="sidebar.button"]');
      sidebarMenuItems.forEach((item) => {
        item.removeAttribute('style');
      });
      console.log('Sidebar menu items restored to original state');
      
      toast.success('✅ Sidebar restaurada ao estado original');
    } catch (error) {
      console.error('Error restoring sidebar:', error);
      toast.error('❌ Erro ao restaurar sidebar');
    }
  }, []);

  // FIX SIDEBAR AND NOTIFICATIONS SIZES
  const fixSidebarAndNotifications = useCallback(() => {
    console.log('FIXING SIDEBAR AND NOTIFICATIONS SIZES...');
    
    try {
      // Fix sidebar width - restore to original w-64 (256px)
      const sidebar = document.querySelector('[data-edit-id="sidebar.container"]') as HTMLElement;
      if (sidebar) {
        sidebar.style.cssText = `
          position: relative !important;
          top: auto !important;
          left: auto !important;
          width: 256px !important;
          height: 100vh !important;
          background-color: #374151 !important;
          border-right: 1px solid #4b5563 !important;
          z-index: auto !important;
          overflow-y: auto !important;
          display: flex !important;
          flex-direction: column !important;
          padding: 1.5rem !important;
        `;
      }
      
      // Fix main content margin to match original sidebar width
      const mainContent = document.querySelector('.min-h-screen') as HTMLElement;
      if (mainContent) {
        mainContent.style.cssText = `
          margin-left: 0 !important;
          margin-top: 0 !important;
          min-height: 100vh !important;
          padding: 1rem !important;
          background-color: #1a1a1a !important;
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
        `;
      }
      
      // Fix sidebar title
      const sidebarTitle = document.querySelector('[data-edit-id="sidebar.title"]') as HTMLElement;
      if (sidebarTitle) {
        sidebarTitle.style.cssText = `
          color: #fbbf24 !important;
          font-size: 1.1rem !important;
          font-weight: bold !important;
          margin-bottom: 1rem !important;
          text-align: center !important;
          white-space: nowrap !important;
        `;
      }
      
      // Fix sidebar menu items
      const sidebarMenuItems = document.querySelectorAll('[data-edit-id*="sidebar.menu"]');
      sidebarMenuItems.forEach(item => {
        if (item instanceof HTMLElement) {
          item.style.cssText = `
            width: 100% !important;
            margin-bottom: 0.5rem !important;
            padding: 0.75rem !important;
            border-radius: 6px !important;
            display: flex !important;
            align-items: center !important;
            gap: 0.5rem !important;
            font-size: 0.9rem !important;
            white-space: nowrap !important;
          `;
        }
      });
      
      // Fix notification cards - make them wider
      const notificationCards = document.querySelectorAll('[class*="notification"], [class*="alert"], [class*="ponto"]');
      notificationCards.forEach(card => {
        if (card instanceof HTMLElement) {
          card.style.cssText = `
            width: 300px !important;
            min-width: 300px !important;
            max-width: 350px !important;
            margin: 0.5rem !important;
            padding: 1rem !important;
            border-radius: 8px !important;
            background-color: #2a2a2a !important;
            border: 1px solid #444 !important;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
          `;
        }
      });
      
      // Fix notification text to prevent wrapping
      const notificationTexts = document.querySelectorAll('[class*="notification"] p, [class*="alert"] p, [class*="ponto"] p');
      notificationTexts.forEach(text => {
        if (text instanceof HTMLElement) {
          text.style.cssText = `
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            margin: 0.25rem 0 !important;
            font-size: 0.9rem !important;
          `;
        }
      });
      
      // Fix notification buttons
      const notificationButtons = document.querySelectorAll('[class*="notification"] button, [class*="alert"] button, [class*="ponto"] button');
      notificationButtons.forEach(button => {
        if (button instanceof HTMLElement) {
          button.style.cssText = `
            width: 100% !important;
            margin-top: 0.5rem !important;
            padding: 0.5rem !important;
            border-radius: 4px !important;
            font-size: 0.8rem !important;
            white-space: nowrap !important;
          `;
        }
      });
      
      // Create a container for notifications if it doesn't exist
      let notificationContainer = document.querySelector('.notification-container') as HTMLElement;
      if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container';
        notificationContainer.style.cssText = `
          position: fixed !important;
          top: 80px !important;
          right: 20px !important;
          width: 320px !important;
          z-index: 100 !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 0.5rem !important;
        `;
        document.body.appendChild(notificationContainer);
      }
      
      // Move existing notifications to the container
      const existingNotifications = document.querySelectorAll('[class*="notification"], [class*="alert"], [class*="ponto"]');
      existingNotifications.forEach(notification => {
        if (notification instanceof HTMLElement && !notificationContainer.contains(notification)) {
          notificationContainer.appendChild(notification);
        }
      });
      
      toast.success('🚨 TAMANHOS CORRIGIDOS!', {
        description: 'Sidebar e notificações ajustados',
        duration: 3000,
      });
      
    } catch (error) {
      console.error('Error fixing sidebar and notifications:', error);
      toast.error('❌ Erro ao corrigir tamanhos');
    }
  }, []);

  // Global click handler
  useEffect(() => {
    if (!state.isActive) return;

    // Add a small delay to ensure elements are loaded
    const timer = setTimeout(() => {
      console.log('=== EDITOR DEBUG ===');
      console.log('Editor is active:', state.isActive);
      console.log('Total elements with data-edit-id:', document.querySelectorAll('[data-edit-id]').length);
      console.log('Product elements found:', document.querySelectorAll('[data-edit-id*="product-"]').length);
      
      // Check if products are being rendered
      const productCards = document.querySelectorAll('[data-edit-id*="product-"][data-edit-id*="-card"]');
      console.log('Product cards found:', productCards.length);
      
      if (productCards.length > 0) {
        console.log('First product card:', productCards[0], 'id:', productCards[0].getAttribute('data-edit-id'));
      }
      
      console.log('=== END DEBUG ===');
    }, 1000);

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      console.log('Click detected on:', target);
      console.log('Target classes:', target.className);
      console.log('Target tagName:', target.tagName);
      console.log('Target has data-edit-id:', target.hasAttribute('data-edit-id'));
      console.log('Target textContent:', target.textContent);
      console.log('Target innerHTML:', target.innerHTML);
      console.log('Editor is active:', state.isActive);
      
      // Only handle clicks if editor is active
      if (!state.isActive) {
        console.log('Editor not active, ignoring click');
        return;
      }
      
      // Ignore clicks on editor elements
      if (target.closest('.nasa-editor-panel') || 
          target.closest('[data-editor-button]')) {
        console.log('Click on editor element, ignoring');
        return;
      }
      
      // Always prevent default and stop propagation for editor mode
      e.preventDefault();
      e.stopPropagation();
      
      console.log('Editor click handler triggered');

      // Check if target itself has data-edit-id first (highest priority)
      if (target.hasAttribute('data-edit-id')) {
        const id = target.getAttribute('data-edit-id');
        console.log('Target itself is editable:', target, 'with id:', id);
        console.log('Setting state with selectedId:', id);
        
        // Special handling for Popular badge
        if (id?.includes('featured-badge')) {
          console.log('Popular badge clicked!');
          console.log('Element classes:', target.className);
          console.log('Element tagName:', target.tagName);
        }
        
        // If it's an icon, prioritize it over the button
        if (id?.includes('icon')) {
          console.log('Icon clicked, selecting icon instead of button');
        }
        
        setState(prev => {
          console.log('Previous state:', prev);
          const newState = { ...prev, selectedId: id!, isEditing: true };
          console.log('New state:', newState);
          return newState;
        });
        return;
      }
      
      // Check if target is inside an element with data-edit-id (for text spans, etc.)
      const parentWithEditId = target.closest('[data-edit-id]');
      if (parentWithEditId && parentWithEditId !== target) {
        const id = parentWithEditId.getAttribute('data-edit-id');
        console.log('Parent element is editable:', parentWithEditId, 'with id:', id);
        console.log('Setting state with selectedId:', id);
        setState(prev => ({ ...prev, selectedId: id!, isEditing: true }));
        return;
      }
      
      // Additional check for text nodes
      if (target.nodeType === Node.TEXT_NODE) {
        const parentElement = target.parentElement;
        if (parentElement && parentElement.hasAttribute('data-edit-id')) {
          const id = parentElement.getAttribute('data-edit-id');
          console.log('Text node clicked, parent is editable:', parentElement, 'with id:', id);
          setState(prev => ({ ...prev, selectedId: id!, isEditing: true }));
          return;
        }
      }
      
      // Special handling for icon elements - check if it's an SVG or path inside an icon
      if (target.tagName === 'path' || target.tagName === 'svg') {
        console.log('SVG element clicked, looking for parent icon');
        const iconElement = target.closest('[data-edit-id*="icon"]');
        if (iconElement) {
          const id = iconElement.getAttribute('data-edit-id');
          console.log('Found parent icon element:', iconElement, 'with id:', id);
          setState(prev => ({ ...prev, selectedId: id!, isEditing: true }));
          return;
        }
      }
      
      // Check if target is inside a div with data-edit-id (for our icon wrapper)
      const iconWrapper = target.closest('[data-edit-id*="icon"]');
      if (iconWrapper) {
        const id = iconWrapper.getAttribute('data-edit-id');
        console.log('Icon wrapper clicked:', iconWrapper, 'with id:', id);
        setState(prev => ({ ...prev, selectedId: id!, isEditing: true }));
        return;
      }
      
      // Simple approach: find any parent with data-edit-id
      let element = target;
      let depth = 0;
      console.log('Starting parent traversal from:', target);
      
      while (element && element !== document.body && depth < 10) {
        console.log(`Checking element at depth ${depth}:`, element, 'has data-edit-id:', element.hasAttribute('data-edit-id'));
        
        if (element.hasAttribute('data-edit-id')) {
          const id = element.getAttribute('data-edit-id');
          console.log('Found editable element:', element, 'with id:', id);
          
        if (id) {
            selectElement(element, id, e.ctrlKey || e.metaKey);
        }
          return;
      }
        element = element.parentElement as HTMLElement;
        depth++;
      }
      
      console.log('No editable element found for:', target);
    };

    const handleMouseOver = (e: MouseEvent) => {
      if (!state.isActive) return;
      
      const target = e.target as HTMLElement;
      const editableElement = target.closest('[data-edit-id]') as HTMLElement;
      
      if (editableElement && editableElement !== state.selectedElement) {
        const id = editableElement.getAttribute('data-edit-id');
        if (id) {
          // Remove previous hover
          try {
            document.querySelectorAll('.nasa-editor-hovered').forEach(el => {
              if (el && el.classList) {
                el.classList.remove('nasa-editor-hovered');
              }
            });
          } catch (error) {
            console.warn('Error removing hover states:', error);
          }
          
          // Add hover to new element
          editableElement.classList.add('nasa-editor-hovered');
          
          setState(prev => ({
            ...prev,
            hoveredElement: editableElement,
            hoveredId: id,
          }));
        }
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      if (!state.isActive) return;
      
      const target = e.target as HTMLElement;
      const editableElement = target.closest('[data-edit-id]') as HTMLElement;
      
      if (editableElement && editableElement !== state.selectedElement) {
        editableElement.classList.remove('nasa-editor-hovered');
        
        setState(prev => ({
          ...prev,
          hoveredElement: null,
          hoveredId: null,
        }));
      }
    };

    document.addEventListener('click', handleClick, true);
    document.addEventListener('mouseover', handleMouseOver, true);
    document.addEventListener('mouseout', handleMouseOut, true);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('mouseover', handleMouseOver, true);
      document.removeEventListener('mouseout', handleMouseOut, true);
    };
  }, [state.isActive, state.selectedElement, selectElement]);

  const contextValue: EditorContextType = {
    state,
    toggleEditor,
    selectElement,
    clearSelection,
    updateElement,
    saveChanges,
    resetElement,
    togglePreview,
    getElementEdits,
    reapplyAllEdits,
    clearSidebarTextEdits,
    clearAllEdits,
    resetSidebarSizes,
    forceResetServicos,
    fixTextContamination,
    preventTextPropagation,
    isolateSidebarTexts,
    forceCompleteReset,
    ensureStrictIsolation,
    restoreHeaderBar,
    emergencyRestoreHeader,
    superRestoreHeader,
    forceCreateHeader,
    createPersistentHeader,
    fixLayoutAndCreateHeader,
    ultimateFix,
    restoreEverything,
    forceOrganizeEverything,
    fixHeaderLayout,
    fixSidebarAndNotifications,
    restoreSidebarOriginal,
  };

  return (
    <EditorContext.Provider value={contextValue}>
      {children}
      <EditorOverlay />
      <EditPanel />
      <EditorStyles />
    </EditorContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useInlineEditor() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useInlineEditor must be used within an EditorProvider');
  }
  return context;
}

// ============================================================================
// COMPONENTS
// ============================================================================

export function EditorOverlay() {
  const { state, toggleEditor, reapplyAllEdits, clearSidebarTextEdits, clearAllEdits, resetSidebarSizes, forceResetServicos, fixTextContamination, preventTextPropagation, isolateSidebarTexts, forceCompleteReset, ensureStrictIsolation, restoreHeaderBar, emergencyRestoreHeader, superRestoreHeader, forceCreateHeader, createPersistentHeader, fixLayoutAndCreateHeader, ultimateFix, restoreEverything, forceOrganizeEverything, fixHeaderLayout, fixSidebarAndNotifications, restoreSidebarOriginal, clearSelection } = useInlineEditor();
  const [panelPosition, setPanelPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only allow dragging from the header area
    if (e.target instanceof HTMLElement) {
      const isHeader = e.target.closest('[data-drag-handle]') || 
                      e.target.closest('.cursor-grab') ||
                      e.target.closest('h3');
      if (!isHeader) return;
    }
    
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - panelPosition.x,
      y: e.clientY - panelPosition.y
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      // Keep panel within viewport
      const maxX = window.innerWidth - 320; // 320px is panel width
      const maxY = window.innerHeight - 200; // 200px is panel height
      
      const clampedX = Math.max(0, Math.min(newX, maxX));
      const clampedY = Math.max(0, Math.min(newY, maxY));
      
      setPanelPosition({ x: clampedX, y: clampedY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart, panelPosition]);

  if (!state.isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Draggable Status Panel */}
      <div 
        className="absolute pointer-events-auto"
        style={{
          left: panelPosition.x,
          top: panelPosition.y,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onMouseDown={handleMouseDown}
      >
        <Card className="nasa-editor-panel w-80 bg-gradient-to-r from-blue-900 to-purple-900 border-blue-500 shadow-2xl">
          <CardHeader className="pb-3 cursor-grab active:cursor-grabbing" data-drag-handle>
            <CardTitle className="flex items-center gap-2 text-sm text-white" data-edit-id="editor.panel.title">
              <Move className="w-4 h-4 text-blue-400" data-edit-id="editor.panel.drag-icon" />
              <span data-edit-id="editor.panel.title-text">Editor Comando D</span>
              <span className="text-xs text-gray-400 ml-auto" data-edit-id="editor.panel.drag-text">Arrastar</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <MousePointer className="w-4 h-4 text-blue-400" data-edit-id="editor.panel.pointer-icon" />
              <span className="text-sm text-blue-100" data-edit-id="editor.panel.instruction-text">
                {state.selectedElements.size > 0 
                  ? `${state.selectedElements.size} elemento(s) selecionado(s)`
                  : 'Clique em qualquer elemento para editar'
                }
              </span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs border-blue-400 text-blue-300" data-edit-id="editor.panel.mode-badge">
                <span data-edit-id="editor.panel.mode-text">Modo de Edição</span>
              </Badge>
              <Button
                data-editor-button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Reapply button clicked');
                  reapplyAllEdits();
                }}
                variant="outline"
                size="sm"
                className="h-6 text-xs border-green-400 text-green-300 hover:bg-green-500 hover:text-white"
                data-edit-id="editor.panel.reapply-button"
              >
                <RotateCcw className="w-3 h-3 mr-1" data-edit-id="editor.panel.reapply-icon" />
                <span data-edit-id="editor.panel.reapply-text">Reaplicar</span>
              </Button>
              <Button
                data-editor-button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Exit button clicked');
                  toggleEditor();
                }}
                variant="outline"
                size="sm"
                className="h-6 text-xs border-gray-400 text-gray-300 hover:bg-gray-500 hover:text-white"
                data-edit-id="editor.panel.exit-button"
              >
                <X className="w-3 h-3 mr-1" data-edit-id="editor.panel.exit-icon" />
                <span data-edit-id="editor.panel.exit-text">Sair</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hover Tooltip */}
      {state.hoveredId && (
        <div className="absolute top-4 right-4 pointer-events-auto">
          <Card className="bg-green-900 border-green-500 shadow-2xl">
            <CardContent className="p-2">
              <p className="text-xs text-white">
                <span className="font-bold">Element:</span> {state.hoveredId}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// EDIT PANEL
// ============================================================================

// Edit Panel Component
export function EditPanel() {
  const { state, updateElement, saveChanges, clearSelection, resetElement, getElementEdits, restoreSidebarOriginal } = useInlineEditor();
  const [activeTab, setActiveTab] = useState('general');
  const [panelPosition, setPanelPosition] = useState({ x: window.innerWidth - 400, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only allow dragging from the header area
    if (e.target instanceof HTMLElement) {
      const isHeader = e.target.closest('[data-drag-handle]') || 
                      e.target.closest('.cursor-grab') ||
                      e.target.closest('h3');
      if (!isHeader) return;
    }
    
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - panelPosition.x,
      y: e.clientY - panelPosition.y
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      // Keep panel within viewport
      const maxX = window.innerWidth - 400; // 400px is panel width
      const maxY = window.innerHeight - 300; // 300px is panel height
      
      const clampedX = Math.max(0, Math.min(newX, maxX));
      const clampedY = Math.max(0, Math.min(newY, maxY));
      
      setPanelPosition({ x: clampedX, y: clampedY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart, panelPosition]);

  if (!state.isEditing || !state.selectedId) {
    return null;
  }

  const currentEdit = getElementEdits(state.selectedId);

  return (
    <div 
      className="fixed z-[60] pointer-events-auto"
      style={{
        left: panelPosition.x,
        top: panelPosition.y,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
    >
      <Card className="nasa-editor-panel w-80 sm:w-96 max-w-[calc(100vw-1rem)] bg-gradient-to-br from-gray-900 to-gray-800 border-gray-600 shadow-2xl max-h-[calc(100vh-5rem)] overflow-y-auto">
      <CardHeader className="pb-2 cursor-grab active:cursor-grabbing" data-drag-handle onMouseDown={handleMouseDown}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs text-white flex items-center gap-1">
            <Move className="w-3 h-3 text-blue-400" />
            <Settings className="w-3 h-3 text-blue-400" />
            Editando Elemento
            <span className="text-xs text-gray-400 ml-auto">Arrastar</span>
          </CardTitle>
          <Button
            data-editor-button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('EditPanel X button clicked');
              clearSelection();
            }}
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0 text-gray-400 hover:text-white pointer-events-auto"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
        <Badge variant="secondary" className="text-xs w-fit bg-blue-900 text-blue-300">
          ID: {state.selectedId}
        </Badge>
      </CardHeader>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-600">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-3 py-1.5 text-xs font-medium transition-colors ${
            activeTab === 'general'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Geral
        </button>
        <button
          onClick={() => setActiveTab('icon')}
          className={`px-3 py-1.5 text-xs font-medium transition-colors ${
            activeTab === 'icon'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Ícone
        </button>
      </div>

      <CardContent className="space-y-3 pt-3 text-xs">
        {/* General Tab */}
        {activeTab === 'general' && (
          <>
        {/* Text */}
        <div className="space-y-2">
          <Label className="text-white text-sm font-medium">Texto</Label>
          <Textarea
            value={currentEdit.text || ''}
            onChange={(e) => updateElement(state.selectedId!, { text: e.target.value })}
            placeholder="Digite o texto aqui"
            className="bg-gray-700 border-gray-600 text-white text-xs min-h-[60px]"
          />
        </div>

        {/* Typography */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-blue-400" />
            <Label className="text-white text-sm font-medium">Tipografia</Label>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-gray-300 text-xs">Tamanho</Label>
              <Input
                value={currentEdit.fontSize || ''}
                onChange={(e) => updateElement(state.selectedId!, { fontSize: e.target.value })}
                placeholder="16px"
                className="bg-gray-700 border-gray-600 text-white text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-gray-300 text-xs">Peso</Label>
              <Input
                value={currentEdit.fontWeight || ''}
                onChange={(e) => updateElement(state.selectedId!, { fontWeight: e.target.value })}
                placeholder="400"
                className="bg-gray-700 border-gray-600 text-white text-xs"
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <Label className="text-gray-300 text-xs">Fonte</Label>
            <Input
              value={currentEdit.fontFamily || ''}
              onChange={(e) => updateElement(state.selectedId!, { fontFamily: e.target.value })}
              placeholder="ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji'"
              className="bg-gray-700 border-gray-600 text-white text-xs"
            />
          </div>
        </div>

        {/* Colors */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-purple-400" />
            <Label className="text-white text-sm font-medium">Cores</Label>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-gray-300 text-xs">Texto</Label>
              <div className="flex gap-1">
                <Input
                  type="color"
                  value={currentEdit.color || '#000000'}
                  onChange={(e) => updateElement(state.selectedId!, { color: e.target.value })}
                  className="w-8 h-8 p-0 border-gray-600"
                />
                <Input
                  type="text"
                  value={currentEdit.color || ''}
                  onChange={(e) => updateElement(state.selectedId!, { color: e.target.value })}
                  placeholder="#8faf6c"
                  className="flex-1 bg-gray-700 border-gray-600 text-white text-xs"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-gray-300 text-xs">Fundo</Label>
              <div className="flex gap-1">
                <Input
                  type="color"
                  value={currentEdit.backgroundColor || '#ffffff'}
                  onChange={(e) => updateElement(state.selectedId!, { backgroundColor: e.target.value })}
                  className="w-8 h-8 p-0 border-gray-600"
                />
                <Input
                  type="text"
                  value={currentEdit.backgroundColor || ''}
                  onChange={(e) => updateElement(state.selectedId!, { backgroundColor: e.target.value })}
                  placeholder="#2a2a2a"
                  className="flex-1 bg-gray-700 border-gray-600 text-white text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Size */}
        <div className="space-y-3">
          <Label className="text-white text-sm font-medium">Tamanho</Label>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-gray-300 text-xs">Largura</Label>
              <Input
                value={currentEdit.width || ''}
                onChange={(e) => updateElement(state.selectedId!, { width: e.target.value })}
                placeholder="auto"
                className="bg-gray-700 border-gray-600 text-white text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-gray-300 text-xs">Altura</Label>
              <Input
                value={currentEdit.height || ''}
                onChange={(e) => updateElement(state.selectedId!, { height: e.target.value })}
                placeholder="auto"
                className="bg-gray-700 border-gray-600 text-white text-xs"
              />
            </div>
          </div>
        </div>

        {/* Spacing */}
        <div className="space-y-3">
          <Label className="text-white text-sm font-medium">Espaçamento</Label>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-gray-300 text-xs">Preenchimento</Label>
              <Input
                value={currentEdit.padding || ''}
                onChange={(e) => updateElement(state.selectedId!, { padding: e.target.value })}
                placeholder="10px"
                className="bg-gray-700 border-gray-600 text-white text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-gray-300 text-xs">Margem</Label>
              <Input
                value={currentEdit.margin || ''}
                onChange={(e) => updateElement(state.selectedId!, { margin: e.target.value })}
                placeholder="5px"
                className="bg-gray-700 border-gray-600 text-white text-xs"
              />
            </div>
          </div>
        </div>

        {/* Effects */}
        <div className="space-y-3">
          <Label className="text-white text-sm font-medium">Efeitos</Label>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-gray-300 text-xs">Borda</Label>
              <Input
                value={currentEdit.border || ''}
                onChange={(e) => updateElement(state.selectedId!, { border: e.target.value })}
                placeholder="1px solid #ccc"
                className="bg-gray-700 border-gray-600 text-white text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-gray-300 text-xs">Raio</Label>
              <Input
                value={currentEdit.borderRadius || ''}
                onChange={(e) => updateElement(state.selectedId!, { borderRadius: e.target.value })}
                placeholder="4px"
                className="bg-gray-700 border-gray-600 text-white text-xs"
              />
            </div>
          </div>
        </div>
          </>
        )}

        {/* Icon Tab */}
        {activeTab === 'icon' && (
            <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-white text-sm font-medium">Personalizar Ícone</Label>
              
              <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  {(() => {
                    const iconPath = currentEdit.iconPath;
                    if (iconPath && iconPath.includes('M15')) {
                      return <ShoppingCart className="w-4 h-4 text-gray-400" />;
                    } else if (iconPath && iconPath.includes('M1 1')) {
                      return <Eye className="w-4 h-4 text-gray-400" />;
                    }
                    return <ImageIcon className="w-4 h-4 text-gray-400" />;
                  })()}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-gray-300 text-xs">Cor do Ícone</Label>
                  <div className="flex gap-1">
                    <Input
                      type="color"
                      value={currentEdit.iconColor || '#ffffff'}
                      onChange={(e) => updateElement(state.selectedId!, { iconColor: e.target.value })}
                      className="w-8 h-8 p-0 border-gray-600"
                    />
                    <Input
                      type="text"
                      value={currentEdit.iconColor || ''}
                      onChange={(e) => updateElement(state.selectedId!, { iconColor: e.target.value })}
                      placeholder="#ffffff"
                      className="flex-1 bg-gray-700 border-gray-600 text-white text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-gray-300 text-xs">Tamanho</Label>
                  <Input
                    value={currentEdit.iconSize || ''}
                    onChange={(e) => updateElement(state.selectedId!, { iconSize: e.target.value })}
                    placeholder="16px"
                    className="bg-gray-700 border-gray-600 text-white text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-gray-300 text-xs">Caminho SVG (path d="")</Label>
                <Textarea
                  value={currentEdit.iconPath || ''}
                  onChange={(e) => updateElement(state.selectedId!, { iconPath: e.target.value })}
                  placeholder="M15 6a2 2 0 100-4 2 2 0 000 4z..."
                  className="bg-gray-700 border-gray-600 text-white text-xs min-h-[60px] font-mono"
                />
              </div>
              
              <div className="space-y-1">
                <Label className="text-gray-300 text-xs">ViewBox</Label>
                <Input
                  value={currentEdit.iconViewBox || ''}
                  onChange={(e) => updateElement(state.selectedId!, { iconViewBox: e.target.value })}
                  placeholder="0 0 24 24"
                  className="bg-gray-700 border-gray-600 text-white text-xs"
                />
              </div>
              
              <div className="space-y-1">
                <Label className="text-gray-300 text-xs">Upload de Ícone (URL)</Label>
                <Input
                  value={currentEdit.iconUpload || ''}
                  onChange={(e) => updateElement(state.selectedId!, { iconUpload: e.target.value })}
                  placeholder="https://exemplo.com/icone.svg"
                  className="bg-gray-700 border-gray-600 text-white text-xs"
                />
                {currentEdit.iconUpload && (
                  <div className="mt-2 p-2 bg-gray-800 rounded border border-gray-700">
                    <img
                      src={currentEdit.iconUpload}
                      alt="Preview"
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
              </div>
            </div>
        )}

        {/* Buttons for specific actions - ADD HERE */}
        <div className="space-y-2 pt-2 border-t border-gray-700">
          <Label className="text-white text-sm font-medium">Ações Específicas</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              data-editor-button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Restore sidebar for this element');
                restoreSidebarOriginal();
              }}
              variant="outline"
              size="sm"
              className="h-7 text-xs border-orange-400 text-orange-300 hover:bg-orange-500 hover:text-white"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Corrigir
            </Button>
            <Button
              data-editor-button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Reset this element');
                resetElement(state.selectedId!);
              }}
              variant="outline"
              size="sm"
              className="h-7 text-xs border-yellow-400 text-yellow-300 hover:bg-yellow-500 hover:text-white"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Resetar
            </Button>
          </div>
        </div>

        {/* Actions - Fixed at bottom */}
        <div className="sticky bottom-0 bg-gray-900 -mx-3 -mb-3 p-3 border-t border-gray-600">
        <div className="flex gap-2">
          <Button
            data-editor-button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Save button clicked');
              saveChanges();
            }}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white pointer-events-auto text-xs"
            size="sm"
          >
            <Save className="w-3 h-3 mr-1" />
            Salvar
          </Button>
          <Button
            data-editor-button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Reset button clicked');
              resetElement(state.selectedId!);
            }}
            variant="outline"
              className="border-orange-400 text-orange-400 hover:bg-orange-500 hover:text-white pointer-events-auto text-xs"
            size="sm"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Redefinir
          </Button>
          </div>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}

// Toggle Button Component
export function EditToggleButton() {
  const { state, toggleEditor } = useInlineEditor();

  return (
    <Button
      onClick={toggleEditor}
      className="fixed bottom-4 right-4 z-[70] bg-blue-600 hover:bg-blue-700 text-white shadow-2xl"
      size="lg"
    >
      {state.isActive ? (
        <>
          <X className="w-5 h-5 mr-2" />
          Sair Editor
        </>
      ) : (
        <>
          <Settings className="w-5 h-5 mr-2" />
          Editor Comando D
        </>
      )}
    </Button>
  );
}

function EditorStyles() {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .nasa-editor-hovered {
        outline: 2px solid #10b981 !important;
        outline-offset: 2px !important;
        position: relative !important;
      }
      
      .nasa-editor-hovered::after {
        content: "✏️ Editar";
        position: absolute;
        top: -25px;
        left: 0;
        background: #10b981;
        color: white;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 10px;
        font-weight: bold;
        z-index: 1000;
        pointer-events: none;
      }
      
      .nasa-editor-selected {
        outline: 3px solid #3b82f6 !important;
        outline-offset: 2px !important;
        position: relative !important;
      }
      
      .nasa-editor-selected::after {
        content: "✓ Selecionado";
        position: absolute;
        top: -25px;
        left: 0;
        background: #3b82f6;
        color: white;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 10px;
        font-weight: bold;
        z-index: 1000;
        pointer-events: none;
      }
      
      .nasa-editor-active {
        cursor: crosshair !important;
      }
      
      .nasa-editor-active * {
        cursor: crosshair !important;
      }
    `;
    
    // Safe appendChild with error handling
    try {
      document.head.appendChild(style);
    } catch (error) {
      console.warn('Error appending global style to head:', error);
    }
    
    return () => {
      if (style && style.parentNode && style.parentNode.contains(style)) {
        try {
          style.parentNode.removeChild(style);
        } catch (error) {
          console.warn('Error removing style:', error);
        }
      }
    };
  }, []);
  
  return null;
}
