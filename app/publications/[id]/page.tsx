import Link from "next/link";
import PublicHeader from "../../../components/PublicHeader";
import { createClient } from "@supabase/supabase-js";

type PageProps = {
  params: Promise<{ id: string }>;
};

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error("Missing Supabase admin environment variables.");
  }

  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
}

function formatDate(value?: string | null) {
  if (!value) return "";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function PublicationDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = getAdminClient();

  const { data: publication, error } = await supabase
    .from("ministry_publications")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !publication) {
    return (
      <main className="page">
        <PublicHeader />
        <section className="section">
          <div className="container card" style={{ padding: 30 }}>
            <h1 style={{ color: "var(--gold-bright)" }}>Publication introuvable</h1>
            <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
              Cette publication n’existe pas ou n’est plus disponible.
            </p>
            <Link href="/" className="btn btn-primary">
              Retour à l’accueil
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const title = publication.title || "Publication du ministère";
  const content = publication.content || publication.message || publication.description || "";
  const imageUrl = publication.image_url || publication.cover_url || null;
  const videoUrl = publication.video_url || null;

  return (
    <main className="page">
      <PublicHeader />
      <section className="section publication-detail-mobile">
        <div className="container">
          <article className="card rb-gold-glow" style={{ padding: 30 }}>
            <p
              style={{
                color: "var(--gold-bright)",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                fontWeight: 900,
                fontSize: 12,
                marginTop: 0,
              }}
            >
              Publication du ministère
            </p>

            <h1 style={{ fontSize: "clamp(34px, 6vw, 56px)", margin: "8px 0 14px" }}>
              {title}
            </h1>

            {publication.published_at || publication.scheduled_at ? (
              <p style={{ color: "var(--muted)", marginTop: 0 }}>
                {formatDate(publication.published_at || publication.scheduled_at)}
              </p>
            ) : null}

            {imageUrl ? (
              <img
                src={imageUrl}
                alt={title}
                style={{
                  width: "100%",
                  maxHeight: 520,
                  objectFit: "cover",
                  borderRadius: 24,
                  border: "1px solid rgba(217,164,65,0.22)",
                  margin: "20px 0",
                }}
              />
            ) : null}

            {videoUrl ? (
              <div style={{ margin: "20px 0" }}>
                <Link href={videoUrl} target="_blank" className="btn btn-secondary">
                  Ouvrir la vidéo
                </Link>
              </div>
            ) : null}

            <p
              style={{
                color: "var(--muted)",
                fontSize: 18,
                lineHeight: 1.85,
                whiteSpace: "pre-line",
              }}
            >
              {content}
            </p>

            <Link href="/" className="btn btn-primary" style={{ marginTop: 18 }}>
              Retour à l’accueil
            </Link>
          </article>
        </div>
      </section>
    </main>
  );
}
