"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MessageCircleHeart } from "lucide-react";
import PublicHeader from "../../components/PublicHeader";
import { createClient } from "../../lib/supabase/browser";

type PublicTestimony = {
  id: string;
  full_name: string;
  city_country: string | null;
  testimony: string;
  published_at: string | null;
  created_at: string;
};

function formatDate(value: string | null) {
  if (!value) return "";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export default function PublicTestimoniesPage() {
  const supabase = useMemo(() => createClient(), []);

  const [testimonies, setTestimonies] = useState<PublicTestimony[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadTestimonies() {
      const { data, error } = await supabase
        .from("testimonies")
        .select("id, full_name, city_country, testimony, published_at, created_at")
        .eq("can_publish", true)
        .eq("status", "published")
        .order("published_at", { ascending: false });

      if (error) {
        setErrorMessage(error.message);
      } else {
        setTestimonies((data || []) as PublicTestimony[]);
      }

      setIsLoading(false);
    }

    loadTestimonies();
  }, [supabase]);

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
            Témoignages publiés
          </p>

          <h1 style={{ fontSize: 54, margin: "12px 0 18px" }}>
            Ce que Dieu <span className="gold-text">fait encore</span>
          </h1>

          <p style={{ color: "var(--muted)", lineHeight: 1.8, maxWidth: 860 }}>
            Retrouvez ici les témoignages validés et publiés par l’équipe du
            ministère Roy Bondo Ministries.
          </p>

          <Link href="/testimony" className="btn btn-primary" style={{ marginTop: 24 }}>
            <MessageCircleHeart size={18} />
            Partager mon témoignage
          </Link>

          {isLoading ? (
            <div className="card" style={{ padding: 22, marginTop: 30 }}>
              Chargement des témoignages...
            </div>
          ) : null}

          {errorMessage ? (
            <div
              className="card"
              style={{
                padding: 22,
                marginTop: 30,
                color: "#fecaca",
                borderColor: "rgba(239,68,68,0.35)",
              }}
            >
              {errorMessage}
            </div>
          ) : null}

          {!isLoading && testimonies.length === 0 ? (
            <div className="card" style={{ padding: 24, marginTop: 30 }}>
              <h2 style={{ marginTop: 0, color: "var(--gold-bright)" }}>
                Aucun témoignage publié pour le moment
              </h2>
              <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
                Les témoignages envoyés sont d’abord vérifiés par l’équipe du
                ministère avant publication.
              </p>
            </div>
          ) : null}

          <div className="grid-3" style={{ marginTop: 34 }}>
            {testimonies.map((item) => (
              <article
                key={item.id}
                className="card rb-gold-glow"
                style={{ padding: 24 }}
              >
                <p
                  style={{
                    color: "var(--gold-bright)",
                    fontWeight: 900,
                    marginTop: 0,
                  }}
                >
                  {item.city_country || "Témoignage"}
                </p>

                <h2 style={{ fontSize: 22, margin: "0 0 12px" }}>
                  {item.full_name}
                </h2>

                <p
                  style={{
                    color: "var(--muted)",
                    lineHeight: 1.8,
                    whiteSpace: "pre-line",
                  }}
                >
                  “{item.testimony}”
                </p>

                <p
                  style={{
                    color: "var(--gold-bright)",
                    fontSize: 13,
                    fontWeight: 800,
                    marginBottom: 0,
                  }}
                >
                  Publié le {formatDate(item.published_at || item.created_at)}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
