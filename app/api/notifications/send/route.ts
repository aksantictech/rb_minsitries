import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

type PushRow = {
  id?: string;
  endpoint?: string | null;
  p256dh?: string | null;
  auth?: string | null;
  subscription?: {
    endpoint: string;
    keys: { p256dh: string; auth: string };
  } | null;
};

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error("Missing Supabase admin environment variables.");
  }

  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
}

function configureWebPush() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:contact@rbministries.app";

  if (!publicKey || !privateKey) {
    throw new Error("Missing VAPID keys.");
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
}

function normalizeSubscription(row: PushRow) {
  if (row.subscription?.endpoint && row.subscription?.keys) {
    return row.subscription;
  }

  if (row.endpoint && row.p256dh && row.auth) {
    return {
      endpoint: row.endpoint,
      keys: {
        p256dh: row.p256dh,
        auth: row.auth,
      },
    };
  }

  return null;
}

export async function POST(request: Request) {
  try {
    configureWebPush();
    const supabase = getAdminClient();
    const body = await request.json().catch(() => ({}));

    let payload = {
      title: body.title || "Roy Bondo Ministries",
      body: body.body || body.message || "Nouvelle publication du ministère.",
      icon: "/images/logo_rb.png",
      badge: "/images/logo_rb.png",
      image: body.image || body.image_url || undefined,
      url: body.url || "/",
      publicationId: body.publicationId || body.publication_id || null,
    };

    const publicationId = body.publicationId || body.publication_id;

    if (publicationId) {
      const { data: publication } = await supabase
        .from("ministry_publications")
        .select("*")
        .eq("id", publicationId)
        .maybeSingle();

      if (publication) {
        payload = {
          title: publication.title || payload.title,
          body:
            publication.excerpt ||
            publication.content ||
            publication.message ||
            publication.description ||
            payload.body,
          icon: "/images/logo_rb.png",
          badge: "/images/logo_rb.png",
          image: publication.image_url || publication.cover_url || payload.image,
          url: `/publications/${publication.id}`,
          publicationId: publication.id,
        };
      }
    }

    const { data: subscriptions, error } = await supabase
      .from("push_subscriptions")
      .select("*");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const rows = (subscriptions || []) as PushRow[];
    let sent = 0;
    let failed = 0;

    await Promise.all(
      rows.map(async (row) => {
        const subscription = normalizeSubscription(row);
        if (!subscription) return;

        try {
          await webpush.sendNotification(subscription, JSON.stringify(payload));
          sent += 1;
        } catch {
          failed += 1;
        }
      })
    );

    await supabase.from("notification_logs").insert({
      title: payload.title,
      body: payload.body,
      target_url: payload.url,
      publication_id: payload.publicationId,
      sent_count: sent,
      failed_count: failed,
    });

    return NextResponse.json({ ok: true, sent, failed, url: payload.url });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
