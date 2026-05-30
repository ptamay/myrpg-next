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
import PersonalNoteModal, { PersonalNoteDetailModal } from "./PersonalNoteModal";

export default function ModalsContainer() {
  const { modals, setModals, activeData, diaAtual, jornadaPorDia, indiceBlocoAtivo } = useAppContext();

  const close = (key: keyof typeof modals) => {
    setModals((prev: any) => ({ ...prev, [key]: false }));
  };

  const getFaseGradient = () => {
    switch(indiceBlocoAtivo) {
       case 0: return 'linear-gradient(to bottom, rgba(245, 225, 164, 0.07), #09090b 40%)';
       case 1: return 'linear-gradient(to bottom, rgba(255, 195, 0, 0.07), #09090b 40%)';
       case 2: return 'linear-gradient(to bottom, rgba(191, 107, 44, 0.07), #09090b 40%)';
       case 3: return 'linear-gradient(to bottom, rgba(204, 51, 255, 0.07), #09090b 40%)';
       case 4: return 'linear-gradient(to bottom, rgba(0, 102, 204, 0.07), #09090b 40%)';
       case 5: return 'linear-gradient(to bottom, rgba(153, 102, 255, 0.07), #09090b 40%)';
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

      <PersonalNoteModal isOpen={modals.personalNote} onClose={() => close("personalNote")} />
      <PersonalNoteDetailModal isOpen={modals.personalNoteDetail} onClose={() => close("personalNoteDetail")} />
    </>
  );
}
