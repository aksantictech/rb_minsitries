"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  HeartHandshake,
  MailPlus,
  MessageCircleHeart,
  Mic2,
  Sparkles,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import AdminShell from "../../components/AdminShell";
import { createClient } from "../../lib/supabase/browser";

type PrayerRow = {
  id: string;
  full_name: string;
  category: string;
  confidentiality: string;
  status: string;
  priority: string;
  created_at: string;
};

type TestimonyRow = {
  id: string;
  full_name: string;
  city_country: string | null;
  status: string;
  can_publish: boolean;
  created_at: string;
};

type AppointmentRow = {
  id: string;
  full_name: string;
  appointment_type: string;
  meeting_format: string;
  urgency: string;
  status: string;
  requested_date: string | null;
  created_at: string;
};

type InvitationRow = {
  id: string;
  organization_name: string;
  event_type: string;
  city_country: string;
  status: string;
  requested_date: string | null;
  created_at: string;
};

type EncouragementRow = {
  id: string;
  full_name: string;
  message_type: string;
  status: string;
  can_publish: boolean;
  created_at: string;
};

type TeachingRow = {
  id: string;
  title: string;
  category: string;
  is_featured: boolean;
  created_at: string;
};

type BookRow = {
  id: string;
  title: string;
  is_latest: boolean;
  is_featured: boolean;
  is_public: boolean;
  created_at: string;
};

type SubscriberRow = {
  id: string;
  full_name: string;
  wants_notifications: boolean;
  created_at: string;
};

type RecentActivity = {
  id: string;
  module: string;
  title: string;
  subtitle: string;
  status: string;
  created_at: string;
  href: string;
};

const COLORS = ["#d9a441", "#be185d", "#60a5fa", "#34d399", "#fb923c", "#a78bfa"];

