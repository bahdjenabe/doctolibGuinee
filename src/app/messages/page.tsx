"use client";

// ============================================================
// MESSAGERIE — /messages/page.tsx
// ============================================================
//
// Page partagée patient ET médecin (le rôle est déduit du champ
// doctorId/patientId de chaque conversation).
//
//   - Colonne gauche : liste des conversations (dernier message + non-lus)
//   - Colonne droite : fil de discussion + zone de saisie
//   - ?c=<convId> pré-sélectionne une conversation
//
// Temps réel via onSnapshot (voir src/lib/messaging.ts).
// ============================================================

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Conversation, Message } from "@/types/message";
import {
  listenConversations,
  listenMessages,
  sendMessage,
  markConversationRead,
} from "@/lib/messaging";

// ── Formatage heure courte ──
function msgTime(ts: any): string {
  const d = ts?.toDate?.();
  if (!d) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function relTime(ts: any): string {
  const d = ts?.toDate?.();
  if (!d) return "";
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return "à l'instant";
  if (diff < 3600) return `${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h`;
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function MessagesInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { user } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(params.get("c"));
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);

  const bottomRef = useRef<HTMLDivElement>(null);

  // ── Écoute des conversations ──
  useEffect(() => {
    if (!user) return;
    const unsub = listenConversations(user.uid, (convs) => {
      setConversations(convs);
      setLoadingConvs(false);
      // Sélection par défaut : la plus récente si rien de choisi.
      setActiveId((prev) => prev || convs[0]?.id || null);
    });
    return () => unsub();
  }, [user]);

  // ── Écoute des messages de la conversation active ──
  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }
    const unsub = listenMessages(activeId, setMessages);
    return () => unsub();
  }, [activeId]);

  // ── Marque comme lu à l'ouverture ──
  useEffect(() => {
    if (activeId && user) markConversationRead(activeId, user.uid);
  }, [activeId, user, messages.length]);

  // ── Scroll auto en bas ──
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const active = conversations.find((c) => c.id === activeId) || null;

  // Nom + sous-titre de l'interlocuteur selon le rôle de l'utilisateur.
  const otherOf = (c: Conversation) => {
    const isDoctor = c.doctorId === user?.uid;
    return {
      name: isDoctor ? c.patientName : c.doctorName,
      sub: isDoctor ? "Patient" : c.specialty || "Médecin",
    };
  };

  const handleSend = async () => {
    if (!active || !user || !draft.trim()) return;
    setSending(true);
    try {
      await sendMessage(
        active,
        { id: user.uid, name: user.displayName || user.email || "Utilisateur" },
        draft,
      );
      setDraft("");
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header simple */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="text-sm text-gray-500 hover:text-gray-800"
          >
            ← Retour
          </button>
          <span className="font-bold text-blue-900">Messagerie</span>
          <div className="w-12" />
        </div>
      </header>

      <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-9rem)]">
          {/* ── Liste des conversations ── */}
          <aside
            className={`md:col-span-1 bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col ${
              active ? "hidden md:flex" : "flex"
            }`}
          >
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 text-sm">
                Conversations
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loadingConvs ? (
                <div className="p-6 text-center text-gray-400 text-sm">
                  Chargement…
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="text-3xl mb-2">💬</div>
                  <p className="text-sm text-gray-500">Aucune conversation</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Contactez un médecin depuis sa fiche pour démarrer.
                  </p>
                </div>
              ) : (
                conversations.map((c) => {
                  const o = otherOf(c);
                  const unread = (user && c.unread?.[user.uid]) || 0;
                  const isActive = c.id === activeId;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setActiveId(c.id)}
                      className={`w-full text-left px-4 py-3 flex items-center gap-3 border-b border-gray-50 transition-colors ${
                        isActive ? "bg-blue-50" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {o.name?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {o.name}
                          </p>
                          <span className="text-[10px] text-gray-400 flex-shrink-0">
                            {relTime(c.updatedAt)}
                          </span>
                        </div>
                        <p
                          className={`text-xs truncate ${
                            unread > 0
                              ? "text-gray-900 font-medium"
                              : "text-gray-400"
                          }`}
                        >
                          {c.lastSenderId === user?.uid && "Vous : "}
                          {c.lastMessage || "Nouvelle conversation"}
                        </p>
                      </div>
                      {unread > 0 && (
                        <span className="ml-1 min-w-[18px] h-[18px] px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                          {unread > 9 ? "9+" : unread}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* ── Fil de discussion ── */}
          <section
            className={`md:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden flex-col ${
              active ? "flex" : "hidden md:flex"
            }`}
          >
            {!active ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                <div className="text-4xl mb-3">✉️</div>
                <p className="text-gray-500 text-sm">
                  Sélectionnez une conversation
                </p>
              </div>
            ) : (
              <>
                {/* En-tête de la conversation */}
                <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                  <button
                    onClick={() => setActiveId(null)}
                    className="md:hidden text-gray-400 text-sm"
                  >
                    ←
                  </button>
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">
                    {otherOf(active).name?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {otherOf(active).name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {otherOf(active).sub}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50/50">
                  {messages.length === 0 && (
                    <p className="text-center text-xs text-gray-400 py-6">
                      Début de votre conversation. Écrivez un message ci-dessous.
                    </p>
                  )}
                  {messages.map((m) => {
                    const mine = m.senderId === user?.uid;
                    return (
                      <div
                        key={m.id}
                        className={`flex ${mine ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm ${
                            mine
                              ? "bg-blue-600 text-white rounded-br-sm"
                              : "bg-white border border-gray-100 text-gray-800 rounded-bl-sm"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">
                            {m.text}
                          </p>
                          <p
                            className={`text-[10px] mt-1 text-right ${
                              mine ? "text-blue-100" : "text-gray-400"
                            }`}
                          >
                            {msgTime(m.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>

                {/* Saisie */}
                <div className="p-3 border-t border-gray-100 flex items-end gap-2">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    rows={1}
                    placeholder="Écrivez un message…"
                    className="flex-1 resize-none max-h-32 px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400"
                  />
                  <button
                    onClick={handleSend}
                    disabled={sending || !draft.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                  >
                    Envoyer
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

export default function MessagesPage() {
  return (
    <ProtectedRoute>
      <Suspense
        fallback={
          <main className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </main>
        }
      >
        <MessagesInner />
      </Suspense>
    </ProtectedRoute>
  );
}
