import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Shape {
  id: string;
  name: string;
  x: number;
  y: number;
  color: string;
  side: 'left' | 'right';
}

interface ShapeEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateShape: (shapeId: string, x: number, y: number) => void;
}

export const ShapeEditor = ({ isOpen, onClose, onUpdateShape }: ShapeEditorProps) => {
  const [shapes, setShapes] = useState<Shape[]>([
    { id: 'star', name: 'Star', x: 2.5, y: -19, color: '#000', side: 'left' },
    { id: 'purple-eclipse', name: 'Purple Eclipse', x: -12, y: -15, color: '#ab9ff2', side: 'left' },
    { id: 'black-eclipse', name: 'Black Eclipse', x: 5, y: -13, color: '#000', side: 'left' },
    { id: 'pink-eclipse', name: 'Pink Eclipse', x: 26, y: -16, color: '#ffdadc', side: 'left' },
    { id: 'orange-eclipse', name: 'Orange Eclipse', x: 11, y: -18, color: '#ff7243', side: 'right' },
    { id: 'green-eclipse', name: 'Green Eclipse', x: 12, y: -15, color: '#2ec08b', side: 'right' },
    { id: 'light-purple-eclipse', name: 'Light Purple Eclipse', x: 19, y: -16, color: '#e2dffd', side: 'right' },
    { id: 'yellow-eclipse', name: 'Yellow Eclipse', x: 20, y: -14, color: '#ffffc4', side: 'right' },
    { id: 'grey-eclipse', name: 'Grey Eclipse', x: 20, y: -26, color: '#d9d9d9', side: 'right' }
  ]);

  const updateShapePosition = useCallback((shapeId: string, axis: 'x' | 'y', delta: number) => {
    setShapes(prev => {
      const newShapes = prev.map(shape => {
        if (shape.id === shapeId) {
          const newValue = axis === 'x' ? shape.x + delta : shape.y + delta;
          return { ...shape, [axis]: newValue };
        }
        return shape;
      });
      
      // Use setTimeout to avoid state update during render
      setTimeout(() => {
        const updatedShape = newShapes.find(s => s.id === shapeId);
        if (updatedShape) {
          onUpdateShape(shapeId, updatedShape.x, updatedShape.y);
        }
      }, 0);
      
      return newShapes;
    });
  }, [onUpdateShape]);

  const setShapePosition = useCallback((shapeId: string, axis: 'x' | 'y', value: number) => {
    setShapes(prev => {
      const newShapes = prev.map(shape => {
        if (shape.id === shapeId) {
          return { ...shape, [axis]: value };
        }
        return shape;
      });
      
      // Use setTimeout to avoid state update during render
      setTimeout(() => {
        const updatedShape = newShapes.find(s => s.id === shapeId);
        if (updatedShape) {
          onUpdateShape(shapeId, updatedShape.x, updatedShape.y);
        }
      }, 0);
      
      return newShapes;
    });
  }, [onUpdateShape]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Shape Position Editor</h2>
          <Button onClick={onClose} variant="outline" size="sm">
            Close
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shapes.map((shape) => (
            <div key={shape.id} className="border p-4 rounded-lg bg-gray-50">
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="w-4 h-4 rounded-full border border-gray-300" 
                  style={{ backgroundColor: shape.color }}
                />
                <Label className="font-medium text-sm">{shape.name}</Label>
                <span className="text-xs text-gray-500">({shape.side})</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <Label htmlFor={`${shape.id}-x`} className="text-xs text-gray-600">
                    X Position (%)
                  </Label>
                  <Input
                    id={`${shape.id}-x`}
                    type="number"
                    step="0.5"
                    value={shape.x}
                    onChange={(e) => setShapePosition(shape.id, 'x', Number(e.target.value))}
                    className="mt-1 h-8 text-sm"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`${shape.id}-y`} className="text-xs text-gray-600">
                    Y Position (%)
                  </Label>
                  <Input
                    id={`${shape.id}-y`}
                    type="number"
                    step="0.5"
                    value={shape.y}
                    onChange={(e) => setShapePosition(shape.id, 'y', Number(e.target.value))}
                    className="mt-1 h-8 text-sm"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="w-full h-7 text-xs"
                    onClick={() => updateShapePosition(shape.id, 'x', -2)}
                  >
                    ← Left
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="w-full h-7 text-xs"
                    onClick={() => updateShapePosition(shape.id, 'x', 2)}
                  >
                    Right →
                  </Button>
                </div>
                <div className="space-y-1">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="w-full h-7 text-xs"
                    onClick={() => updateShapePosition(shape.id, 'y', -2)}
                  >
                    ↑ Up
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="w-full h-7 text-xs"
                    onClick={() => updateShapePosition(shape.id, 'y', 2)}
                  >
                    Down ↓
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-sm mb-2">Quick Tips:</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Use arrow buttons for small adjustments (2% steps)</li>
            <li>• Type exact values in the number inputs</li>
            <li>• Negative Y values move shapes up from the baseline</li>
            <li>• Left shapes use left-based positioning, right shapes use right-based</li>
          </ul>
        </div>
      </div>
    </div>
  );
};