function formatDate(value: string | null) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatDayKey(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

function getStatusLabel(status: string) {
  if (status === "new") return "Nouveau";
  if (status === "pending") return "En attente";
  if (status === "approved") return "Validé";
  if (status === "published") return "Publié";
  if (status === "rejected") return "Rejeté";
  if (status === "treated") return "Traité";
  if (status === "archived") return "Archivé";
  return status;
}

function getStatusColor(status: string) {
  if (["approved", "published", "treated"].includes(status)) return "#34d399";
  if (["pending", "new"].includes(status)) return "#f6c453";
  if (["rejected"].includes(status)) return "#ef4444";
  return "#c8c0b2";
}

function isOpenStatus(status: string) {
  return ["new", "pending"].includes(status);
}

function isRecent(createdAt: string, days = 7) {
  const created = new Date(createdAt).getTime();
  const limit = Date.now() - days * 24 * 60 * 60 * 1000;
  return created >= limit;
}

export default function AdminDashboardPage() {
  const supabase = useMemo(() => createClient(), []);

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [prayers, setPrayers] = useState<PrayerRow[]>([]);
  const [testimonies, setTestimonies] = useState<TestimonyRow[]>([]);
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [invitations, setInvitations] = useState<InvitationRow[]>([]);
  const [encouragements, setEncouragements] = useState<EncouragementRow[]>([]);
  const [teachings, setTeachings] = useState<TeachingRow[]>([]);
  const [books, setBooks] = useState<BookRow[]>([]);
  const [subscribers, setSubscribers] = useState<SubscriberRow[]>([]);

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = "/admin/login";
        return;
      }

      setIsCheckingAuth(false);
    }

    checkAuth();
  }, [supabase]);

  useEffect(() => {
    if (!isCheckingAuth) {
      loadDashboard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCheckingAuth]);

  async function loadDashboard() {
    setIsLoading(true);
    setErrorMessage("");

    const [
      prayersResult,
      testimoniesResult,
      appointmentsResult,
      invitationsResult,
      encouragementsResult,
      teachingsResult,
      booksResult,
      subscribersResult,
    ] = await Promise.all([
      supabase
        .from("prayer_requests")
        .select("id, full_name, category, confidentiality, status, priority, created_at")
        .order("created_at", { ascending: false })
        .limit(500),

      supabase
        .from("testimonies")
        .select("id, full_name, city_country, status, can_publish, created_at")
        .order("created_at", { ascending: false })
        .limit(500),

      supabase
        .from("appointments")
        .select("id, full_name, appointment_type, meeting_format, urgency, status, requested_date, created_at")
        .order("created_at", { ascending: false })
        .limit(500),

      supabase
        .from("invitations")
        .select("id, organization_name, event_type, city_country, status, requested_date, created_at")
        .order("created_at", { ascending: false })
        .limit(500),

      supabase
        .from("encouragement_messages")
        .select("id, full_name, message_type, status, can_publish, created_at")
        .order("created_at", { ascending: false })
        .limit(500),

      supabase
        .from("teachings")
        .select("id, title, category, is_featured, created_at")
        .order("created_at", { ascending: false })
        .limit(500),

      supabase
        .from("books")
        .select("id, title, is_latest, is_featured, is_public, created_at")
        .order("created_at", { ascending: false })
        .limit(500),

      supabase
        .from("subscribers")
        .select("id, full_name, wants_notifications, created_at")
        .order("created_at", { ascending: false })
        .limit(500),
    ]);

    const errors = [
      prayersResult.error,
      testimoniesResult.error,
      appointmentsResult.error,
      invitationsResult.error,
      encouragementsResult.error,
      teachingsResult.error,
      booksResult.error,
      subscribersResult.error,
    ].filter(Boolean);

    if (errors.length > 0) {
      setErrorMessage(errors.map((error) => error?.message).join(" | "));
    }

    setPrayers((prayersResult.data || []) as PrayerRow[]);
    setTestimonies((testimoniesResult.data || []) as TestimonyRow[]);
    setAppointments((appointmentsResult.data || []) as AppointmentRow[]);
    setInvitations((invitationsResult.data || []) as InvitationRow[]);
    setEncouragements((encouragementsResult.data || []) as EncouragementRow[]);
    setTeachings((teachingsResult.data || []) as TeachingRow[]);
    setBooks((booksResult.data || []) as BookRow[]);
    setSubscribers((subscribersResult.data || []) as SubscriberRow[]);
    setIsLoading(false);
  }

  const kpis = useMemo(() => {
    const openPrayers = prayers.filter((item) => isOpenStatus(item.status)).length;
    const pendingAppointments = appointments.filter((item) => isOpenStatus(item.status)).length;
    const pendingInvitations = invitations.filter((item) => isOpenStatus(item.status)).length;
    const pendingTestimonies = testimonies.filter((item) => isOpenStatus(item.status)).length;
    const pendingEncouragements = encouragements.filter((item) => isOpenStatus(item.status)).length;
    const activeNotifications = subscribers.filter((item) => item.wants_notifications).length;

    const totalRequests = prayers.length + testimonies.length + appointments.length + invitations.length + encouragements.length;
    const openActions = openPrayers + pendingAppointments + pendingInvitations + pendingTestimonies + pendingEncouragements;
    const recentRequests = [
      ...prayers,
      ...testimonies,
      ...appointments,
      ...invitations,
      ...encouragements,
    ].filter((item) => isRecent(item.created_at)).length;

    const excellenceScore = totalRequests > 0 ? Math.max(0, Math.round(((totalRequests - openActions) / totalRequests) * 100)) : 100;

    return {
      totalRequests,
      openActions,
      recentRequests,
      openPrayers,
      pendingAppointments,
      pendingInvitations,
      pendingTestimonies,
      pendingEncouragements,
      teachings: teachings.length,
      books: books.filter((item) => item.is_public).length,
      subscribers: subscribers.length,
      activeNotifications,
      excellenceScore,
    };
  }, [appointments, books, encouragements, invitations, prayers, subscribers, teachings, testimonies]);

  const requestsByModule = useMemo(
    () => [
      { module: "Prières", total: prayers.length, pending: prayers.filter((item) => isOpenStatus(item.status)).length },
      { module: "Témoignages", total: testimonies.length, pending: testimonies.filter((item) => isOpenStatus(item.status)).length },
      { module: "Rendez-vous", total: appointments.length, pending: appointments.filter((item) => isOpenStatus(item.status)).length },
      { module: "Invitations", total: invitations.length, pending: invitations.filter((item) => isOpenStatus(item.status)).length },
      { module: "Messages", total: encouragements.length, pending: encouragements.filter((item) => isOpenStatus(item.status)).length },
    ],
    [appointments, encouragements, invitations, prayers, testimonies]
  );

  const statusDistribution = useMemo(() => {
    const rows = [
      ...prayers,
      ...testimonies,
      ...appointments,
      ...invitations,
      ...encouragements,
    ];

    const grouped = rows.reduce<Record<string, number>>((acc, item) => {
      const label = getStatusLabel(item.status);
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(grouped).map(([status, total]) => ({ status, total }));
  }, [appointments, encouragements, invitations, prayers, testimonies]);

  const lastSevenDays = useMemo(() => {
    const allRows = [
      ...prayers,
      ...testimonies,
      ...appointments,
      ...invitations,
      ...encouragements,
    ];

    return Array.from({ length: 7 }).map((_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));

      const start = new Date(date);
      start.setHours(0, 0, 0, 0);

      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      const total = allRows.filter((item) => {
        const created = new Date(item.created_at);
        return created >= start && created <= end;
      }).length;

      return {
        day: formatDayKey(date),
        demandes: total,
      };
    });
  }, [appointments, encouragements, invitations, prayers, testimonies]);

  const recentActivities = useMemo<RecentActivity[]>(() => {
    const rows: RecentActivity[] = [
      ...prayers.map((item) => ({
        id: item.id,
        module: "Prière",
        title: item.full_name,
        subtitle: `${item.category} · ${item.confidentiality}`,
        status: item.status,
        created_at: item.created_at,
        href: `/admin/prayers?focus=${item.id}`,
      })),
      ...testimonies.map((item) => ({
        id: item.id,
        module: "Témoignage",
        title: item.full_name,
        subtitle: item.city_country || "Ville non renseignée",
        status: item.status,
        created_at: item.created_at,
        href: `/admin/testimonies?focus=${item.id}`,
      })),
      ...appointments.map((item) => ({
        id: item.id,
        module: "Rendez-vous",
        title: item.full_name,
        subtitle: `${item.appointment_type} · ${formatDate(item.requested_date)}`,
        status: item.status,
        created_at: item.created_at,
        href: `/admin/appointments?focus=${item.id}`,
      })),
      ...invitations.map((item) => ({
        id: item.id,
        module: "Invitation",
        title: item.organization_name,
        subtitle: `${item.event_type} · ${item.city_country}`,
        status: item.status,
        created_at: item.created_at,
        href: `/admin/invitations?focus=${item.id}`,
      })),
      ...encouragements.map((item) => ({
        id: item.id,
        module: "Message",
        title: item.full_name,
        subtitle: item.message_type,
        status: item.status,
        created_at: item.created_at,
        href: `/admin/encouragements?focus=${item.id}`,
      })),
    ];

    return rows.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10);
  }, [appointments, encouragements, invitations, prayers, testimonies]);

  const priorityActions = useMemo(() => {
    return [
      { label: "Prières à traiter", value: kpis.openPrayers, href: "/admin/prayers?status=open" },
      { label: "Rendez-vous en attente", value: kpis.pendingAppointments, href: "/admin/appointments?status=open" },
      { label: "Invitations à analyser", value: kpis.pendingInvitations, href: "/admin/invitations?status=open" },
      { label: "Témoignages à valider", value: kpis.pendingTestimonies, href: "/admin/testimonies?status=open" },
      { label: "Messages au Pasteur", value: kpis.pendingEncouragements, href: "/admin/encouragements?status=open" },
    ].filter((item) => item.value > 0);
  }, [kpis]);

  if (isCheckingAuth) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#05070d",
          color: "var(--cream)",
        }}
      >
        Vérification de la session admin...
      </main>
    );
  }

  return (
    <AdminShell
      title="Dashboard de suivi pastoral"
      subtitle="KPIs, graphiques, demandes et actions prioritaires"
    >
      {errorMessage ? (
        <div
          style={{
            border: "1px solid rgba(239,68,68,0.35)",
            background: "rgba(239,68,68,0.1)",
            color: "#fecaca",
            borderRadius: 18,
            padding: 18,
            marginBottom: 24,
            lineHeight: 1.7,
          }}
        >
          <strong>Erreur Supabase :</strong>
          <br />
          {errorMessage}
        </div>
      ) : null}

      {isLoading ? (
        <div className="card" style={{ padding: 24 }}>
          Chargement du dashboard dynamique...
        </div>
      ) : (
        <>
          <section
            className="card rb-gold-glow"
            style={{
              padding: 30,
              marginBottom: 28,
              background:
                "linear-gradient(135deg, rgba(217,164,65,0.12), rgba(190,24,93,0.07)), rgba(18,22,32,0.92)",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1.4fr) minmax(240px, 0.6fr)",
                gap: 28,
                alignItems: "center",
              }}
            >
              <div>
                <p
                  style={{
                    color: "var(--gold-bright)",
                    letterSpacing: "0.24em",
                    textTransform: "uppercase",
                    fontWeight: 900,
                    fontSize: 12,
                    margin: 0,
                  }}
                >
                  Centre de commandement pastoral
                </p>

                <h2 style={{ fontSize: 42, margin: "14px 0 10px", lineHeight: 1 }}>
                  Excellence, suivi et impact du ministère
                </h2>

                <p style={{ color: "var(--muted)", lineHeight: 1.8, maxWidth: 820 }}>
                  Ce tableau de bord sépare chaque type de demande, identifie les éléments
                  encore à traiter et permet d’ouvrir directement les listes de personnes ou demandes concernées.
                </p>
              </div>

              <div
                style={{
                  border: "1px solid rgba(217,164,65,0.22)",
                  borderRadius: 26,
                  padding: 22,
                  textAlign: "center",
                  background: "rgba(255,255,255,0.045)",
                }}
              >
                <p style={{ color: "var(--muted)", margin: 0, fontWeight: 800 }}>
                  Score de suivi pastoral
                </p>
                <strong style={{ color: "var(--gold-bright)", fontSize: 58 }}>
                  {kpis.excellenceScore}%
                </strong>
                <p style={{ color: "var(--muted)", margin: 0, lineHeight: 1.5 }}>
                  éléments traités / demandes reçues
                </p>
              </div>
            </div>
          </section>

          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
              gap: 18,
              marginBottom: 28,
            }}
          >
            <KpiCard title="Prières reçues" value={prayers.length} icon={<MessageCircleHeart />} tone="#d9a441" href="/admin/prayers" />
            <KpiCard title="Témoignages" value={testimonies.length} icon={<HeartHandshake />} tone="#be185d" href="/admin/testimonies" />
            <KpiCard title="Rendez-vous" value={appointments.length} icon={<CalendarDays />} tone="#60a5fa" href="/admin/appointments" />
            <KpiCard title="Invitations" value={invitations.length} icon={<Sparkles />} tone="#f6c453" href="/admin/invitations" />
            <KpiCard title="Encouragements" value={encouragements.length} icon={<MailPlus />} tone="#a78bfa" href="/admin/encouragements" />
            <KpiCard title="À traiter" value={kpis.openActions} icon={<Clock3 />} tone="#fb923c" href="/admin?filter=open" />
            <KpiCard title="Reçus cette semaine" value={kpis.recentRequests} icon={<TrendingUp />} tone="#34d399" href="/admin?filter=week" />
            <KpiCard title="Abonnés notifications" value={kpis.subscribers} icon={<UsersRound />} tone="#34d399" href="/admin/subscribers" />
            <KpiCard title="Enseignements" value={kpis.teachings} icon={<Mic2 />} tone="#be185d" href="/admin/teachings" />
            <KpiCard title="Livres publiés" value={kpis.books} icon={<BookOpen />} tone="#a78bfa" href="/admin/books" />
          </section>

          <section
            className="card"
            style={{
              padding: 22,
              marginBottom: 28,
              borderColor: "rgba(217,164,65,0.22)",
            }}
          >
            <h2 style={{ margin: "0 0 12px", color: "var(--gold-bright)" }}>
              Lecture des indicateurs
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 14,
                color: "var(--muted)",
                lineHeight: 1.7,
              }}
            >
              <p style={{ margin: 0 }}>
                <strong style={{ color: "var(--cream)" }}>Score de suivi :</strong> pourcentage des demandes déjà traitées. Si tout est nouveau ou en attente, le score reste bas.
              </p>
              <p style={{ margin: 0 }}>
                <strong style={{ color: "var(--cream)" }}>À traiter :</strong> demandes avec statut <strong>new</strong> ou <strong>pending</strong>, donc nécessitant une action de l’équipe.
              </p>
              <p style={{ margin: 0 }}>
                <strong style={{ color: "var(--cream)" }}>Reçus cette semaine :</strong> nouvelles demandes arrivées sur les 7 derniers jours.
              </p>
              <p style={{ margin: 0 }}>
                <strong style={{ color: "var(--cream)" }}>Abonnés notifications :</strong> données de la table <strong>subscribers</strong>. Le compteur reste à 0 tant que le formulaire d’abonnement n’est pas activé.
              </p>
            </div>
          </section>

          <section
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.25fr) minmax(360px, 0.75fr)",
              gap: 24,
              alignItems: "start",
            }}
          >
            <div style={{ display: "grid", gap: 24 }}>
              <ChartPanel title="Évolution des demandes sur 7 jours" description="Volume quotidien reçu par le ministère.">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={lastSevenDays}>
                    <defs>
                      <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d9a441" stopOpacity={0.45} />
                        <stop offset="95%" stopColor="#d9a441" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                    <XAxis dataKey="day" stroke="#c8c0b2" tickLine={false} axisLine={false} />
                    <YAxis stroke="#c8c0b2" tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area type="monotone" dataKey="demandes" stroke="#d9a441" strokeWidth={3} fill="url(#goldGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartPanel>

              <ChartPanel title="Répartition par module" description="Comparaison entre volume total et éléments en attente.">
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={requestsByModule}>
                    <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                    <XAxis dataKey="module" stroke="#c8c0b2" tickLine={false} axisLine={false} />
                    <YAxis stroke="#c8c0b2" tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="total" name="Total" fill="#d9a441" radius={[10, 10, 0, 0]} />
                    <Bar dataKey="pending" name="En attente" fill="#be185d" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartPanel>

              <section className="card" style={{ padding: 26 }}>
                <h2 style={{ marginTop: 0, color: "var(--gold-bright)" }}>
                  Dernières activités reçues
                </h2>

                <div style={{ display: "grid", gap: 14 }}>
                  {recentActivities.length === 0 ? (
                    <p style={{ color: "var(--muted)" }}>Aucune activité récente.</p>
                  ) : (
                    recentActivities.map((activity) => (
                      <Link
                        key={`${activity.module}-${activity.id}`}
                        href={activity.href}
                        style={{
                          textDecoration: "none",
                          border: "1px solid rgba(217,164,65,0.16)",
                          borderRadius: 18,
                          padding: 18,
                          background: "rgba(255,255,255,0.035)",
                          display: "grid",
                          gridTemplateColumns: "130px minmax(0, 1fr) auto",
                          gap: 16,
                          alignItems: "center",
                        }}
                      >
                        <strong style={{ color: "var(--gold-bright)" }}>{activity.module}</strong>
                        <div>
                          <strong style={{ color: "var(--cream)" }}>{activity.title}</strong>
                          <p style={{ margin: "6px 0 0", color: "var(--muted)" }}>{activity.subtitle}</p>
                        </div>
                        <span style={{ color: getStatusColor(activity.status), fontWeight: 900 }}>
                          {getStatusLabel(activity.status)}
                        </span>
                      </Link>
                    ))
                  )}
                </div>
              </section>
            </div>

            <aside style={{ display: "grid", gap: 24 }}>
              <ChartPanel title="Statuts des demandes" description="Lecture rapide de l’état global du suivi.">
                {statusDistribution.length === 0 ? (
                  <p style={{ color: "var(--muted)" }}>Aucune donnée.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={statusDistribution}
                        dataKey="total"
                        nameKey="status"
                        innerRadius={58}
                        outerRadius={96}
                        paddingAngle={4}
                      >
                        {statusDistribution.map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </ChartPanel>

              <section className="card rb-gold-glow" style={{ padding: 26 }}>
                <h2 style={{ marginTop: 0, color: "var(--gold-bright)" }}>
                  Priorités pastorales
                </h2>

                {priorityActions.length === 0 ? (
                  <div
                    style={{
                      border: "1px solid rgba(52,211,153,0.24)",
                      borderRadius: 18,
                      padding: 18,
                      background: "rgba(52,211,153,0.08)",
                      color: "#bbf7d0",
                    }}
                  >
                    Aucun élément urgent. Le suivi est à jour.
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: 14 }}>
                    {priorityActions.map((action) => (
                      <Link
                        key={action.label}
                        href={action.href}
                        style={{
                          textDecoration: "none",
                          border: "1px solid rgba(217,164,65,0.18)",
                          borderRadius: 18,
                          padding: 16,
                          background: "rgba(255,255,255,0.035)",
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 14,
                        }}
                      >
                        <span style={{ color: "var(--cream)", fontWeight: 900 }}>{action.label}</span>
                        <strong style={{ color: "var(--gold-bright)" }}>{action.value}</strong>
                      </Link>
                    ))}
                  </div>
                )}
              </section>

              <section className="card" style={{ padding: 26 }}>
                <h2 style={{ marginTop: 0, color: "var(--gold-bright)" }}>
                  Indicateurs d’impact
                </h2>
                <ImpactLine label="Prières ouvertes" value={kpis.openPrayers} icon={<MessageCircleHeart size={18} />} />
                <ImpactLine label="Rendez-vous en attente" value={kpis.pendingAppointments} icon={<CalendarDays size={18} />} />
                <ImpactLine label="Invitations reçues" value={kpis.pendingInvitations} icon={<Sparkles size={18} />} />
                <ImpactLine label="Messages au Pasteur" value={kpis.pendingEncouragements} icon={<HeartHandshake size={18} />} />
                <ImpactLine label="Notifications acceptées" value={kpis.activeNotifications} icon={<CheckCircle2 size={18} />} />
              </section>
            </aside>
          </section>
        </>
      )}
    </AdminShell>
  );
}

