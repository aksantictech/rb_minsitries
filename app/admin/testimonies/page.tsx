import AdminListPage from "../../../components/AdminListPage";

export default function AdminTestimoniesPage() {
  return (
    <AdminListPage
      title="Témoignages"
      subtitle="Vérifier, publier ou archiver les témoignages reçus"
      table="testimonies"
      selectColumns="id, full_name, phone, email, city_country, testimony, can_publish, status, admin_notes, published_at, created_at"
      primaryField="full_name"
      contentField="testimony"
      noteField="admin_notes"
      searchPlaceholder="Rechercher par nom, ville, téléphone ou témoignage..."
      fields={[
        { key: "phone", label: "Téléphone" },
        { key: "email", label: "Email" },
        { key: "city_country", label: "Ville / Pays", type: "badge" },
        { key: "can_publish", label: "Autorisation publication", type: "boolean" },
        { key: "published_at", label: "Date publication", type: "date" },
      ]}
      statusOptions={[
        { value: "new", label: "Nouveau" },
        { value: "checking", label: "En vérification" },
        { value: "published", label: "Publié" },
        { value: "rejected", label: "Rejeté" },
        { value: "archived", label: "Archivé" },
      ]}
    />
  );
}
