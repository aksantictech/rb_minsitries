"use client";

import { useEffect, useMemo, useState } from "react";
import AdminShell from "../../../components/AdminShell";
import { createClient } from "../../../lib/supabase/browser";

type Publication = {
  id: string;
  publication_type: string;
  title: string;
  content: string;
  media_url: string | null;
  action_label: string | null;
  action_url: string | null;
  status: string;
  is_public: boolean;
  is_featured: boolean;
  notify_on_publish: boolean;
  scheduled_at: string | null;
  published_at: string | null;
  created_by_name: string | null;
  created_at: string;
};

const initialForm = {
  publication_type: "encouragement",
  title: "",
  content: "",
  media_url: "",
  action_label: "",
  action_url: "",
  status: "draft",
  scheduled_at: "",
  is_public: true,
  is_featured: false,
  notify_on_publish: true,
  created_by_name: "Pasteur Roy Bondo",
};

function toDatetimeLocal(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60000);
  return localDate.toISOString().slice(0, 16);
}

function fromDatetimeLocal(value: string) {
  if (!value) return null;
  return new Date(value).toISOString();
}

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function AdminPublicationsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [form, setForm] = useState(initialForm);
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
    if (!isCheckingAuth) loadPublications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCheckingAuth]);

  async function loadPublications() {
    setIsLoadingData(true);
    const { data, error } = await supabase
      .from("ministry_publications")
      .select("id, publication_type, title, content, media_url, action_label, action_url, status, is_public, is_featured, notify_on_publish, scheduled_at, published_at, created_by_name, created_at")
      .order("created_at", { ascending: false });

    if (error) setErrorMessage(error.message);
    else setPublications((data || []) as Publication[]);

    setIsLoadingData(false);
  }

  function updateForm(field: keyof typeof form, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetForm() {
    setEditingId(null);
    setForm(initialForm);
    setErrorMessage("");
    setSuccessMessage("");
  }

  function startEdit(publication: Publication) {
    setEditingId(publication.id);
    setForm({
      publication_type: publication.publication_type,
      title: publication.title,
      content: publication.content,
      media_url: publication.media_url || "",
      action_label: publication.action_label || "",
      action_url: publication.action_url || "",
      status: publication.status,
      scheduled_at: toDatetimeLocal(publication.scheduled_at || publication.published_at),
      is_public: publication.is_public,
      is_featured: publication.is_featured,
      notify_on_publish: publication.notify_on_publish,
      created_by_name: publication.created_by_name || "Pasteur Roy Bondo",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function sendNotification(publicationId: string) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) return;

    await fetch("/api/notifications/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ publicationId }),
    });
  }

  async function handleSave() {
    setErrorMessage("");
    setSuccessMessage("");

    if (!form.title.trim()) {
      setErrorMessage("Le titre est obligatoire.");
      return;
    }

    if (!form.content.trim()) {
      setErrorMessage("Le message est obligatoire.");
      return;
    }

    setIsSaving(true);

    const now = new Date().toISOString();
    const scheduledAt = fromDatetimeLocal(form.scheduled_at);
    const finalStatus = form.status;

    const payload = {
      publication_type: form.publication_type,
      title: form.title,
      content: form.content,
      media_url: form.media_url || null,
      action_label: form.action_label || null,
      action_url: form.action_url || null,
      status: finalStatus,
      is_public: form.is_public,
      is_featured: form.is_featured,
      notify_on_publish: form.notify_on_publish,
      scheduled_at: scheduledAt,
      published_at: finalStatus === "published" ? now : null,
      created_by_name: form.created_by_name || "Pasteur Roy Bondo",
      updated_at: now,
    };

    const result = editingId
      ? await supabase.from("ministry_publications").update(payload).eq("id", editingId).select("id").single()
      : await supabase.from("ministry_publications").insert(payload).select("id").single();

    setIsSaving(false);

    if (result.error) {
      setErrorMessage(result.error.message);
      return;
    }

    if (payload.status === "published" && payload.notify_on_publish && result.data?.id) {
      await sendNotification(result.data.id);
    }

    setSuccessMessage(
      editingId ? "Publication modifiée avec succès." : "Publication ajoutée avec succès."
    );
    resetForm();
    await loadPublications();
  }

  async function handleDelete(publication: Publication) {
    const confirmed = window.confirm(`Supprimer la publication : ${publication.title} ?`);
    if (!confirmed) return;

    const { error } = await supabase
      .from("ministry_publications")
      .delete()
      .eq("id", publication.id);

    if (error) setErrorMessage(error.message);
    else {
      setSuccessMessage("Publication supprimée.");
      await loadPublications();
    }
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
      title="Publications du ministère"
      subtitle="Programmer les messages d’encouragement, sorties de livre, vidéos, images et textes d’édification"
    >
      {errorMessage ? <Alert type="error" text={errorMessage} /> : null}
      {successMessage ? <Alert type="success" text={successMessage} /> : null}

      <section className="card rb-gold-glow" style={{ padding: 26, marginBottom: 28 }}>
        <h2 style={{ marginTop: 0, color: "var(--gold-bright)" }}>
          {editingId ? "Modifier une publication" : "Créer une publication"}
        </h2>

        <form style={{ display: "grid", gap: 18 }}>
          <div className="grid-2">
            <label className="label">
              Type de publication
              <select
                className="select"
                value={form.publication_type}
                onChange={(event) => updateForm("publication_type", event.target.value)}
              >
                <option value="encouragement">Message d’encouragement</option>
                <option value="edification">Message d’édification</option>
                <option value="book">Sortie de livre</option>
                <option value="video">Vidéo</option>
                <option value="image">Image</option>
                <option value="announcement">Annonce</option>
              </select>
            </label>

            <label className="label">
              Statut
              <select
                className="select"
                value={form.status}
                onChange={(event) => updateForm("status", event.target.value)}
              >
                <option value="draft">Brouillon</option>
                <option value="scheduled">Planifié</option>
                <option value="published">Publié maintenant</option>
                <option value="archived">Archivé</option>
              </select>
            </label>
          </div>

          <label className="label">
            Titre
            <input
              className="input"
              value={form.title}
              onChange={(event) => updateForm("title", event.target.value)}
              placeholder="Ex : Une parole d’encouragement pour cette semaine"
            />
          </label>

          <label className="label">
            Message
            <textarea
              className="textarea"
              value={form.content}
              onChange={(event) => updateForm("content", event.target.value)}
              placeholder="Écrire le message à publier..."
            />
          </label>

          <div className="grid-2">
            <label className="label">
              Média / image / vidéo URL
              <input
                className="input"
                value={form.media_url}
                onChange={(event) => updateForm("media_url", event.target.value)}
                placeholder="/images/image.png ou https://youtube.com/..."
              />
            </label>

            <label className="label">
              Date de publication planifiée
              <input
                className="input"
                type="datetime-local"
                value={form.scheduled_at}
                onChange={(event) => updateForm("scheduled_at", event.target.value)}
              />
            </label>
          </div>

          <div className="grid-2">
            <label className="label">
              Bouton d’action
              <input
                className="input"
                value={form.action_label}
                onChange={(event) => updateForm("action_label", event.target.value)}
                placeholder="Lire la suite / Acheter / Regarder"
              />
            </label>

            <label className="label">
              Lien d’action
              <input
                className="input"
                value={form.action_url}
                onChange={(event) => updateForm("action_url", event.target.value)}
                placeholder="/teachings ou https://..."
              />
            </label>
          </div>

          <label className="label">
            Auteur affiché
            <input
              className="input"
              value={form.created_by_name}
              onChange={(event) => updateForm("created_by_name", event.target.value)}
            />
          </label>

          <div style={{ display: "grid", gap: 12 }}>
            <Checkbox label="Visible sur la page publique" checked={form.is_public} onChange={(value) => updateForm("is_public", value)} />
            <Checkbox label="Mettre en avant" checked={form.is_featured} onChange={(value) => updateForm("is_featured", value)} />
            <Checkbox label="Notifier les téléphones lors de la publication" checked={form.notify_on_publish} onChange={(value) => updateForm("notify_on_publish", value)} />
          </div>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <button type="button" className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Enregistrement..." : editingId ? "Modifier" : "Enregistrer"}
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
        <h2 style={{ marginTop: 0, color: "var(--gold-bright)" }}>Publications enregistrées</h2>

        {isLoadingData ? <p>Chargement...</p> : null}

        <div style={{ display: "grid", gap: 14 }}>
          {publications.map((publication) => (
            <article
              key={publication.id}
              style={{
                border: "1px solid rgba(217,164,65,0.18)",
                borderRadius: 20,
                padding: 18,
                background: "rgba(255,255,255,0.55)",
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr) auto",
                gap: 16,
              }}
            >
              <div>
                <h3 style={{ margin: 0 }}>{publication.title}</h3>
                <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>
                  {publication.content.length > 180
                    ? `${publication.content.slice(0, 180)}...`
                    : publication.content}
                </p>
                <p style={{ marginBottom: 0, fontWeight: 800 }}>
                  {publication.status} · {publication.publication_type} · {formatDate(publication.published_at || publication.scheduled_at || publication.created_at)}
                </p>
              </div>

              <div style={{ display: "grid", gap: 10, alignContent: "start" }}>
                <button type="button" className="btn btn-secondary" onClick={() => startEdit(publication)}>
                  Modifier
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(publication)}
                  style={{
                    border: "1px solid rgba(239,68,68,0.35)",
                    background: "rgba(239,68,68,0.08)",
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

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label style={{ display: "flex", gap: 10, alignItems: "center", color: "var(--muted)", fontWeight: 800 }}>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      {label}
    </label>
  );
}

function Alert({ type, text }: { type: "error" | "success"; text: string }) {
  const isError = type === "error";
  return (
    <div
      style={{
        border: `1px solid ${isError ? "rgba(239,68,68,0.35)" : "rgba(52,211,153,0.35)"}`,
        background: isError ? "rgba(239,68,68,0.1)" : "rgba(52,211,153,0.1)",
        color: isError ? "#991b1b" : "#166534",
        borderRadius: 16,
        padding: 14,
        marginBottom: 20,
        lineHeight: 1.6,
      }}
    >
      {text}
    </div>
  );
}
