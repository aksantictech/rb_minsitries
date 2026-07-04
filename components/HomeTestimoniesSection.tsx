"use client";

import Link from "next/link";
import { MessageCircleHeart } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "../lib/supabase/browser";

type Testimony = {
  id: string;
  full_name: string;
  city_country: string | null;
  testimony: string;
  published_at: string | null;
  created_at: string;
};

const fallbackTestimonies: Testimony[] = [
  {
    id: "fallback-1",
    full_name: "Témoignage en attente",
    city_country: "Roy Bondo Ministries",
    testimony:
      "Les témoignages validés par l’équipe du ministère apparaîtront ici afin d’édifier les fidèles et glorifier Dieu.",
    published_at: null,
    created_at: new Date().toISOString(),
  },
  {
    id: "fallback-2",
    full_name: "Partagez ce que Dieu a fait",
    city_country: "Espace témoignage",
    testimony:
      "Chaque fidèle peut envoyer son témoignage. Après validation, il pourra être publié sur cette page.",
    published_at: null,
    created_at: new Date().toISOString(),
  },
  {
    id: "fallback-3",
    full_name: "Une foi qui édifie",
    city_country: "Ministère pastoral",
    testimony:
      "Les témoignages sont une source d’encouragement pour ceux qui croient encore que Jésus agit aujourd’hui.",
    published_at: null,
    created_at: new Date().toISOString(),
  },
];

export default function HomeTestimoniesSection() {
  const supabase = useMemo(() => createClient(), []);

  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    async function loadTestimonies() {
      const { data } = await supabase
        .from("testimonies")
        .select("id, full_name, city_country, testimony, published_at, created_at")
        .eq("can_publish", true)
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(3);

      setTestimonies((data || []) as Testimony[]);
    }

    loadTestimonies();
  }, [supabase]);

  const items = testimonies.length > 0 ? testimonies : fallbackTestimonies;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % items.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [items.length]);

  const active = items[activeIndex];

  return (
    <section className="section testimonies-home-section" style={{ paddingTop: 30 }}>
      <div className="container">
        <div
          className="card rb-gold-glow"
          style={{
            padding: 32,
            borderColor: "rgba(217,164,65,0.32)",
            display: "grid",
            gridTemplateColumns: "minmax(0, 0.8fr) minmax(0, 1.2fr)",
            gap: 28,
            alignItems: "center",
          }}
        >
          <div>
            <MessageCircleHeart color="var(--gold-bright)" size={44} />

            <p
              style={{
                color: "var(--gold-bright)",
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                fontWeight: 900,
                fontSize: 12,
              }}
            >
              Témoignages
            </p>

            <h2 style={{ fontSize: 38, margin: "10px 0 14px" }}>
              Ce que Dieu fait dans les vies
            </h2>

            <p style={{ color: "var(--muted)", lineHeight: 1.8 }}>
              Découvrez quelques témoignages publiés après validation par
              l’équipe du ministère, ou partagez votre propre témoignage pour
              édifier d’autres personnes.
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 22 }}>
              <Link href="/testimonies" className="btn btn-primary">
                Lire la suite
              </Link>

              <Link href="/testimony" className="btn btn-secondary">
                Partager un témoignage
              </Link>
            </div>
          </div>

          <article
            style={{
              border: "1px solid rgba(217,164,65,0.22)",
              borderRadius: 24,
              padding: 24,
              background: "rgba(2,6,23,0.5)",
              minHeight: 260,
            }}
          >
            <p
              style={{
                color: "var(--muted)",
                lineHeight: 1.9,
                fontSize: 18,
                whiteSpace: "pre-line",
                marginTop: 0,
              }}
            >
              “{active.testimony}”
            </p>

            <div
              style={{
                borderTop: "1px solid rgba(217,164,65,0.16)",
                marginTop: 20,
                paddingTop: 16,
              }}
            >
              <strong style={{ color: "var(--cream)", display: "block" }}>
                {active.full_name}
              </strong>
              <span style={{ color: "var(--gold-bright)", fontWeight: 800 }}>
                {active.city_country || "Témoignage publié"}
              </span>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
              {items.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Voir le témoignage ${index + 1}`}
                  style={{
                    width: index === activeIndex ? 28 : 10,
                    height: 10,
                    borderRadius: 999,
                    border: "none",
                    cursor: "pointer",
                    background:
                      index === activeIndex
                        ? "var(--gold-bright)"
                        : "rgba(255,255,255,0.25)",
                    transition: "0.2s ease",
                  }}
                />
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
