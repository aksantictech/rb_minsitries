import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { createAdminClient } from "../../../../lib/supabase/admin";

function configureWebPush() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:contact@rbministries.app";

  if (!publicKey || !privateKey) {
    throw new Error("VAPID keys are missing.");
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
}

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");

  if (cronSecret && authorization !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  try {
    configureWebPush();
    const supabase = createAdminClient();
    const now = new Date().toISOString();

    const { data: publications, error } = await supabase
      .from("ministry_publications")
      .select("id, title, content, action_url, notify_on_publish")
      .eq("status", "scheduled")
      .eq("is_public", true)
      .lte("scheduled_at", now);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: subscriptions } = await supabase
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth")
      .eq("is_active", true);

    for (const publication of publications || []) {
      await supabase
        .from("ministry_publications")
        .update({
          status: "published",
          published_at: now,
          updated_at: now,
        })
        .eq("id", publication.id);

      if (!publication.notify_on_publish) continue;

      let successCount = 0;
      let failureCount = 0;
      const payload = JSON.stringify({
        title: publication.title,
        body:
          publication.content.length > 150
            ? `${publication.content.slice(0, 150)}...`
            : publication.content,
        url: publication.action_url || "/",
      });

      await Promise.all(
        (subscriptions || []).map(async (subscription) => {
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
              .update({ is_active: false, updated_at: now })
              .eq("id", subscription.id);
          }
        })
      );

      await supabase.from("notification_logs").insert({
        publication_id: publication.id,
        title: publication.title,
        body: publication.content,
        target_count: subscriptions?.length || 0,
        success_count: successCount,
        failure_count: failureCount,
      });
    }

    return NextResponse.json({ ok: true, publishedCount: publications?.length || 0 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur serveur." },
      { status: 500 }
    );
  }
}
