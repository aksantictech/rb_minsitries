"use client";

import Link from "next/link";
import { PlayCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import PublicHeader from "../../components/PublicHeader";
import { createClient } from "../../lib/supabase/browser";

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
};

export default function TeachingsPage() {
  const supabase = createClient();

  const [teachings, setTeachings] = useState<Teaching[]>([]);
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadTeachings() {
      const { data, error } = await supabase
        .from("teachings")
        .select(
          "id, title, category, youtube_url, youtube_video_id, description, is_featured, is_public, published_at"
        )
        .eq("is_public", true)
        .order("is_featured", { ascending: false })
        .order("published_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });

      if (error) {
        setErrorMessage(error.message);
      } else {
        setTeachings((data || []) as Teaching[]);
      }

      setIsLoading(false);
    }

    loadTeachings();
  }, [supabase]);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(teachings.map((item) => item.category)));
    return ["Tous", ...unique];
  }, [teachings]);

  const filteredTeachings = useMemo(() => {
    if (activeCategory === "Tous") return teachings;
    return teachings.filter((item) => item.category === activeCategory);
  }, [activeCategory, teachings]);

  const featured =
    teachings.find((item) => item.is_featured && item.youtube_video_id) ||
    teachings.find((item) => item.youtube_video_id) ||
    null;

  const groupedTeachings = useMemo(() => {
    return filteredTeachings.reduce<Record<string, Teaching[]>>((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }

      acc[item.category].push(item);
      return acc;
    }, {});
  }, [filteredTeachings]);

  return (
    <main className="page">
      <PublicHeader />

      <section className="section">
        <div className="container">
          <p
            style={{
              color: "var(--gold-bright)",
              letterSpacing: "0.26em",
              textTransform: "uppercase",
              fontWeight: 900,
              fontSize: 12,
            }}
          >
            Enseignements
          </p>

          <h1 style={{ fontSize: 54, margin: "12px 0 18px" }}>
            Prédications & <span className="gold-text">messages</span>
          </h1>

          <p style={{ color: "var(--muted)", lineHeight: 1.8, maxWidth: 860 }}>
            Retrouvez les enseignements, exhortations, prédications et contenus spirituels du ministère Roy Bondo Ministries.
          </p>

          {isLoading ? <div className="card" style={{ padding: 22, marginTop: 30 }}>Chargement...</div> : null}

          {errorMessage ? (
            <div className="card" style={{ padding: 22, marginTop: 30, color: "#fecaca", borderColor: "rgba(239,68,68,0.35)" }}>
              {errorMessage}
            </div>
          ) : null}

          {featured ? (
            <div className="card rb-gold-glow" style={{ padding: 28, marginTop: 34, borderColor: "rgba(217,164,65,0.32)" }}>
              <p style={{ color: "var(--gold-bright)", fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", fontSize: 12, marginTop: 0 }}>
                Vidéo à la une
              </p>

              <h2 style={{ fontSize: 34, marginTop: 0 }}>{featured.title}</h2>

              <iframe
                className="video-frame"
                src={`https://www.youtube.com/embed/${featured.youtube_video_id}?autoplay=0&controls=1&rel=0&playsinline=1`}
                title={featured.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />

              {featured.description ? <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>{featured.description}</p> : null}
            </div>
          ) : null}

          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 34, marginBottom: 28 }}>
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                style={{
                  border: activeCategory === category ? "1px solid var(--gold-bright)" : "1px solid rgba(217,164,65,0.24)",
                  background: activeCategory === category ? "linear-gradient(135deg, var(--gold-bright), var(--gold))" : "rgba(255,255,255,0.035)",
                  color: activeCategory === category ? "#111827" : "var(--cream)",
                  borderRadius: 999,
                  padding: "11px 16px",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                {category}
              </button>
            ))}
          </div>

          {!isLoading && teachings.length === 0 ? <div className="card" style={{ padding: 22 }}>Aucun enseignement publié pour le moment.</div> : null}

          <div style={{ display: "grid", gap: 40 }}>
            {Object.entries(groupedTeachings).map(([category, items]) => (
              <section key={category}>
                <h2 style={{ color: "var(--gold-bright)", fontSize: 28, margin: "0 0 18px" }}>{category}</h2>

                <div className="grid-3">
                  {items.map((teaching) => (
                    <article key={teaching.id} className="card" style={{ overflow: "hidden" }}>
                      {teaching.youtube_video_id ? (
                        <img
                          src={`https://img.youtube.com/vi/${teaching.youtube_video_id}/hqdefault.jpg`}
                          alt={teaching.title}
                          style={{ width: "100%", height: 190, objectFit: "cover", display: "block", borderBottom: "1px solid rgba(217,164,65,0.2)" }}
                        />
                      ) : (
                        <div style={{ height: 190, display: "grid", placeItems: "center", background: "rgba(217,164,65,0.08)" }}>
                          <PlayCircle color="var(--gold-bright)" size={54} />
                        </div>
                      )}

                      <div style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 22, lineHeight: 1.3, margin: "0 0 12px" }}>{teaching.title}</h3>

                        {teaching.description ? <p style={{ color: "var(--muted)", lineHeight: 1.7, minHeight: 72 }}>{teaching.description}</p> : null}

                        <Link href={teaching.youtube_url} target="_blank" className="btn btn-secondary" style={{ marginTop: 12 }}>
                          <PlayCircle size={18} />
                          Regarder
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
