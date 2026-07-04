import Image from "next/image";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import PublicHeader from "../components/PublicHeader";
import HomeActionButtons from "../components/HomeActionButtons";
import LatestBookSection from "../components/LatestBookSection";
import HomeTestimoniesSection from "../components/HomeTestimoniesSection";
import HomeTeachingsSection from "../components/HomeTeachingsSection";
import NotificationPrompt from "../components/NotificationPrompt";
import HomePublicationsSection from "../components/HomePublicationsSection";

const socialLinks = [
  {
    label: "YouTube",
    href: "https://www.youtube.com/@RBMinistries",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/roybondofficiel/",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/roybondo/",
  },
];

const timeline = [
  "1988 — Premier contact avec le milieu des églises",
  "1998 — Reçoit Jésus-Christ comme Seigneur et Sauveur",
  "2003 — Arrivée à Kinshasa",
  "2007-2010 — Diacre",
  "2010-2013 — Président du conseil paroissial",
  "2016-2020 — Ancien",
  "2020 — Pasteur associé confirmé",
  "Aujourd’hui — Pasteur, entrepreneur chrétien, mentor et leader d’impact",
];

export default function HomePage() {
  return (
    <main className="page home-page">
      <PublicHeader />

      <section className="hero-section">
        <div className="container hero-layout">
          <div>
            <p
              style={{
                color: "#facc15",
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                fontWeight: 900,
                fontSize: 12,
                margin: 0,
              }}
            >
              Application officielle du ministère
            </p>

            <h1
              style={{
                fontSize: "clamp(42px, 6vw, 76px)",
                lineHeight: 0.95,
                margin: "18px 0",
                fontWeight: 900,
              }}
            >
              Roy Bondo <span className="gold-text">Ministries</span>
            </h1>

            <p
              style={{
                color: "#cbd5e1",
                fontSize: 18,
                lineHeight: 1.8,
                maxWidth: 760,
              }}
            >
              Plateforme d&apos;enseignements, prières, témoignages,
              rendez-vous, invitations, agenda et notifications spirituelles.
            </p>

            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                marginTop: 20,
                marginBottom: 26,
              }}
            >
              {socialLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  className="social-link"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div
              className="card"
              style={{
                padding: 22,
                marginTop: 10,
                borderColor: "rgba(250,204,21,0.2)",
                background:
                  "linear-gradient(135deg, rgba(250,204,21,0.08), rgba(15,23,42,0.84))",
              }}
            >
              <h2
                style={{
                  margin: "0 0 10px",
                  color: "#facc15",
                  fontSize: 22,
                }}
              >
                Pasteur Roy Bondo
              </h2>

              <p
                style={{
                  color: "#cbd5e1",
                  lineHeight: 1.8,
                  margin: 0,
                }}
              >
                Pasteur, entrepreneur chrétien, mentor et leader d’impact, Roy
                Bondo porte un ministère orienté vers l’enseignement biblique,
                la prière, l’accompagnement spirituel et l’édification du peuple
                de Dieu.
              </p>

              <Link
                href="/about"
                style={{
                  display: "inline-flex",
                  marginTop: 16,
                  color: "#facc15",
                  fontWeight: 900,
                  textDecoration: "none",
                }}
              >
                Lire la suite →
              </Link>
            </div>

            <HomeActionButtons />
          </div>

          <div
            className="card pastor-photo-card"
            style={{
              padding: 24,
              minHeight: 540,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: -100,
                background:
                  "radial-gradient(circle, rgba(250,204,21,0.16), transparent 58%)",
              }}
            />

            <div
              style={{
                position: "relative",
                zIndex: 2,
                borderRadius: 30,
                overflow: "hidden",
                border: "1px solid rgba(250,204,21,0.24)",
                background: "rgba(2,6,23,0.65)",
                minHeight: 410,
                display: "grid",
                placeItems: "end center",
              }}
            >
              <Image
                src="/images/past_roy_bondo.PNG"
                alt="Pasteur Roy Bondo"
                width={620}
                height={760}
                className="pastor-photo"
                priority
                style={{
                  width: "100%",
                  height: "auto",
                  maxHeight: 500,
                  objectFit: "contain",
                  objectPosition: "center bottom",
                }}
              />
            </div>

            <div
              style={{
                position: "relative",
                zIndex: 2,
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 12,
                marginTop: 16,
              }}
            >
              <MiniStat value="PWA" label="Installable" />
              <MiniStat value="24/7" label="Accessible" />
              <MiniStat value="100%" label="Ministère" />
            </div>
          </div>
        </div>
      </section>

<LatestBookSection />

<section className="section video-home-section" style={{ paddingTop: 0 }}>        <div className="container">
          <div
            className="card"
            style={{
              padding: 28,
              borderColor: "rgba(250,204,21,0.18)",
              marginBottom: 34,
            }}
          >

            <p
              style={{
                color: "#facc15",
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                fontWeight: 900,
                fontSize: 12,
                marginTop: 0,
              }}
            >
              Vidéo du ministère
            </p>

            <h2 style={{ margin: "0 0 18px", fontSize: 34 }}>
              Un message du Pasteur Roy Bondo
            </h2>

            <iframe
              className="video-frame"
              src="https://www.youtube.com/embed/o7Va6XqSTqQ?autoplay=1&mute=0&controls=1&rel=0&playsinline=1"
              title="Vidéo Pasteur Roy Bondo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />

            <p
              style={{
                color: "#94a3b8",
                fontSize: 13,
                lineHeight: 1.6,
                marginBottom: 0,
                marginTop: 12,
              }}
            >
              Certains navigateurs bloquent la lecture automatique avec son. Si
              le son ne démarre pas automatiquement, il suffit de cliquer sur la
              vidéo.
            </p>
          </div>
        </div>
      </section>
<NotificationPrompt />

<HomePublicationsSection />
      <HomeTestimoniesSection />

      <HomeTeachingsSection />

      <section className="section" style={{ paddingTop: 20 }}>
        <div
          className="container card"
          style={{
            padding: 34,
            display: "grid",
            gridTemplateColumns: "minmax(0, 0.9fr) minmax(0, 1.1fr)",
            gap: 30,
          }}
        >
          <div>
            <Sparkles color="#facc15" size={42} />
            <h2 style={{ fontSize: 38, margin: "18px 0 12px" }}>
              Parcours pastoral & impact
            </h2>
            <p style={{ color: "#94a3b8", lineHeight: 1.8 }}>
              Le parcours du Pasteur Roy Bondo témoigne d’une marche de foi,
              d’un service progressif dans l’Église et d’un leadership chrétien
              orienté vers l’édification, le mentorat et l’impact.
            </p>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            {timeline.map((item) => (
              <div
                key={item}
                style={{
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(2,6,23,0.48)",
                  borderRadius: 16,
                  padding: 15,
                  color: "#cbd5e1",
                  fontWeight: 700,
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 18,
        padding: 16,
        background: "rgba(2,6,23,0.55)",
      }}
    >
      <strong style={{ display: "block", color: "#facc15", fontSize: 22 }}>
        {value}
      </strong>
      <span style={{ color: "#94a3b8", fontSize: 13 }}>{label}</span>
    </div>
  );
}
