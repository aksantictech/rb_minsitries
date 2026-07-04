import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
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

    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth")
      .eq("is_active", true);

    if (subscriptionsError) {
      return NextResponse.json({ error: subscriptionsError.message }, { status: 500 });
    }

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
            .update({ is_active: false, updated_at: new Date().toISOString() })
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

    return NextResponse.json({
      ok: true,
      targetCount: subscriptions?.length || 0,
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
