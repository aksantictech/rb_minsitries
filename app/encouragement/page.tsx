"use client";

import { useState } from "react";
import PublicHeader from "../../components/PublicHeader";
import { createClient } from "../../lib/supabase/browser";

export default function EncouragementPage() {
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [cityCountry, setCityCountry] = useState("");
  const [messageType, setMessageType] = useState("encouragement");
  const [message, setMessage] = useState("");
  const [canPublish, setCanPublish] = useState(false);

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

    if (!message.trim()) {
      setErrorMessage("Veuillez écrire votre message.");
      return;
    }

    setIsSaving(true);

    const { error } = await supabase.from("encouragement_messages").insert({
      full_name: fullName,
      phone: phone || null,
      email: email || null,
      city_country: cityCountry || null,
      message_type: messageType,
      message,
      can_publish: canPublish,
      status: "new",
    });

    setIsSaving(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSuccessMessage(
      "Votre message a été envoyé avec succès. Que Dieu vous bénisse."
    );

    setFullName("");
    setPhone("");
    setEmail("");
    setCityCountry("");
    setMessageType("encouragement");
    setMessage("");
    setCanPublish(false);
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
            Encouragements & bénédictions
          </p>

          <h1 style={{ fontSize: 52, margin: "10px 0 14px" }}>
            Écrire au <span className="gold-text">Pasteur Roy</span>
          </h1>

          <p
            style={{
              color: "var(--muted)",
              lineHeight: 1.8,
              maxWidth: 840,
              marginBottom: 28,
            }}
          >
            Cet espace permet aux fidèles, partenaires et personnes bénies par
            le ministère d’envoyer un mot d’encouragement, une bénédiction ou un
            message de gratitude au Pasteur Roy Bondo.
          </p>

          <div className="card rb-gold-glow" style={{ padding: 30, maxWidth: 920 }}>
            {errorMessage ? (
              <AlertMessage type="error" text={errorMessage} />
            ) : null}

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
                Type de message
                <select
                  className="select"
                  value={messageType}
                  onChange={(event) => setMessageType(event.target.value)}
                >
                  <option value="encouragement">Mot d’encouragement</option>
                  <option value="blessing">Mot de bénédiction</option>
                  <option value="gratitude">Message de gratitude</option>
                  <option value="testimony_to_pastor">
                    Message d’impact personnel
                  </option>
                </select>
              </label>

              <label className="label">
                Message
                <textarea
                  className="textarea"
                  placeholder="Écrivez votre message au Pasteur..."
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
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
                J’autorise le ministère à utiliser ce message comme
                encouragement public après validation.
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
                {isSaving ? "Envoi en cours..." : "Envoyer le message"}
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