"use client";

import { useEffect, useMemo, useState } from "react";
import AdminShell from "../../../components/AdminShell";
import { createClient } from "../../../lib/supabase/browser";

type AgendaItem = {
  id: string;
  event_date: string;
  public_status: string;
  public_label: string | null;
  is_public: boolean;
  internal_notes: string | null;
  created_at: string;
};

const statusOptions = [
  "Disponible",
  "Occupé",
  "En attente de confirmation",
  "Rendez-vous pastoral",
  "Culte / Ministère",
  "Mission / Conférence",
  "Indisponible",
];

const emptyForm = {
  event_date: "",
  public_status: "Disponible",
  public_label: "Disponible pour rendez-vous ou invitation",
  is_public: true,
  internal_notes: "",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export default function AdminAgendaPage() {
  const supabase = useMemo(() => createClient(), []);

  const [items, setItems] = useState<AgendaItem[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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
      loadAgenda();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCheckingAuth]);

  async function loadAgenda() {
    setIsLoadingData(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("public_agenda")
      .select("id, event_date, public_status, public_label, is_public, internal_notes, created_at")
      .order("event_date", { ascending: true });

    if (error) {
      setErrorMessage(error.message);
    } else {
      setItems((data || []) as AgendaItem[]);
    }

    setIsLoadingData(false);
  }

  function updateForm(field: keyof typeof form, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setErrorMessage("");
    setSuccessMessage("");
  }

  function startEdit(item: AgendaItem) {
    setEditingId(item.id);
    setForm({
      event_date: item.event_date,
      public_status: item.public_status,
      public_label: item.public_label || "",
      is_public: item.is_public,
      internal_notes: item.internal_notes || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSave() {
    setErrorMessage("");
    setSuccessMessage("");

    if (!form.event_date) {
      setErrorMessage("La date est obligatoire.");
      return;
    }

    setIsSaving(true);

    const payload = {
      event_date: form.event_date,
      public_status: form.public_status,
      public_label: form.public_label || null,
      is_public: form.is_public,
      internal_notes: form.internal_notes || null,
    };

    const result = editingId
      ? await supabase.from("public_agenda").update(payload).eq("id", editingId)
      : await supabase.from("public_agenda").insert(payload);

    setIsSaving(false);

    if (result.error) {
      setErrorMessage(result.error.message);
      return;
    }

    setSuccessMessage(editingId ? "La disponibilité a été modifiée." : "La disponibilité a été ajoutée.");
    resetForm();
    await loadAgenda();
  }

  async function handleDelete(item: AgendaItem) {
    const confirmed = window.confirm(`Supprimer la disponibilité du ${formatDate(item.event_date)} ?`);
    if (!confirmed) return;

    const { error } = await supabase.from("public_agenda").delete().eq("id", item.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSuccessMessage("La disponibilité a été supprimée.");
    await loadAgenda();
  }

  if (isCheckingAuth) {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        Vérification de la session admin...
      </main>
    );
  }

  return (
    <AdminShell
      title="Agenda public"
      subtitle="Gérer les disponibilités publiques visibles par les fidèles et les organisateurs"
    >
      {errorMessage ? <Alert type="error" text={errorMessage} /> : null}
      {successMessage ? <Alert type="success" text={successMessage} /> : null}

      <section className="card rb-gold-glow" style={{ padding: 26, marginBottom: 28 }}>
        <h2 style={{ marginTop: 0, color: "var(--gold-bright)" }}>
          {editingId ? "Modifier une disponibilité" : "Ajouter une disponibilité"}
        </h2>

        <form style={{ display: "grid", gap: 18 }}>
          <div className="grid-2">
            <label className="label">
              Date
              <input
                className="input"
                type="date"
                value={form.event_date}
                onChange={(event) => updateForm("event_date", event.target.value)}
              />
            </label>

            <label className="label">
              Statut public
              <select
                className="select"
                value={form.public_status}
                onChange={(event) => updateForm("public_status", event.target.value)}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="label">
            Libellé public
            <input
              className="input"
              value={form.public_label}
              onChange={(event) => updateForm("public_label", event.target.value)}
              placeholder="Disponible pour rendez-vous ou invitation"
            />
          </label>

          <label className="label">
            Notes internes
            <textarea
              className="textarea"
              value={form.internal_notes}
              onChange={(event) => updateForm("internal_notes", event.target.value)}
              placeholder="Notes visibles uniquement dans l’espace admin..."
            />
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 10, color: "#4b5563", fontWeight: 900 }}>
            <input
              type="checkbox"
              checked={form.is_public}
              onChange={(event) => updateForm("is_public", event.target.checked)}
            />
            Visible sur l’agenda public
          </label>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <button type="button" className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Enregistrement..." : editingId ? "Modifier" : "Ajouter"}
            </button>

            {editingId ? (
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Annuler
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="card" style={{ padding: 26 }}>
        <h2 style={{ marginTop: 0, color: "var(--gold-bright)" }}>Disponibilités enregistrées</h2>

        {isLoadingData ? <p style={{ color: "#6b7280" }}>Chargement...</p> : null}
        {!isLoadingData && items.length === 0 ? <p style={{ color: "#6b7280" }}>Aucune date enregistrée.</p> : null}

        <div style={{ display: "grid", gap: 14 }}>
          {items.map((item) => (
            <article
              key={item.id}
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr) auto",
                gap: 18,
                alignItems: "center",
                border: "1px solid rgba(217,164,65,0.18)",
                borderRadius: 20,
                padding: 18,
                background: item.is_public ? "rgba(255,255,255,0.72)" : "rgba(249,250,251,0.68)",
              }}
            >
              <div>
                <h3 style={{ margin: 0, color: "#111827", textTransform: "capitalize" }}>{formatDate(item.event_date)}</h3>
                <p style={{ margin: "8px 0 0", color: "#c88a20", fontWeight: 900 }}>{item.public_status}</p>
                {item.public_label ? <p style={{ margin: "6px 0 0", color: "#6b7280" }}>{item.public_label}</p> : null}
                {item.internal_notes ? (
                  <p style={{ margin: "8px 0 0", color: "#9ca3af", fontSize: 13 }}>
                    Note interne : {item.internal_notes}
                  </p>
                ) : null}
              </div>

              <div style={{ display: "grid", gap: 10, minWidth: 150 }}>
                <button type="button" className="btn btn-secondary" onClick={() => startEdit(item)}>
                  Modifier
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item)}
                  style={{
                    border: "1px solid rgba(239,68,68,0.35)",
                    background: "rgba(254,242,242,0.92)",
                    color: "#991b1b",
                    borderRadius: 999,
                    padding: "12px 16px",
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  Supprimer
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}

function Alert({ type, text }: { type: "error" | "success"; text: string }) {
  const isError = type === "error";

  return (
    <div
      style={{
        border: `1px solid ${isError ? "rgba(239,68,68,0.35)" : "rgba(52,211,153,0.35)"}`,
        background: isError ? "rgba(239,68,68,0.1)" : "rgba(52,211,153,0.1)",
        color: isError ? "#991b1b" : "#047857",
        borderRadius: 16,
        padding: 14,
        marginBottom: 20,
        lineHeight: 1.6,
        fontWeight: 800,
      }}
    >
      {text}
    </div>
  );
}
