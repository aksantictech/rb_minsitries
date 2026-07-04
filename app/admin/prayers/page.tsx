import AdminListPage from "../../../components/AdminListPage";

export default function AdminPrayersPage() {
  return (
    <AdminListPage
      title="Demandes de prière"
      subtitle="Lire, prioriser et suivre les sujets de prière reçus par le ministère"
      table="prayer_requests"
      selectColumns="id, full_name, phone, email, category, subject, confidentiality, allow_callback, status, priority, admin_notes, created_at"
      primaryField="full_name"
      contentField="subject"
      noteField="admin_notes"
      searchPlaceholder="Rechercher par nom, téléphone, catégorie ou sujet..."
      fields={[
        { key: "phone", label: "Téléphone" },
        { key: "email", label: "Email" },
        { key: "category", label: "Catégorie", type: "badge" },
        { key: "confidentiality", label: "Confidentialité", type: "badge" },
        { key: "priority", label: "Priorité", type: "badge" },
        { key: "allow_callback", label: "Peut être contacté", type: "boolean" },
      ]}
      statusOptions={[
        { value: "new", label: "Nouvelle" },
        { value: "in_progress", label: "En prière / suivi" },
        { value: "treated", label: "Traitée" },
        { value: "archived", label: "Archivée" },
      ]}
    />
  );
}
