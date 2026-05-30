"use client";
import { useState, useEffect } from "react";
import DiarioFeed from "../cronicas/diario/DiarioFeed";
import MuralCanvas from "../cronicas/mural/MuralCanvas";
import { motion, AnimatePresence } from "framer-motion";

type CronicasTab = "diario" | "mural";

export default function CronicasView() {
  const [activeTab, setActiveTab] = useState<CronicasTab>("diario");

  useEffect(() => {
    const hash = window.location.hash;
    if (hash === "#mural") {
      setActiveTab("mural");
    } else if (hash === "#diario") {
      setActiveTab("diario");
    }
  }, []);

  const tabs: { id: CronicasTab; label: string }[] = [
    { id: "diario", label: "Diário de Bordo" },
    { id: "mural", label: "Mural de Investigação" },
  ];

  return (
    <div className="npc-view-container" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div className="npc-header glass-panel">
        <div>
          <h2 className="view-title">Crônicas</h2>
          <p className="view-subtitle">Registros e investigações da campanha.</p>
        </div>
        <div className="filter-tags">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`filter-tag ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: "hidden", position: "relative" }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
            transition={{ duration: 0.3 }}
            style={{ height: "100%" }}
          >
            {activeTab === "diario" && <DiarioFeed />}
            {activeTab === "mural" && <MuralCanvas />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
