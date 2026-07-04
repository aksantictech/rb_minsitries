"use client";

import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, ArrowLeft, KeyRound } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/browser";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleLogin() {
    setErrorMessage("");
    setSuccessMessage("");

    if (!email.trim()) {
      setErrorMessage("Veuillez indiquer l’email admin.");
      return;
    }

    if (!password.trim()) {
      setErrorMessage("Veuillez indiquer le mot de passe.");
      return;
    }

    setIsLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    if (!data.user) {
      setErrorMessage("Connexion refusée. Aucun utilisateur retourné.");
      return;
    }

    router.replace("/admin");
    router.refresh();
  }

  async function handleForgotPassword() {
    setErrorMessage("");
    setSuccessMessage("");

    if (!email.trim()) {
      setErrorMessage(
        "Veuillez d’abord renseigner votre email pour recevoir le lien de réinitialisation."
      );
      return;
    }

    setIsSendingReset(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/login`,
    });

    setIsSendingReset(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSuccessMessage(
      "Un lien de réinitialisation a été envoyé à votre adresse email."
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background:
          "radial-gradient(circle at top, rgba(217,164,65,0.16), transparent 34%), linear-gradient(135deg, #05070d, #020617)",
        color: "var(--text)",
      }}
    >
      <section
        className="card rb-gold-glow"
        style={{
          width: "min(520px, 100%)",
          padding: 34,
          textAlign: "center",
        }}
      >
        <div
          className="header-logo-frame"
          style={{
            width: 110,
            height: 92,
            margin: "0 auto 20px",
          }}
        >
          <Image
            src="/images/logo_rb.PNG"
            alt="RB Ministries"
            width={180}
            height={150}
            className="header-logo-img"
            priority
            style={{ width: 92, height: 76 }}
          />
        </div>

        <p
          style={{
            color: "var(--gold-bright)",
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            fontWeight: 900,
            fontSize: 12,
            margin: 0,
          }}
        >
          Espace ministère
        </p>

        <h1 style={{ fontSize: 36, margin: "12px 0 8px" }}>
          Connexion Admin
        </h1>

        <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
          Accès réservé à l’équipe de gestion de Roy Bondo Ministries.
        </p>

        {errorMessage ? (
          <div
            style={{
              border: "1px solid rgba(239,68,68,0.35)",
              background: "rgba(239,68,68,0.1)",
              color: "#fecaca",
              borderRadius: 16,
              padding: 14,
              marginBottom: 18,
              textAlign: "left",
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
              marginBottom: 18,
              textAlign: "left",
            }}
          >
            {successMessage}
          </div>
        ) : null}

        <form style={{ display: "grid", gap: 16, textAlign: "left" }}>
          <label className="label">
            Email admin
            <input
              className="input"
              type="email"
              placeholder="admin@rbministries.app"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label className="label">
            Mot de passe
            <div
              style={{
                position: "relative",
              }}
            >
              <input
                className="input"
                type={showPassword ? "text" : "password"}
                placeholder="Votre mot de passe"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                style={{ paddingRight: 52 }}
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={
                  showPassword
                    ? "Masquer le mot de passe"
                    : "Afficher le mot de passe"
                }
                style={{
                  position: "absolute",
                  right: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  color: "#6b7280",
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </label>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={isSendingReset}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                border: "none",
                background: "transparent",
                color: "var(--gold-bright)",
                fontWeight: 800,
                cursor: isSendingReset ? "not-allowed" : "pointer",
                opacity: isSendingReset ? 0.7 : 1,
                padding: 0,
              }}
            >
              <KeyRound size={16} />
              {isSendingReset ? "Envoi..." : "Mot de passe oublié ?"}
            </button>

            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                color: "var(--cream)",
                textDecoration: "none",
                fontWeight: 800,
              }}
            >
              <ArrowLeft size={16} />
              Retour à la page publique
            </Link>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleLogin}
            disabled={isLoading}
            style={{
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.75 : 1,
            }}
          >
            {isLoading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </section>
    </main>
  );
}