import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";
import { createAdminClient } from "../../../../lib/supabase/admin";

type LanguageCode = "fr" | "ln" | "sw" | "en" | "es";

type SubscriptionRow = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  language_code: LanguageCode | null;
};

type PublicationRow = {
  id: string;
  title: string;
  content: string;
  action_url: string | null;
};

type TranslationRow = {
  source_id: string;
  language_code: LanguageCode;
  title: string | null;
  body: string | null;
};

function configureWebPush() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:contact@rbministries.app";

  if (!publicKey || !privateKey) {
    throw new Error("VAPID keys are missing.");
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
}

async function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) return false;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) return false;

  const supabase = createClient(supabaseUrl, anonKey);
  const { data, error } = await supabase.auth.getUser(token);

  return !error && Boolean(data.user);
}

function truncate(value: string, length = 150) {
  return value.length > length ? `${value.slice(0, length)}...` : value;
}

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await verifyAdmin(request);

    if (!isAdmin) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }

    configureWebPush();

    const body = await request.json();
    const publicationId = body.publicationId as string | undefined;

    if (!publicationId) {
      return NextResponse.json({ error: "publicationId manquant." }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: publication, error: publicationError } = await supabase
      .from("ministry_publications")
      .select("id, title, content, action_url")
      .eq("id", publicationId)
      .single();

    if (publicationError || !publication) {
      return NextResponse.json(
        { error: publicationError?.message || "Publication introuvable." },
        { status: 404 }
      );
    }

    const sourcePublication = publication as PublicationRow;

    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth, language_code")
      .eq("is_active", true);

    if (subscriptionsError) {
      return NextResponse.json({ error: subscriptionsError.message }, { status: 500 });
    }

    const activeSubscriptions = (subscriptions || []) as SubscriptionRow[];

    const { data: translationData } = await supabase
      .from("content_translations")
      .select("source_id, language_code, title, body")
      .eq("source_table", "ministry_publications")
      .eq("source_id", sourcePublication.id);

    const translationByLanguage = new Map<LanguageCode, TranslationRow>();

    ((translationData || []) as TranslationRow[]).forEach((translation) => {
      translationByLanguage.set(translation.language_code, translation);
    });

    let successCount = 0;
    let failureCount = 0;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
    const publicationUrl = `${siteUrl}/publications/${sourcePublication.id}`;

    await Promise.all(
      activeSubscriptions.map(async (subscription) => {
        const language = subscription.language_code || "fr";
        const translation = translationByLanguage.get(language);
        const title = translation?.title || sourcePublication.title;
        const content = translation?.body || sourcePublication.content;

        const payload = JSON.stringify({
          title,
          body: truncate(content),
          url: publicationUrl,
        });

        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth,
              },
            },
            payload
          );
          successCount += 1;
        } catch {
          failureCount += 1;
          await supabase
            .from("push_subscriptions")
            .update({ is_active: false, updated_at: new Date().toISOString() })
            .eq("id", subscription.id);
        }
      })
    );

    await supabase.from("notification_logs").insert({
      publication_id: sourcePublication.id,
      title: sourcePublication.title,
      body: sourcePublication.content,
      language_code: "multi",
      target_count: activeSubscriptions.length,
      success_count: successCount,
      failure_count: failureCount,
    });

    return NextResponse.json({
      ok: true,
      targetCount: activeSubscriptions.length,
      successCount,
      failureCount,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur serveur." },
      { status: 500 }
    );
  }
}
