"use client";

import { useEffect, useMemo, useState } from "react";
import AdminShell from "./AdminShell";
import { createClient } from "../lib/supabase/browser";

type Row = Record<string, unknown> & { id: string };

type FieldConfig = {
  key: string;
  label: string;
  type?: "text" | "long" | "date" | "boolean" | "badge";
};

type StatusOption = {
  value: string;
  label: string;
};

type AdminListPageProps = {
  title: string;
  subtitle: string;
  table: string;
  selectColumns: string;
  primaryField: string;
  contentField: string;
  statusField?: string;
  noteField?: string;
  dateField?: string;
  searchPlaceholder?: string;
  fields: FieldConfig[];
  statusOptions: StatusOption[];
};

function valueToString(value: unknown) {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "Oui" : "Non";
  return String(value);
}

function formatDate(value: unknown) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(String(value)));
}

function getStatusLabel(status: string, options: StatusOption[]) {
  return options.find((option) => option.value === status)?.label || status;
}

function getStatusColor(status: string) {
  if (["done", "treated", "published", "approved", "accepted"].includes(status)) {
    return "#34d399";
  }

  if (["pending", "new", "checking", "in_progress"].includes(status)) {
    return "var(--gold-bright)";
  }

  if (["rejected", "cancelled", "urgent", "critical"].includes(status)) {
    return "#ef4444";
  }

  if (["archived", "closed"].includes(status)) {
    return "#94a3b8";
  }

  return "#60a5fa";
}

