"use client";

import Link from "next/link";
import { useState } from "react";
import PublicHeader from "../../components/PublicHeader";
import { createClient } from "../../lib/supabase/browser";

export default function InvitationPage() {
  const supabase = createClient();

  const [organizationName, setOrganizationName] = useState("");
  const [responsibleName, setResponsibleName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [cityCountry, setCityCountry] = useState("");
  const [eventType, setEventType] = useState("Conférence");
  const [requestedDate, setRequestedDate] = useState("");
  const [expectedAttendance, setExpectedAttendance] = useState("");
  const [theme, setTheme] = useState("");
  const [supportDetails, setSupportDetails] = useState("");
  const [message, setMessage] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit() {
    setErrorMessage("");
    setSuccessMessage("");

    if (!organizationName.trim()) {
      setErrorMessage("Veuillez indiquer le nom de l’organisation ou de l’église.");
      return;
    }

    if (!responsibleName.trim()) {
      setErrorMessage("Veuillez indiquer le nom du responsable.");
      return;
    }

    if (!cityCountry.trim()) {
      setErrorMessage("Veuillez indiquer la ville et le pays.");
      return;
    }

    if (!message.trim()) {
      setErrorMessage("Veuillez écrire les détails de l’invitation.");
      return;
    }

    setIsSaving(true);

    const { error } = await supabase.from("invitations").insert({
      organization_name: organizationName,
      responsible_name: responsibleName,
      phone: phone || null,
      email: email || null,
      city_country: cityCountry,
      event_type: eventType,
      requested_date: requestedDate || null,
      expected_attendance: expectedAttendance ? Number(expectedAttendance) : null,
      theme: theme || null,
      support_details: supportDetails || null,
      message,
      status: "pending",
    });

    setIsSaving(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSuccessMessage(
      "Votre invitation a été envoyée avec succès. L’équipe du ministère l’analysera et vous contactera."
    );

    setOrganizationName("");
    setResponsibleName("");
    setPhone("");
    setEmail("");
    setCityCountry("");
    setEventType("Conférence");
    setRequestedDate("");
    setExpectedAttendance("");
    setTheme("");
    setSupportDetails("");
    setMessage("");
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
            Invitations ministérielles
          </p>

          <h1 style={{ fontSize: 52, margin: "10px 0 14px" }}>
            Inviter le <span className="gold-text">Pasteur Roy</span>
          </h1>

          <p
            style={{
              color: "var(--muted)",
              lineHeight: 1.8,
              maxWidth: 820,
              marginBottom: 22,
            }}
          >
            Églises, ministères, organisations et conférences peuvent envoyer
            une demande d’invitation officielle.
          </p>

          <Link href="/agenda" className="btn btn-secondary" style={{ marginBottom: 28 }}>
            Voir l’agenda public
          </Link>

          <div className="card rb-gold-glow" style={{ padding: 30, maxWidth: 980 }}>
            {errorMessage ? <AlertMessage type="error" text={errorMessage} /> : null}
            {successMessage ? (
              <AlertMessage type="success" text={successMessage} />
            ) : null}

            <form style={{ display: "grid", gap: 18 }}>
              <div className="grid-2">
                <label className="label">
                  Organisation / Église
                  <input
                    className="input"
                    placeholder="Nom de l’organisation"
                    value={organizationName}
                    onChange={(event) => setOrganizationName(event.target.value)}
                  />
                </label>

                <label className="label">
                  Responsable
                  <input
                    className="input"
                    placeholder="Nom du responsable"
                    value={responsibleName}
                    onChange={(event) => setResponsibleName(event.target.value)}
                  />
                </label>
              </div>

              <div className="grid-2">
                <label className="label">
                  Téléphone / WhatsApp
                  <input
                    className="input"
                    placeholder="+243..."
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                  />
                </label>

                <label className="label">
                  Email
                  <input
                    className="input"
                    type="email"
                    placeholder="contact@email.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </label>
              </div>

              <div className="grid-2">
                <label className="label">
                  Ville / Pays
                  <input
                    className="input"
                    placeholder="Kinshasa, RDC..."
                    value={cityCountry}
                    onChange={(event) => setCityCountry(event.target.value)}
                  />
                </label>

                <label className="label">
                  Type d’événement
                  <select
                    className="select"
                    value={eventType}
                    onChange={(event) => setEventType(event.target.value)}
                  >
                    <option>Conférence</option>
                    <option>Prédication</option>
                    <option>Séminaire</option>
                    <option>Culte spécial</option>
                    <option>Formation pastorale</option>
                    <option>Mentorat de leaders</option>
                    <option>Autre</option>
                  </select>
                </label>
              </div>

              <div className="grid-2">
                <label className="label">
                  Date souhaitée
                  <input
                    type="date"
                    className="input"
                    value={requestedDate}
                    onChange={(event) => setRequestedDate(event.target.value)}
                  />
                </label>

                <label className="label">
                  Nombre de participants estimé
                  <input
                    type="number"
                    min="0"
                    className="input"
                    placeholder="Ex : 500"
                    value={expectedAttendance}
                    onChange={(event) => setExpectedAttendance(event.target.value)}
                  />
                </label>
              </div>

              <label className="label">
                Thème proposé
                <input
                  className="input"
                  placeholder="Thème de la conférence"
                  value={theme}
                  onChange={(event) => setTheme(event.target.value)}
                />
              </label>

              <label className="label">
                Prise en charge prévue
                <textarea
                  className="textarea"
                  placeholder="Transport, hébergement, logistique, communication..."
                  value={supportDetails}
                  onChange={(event) => setSupportDetails(event.target.value)}
                />
              </label>

              <label className="label">
                Message / détails de l’invitation
                <textarea
                  className="textarea"
                  placeholder="Présentez l’événement, le contexte et les attentes..."
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                />
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
                {isSaving ? "Envoi en cours..." : "Envoyer l’invitation"}
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