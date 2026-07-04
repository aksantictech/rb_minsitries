"use client";

import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight, Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import PublicHeader from "../../components/PublicHeader";
import { createClient } from "../../lib/supabase/browser";

type AgendaItem = {
  id: string;
  event_date: string;
  public_status: string;
  public_label: string | null;
};

const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function toKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatMonth(value: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(parseDate(value));
}

function getStatusConfig(status: string) {
  const normalized = status.toLowerCase();

  if (normalized.includes("disponible")) {
    return { label: status, color: "#047857", background: "rgba(16,185,129,0.12)" };
  }

  if (normalized.includes("attente") || normalized.includes("réservation")) {
    return { label: status, color: "#b7791f", background: "rgba(217,164,65,0.15)" };
  }

  if (normalized.includes("mission") || normalized.includes("conférence")) {
    return { label: status, color: "#b91c1c", background: "rgba(239,68,68,0.10)" };
  }

  if (normalized.includes("occupé") || normalized.includes("indisponible")) {
    return { label: status, color: "#c2410c", background: "rgba(251,146,60,0.13)" };
  }

  return { label: status, color: "#c88a20", background: "rgba(217,164,65,0.14)" };
}

function buildCalendarDays(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const mondayStartIndex = (firstDay.getDay() + 6) % 7;

  const days: Array<Date | null> = [];

  for (let i = 0; i < mondayStartIndex; i += 1) {
    days.push(null);
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    days.push(new Date(year, month, day));
  }

  while (days.length % 7 !== 0) {
    days.push(null);
  }

  return days;
}

