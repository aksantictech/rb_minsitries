import Link from "next/link";
import {
  HandHeart,
  HeartHandshake,
  MessageCircleHeart,
  PlayCircle,
  Send,
} from "lucide-react";

export default function HomeActionButtons() {
  return (
    <div
      style={{
        display: "flex",
        gap: 14,
        flexWrap: "wrap",
        marginTop: 28,
      }}
    >
      <Link href="/prayer" className="btn btn-primary">
        <HandHeart size={18} />
        Demander une prière
      </Link>

      <Link href="/teachings" className="btn btn-secondary">
        <PlayCircle size={18} />
        Voir les enseignements
      </Link>

      <Link href="/invitation" className="btn btn-secondary">
        <Send size={18} />
        Inviter le Pasteur
      </Link>

      <Link href="/testimony" className="btn btn-secondary">
        <MessageCircleHeart size={18} />
        Partager un témoignage
      </Link>

      <Link href="/encouragement" className="btn btn-secondary">
        <HeartHandshake size={18} />
        Encouragement
      </Link>
    </div>
  );
}
