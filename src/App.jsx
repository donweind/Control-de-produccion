import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { 
  Upload, X, Image as ImageIcon, Map as MapIcon, Trash2, Loader2, MonitorPlay, 
  Type, Bold, Italic, ZoomIn, ZoomOut, Maximize, Download as DownloadIcon, 
  Save, FolderOpen, TriangleAlert, Flame, Zap, Skull, HeartPulse, DoorOpen, 
  Info, LayoutTemplate, Edit, Users, Lock, ShieldCheck, FileJson, Filter,
  Eye, EyeOff, LogOut, Settings, MousePointer2, CheckCircle2, Clock, AlertOctagon, FileImage, ArrowRight, Circle, FileText, FileBadge, Layers, Database, RefreshCcw, LayoutGrid, Grid
} from 'lucide-react';

/* --- CLAVE DE ALMACENAMIENTO LOCAL --- */
const STORAGE_KEY = 'prod_canete_v2_data';

/* --- CURSORES PERSONALIZADOS (NEGROS) --- */
const cursorGrab = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewport='0 0 32 32' style='fill:black;stroke:white;stroke-width:1px;'><path d='M16.5,20.5 C16.5,20.5 16,16 16,14 C16,11 17,11 17,14 C17,16 17.5,16 17.5,16 C17.5,16 17.5,12 18,11 C18.5,10 19.5,10 19.5,11 C19.5,13 19.5,16 19.5,16 C19.5,16 20,13 20.5,12 C21,11 22,11 22,12 C22,13 22,16 22,16 C22,16 23,14 23.5,14 C24.5,14 25,15 25,16 C25,22 22,26 19,28 C16,30 12,28 11,24 C10,20 12,20 13,20 C13,20 12.5,16 12.5,13 C12.5,10 13.5,10 14,11 C14.5,12 14.5,15 14.5,16 C14.5,16 14.5,13 15,12 C15.5,11 16.5,11 16.5,12 C16.5,13 16.5,16 16.5,16 L16.5,20.5 Z' fill='black' stroke='white' stroke-width='1.5'/></svg>") 16 16, grab`;

const cursorGrabbing = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewport='0 0 32 32' style='fill:black;stroke:white;stroke-width:1px;'><path d='M16.5,20.5 C16.5,20.5 16,16 16,14 C16,11 17,11 17,14 C17,16 17.5,16 17.5,16 C17.5,16 17.5,12 18,11 C18.5,10 19.5,10 19.5,11 C19.5,13 19.5,16 19.5,16 C19.5,16 20,13 20.5,12 C21,11 22,11 22,12 C22,13 22,16 22,16 C22,16 23,14 23.5,14 C24.5,14 25,15 25,16 C25,22 22,26 19,28 C16,30 12,28 11,24 C10,20 12,20 13,20 C13,20 12.5,16 12.5,13 C12.5,10 13.5,10 14,11 C14.5,12 14.5,15 14.5,16 C14.5,16 14.5,13 15,12 C15.5,11 16.5,11 16.5,12 C16.5,13 16.5,16 16.5,16 L16.5,20.5 Z' fill='black' stroke='white' stroke-width='1.5' transform='translate(0, 2) scale(0.9)'/></svg>") 16 16, grabbing`;

/* --- CONFIGURACIÓN & CONSTANTES --- */

const generatePalette = (hue, saturation) => 
  Array.from({ length: 6 }).map((_, i) => `hsl(${hue}, ${saturation}%, ${90 - (i * 12)}%)`);

const PRIMARY_PALETTES = {
  'Rojos': generatePalette(0, 85),
  'Azules': generatePalette(220, 90),
  'Amarillos': generatePalette(45, 95),
  'Grises / Negro': generatePalette(0, 0),
};

const MATTE_PALETTE_TEXT = ['#64748b', '#78716c', '#57534e', '#475569', '#334155', '#0f172a'];

const RECT_PALETTES = {
  'Verde Monocromo': ['#dcfce7', '#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#16a34a'],
  'Amarillo Monocromo': ['#fef9c3', '#fef08a', '#fde047', '#facc15', '#eab308', '#ca8a04'],
};

const MATTE_OPTIONS = {
  light: ['#e2e8f0', '#cbd5e1', '#d1fae5', '#dbeafe', '#fae8ff', '#fef3c7'],
  dark: ['#0f172a', '#334155', '#064e3b', '#1e3a8a', '#581c87', '#78350f']
};

const MARKER_STYLES = {
  green: { bg: '#16a34a', text: '#ffffff', border: 'none', radius: '0px' }, 
  yellow: { bg: '#facc15', text: '#000000', border: 'none', radius: '0px' },
  blue: { bg: '#1e40af', text: '#ffffff', border: 'none', radius: '0px' }, // NUEVO ESTILO AZUL
  dotted: { bg: 'transparent', text: '#000000', border: '2px dotted', radius: '50%' } 
};

const SAFETY_ICONS = {
  'warning': { icon: TriangleAlert, label: 'Advertencia', defaultColor: '#eab308', bg: '#fef9c3' },
  'fire': { icon: Flame, label: 'Incendio', defaultColor: '#dc2626', bg: '#fee2e2' },
  'electric': { icon: Zap, label: 'Alto Voltaje', defaultColor: '#ca8a04', bg: '#fef08a' },
  'danger': { icon: Skull, label: 'Peligro Mortal', defaultColor: '#000000', bg: '#f3f4f6' },
  'medical': { icon: HeartPulse, label: 'Primeros Auxilios', defaultColor: '#16a34a', bg: '#dcfce7' },
  'exit': { icon: DoorOpen, label: 'Salida', defaultColor: '#15803d', bg: '#dcfce7' },
  'info': { icon: Info, label: 'Información', defaultColor: '#2563eb', bg: '#dbeafe' },
};

const BASE_MARKER_SIZE_PX = 24; 

/* --- COMPONENTES EXTRAÍDOS --- */

const ElementWrapper = React.memo(({ children, point, isSelected, readOnly, onMouseDown, onDoubleClick }) => {
  return (
    <div 
      onMouseDown={(e) => {
        if (!readOnly) {
            e.stopPropagation(); 
            onMouseDown(e, point.id);
        }
      }} 
      onDoubleClick={(e) => {
        e.stopPropagation(); 
        onDoubleClick(e, point.id);
      }}
      onClick={(e) => {
          e.stopPropagation();
          if(readOnly) onDoubleClick(e, point.id); 
      }}
      className={`absolute flex items-center justify-center select-none transition-transform duration-200 
        ${isSelected ? 'z-50 scale-110' : 'z-20'}`} 
      style={{ 
        left: `${point.x}%`, 
        top: `${point.y}%`,
        transform: 'translate(-50%, -50%)' 
      }}
    >
      {children}
    </div>
  );
});

