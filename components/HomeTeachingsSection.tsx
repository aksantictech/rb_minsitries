"use client";

import Link from "next/link";
import { PlayCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "../lib/supabase/browser";

type Teaching = {
  id: string;
  title: string;
  youtube_url: string;
  youtube_video_id: string | null;
  description: string | null;
};

export default function HomeTeachingsSection() {
  const supabase = createClient();

  const [teachings, setTeachings] = useState<Teaching[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTeachings() {
      const { data } = await supabase
        .from("teachings")
        .select("id, title, youtube_url, youtube_video_id, description")
        .eq("is_public", true)
        .order("is_featured", { ascending: false })
        .order("published_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(4);

      setTeachings((data || []) as Teaching[]);
      setIsLoading(false);
    }

    loadTeachings();
  }, [supabase]);

  if (isLoading || teachings.length === 0) {
    return null;
  }

  return (
    <section className="section home-teachings-section">
      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 18, alignItems: "end", marginBottom: 24, flexWrap: "wrap" }}>
          <div>
            <p style={{ color: "var(--gold-bright)", letterSpacing: "0.26em", textTransform: "uppercase", fontWeight: 900, fontSize: 12, margin: 0 }}>
              Enseignements récents
            </p>
            <h2 style={{ fontSize: 42, margin: "12px 0 0" }}>
              Nourrir la foi par la <span className="gold-text">Parole</span>
            </h2>
          </div>

          <Link href="/teachings" className="btn btn-secondary">
            Lire la suite des enseignements
          </Link>
        </div>

        <div className="grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 18 }}>
          {teachings.map((teaching) => (
            <article key={teaching.id} className="card" style={{ overflow: "hidden" }}>
              {teaching.youtube_video_id ? (
                <img
                  src={`https://img.youtube.com/vi/${teaching.youtube_video_id}/hqdefault.jpg`}
                  alt={teaching.title}
                  style={{ width: "100%", height: 150, objectFit: "cover", display: "block", borderBottom: "1px solid rgba(217,164,65,0.2)" }}
                />
              ) : null}

              <div style={{ padding: 18 }}>
                <h3 style={{ margin: 0, color: "var(--cream)", fontSize: 18, lineHeight: 1.3 }}>
                  {teaching.title}
                </h3>

                <Link href={teaching.youtube_url} target="_blank" className="btn btn-secondary" style={{ marginTop: 14, padding: "10px 13px", fontSize: 13 }}>
                  <PlayCircle size={16} />
                  Regarder
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
