"use client";

import React, { useState, useRef, useEffect } from "react";
import Modal from "../ui/Modal";
import CropModal from "./CropModal";
import { useAppContext } from "@/contexts/AppContext";
import { useSystemDialog } from "@/contexts/SystemDialogContext";

interface NpcFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NpcFormModal({ isOpen, onClose }: NpcFormModalProps) {
  const { dadosGlobais, setDadosGlobais, salvarEstadoLocal, activeData } = useAppContext();
  const { showConfirm, showAlert } = useSystemDialog();
  
  const [hasSpells, setHasSpells] = useState(false);
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (activeData) {
        setHasSpells(activeData.hasSpells || false);
        setAvatarBase64(activeData.image || null);
      } else {
        setHasSpells(false);
        setAvatarBase64(null);
      }
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const id = activeData?.id || Date.now().toString();
    const hpMax = parseInt(formData.get("hpMax") as string) || 0;
    const isDead = formData.get("isDead") === "on";
    const isHidden = formData.get("isHidden") === "on";

    const npcData = {
      id,
      name: formData.get("name"),
      title: formData.get("title"),
      faction: formData.get("faction"),
      race: formData.get("race"),
      alignment: formData.get("alignment"),
      cr: formData.get("cr"),
      str: formData.get("str"),
      dex: formData.get("dex"),
      con: formData.get("con"),
      int: formData.get("int"),
      wis: formData.get("wis"),
      cha: formData.get("cha"),
      hpMax,
      hpCurrent: activeData ? activeData.hpCurrent : (isDead ? 0 : hpMax),
      image: avatarBase64,
      isDead,
      isHidden,
      ac: formData.get("ac"),
      init: formData.get("init"),
      speed: formData.get("speed"),
      perc: formData.get("perc"),
      mainAttack: formData.get("mainAttack"),
      res: formData.get("res"),
      imm: formData.get("imm"),
      actions: formData.get("actions"),
      mot: formData.get("mot"),
      sec: formData.get("sec"),
      traits: formData.get("traits"),
      itemsVis: formData.get("itemsVis"),
      itemsHid: formData.get("itemsHid"),
      notes: formData.get("notes"),
      hasSpells,
      spellSlots: hasSpells ? {
        1: parseInt(formData.get("s1") as string) || 0,
        2: parseInt(formData.get("s2") as string) || 0,
        3: parseInt(formData.get("s3") as string) || 0,
        4: parseInt(formData.get("s4") as string) || 0,
        5: parseInt(formData.get("s5") as string) || 0,
        6: parseInt(formData.get("s6") as string) || 0,
        7: parseInt(formData.get("s7") as string) || 0,
        8: parseInt(formData.get("s8") as string) || 0,
        9: parseInt(formData.get("s9") as string) || 0,
      } : null,
      spellSlotsUsed: activeData?.spellSlotsUsed || {},
    };

    const newNpcs = [...(dadosGlobais.npcs || [])];
    if (activeData) {
      const idx = newNpcs.findIndex(n => n.id === id);
      if (idx !== -1) newNpcs[idx] = { ...newNpcs[idx], ...npcData };
    } else {
      newNpcs.push(npcData);
    }

