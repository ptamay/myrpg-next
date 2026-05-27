"use client";

import React, { useEffect, useState } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  id?: string;
}

export default function Modal({ isOpen, onClose, children, id }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div
      id={id}
      className={`modal-overlay ${isOpen ? "active" : ""}`}
      style={{
        display: isOpen ? "flex" : "none",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 1000,
        justifyContent: "center",
        alignItems: "center",
        background: "rgba(10, 10, 15, 0.7)",
        backdropFilter: "blur(5px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {children}
    </div>
  );
}