// NUEVO COMPONENTE INTELIGENTE: Tarjeta de Imagen para modo "ALL"
const ImageCardElement = React.memo(({ point, isSelected, onMouseDown, onDoubleClick }) => {
    return (
        <div 
            // z-index altísimo en hover (9999) asegura que tape a todo lo demás al interactuar
            className="group relative flex flex-col items-center hover:z-[9999] transition-all duration-200 ease-out" 
            style={{ 
                position: 'absolute',
                left: `${point.x}%`,
                top: `${point.y}%`,
                transform: 'translate(-50%, -50%)'
            }}
            onMouseDown={(e) => { e.stopPropagation(); onMouseDown(e, point.id); }}
            onDoubleClick={(e) => { e.stopPropagation(); onDoubleClick(e, point.id); }}
        >
            {/* DISEÑO DE TARJETA INTELIGENTE:
               1. Estado Normal: Cuadrado limpio con imagen (w-28 h-28), sin textos grandes que molesten.
               2. Estado Hover: Se expande a w-80, muestra imagen grande y detalles completos.
            */}
            <div className={`
                bg-white rounded-xl shadow-lg border-2 border-white overflow-hidden 
                transition-all duration-300 origin-center
                w-28 h-28  /* Tamaño base visible en el mapa */
                group-hover:w-80 group-hover:h-auto /* Tamaño expandido al pasar el cursor */
                group-hover:shadow-2xl group-hover:border-blue-600
                flex flex-col
                ${isSelected ? 'ring-4 ring-blue-500 scale-110 z-[100]' : ''}
            `}>
                {/* Imagen */}
                <div className="relative w-full h-full group-hover:h-64 bg-gray-100 flex-shrink-0 transition-all duration-300">
                    {point.image ? (
                        <img src={point.image} alt={point.label} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-blue-200 bg-slate-50">
                            <ImageIcon size={32} className="group-hover:scale-150 transition-transform"/>
                        </div>
                    )}
                    
                    {/* Etiqueta flotante pequeña solo en vista normal (para identificar rápido) */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-[2px] text-white text-[9px] font-bold py-1 text-center truncate px-1 group-hover:hidden">
                        {point.code || point.label}
                    </div>
                </div>
                
                {/* Info Completa (Solo visible al expandir/hover) */}
                <div className="hidden group-hover:flex flex-col p-4 bg-white text-center animate-in fade-in slide-in-from-top-2 duration-200">
                    <p className="text-sm font-black text-gray-900 leading-tight break-words uppercase">
                        {point.label}
                    </p>
                    <div className="mt-2 pt-2 border-t border-gray-100">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                            <FileBadge size={12}/> {point.code || 'S/C'}
                        </span>
                    </div>
                    {point.description && (
                        <p className="text-xs text-gray-500 mt-2 text-left bg-gray-50 p-2 rounded border border-gray-100 italic">
                            {point.description}
                        </p>
                    )}
                </div>
            </div>
            
            {/* Puntero visual (flecha) que aparece solo al agrandar */}
            <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-blue-600 shadow-sm mt-[-2px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
    );
});

const SafetyElement = React.memo(({ point, isSelected, readOnly, onMouseDown, onDoubleClick }) => {
  const config = SAFETY_ICONS[point.safetyType] || SAFETY_ICONS.warning;
  const IconComponent = config.icon;
  const size = 32 * (point.scaleX || 1); 

  return (
   <ElementWrapper point={point} isSelected={isSelected} readOnly={readOnly} onMouseDown={onMouseDown} onDoubleClick={onDoubleClick}>
     {point.safetyType === 'custom' && point.customSafetyIcon ? (
         <div style={{ width: `${size}px`, height: `${size}px` }} className="relative">
             <img src={point.customSafetyIcon} className="w-full h-full object-contain drop-shadow-sm" alt="custom safety" />
         </div>
     ) : (
         <div className="flex items-center justify-center rounded-full shadow-md transition-shadow duration-300"
             style={{
                 backgroundColor: point.markerColor || config.bg, 
                 color: point.textColor || config.defaultColor, 
                 width: `${size}px`, height: `${size}px`,
                 border: `2px solid ${point.textColor || config.defaultColor}`
             }}> 
         <IconComponent size={size * 0.6} strokeWidth={2.5} />
         </div>
     )}
   </ElementWrapper>
  );
});

const MarkerElement = React.memo(({ point, isSelected, readOnly, onMouseDown, onDoubleClick }) => {
  const config = point.style === 'dotted-black' ? MARKER_STYLES.dotted : MARKER_STYLES[point.style] || MARKER_STYLES.green;
  const isDotted = point.style === 'dotted-black';
  const displayBg = isDotted ? (point.markerColor || MATTE_OPTIONS.light[0]) : (point.markerColor || config.bg);
  const displayText = point.textColor || config.text;
  
  const containerStyle = isDotted ? {
    backgroundColor: displayBg, color: displayText, border: `2px dotted ${displayText}`, width: `${BASE_MARKER_SIZE_PX}px`, height: `${BASE_MARKER_SIZE_PX}px`, borderRadius: '50%', whiteSpace: 'nowrap'
  } : {
    backgroundColor: point.markerColor || config.bg, color: point.textColor || config.text, width: `${BASE_MARKER_SIZE_PX}px`, height: `${BASE_MARKER_SIZE_PX}px`, borderRadius: config.radius, border: config.border, boxShadow: isSelected ? '0 10px 15px rgba(0,0,0,0.3)' : '0 4px 6px rgba(0,0,0,0.1)', whiteSpace: 'nowrap'
  };

  const fontSize = point.markerFontSize || 10;

  return (
    <ElementWrapper point={point} isSelected={isSelected} readOnly={readOnly} onMouseDown={onMouseDown} onDoubleClick={onDoubleClick}>
      <div style={{ transform: `scale(${point.scaleX || 1}, ${point.scaleY || 1})` }}>
        <div className="flex items-center justify-center font-bold overflow-hidden shadow-sm transition-shadow duration-300" 
             style={{...containerStyle, fontSize: `${fontSize}px`}}> 
          {/* ELIMINADO: Ya no mostramos la etiqueta dentro del cuadrado */}
        </div>
      </div>
    </ElementWrapper>
  );
});

const TextElement = React.memo(({ point, isSelected, readOnly, onMouseDown, onDoubleClick }) => {
  const fonts = { 'sans': 'font-sans', 'serif': 'font-serif', 'mono': 'font-mono' };
  return (
    <ElementWrapper point={point} isSelected={isSelected} readOnly={readOnly} onMouseDown={onMouseDown} onDoubleClick={onDoubleClick}>
      <div 
        className={`whitespace-nowrap transition-all duration-200 ${fonts[point.fontFamily || 'sans']} ${point.isBold ? 'font-bold' : ''} ${point.isItalic ? 'italic' : ''}`}
        style={{ fontSize: `${point.fontSize}px`, color: point.color, textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}>
        {point.label}
      </div>
    </ElementWrapper>
  );
});

const Popup = React.memo(({ point, onClose }) => {
  const isRightHalf = point.x > 50;
  
  const style = {
    position: 'absolute', 
    zIndex: 100, 
    width: '380px', 
    [isRightHalf ? 'right' : 'left']: isRightHalf ? `${100 - point.x + 1.5}%` : `${point.x + 1.5}%`,
    top: `${point.y}%`, 
    transform: 'translate(0, -50%)'
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-2xl p-0 overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-100 flex flex-col" 
      style={style}
      onMouseDown={(e) => e.stopPropagation()} 
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-start gap-2">
        <div className="flex flex-col gap-1 flex-1">
            {/* Se quitó truncate para permitir múltiples líneas */}
            <h3 className="font-black text-gray-900 text-lg leading-tight break-words">{point.label}</h3>
            {point.place && (
                <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                    <MapIcon size={12} /> {point.place}
                </div>
            )}
            <div className="flex flex-wrap gap-2 mt-1">
                {/* Mostramos el Código si existe */}
                {point.code && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
                        <FileBadge size={8}/> CÓDIGO: {point.code}
                    </span>
                )}
            </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50 flex-shrink-0">
          <X size={16} />
        </button>
      </div>
      
      {point.image ? (
        <div className="relative h-80 bg-gray-100">
           <img src={point.image} alt={point.label} className="w-full h-full object-cover" />
           <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
        </div>
      ) : (
        <div className="h-24 bg-gray-50 flex items-center justify-center text-gray-300">
          <ImageIcon size={32} />
        </div>
      )}
      
      <div className="p-4 bg-white">
         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Descripción</p>
         <p className="text-sm text-gray-700 leading-relaxed">
           {point.description || <span className="italic text-gray-400">Sin descripción disponible.</span>}
         </p>
      </div>
    </div>
  );
});

// Componente optimizado para renderizar el contenido del mapa
const MapContent = React.memo(({ 
    mapImage, 
    imgRef, // Added ref prop
    points, 
    selectedPointId, 
    isReadOnly, 
    onMouseDown, 
    onDoubleClick, 
    onClosePopup,
    showAllMode
}) => {
    return (
        <>
            <img 
                ref={imgRef} // Attached ref
                src={mapImage} 
                alt="Plano" 
                draggable="false" 
                className="pointer-events-none block max-w-none" 
            />
            {points.map(point => (
                <React.Fragment key={point.id}>
                    {/* LÓGICA DE MODO ALL: Si está activo y es un marcador, usa ImageCardElement */}
                    {showAllMode && point.type === 'marker' ? (
                        <ImageCardElement 
                            point={point} 
                            isSelected={selectedPointId === point.id} 
                            onMouseDown={onMouseDown} 
                            onDoubleClick={onDoubleClick} 
                        />
                    ) : (
                        // Lógica Normal
                        point.type === 'text' 
                          ? <TextElement point={point} isSelected={selectedPointId === point.id} readOnly={isReadOnly} onMouseDown={onMouseDown} onDoubleClick={onDoubleClick} /> 
                          : point.type === 'safety' 
                          ? <SafetyElement point={point} isSelected={selectedPointId === point.id} readOnly={isReadOnly} onMouseDown={onMouseDown} onDoubleClick={onDoubleClick} />
                          : <MarkerElement point={point} isSelected={selectedPointId === point.id} readOnly={isReadOnly} onMouseDown={onMouseDown} onDoubleClick={onDoubleClick} />
                    )}
                    
                    {/* Popups solo si NO estamos en modo ALL, o si se quiere ver detalle completo aun en modo ALL (opcional, aqui lo dejo standard) */}
                    {!showAllMode && selectedPointId === point.id && (point.type === 'marker' || point.type === 'safety') && (<Popup point={point} onClose={onClosePopup} />)}
                </React.Fragment>
            ))}
        </>
    );
});

/* --- APP PRINCIPAL --- */

export default function App() {
  /* --- ESTADOS DEL SISTEMA --- */
  const [currentScreen, setCurrentScreen] = useState('landing');
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [adminPreviewMode, setAdminPreviewMode] = useState(false);
  const [showAllMode, setShowAllMode] = useState(false); // NUEVO ESTADO PARA MODO "ALL"

  /* --- ESTADOS DEL MAPA (Multi-Nivel) CON PERSISTENCIA --- */
  const [levels, setLevels] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Si hay datos antiguos con 'tierra', los usamos pero ignoramos los otros niveles.
        if (parsed.levels && parsed.levels.tierra) {
             return {
                 tierra: { ...parsed.levels.tierra, label: 'Piso Central', short: 'PC' }
             };
        }
      }
    } catch (e) {
      console.error("Error cargando datos locales:", e);
    }
    // Valores por defecto: SOLO PISO CENTRAL
    return {
      tierra: { id: 'tierra', label: 'Piso Central', short: 'PC', mapImage: null, points: [] },
    };
  });

  const [currentLevelId, setCurrentLevelId] = useState('tierra');

  const currentLevel = levels[currentLevelId];
  const mapImage = currentLevel.mapImage;
  const points = currentLevel.points;

  /* --- EFECTO DE AUTO-GUARDADO --- */
  useEffect(() => {
    try {
      // Guardar el estado completo cada vez que cambie algo importante
      const dataToSave = { levels, currentLevelId };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.warn("No se pudo guardar automáticamente. Probablemente la imagen es muy grande para el almacenamiento local.", e);
    }
  }, [levels, currentLevelId]);

  /* --- OTROS ESTADOS --- */
  const [selectedPointId, setSelectedPointId] = useState(null);
  const [tool, setTool] = useState('marker'); 
  // ELIMINADO filterPriority y setFilterPriority
  const [matteShade, setMatteShade] = useState('light');
  const [draggingElementId, setDraggingElementId] = useState(null); 
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [isDrag, setIsDrag] = useState(false); 
  const [isProcessingPDF, setIsProcessingPDF] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [bulkImportText, setBulkImportText] = useState('');
  
  const mapRef = useRef(null);
  const imgRef = useRef(null);
  const containerRef = useRef(null); 
  const fileInputRef = useRef(null); 
  const mapInputRef = useRef(null); 
  const jsonInputRef = useRef(null);

  useEffect(() => {
    if (!window.pdfjsLib) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.onload = () => {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        };
        document.body.appendChild(script);
    }
  }, []);

  /* --- MANEJO DE ESTADO MULTI-NIVEL (Setters Wrappers) --- */
  const setMapImageForLevel = (img) => {
      setLevels(prev => ({
          ...prev,
          [currentLevelId]: { ...prev[currentLevelId], mapImage: img }
      }));
  };

  const setPointsForLevel = (newPointsOrUpdater) => {
      setLevels(prev => {
          const currentPoints = prev[currentLevelId].points;
          const nextPoints = typeof newPointsOrUpdater === 'function' 
              ? newPointsOrUpdater(currentPoints) 
              : newPointsOrUpdater;
          return {
              ...prev,
              [currentLevelId]: { ...prev[currentLevelId], points: nextPoints }
          };
      });
  };

  const handleLevelChange = (levelId) => {
      setCurrentLevelId(levelId);
      setSelectedPointId(null);
  };

  /* --- LÓGICA DE NAVEGACIÓN Y LOGIN --- */
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (password === '112358') {
      setIsAdmin(true);
      setCurrentScreen('editor');
      setLoginError(false);
      setPassword('');
      setAdminPreviewMode(false);
    } else {
      setLoginError(true);
    }
  };

  const handleFabricationEntry = () => {
    setIsAdmin(false);
    // Verificamos si ya hay mapas cargados (desde localStorage o reciente)
    const hasAnyMap = Object.values(levels).some(l => l.mapImage !== null);
    if (hasAnyMap) {
        setCurrentScreen('fabrication_view');
        setZoom(1); 
        setPan({x:0, y:0});
    } else {
        setCurrentScreen('fabrication_load');
    }
  };

  const handleExitToLanding = () => {
    setCurrentScreen('landing');
    setIsAdmin(false); 
    setZoom(1);
    setPan({x:0, y:0});
    setShowAllMode(false); // Resetear modo ALL al salir
  };

  const handleCloseProject = () => {
      if(window.confirm("ATENCIÓN: Esto borrará TODOS los datos, mapas y puntos guardados. ¿Estás seguro de reiniciar el proyecto?")) {
          localStorage.removeItem(STORAGE_KEY); // Limpiar almacenamiento local
          setLevels({
            tierra: { id: 'tierra', label: 'Piso Central', short: 'PC', mapImage: null, points: [] },
          });
          setCurrentLevelId('tierra');
          setSelectedPointId(null);
          setCurrentScreen('fabrication_load');
      }
  };

  /* --- LOGICA IMPORTACION MASIVA --- */
  const handleBulkProcess = () => {
      if (!bulkImportText.trim()) return;
      
      const lines = bulkImportText.split('\n');
      const newPoints = lines.map((line, index) => {
          let parts;
          if (line.includes('\t')) {
              parts = line.split('\t');
          } else {
              parts = line.split(/[,;]+/).map(s => s.trim());
          }
          
          if (parts.length < 1 || !parts[0]) return null;

          const labelRaw = parts[0]?.trim() || ''; 
          // Adaptación simple para la nueva lógica: solo nos importa Nombre y Código si viene
          const codeRaw = parts[1]?.trim() || ''; 
          
          let pointConfig = {
              style: 'blue', // Forzamos azul
              markerColor: MARKER_STYLES.blue.bg,
              scaleX: 1, 
              scaleY: 1, 
              markerFontSize: 10,
              textColor: '#ffffff'
          };

          return {
              id: Date.now() + index,
              // Centrar en el mapa (50%) con un ligero desplazamiento de cuadrícula
              x: 45 + (index % 5) * 3, 
              y: 45 + Math.floor(index / 5) * 3,
              label: labelRaw, 
              code: codeRaw,
              type: 'marker',
              ...pointConfig
          };
      }).filter(p => p !== null);

      setPointsForLevel(prev => [...prev, ...newPoints]);
      setBulkImportText('');
      setShowBulkImportModal(false);
      alert(`Se han importado ${newPoints.length} puntos en el nivel ${currentLevel.label}.`);
  };

  /* --- GESTIÓN DE ARCHIVOS --- */
  const processFile = async (file) => {
    if (file.type === 'application/pdf') {
      setIsProcessingPDF(true);
      try {
        if (!window.pdfjsLib) throw new Error("PDF Lib not ready");
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1); 
        const viewport = page.getViewport({ scale: 2.0 }); 
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context, viewport: viewport }).promise;
        setMapImageForLevel(canvas.toDataURL('image/png'));
        setPan({x: 0, y: 0});
        setZoom(1);
      } catch (error) {
        alert("Error al procesar PDF. Intente nuevamente.");
      } finally { setIsProcessingPDF(false); }
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        setMapImageForLevel(e.target.result);
        setPan({x: 0, y: 0});
        setZoom(1);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileUpload = (e, callback) => {
      const file = e.target.files[0];
      if (!file) return;
      if (callback) {
          const reader = new FileReader();
          reader.onload = (ev) => callback(ev.target.result);
          reader.readAsDataURL(file);
      } else {
          processFile(file);
      }
  };

  /* --- IMPORTAR / EXPORTAR --- */
  const handleExportProject = () => {
    const dataStr = JSON.stringify({ version: "2.0", timestamp: new Date().toISOString(), levels, view: { zoom, pan }, currentLevelId });
    const link = document.createElement('a');
    link.href = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    link.download = `CONTROL_DE_PRODUCCION_${new Date().toLocaleDateString().replace(/\//g, '-')}.json`;
    link.click();
  };

  const handleImportProject = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        try {
            const data = JSON.parse(ev.target.result);
            if (data.version === "1.0" || (!data.levels && data.mapImage)) {
                setLevels(prev => ({
                    ...prev,
                    tierra: { ...prev.tierra, mapImage: data.mapImage, points: data.points || [] }
                }));
                setCurrentLevelId('tierra');
            } else if (data.levels) {
                setLevels(data.levels);
                if (data.currentLevelId && data.levels[data.currentLevelId]) {
                    setCurrentLevelId(data.currentLevelId);
                }
            } else {
                throw new Error("Formato inválido");
            }
            if (data.view) { setZoom(data.view.zoom || 1); setPan(data.view.pan || { x: 0, y: 0 }); }
            if (currentScreen === 'fabrication_load') setCurrentScreen('fabrication_view');
            else alert("Proyecto cargado exitosamente.");
        } catch { alert("Error al leer el archivo JSON."); }
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  const handleDownloadMap = async () => {
    if (!mapImage || !imgRef.current) return;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const loadImage = (src) => new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
    try {
        const bgImg = await loadImage(mapImage);
        const { naturalWidth, naturalHeight, width: displayWidth } = imgRef.current;
        const scaleRatio = naturalWidth / displayWidth;
        canvas.width = naturalWidth;
        canvas.height = naturalHeight;
        ctx.drawImage(bgImg, 0, 0);
        for (const p of points) {
            // ELIMINADO EL FILTRO DE PRIORIDAD
            // if (filterPriority !== 'ALL' && p.priority !== filterPriority) continue; 
            const x = (p.x / 100) * naturalWidth;
            const y = (p.y / 100) * naturalHeight;
            ctx.save();
            ctx.translate(x, y);
            if (p.type === 'text') {
                const fontSize = (p.fontSize || 14) * scaleRatio;
                ctx.font = `${p.isItalic?'italic':''} ${p.isBold?'bold':''} ${fontSize}px ${p.fontFamily==='mono'?'monospace':p.fontFamily==='serif'?'serif':'sans-serif'}`;
                ctx.fillStyle = p.color || '#000';
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillText(p.label, 0, 0);
            } else if (p.type === 'safety') {
                const s = 32 * scaleRatio * (p.scaleX || 1);
                const conf = SAFETY_ICONS[p.safetyType] || SAFETY_ICONS.warning;
                if (p.safetyType === 'custom' && p.customSafetyIcon) {
                    try {
                        const icon = await loadImage(p.customSafetyIcon);
                        ctx.drawImage(icon, -s/2, -s/2, s, s);
                    } catch { ctx.fillStyle='#ccc'; ctx.fillRect(-s/2,-s/2,s,s); }
                } else {
                    ctx.fillStyle = p.markerColor || conf.bg;
                    ctx.beginPath(); ctx.arc(0, 0, s/2, 0, 2*Math.PI); ctx.fill();
                    ctx.fillStyle = conf.defaultColor;
                    ctx.font = `bold ${s*0.6}px sans-serif`;
                    ctx.textAlign='center'; ctx.textBaseline='middle';
                    ctx.fillText('!', 0, 0);
                }
            } else {
                const s = BASE_MARKER_SIZE_PX * scaleRatio;
                const w = s * (p.scaleX||1), h = s * (p.scaleY||1);
                const conf = p.style==='dotted-black' ? MARKER_STYLES.dotted : MARKER_STYLES[p.style]||MARKER_STYLES.green;
                const isCircle = p.style==='dotted-black';
                if (isCircle) {
                    ctx.beginPath(); ctx.ellipse(0,0,w/2,h/2,0,0,2*Math.PI);
                    ctx.fillStyle = p.markerColor||'transparent'; ctx.fill();
                    if (p.style==='dotted-black') {
                        ctx.strokeStyle = p.textColor||'#000'; ctx.lineWidth=2*scaleRatio;
                        ctx.setLineDash([3*scaleRatio,3*scaleRatio]); ctx.stroke();
                    }
                } else {
                    ctx.fillStyle = p.markerColor||conf.bg; ctx.fillRect(-w/2,-h/2,w,h);
                }
                // ELIMINADO: No dibujamos texto en la exportación para los marcadores
            }
            ctx.restore();
        }
        const link = document.createElement('a');
        link.download = `mapa_${currentLevel.id}.jpg`; 
        link.href = canvas.toDataURL('image/jpeg', 0.9); 
        link.click();
    } catch { alert("Error al exportar la imagen."); }
  };

  /* --- HELPERS DE ESTADO --- */
  const updatePoint = useCallback((id, field, value) => {
      setPointsForLevel(prev => prev.map(p => {
          if (p.id !== id) return p;
          if (field === 'label') {
              return { ...p, label: value, title: value }; 
          }
          return { ...p, [field]: value };
      }));
  }, [currentLevelId]); 
  
  const deletePoint = useCallback((id) => { 
      setPointsForLevel(prev => prev.filter(p => p.id !== id)); 
      setSelectedPointId(null); 
  }, [currentLevelId]);

  const onClosePopup = useCallback(() => {
    setSelectedPointId(null);
  }, []);

  const clampPan = useCallback((proposedPan, currentZoom) => {
    if (!containerRef.current || !imgRef.current) return proposedPan;
    const { clientWidth: cW, clientHeight: cH } = containerRef.current;
    const iW = imgRef.current.clientWidth * currentZoom;
    const iH = imgRef.current.clientHeight * currentZoom;
    if (iW <= cW && iH <= cH) return { x: (cW - iW)/2, y: (cH - iH)/2 };
    const minX = iW > cW ? cW - iW : (cW - iW)/2;
    const maxX = iW > cW ? 0 : minX;
    const minY = iH > cH ? cH - iH : (cH - iH)/2;
    const maxY = iH > cH ? 0 : minY;
    return { x: Math.min(Math.max(proposedPan.x, minX), maxX), y: Math.min(Math.max(proposedPan.y, minY), maxY) };
  }, []);

  /* --- EVENT HANDLERS INTERFAZ --- */
  const handleZoom = (delta) => {
      setZoom(z => {
          const next = Math.min(Math.max(z + delta, 0.2), 8);
          requestAnimationFrame(() => setPan(p => clampPan(p, next)));
          return next;
      });
  };
  
  const handleResetView = () => { setZoom(1); requestAnimationFrame(() => setPan(clampPan({x:0,y:0}, 1))); };
  
  const handleWheel = (e) => {
      if (!mapImage || !containerRef.current) return;
      e.preventDefault(); 
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const delta = e.deltaY * -0.001;
      const nextZoom = Math.min(Math.max(zoom + delta, 0.2), 8);
      const worldX = (mouseX - pan.x) / zoom;
      const worldY = (mouseY - pan.y) / zoom;
      const newPanX = mouseX - worldX * nextZoom;
      const newPanY = mouseY - worldY * nextZoom;
      setZoom(nextZoom);
      setPan(clampPan({ x: newPanX, y: newPanY }, nextZoom));
  };

  const handleMouseDown = useCallback((e, id) => {
      if (isAdmin && !adminPreviewMode) { 
          setDraggingElementId(id);
      }
  }, [isAdmin, adminPreviewMode]);

  const handleDoubleClick = useCallback((e, id) => {
      if (!isPanning) setSelectedPointId(id); 
  }, [isPanning]);

  // Manejo global de Drag & Pan
  useEffect(() => {
    const onMove = (e) => {
      if (isPanning) {
          e.preventDefault();
          setPan(p => clampPan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y }, zoom));
          setIsDrag(true); 
      } else if (draggingElementId && mapRef.current && isAdmin && !adminPreviewMode) { 
          e.preventDefault();
          const r = mapRef.current.getBoundingClientRect();
          const x = Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100));
          const y = Math.max(0, Math.min(100, ((e.clientY - r.top) / r.height) * 100));
          setPointsForLevel(prev => prev.map(p => p.id === draggingElementId ? { ...p, x, y } : p));
      }
    };
    const onUp = () => { 
        setIsPanning(false); 
        setDraggingElementId(null); 
        setTimeout(() => setIsDrag(false), 50);
    };
    
    if (isPanning || draggingElementId) {
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    }
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [isPanning, draggingElementId, startPan, zoom, clampPan, isAdmin, adminPreviewMode]);

  useEffect(() => { if (mapImage) setPan(p => clampPan(p, zoom)); }, [mapImage, zoom, clampPan]);

  const handleMapDoubleClick = (e) => {
    if (!isAdmin || adminPreviewMode || !mapImage || isPanning || draggingElementId) return; 
    const r = mapRef.current.getBoundingClientRect();
    const nextNum = points.filter(p => p.type === 'marker').length + 1;
    const base = { id: Date.now(), x: ((e.clientX-r.left)/r.width)*100, y: ((e.clientY-r.top)/r.height)*100, label: `Punto ${nextNum}`, image: null, description: '', priority: 'A', status: 'process' };
    
    let newItem;
    if (tool === 'safety') {
        newItem = { ...base, type: 'safety', label: '!', safetyType: 'warning', scaleX: 1.5, scaleY: 1.5, markerColor: SAFETY_ICONS.warning.bg, textColor: SAFETY_ICONS.warning.defaultColor, title: 'Señal de Seguridad' };
    } else if (tool === 'text') {
        newItem = { ...base, type: 'text', label: 'Texto', fontSize: 14, fontFamily: 'sans', isBold: true, isItalic: false, color: '#1f2937' };
    } else {
        // AQUI CAMBIA: Por defecto estilo 'blue' (Azul)
        newItem = { ...base, type: 'marker', label: `${nextNum}`, style: 'blue', scaleX: 1, scaleY: 1, markerFontSize: 10, textColor: '#ffffff', markerColor: MARKER_STYLES.blue.bg };
    }
    setPointsForLevel(prev => [...prev, newItem]); setSelectedPointId(newItem.id);
  };

  const visiblePoints = points; // Simplificado: Siempre muestra todos los puntos

  /* --- RENDERS --- */

  // 1. LANDING
  if (currentScreen === 'landing') {
    return (
      <div className="flex flex-col h-screen w-screen bg-[#0f172a] relative overflow-hidden">
        {/* Fondo con degradado sutil tipo naval */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-blue-950 pointer-events-none"></div>
        
        <div onClick={handleFabricationEntry} className="relative z-10 flex-1 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors group">
          <div className="text-center space-y-8 animate-in fade-in zoom-in duration-700 px-4">
             <div className="w-28 h-28 bg-white text-blue-950 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(255,255,255,0.1)] group-hover:scale-110 transition-transform duration-300">
                <Users size={56} strokeWidth={1.5} />
             </div>
             <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white drop-shadow-2xl max-w-4xl mx-auto leading-tight">
                  PUNTOS QUIMICOS <br/> CONTROL DE PRODUCCION
                </h1>
                <div className="h-1 w-24 bg-blue-500 mx-auto rounded-full opacity-80"></div>
                <p className="text-lg md:text-xl text-blue-200 tracking-[0.4em] font-light uppercase">
                  Ingreso a Fabricación
                </p>
             </div>
             <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-sm font-medium text-blue-300/80 mt-8 tracking-wide border border-blue-500/30 rounded-full px-4 py-1 inline-block bg-blue-950/50">
                Haga clic en cualquier lugar para entrar
             </div>
          </div>
        </div>
        
        <div onClick={() => setCurrentScreen('admin_login')} className="absolute bottom-6 right-6 z-50 p-3 text-blue-400/30 hover:text-white transition-colors cursor-pointer" title="Administrador">
            <ShieldCheck size={24} />
        </div>
        
        <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none z-10">
            <p className="text-[10px] text-blue-300/40 font-serif tracking-[0.2em] uppercase">
                CREADO POR ELIAS.D PARA CONTROL DE PRODUCCION - CAÑETE
            </p>
        </div>
      </div>
    );
  }

  // 2. LOGIN ADMIN
  if (currentScreen === 'admin_login') {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center p-4">
        <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-sm relative border border-gray-100">
          <button onClick={() => setCurrentScreen('landing')} className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"><X size={20}/></button>
          <div className="text-center mb-8"><div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-black text-white mb-4"><Lock size={18} /></div><h2 className="text-xl font-bold text-gray-900">Acceso Restringido</h2></div>
          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div><input type="password" autoFocus className={`w-full border-b-2 bg-transparent px-2 py-3 text-center text-xl tracking-widest outline-none focus:border-black transition-colors ${loginError ? 'border-red-500 text-red-600' : 'border-gray-200 text-gray-800'}`} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="• • • • • •" />{loginError && <p className="text-red-500 text-xs mt-2 text-center font-medium">Clave incorrecta</p>}</div>
            <button type="submit" className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition-colors">Ingresar</button>
          </form>
        </div>
      </div>
    );
  }

  // 3. CARGA FABRICACIÓN
  if (currentScreen === 'fabrication_load') {
    return (
      <div className="flex h-screen bg-gray-950 text-white items-center justify-center p-6 relative">
        <button onClick={handleExitToLanding} className="absolute top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm font-medium tracking-wide"><X size={18}/> CANCELAR</button>
        <div className="max-w-xl w-full text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">FABRICACIÓN</h1>
          <p className="text-gray-500 tracking-widest text-sm uppercase mb-12">Carga de Mapa Operativo</p>
          <div className="flex flex-col gap-4">
             <div onClick={() => jsonInputRef.current?.click()} className="group cursor-pointer bg-white/5 border border-white/10 hover:border-white/30 rounded-xl p-8 transition-all hover:bg-white/10 flex flex-col items-center"><FileJson size={32} className="text-gray-400 group-hover:text-white mb-4 transition-colors"/><span className="font-bold">Cargar Archivo JSON</span><span className="text-xs text-gray-500 mt-1">Formato de proyecto completo</span><input type="file" ref={jsonInputRef} accept=".json" className="hidden" onChange={handleImportProject} /></div>
          </div>
        </div>
      </div>
    );
  }

  // 4. EDITOR Y VISOR
  const isViewer = currentScreen === 'fabrication_view';
  const isReadOnly = isViewer || (isAdmin && adminPreviewMode);

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans overflow-hidden text-gray-800 relative"> 
      
      <input type="file" ref={fileInputRef} onChange={handleImportProject} accept=".json" className="hidden" />
      <input type="file" ref={mapInputRef} onChange={(e) => handleFileUpload(e)} accept="image/*,application/pdf" className="hidden" />
      
      {/* HEADER */}
      <header className={`backdrop-blur-md border-b shadow-sm z-50 transition-all duration-300 
        ${isViewer 
            ? 'absolute top-0 left-0 w-full bg-white/90 text-gray-900 border-b border-gray-100 backdrop-blur-sm' 
            : 'relative bg-white/95 border-gray-200'
        }`}>
        
        <div className="px-6 py-2 flex justify-between items-center h-16 relative">
            <div className="flex items-center gap-3 min-w-fit z-10">
                <div className={`p-2 rounded-lg flex items-center justify-center ${isViewer ? 'bg-gray-900 text-white' : 'bg-black text-white'}`}>
                    {isViewer ? <Users size={20}/> : <ShieldCheck size={20} />}
                </div>
            </div>

            {/* TITULO CENTRADO MINIMALISTA */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <h1 className={`text-sm font-black tracking-widest uppercase ${isViewer ? 'text-gray-800' : 'text-gray-900'}`}>
                    CONTROL DE PRODUCCION - UBICACION QUIMICOS
                </h1>
            </div>

            {/* SE ELIMINO LA SECCION DE FILTRO DE CRITICIDAD AQUI */}

            <div className="flex items-center gap-3 min-w-fit z-10">
                {isViewer && (
                    <button onClick={() => setShowAllMode(!showAllMode)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${showAllMode ? 'bg-gray-900 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`} title="Ver todos los puntos como tarjetas">
                        <Grid size={14}/> {showAllMode ? 'MODO MAPA' : 'MODO ALL'}
                    </button>
                )}
                
                {isAdmin && mapImage && (
                    <button onClick={() => setAdminPreviewMode(!adminPreviewMode)} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold border transition-all ${adminPreviewMode ? 'bg-green-100 text-green-700 border-green-300' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`} title={adminPreviewMode ? "Volver a editar" : "Ver como operario"}>{adminPreviewMode ? <Eye size={14}/> : <EyeOff size={14}/>}<span className="hidden sm:inline">{adminPreviewMode ? "Vista Operario" : "Vista Editor"}</span></button>
                )}
                <div className={`h-6 w-px ${isViewer ? 'bg-gray-200' : 'bg-gray-300'}`}></div>
                {isAdmin && (
                    <button onClick={handleCloseProject} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors" title="Borrar Datos y Reiniciar"><Trash2 size={18} /></button>
                )}
                <button onClick={handleExitToLanding} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${isViewer ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}><LogOut size={14} /> Salir</button>
            </div>
        </div>

        {isAdmin && !adminPreviewMode && mapImage && (
            <div className="px-6 py-2 bg-gray-50/80 border-t border-gray-200 flex justify-between items-center gap-4 overflow-x-auto">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-2">Herramientas</span>
                    <div className="flex bg-white rounded-lg border border-gray-200 p-0.5 shadow-sm">
                        {[{id: 'marker', icon: MapIcon, label: 'Marcador'},{id: 'text', icon: Type, label: 'Texto'},{id: 'safety', icon: TriangleAlert, label: 'Seguridad'}].map(t => (
                            <button key={t.id} onClick={() => setTool(t.id)} className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-xs font-semibold transition-all ${tool === t.id ? 'bg-black text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}><t.icon size={14}/> {t.label}</button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-2">Datos</span>
                    <button onClick={() => setShowBulkImportModal(true)} className="px-3 py-1.5 rounded-md text-xs font-medium bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 flex items-center gap-2" title="Importar lista de puntos"><FileText size={14} /> Importar Datos</button>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-2">Archivo</span>
                    <div className="flex gap-1">
                        <button onClick={() => mapInputRef.current?.click()} className="px-3 py-1.5 rounded-md text-xs font-medium bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 flex items-center gap-2" title="Cargar Nueva Imagen de Fondo"><FileImage size={14} /> Cargar Imagen</button>
                        <button onClick={() => fileInputRef.current?.click()} className="px-3 py-1.5 rounded-md text-xs font-medium bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 flex items-center gap-2" title="Cargar JSON"><FolderOpen size={14} /> Cargar JSON</button>
                        <button onClick={handleExportProject} className="px-3 py-1.5 rounded-md text-xs font-medium bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 flex items-center gap-2" title="Descargar Proyecto JSON"><DownloadIcon size={14} /> Descargar JSON</button>
                        <div className="w-px h-6 bg-gray-300 mx-1"></div>
                        <button onClick={handleDownloadMap} className="px-3 py-1.5 rounded-md text-xs font-medium bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 flex items-center gap-2" title="Descargar JPG"><ImageIcon size={14}/> Guardar JPG</button>
                    </div>
                </div>
            </div>
        )}
      </header>

      {/* SELECTOR FLOTANTE DE PISOS (Option A) */}
      {mapImage && Object.keys(levels).length > 1 && (
        <div className={`absolute right-6 top-32 flex flex-col gap-2 z-50 ${isViewer ? 'text-white' : ''}`}>
             <div className="bg-black/90 text-white rounded-xl shadow-xl p-1.5 flex flex-col gap-1 border border-white/10 backdrop-blur-sm">
                <span className="text-[9px] font-bold text-center text-gray-400 mb-1 uppercase tracking-wider">Nivel</span>
                {Object.values(levels).map((lvl) => (
                    <button
                        key={lvl.id}
                        onClick={() => handleLevelChange(lvl.id)}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs transition-all ${currentLevelId === lvl.id ? 'bg-blue-600 text-white shadow-lg scale-105' : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'}`}
                        title={lvl.label}
                    >
                        {lvl.short}
                    </button>
                ))}
             </div>
        </div>
      )}

      {showBulkImportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg">
                  <div className="flex justify-between items-center mb-4 border-b pb-2">
                      <h3 className="font-bold text-lg text-gray-800">Importar Lista de Puntos</h3>
                      <button onClick={() => setShowBulkImportModal(false)} className="text-gray-400 hover:text-black"><X size={20}/></button>
                  </div>
                  <div className="space-y-4">
                      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <p className="font-bold mb-1">Instrucciones:</p>
                          <p>Pega tu lista de datos en el siguiente formato (una línea por punto):</p>
                          <code className="block mt-2 bg-white p-1 rounded border border-gray-200 font-mono text-gray-600">Número;Prioridad (A/B/C);Descripción;Lugar;Estado;TipoDoc;CodigoDoc</code>
                      </div>
                      <textarea 
                          className="w-full h-48 border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-black focus:border-black outline-none font-mono"
                          placeholder={`Ejemplo:\nLDA 77;B;Rejilla;Zona 1;PENDIENTE;LILA;001\nFC 10;A;Fuga;Zona 2;EJECUTADO;POE;002`}
                          value={bulkImportText}
                          onChange={(e) => setBulkImportText(e.target.value)}
                      />
                      <div className="flex justify-end gap-2">
                          <button onClick={() => setShowBulkImportModal(false)} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                          <button onClick={handleBulkProcess} className="px-4 py-2 text-sm font-bold text-white bg-black hover:bg-gray-800 rounded-lg">Procesar Lista</button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* MODIFICACIÓN MODO "ALL": ELIMINADA LA GALERÍA EXTERNA. 
         AHORA USA EL MAPA PRINCIPAL CON LA LÓGICA DE TARJETAS INTELIGENTES.
      */}

      <div className="flex flex-1 overflow-hidden relative h-full">
        {isAdmin && !adminPreviewMode && (
          <aside className="w-72 bg-white border-r border-gray-100 flex flex-col z-30 shadow-[4px_0_24px_rgba(0,0,0,0.02)] relative h-full">
            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
              {!mapImage && (
                 <div className="flex flex-col gap-3">
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer relative group">
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*,application/pdf" onChange={(e) => handleFileUpload(e)} />
                        <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400 group-hover:scale-110 transition-transform">{isProcessingPDF ? <Loader2 className="animate-spin" size={20}/> : <Upload size={20} />}</div>
                        <h3 className="text-sm font-bold text-gray-700">{isProcessingPDF ? 'Procesando PDF...' : `Subir Plano (${currentLevel.short})`}</h3>
                        <p className="text-xs text-gray-400 mt-1">Formatos: JPG, PNG, PDF</p>
                    </div>
                    
                    <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer group flex flex-col items-center justify-center gap-2">
                        <div className="bg-gray-100 w-10 h-10 rounded-full flex items-center justify-center text-gray-400 group-hover:text-black transition-colors"><FileJson size={18} /></div>
                        <h3 className="text-xs font-bold text-gray-600">Cargar Proyecto JSON</h3>
                    </div>
                 </div>
              )}
              {selectedPointId && (
                <div className="animate-in slide-in-from-left duration-300 space-y-6">
                  <div className="flex justify-between items-center border-b pb-4">
                    <div className="flex items-center gap-2 text-gray-800">
                        {points.find(p => p.id === selectedPointId)?.type === 'text' ? <Type size={18}/> : points.find(p => p.id === selectedPointId)?.type === 'safety' ? <TriangleAlert size={18} /> : <MapIcon size={18}/>}
                        <span className="font-bold text-sm uppercase">Punto Químico</span>
                    </div>
                    <button onClick={() => deletePoint(selectedPointId)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                  </div>
                  
                  {/* --- SECCION PERSONALIZADA SIMPLIFICADA --- */}
                  
                  {points.find(p => p.id === selectedPointId)?.type === 'marker' && (
                    <div className="space-y-4">
                        {/* 1. NOMBRE / ETIQUETA */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Nombre del Punto</label>
                            <input 
                                type="text" 
                                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                                placeholder="Ej: Tanque A-1"
                                value={points.find(p => p.id === selectedPointId)?.label || ''} 
                                onChange={(e) => updatePoint(selectedPointId, 'label', e.target.value)} 
                            />
                        </div>

                        {/* 2. CÓDIGO */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1"><FileBadge size={10}/> Código</label>
                            <input 
                                type="text" 
                                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                                placeholder="Ej: QT-001"
                                value={points.find(p => p.id === selectedPointId)?.code || ''} 
                                onChange={(e) => updatePoint(selectedPointId, 'code', e.target.value)} 
                            />
                        </div>

                        {/* 3. IMAGEN */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1"><ImageIcon size={10}/> Imagen</label>
                            {!points.find(p => p.id === selectedPointId)?.image ? (
                                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-all group">
                                    <div className="bg-white p-2 rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform"><Upload size={16} className="text-blue-500"/></div>
                                    <span className="text-xs text-gray-400 font-medium">Subir foto</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, (res) => updatePoint(selectedPointId, 'image', res))} />
                                </label>
                            ) : (
                                <div className="relative group rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                                    <img src={points.find(p => p.id === selectedPointId).image} className="w-full h-40 object-cover" />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex justify-center items-center gap-3 transition-opacity backdrop-blur-sm">
                                        <label className="cursor-pointer bg-white text-gray-900 p-2 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-gray-100">
                                            <RefreshCcw size={14}/> Cambiar
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, (res) => updatePoint(selectedPointId, 'image', res))} />
                                        </label>
                                        <button onClick={() => updatePoint(selectedPointId, 'image', null)} className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"><Trash2 size={14}/></button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* EXTRAS: DESCRIPCIÓN Y AJUSTES VISUALES (Simplificado) */}
                        <div className="pt-4 border-t border-gray-100 space-y-3">
                             <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Descripción (Opcional)</label>
                                <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" rows="2" value={points.find(p => p.id === selectedPointId)?.description || ''} onChange={(e) => updatePoint(selectedPointId, 'description', e.target.value)} />
                            </div>
                            
                            <div className="space-y-1">
                                <div className="flex justify-between"><label className="text-[10px] font-bold text-gray-400 uppercase">Tamaño del Cuadro</label> <span className="text-xs text-gray-400">{points.find(p => p.id === selectedPointId)?.scaleX?.toFixed(1)}x</span></div>
                                <input type="range" min="0.5" max="3" step="0.1" className="w-full accent-blue-600" value={points.find(p => p.id === selectedPointId)?.scaleX || 1} onChange={(e) => { const v = parseFloat(e.target.value); updatePoint(selectedPointId, 'scaleX', v); updatePoint(selectedPointId, 'scaleY', v); }} />
                            </div>
                        </div>
                    </div>
                  )}

                  {/* MANTENEMOS LÓGICA PARA TEXTO Y SEGURIDAD SI SE USAN */}
                  {points.find(p => p.id === selectedPointId)?.type === 'text' && (
                    <>
                      <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase">Contenido</label><input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm" value={points.find(p => p.id === selectedPointId)?.label || ''} onChange={(e) => updatePoint(selectedPointId, 'label', e.target.value)} /></div>
                      <div className="space-y-1 pt-2"><label className="text-[10px] font-bold text-gray-400 uppercase">Tamaño</label><input type="range" min="10" max="64" className="w-full" value={points.find(p => p.id === selectedPointId)?.fontSize} onChange={(e) => updatePoint(selectedPointId, 'fontSize', parseInt(e.target.value))} /></div>
                    </>
                  )}

                  {points.find(p => p.id === selectedPointId)?.type === 'safety' && (
                    <>
                      <div className="space-y-3">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Tipo de Señal</label>
                          <div className="grid grid-cols-3 gap-2">
                            {Object.entries(SAFETY_ICONS).map(([key, config]) => {
                                const Icon = config.icon;
                                const isActive = points.find(p => p.id === selectedPointId)?.safetyType === key;
                                return (
                                    <button key={key} onClick={() => {
                                        updatePoint(selectedPointId, 'safetyType', key);
                                        updatePoint(selectedPointId, 'markerColor', config.bg);
                                        updatePoint(selectedPointId, 'textColor', config.defaultColor);
                                        updatePoint(selectedPointId, 'title', config.label);
                                        if (points.find(p => p.id === selectedPointId)?.customSafetyIcon) updatePoint(selectedPointId, 'customSafetyIcon', null);
                                    }} className={`flex flex-col items-center gap-1 p-2 rounded border transition-all ${isActive ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-500' : 'bg-white hover:bg-gray-50'}`}>
                                        <Icon size={18} color={config.defaultColor} />
                                        <span className="text-[9px] font-medium text-gray-600">{config.label}</span>
                                    </button>
                                )
                            })}
                         </div>
                      </div>
                      <div className="space-y-1 pt-4"><label className="text-[10px] font-bold text-gray-400 uppercase">Tamaño</label><input type="range" min="0.5" max="3" step="0.1" className="w-full" value={points.find(p => p.id === selectedPointId)?.scaleX || 1.5} onChange={(e) => { const v = parseFloat(e.target.value); updatePoint(selectedPointId, 'scaleX', v); updatePoint(selectedPointId, 'scaleY', v); }} /></div>
                    </>
                  )}
                  
                  <button onClick={() => setSelectedPointId(null)} className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-lg transition-colors">Guardar Cambios</button>
                </div>
              )}
            </div>
            <div className="p-5 border-t bg-gray-50/50"><p className="text-center text-[10px] font-serif text-gray-400 tracking-[0.2em]">CREADO POR ELIAS.D PARA CONTROL DE PRODUCCION - CAÑETE</p></div>
          </aside>
        )}
        
        {/* MAP CONTAINER */}
        <main 
            className={`flex-1 relative overflow-hidden select-none ${isViewer ? 'bg-white' : 'bg-gray-100/50'}`} 
            ref={containerRef} 
            // Apply cursor style directly
            style={{ cursor: isPanning ? cursorGrabbing : (tool === 'text' && isAdmin && !adminPreviewMode ? 'text' : cursorGrab) }}
            onMouseDown={(e) => { 
                if (!mapImage || draggingElementId) return; 
                setIsPanning(true); 
                setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y }); 
            }} 
            onClick={() => setSelectedPointId(null)} // Click al fondo cierra el panel
            onWheel={handleWheel}
        >
          {!mapImage ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-300">
                <MapIcon size={48} /><p className="mt-4">Cargue un mapa para comenzar</p>
            </div> 
          ) : (
            <div ref={mapRef} className="absolute origin-top-left transition-transform duration-75 ease-linear" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, minWidth: '100%' }} onDoubleClick={handleMapDoubleClick}>
              <div style={{ position: 'relative' }}>
                <MapContent 
                    mapImage={mapImage}
                    imgRef={imgRef} // Pasar el ref aquí
                    points={visiblePoints}
                    selectedPointId={selectedPointId}
                    isReadOnly={isReadOnly}
                    onMouseDown={handleMouseDown}
                    onDoubleClick={handleDoubleClick}
                    onClosePopup={onClosePopup}
                    showAllMode={showAllMode}
                />
              </div>
            </div>
          )}
          {mapImage && isAdmin && !adminPreviewMode && <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur px-4 py-1.5 rounded-full text-white text-xs pointer-events-none opacity-80">Doble clic para crear</div>}
          {mapImage && <div className="absolute bottom-8 right-8 flex flex-col gap-2 bg-white/90 p-1.5 rounded-xl shadow-2xl"><button onClick={()=>handleZoom(0.2)}><ZoomIn size={18}/></button><button onClick={handleResetView}><Maximize size={18}/></button><button onClick={()=>handleZoom(-0.2)}><ZoomOut size={18}/></button></div>}
        </main>
      </div>
    </div>
  );
}