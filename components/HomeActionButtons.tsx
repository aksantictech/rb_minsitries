"use client";

import Link from "next/link";
import { HandHeart, MessageCircleHeart, Send, PlayCircle } from "lucide-react";
import { useLanguage } from "./LanguageProvider";

export default function HomeActionButtons() {
  const { t } = useLanguage();

  return (
    <div className="home-action-buttons">
      <Link href="/prayer" className="btn btn-primary">
        <HandHeart size={20} />
        {t("prayer")}
      </Link>

      <Link href="/teachings" className="btn btn-secondary">
        <PlayCircle size={20} />
        {t("teachings")}
      </Link>

      <Link href="/testimony" className="btn btn-secondary">
        <MessageCircleHeart size={20} />
        {t("shareTestimony")}
      </Link>

      <Link href="/invitation" className="btn btn-secondary">
        <Send size={20} />
        {t("invitePastor")}
      </Link>

      <Link href="/encouragement" className="btn btn-secondary">
        <HandHeart size={20} />
        {t("encouragement")}
      </Link>
    </div>
  );
}
