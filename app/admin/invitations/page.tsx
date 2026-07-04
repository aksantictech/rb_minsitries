import AdminListPage from "../../../components/AdminListPage";

export default function AdminInvitationsPage() {
  return (
    <AdminListPage
      title="Invitations"
      subtitle="Analyser les invitations reçues des églises, ministères et organisations"
      table="invitations"
      selectColumns="id, organization_name, responsible_name, phone, email, city_country, event_type, requested_date, expected_attendance, theme, support_details, message, status, admin_notes, created_at"
      primaryField="organization_name"
      contentField="message"
      noteField="admin_notes"
      searchPlaceholder="Rechercher par organisation, responsable, ville ou thème..."
      fields={[
        { key: "responsible_name", label: "Responsable" },
        { key: "phone", label: "Téléphone" },
        { key: "email", label: "Email" },
        { key: "city_country", label: "Ville / Pays", type: "badge" },
        { key: "event_type", label: "Type d’événement", type: "badge" },
        { key: "requested_date", label: "Date souhaitée" },
        { key: "expected_attendance", label: "Participants estimés" },
        { key: "theme", label: "Thème" },
        { key: "support_details", label: "Prise en charge", type: "long" },
      ]}
      statusOptions={[
        { value: "pending", label: "En attente" },
        { value: "checking", label: "En analyse" },
        { value: "accepted", label: "Acceptée" },
        { value: "rejected", label: "Refusée" },
        { value: "treated", label: "Traitée" },
        { value: "archived", label: "Archivée" },
      ]}
    />
  );
}
