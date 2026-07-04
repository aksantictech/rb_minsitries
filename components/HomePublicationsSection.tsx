"use client";

import Link from "next/link";
import { BookOpen, CalendarClock, HeartHandshake, ImageIcon, PlayCircle, Quote } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "../lib/supabase/browser";

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

function getIcon(type: string) {
  if (type === "book") return BookOpen;
  if (type === "video") return PlayCircle;
  if (type === "image") return ImageIcon;
  if (type === "edification") return Quote;
  return HeartHandshake;
}

function formatDate(value: string | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export default function HomePublicationsSection() {
  const supabase = createClient();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPublications() {
      const { data } = await supabase
        .from("ministry_publications")
        .select("id, publication_type, title, content, media_url, action_label, action_url, published_at, scheduled_at, created_at")
        .eq("is_public", true)
        .eq("status", "published")
        .lte("published_at", new Date().toISOString())
        .order("is_featured", { ascending: false })
        .order("published_at", { ascending: false })
        .limit(4);

      setPublications((data || []) as Publication[]);
      setIsLoading(false);
    }

    loadPublications();
  }, [supabase]);

  if (isLoading || publications.length === 0) {
    return null;
  }

  const main = publications[0];
  const MainIcon = getIcon(main.publication_type);

  return (
    <section className="section" style={{ paddingTop: 18, paddingBottom: 22 }}>
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
              <h2 style={{ fontSize: "clamp(30px, 4vw, 48px)", lineHeight: 1, margin: 0 }}>
                {main.title}
              </h2>
            </div>

            <p style={{ color: "var(--muted)", lineHeight: 1.8, fontSize: 17, whiteSpace: "pre-line" }}>
              {main.content}
            </p>

            <p style={{ color: "var(--gold-bright)", fontWeight: 800 }}>
              {formatDate(main.published_at || main.scheduled_at || main.created_at)}
            </p>

            {main.action_url ? (
              <Link href={main.action_url} className="btn btn-primary">
                {main.action_label || "Lire la suite"}
              </Link>
            ) : null}
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
                    <h3 style={{ margin: 0, fontSize: 18 }}>{publication.title}</h3>
                    <p style={{ margin: "7px 0 0", color: "var(--muted)", lineHeight: 1.6 }}>
                      {publication.content.length > 110
                        ? `${publication.content.slice(0, 110)}...`
                        : publication.content}
                    </p>
                    {publication.action_url ? (
                      <Link
                        href={publication.action_url}
                        style={{
                          color: "var(--gold-bright)",
                          fontWeight: 900,
                          textDecoration: "none",
                          display: "inline-block",
                          marginTop: 8,
                        }}
                      >
                        {publication.action_label || "Voir"} →
                      </Link>
                    ) : null}
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
