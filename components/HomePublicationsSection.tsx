"use client";

import Link from "next/link";
import {
  BookOpen,
  CalendarClock,
  HeartHandshake,
  ImageIcon,
  PlayCircle,
  Quote,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "../lib/supabase/browser";
import { useLanguage } from "./LanguageProvider";

const localeByLanguage = {
  fr: "fr-FR",
  ln: "fr-CD",
  sw: "sw-CD",
  en: "en-US",
  es: "es-ES",
} as const;

type Publication = {
  id: string;
  publication_type: string;
  title: string;
  content: string;
  media_url: string | null;
  action_label: string | null;
  action_url: string | null;
  published_at: string | null;
  scheduled_at: string | null;
  created_at: string;
};

type ContentTranslation = {
  source_id: string;
  language_code: string;
  title: string | null;
  body: string | null;
  action_label: string | null;
};

type DisplayPublication = Publication & {
  displayTitle: string;
  displayContent: string;
  displayActionLabel: string | null;
};

function getIcon(type: string) {
  if (type === "book") return BookOpen;
  if (type === "video") return PlayCircle;
  if (type === "image") return ImageIcon;
  if (type === "edification") return Quote;
  return HeartHandshake;
}

function truncateText(value: string, maxLength = 110) {
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
}

export default function HomePublicationsSection() {
  const supabase = useMemo(() => createClient(), []);
  const { language } = useLanguage();

  const [publications, setPublications] = useState<DisplayPublication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPublications() {
      setIsLoading(true);

      const { data } = await supabase
        .from("ministry_publications")
        .select(
          "id, publication_type, title, content, media_url, action_label, action_url, published_at, scheduled_at, created_at"
        )
        .eq("is_public", true)
        .eq("status", "published")
        .lte("published_at", new Date().toISOString())
        .order("is_featured", { ascending: false })
        .order("published_at", { ascending: false })
        .limit(4);

      const rows = (data || []) as Publication[];

      if (rows.length === 0) {
        setPublications([]);
        setIsLoading(false);
        return;
      }

      let translations: ContentTranslation[] = [];

      if (language !== "fr") {
        const ids = rows.map((item) => item.id);
        const { data: translationData } = await supabase
          .from("content_translations")
          .select("source_id, language_code, title, body, action_label")
          .eq("source_table", "ministry_publications")
          .eq("language_code", language)
          .in("source_id", ids);

        translations = (translationData || []) as ContentTranslation[];
      }

      const translationById = new Map(
        translations.map((translation) => [translation.source_id, translation])
      );

      setPublications(
        rows.map((publication) => {
          const translation = translationById.get(publication.id);

          return {
            ...publication,
            displayTitle: translation?.title || publication.title,
            displayContent: translation?.body || publication.content,
            displayActionLabel:
              translation?.action_label || publication.action_label || null,
          };
        })
      );

      setIsLoading(false);
    }

    loadPublications();
  }, [language, supabase]);

  if (isLoading || publications.length === 0) {
    return null;
  }

  const main = publications[0];
  const MainIcon = getIcon(main.publication_type);
  const locale = localeByLanguage[language] || "fr-FR";

  function formatDate(value: string | null) {
    if (!value) return "";

    return new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(value));
  }

  return (
    <section className="section home-publications-section" style={{ paddingTop: 18, paddingBottom: 22 }}>
      <div className="container">
        <div
          className="card rb-gold-glow"
          style={{
            padding: 30,
            borderColor: "rgba(217,164,65,0.32)",
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.1fr) minmax(320px, 0.9fr)",
            gap: 22,
            alignItems: "stretch",
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
                marginTop: 0,
              }}
            >
              Publication du ministère
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <MainIcon color="var(--gold-bright)" size={38} />
              <h2
                style={{
                  fontSize: "clamp(30px, 4vw, 48px)",
                  lineHeight: 1,
                  margin: 0,
                }}
              >
                {main.displayTitle}
              </h2>
            </div>

            <p
              style={{
                color: "var(--muted)",
                lineHeight: 1.8,
                fontSize: 17,
                whiteSpace: "pre-line",
              }}
            >
              {main.displayContent}
            </p>

            <p style={{ color: "var(--gold-bright)", fontWeight: 800 }}>
              {formatDate(main.published_at || main.scheduled_at || main.created_at)}
            </p>

            <Link href={`/publications/${main.id}`} className="btn btn-primary">
              {main.displayActionLabel || "Lire la suite"}
            </Link>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            {publications.slice(1, 4).map((publication) => {
              const Icon = getIcon(publication.publication_type);

              return (
                <article
                  key={publication.id}
                  style={{
                    border: "1px solid rgba(217,164,65,0.18)",
                    background: "rgba(255,255,255,0.035)",
                    borderRadius: 20,
                    padding: 18,
                    display: "flex",
                    gap: 14,
                    alignItems: "flex-start",
                  }}
                >
                  <Icon color="var(--gold-bright)" size={25} />
                  <div>
                    <h3 style={{ margin: 0, fontSize: 18 }}>
                      {publication.displayTitle}
                    </h3>
                    <p style={{ margin: "7px 0 0", color: "var(--muted)", lineHeight: 1.6 }}>
                      {truncateText(publication.displayContent)}
                    </p>
                    <Link
                      href={`/publications/${publication.id}`}
                      style={{
                        color: "var(--gold-bright)",
                        fontWeight: 900,
                        textDecoration: "none",
                        display: "inline-block",
                        marginTop: 8,
                      }}
                    >
                      {publication.displayActionLabel || "Voir"} →
                    </Link>
                  </div>
                </article>
              );
            })}

            <Link href="/teachings" className="btn btn-secondary" style={{ justifySelf: "start" }}>
              <CalendarClock size={18} />
              Voir les ressources du ministère
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
