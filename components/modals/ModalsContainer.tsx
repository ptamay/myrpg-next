"use client";

import { useAppContext } from "@/contexts/AppContext";
import NpcFormModal from "./NpcFormModal";
import NpcDetailModal from "./NpcDetailModal";
import PlayerFormModal from "./PlayerFormModal";
import PlayerManageModal from "./PlayerManageModal";
import GlobalEventModal, { GlobalEventDetailModal } from "./GlobalEventModal";
import PassDayModal from "./PassDayModal";
import CropModal from "./CropModal";
import { MainQuestModal, MainQuestDetailModal, SideQuestModal, SideQuestDetailModal } from "./QuestModals";
import { NpcImportTextModal, NpcImportOptionsModal } from "./ImportModals";
import SummaryCardModal from "./SummaryCardModal";
import SessionPlayerModal from "./SessionPlayerModal";
import PlayerDetailModal from "./PlayerDetailModal";

export default function ModalsContainer() {
  const { modals, setModals, activeData, diaAtual, jornadaPorDia } = useAppContext();

  const close = (key: keyof typeof modals) => {
    setModals((prev: any) => ({ ...prev, [key]: false }));
  };

  const dayData = jornadaPorDia && jornadaPorDia[diaAtual];
  const faseAtual = dayData ? dayData.fase : 'Manhã';

  const getFaseGradient = () => {
    switch(faseAtual) {
       case 'Manhã': return 'linear-gradient(to bottom, rgba(253, 224, 71, 0.07), #09090b 40%)';
       case 'Tarde': return 'linear-gradient(to bottom, rgba(249, 115, 22, 0.07), #09090b 40%)';
       case 'Noite': return 'linear-gradient(to bottom, rgba(59, 130, 246, 0.07), #09090b 40%)';
       case 'Madrugada': return 'linear-gradient(to bottom, rgba(16, 185, 129, 0.05), #09090b 40%)';
       default: return '#09090b';
    }
  };

  return (
    <>
      <style>{`
        .modal-content {
           background: ${getFaseGradient()} !important;
        }
      `}</style>
      <NpcFormModal isOpen={modals.npcForm} onClose={() => close("npcForm")} />
      <NpcDetailModal isOpen={modals.npcDetail} onClose={() => close("npcDetail")} npc={activeData} />
      
      <PlayerFormModal isOpen={modals.playerForm} onClose={() => close("playerForm")} />
      <PlayerManageModal isOpen={modals.playerManage} onClose={() => close("playerManage")} player={activeData} />
      {modals.playerDetail && <PlayerDetailModal isOpen={modals.playerDetail} onClose={() => close("playerDetail")} player={activeData} />}
      
      <GlobalEventModal isOpen={modals.globalEvent} onClose={() => close("globalEvent")} />
      <GlobalEventDetailModal isOpen={modals.globalEventDetail} onClose={() => close("globalEventDetail")} />
      
      <PassDayModal isOpen={modals.passDay} onClose={() => close("passDay")} />

      <CropModal isOpen={modals.crop} onClose={() => close("crop")} />
      
      <MainQuestModal isOpen={modals.mainQuest} onClose={() => close("mainQuest")} />
      <MainQuestDetailModal isOpen={modals.mainQuestDetail} onClose={() => close("mainQuestDetail")} />
      
      <SideQuestModal isOpen={modals.sideQuest} onClose={() => close("sideQuest")} />
      <SideQuestDetailModal isOpen={modals.sideQuestDetail} onClose={() => close("sideQuestDetail")} />

      <NpcImportTextModal isOpen={modals.importNpcText} onClose={() => close("importNpcText")} />
      <NpcImportOptionsModal isOpen={modals.importNpcOptions} onClose={() => close("importNpcOptions")} />
      
      <SummaryCardModal isOpen={modals.summaryCard} onClose={() => close("summaryCard")} />
      
      <SessionPlayerModal isOpen={modals.sessionPlayer} onClose={() => close("sessionPlayer")} />
    </>
  );
}
