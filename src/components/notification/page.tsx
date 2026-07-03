/**
 * ============================================================
 * COMPOSANT NotificationBell — src/components/NotificationBell.tsx
 * ============================================================
 *
 * Cloche de notification à placer dans le header.
 *
 * CORRECTIONS :
 * - Ajout de logs pour voir si les notifications arrivent
 * - Meilleur style du panneau déroulant
 * - Gestion du cas où userId est undefined
 * ============================================================
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { useNotifications } from "@/hooks/useNotifications";

// ============================================================
// HELPERS
// ============================================================

const timeAgo = (timestamp: any): string => {
  if (!timestamp) return "";
  try {
    const date =
      typeof timestamp?.toDate === "function"
        ? timestamp.toDate()
        : new Date(timestamp);
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return "À l'instant";
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
    return `Il y a ${Math.floor(diff / 86400)} j`;
  } catch {
    return "";
  }
};

const getNotifIcon = (type: string): string => {
  if (type === "appointment_cancelled_by_patient") return "👤";
  if (type === "appointment_cancelled_by_doctor") return "🏥";
  if (type === "appointment_rescheduled_by_patient") return "📅";
  if (type === "appointment_reminder") return "⏰";
  return "🔔";
};

const getNotifColor = (type: string): string => {
  if (type === "appointment_cancelled_by_doctor") return "#fef2f2";
  if (type === "appointment_cancelled_by_patient") return "#fff7ed";
  if (type === "appointment_rescheduled_by_patient") return "#eff6ff";
  if (type === "appointment_reminder") return "#fffbeb";
  return "#f0f7ff";
};

// ============================================================
// PROPS
// ============================================================

type Props = {
  userId: string | undefined;
};

// ============================================================
// COMPOSANT
// ============================================================

export default function NotificationBell({ userId }: Props) {
  const { notifications, unreadCount, markAllAsRead, markOneAsRead } =
    useNotifications(userId);

  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Fermeture au clic extérieur
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const handleOpen = () => {
    const next = !open;
    setOpen(next);
    // Marque comme lues quand on ouvre
    if (next && unreadCount > 0) markAllAsRead();
  };

  // Ne rien afficher si pas de userId
  if (!userId) return null;

  return (
    <>
      <style>{`
        @keyframes bellRing {
          0%,100% { transform:rotate(0deg); }
          15%,45%  { transform:rotate(-12deg); }
          30%,60%  { transform:rotate(12deg); }
        }
        .bell-ring { animation: bellRing 0.5s ease; }

        @keyframes slideDown {
          from { opacity:0; transform:translateY(-6px) scale(0.98); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        .panel-anim { animation: slideDown 0.18s ease forwards; }

        .notif-item { transition: background 0.15s; }
        .notif-item:hover { background: #f9fafb !important; }
      `}</style>

      <div ref={panelRef} style={{ position: "relative" }}>
        {/* ── Bouton cloche ── */}
        <button
          onClick={handleOpen}
          className={unreadCount > 0 ? "bell-ring" : ""}
          title={`${unreadCount} notification(s) non lue(s)`}
          style={{
            position: "relative",
            width: 38,
            height: 38,
            borderRadius: 12,
            border: `1px solid ${open ? "#1a56a0" : "#e5e7eb"}`,
            background: open ? "#e6f1fb" : "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          {/* Icône cloche SVG */}
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke={unreadCount > 0 ? "#1a56a0" : "#6b7280"}
            strokeWidth="2"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>

          {/* Badge rouge nombre non lues */}
          {unreadCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: -5,
                right: -5,
                minWidth: 18,
                height: 18,
                borderRadius: 9,
                background: "#dc2626",
                color: "white",
                fontSize: 10,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 4px",
                border: "2px solid white",
                lineHeight: 1,
              }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {/* ── Panneau déroulant ── */}
        {open && (
          <div
            className="panel-anim"
            style={{
              position: "absolute",
              top: "calc(100% + 10px)",
              right: 0,
              width: 340,
              maxHeight: 440,
              background: "white",
              borderRadius: 18,
              border: "1px solid #e5e7eb",
              boxShadow: "0 10px 40px rgba(0,0,0,0.13)",
              overflow: "hidden",
              zIndex: 999,
              fontFamily: "'DM Sans', system-ui, sans-serif",
            }}
          >
            {/* En-tête panneau */}
            <div
              style={{
                padding: "14px 16px",
                borderBottom: "1px solid #f3f4f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "white",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}
                >
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      background: "#e6f1fb",
                      color: "#1a56a0",
                      padding: "2px 7px",
                      borderRadius: 20,
                    }}
                  >
                    {unreadCount} nouvelle{unreadCount > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              {notifications.length > 0 && (
                <button
                  onClick={markAllAsRead}
                  style={{
                    fontSize: 11,
                    color: "#1a56a0",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  Tout lire
                </button>
              )}
            </div>

            {/* Corps du panneau */}
            <div style={{ overflowY: "auto", maxHeight: 380 }}>
              {/* Vide */}
              {notifications.length === 0 && (
                <div style={{ padding: "40px 20px", textAlign: "center" }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>🔔</div>
                  <p
                    style={{ fontSize: 13, color: "#6b7280", fontWeight: 400 }}
                  >
                    Aucune notification
                  </p>
                  <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
                    Vous serez notifié en cas d'annulation
                  </p>
                </div>
              )}

              {/* Liste notifications */}
              {notifications.map((notif, i) => (
                <div
                  key={notif.id}
                  className="notif-item"
                  onClick={() => markOneAsRead(notif.id)}
                  style={{
                    padding: "12px 16px",
                    borderBottom:
                      i < notifications.length - 1
                        ? "1px solid #f9fafb"
                        : "none",
                    display: "flex",
                    gap: 10,
                    cursor: "pointer",
                    background: !notif.read ? "#f0f7ff" : "white",
                  }}
                >
                  {/* Icône */}
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      flexShrink: 0,
                      background: getNotifColor(notif.type),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 17,
                    }}
                  >
                    {getNotifIcon(notif.type)}
                  </div>

                  {/* Texte */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: 12,
                        color: "#111827",
                        lineHeight: 1.5,
                        margin: 0,
                        fontWeight: !notif.read ? 500 : 400,
                      }}
                    >
                      {notif.message}
                    </p>
                    <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 3 }}>
                      {timeAgo(notif.createdAt)}
                    </p>
                  </div>

                  {/* Point bleu non lu */}
                  {!notif.read && (
                    <div
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: "#1a56a0",
                        flexShrink: 0,
                        marginTop: 6,
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
