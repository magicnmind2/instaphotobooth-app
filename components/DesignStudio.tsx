import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Text, Image as KonvaImage, Transformer } from 'react-konva';
import { DesignLayout, DesignElement, TextElement, ImageElement } from '../types';
import { ImageIcon, TextIcon } from './icons';
import Konva from 'konva';

interface DesignStudioProps {
  onSave: (layout: DesignLayout) => void;
  existingLayout: DesignLayout | null;
  onExit: () => void;
}

const FONT_FACES = ['Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Georgia', 'Palatino', 'Garamond', 'Comic Sans MS', 'Trebuchet MS'];
const STAGE_WIDTH = 500;
const STAGE_HEIGHT = 500;

const ElementTransformer: React.FC<{ selectedNode: Konva.Node | undefined }> = ({ selectedNode }) => {
    const trRef = useRef<Konva.Transformer>(null);

    useEffect(() => {
        if (trRef.current) {
            if (selectedNode) {
                trRef.current.nodes([selectedNode]);
            } else {
                trRef.current.nodes([]);
            }
            trRef.current.getLayer()?.batchDraw();
        }
    }, [selectedNode]);

    return (
        <Transformer
            ref={trRef}
            boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 5 || newBox.height < 5) {
                    return oldBox;
                }
                return newBox;
            }}
        />
    );
};

// This component correctly handles loading images for Konva
const KonvaElementNode: React.FC<{
    element: DesignElement;
    onSelect: () => void;
    onUpdate: (attrs: Partial<DesignElement>) => void;
}> = ({ element, onSelect, onUpdate }) => {
    const [image, setImage] = useState<HTMLImageElement | null>(null);

    useEffect(() => {
        if (element.type === 'image') {
            const img = new window.Image();
            img.src = element.src;
            img.crossOrigin = 'Anonymous';
            img.onload = () => setImage(img);
        }
    }, [element]);

    if (element.type === 'text') {
        return (
            <Text
                {...element}
                draggable
                onClick={onSelect}
                onTap={onSelect}
                onTransformEnd={(e) => {
                    const node = e.target as Konva.Text;
                    const scaleX = node.scaleX();
                    // update state with new size and scale
                    onUpdate({
                        x: node.x(),
                        y: node.y(),
                        scaleX: 1,
                        scaleY: 1,
                        rotation: node.rotation(),
                        fontSize: Math.round(node.fontSize() * scaleX)
                    });
                }}
                onDragEnd={(e) => onUpdate({ x: e.target.x(), y: e.target.y() })}
            />
        );
    }

    if (element.type === 'image' && image) {
        return (
            <KonvaImage
                {...(element as ImageElement)}
                image={image}
                draggable
                onClick={onSelect}
                onTap={onSelect}
                onTransformEnd={(e) => {
                    const node = e.target;
                    onUpdate({ x: node.x(), y: node.y(), scaleX: node.scaleX(), scaleY: node.scaleY(), rotation: node.rotation() });
                }}
                onDragEnd={(e) => onUpdate({ x: e.target.x(), y: e.target.y() })}
            />
        );
    }

    return null;
}


