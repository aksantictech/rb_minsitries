"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import PublicHeader from "../../components/PublicHeader";
import { createClient } from "../../lib/supabase/browser";

export default function TestimonyPage() {
  const supabase = useMemo(() => createClient(), []);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [cityCountry, setCityCountry] = useState("");
  const [testimony, setTestimony] = useState("");
  const [canPublish, setCanPublish] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit() {
    setErrorMessage("");
    setSuccessMessage("");

    if (!fullName.trim()) {
      setErrorMessage("Veuillez indiquer votre nom complet.");
      return;
    }

    if (!testimony.trim()) {
      setErrorMessage("Veuillez écrire votre témoignage.");
      return;
    }

    setIsSaving(true);

    const { error } = await supabase.from("testimonies").insert({
      full_name: fullName,
      phone: phone || null,
      email: email || null,
      city_country: cityCountry || null,
      testimony,
      can_publish: canPublish,
      status: "new",
    });

    setIsSaving(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSuccessMessage(
      "Votre témoignage a été envoyé avec succès. Il sera vérifié par l’équipe du ministère avant publication."
    );

    setFullName("");
    setPhone("");
    setEmail("");
    setCityCountry("");
    setTestimony("");
    setCanPublish(true);
  }

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
            Partager un témoignage
          </p>

          <h1 style={{ fontSize: 52, margin: "10px 0 14px" }}>
            Envoyer un <span className="gold-text">témoignage</span>
          </h1>

          <p
            style={{
              color: "var(--muted)",
              lineHeight: 1.8,
              maxWidth: 820,
              marginBottom: 20,
            }}
          >
            Partagez ce que Dieu a fait dans votre vie. Les témoignages sont
            reçus par l’équipe pastorale, vérifiés, puis publiés uniquement
            après validation.
          </p>

          <Link
            href="/testimonies"
            className="btn btn-secondary"
            style={{ marginBottom: 28 }}
          >
            Voir les témoignages publiés
          </Link>

          <div className="card rb-gold-glow" style={{ padding: 30, maxWidth: 900 }}>
            {errorMessage ? <AlertMessage type="error" text={errorMessage} /> : null}
            {successMessage ? (
              <AlertMessage type="success" text={successMessage} />
            ) : null}

            <form style={{ display: "grid", gap: 18 }}>
              <div className="grid-2">
                <label className="label">
                  Nom complet
                  <input
                    className="input"
                    placeholder="Votre nom"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                  />
                </label>

                <label className="label">
                  Téléphone / WhatsApp
                  <input
                    className="input"
                    placeholder="+243..."
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                  />
                </label>
              </div>

              <div className="grid-2">
                <label className="label">
                  Email facultatif
                  <input
                    className="input"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </label>

                <label className="label">
                  Ville / Pays
                  <input
                    className="input"
                    placeholder="Kinshasa, RDC..."
                    value={cityCountry}
                    onChange={(event) => setCityCountry(event.target.value)}
                  />
                </label>
              </div>

              <label className="label">
                Votre témoignage
                <textarea
                  className="textarea"
                  placeholder="Racontez ce que Dieu a fait..."
                  value={testimony}
                  onChange={(event) => setTestimony(event.target.value)}
                />
              </label>

              <label
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  color: "var(--muted)",
                  fontWeight: 800,
                }}
              >
                <input
                  type="checkbox"
                  checked={canPublish}
                  onChange={(event) => setCanPublish(event.target.checked)}
                />
                J’autorise le ministère à publier mon témoignage après validation.
              </label>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={isSaving}
                style={{
                  width: "fit-content",
                  cursor: isSaving ? "not-allowed" : "pointer",
                  opacity: isSaving ? 0.75 : 1,
                }}
              >
                {isSaving ? "Envoi en cours..." : "Envoyer le témoignage"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

function AlertMessage({
  type,
  text,
}: {
  type: "error" | "success";
  text: string;
}) {
  const isError = type === "error";

  return (
    <div
      style={{
        border: `1px solid ${
          isError ? "rgba(239,68,68,0.35)" : "rgba(52,211,153,0.35)"
        }`,
        background: isError ? "rgba(239,68,68,0.1)" : "rgba(52,211,153,0.1)",
        color: isError ? "#fecaca" : "#bbf7d0",
        borderRadius: 16,
        padding: 14,
        marginBottom: 20,
        lineHeight: 1.6,
      }}
    >
      {text}
    </div>
  );
}
