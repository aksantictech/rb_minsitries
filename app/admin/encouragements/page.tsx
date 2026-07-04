import AdminListPage from "../../../components/AdminListPage";

export default function AdminEncouragementsPage() {
  return (
    <AdminListPage
      title="Encouragements"
      subtitle="Lire les messages de bénédiction, gratitude et encouragement adressés au Pasteur Roy"
      table="encouragement_messages"
      selectColumns="id, full_name, phone, email, city_country, message_type, message, can_publish, status, admin_notes, created_at"
      primaryField="full_name"
      contentField="message"
      noteField="admin_notes"
      searchPlaceholder="Rechercher par nom, ville, type ou message..."
      fields={[
        { key: "phone", label: "Téléphone" },
        { key: "email", label: "Email" },
        { key: "city_country", label: "Ville / Pays", type: "badge" },
        { key: "message_type", label: "Type", type: "badge" },
        { key: "can_publish", label: "Autorisation publication", type: "boolean" },
      ]}
      statusOptions={[
        { value: "new", label: "Nouveau" },
        { value: "checking", label: "En lecture" },
        { value: "approved", label: "Validé" },
        { value: "published", label: "Publié" },
        { value: "archived", label: "Archivé" },
      ]}
    />
  );
}
