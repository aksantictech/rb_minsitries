import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

export async function GET(request: Request) {
  const url = new URL(request.url);
  const secret = url.searchParams.get("secret") || request.headers.get("x-cron-secret");

  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getAdminClient();

  const { data: publications, error } = await supabase
    .from("ministry_publications")
    .select("*")
    .lte("scheduled_at", new Date().toISOString())
    .in("status", ["scheduled", "planned"]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || url.origin;

  for (const publication of publications || []) {
    await supabase
      .from("ministry_publications")
      .update({ status: "published", published_at: new Date().toISOString() })
      .eq("id", publication.id);

    if (publication.notify_subscribers || publication.send_notification) {
      await fetch(`${baseUrl}/api/notifications/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicationId: publication.id }),
      });
    }
  }

  return NextResponse.json({ ok: true, published: publications?.length || 0 });
}
