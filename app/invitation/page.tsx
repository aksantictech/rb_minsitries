import Link from "next/link";
import PublicHeader from "../../components/PublicHeader";

export default function InvitationPage() {
  return (
    <main className="page">
      <PublicHeader />

      <section className="section">
        <div className="container">
          <h1 style={{ fontSize: 52 }}>
            Inviter le <span className="gold-text">Pasteur Roy</span>
          </h1>

          <p style={{ color: "#cbd5e1", lineHeight: 1.8, maxWidth: 820 }}>
            Avant d’envoyer une invitation, vous pouvez consulter l’agenda public
            pour voir les disponibilités générales.
          </p>

          <Link href="/agenda" className="btn btn-secondary" style={{ marginBottom: 28 }}>
            Voir l’agenda public
          </Link>

          <div className="card" style={{ padding: 30, maxWidth: 940 }}>
            <form style={{ display: "grid", gap: 18 }}>
              <div className="grid-2">
                <label className="label">
                  Organisation / Église
                  <input className="input" placeholder="Nom de l’organisation" />
                </label>

                <label className="label">
                  Responsable
                  <input className="input" placeholder="Nom du responsable" />
                </label>
              </div>

              <div className="grid-2">
                <label className="label">
                  Ville / Pays
                  <input className="input" placeholder="Kinshasa, RDC..." />
                </label>

                <label className="label">
                  Type d’événement
                  <select className="select">
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

              <label className="label">
                Date souhaitée
                <input type="date" className="input" />
              </label>

              <label className="label">
                Thème proposé
                <input className="input" placeholder="Thème de la conférence" />
              </label>

              <label className="label">
                Message / détails
                <textarea
                  className="textarea"
                  placeholder="Présentez l’événement, le contexte et les attentes..."
                />
              </label>

              <button type="button" className="btn btn-primary">
                Envoyer l’invitation
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}