export default function AgendaPage() {
  const supabase = createClient();

  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadAgenda() {
      const { data, error } = await supabase
        .from("public_agenda")
        .select("id, event_date, public_status, public_label")
        .eq("is_public", true)
        .order("event_date", { ascending: true });

      if (error) {
        setErrorMessage(error.message);
      } else {
        setAgenda((data || []) as AgendaItem[]);
      }

      setIsLoading(false);
    }

    loadAgenda();
  }, [supabase]);

  const agendaByDate = useMemo(() => {
    return agenda.reduce<Record<string, AgendaItem>>((acc, item) => {
      acc[item.event_date] = item;
      return acc;
    }, {});
  }, [agenda]);

  const calendarDays = useMemo(() => buildCalendarDays(currentMonth), [currentMonth]);

  const upcomingItems = useMemo(() => {
    const todayKey = toKey(new Date());
    return agenda.filter((item) => item.event_date >= todayKey).slice(0, 6);
  }, [agenda]);

  function moveMonth(direction: "previous" | "next") {
    setCurrentMonth((current) => {
      const nextMonth = direction === "next" ? current.getMonth() + 1 : current.getMonth() - 1;
      return new Date(current.getFullYear(), nextMonth, 1);
    });
  }

  return (
    <main className="page">
      <PublicHeader />

      <section className="section">
        <div className="container">
          <div
            className="card rb-gold-glow"
            style={{
              padding: 34,
              marginBottom: 28,
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) auto",
              gap: 24,
              alignItems: "center",
            }}
          >
            <div>
              <p
                style={{
                  color: "var(--gold-bright)",
                  letterSpacing: "0.26em",
                  textTransform: "uppercase",
                  fontWeight: 900,
                  fontSize: 12,
                  margin: 0,
                }}
              >
                Disponibilité publique
              </p>

              <h1 style={{ fontSize: 54, margin: "14px 0 14px" }}>
                Agenda <span className="gold-text">du ministère</span>
              </h1>

              <p style={{ color: "var(--muted)", lineHeight: 1.8, maxWidth: 900, margin: 0 }}>
                Ce calendrier affiche uniquement les disponibilités publiques du Pasteur Roy. Les détails privés restent réservés à l’équipe du ministère.
              </p>
            </div>

            <Link href="/invitation" className="btn btn-primary">
              <Send size={18} />
              Demander une invitation
            </Link>
          </div>

          {errorMessage ? (
            <div
              className="card"
              style={{
                padding: 22,
                marginBottom: 24,
                color: "#fecaca",
                borderColor: "rgba(239,68,68,0.35)",
              }}
            >
              {errorMessage}
            </div>
          ) : null}

          <section
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.4fr) minmax(330px, 0.75fr)",
              gap: 24,
              alignItems: "start",
            }}
          >
            <div className="card" style={{ padding: 24 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  marginBottom: 22,
                }}
              >
                <button type="button" onClick={() => moveMonth("previous")} className="btn btn-secondary">
                  <ChevronLeft size={18} />
                </button>

                <h2 style={{ margin: 0, fontSize: 30, textTransform: "capitalize" }}>
                  {formatMonth(currentMonth)}
                </h2>

                <button type="button" onClick={() => moveMonth("next")} className="btn btn-secondary">
                  <ChevronRight size={18} />
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                {weekDays.map((day) => (
                  <div
                    key={day}
                    style={{
                      color: "var(--gold-bright)",
                      fontWeight: 900,
                      textAlign: "center",
                      padding: "10px 0",
                    }}
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                  gap: 10,
                }}
              >
                {calendarDays.map((date, index) => {
                  const key = date ? toKey(date) : `empty-${index}`;
                  const item = date ? agendaByDate[toKey(date)] : null;
                  const config = item ? getStatusConfig(item.public_status) : null;
                  const isToday = date ? toKey(date) === toKey(new Date()) : false;

                  return (
                    <div
                      key={key}
                      style={{
                        minHeight: 112,
                        borderRadius: 18,
                        padding: 12,
                        background: date
                          ? isToday
                            ? "rgba(217,164,65,0.13)"
                            : "rgba(255,255,255,0.04)"
                          : "transparent",
                        border: date
                          ? isToday
                            ? "1px solid rgba(217,164,65,0.55)"
                            : "1px solid rgba(255,255,255,0.08)"
                          : "1px solid transparent",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        gap: 8,
                      }}
                    >
                      {date ? (
                        <>
                          <strong style={{ color: isToday ? "var(--gold-bright)" : "var(--cream)" }}>
                            {date.getDate()}
                          </strong>

                          {item && config ? (
                            <div
                              style={{
                                borderRadius: 14,
                                padding: "8px 9px",
                                background: config.background,
                                color: config.color,
                                fontSize: 12,
                                lineHeight: 1.35,
                                fontWeight: 900,
                              }}
                            >
                              {config.label}
                            </div>
                          ) : (
                            <span style={{ color: "var(--muted)", fontSize: 12 }}>
                              —
                            </span>
                          )}
                        </>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>

            <aside style={{ display: "grid", gap: 18 }}>
              <div className="card rb-gold-glow" style={{ padding: 24 }}>
                <CalendarDays color="var(--gold-bright)" size={36} />
                <h2 style={{ margin: "14px 0 10px" }}>Prochaines disponibilités</h2>

                {isLoading ? (
                  <p style={{ color: "var(--muted)" }}>Chargement...</p>
                ) : null}

                {!isLoading && upcomingItems.length === 0 ? (
                  <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
                    Aucune disponibilité publique enregistrée pour le moment.
                  </p>
                ) : null}

                <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
                  {upcomingItems.map((item) => {
                    const config = getStatusConfig(item.public_status);

                    return (
                      <div
                        key={item.id}
                        style={{
                          border: "1px solid rgba(217,164,65,0.16)",
                          borderRadius: 16,
                          padding: 15,
                          background: "rgba(255,255,255,0.04)",
                        }}
                      >
                        <strong style={{ color: "var(--cream)", textTransform: "capitalize" }}>
                          {formatDate(item.event_date)}
                        </strong>
                        <p style={{ margin: "8px 0 0", color: config.color, fontWeight: 900 }}>
                          {item.public_status}
                        </p>
                        {item.public_label ? (
                          <p style={{ margin: "6px 0 0", color: "var(--muted)", lineHeight: 1.55 }}>
                            {item.public_label}
                          </p>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="card" style={{ padding: 22 }}>
                <h3 style={{ marginTop: 0, color: "var(--gold-bright)" }}>
                  Légende
                </h3>
                <Legend label="Disponible" color="#047857" />
                <Legend label="En attente" color="#b7791f" />
                <Legend label="Occupé" color="#c2410c" />
                <Legend label="Mission / Conférence" color="#b91c1c" />
              </div>
            </aside>
          </section>
        </div>
      </section>
    </main>
  );
}

function Legend({ label, color }: { label: string; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
      <span
        style={{
          width: 12,
          height: 12,
          borderRadius: "50%",
          background: color,
          display: "inline-block",
        }}
      />
      <span style={{ color: "var(--muted)", fontWeight: 800 }}>{label}</span>
    </div>
  );
}
