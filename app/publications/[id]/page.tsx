"use client";

import Link from "next/link";
import { ArrowLeft, BookOpen, HeartHandshake, ImageIcon, PlayCircle, Quote } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import PublicHeader from "../../../components/PublicHeader";
import { createClient } from "../../../lib/supabase/browser";
import { useLanguage } from "../../../components/LanguageProvider";

type Publication = {
  id: string;
  publication_type: string;
  title: string;
  content: string;
  media_url: string | null;
  action_label: string | null;
  action_url: string | null;
  published_at: string | null;
  created_by_name: string | null;
  created_at: string;
};

type ContentTranslation = {
  title: string | null;
  body: string | null;
  action_label: string | null;
};

function getIcon(type: string) {
  if (type === "book") return BookOpen;
  if (type === "video") return PlayCircle;
  if (type === "image") return ImageIcon;
  if (type === "edification") return Quote;
  return HeartHandshake;
}

export default function PublicationDetailPage() {
  const params = useParams<{ id: string }>();
  const supabase = useMemo(() => createClient(), []);
  const { language } = useLanguage();

  const [publication, setPublication] = useState<Publication | null>(null);
  const [translation, setTranslation] = useState<ContentTranslation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadPublication() {
      setIsLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("ministry_publications")
        .select("id, publication_type, title, content, media_url, action_label, action_url, published_at, created_by_name, created_at")
        .eq("id", params.id)
        .eq("is_public", true)
        .eq("status", "published")
        .maybeSingle();

      if (error) {
        setErrorMessage(error.message);
        setPublication(null);
        setIsLoading(false);
        return;
      }

      if (!data) {
        setErrorMessage("Publication introuvable ou non publiée.");
        setPublication(null);
        setIsLoading(false);
        return;
      }

      setPublication(data as Publication);

      if (language !== "fr") {
        const { data: translationData } = await supabase
          .from("content_translations")
          .select("title, body, action_label")
          .eq("source_table", "ministry_publications")
          .eq("source_id", data.id)
          .eq("language_code", language)
          .maybeSingle();

        setTranslation((translationData || null) as ContentTranslation | null);
      } else {
        setTranslation(null);
      }

      setIsLoading(false);
    }

    if (params.id) loadPublication();
  }, [language, params.id, supabase]);

  const Icon = getIcon(publication?.publication_type || "encouragement");
  const title = translation?.title || publication?.title || "Publication";
  const content = translation?.body || publication?.content || "";
  const actionLabel = translation?.action_label || publication?.action_label || "Voir la ressource";

  return (
    <main className="page">
      <PublicHeader />

      <section className="section">
        <div className="container">
          <Link href="/" className="btn btn-secondary" style={{ marginBottom: 24 }}>
            <ArrowLeft size={18} />
            Retour à l’accueil
          </Link>

          {isLoading ? (
            <div className="card" style={{ padding: 24 }}>Chargement...</div>
          ) : null}

          {errorMessage ? (
            <div
              className="card"
              style={{
                padding: 24,
                color: "#fecaca",
                borderColor: "rgba(239,68,68,0.35)",
              }}
            >
              {errorMessage}
            </div>
          ) : null}

          {publication ? (
            <article className="card rb-gold-glow" style={{ padding: 34 }}>
              <p
                style={{
                  color: "var(--gold-bright)",
                  letterSpacing: "0.24em",
                  textTransform: "uppercase",
                  fontWeight: 900,
                  fontSize: 12,
                  marginTop: 0,
                }}
              >
                Publication du ministère
              </p>

              <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                <Icon color="var(--gold-bright)" size={42} />
                <h1 style={{ fontSize: "clamp(36px, 5vw, 62px)", lineHeight: 1, margin: 0 }}>
                  {title}
                </h1>
              </div>

              {publication.media_url ? (
                <div style={{ marginTop: 26 }}>
                  {publication.media_url.includes("youtube") || publication.media_url.includes("youtu.be") ? (
                    <iframe
                      className="video-frame"
                      src={publication.media_url.replace("watch?v=", "embed/")}
                      title={title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : (
                    <img
                      src={publication.media_url}
                      alt={title}
                      style={{ width: "100%", maxHeight: 460, objectFit: "cover", borderRadius: 24 }}
                    />
                  )}
                </div>
              ) : null}

              <p
                style={{
                  color: "var(--muted)",
                  lineHeight: 1.9,
                  fontSize: 18,
                  whiteSpace: "pre-line",
                  marginTop: 28,
                }}
              >
                {content}
              </p>

              <p style={{ color: "var(--gold-bright)", fontWeight: 900 }}>
                {publication.created_by_name || "Roy Bondo Ministries"}
              </p>

              {publication.action_url ? (
                <Link href={publication.action_url} className="btn btn-primary">
                  {actionLabel}
                </Link>
              ) : null}
            </article>
          ) : null}
        </div>
      </section>
    </main>
  );
}