    setDadosGlobais({ ...dadosGlobais, npcs: newNpcs });
    setTimeout(salvarEstadoLocal, 100);
    onClose();
    setTimeout(() => showAlert({ title: "Sucesso", message: "Alterações Salvas", type: "success" }), 200);
  };

  // The useEffect was moved up

  return (
    <Modal isOpen={isOpen} onClose={onClose} id="npc-form-modal">
      <div className="modal-content modal-xl glass-panel">
        <header className="modal-header">
          <div className="modal-title-group">
            <span className="modal-subtitle">Banco de Dados</span>
            <h2 className="modal-title">Novo NPC</h2>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button type="button" className="btn secondary-btn small-btn" onClick={() => setModals((prev: any) => ({ ...prev, importNpcText: true }))}>Importar via Texto</button>
            <button className="close-btn" onClick={onClose}>
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
              <div className="avatar-upload" onClick={() => fileInputRef.current?.click()} style={{ cursor: "pointer" }}>
                {avatarBase64 ? (
                  <img src={avatarBase64} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "12px" }} />
                ) : (
                  <div className="avatar-placeholder">
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
                  <label>Nome *</label>
                  <input type="text" name="name" className="journey-input" required defaultValue={activeData?.name || ""} />
                </div>
                <div className="form-group flex-2">
                  <label>Título / Ocupação</label>
                  <input type="text" name="title" className="journey-input" defaultValue={activeData?.title || ""} />
                </div>
              </div>
              <div className="form-row mt-2">
                <div className="form-group flex-1">
                  <label>Facção</label>
                  <select name="faction" className="journey-input" defaultValue={activeData?.faction || "neutral"}>
                    <option value="ally">Aliado</option>
                    <option value="neutral">Neutro</option>
                    <option value="enemy">Inimigo</option>
                  </select>
                </div>
                <div className="form-group flex-1">
                  <label>Raça</label>
                  <input type="text" name="race" className="journey-input" defaultValue={activeData?.race || ""} />
                </div>
                <div className="form-group flex-1">
                  <label>Alinhamento</label>
                  <input type="text" name="alignment" className="journey-input" defaultValue={activeData?.alignment || ""} />
                </div>
                <div className="form-group flex-1">
                  <label>ND / CR</label>
                  <input type="text" name="cr" className="journey-input" placeholder="Ex: 3" defaultValue={activeData?.cr || ""} />
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

              <h4 className="form-section-title mt-4">Estatísticas Vitais (Combate Rápido)</h4>
              <div className="form-row">
                <div className="form-group flex-1"><label>PV Máx</label><input type="number" name="hpMax" className="journey-input" placeholder="Ex: 45" defaultValue={activeData?.hpMax || ""} /></div>
                <div className="form-group flex-1"><label>CA</label><input type="number" name="ac" className="journey-input" placeholder="Ex: 15" defaultValue={activeData?.ac || ""} /></div>
                <div className="form-group flex-1"><label>Iniciativa</label><input type="text" name="init" className="journey-input" placeholder="Ex: +2" defaultValue={activeData?.init || ""} /></div>
                <div className="form-group flex-1"><label>Deslocamento</label><input type="text" name="speed" className="journey-input" placeholder="Ex: 30 ft" defaultValue={activeData?.speed || ""} /></div>
                <div className="form-group flex-1"><label>Percepção</label><input type="text" name="perc" className="journey-input" placeholder="Ex: 14" defaultValue={activeData?.perc || ""} /></div>
              </div>
              <div className="form-group mt-2">
                <label>Ataque Principal (Resumo)</label>
                <input type="text" name="mainAttack" className="journey-input" placeholder="Ex: Punhal: +5 acerto, 1d4+3 perfurante" defaultValue={activeData?.mainAttack || ""} />
              </div>
              
              <div className="form-row mt-4">
                <div className="form-group flex-1">
                  <label className="custom-checkbox">
                    <input type="checkbox" checked={hasSpells} onChange={(e) => setHasSpells(e.target.checked)} />
                    <span className="checkmark"></span>
                    <span>Este NPC possui Espaços de Magia?</span>
                  </label>
                </div>
                <div className="form-group flex-1">
                  <label className="custom-checkbox">
                    <input type="checkbox" name="isDead" defaultChecked={activeData?.isDead || false} />
                    <span className="checkmark"></span>
                    <span>NPC está Morto / Caído?</span>
                  </label>
                </div>
                <div className="form-group flex-1">
                  <label className="custom-checkbox">
                    <input type="checkbox" name="isHidden" defaultChecked={activeData?.isHidden || false} />
                    <span className="checkmark"></span>
                    <span>NPC está Oculto?</span>
                  </label>
                </div>
              </div>
              
              {hasSpells && (
                <div className="spell-slots-inputs mt-2">
                  <div className="slot-field"><label>1º</label><input type="number" name="s1" min="0" defaultValue={activeData?.spellSlots?.[1] || "0"} /></div>
                  <div className="slot-field"><label>2º</label><input type="number" name="s2" min="0" defaultValue={activeData?.spellSlots?.[2] || "0"} /></div>
                  <div className="slot-field"><label>3º</label><input type="number" name="s3" min="0" defaultValue={activeData?.spellSlots?.[3] || "0"} /></div>
                  <div className="slot-field"><label>4º</label><input type="number" name="s4" min="0" defaultValue={activeData?.spellSlots?.[4] || "0"} /></div>
                  <div className="slot-field"><label>5º</label><input type="number" name="s5" min="0" defaultValue={activeData?.spellSlots?.[5] || "0"} /></div>
                  <div className="slot-field"><label>6º</label><input type="number" name="s6" min="0" defaultValue={activeData?.spellSlots?.[6] || "0"} /></div>
                  <div className="slot-field"><label>7º</label><input type="number" name="s7" min="0" defaultValue={activeData?.spellSlots?.[7] || "0"} /></div>
                  <div className="slot-field"><label>8º</label><input type="number" name="s8" min="0" defaultValue={activeData?.spellSlots?.[8] || "0"} /></div>
                  <div className="slot-field"><label>9º</label><input type="number" name="s9" min="0" defaultValue={activeData?.spellSlots?.[9] || "0"} /></div>
                </div>
              )}

              <h4 className="form-section-title mt-4">Detalhes de Combate</h4>
              <div className="form-row">
                <div className="form-group flex-1"><label>Resistências</label><input type="text" name="res" className="journey-input" defaultValue={activeData?.res || ""} /></div>
                <div className="form-group flex-1"><label>Imunidades</label><input type="text" name="imm" className="journey-input" defaultValue={activeData?.imm || ""} /></div>
              </div>
              <div className="form-group mt-2"><label>Ações Completas (Texto Livre)</label><textarea name="actions" className="journey-input form-textarea" defaultValue={activeData?.actions || ""}></textarea></div>

              <h4 className="form-section-title mt-4">Teatro Mental & História</h4>
              <div className="form-row">
                <div className="form-group flex-1"><label>Motivações</label><textarea name="mot" className="journey-input form-textarea" defaultValue={activeData?.mot || ""}></textarea></div>
                <div className="form-group flex-1"><label>Segredos e Fraquezas</label><textarea name="sec" className="journey-input form-textarea" defaultValue={activeData?.sec || ""}></textarea></div>
              </div>
              <div className="form-group mt-2"><label>Traços / Adjetivos</label><input type="text" name="traits" className="journey-input" defaultValue={activeData?.traits || ""} /></div>

              <h4 className="form-section-title mt-4">Inventário e Notas</h4>
              <div className="form-row">
                <div className="form-group flex-1"><label>Itens Visíveis</label><textarea name="itemsVis" className="journey-input form-textarea" defaultValue={activeData?.itemsVis || ""}></textarea></div>
                <div className="form-group flex-1"><label>Itens Escondidos</label><textarea name="itemsHid" className="journey-input form-textarea" defaultValue={activeData?.itemsHid || ""}></textarea></div>
              </div>
              <div className="form-group mt-2"><label>Notas do Mestre</label><textarea name="notes" className="journey-input form-textarea" style={{ minHeight: "120px" }} defaultValue={activeData?.notes || ""}></textarea></div>
            </div>
          </div>
        </form>
        <footer className="modal-footer" style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: "10px" }}>
            <button type="button" className="btn danger-btn" onClick={onClose}><span>Cancelar</span></button>
            {activeData && (
              <button type="button" className="btn danger-btn" onClick={async () => {
                if (await showConfirm({ title: "Excluir NPC", message: `Tem certeza que deseja excluir o NPC "${activeData.name}" permanentemente?`, type: "danger" })) {
                  const newNpcs = dadosGlobais.npcs.filter((n: any) => n.id !== activeData.id);
                  setDadosGlobais({ ...dadosGlobais, npcs: newNpcs });
                  setTimeout(salvarEstadoLocal, 100);
                  onClose();
                  setTimeout(() => showAlert({ title: "Sucesso", message: "NPC excluido com sucesso", type: "success" }), 200);
                }
              }}>
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" style={{ marginRight: "4px" }}>
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                <span>Excluir</span>
              </button>
            )}
          </div>
          <button type="submit" className="btn primary-btn" onClick={(e) => {
            const form = (e.target as HTMLElement).closest('.modal-content')?.querySelector('form');
            if (form) form.requestSubmit();
          }}>
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            <span>Salvar NPC</span>
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