export default function AdminListPage({
  title,
  subtitle,
  table,
  selectColumns,
  primaryField,
  contentField,
  statusField = "status",
  noteField = "admin_notes",
  dateField = "created_at",
  searchPlaceholder = "Rechercher...",
  fields,
  statusOptions,
}: AdminListPageProps) {
  const supabase = useMemo(() => createClient(), []);

  const [rows, setRows] = useState<Row[]>([]);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingId, setIsSavingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [focusId, setFocusId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = "/admin/login";
        return;
      }

      const params = new URLSearchParams(window.location.search);
      setFocusId(params.get("focus"));
      setIsCheckingAuth(false);
    }

    checkAuth();
  }, [supabase]);

  useEffect(() => {
    if (!isCheckingAuth) {
      loadRows();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCheckingAuth]);

  async function loadRows() {
    setIsLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from(table)
      .select(selectColumns)
      .order(dateField, { ascending: false });

    if (error) {
      setErrorMessage(error.message);
      setRows([]);
    } else {
      const list = (data || []) as unknown as Row[];
      setRows(list);

      const nextNotes: Record<string, string> = {};
      list.forEach((row) => {
        nextNotes[row.id] = valueToString(row[noteField]);
      });
      setNotes(nextNotes);
    }

    setIsLoading(false);
  }

  const filteredRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return rows.filter((row) => {
      const status = valueToString(row[statusField]);

      if (statusFilter !== "all" && status !== statusFilter) {
        return false;
      }

      if (!normalizedSearch) return true;

      return Object.values(row).some((value) =>
        valueToString(value).toLowerCase().includes(normalizedSearch)
      );
    });
  }, [rows, search, statusFilter, statusField]);

  const openCount = rows.filter((row) => {
    const status = valueToString(row[statusField]);
    return ["new", "pending", "checking", "in_progress"].includes(status);
  }).length;

  const treatedCount = rows.filter((row) => {
    const status = valueToString(row[statusField]);
    return ["done", "treated", "published", "approved", "accepted", "archived"].includes(status);
  }).length;

  async function updateStatus(row: Row, nextStatus: string) {
    setErrorMessage("");
    setSuccessMessage("");
    setIsSavingId(row.id);

    const payload: Record<string, unknown> = {
      [statusField]: nextStatus,
    };

    if (table === "testimonies" && nextStatus === "published") {
      payload.can_publish = true;
      payload.published_at = new Date().toISOString();
    }

    const { error } = await supabase.from(table).update(payload).eq("id", row.id);

    setIsSavingId(null);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSuccessMessage("Statut mis à jour avec succès.");
    await loadRows();
  }

  async function saveNote(row: Row) {
    setErrorMessage("");
    setSuccessMessage("");
    setIsSavingId(row.id);

    const { error } = await supabase
      .from(table)
      .update({ [noteField]: notes[row.id] || null })
      .eq("id", row.id);

    setIsSavingId(null);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSuccessMessage("Note interne enregistrée.");
    await loadRows();
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
    <AdminShell title={title} subtitle={subtitle}>
      {errorMessage ? <Alert type="error" text={errorMessage} /> : null}
      {successMessage ? <Alert type="success" text={successMessage} /> : null}

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 18,
          marginBottom: 24,
        }}
      >
        <StatCard title="Total reçu" value={rows.length} />
        <StatCard title="À traiter" value={openCount} />
        <StatCard title="Traité / publié" value={treatedCount} />
      </section>

      <section className="card" style={{ padding: 22, marginBottom: 24 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) 240px",
            gap: 14,
          }}
        >
          <input
            className="input"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <select
            className="select"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">Tous les statuts</option>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {isLoading ? (
        <section className="card" style={{ padding: 24 }}>
          Chargement...
        </section>
      ) : null}

      {!isLoading && filteredRows.length === 0 ? (
        <section className="card" style={{ padding: 24, color: "var(--muted)" }}>
          Aucun élément trouvé.
        </section>
      ) : null}

      <section style={{ display: "grid", gap: 18 }}>
        {filteredRows.map((row) => {
          const status = valueToString(row[statusField]);
          const isFocused = focusId === row.id;

          return (
            <article
              key={row.id}
              className="card rb-gold-glow"
              style={{
                padding: 24,
                borderColor: isFocused
                  ? "var(--gold-bright)"
                  : "rgba(217,164,65,0.22)",
                boxShadow: isFocused
                  ? "0 0 0 2px rgba(217,164,65,0.35), 0 24px 70px rgba(0,0,0,0.32)"
                  : undefined,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 18,
                  alignItems: "flex-start",
                  marginBottom: 18,
                }}
              >
                <div>
                  <p
                    style={{
                      margin: "0 0 8px",
                      color: "var(--gold-bright)",
                      fontSize: 13,
                      fontWeight: 900,
                    }}
                  >
                    {formatDate(row[dateField])}
                  </p>

                  <h2 style={{ margin: 0, color: "var(--cream)", fontSize: 26 }}>
                    {valueToString(row[primaryField]) || "Sans nom"}
                  </h2>
                </div>

                <span
                  style={{
                    color: getStatusColor(status),
                    border: `1px solid ${getStatusColor(status)}55`,
                    borderRadius: 999,
                    padding: "9px 13px",
                    fontWeight: 900,
                    whiteSpace: "nowrap",
                  }}
                >
                  {getStatusLabel(status, statusOptions)}
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                  gap: 14,
                  marginBottom: 18,
                }}
              >
                {fields.map((field) => (
                  <InfoField key={field.key} row={row} field={field} />
                ))}
              </div>

              <div
                style={{
                  border: "1px solid rgba(217,164,65,0.16)",
                  borderRadius: 18,
                  padding: 18,
                  background: "rgba(255,255,255,0.035)",
                  marginBottom: 18,
                }}
              >
                <strong style={{ color: "var(--gold-bright)" }}>Message</strong>
                <p
                  style={{
                    color: "var(--cream)",
                    lineHeight: 1.8,
                    whiteSpace: "pre-line",
                    marginBottom: 0,
                  }}
                >
                  {valueToString(row[contentField]) || "-"}
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr) 220px",
                  gap: 14,
                  alignItems: "end",
                }}
              >
                <label className="label">
                  Note interne
                  <textarea
                    className="textarea"
                    value={notes[row.id] || ""}
                    onChange={(event) =>
                      setNotes((current) => ({
                        ...current,
                        [row.id]: event.target.value,
                      }))
                    }
                    placeholder="Ajouter une note pour l’équipe pastorale..."
                  />
                </label>

                <div style={{ display: "grid", gap: 10 }}>
                  <select
                    className="select"
                    value={status}
                    onChange={(event) => updateStatus(row, event.target.value)}
                    disabled={isSavingId === row.id}
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => saveNote(row)}
                    disabled={isSavingId === row.id}
                    style={{ cursor: isSavingId === row.id ? "not-allowed" : "pointer" }}
                  >
                    {isSavingId === row.id ? "Enregistrement..." : "Sauver note"}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </AdminShell>
  );
}

function InfoField({ row, field }: { row: Row; field: FieldConfig }) {
  const value = row[field.key];

  let displayValue = valueToString(value);

  if (field.type === "date") {
    displayValue = value ? formatDate(value) : "-";
  }

  if (field.type === "boolean") {
    displayValue = value ? "Oui" : "Non";
  }

  return (
    <div
      style={{
        border: "1px solid rgba(217,164,65,0.12)",
        borderRadius: 14,
        padding: 14,
        background: "rgba(2,6,23,0.32)",
      }}
    >
      <p style={{ margin: "0 0 6px", color: "var(--muted)", fontSize: 13 }}>
        {field.label}
      </p>
      <strong
        style={{
          color: field.type === "badge" ? "var(--gold-bright)" : "var(--cream)",
          whiteSpace: field.type === "long" ? "pre-line" : "normal",
        }}
      >
        {displayValue || "-"}
      </strong>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="card" style={{ padding: 22 }}>
      <p style={{ margin: 0, color: "var(--muted)", fontWeight: 800 }}>{title}</p>
      <h2 style={{ margin: "12px 0 0", color: "var(--gold-bright)", fontSize: 38 }}>
        {value}
      </h2>
    </div>
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
