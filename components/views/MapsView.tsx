"use client";

import { useState, useEffect } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { getAllMapsFromDB, saveMapToDB, deleteMapFromDB } from "@/hooks/useIndexedDB";

export default function MapsView() {
  const { dadosGlobais, setDadosGlobais, salvarEstadoLocal } = useAppContext();
  const [mapsLoaded, setMapsLoaded] = useState<{id: string, name: string, data: string}[]>([]);
  const [currentMapIndex, setCurrentMapIndex] = useState(0);

  useEffect(() => {
    loadMaps();
  }, []);

  const loadMaps = async () => {
    try {
      const maps = await getAllMapsFromDB();
      setMapsLoaded(maps);
    } catch (e) {
      console.error("Failed to load maps", e);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    let mapsAdded = 0;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const id = "map_" + Date.now() + "_" + i;
        await saveMapToDB(id, file.name, ev.target?.result as string);
        mapsAdded++;
        if (mapsAdded === files.length) {
          loadMaps();
          // Atualiza globais para manter sincronia
          const currentMapsIds = dadosGlobais.maps || [];
          setDadosGlobais({ ...dadosGlobais, maps: [...currentMapsIds, "new_map"] }); // Just a trigger
          setTimeout(salvarEstadoLocal, 100);
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const handleDelete = async () => {
    if (mapsLoaded.length === 0) return;
    const currentMap = mapsLoaded[currentMapIndex];
    if (confirm(`Tem certeza que deseja excluir o mapa ${currentMap.name}?`)) {
      await deleteMapFromDB(currentMap.id);
      setCurrentMapIndex(0);
      loadMaps();
      setDadosGlobais({ ...dadosGlobais, maps: ["trigger_update"] });
      setTimeout(salvarEstadoLocal, 100);
    }
  };

  return (
    <div className="maps-view-container" style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden", paddingBottom: 0 }}>
      <header className="npc-header glass-panel">
        <div className="npc-header-info">
          <h1 className="view-title">Mapas e Níveis</h1>
          <p className="view-subtitle">Faça o upload e gerencie os mapas da sua campanha.</p>
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <input type="file" accept="image/*" multiple className="hidden" id="input-map-upload" onChange={handleFileUpload} />
          <label htmlFor="input-map-upload" className="btn primary-btn" style={{ cursor: "pointer" }}>
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <span>Adicionar Mapas</span>
          </label>
        </div>
      </header>

      <div className="maps-carousel-wrapper" style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem", height: "calc(100vh - 150px)", maxHeight: "100%", overflow: "hidden", position: "relative" }}>
        <div className="maps-indicators glass-panel custom-scrollbar" style={{ display: "flex", gap: "0.5rem", padding: "0.75rem", overflowX: "auto", flexShrink: 0, minHeight: "60px" }}>
          {mapsLoaded.map((map, idx) => (
            <div 
              key={map.id} 
              className={`map-indicator ${idx === currentMapIndex ? 'active' : ''}`}
              title={map.name}
              onClick={() => setCurrentMapIndex(idx)}
              style={{
                width: "40px", height: "40px", borderRadius: "6px", cursor: "pointer", 
                border: idx === currentMapIndex ? "2px solid var(--accent-primary)" : "2px solid transparent",
                backgroundImage: `url(${map.data})`, backgroundSize: "cover", backgroundPosition: "center",
                opacity: idx === currentMapIndex ? 1 : 0.6, transition: "all 0.2s"
              }}
            ></div>
          ))}
        </div>

        <div className="maps-carousel-container glass-panel" style={{ flex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", padding: "1rem" }}>
          <button 
            className="btn secondary-btn icon-only" 
            onClick={() => setCurrentMapIndex(prev => Math.max(0, prev - 1))}
            style={{ position: "absolute", left: "1rem", zIndex: 10, borderRadius: "50%", width: "40px", height: "40px", display: mapsLoaded.length > 1 ? "flex" : "none" }}
          >
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {mapsLoaded.length === 0 ? (
              <div className="empty-state">
                <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
                </svg>
                <p>Nenhum mapa adicionado. Faça upload para começar.</p>
              </div>
            ) : (
              <img src={mapsLoaded[currentMapIndex]?.data} alt="Mapa" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: "8px" }} />
            )}
          </div>

          <button 
            className="btn secondary-btn icon-only" 
            onClick={() => setCurrentMapIndex(prev => Math.min(mapsLoaded.length - 1, prev + 1))}
            style={{ position: "absolute", right: "1rem", zIndex: 10, borderRadius: "50%", width: "40px", height: "40px", display: mapsLoaded.length > 1 ? "flex" : "none" }}
          >
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>

          {mapsLoaded.length > 0 && (
            <button 
              className="btn danger-btn icon-only" 
              onClick={handleDelete}
              style={{ position: "absolute", top: "1rem", right: "1rem", zIndex: 10 }} 
              title="Excluir Mapa"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18"></path>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
