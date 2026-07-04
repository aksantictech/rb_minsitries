"use client";

import { useEffect, useMemo, useState } from "react";
import AdminShell from "../../../components/AdminShell";
import { createClient } from "../../../lib/supabase/browser";

type Teaching = {
  id: string;
  title: string;
  category: string;
  youtube_url: string;
  youtube_video_id: string | null;
  description: string | null;
  is_featured: boolean;
  is_public: boolean;
  published_at: string | null;
  created_at: string;
};

const initialForm = {
  title: "",
  category: "Enseignement",
  youtube_url: "",
  youtube_video_id: "",
  description: "",
  is_featured: false,
  is_public: true,
  published_at: new Date().toISOString().slice(0, 10),
};

function extractYouTubeId(value: string) {
  if (!value.trim()) return "";

  try {
    const url = new URL(value);

    if (url.hostname.includes("youtu.be")) {
      return url.pathname.replace("/", "").split("?")[0];
    }

    if (url.pathname.includes("/shorts/")) {
      return url.pathname.split("/shorts/")[1]?.split("/")[0] || "";
    }

    if (url.pathname.includes("/embed/")) {
      return url.pathname.split("/embed/")[1]?.split("/")[0] || "";
    }

    return url.searchParams.get("v") || "";
  } catch {
    return value.length === 11 ? value : "";
  }
}

