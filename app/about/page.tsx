import Image from "next/image";
import PublicHeader from "../../components/PublicHeader";

const timeline = [
  {
    year: "1988",
    text: "Début du contact avec le milieu des églises.",
  },
  {
    year: "1998",
    text: "Reçoit Jésus-Christ comme Seigneur et Sauveur à l’église évangélique de la Grâce de Lubumbashi.",
  },
  {
    year: "2003",
    text: "Arrivée à Kinshasa et intégration progressive dans la vie ecclésiale.",
  },
  {
    year: "2007-2010",
    text: "Service comme Diacre.",
  },
  {
    year: "2010-2013",
    text: "Président du conseil paroissial.",
  },
  {
    year: "2016-2020",
    text: "Service comme Ancien.",
  },
  {
    year: "2020",
    text: "Choisi comme pasteur associé et confirmé le 01 novembre 2020.",
  },
];

export default function AboutPage() {
  return (
    <main className="page">
      <PublicHeader />

      <section className="section">
        <div className="container">
          <p
            style={{
              color: "#facc15",
              letterSpacing: "0.26em",
              textTransform: "uppercase",
              fontWeight: 900,
              fontSize: 12,
            }}
          >
            À propos du Pasteur
          </p>

          <h1 style={{ fontSize: 54, margin: "12px 0 28px" }}>
            Pasteur <span className="gold-text">Roy Bondo</span>
          </h1>

          <div className="about-photo-layout">
            <div
              className="card pastor-photo-card"
              style={{
                padding: 22,
                minHeight: 520,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: -80,
                  background:
                    "radial-gradient(circle, rgba(250,204,21,0.16), transparent 58%)",
                }}
              />

              <div
                style={{
                  position: "relative",
                  zIndex: 2,
                  borderRadius: 28,
                  overflow: "hidden",
                  border: "1px solid rgba(250,204,21,0.24)",
                  background: "rgba(2,6,23,0.65)",
                  minHeight: 450,
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
                    maxHeight: 520,
                    objectFit: "contain",
                    objectPosition: "center bottom",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gap: 24 }}>
              <div className="card" style={{ padding: 30 }}>
                <h2 style={{ marginTop: 0 }}>Présentation</h2>

                <p style={{ color: "#cbd5e1", lineHeight: 1.8 }}>
                  Ancien fervent musulman, Roy Bondo reçoit Jésus-Christ comme
                  Seigneur et Sauveur en 1998. Depuis, son parcours est marqué
                  par le service, la fidélité, l’enseignement biblique, le
                  leadership chrétien et l’accompagnement spirituel.
                </p>

                <p style={{ color: "#cbd5e1", lineHeight: 1.8 }}>
                  Il est également cadre d’entreprise avec plus de 20 ans
                  d’expérience en finance, fiscalité, ressources humaines,
                  administration et mandataire en mines. Il est entrepreneur
                  chrétien et PDG de Maajabu Holding.
                </p>

                <p style={{ color: "#cbd5e1", lineHeight: 1.8 }}>
                  Marié à Madame Mariam Kiboko depuis plus de 18 ans, il est
                  père de 4 enfants.
                </p>
              </div>

              <div className="card" style={{ padding: 30 }}>
                <h2 style={{ marginTop: 0, color: "#facc15" }}>
                  Ligne du temps
                </h2>

                <div style={{ display: "grid", gap: 14 }}>
                  {timeline.map((item) => (
                    <div
                      key={item.year}
                      style={{
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 18,
                        padding: 18,
                        background: "rgba(2,6,23,0.45)",
                      }}
                    >
                      <strong style={{ color: "#facc15", fontSize: 18 }}>
                        {item.year}
                      </strong>
                      <p style={{ margin: "8px 0 0", color: "#cbd5e1" }}>
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}