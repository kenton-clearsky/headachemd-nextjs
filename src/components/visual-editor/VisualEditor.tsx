'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, Reorder } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Move, Save, X, Eye, EyeOff, Plus, Trash2, Settings, Info, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Maximize2, Minimize2, RotateCcw, RotateCw, ZoomIn, ZoomOut, Palette, MousePointer, GripVertical } from 'lucide-react';

interface PageSection {
  id: string;
  type: 'header' | 'hero' | 'about' | 'news' | 'footer' | 'contact';
  title: string;
  content: string;
  visible: boolean;
  order: number;
  position: { x: number; y: number; width: number; height: number };
  backgroundColor: string;
  elements: {
    id: string;
    type: 'text' | 'image' | 'button' | 'link';
    content: string;
    props: Record<string, any>;
    position: { x: number; y: number };
    size: { width: number; height: number };
    rotation: number;
    opacity: number;
    zIndex: number;
    color: string;
    backgroundColor: string;
    borderColor: string;
  }[];
}

interface VisualEditorProps {
  onClose: () => void;
  onUpdatePage?: (sections: PageSection[]) => void;
}

export default function VisualEditor({ onClose, onUpdatePage }: VisualEditorProps) {
  const [isEditMode, setIsEditMode] = useState(true);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [granularMode, setGranularMode] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);
  const [stepSize, setStepSize] = useState(1);
  const [draggedElement, setDraggedElement] = useState<string | null>(null);
  
  // Draggable state
  const [isDragging, setIsDragging] = useState(false);
  const [editorPosition, setEditorPosition] = useState({ x: -700, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const editorRef = useRef<HTMLDivElement>(null);
  
  console.log('VisualEditor rendering, showCanvas:', showCanvas, 'editorPosition:', editorPosition);
  
  const [sections, setSections] = useState<PageSection[]>([
    {
      id: 'header',
      type: 'header',
      title: 'Header & Navigation',
      content: 'Top contact bar and main navigation',
      visible: true,
      order: 1,
      position: { x: 0, y: 0, width: 100, height: 80 },
      backgroundColor: '#f3f4f6',
      elements: [
        { id: 'phone', type: 'text', content: '713-426-3337', props: { icon: 'phone' }, position: { x: 0, y: 0 }, size: { width: 150, height: 20 }, rotation: 0, opacity: 1, zIndex: 1, color: '#374151', backgroundColor: 'rgba(0,0,0,0)', borderColor: 'rgba(0,0,0,0)' },
        { id: 'hours', type: 'text', content: '8:00 AM - 5:00 PM (Mon-Fri)', props: { icon: 'clock' }, position: { x: 100, y: 0 }, size: { width: 200, height: 20 }, rotation: 0, opacity: 1, zIndex: 1, color: '#374151', backgroundColor: 'rgba(0,0,0,0)', borderColor: 'rgba(0,0,0,0)' },
        { id: 'email', type: 'link', content: 'info@headacheMD.org', props: { href: 'mailto:info@headacheMD.org' }, position: { x: 200, y: 0 }, size: { width: 180, height: 20 }, rotation: 0, opacity: 1, zIndex: 1, color: '#374151', backgroundColor: 'rgba(0,0,0,0)', borderColor: 'rgba(0,0,0,0)' },
        { id: 'dark-mode', type: 'button', content: 'Dark Mode', props: { variant: 'ghost' }, position: { x: 300, y: 0 }, size: { width: 100, height: 30 }, rotation: 0, opacity: 1, zIndex: 1, color: '#374151', backgroundColor: '#ffffff', borderColor: '#d1d5db' },
      ]
    },
    {
      id: 'hero',
      type: 'hero',
      title: 'Hero Section',
      content: 'Main hero with slider and call-to-action',
      visible: true,
      order: 2,
      position: { x: 0, y: 80, width: 100, height: 400 },
      backgroundColor: '#1f2937',
      elements: [
        { id: 'hero-title', type: 'text', content: 'Nerve Compression Headaches', props: { size: 'large' }, position: { x: 50, y: 50 }, size: { width: 400, height: 40 }, rotation: 0, opacity: 1, zIndex: 1, color: '#ffffff', backgroundColor: 'rgba(0,0,0,0)', borderColor: 'rgba(0,0,0,0)' },
        { id: 'hero-subtitle', type: 'text', content: 'Live a More Fulfilling Life After Treatment', props: { size: 'medium' }, position: { x: 50, y: 100 }, size: { width: 350, height: 30 }, rotation: 0, opacity: 1, zIndex: 1, color: '#ffffff', backgroundColor: 'rgba(0,0,0,0)', borderColor: 'rgba(0,0,0,0)' },
        { id: 'hero-cta', type: 'button', content: 'Read Stories', props: { variant: 'primary', href: '#news' }, position: { x: 50, y: 150 }, size: { width: 120, height: 40 }, rotation: 0, opacity: 1, zIndex: 1, color: '#ffffff', backgroundColor: '#10b981', borderColor: '#10b981' },
      ]
    },
    {
      id: 'about',
      type: 'about',
      title: 'About Section',
      content: 'Information about Dr. Blake and services',
      visible: true,
      order: 3,
      position: { x: 0, y: 480, width: 100, height: 300 },
      backgroundColor: '#ffffff',
      elements: [
        { id: 'about-title', type: 'text', content: 'Welcome to headacheMD', props: { size: 'large' }, position: { x: 0, y: 0 }, size: { width: 300, height: 40 }, rotation: 0, opacity: 1, zIndex: 1, color: '#1f2937', backgroundColor: 'rgba(0,0,0,0)', borderColor: 'rgba(0,0,0,0)' },
        { id: 'about-content', type: 'text', content: 'HeadacheMD is a network of medical practices focused on diagnosis and treatment of headaches and neck pain due to nerve compression.', props: {}, position: { x: 0, y: 50 }, size: { width: 500, height: 80 }, rotation: 0, opacity: 1, zIndex: 1, color: '#374151', backgroundColor: 'rgba(0,0,0,0)', borderColor: 'rgba(0,0,0,0)' },
        { id: 'dr-blake', type: 'text', content: 'Dr. Pamela Blake — Board Certified Neurologist', props: { emphasis: true }, position: { x: 0, y: 100 }, size: { width: 350, height: 25 }, rotation: 0, opacity: 1, zIndex: 1, color: '#1f2937', backgroundColor: 'rgba(0,0,0,0)', borderColor: 'rgba(0,0,0,0)' },
      ]
    },
    {
      id: 'news',
      type: 'news',
      title: 'News & Stories',
      content: 'Latest news and patient success stories',
      visible: true,
      order: 4,
      position: { x: 0, y: 780, width: 100, height: 250 },
      backgroundColor: '#f9fafb',
      elements: [
        { id: 'news-title', type: 'text', content: 'Latest News & Patient Success Stories', props: { size: 'large' }, position: { x: 0, y: 0 }, size: { width: 400, height: 40 }, rotation: 0, opacity: 1, zIndex: 1, color: '#1f2937', backgroundColor: 'rgba(0,0,0,0)', borderColor: 'rgba(0,0,0,0)' },
        { id: 'news-item-1', type: 'text', content: 'The Blake Method - Pioneered by Dr. Pamela Blake', props: { date: 'March 08, 2018' }, position: { x: 0, y: 50 }, size: { width: 350, height: 30 }, rotation: 0, opacity: 1, zIndex: 1, color: '#374151', backgroundColor: 'rgba(0,0,0,0)', borderColor: 'rgba(0,0,0,0)' },
        { id: 'news-item-2', type: 'text', content: 'Emotional Awareness - Headaches can be generated by your environment', props: { date: 'February 20, 2018' }, position: { x: 0, y: 100 }, size: { width: 400, height: 30 }, rotation: 0, opacity: 1, zIndex: 1, color: '#374151', backgroundColor: 'rgba(0,0,0,0)', borderColor: 'rgba(0,0,0,0)' },
      ]
    },
  ]);

  // Force re-render when sections change
  const [, forceUpdate] = useState({});

  // Handle mouse events for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('[data-drag-handle]')) {
      setIsDragging(true);
      const rect = editorRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setEditorPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove as any);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove as any);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  // Reset editor position when component mounts
  useEffect(() => {
    // Reset to visible position when component mounts
    setEditorPosition({ x: 0, y: 0 });
    
    // Cleanup function to reset position when component unmounts
    return () => {
      setEditorPosition({ x: -700, y: 0 });
    };
  }, []);

  const handleSectionReorder = (newOrder: PageSection[]) => {
    const updatedSections = newOrder.map((section, index) => ({
      ...section,
      order: index + 1
    }));
    setSections(updatedSections);
    onUpdatePage?.(updatedSections);
    forceUpdate({});
  };

  const toggleSectionVisibility = (sectionId: string) => {
    const updatedSections = sections.map(section =>
      section.id === sectionId ? { ...section, visible: !section.visible } : section
    );
    setSections(updatedSections);
    onUpdatePage?.(updatedSections);
    forceUpdate({});
  };

  const updateElementContent = (sectionId: string, elementId: string, content: string) => {
    const updatedSections = sections.map(section =>
      section.id === sectionId ? {
        ...section,
        elements: section.elements.map(element =>
          element.id === elementId ? { ...element, content } : element
        )
      } : section
    );
    setSections(updatedSections);
    onUpdatePage?.(updatedSections);
    forceUpdate({});
  };

  const updateElementPosition = (sectionId: string, elementId: string, x: number, y: number) => {
    const updatedSections = sections.map(section =>
      section.id === sectionId ? {
        ...section,
        elements: section.elements.map(element =>
          element.id === elementId ? { ...element, position: { x: isNaN(x) ? 0 : x, y: isNaN(y) ? 0 : y } } : element
        )
      } : section
    );
    setSections(updatedSections);
    onUpdatePage?.(updatedSections);
    forceUpdate({});
  };

  const updateElementSize = (sectionId: string, elementId: string, width: number, height: number) => {
    const updatedSections = sections.map(section =>
      section.id === sectionId ? {
        ...section,
        elements: section.elements.map(element =>
          element.id === elementId ? { ...element, size: { width: isNaN(width) ? 100 : width, height: isNaN(height) ? 20 : height } } : element
        )
      } : section
    );
    setSections(updatedSections);
    onUpdatePage?.(updatedSections);
    forceUpdate({});
  };

  const updateElementColor = (sectionId: string, elementId: string, colorType: 'color' | 'backgroundColor' | 'borderColor', value: string) => {
    const updatedSections = sections.map(section =>
      section.id === sectionId ? {
        ...section,
        elements: section.elements.map(element =>
          element.id === elementId ? { ...element, [colorType]: value } : element
        )
      } : section
    );
    setSections(updatedSections);
    onUpdatePage?.(updatedSections);
    forceUpdate({});
  };

  const updateSectionBackground = (sectionId: string, backgroundColor: string) => {
    const updatedSections = sections.map(section =>
      section.id === sectionId ? { ...section, backgroundColor } : section
    );
    setSections(updatedSections);
    onUpdatePage?.(updatedSections);
    forceUpdate({});
  };

  const updateElementRotation = (sectionId: string, elementId: string, rotation: number) => {
    const updatedSections = sections.map(section =>
      section.id === sectionId ? {
        ...section,
        elements: section.elements.map(element =>
          element.id === elementId ? { ...element, rotation: isNaN(rotation) ? 0 : rotation } : element
        )
      } : section
    );
    setSections(updatedSections);
    onUpdatePage?.(updatedSections);
    forceUpdate({});
  };

  const updateElementOpacity = (sectionId: string, elementId: string, opacity: number) => {
    const updatedSections = sections.map(section =>
      section.id === sectionId ? {
        ...section,
        elements: section.elements.map(element =>
          element.id === elementId ? { ...element, opacity: isNaN(opacity) ? 1 : Math.max(0, Math.min(1, opacity)) } : element
        )
      } : section
    );
    setSections(updatedSections);
    onUpdatePage?.(updatedSections);
    forceUpdate({});
  };

  const updateElementZIndex = (sectionId: string, elementId: string, zIndex: number) => {
    const updatedSections = sections.map(section =>
      section.id === sectionId ? {
        ...section,
        elements: section.elements.map(element =>
          element.id === elementId ? { ...element, zIndex: isNaN(zIndex) ? 1 : zIndex } : element
        )
      } : section
    );
    setSections(updatedSections);
    onUpdatePage?.(updatedSections);
    forceUpdate({});
  };

  const updateSectionPosition = (sectionId: string, x: number, y: number, width: number, height: number) => {
    const updatedSections = sections.map(section =>
      section.id === sectionId ? { 
        ...section, 
        position: { 
          x: isNaN(x) ? 0 : x, 
          y: isNaN(y) ? 0 : y, 
          width: isNaN(width) ? 100 : width, 
          height: isNaN(height) ? 80 : height 
        } 
      } : section
    );
    setSections(updatedSections);
    onUpdatePage?.(updatedSections);
    forceUpdate({});
  };

  const moveElement = (sectionId: string, elementId: string, direction: 'up' | 'down' | 'left' | 'right') => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    const element = section.elements.find(e => e.id === elementId);
    if (!element) return;

    let newX = element.position.x;
    let newY = element.position.y;

    switch (direction) {
      case 'up': newY -= stepSize; break;
      case 'down': newY += stepSize; break;
      case 'left': newX -= stepSize; break;
      case 'right': newX += stepSize; break;
    }

    updateElementPosition(sectionId, elementId, newX, newY);
  };

  const handleCanvasDrag = (sectionId: string, elementId: string, e: React.MouseEvent) => {
    if (!showCanvas) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    updateElementPosition(sectionId, elementId, x, y);
  };

  const addElement = (sectionId: string, type: 'text' | 'image' | 'button' | 'link') => {
    const newElement = {
      id: `${type}-${Date.now()}`,
      type,
      content: `New ${type}`,
      props: {},
      position: { x: 0, y: 0 },
      size: { width: 100, height: 20 },
      rotation: 0,
      opacity: 1,
      zIndex: 1,
      color: '#000000',
      backgroundColor: 'rgba(0,0,0,0)',
      borderColor: 'rgba(0,0,0,0)'
    };

    const updatedSections = sections.map(section =>
      section.id === sectionId ? {
        ...section,
        elements: [...section.elements, newElement]
      } : section
    );
    setSections(updatedSections);
    onUpdatePage?.(updatedSections);
    forceUpdate({});
  };

  const removeElement = (sectionId: string, elementId: string) => {
    const updatedSections = sections.map(section =>
      section.id === sectionId ? {
        ...section,
        elements: section.elements.filter(element => element.id !== elementId)
      } : section
    );
    setSections(updatedSections);
    onUpdatePage?.(updatedSections);
    forceUpdate({});
  };

  const getSectionColor = (type: string) => {
    switch (type) {
      case 'header': return 'bg-blue-100 border-blue-300';
      case 'hero': return 'bg-green-100 border-green-300';
      case 'about': return 'bg-purple-100 border-purple-300';
      case 'news': return 'bg-orange-100 border-orange-300';
      case 'footer': return 'bg-gray-100 border-gray-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  const getElementIcon = (type: string) => {
    switch (type) {
      case 'text': return '📝';
      case 'image': return '🖼️';
      case 'button': return '🔘';
      case 'link': return '🔗';
      default: return '📄';
    }
  };

  const selectedSectionData = sections.find(s => s.id === selectedSection);
  const selectedElementData = selectedSectionData?.elements.find(e => e.id === selectedElement);

  return (
    <>
      <motion.div 
        ref={editorRef}
        className="fixed h-full w-[700px] bg-white shadow-xl border-r z-[9999] cursor-move"
        style={{
          left: editorPosition.x,
          top: editorPosition.y,
        }}
        initial={{ x: -700, y: 0 }}
        animate={{ x: 0, y: 0 }}
        exit={{ x: -700 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <Card className="h-full rounded-none border-0 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between bg-gray-50 border-b cursor-move" data-drag-handle>
            <CardTitle className="flex items-center gap-2 text-sm">
              <GripVertical className="h-4 w-4 text-gray-500" />
              <Edit className="h-4 w-4" />
              Page Editor
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant={isEditMode ? "default" : "outline"}
                size="sm"
                onClick={() => setIsEditMode(!isEditMode)}
                className="text-xs"
              >
                {isEditMode ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </Button>
              <Button
                variant={showDetails ? "default" : "outline"}
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="text-xs"
              >
                <Info className="h-3 w-3" />
              </Button>
              <Button
                variant={granularMode ? "default" : "outline"}
                size="sm"
                onClick={() => setGranularMode(!granularMode)}
                className="text-xs"
              >
                <Settings className="h-3 w-3" />
              </Button>
              <Button
                variant={showCanvas ? "default" : "outline"}
                size="sm"
                onClick={() => setShowCanvas(!showCanvas)}
                className="text-xs"
              >
                <MousePointer className="h-3 w-3" />
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="text-xs"
                onClick={() => {
                  // Debug: Log all fixed elements
                  const fixedElements = document.querySelectorAll('[class*="fixed"]');
                  console.log('Fixed elements found:', fixedElements);
                  fixedElements.forEach((el, i) => {
                    console.log(`Element ${i}:`, el.className, el);
                  });
                }}
                title="Debug overlays"
              >
                🐛
              </Button>
              <Button size="sm" variant="outline" className="text-xs">
                <Save className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="outline" onClick={onClose} className="text-xs">
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-4 h-full overflow-y-auto flex flex-col">
            <div className="space-y-4 flex-1">
              <div className="text-xs text-gray-500 mb-4">
                {isEditMode ? (
                  <div className="space-y-2">
                    <p className="text-green-600 font-medium">✏️ Edit Mode - Drag sections to reorder</p>
                    {granularMode && (
                      <div className="flex items-center gap-2">
                        <label className="text-xs">Step Size:</label>
                        <select 
                          value={stepSize} 
                          onChange={(e) => setStepSize(parseInt(e.target.value))}
                          className="text-xs border rounded px-1"
                        >
                          <option value={1}>1px</option>
                          <option value={5}>5px</option>
                          <option value={10}>10px</option>
                          <option value={25}>25px</option>
                          <option value={50}>50px</option>
                        </select>
                      </div>
                    )}
                    {showCanvas && (
                      <p className="text-blue-600">🎨 Canvas Mode - Drag elements directly on the page</p>
                    )}
                  </div>
                ) : (
                  <p className="text-blue-600">👁️ Preview mode</p>
                )}
              </div>
              
              {isEditMode ? (
                <Reorder.Group
                  axis="y"
                  values={sections}
                  onReorder={handleSectionReorder}
                  className="space-y-3"
                >
                  {sections.map((section) => (
                    <Reorder.Item key={section.id} value={section}>
                      <motion.div
                        className={`${getSectionColor(section.type)} rounded-lg border p-3 hover:shadow-md transition-shadow ${
                          selectedSection === section.id ? 'ring-2 ring-blue-500' : ''
                        }`}
                        whileHover={{ scale: 1.01 }}
                        style={{ minHeight: '120px' }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="capitalize text-xs">
                              {section.type}
                            </Badge>
                            <Button
                              size="sm"
                              variant={section.visible ? "default" : "outline"}
                              onClick={() => toggleSectionVisibility(section.id)}
                              className="text-xs h-6"
                            >
                              {section.visible ? 'Visible' : 'Hidden'}
                            </Button>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSelectedSection(selectedSection === section.id ? null : section.id)}
                              className="h-6 w-6 p-0"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Move className="h-4 w-4 text-gray-500" />
                          </div>
                        </div>
                        
                        <div className="mb-2">
                          <h4 className="text-sm font-medium">{section.title}</h4>
                          <p className="text-xs text-gray-600">{section.content}</p>
                          {showDetails && (
                            <div className="mt-2 text-xs text-gray-500 space-y-1">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-xs font-medium">X:</label>
                                  <input
                                    type="number"
                                    value={section.position.x || 0}
                                    onChange={(e) => updateSectionPosition(section.id, parseInt(e.target.value) || 0, section.position.y, section.position.width, section.position.height)}
                                    className="w-full text-xs p-1 border rounded"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium">Y:</label>
                                  <input
                                    type="number"
                                    value={section.position.y || 0}
                                    onChange={(e) => updateSectionPosition(section.id, section.position.x, parseInt(e.target.value) || 0, section.position.width, section.position.height)}
                                    className="w-full text-xs p-1 border rounded"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium">Width (%):</label>
                                  <input
                                    type="number"
                                    value={section.position.width || 100}
                                    onChange={(e) => updateSectionPosition(section.id, section.position.x, section.position.y, parseInt(e.target.value) || 100, section.position.height)}
                                    className="w-full text-xs p-1 border rounded"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium">Height (px):</label>
                                  <input
                                    type="number"
                                    value={section.position.height || 80}
                                    onChange={(e) => updateSectionPosition(section.id, section.position.x, section.position.y, section.position.width, parseInt(e.target.value) || 80)}
                                    className="w-full text-xs p-1 border rounded"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-medium">Background Color:</label>
                                <input
                                  type="color"
                                  value={section.backgroundColor}
                                  onChange={(e) => updateSectionBackground(section.id, e.target.value)}
                                  className="w-full h-6 border rounded"
                                />
                              </div>
                              <p>Elements: {section.elements.length}</p>
                            </div>
                          )}
                        </div>

                        {selectedSection === section.id && (
                          <div className="space-y-2 mt-3 p-2 bg-white/50 rounded border">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium">Elements:</span>
                              <div className="flex gap-1">
                                <Button size="sm" variant="outline" className="text-xs h-6" onClick={() => addElement(section.id, 'text')}>
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="space-y-1">
                              {section.elements.map((element) => (
                                <div key={element.id} className={`p-2 bg-white rounded border ${
                                  selectedElement === element.id ? 'ring-2 ring-blue-400' : ''
                                }`} style={{ minHeight: '40px' }}>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs flex-shrink-0">{getElementIcon(element.type)}</span>
                                    <input
                                      type="text"
                                      value={element.content}
                                      onChange={(e) => updateElementContent(section.id, element.id, e.target.value)}
                                      className="flex-1 text-xs p-1 border rounded min-w-0"
                                      placeholder="Edit content..."
                                      onClick={() => setSelectedElement(element.id)}
                                    />
                                    <div className="flex gap-1 flex-shrink-0">
                                      {granularMode && (
                                        <>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => moveElement(section.id, element.id, 'left')}
                                            className="h-5 w-5 p-0"
                                            title={`Move left ${stepSize}px`}
                                          >
                                            <ArrowLeft className="h-3 w-3" />
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => moveElement(section.id, element.id, 'right')}
                                            className="h-5 w-5 p-0"
                                            title={`Move right ${stepSize}px`}
                                          >
                                            <ArrowRight className="h-3 w-3" />
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => moveElement(section.id, element.id, 'up')}
                                            className="h-5 w-5 p-0"
                                            title={`Move up ${stepSize}px`}
                                          >
                                            <ArrowUp className="h-3 w-3" />
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => moveElement(section.id, element.id, 'down')}
                                            className="h-5 w-5 p-0"
                                            title={`Move down ${stepSize}px`}
                                          >
                                            <ArrowDown className="h-3 w-3" />
                                          </Button>
                                        </>
                                      )}
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => removeElement(section.id, element.id)}
                                        className="h-5 w-5 p-0 text-red-500"
                                        title="Delete element"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                  {showDetails && selectedElement === element.id && (
                                    <div className="mt-2 text-xs text-gray-500 space-y-2">
                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <label className="block text-xs font-medium">X:</label>
                                          <input
                                            type="number"
                                            value={element.position.x || 0}
                                            onChange={(e) => updateElementPosition(section.id, element.id, parseInt(e.target.value) || 0, element.position.y)}
                                            className="w-full text-xs p-1 border rounded"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-xs font-medium">Y:</label>
                                          <input
                                            type="number"
                                            value={element.position.y || 0}
                                            onChange={(e) => updateElementPosition(section.id, element.id, element.position.x, parseInt(e.target.value) || 0)}
                                            className="w-full text-xs p-1 border rounded"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-xs font-medium">Width:</label>
                                          <input
                                            type="number"
                                            value={element.size.width || 100}
                                            onChange={(e) => updateElementSize(section.id, element.id, parseInt(e.target.value) || 100, element.size.height)}
                                            className="w-full text-xs p-1 border rounded"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-xs font-medium">Height:</label>
                                          <input
                                            type="number"
                                            value={element.size.height || 20}
                                            onChange={(e) => updateElementSize(section.id, element.id, element.size.width, parseInt(e.target.value) || 20)}
                                            className="w-full text-xs p-1 border rounded"
                                          />
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-3 gap-2">
                                        <div>
                                          <label className="block text-xs font-medium">Text Color:</label>
                                          <input
                                            type="color"
                                            value={element.color}
                                            onChange={(e) => updateElementColor(section.id, element.id, 'color', e.target.value)}
                                            className="w-full h-6 border rounded"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-xs font-medium">Background:</label>
                                          <input
                                            type="color"
                                            value={element.backgroundColor}
                                            onChange={(e) => updateElementColor(section.id, element.id, 'backgroundColor', e.target.value)}
                                            className="w-full h-6 border rounded"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-xs font-medium">Border:</label>
                                          <input
                                            type="color"
                                            value={element.borderColor}
                                            onChange={(e) => updateElementColor(section.id, element.id, 'borderColor', e.target.value)}
                                            className="w-full h-6 border rounded"
                                          />
                                        </div>
                                      </div>
                                      {granularMode && (
                                        <div className="grid grid-cols-2 gap-2">
                                          <div>
                                            <label className="block text-xs font-medium">Rotation:</label>
                                            <div className="flex gap-1">
                                              <Button size="sm" variant="ghost" className="h-5 w-5 p-0" onClick={() => updateElementRotation(section.id, element.id, element.rotation - 5)}>
                                                <RotateCcw className="h-3 w-3" />
                                              </Button>
                                              <input
                                                type="number"
                                                value={element.rotation || 0}
                                                onChange={(e) => updateElementRotation(section.id, element.id, parseInt(e.target.value) || 0)}
                                                className="flex-1 text-xs p-1 border rounded"
                                              />
                                              <Button size="sm" variant="ghost" className="h-5 w-5 p-0" onClick={() => updateElementRotation(section.id, element.id, element.rotation + 5)}>
                                                <RotateCw className="h-3 w-3" />
                                              </Button>
                                            </div>
                                          </div>
                                          <div>
                                            <label className="block text-xs font-medium">Opacity:</label>
                                            <input
                                              type="range"
                                              min="0"
                                              max="1"
                                              step="0.1"
                                              value={element.opacity}
                                              onChange={(e) => updateElementOpacity(section.id, element.id, parseFloat(e.target.value))}
                                              className="w-full"
                                            />
                                            <span className="text-xs">{Math.round(element.opacity * 100)}%</span>
                                          </div>
                                          <div>
                                            <label className="block text-xs font-medium">Z-Index:</label>
                                            <input
                                              type="number"
                                              value={element.zIndex || 1}
                                              onChange={(e) => updateElementZIndex(section.id, element.id, parseInt(e.target.value) || 1)}
                                              className="w-full text-xs p-1 border rounded"
                                            />
                                          </div>
                                        </div>
                                      )}
                                      <div>
                                        <p>Type: {element.type}</p>
                                        {Object.keys(element.props).length > 0 && (
                                          <p>Props: {Object.entries(element.props).map(([k, v]) => `${k}: ${v}`).join(', ')}</p>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              ) : (
                <div className="space-y-3">
                  {sections.map((section) => (
                    <div key={section.id} className={`${getSectionColor(section.type)} rounded-lg border p-3`}>
                      <Badge variant="outline" className="capitalize text-xs mb-2">
                        {section.type}
                      </Badge>
                      <h4 className="text-sm font-medium">{section.title}</h4>
                      <p className="text-xs text-gray-600">{section.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Visual Canvas */}
      {showCanvas && (
        <motion.div 
          className="fixed inset-0 bg-black/20 z-[9998] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="bg-white rounded-lg shadow-2xl w-[800px] h-[600px] relative overflow-hidden">
            <div className="absolute top-2 right-2 flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setShowCanvas(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 h-full overflow-auto">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className="relative mb-4 border-2 border-dashed border-gray-300 rounded"
                  style={{
                    backgroundColor: section.backgroundColor,
                    height: `${section.position.height}px`,
                    width: `${section.position.width}%`,
                    left: `${section.position.x}%`,
                    top: `${section.position.y}px`,
                  }}
                >
                  {section.elements.map((element) => (
                    <motion.div
                      key={element.id}
                      className={`absolute cursor-move border border-gray-300 rounded p-1 ${
                        selectedElement === element.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      style={{
                        left: `${element.position.x}px`,
                        top: `${element.position.y}px`,
                        width: `${element.size.width}px`,
                        height: `${element.size.height}px`,
                        color: element.color,
                        backgroundColor: element.backgroundColor,
                        borderColor: element.borderColor,
                        transform: `rotate(${element.rotation}deg)`,
                        opacity: element.opacity,
                        zIndex: element.zIndex,
                      }}
                      draggable
                      onDragStart={() => setDraggedElement(element.id)}
                      onDragEnd={() => setDraggedElement(null)}
                      onMouseDown={(e) => handleCanvasDrag(section.id, element.id, e)}
                      onClick={() => setSelectedElement(element.id)}
                    >
                      <div className="text-xs truncate">{element.content}</div>
                    </motion.div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}
