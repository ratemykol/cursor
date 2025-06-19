import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ShapeEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateShapes: (shapes: any[]) => void;
}

export const ShapeEditor = ({ isOpen, onClose, onUpdateShapes }: ShapeEditorProps) => {
  const [shapes] = useState([
    { id: 'star', name: 'Star', x: 2.5, y: 6, color: '#000' },
    { id: 'purple-eclipse', name: 'Purple Eclipse', x: -12, y: 10, color: '#ab9ff2' },
    { id: 'black-eclipse', name: 'Black Eclipse', x: 5, y: 12, color: '#000' },
    { id: 'pink-eclipse', name: 'Pink Eclipse', x: 26, y: 9, color: '#ffdadc' },
    { id: 'orange-eclipse', name: 'Orange Eclipse', x: 89, y: 7, color: '#ff7243' },
    { id: 'green-eclipse', name: 'Green Eclipse', x: 88, y: 10, color: '#2ec08b' },
    { id: 'light-purple-eclipse', name: 'Light Purple Eclipse', x: 81, y: 9, color: '#e2dffd' },
    { id: 'yellow-eclipse', name: 'Yellow Eclipse', x: 80, y: 11, color: '#ffffc4' },
    { id: 'grey-eclipse', name: 'Grey Eclipse', x: 80, y: -1, color: '#d9d9d9' }
  ]);

  const handlePositionChange = (shapeId: string, axis: 'x' | 'y', value: number) => {
    // Update shape position logic here
    console.log(`Moving ${shapeId} ${axis} to ${value}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Shape Position Editor</h2>
          <Button onClick={onClose} variant="outline" size="sm">
            Close
          </Button>
        </div>
        
        <div className="space-y-4">
          {shapes.map((shape) => (
            <div key={shape.id} className="border p-4 rounded-lg">
              <div className="flex items-center gap-4 mb-2">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: shape.color }}
                />
                <Label className="font-medium">{shape.name}</Label>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`${shape.id}-x`} className="text-sm">
                    X Position (%)
                  </Label>
                  <Input
                    id={`${shape.id}-x`}
                    type="number"
                    defaultValue={shape.x}
                    onChange={(e) => handlePositionChange(shape.id, 'x', Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`${shape.id}-y`} className="text-sm">
                    Y Position (%)
                  </Label>
                  <Input
                    id={`${shape.id}-y`}
                    type="number"
                    defaultValue={shape.y}
                    onChange={(e) => handlePositionChange(shape.id, 'y', Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="flex gap-2 mt-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handlePositionChange(shape.id, 'x', shape.x - 5)}
                >
                  ← Left
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handlePositionChange(shape.id, 'x', shape.x + 5)}
                >
                  Right →
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handlePositionChange(shape.id, 'y', shape.y - 5)}
                >
                  ↑ Up
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handlePositionChange(shape.id, 'y', shape.y + 5)}
                >
                  Down ↓
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};