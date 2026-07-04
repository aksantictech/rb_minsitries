"use client";

import Link from "next/link";
import { BookOpen, ShoppingBag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import PublicHeader from "../../components/PublicHeader";
import { createClient } from "../../lib/supabase/browser";

type Book = {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  author: string;
  category: string;
  short_description: string;
  long_description: string | null;
  cover_url: string | null;
  price_label: string;
  purchase_url: string | null;
  published_year: number | null;
  is_latest: boolean;
  is_featured: boolean;
};

export default function BooksPage() {
  const supabase = createClient();

  const [books, setBooks] = useState<Book[]>([]);
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadBooks() {
      const { data, error } = await supabase
        .from("books")
        .select(
          "id, title, slug, subtitle, author, category, short_description, long_description, cover_url, price_label, purchase_url, published_year, is_latest, is_featured"
        )
        .eq("is_public", true)
        .order("is_latest", { ascending: false })
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) {
        setErrorMessage(error.message);
      } else {
        setBooks((data || []) as Book[]);
      }

      setIsLoading(false);
    }

    loadBooks();
  }, [supabase]);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(books.map((book) => book.category)));
    return ["Tous", ...unique];
  }, [books]);

  const filteredBooks = useMemo(() => {
    if (activeCategory === "Tous") return books;
    return books.filter((book) => book.category === activeCategory);
  }, [activeCategory, books]);

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
            Bibliothèque du ministère
          </p>

          <h1 style={{ fontSize: 54, margin: "12px 0 18px" }}>
            Livres du <span className="gold-text">Pasteur Roy</span>
          </h1>

          <p style={{ color: "var(--muted)", lineHeight: 1.8, maxWidth: 880 }}>
            Retrouvez les livres, ressources spirituelles et ouvrages du Pasteur
            Roy Bondo. Chaque livre peut être présenté avec une introduction, un
            prix indicatif et un lien d’achat.
          </p>

          {isLoading ? (
            <div className="card" style={{ padding: 22, marginTop: 30 }}>
              Chargement des livres...
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

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              marginTop: 34,
              marginBottom: 28,
            }}
          >
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                style={{
                  border:
                    activeCategory === category
                      ? "1px solid var(--gold-bright)"
                      : "1px solid rgba(217,164,65,0.24)",
                  background:
                    activeCategory === category
                      ? "linear-gradient(135deg, var(--gold-bright), var(--gold))"
                      : "rgba(255,255,255,0.035)",
                  color:
                    activeCategory === category ? "#111827" : "var(--cream)",
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

          {!isLoading && books.length === 0 ? (
            <div className="card" style={{ padding: 22 }}>
              Aucun livre publié pour le moment.
            </div>
          ) : null}

          <div className="grid-3">
            {filteredBooks.map((book) => (
              <article
                key={book.id}
                className="card rb-gold-glow"
                style={{
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    minHeight: 270,
                    display: "grid",
                    placeItems: "center",
                    background:
                      "linear-gradient(145deg, rgba(255,247,230,0.08), rgba(217,164,65,0.06))",
                    borderBottom: "1px solid rgba(217,164,65,0.2)",
                    padding: 22,
                  }}
                >
                  <img
                    src={book.cover_url || "/images/logo_rb.PNG"}
                    alt={book.title}
                    style={{
                      width: "100%",
                      maxWidth: 220,
                      maxHeight: 250,
                      objectFit: "contain",
                      filter: "drop-shadow(0 20px 34px rgba(0,0,0,0.35))",
                    }}
                  />
                </div>

                <div
                  style={{
                    padding: 24,
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                  }}
                >
                  <p
                    style={{
                      color: "var(--gold-bright)",
                      fontWeight: 900,
                      fontSize: 13,
                      marginTop: 0,
                    }}
                  >
                    {book.category}
                    {book.published_year ? ` · ${book.published_year}` : ""}
                  </p>

                  <h2 style={{ fontSize: 25, lineHeight: 1.15, margin: 0 }}>
                    {book.title}
                  </h2>

                  {book.subtitle ? (
                    <h3
                      style={{
                        color: "var(--muted)",
                        fontSize: 16,
                        lineHeight: 1.4,
                      }}
                    >
                      {book.subtitle}
                    </h3>
                  ) : null}

                  <p
                    style={{
                      color: "var(--muted)",
                      lineHeight: 1.7,
                      flex: 1,
                    }}
                  >
                    {book.short_description}
                  </p>

                  <strong
                    style={{
                      color: "var(--cream)",
                      marginBottom: 14,
                    }}
                  >
                    {book.price_label}
                  </strong>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {book.purchase_url ? (
                      <Link
                        href={book.purchase_url}
                        target="_blank"
                        className="btn btn-primary"
                      >
                        <ShoppingBag size={18} />
                        Acheter
                      </Link>
                    ) : null}

                    <Link href={`/books/${book.slug}`} className="btn btn-secondary">
                      <BookOpen size={18} />
                      Lire l’intro
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}