"use client";

import { useState } from "react";
import PublicHeader from "../../components/PublicHeader";
import { createClient } from "../../lib/supabase/browser";

export default function PrayerPage() {
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("Santé");
  const [subject, setSubject] = useState("");
  const [confidentiality, setConfidentiality] = useState("normal");
  const [allowCallback, setAllowCallback] = useState(true);

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

    if (!phone.trim()) {
      setErrorMessage("Veuillez indiquer votre numéro de téléphone ou WhatsApp.");
      return;
    }

    if (!subject.trim()) {
      setErrorMessage("Veuillez écrire votre sujet de prière.");
      return;
    }

    setIsSaving(true);

    const { error } = await supabase.from("prayer_requests").insert({
      full_name: fullName,
      phone,
      email: email || null,
      category,
      subject,
      confidentiality,
      allow_callback: allowCallback,
      status: "new",
      priority: "normal",
    });

    setIsSaving(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSuccessMessage(
      "Votre demande de prière a été envoyée avec succès. L’équipe pastorale la recevra dans l’espace ministère."
    );

    setFullName("");
    setPhone("");
    setEmail("");
    setCategory("Santé");
    setSubject("");
    setConfidentiality("normal");
    setAllowCallback(true);
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
            Ministère de prière
          </p>

          <h1 style={{ fontSize: 52, margin: "10px 0 14px" }}>
            Demande de <span className="gold-text">prière</span>
          </h1>

          <p
            style={{
              color: "var(--muted)",
              lineHeight: 1.8,
              maxWidth: 820,
              marginBottom: 28,
            }}
          >
            Soumettez votre sujet de prière. Votre demande sera reçue par
            l’équipe pastorale et traitée avec respect et confidentialité.
          </p>

          <div className="card rb-gold-glow" style={{ padding: 30, maxWidth: 900 }}>
            {errorMessage ? (
              <div
                style={{
                  border: "1px solid rgba(239,68,68,0.35)",
                  background: "rgba(239,68,68,0.1)",
                  color: "#fecaca",
                  borderRadius: 16,
                  padding: 14,
                  marginBottom: 20,
                  lineHeight: 1.6,
                }}
              >
                {errorMessage}
              </div>
            ) : null}

            {successMessage ? (
              <div
                style={{
                  border: "1px solid rgba(52,211,153,0.35)",
                  background: "rgba(52,211,153,0.1)",
                  color: "#bbf7d0",
                  borderRadius: 16,
                  padding: 14,
                  marginBottom: 20,
                  lineHeight: 1.6,
                }}
              >
                {successMessage}
              </div>
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

              <div className="grid-2">
                <label className="label">
                  Catégorie
                  <select
                    className="select"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                  >
                    <option>Santé</option>
                    <option>Famille</option>
                    <option>Travail</option>
                    <option>Mariage</option>
                    <option>Orientation</option>
                    <option>Finances</option>
                    <option>Délivrance</option>
                    <option>Autre</option>
                  </select>
                </label>

                <label className="label">
                  Confidentialité
                  <select
                    className="select"
                    value={confidentiality}
                    onChange={(event) => setConfidentiality(event.target.value)}
                  >
                    <option value="normal">Normal</option>
                    <option value="confidential">Confidentiel</option>
                    <option value="pastoral_team_only">
                      Équipe pastorale uniquement
                    </option>
                  </select>
                </label>
              </div>

              <label className="label">
                Sujet de prière
                <textarea
                  className="textarea"
                  placeholder="Écrivez votre sujet de prière..."
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
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
                  checked={allowCallback}
                  onChange={(event) => setAllowCallback(event.target.checked)}
                />
                J’accepte d’être contacté par l’équipe pastorale si nécessaire.
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
                {isSaving ? "Envoi en cours..." : "Envoyer la demande"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}