const tooltipStyle = {
  background: "#10141f",
  border: "1px solid rgba(217,164,65,0.28)",
  borderRadius: 14,
  color: "#fff7e6",
};

function KpiCard({
  title,
  value,
  icon,
  tone,
  href,
}: {
  title: string;
  value: number;
  icon: ReactNode;
  tone: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="card"
      style={{
        padding: 22,
        textDecoration: "none",
        display: "block",
        transition: "0.18s ease",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <p style={{ margin: 0, color: "var(--muted)", fontWeight: 900 }}>{title}</p>
        <span style={{ color: tone }}>{icon}</span>
      </div>
      <h2 style={{ margin: "14px 0 0", color: tone, fontSize: 42 }}>{value}</h2>
      <p style={{ margin: "8px 0 0", color: "var(--muted)", fontSize: 12 }}>
        Cliquer pour ouvrir
      </p>
    </Link>
  );
}

function ChartPanel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="card" style={{ padding: 26 }}>
      <h2 style={{ margin: 0, color: "var(--gold-bright)" }}>{title}</h2>
      <p style={{ color: "var(--muted)", margin: "8px 0 22px", lineHeight: 1.6 }}>{description}</p>
      {children}
    </section>
  );
}

function ImpactLine({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 14,
        alignItems: "center",
        borderBottom: "1px solid rgba(217,164,65,0.12)",
        padding: "14px 0",
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: 10, color: "var(--muted)", fontWeight: 800 }}>
        <span style={{ color: "var(--gold-bright)" }}>{icon}</span>
        {label}
      </span>
      <strong style={{ color: "var(--cream)", fontSize: 20 }}>{value}</strong>
    </div>
  );
}