export const DesignStudio: React.FC<DesignStudioProps> = ({ onSave, existingLayout, onExit }) => {
    const [elements, setElements] = useState<DesignElement[]>(existingLayout?.elements || []);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const stageRef = useRef<Konva.Stage>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const selectedElement = elements.find(el => el.id === selectedId);

    const checkDeselect = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
        const clickedOnEmpty = e.target === e.target.getStage();
        if (clickedOnEmpty) {
            setSelectedId(null);
        }
    };
    
    const addText = () => {
        const newText: TextElement = {
            id: 'text_' + Date.now(),
            type: 'text',
            text: 'Your Text Here',
            x: STAGE_WIDTH / 2,
            y: STAGE_HEIGHT / 2,
            fontSize: 40,
            fontFamily: 'Arial',
            fill: '#ffffff',
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
        };
        setElements([...elements, newText]);
        setSelectedId(newText.id);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (readEvent) => {
                const newImage: ImageElement = {
                    id: 'img_' + Date.now(),
                    type: 'image',
                    src: readEvent.target?.result as string,
                    x: STAGE_WIDTH / 2,
                    y: STAGE_HEIGHT / 2,
                    rotation: 0,
                    scaleX: 0.5,
                    scaleY: 0.5,
                };
                setElements([...elements, newImage]);
                setSelectedId(newImage.id);
            };
            reader.readAsDataURL(file);
        }
        e.target.value = ''; // Reset input
    };

    const updateElement = (id: string, attrs: Partial<DesignElement>) => {
        setElements(prev => prev.map(el => el.id === id ? { ...el, ...attrs } as DesignElement : el));
    };

    const deleteSelected = () => {
        if (!selectedId) return;
        setElements(prev => prev.filter(el => el.id !== selectedId));
        setSelectedId(null);
    }
    
    const handleSave = () => {
        onSave({ elements });
    }

    const renderPropertiesPanel = () => {
        if (!selectedElement) return null;

        return (
             <div className="bg-gray-800 rounded-lg p-4 space-y-4">
                <h3 className="text-lg font-bold border-b border-gray-700 pb-2">Edit Element</h3>
                {selectedElement.type === 'text' && (
                    <>
                        <div>
                            <label className="text-sm text-gray-400">Text</label>
                            <input type="text" value={(selectedElement as TextElement).text} onChange={e => updateElement(selectedId!, { text: e.target.value })} className="w-full bg-gray-700 p-2 rounded" />
                        </div>
                        <div>
                            <label className="text-sm text-gray-400">Font</label>
                            <select value={(selectedElement as TextElement).fontFamily} onChange={e => updateElement(selectedId!, { fontFamily: e.target.value })} className="w-full bg-gray-700 p-2 rounded">
                                {FONT_FACES.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="text-sm text-gray-400">Color</label>
                            <input type="color" value={(selectedElement as TextElement).fill} onChange={e => updateElement(selectedId!, { fill: e.target.value })} className="w-full h-10 p-1 bg-gray-700 rounded" />
                        </div>
                    </>
                )}
                <button onClick={deleteSelected} className="w-full bg-red-600 hover:bg-red-700 p-2 rounded font-bold">Delete</button>
             </div>
        )
    }

    return (
        <div className="flex flex-col lg:flex-row h-screen w-screen bg-black text-white p-4 gap-4">
            {/* Toolbar & Properties */}
            <div className="w-full lg:w-80 bg-gray-900 rounded-xl p-4 flex flex-col gap-4 overflow-y-auto">
                <h1 className="text-2xl font-bold">Photo Design Studio</h1>
                <p className="text-sm text-gray-400">Design an overlay for your photos. What you see here will appear on every picture you take.</p>
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={addText} className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 p-3 rounded-lg font-semibold"><TextIcon className="w-6 h-6"/> Add Text</button>
                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 p-3 rounded-lg font-semibold"><ImageIcon className="w-6 h-6"/> Add Image</button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg" className="hidden"/>
                </div>
                
                {renderPropertiesPanel()}

                <div className="mt-auto space-y-2">
                    <button onClick={handleSave} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-4 rounded-xl text-xl">Save & Start Booth</button>
                    <button onClick={onExit} className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-xl text-md">Exit to Home</button>
                </div>
            </div>

            {/* Canvas */}
            <div className="flex-grow flex items-center justify-center bg-gray-900 rounded-xl p-4">
                <div className="relative" style={{ width: STAGE_WIDTH, height: STAGE_HEIGHT }}>
                    <div className="absolute inset-0 bg-cover bg-center rounded-lg opacity-40" style={{ backgroundImage: "url('https://storage.googleapis.com/maker-studio-project-media-prod/1f9b3b55-25ba-4ac7-959c-35071a938883/images/b9d4e51a-4f48-4091-886f-23f21132f831.png')" }}></div>
                     <Stage
                        width={STAGE_WIDTH}
                        height={STAGE_HEIGHT}
                        onMouseDown={checkDeselect}
                        onTouchStart={checkDeselect}
                        ref={stageRef}
                        className="border-2 border-dashed border-gray-600 rounded-lg"
                    >
                        <Layer>
                            {elements.map((element) => (
                                <KonvaElementNode
                                    key={element.id}
                                    element={element}
                                    onSelect={() => setSelectedId(element.id)}
                                    onUpdate={(attrs) => updateElement(element.id, attrs)}
                                />
                            ))}
                            <ElementTransformer selectedNode={stageRef.current?.findOne('#' + selectedId)} />
                        </Layer>
                    </Stage>
                </div>
            </div>
        </div>
    );
};