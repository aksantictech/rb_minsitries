import AdminListPage from "../../../components/AdminListPage";

export default function AdminAppointmentsPage() {
  return (
    <AdminListPage
      title="Rendez-vous pastoraux"
      subtitle="Traiter les demandes d’accompagnement, conseil, mentorat et orientation"
      table="appointments"
      selectColumns="id, full_name, phone, email, appointment_type, meeting_format, requested_date, requested_time, urgency, reason, status, admin_response, created_at"
      primaryField="full_name"
      contentField="reason"
      noteField="admin_response"
      searchPlaceholder="Rechercher par nom, téléphone, type ou motif..."
      fields={[
        { key: "phone", label: "Téléphone" },
        { key: "email", label: "Email" },
        { key: "appointment_type", label: "Type", type: "badge" },
        { key: "meeting_format", label: "Format", type: "badge" },
        { key: "requested_date", label: "Date souhaitée" },
        { key: "requested_time", label: "Heure souhaitée" },
        { key: "urgency", label: "Urgence", type: "badge" },
      ]}
      statusOptions={[
        { value: "pending", label: "En attente" },
        { value: "accepted", label: "Accepté" },
        { value: "rescheduled", label: "À reprogrammer" },
        { value: "treated", label: "Traité" },
        { value: "cancelled", label: "Annulé" },
        { value: "archived", label: "Archivé" },
      ]}
    />
  );
}
