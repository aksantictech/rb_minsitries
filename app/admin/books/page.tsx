"use client";

import { useEffect, useMemo, useState } from "react";
import AdminShell from "../../../components/AdminShell";
import { createClient } from "../../../lib/supabase/browser";

type Book = {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  author: string;
  category: string;
  short_description: string;
  long_description: string | null;
  cover_url: string | null;
  price_label: string;
  purchase_url: string | null;
  published_year: number | null;
  is_latest: boolean;
  is_featured: boolean;
  is_public: boolean;
  display_order: number;
  created_at: string;
};

const initialForm = {
  title: "",
  slug: "",
  subtitle: "",
  author: "Pasteur Roy Bondo",
  category: "Foi, miracles & Saint-Esprit",
  short_description: "",
  long_description: "",
  cover_url: "/images/livre_jesus_agit_encore.PNG",
  price_label: "21,10 € · ~24 USD · ~68 000 FC",
  purchase_url: "",
  published_year: "2026",
  is_latest: false,
  is_featured: false,
  is_public: true,
  display_order: "1",
};

function createSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminBooksPage() {
  const supabase = useMemo(() => createClient(), []);

  const [books, setBooks] = useState<Book[]>([]);
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
      loadBooks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCheckingAuth]);

  async function loadBooks() {
    setIsLoadingData(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("books")
      .select(
        "id, title, slug, subtitle, author, category, short_description, long_description, cover_url, price_label, purchase_url, published_year, is_latest, is_featured, is_public, display_order, created_at"
      )
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      setErrorMessage(error.message);
    } else {
      setBooks((data || []) as Book[]);
    }

    setIsLoadingData(false);
  }

  function updateForm(field: keyof typeof form, value: string | boolean) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleTitleChange(value: string) {
    setForm((current) => ({
      ...current,
      title: value,
      slug: editingId ? current.slug : createSlug(value),
    }));
  }

  function resetForm() {
    setEditingId(null);
    setForm(initialForm);
    setErrorMessage("");
    setSuccessMessage("");
  }

  function startEdit(book: Book) {
    setEditingId(book.id);

    setForm({
      title: book.title,
      slug: book.slug,
      subtitle: book.subtitle || "",
      author: book.author,
      category: book.category,
      short_description: book.short_description,
      long_description: book.long_description || "",
      cover_url: book.cover_url || "/images/livre_jesus_agit_encore.PNG",
      price_label: book.price_label,
      purchase_url: book.purchase_url || "",
      published_year: book.published_year ? String(book.published_year) : "",
      is_latest: book.is_latest,
      is_featured: book.is_featured,
      is_public: book.is_public,
      display_order: String(book.display_order || 0),
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSave() {
    setErrorMessage("");
    setSuccessMessage("");

    if (!form.title.trim()) {
      setErrorMessage("Le titre du livre est obligatoire.");
      return;
    }

    if (!form.slug.trim()) {
      setErrorMessage("Le slug est obligatoire.");
      return;
    }

    if (!form.short_description.trim()) {
      setErrorMessage("La brève description est obligatoire.");
      return;
    }

    setIsSaving(true);

    if (form.is_latest) {
      if (editingId) {
        await supabase
          .from("books")
          .update({ is_latest: false })
          .neq("id", editingId);
      } else {
        await supabase
          .from("books")
          .update({ is_latest: false })
          .neq("slug", form.slug);
      }
    }

    const payload = {
      title: form.title,
      slug: form.slug,
      subtitle: form.subtitle || null,
      author: form.author || "Pasteur Roy Bondo",
      category: form.category || "Livre spirituel",
      short_description: form.short_description,
      long_description: form.long_description || null,
      cover_url: form.cover_url || null,
      price_label: form.price_label || "Prix à confirmer",
      purchase_url: form.purchase_url || null,
      published_year: form.published_year ? Number(form.published_year) : null,
      is_latest: form.is_latest,
      is_featured: form.is_featured,
      is_public: form.is_public,
      display_order: Number(form.display_order || 0),
    };

    const result = editingId
      ? await supabase.from("books").update(payload).eq("id", editingId)
      : await supabase.from("books").insert(payload);

    setIsSaving(false);

    if (result.error) {
      setErrorMessage(result.error.message);
      return;
    }

    setSuccessMessage(
      editingId
        ? "Le livre a été modifié avec succès."
        : "Le livre a été ajouté avec succès."
    );

    resetForm();
    await loadBooks();
  }

  async function handleDelete(book: Book) {
    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer le livre : ${book.title} ?`
    );

    if (!confirmed) return;

    const { error } = await supabase.from("books").delete().eq("id", book.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSuccessMessage("Le livre a été supprimé.");
    await loadBooks();
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
      title="Gestion des livres"
      subtitle="Ajouter, modifier et publier les livres du Pasteur Roy Bondo"
    >
      {errorMessage ? <Alert type="error" text={errorMessage} /> : null}
      {successMessage ? <Alert type="success" text={successMessage} /> : null}

      <section className="card rb-gold-glow" style={{ padding: 26, marginBottom: 28 }}>
        <h2 style={{ marginTop: 0, color: "var(--gold-bright)" }}>
          {editingId ? "Modifier un livre" : "Ajouter un livre"}
        </h2>

        <form style={{ display: "grid", gap: 18 }}>
          <div className="grid-2">
            <label className="label">
              Titre
              <input
                className="input"
                value={form.title}
                onChange={(event) => handleTitleChange(event.target.value)}
                placeholder="Jésus agit encore"
              />
            </label>

            <label className="label">
              Slug
              <input
                className="input"
                value={form.slug}
                onChange={(event) => updateForm("slug", event.target.value)}
                placeholder="jesus-agit-encore"
              />
            </label>
          </div>

          <label className="label">
            Sous-titre
            <input
              className="input"
              value={form.subtitle}
              onChange={(event) => updateForm("subtitle", event.target.value)}
              placeholder="La puissance du Saint-Esprit en action aujourd’hui"
            />
          </label>

          <div className="grid-2">
            <label className="label">
              Auteur
              <input
                className="input"
                value={form.author}
                onChange={(event) => updateForm("author", event.target.value)}
              />
            </label>

            <label className="label">
              Catégorie
              <input
                className="input"
                value={form.category}
                onChange={(event) => updateForm("category", event.target.value)}
              />
            </label>
          </div>

          <div className="grid-2">
            <label className="label">
              Prix affiché
              <input
                className="input"
                value={form.price_label}
                onChange={(event) => updateForm("price_label", event.target.value)}
              />
            </label>

            <label className="label">
              Année
              <input
                className="input"
                type="number"
                value={form.published_year}
                onChange={(event) =>
                  updateForm("published_year", event.target.value)
                }
              />
            </label>
          </div>

          <label className="label">
            Lien d’achat
            <input
              className="input"
              value={form.purchase_url}
              onChange={(event) => updateForm("purchase_url", event.target.value)}
              placeholder="https://amazon..."
            />
          </label>

          <label className="label">
            Image de couverture
            <input
              className="input"
              value={form.cover_url}
              onChange={(event) => updateForm("cover_url", event.target.value)}
              placeholder="/images/livre_jesus_agit_encore.PNG"
            />
          </label>

          <label className="label">
            Brève description
            <textarea
              className="textarea"
              value={form.short_description}
              onChange={(event) =>
                updateForm("short_description", event.target.value)
              }
            />
          </label>

          <label className="label">
            Description longue
            <textarea
              className="textarea"
              value={form.long_description}
              onChange={(event) =>
                updateForm("long_description", event.target.value)
              }
            />
          </label>

          <div className="grid-2">
            <label className="label">
              Ordre d’affichage
              <input
                className="input"
                type="number"
                value={form.display_order}
                onChange={(event) =>
                  updateForm("display_order", event.target.value)
                }
              />
            </label>

            <div style={{ display: "grid", gap: 12, alignContent: "end" }}>
              <Checkbox
                label="Dernier livre sur l’accueil"
                checked={form.is_latest}
                onChange={(value) => updateForm("is_latest", value)}
              />
              <Checkbox
                label="Mis en avant"
                checked={form.is_featured}
                onChange={(value) => updateForm("is_featured", value)}
              />
              <Checkbox
                label="Publié"
                checked={form.is_public}
                onChange={(value) => updateForm("is_public", value)}
              />
            </div>
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
                  ? "Modifier le livre"
                  : "Ajouter le livre"}
            </button>

            {editingId ? (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={resetForm}
              >
                Annuler
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="card" style={{ padding: 26 }}>
        <h2 style={{ marginTop: 0, color: "var(--gold-bright)" }}>
          Livres enregistrés
        </h2>

        {isLoadingData ? (
          <p style={{ color: "var(--muted)" }}>Chargement...</p>
        ) : null}

        {!isLoadingData && books.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>Aucun livre enregistré.</p>
        ) : null}

        <div style={{ display: "grid", gap: 16 }}>
          {books.map((book) => (
            <article
              key={book.id}
              style={{
                border: "1px solid rgba(217,164,65,0.18)",
                borderRadius: 22,
                background: "rgba(255,255,255,0.035)",
                padding: 18,
                display: "grid",
                gridTemplateColumns: "100px minmax(0, 1fr) auto",
                gap: 18,
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: 100,
                  height: 120,
                  borderRadius: 16,
                  background: "rgba(255,247,230,0.08)",
                  border: "1px solid rgba(217,164,65,0.18)",
                  display: "grid",
                  placeItems: "center",
                  overflow: "hidden",
                }}
              >
                <img
                  src={book.cover_url || "/images/logo_rb.PNG"}
                  alt={book.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    padding: 8,
                  }}
                />
              </div>

              <div>
                <h3 style={{ margin: 0, color: "var(--cream)", fontSize: 21 }}>
                  {book.title}
                </h3>

                {book.subtitle ? (
                  <p style={{ margin: "6px 0 0", color: "var(--muted)" }}>
                    {book.subtitle}
                  </p>
                ) : null}

                <p
                  style={{
                    margin: "10px 0 0",
                    color: "var(--gold-bright)",
                    fontWeight: 900,
                  }}
                >
                  {book.price_label}
                </p>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                  {book.is_latest ? <Badge text="Dernier livre" /> : null}
                  {book.is_featured ? <Badge text="Mis en avant" /> : null}
                  {book.is_public ? <Badge text="Publié" /> : <Badge text="Masqué" muted />}
                </div>
              </div>

              <div style={{ display: "grid", gap: 10, minWidth: 150 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => startEdit(book)}
                >
                  Modifier
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(book)}
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
