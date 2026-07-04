import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "../../../../lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const endpoint = body.endpoint as string | undefined;
    const p256dh = body.keys?.p256dh as string | undefined;
    const auth = body.keys?.auth as string | undefined;

    if (!endpoint || !p256dh || !auth) {
      return NextResponse.json({ error: "Abonnement push invalide." }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { error } = await supabase.from("push_subscriptions").upsert(
      {
        endpoint,
        p256dh,
        auth,
        user_agent: body.userAgent || null,
        full_name: body.fullName || null,
        phone: body.phone || null,
        email: body.email || null,
        is_active: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "endpoint" }
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur serveur." },
      { status: 500 }
    );
  }
}
