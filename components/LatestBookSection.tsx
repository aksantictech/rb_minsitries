"use client";

import Link from "next/link";
import { BookOpen, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "../lib/supabase/browser";

type Book = {
  id: string;
  title: string;
  subtitle: string | null;
  author: string;
  category: string;
  short_description: string;
  cover_url: string | null;
  price_label: string;
  purchase_url: string | null;
  published_year: number | null;
};

export default function LatestBookSection() {
  const supabase = createClient();

  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadLatestBook() {
      const { data } = await supabase
        .from("books")
        .select(
          "id, title, subtitle, author, category, short_description, cover_url, price_label, purchase_url, published_year"
        )
        .eq("is_public", true)
        .eq("is_latest", true)
        .order("display_order", { ascending: true })
        .limit(1)
        .maybeSingle();

      setBook((data || null) as Book | null);
      setIsLoading(false);
    }

    loadLatestBook();
  }, [supabase]);

  if (isLoading) {
    return null;
  }

  if (!book) {
    return null;
  }

  return (
    <section className="section" style={{ paddingTop: 10, paddingBottom: 40 }}>
      <div className="container">
        <div
          className="card rb-gold-glow"
          style={{
            padding: 30,
            display: "grid",
            gridTemplateColumns: "minmax(220px, 0.45fr) minmax(0, 1fr)",
            gap: 28,
            alignItems: "center",
            borderColor: "rgba(217,164,65,0.32)",
          }}
        >
          <div
            style={{
              border: "1px solid rgba(217,164,65,0.26)",
              borderRadius: 26,
              background:
                "linear-gradient(145deg, rgba(255,247,230,0.08), rgba(217,164,65,0.08))",
              padding: 22,
              display: "grid",
              placeItems: "center",
              minHeight: 330,
            }}
          >
            <img
              src={book.cover_url || "/images/logo_rb.PNG"}
              alt={book.title}
              style={{
                width: "100%",
                maxWidth: 260,
                maxHeight: 300,
                objectFit: "contain",
                filter: "drop-shadow(0 20px 35px rgba(0,0,0,0.35))",
              }}
            />
          </div>

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
              Dernier livre du Pasteur
            </p>

            <h2
              style={{
                fontSize: "clamp(34px, 4vw, 52px)",
                lineHeight: 1,
                margin: "12px 0",
              }}
            >
              {book.title}
            </h2>

            {book.subtitle ? (
              <h3
                style={{
                  color: "var(--gold-bright)",
                  margin: "0 0 16px",
                  fontSize: 22,
                }}
              >
                {book.subtitle}
              </h3>
            ) : null}

            <p
              style={{
                color: "var(--muted)",
                lineHeight: 1.8,
                fontSize: 17,
                maxWidth: 760,
              }}
            >
              {book.short_description}
            </p>

            <div
              style={{
                display: "flex",
                gap: 14,
                flexWrap: "wrap",
                marginTop: 22,
                alignItems: "center",
              }}
            >
              <strong
                style={{
                  color: "var(--cream)",
                  border: "1px solid rgba(217,164,65,0.25)",
                  background: "rgba(217,164,65,0.08)",
                  borderRadius: 999,
                  padding: "12px 16px",
                }}
              >
                {book.price_label}
              </strong>

              {book.purchase_url ? (
                <Link
                  href={book.purchase_url}
                  target="_blank"
                  className="btn btn-primary"
                >
                  <ShoppingBag size={18} />
                  Acheter le livre
                </Link>
              ) : null}

              <Link href="/books" className="btn btn-secondary">
                <BookOpen size={18} />
                Voir tous les livres
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}