"use client";

import React, { useState, useRef, useEffect } from "react";
import Modal from "../ui/Modal";
import CropModal from "./CropModal";
import { useAppContext } from "@/contexts/AppContext";

interface PlayerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PlayerFormModal({ isOpen, onClose }: PlayerFormModalProps) {
  const SAVES_LIST = ["FOR", "DES", "CON", "INT", "SAB", "CAR"];
  const SKILLS_LIST = [
    "Acrobacia (Des)", "Arcanismo (Int)", "Atletismo (For)", "Atuação (Car)", 
    "Enganação (Car)", "Furtividade (Des)", "História (Int)", "Intimidação (Car)", 
    "Intuição (Sab)", "Investigação (Int)", "Lidar c/ Animais (Sab)", "Medicina (Sab)", 
    "Natureza (Int)", "Percepção (Sab)", "Persuasão (Car)", "Prestidigitação (Des)", 
    "Religião (Int)", "Sobrevivência (Sab)"
  ];
  const { dadosGlobais, setDadosGlobais, salvarEstadoLocal, activeData } = useAppContext();

  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [attacksState, setAttacksState] = useState<any[]>([]);
  const [selectedSaves, setSelectedSaves] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [profBonusState, setProfBonusState] = useState<string>("2");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isImporting, setIsImporting] = useState(false);
  const importFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setAvatarBase64(activeData?.image || null);
      if (activeData?.attacks && activeData.attacks.length > 0) {
        const currentAttacks = [...activeData.attacks];
        while (currentAttacks.length < 3) {
          currentAttacks.push({ name: "", bonus: "", dmg: "" });
        }
        setAttacksState(currentAttacks);
      } else {
        setAttacksState([
          { name: "", bonus: "", dmg: "" },
          { name: "", bonus: "", dmg: "" },
          { name: "", bonus: "", dmg: "" }
        ]);
      }
      
      const initialSaves = Array.isArray(activeData?.saves) ? activeData.saves : (typeof activeData?.saves === 'string' && activeData.saves ? activeData.saves.split(',').map((s:string) => s.trim()) : []);
      setSelectedSaves(initialSaves);
      
      const initialSkills = Array.isArray(activeData?.skills) ? activeData.skills : (typeof activeData?.skills === 'string' && activeData.skills ? activeData.skills.split(',').map((s:string) => s.trim()) : []);
      setSelectedSkills(initialSkills);

      setProfBonusState(activeData?.profBonus || "2");
    }
  }, [isOpen, activeData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setCropImageSrc(ev.target?.result as string);
        setIsCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImportImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const filesArray = Array.from(files).slice(0, 4);
    setIsImporting(true);

    try {
      const base64Images = await Promise.all(filesArray.map(file => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (ev) => resolve(ev.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }));

      const res = await fetch("/api/import-player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: base64Images })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erro na importação.");
      }

      const data = await res.json();
      
      const form = document.querySelector("#player-form-modal form") as HTMLFormElement;
      if (form) {
        const setInputValue = (name: string, value: string | number | undefined) => {
          if (value !== undefined && value !== null) {
            const input = form.querySelector(`input[name="${name}"]`) as HTMLInputElement;
            if (input) input.value = String(value);
          }
        };

        setInputValue("name", data.name);
        setInputValue("playerName", data.playerName);
        setInputValue("classLevel", data.classLevel);
        setInputValue("race", data.race);
        setInputValue("str", data.str);
        setInputValue("dex", data.dex);
        setInputValue("con", data.con);
        setInputValue("int", data.int);
        setInputValue("wis", data.wis);
        setInputValue("cha", data.cha);
        setInputValue("hpMax", data.hpMax);
        setInputValue("ac", data.ac);
        setInputValue("init", data.init);
        setInputValue("speed", data.speed);
        setInputValue("perc", data.perc);
        setInputValue("hdTotal", data.hdTotal);
        
        if (data.profBonus) setProfBonusState(data.profBonus);
        if (data.saves && Array.isArray(data.saves)) setSelectedSaves(data.saves);
        if (data.skills && Array.isArray(data.skills)) setSelectedSkills(data.skills);
        if (data.attacks && Array.isArray(data.attacks)) {
           setAttacksState(data.attacks.map((a: any) => ({ name: a.name || "", bonus: a.bonus || "", dmg: a.dmg || "" })));
        }
      }

      alert("Ficha importada com sucesso! Verifique os dados e clique em Salvar.");
    } catch (error: any) {
      alert("Falha ao importar: " + error.message);
    } finally {
      setIsImporting(false);
      if (importFileInputRef.current) importFileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const id = activeData?.id || Date.now().toString();
    const hpMax = parseInt(formData.get("hpMax") as string) || 0;

    // Process attacks
    const formAttacks: any[] = [];
    const atkNames = formData.getAll("atkName");
    const atkBonuses = formData.getAll("atkBonus");
    const atkDmgs = formData.getAll("atkDmg");
    
    for (let i = 0; i < atkNames.length; i++) {
      if (atkNames[i] || atkBonuses[i] || atkDmgs[i]) {
        formAttacks.push({
          name: atkNames[i],
          bonus: atkBonuses[i],
          dmg: atkDmgs[i]
        });
      }
    }
    const attacks = formAttacks;

    const playerData = {
      id,
      name: formData.get("name"),
      playerName: formData.get("playerName"),
      classLevel: formData.get("classLevel"),
      race: formData.get("race"),
      str: formData.get("str"),
      dex: formData.get("dex"),
      con: formData.get("con"),
      int: formData.get("int"),
      wis: formData.get("wis"),
      cha: formData.get("cha"),
      hpMax,
      hpCurrent: activeData?.hpCurrent !== undefined ? activeData.hpCurrent : hpMax,
      image: avatarBase64,
      ac: formData.get("ac"),
      init: formData.get("init"),
      speed: formData.get("speed"),
      perc: formData.get("perc"),
      hdTotal: formData.get("hdTotal"),
      inspiration: formData.get("inspiration") === "on",
      attacks,
      isDead: activeData?.isDead || false,
      saves: selectedSaves,
      skills: selectedSkills,
      profBonus: profBonusState,
      minSleepReq: parseInt(formData.get("minSleepReq") as string) || 8,
    };

    const newPlayers = [...(dadosGlobais.players || [])];
    if (activeData) {
      const idx = newPlayers.findIndex(p => p.id === id);
      if (idx !== -1) newPlayers[idx] = { ...newPlayers[idx], ...playerData };
    } else {
      newPlayers.push(playerData);
    }

    setDadosGlobais({ ...dadosGlobais, players: newPlayers });
    setTimeout(salvarEstadoLocal, 100);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} id="player-form-modal">
      <div className="modal-content modal-xl glass-panel">
        <header className="modal-header">
          <div className="modal-title-group">
            <span className="modal-subtitle">Banco de Dados</span>
            <h2 className="modal-title" id="player-form-title">Novo Jogador</h2>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <input type="file" id="input-player-pdf" accept="image/*" multiple className="hidden" ref={importFileInputRef} onChange={handleImportImages} style={{ display: "none" }} />
            <button type="button" onClick={() => importFileInputRef.current?.click()} className="btn secondary-btn small-btn" disabled={isImporting}>
              {isImporting ? (
                <span>Carregando...</span>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                  </svg>
                  <span>Importar Ficha (Imagens)</span>
                </>
              )}
            </button>
            <button id="btn-close-player-form" className="close-btn" onClick={onClose}>
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </header>
        <form onSubmit={handleSubmit} className="modal-body custom-scrollbar">
          <div className="form-grid-layout">
            <div className="form-col-avatar">
              <div className="avatar-upload" id="player-avatar-upload-area" onClick={() => fileInputRef.current?.click()} style={{ cursor: "pointer" }}>
                {avatarBase64 ? (
                  <img src={avatarBase64} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "12px" }} />
                ) : (
                  <div className="avatar-placeholder" id="form-player-avatar-placeholder">
                    <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" strokeWidth="1.5" fill="none">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    <span>Upload Portrait</span>
                  </div>
                )}
              </div>
              <input type="file" ref={fileInputRef} className="hidden" style={{ display: "none" }} accept="image/*" onChange={handleFileChange} />
            </div>
            <div className="form-col-main">
              <div className="form-row">
                <div className="form-group flex-2">
                  <label>Nome do Personagem *</label>
                  <input type="text" name="name" className="journey-input" required defaultValue={activeData?.name || ""} />
                </div>
                <div className="form-group flex-2">
                  <label>Nome do Jogador</label>
                  <input type="text" name="playerName" className="journey-input" defaultValue={activeData?.playerName || ""} />
                </div>
              </div>
              <div className="form-row mt-2">
                <div className="form-group flex-1">
                  <label>Classe / Nível</label>
                  <input type="text" name="classLevel" className="journey-input" defaultValue={activeData?.classLevel || ""} />
                </div>
                <div className="form-group flex-1">
                  <label>Raça</label>
                  <input type="text" name="race" className="journey-input" defaultValue={activeData?.race || ""} />
                </div>
              </div>
              
              <h4 className="form-section-title mt-4">Atributos Base</h4>
              <div className="form-attr-row">
                <div className="form-group"><label>FOR</label><input type="number" name="str" className="journey-input" defaultValue={activeData?.str || "10"} min="0" /></div>
                <div className="form-group"><label>DES</label><input type="number" name="dex" className="journey-input" defaultValue={activeData?.dex || "10"} min="0" /></div>
                <div className="form-group"><label>CON</label><input type="number" name="con" className="journey-input" defaultValue={activeData?.con || "10"} min="0" /></div>
                <div className="form-group"><label>INT</label><input type="number" name="int" className="journey-input" defaultValue={activeData?.int || "10"} min="0" /></div>
                <div className="form-group"><label>SAB</label><input type="number" name="wis" className="journey-input" defaultValue={activeData?.wis || "10"} min="0" /></div>
                <div className="form-group"><label>CAR</label><input type="number" name="cha" className="journey-input" defaultValue={activeData?.cha || "10"} min="0" /></div>
              </div>

              <h4 className="form-section-title mt-4">Estatísticas Vitais</h4>
              <div className="form-row">
                <div className="form-group flex-1"><label>PV Máx</label><input type="number" name="hpMax" className="journey-input" min="0" defaultValue={activeData?.hpMax || ""} /></div>
                <div className="form-group flex-1"><label>CA</label><input type="number" name="ac" className="journey-input" min="0" defaultValue={activeData?.ac || ""} /></div>
                <div className="form-group flex-1"><label>Iniciativa</label><input type="text" name="init" className="journey-input" defaultValue={activeData?.init || ""} /></div>
                <div className="form-group flex-1"><label>Deslocamento</label><input type="text" name="speed" className="journey-input" defaultValue={activeData?.speed || ""} /></div>
                <div className="form-group flex-1"><label>Percepção Pas.</label><input type="number" name="perc" className="journey-input" min="0" defaultValue={activeData?.perc || ""} /></div>
                <div className="form-group flex-1"><label>Descanso Mín.</label><input type="number" name="minSleepReq" className="journey-input" min="0" defaultValue={activeData?.minSleepReq || "8"} title="Tempo mínimo de sono em horas" /></div>
              </div>

              <h4 className="form-section-title mt-4">Combate & Ataques (D&D 5e)</h4>
              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Dado de Vida Total (ex: 3d10 ou 1d8)</label>
                  <input type="text" name="hdTotal" className="journey-input" placeholder="ex: 1d10" defaultValue={activeData?.hdTotal || ""} />
                </div>
                <div className="form-group flex-1" style={{ display: "flex", alignItems: "center", marginTop: "24px" }}>
                  <label className="custom-checkbox-container">
                    <input type="checkbox" name="inspiration" defaultChecked={activeData?.inspiration || false} /> Conceder Inspiração?
                  </label>
                </div>
              </div>

              <label style={{ marginTop: "14px", marginBottom: "6px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)" }}>
                <span>Ataques Rápidos (ex: Espada, Arco, Magias)</span>
                <button type="button" onClick={() => setAttacksState([...attacksState, { name: "", bonus: "", dmg: "" }])} className="btn success-btn small-btn" style={{ padding: "2px 8px", fontSize: "0.7rem", height: "auto" }}>
                  + Adicionar Ataque
                </button>
              </label>
              {attacksState.map((atk, index) => (
                <div className="form-row" style={{ gap: "8px", marginBottom: "8px" }} key={index}>
                  <div className="form-group flex-3"><input type="text" name="atkName" className="journey-input" placeholder="Nome da Arma/Ataque" defaultValue={atk.name} /></div>
                  <div className="form-group flex-1"><input type="text" name="atkBonus" className="journey-input" placeholder="Bônus" defaultValue={atk.bonus} /></div>
                  <div className="form-group flex-2"><input type="text" name="atkDmg" className="journey-input" placeholder="Dano/Tipo" defaultValue={atk.dmg} /></div>
                </div>
              ))}

              <h4 className="form-section-title mt-4">Proficiências (D&D 5e)</h4>
              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Bônus de Proficiência</label>
                  <input type="number" name="profBonus" className="journey-input" value={profBonusState} onChange={(e) => setProfBonusState(e.target.value)} min="0" />
                </div>
              </div>
              <div className="form-row mt-2">
                <div className="form-group flex-1">
                  <label>Salvaguardas com Proficiência</label>
                  <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", background: "rgba(0,0,0,0.2)", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                    {SAVES_LIST.map(save => {
                      return (
                        <label key={save} className="custom-checkbox-container" style={{ fontSize: "0.85rem", fontWeight: "bold", display: "flex", alignItems: "center" }}>
                          <input type="checkbox" name="saves" value={save} checked={selectedSaves.includes(save)} onChange={(e) => {
                            if (e.target.checked) setSelectedSaves(prev => [...prev, save]);
                            else setSelectedSaves(prev => prev.filter(s => s !== save));
                          }} /> {save}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="form-row mt-2">
                <div className="form-group flex-1">
                  <label>Perícias com Proficiência</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "10px", background: "rgba(0,0,0,0.2)", padding: "15px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                    {SKILLS_LIST.map(skill => {
                      return (
                        <label key={skill} className="custom-checkbox-container" style={{ fontSize: "0.85rem", display: "flex", alignItems: "center" }}>
                          <input type="checkbox" name="skills" value={skill} checked={selectedSkills.includes(skill)} onChange={(e) => {
                            if (e.target.checked) setSelectedSkills(prev => [...prev, skill]);
                            else setSelectedSkills(prev => prev.filter(s => s !== skill));
                          }} /> {skill}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
        <footer className="modal-footer">
          <button type="button" className="btn danger-btn" onClick={onClose}><span>Cancelar</span></button>
          <button type="submit" className="btn primary-btn" onClick={(e) => {
            const form = (e.target as HTMLElement).closest('.modal-content')?.querySelector('form');
            if (form) form.requestSubmit();
          }}>
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            <span>Salvar Personagem</span>
          </button>
        </footer>
      </div>
      <CropModal 
        isOpen={isCropModalOpen} 
        onClose={() => setIsCropModalOpen(false)} 
        imageUrl={cropImageSrc} 
        onCrop={(base64) => setAvatarBase64(base64)} 
      />
    </Modal>
  );
}