function formatDate(value: string | null) {
  if (!value) return "Non renseigné";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export default function AdminTeachingsPage() {
  const supabase = useMemo(() => createClient(), []);

  const [teachings, setTeachings] = useState<Teaching[]>([]);
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
    if (!isCheckingAuth) {
      loadTeachings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCheckingAuth]);

  async function loadTeachings() {
    setIsLoadingData(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("teachings")
      .select(
        "id, title, category, youtube_url, youtube_video_id, description, is_featured, is_public, published_at, created_at"
      )
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      setErrorMessage(error.message);
    } else {
      setTeachings((data || []) as Teaching[]);
    }

    setIsLoadingData(false);
  }

  function updateForm(field: keyof typeof form, value: string | boolean) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleYoutubeUrlChange(value: string) {
    const videoId = extractYouTubeId(value);

    setForm((current) => ({
      ...current,
      youtube_url: value,
      youtube_video_id: current.youtube_video_id || videoId,
    }));
  }

  function startEdit(teaching: Teaching) {
    setEditingId(teaching.id);
    setErrorMessage("");
    setSuccessMessage("");

    setForm({
      title: teaching.title,
      category: teaching.category,
      youtube_url: teaching.youtube_url,
      youtube_video_id: teaching.youtube_video_id || "",
      description: teaching.description || "",
      is_featured: teaching.is_featured,
      is_public: teaching.is_public,
      published_at: teaching.published_at || new Date().toISOString().slice(0, 10),
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(initialForm);
    setErrorMessage("");
    setSuccessMessage("");
  }

  async function handleSave() {
    setErrorMessage("");
    setSuccessMessage("");

    if (!form.title.trim()) {
      setErrorMessage("Le titre de l’enseignement est obligatoire.");
      return;
    }

    if (!form.youtube_url.trim()) {
      setErrorMessage("Le lien YouTube est obligatoire.");
      return;
    }

    const finalVideoId = form.youtube_video_id || extractYouTubeId(form.youtube_url);

    if (!finalVideoId) {
      setErrorMessage("Impossible d’identifier la vidéo YouTube. Vérifie le lien ou ajoute l’ID manuellement.");
      return;
    }

    setIsSaving(true);

    if (form.is_featured) {
      if (editingId) {
        await supabase.from("teachings").update({ is_featured: false }).neq("id", editingId);
      } else {
        await supabase.from("teachings").update({ is_featured: false }).neq("youtube_video_id", finalVideoId);
      }
    }

    const payload = {
      title: form.title,
      category: form.category || "Enseignement",
      youtube_url: form.youtube_url,
      youtube_video_id: finalVideoId,
      description: form.description || null,
      is_featured: form.is_featured,
      is_public: form.is_public,
      published_at: form.published_at || null,
    };

    const result = editingId
      ? await supabase.from("teachings").update(payload).eq("id", editingId)
      : await supabase.from("teachings").insert(payload);

    setIsSaving(false);

    if (result.error) {
      setErrorMessage(result.error.message);
      return;
    }

    setSuccessMessage(
      editingId
        ? "L’enseignement a été modifié avec succès."
        : "L’enseignement a été ajouté avec succès."
    );

    resetForm();
    await loadTeachings();
  }

  async function handleDelete(teaching: Teaching) {
    const confirmed = window.confirm(`Supprimer cette vidéo : ${teaching.title} ?`);
    if (!confirmed) return;

    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase.from("teachings").delete().eq("id", teaching.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSuccessMessage("L’enseignement a été supprimé.");
    await loadTeachings();
  }

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
      title="Publications vidéo"
      subtitle="Ajouter, modifier et publier les enseignements YouTube du ministère"
    >
      {errorMessage ? <Alert type="error" text={errorMessage} /> : null}
      {successMessage ? <Alert type="success" text={successMessage} /> : null}

      <section className="card rb-gold-glow" style={{ padding: 26, marginBottom: 28 }}>
        <h2 style={{ marginTop: 0, color: "var(--gold-bright)" }}>
          {editingId ? "Modifier une vidéo" : "Ajouter une vidéo"}
        </h2>

        <form style={{ display: "grid", gap: 18 }}>
          <div className="grid-2">
            <label className="label">
              Titre
              <input
                className="input"
                value={form.title}
                onChange={(event) => updateForm("title", event.target.value)}
                placeholder="Ex : Jésus agit encore"
              />
            </label>

            <label className="label">
              Catégorie
              <input
                className="input"
                value={form.category}
                onChange={(event) => updateForm("category", event.target.value)}
                placeholder="Foi, réveil, leadership..."
              />
            </label>
          </div>

          <label className="label">
            Lien YouTube
            <input
              className="input"
              value={form.youtube_url}
              onChange={(event) => handleYoutubeUrlChange(event.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </label>

          <div className="grid-2">
            <label className="label">
              ID vidéo YouTube
              <input
                className="input"
                value={form.youtube_video_id}
                onChange={(event) => updateForm("youtube_video_id", event.target.value)}
                placeholder="Ex : o7Va6XqSTqQ"
              />
            </label>

            <label className="label">
              Date de publication
              <input
                className="input"
                type="date"
                value={form.published_at}
                onChange={(event) => updateForm("published_at", event.target.value)}
              />
            </label>
          </div>

          <label className="label">
            Description
            <textarea
              className="textarea"
              value={form.description}
              onChange={(event) => updateForm("description", event.target.value)}
              placeholder="Brève description de l’enseignement..."
            />
          </label>

          <div style={{ display: "grid", gap: 12 }}>
            <Checkbox
              label="Vidéo à la une sur la page Enseignements"
              checked={form.is_featured}
              onChange={(value) => updateForm("is_featured", value)}
            />
            <Checkbox
              label="Publié sur la partie publique"
              checked={form.is_public}
              onChange={(value) => updateForm("is_public", value)}
            />
          </div>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving
                ? "Enregistrement..."
                : editingId
                  ? "Modifier la vidéo"
                  : "Ajouter la vidéo"}
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
        <h2 style={{ marginTop: 0, color: "var(--gold-bright)" }}>
          Vidéos enregistrées
        </h2>

        {isLoadingData ? (
          <p style={{ color: "var(--muted)" }}>Chargement...</p>
        ) : null}

        {!isLoadingData && teachings.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>Aucune vidéo enregistrée.</p>
        ) : null}

        <div style={{ display: "grid", gap: 16 }}>
          {teachings.map((teaching) => (
            <article
              key={teaching.id}
              style={{
                border: "1px solid rgba(217,164,65,0.18)",
                borderRadius: 22,
                background: "rgba(255,255,255,0.035)",
                padding: 18,
                display: "grid",
                gridTemplateColumns: "180px minmax(0, 1fr) auto",
                gap: 18,
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: 180,
                  aspectRatio: "16 / 9",
                  borderRadius: 16,
                  background: "rgba(255,247,230,0.08)",
                  border: "1px solid rgba(217,164,65,0.18)",
                  overflow: "hidden",
                }}
              >
                {teaching.youtube_video_id ? (
                  <img
                    src={`https://img.youtube.com/vi/${teaching.youtube_video_id}/hqdefault.jpg`}
                    alt={teaching.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : null}
              </div>

              <div>
                <h3 style={{ margin: 0, color: "var(--cream)", fontSize: 21 }}>
                  {teaching.title}
                </h3>

                <p style={{ margin: "8px 0 0", color: "var(--muted)" }}>
                  {teaching.category} · {formatDate(teaching.published_at)}
                </p>

                {teaching.description ? (
                  <p style={{ margin: "10px 0 0", color: "var(--muted)", lineHeight: 1.6 }}>
                    {teaching.description}
                  </p>
                ) : null}

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                  {teaching.is_featured ? <Badge text="À la une" /> : null}
                  {teaching.is_public ? <Badge text="Publié" /> : <Badge text="Masqué" muted />}
                </div>
              </div>

              <div style={{ display: "grid", gap: 10, minWidth: 150 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => startEdit(teaching)}
                >
                  Modifier
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(teaching)}
                  style={{
                    border: "1px solid rgba(239,68,68,0.35)",
                    background: "rgba(239,68,68,0.08)",
                    color: "#fecaca",
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

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label
      style={{
        display: "flex",
        gap: 10,
        alignItems: "center",
        color: "var(--muted)",
        fontWeight: 800,
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      {label}
    </label>
  );
}

function Badge({ text, muted = false }: { text: string; muted?: boolean }) {
  return (
    <span
      style={{
        border: "1px solid rgba(217,164,65,0.2)",
        background: muted ? "rgba(255,255,255,0.04)" : "rgba(217,164,65,0.09)",
        color: muted ? "var(--muted)" : "var(--gold-bright)",
        borderRadius: 999,
        padding: "6px 10px",
        fontSize: 12,
        fontWeight: 900,
      }}
    >
      {text}
    </span>
  );
}

function Alert({ type, text }: { type: "error" | "success"; text: string }) {
  const isError = type === "error";

  return (
    <div
      style={{
        border: `1px solid ${
          isError ? "rgba(239,68,68,0.35)" : "rgba(52,211,153,0.35)"
        }`,
        background: isError ? "rgba(239,68,68,0.1)" : "rgba(52,211,153,0.1)",
        color: isError ? "#fecaca" : "#bbf7d0",
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
