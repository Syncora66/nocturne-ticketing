import { randomUUID } from "node:crypto";
import QRCode from "qrcode";
import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createResendClient } from "@/lib/resend";
import { ticketQrResendEmailHtml } from "@/lib/emails/ticketQrResend";

const SYSTEM_PROMPT = `Tu es un assistant de support client pour une plateforme de ticketing événementiel (Nocturne Ticketing). Tu aides les organisateurs à traiter les demandes de leurs acheteurs.

INSTRUCTIONS CLÉS:
1. Sois amical, direct, pas corporat.
2. Réponds en français (ou détecte la langue du client si le message est dans une autre langue).
3. Pour chaque demande, classe-la et rédige une réponse adaptée.

JAMAIS faire:
- Approuver un remboursement sans conditions claires.
- Promettre quelque chose de non autorisé.
- Donner de conseil financier.

Réponds en moins de 100 tokens, sauf si une explication plus longue est nécessaire.`;

const CLASSIFY_TOOL: Anthropic.Tool = {
  name: "classify_and_respond",
  description:
    "Classe la demande de support et rédige la réponse à envoyer.",
  input_schema: {
    type: "object",
    properties: {
      decision: {
        type: "string",
        enum: ["autonomous", "propose", "escalade"],
        description:
          "autonomous: réponse factuelle certaine. propose: suggestion nécessitant validation de l'organisateur. escalade: complexe, risque de fraude, ou implique de l'argent.",
      },
      category: {
        type: "string",
        enum: [
          "info",
          "lost_ticket",
          "custom_question",
          "refund_valid",
          "refund_questionable",
          "refund_high_risk",
          "payment_issue",
          "fraud",
        ],
      },
      suggested_response: {
        type: "string",
        description: "La réponse à envoyer au client.",
      },
      reasoning: { type: "string" },
    },
    required: ["decision", "category", "suggested_response", "reasoning"],
  },
};

const CATEGORY_TO_ACTION: Record<string, string> = {
  info: "answered",
  lost_ticket: "resend_qr",
  custom_question: "propose",
  refund_valid: "pending_refund_review",
  refund_questionable: "pending_refund_review",
  refund_high_risk: "pending_refund_review",
  payment_issue: "diagnose_payment",
  fraud: "escalate",
};

const REFUND_MESSAGE =
  "Ta demande est transmise à l'équipe, tu auras une réponse sous 24-48h.";

// support_tickets.category has a DB check constraint allowing only
// 'general' | 'refund' | 'other' — much coarser than Claude's
// classification categories, so every write needs to go through this.
const CATEGORY_TO_DB_CATEGORY: Record<string, "general" | "refund" | "other"> = {
  info: "general",
  lost_ticket: "general",
  custom_question: "general",
  refund_valid: "refund",
  refund_questionable: "refund",
  refund_high_risk: "refund",
  payment_issue: "other",
  fraud: "other",
};

type SupabaseAdminClient = ReturnType<typeof createAdminClient>;

async function findTicketForResend(
  admin: SupabaseAdminClient,
  organizationId: string,
  buyerEmail: string
) {
  const { data: events } = await admin
    .from("events")
    .select("id, title")
    .eq("organization_id", organizationId);

  const eventIds = (events ?? []).map((e) => e.id);
  if (eventIds.length === 0) return null;

  const { data: tickets } = await admin
    .from("tickets")
    .select("id, event_id, buyer_name, buyer_email")
    .in("event_id", eventIds)
    .eq("buyer_email", buyerEmail)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(1);

  const ticket = tickets?.[0];
  if (!ticket) return null;

  const event = events?.find((e) => e.id === ticket.event_id);
  return { ...ticket, eventTitle: event?.title ?? "ton événement" };
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY manquant côté serveur." },
      { status: 500 }
    );
  }

  let body: { ticketId?: unknown; message?: unknown; customerEmail?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Corps de requête invalide." },
      { status: 400 }
    );
  }

  const { ticketId, message, customerEmail } = body;

  if (typeof message !== "string" || !message.trim()) {
    return NextResponse.json(
      { error: "Validation échouée.", fieldErrors: { message: "Le message est requis." } },
      { status: 400 }
    );
  }

  // Everything past this point uses the admin (service-role) client,
  // not the session one. Every read/write below is still explicitly
  // scoped to the already-authenticated user.id or an organization
  // that user.id was just confirmed to belong to — RLS isn't the
  // thing enforcing authorization here, this code is. That also means
  // it doesn't silently break if support_tickets/support_conversations/
  // organization_members' RLS policies haven't been applied yet on a
  // given environment (see supabase/migrations/0004 and 0005).
  const admin = createAdminClient();

  const { data: memberships } = await admin
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id);
  const memberOrgIds = new Set((memberships ?? []).map((m) => m.organization_id));

  // Resolve the support ticket: use the given one (verified to belong
  // to one of the caller's orgs) or create a fresh one under the
  // caller's org.
  let supportTicketId: string;
  let resolvedOrgId: string;
  let resolvedCustomerEmail: string;

  if (typeof ticketId === "string" && ticketId) {
    const { data: existing, error: fetchError } = await admin
      .from("support_tickets")
      .select("id, organization_id, customer_email")
      .eq("id", ticketId)
      .single();

    if (
      fetchError ||
      !existing ||
      !existing.organization_id ||
      !memberOrgIds.has(existing.organization_id)
    ) {
      return NextResponse.json(
        { error: "Ticket de support introuvable." },
        { status: 404 }
      );
    }
    supportTicketId = existing.id;
    resolvedOrgId = existing.organization_id;
    resolvedCustomerEmail = existing.customer_email;
  } else {
    const orgId = memberships?.[0]?.organization_id;

    if (!orgId) {
      return NextResponse.json(
        { error: "Aucune organisation trouvée pour cet utilisateur." },
        { status: 400 }
      );
    }

    const finalCustomerEmail =
      typeof customerEmail === "string" && customerEmail.trim()
        ? customerEmail.trim()
        : user.email ?? "inconnu@nocturne.app";

    const { data: created, error: createError } = await admin
      .from("support_tickets")
      .insert({
        organization_id: orgId,
        customer_email: finalCustomerEmail,
        customer_name: finalCustomerEmail.split("@")[0],
        subject: message.trim().slice(0, 100),
        description: message.trim(),
        category: "general",
        status: "open",
        ai_handled: false,
        escalated_to_human: false,
      })
      .select("id")
      .single();

    if (createError || !created) {
      return NextResponse.json(
        { error: "Impossible de créer le ticket de support." },
        { status: 500 }
      );
    }
    supportTicketId = created.id;
    resolvedOrgId = orgId;
    resolvedCustomerEmail = finalCustomerEmail;
  }

  const { error: insertUserMsgError } = await admin
    .from("support_conversations")
    .insert({
      support_ticket_id: supportTicketId,
      message: message.trim(),
      sender_type: "human",
      sender_id: user.id,
    });

  if (insertUserMsgError) {
    return NextResponse.json(
      { error: "Impossible d'enregistrer le message." },
      { status: 500 }
    );
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let classification: {
    decision: string;
    category: string;
    suggested_response: string;
    reasoning: string;
  };

  try {
    const aiResponse = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      tools: [CLASSIFY_TOOL],
      tool_choice: { type: "tool", name: "classify_and_respond" },
      messages: [{ role: "user", content: message.trim() }],
    });

    const toolUse = aiResponse.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
    );

    if (!toolUse) {
      throw new Error("Pas de réponse structurée de Claude.");
    }

    classification = toolUse.input as typeof classification;
  } catch {
    return NextResponse.json(
      { error: "Impossible de contacter Claude API." },
      { status: 502 }
    );
  }

  // support_tickets.status has a DB check constraint currently allowing
  // only 'open' | 'closed' | 'resolved' | 'in_progress'. Migration 0006
  // adds 'pending_refund_review' to that list — until it's run, the
  // refund branch below falls back to 'in_progress' instead of failing.
  type SafeStatus = "open" | "closed" | "resolved" | "in_progress";

  let finalResponse = classification.suggested_response;
  let action = CATEGORY_TO_ACTION[classification.category] ?? "answered";
  let aiHandled = classification.decision === "autonomous";
  let escalated = classification.decision === "escalade";
  let newStatus: SafeStatus = classification.decision === "escalade" ? "in_progress" : "resolved";
  let wantsPendingRefundReview = false;
  let priority: "low" | "normal" | "high" | "urgent" = "normal";

  // ============================================================
  // ACTION 1 — lost ticket: actually resend the QR code by email.
  // ============================================================
  if (classification.category === "lost_ticket") {
    const ticket = await findTicketForResend(admin, resolvedOrgId, resolvedCustomerEmail);

    if (ticket && process.env.RESEND_API_KEY) {
      const newQrCode = randomUUID();
      const { error: qrUpdateError } = await admin
        .from("tickets")
        .update({ qr_code: newQrCode })
        .eq("id", ticket.id);

      if (!qrUpdateError) {
        try {
          const qrPngBuffer = await QRCode.toBuffer(newQrCode, { width: 440 });
          const resend = createResendClient();
          await resend.emails.send({
            from: "Nocturne Ticketing <onboarding@resend.dev>",
            to: resolvedCustomerEmail,
            subject: `Ton billet — ${ticket.eventTitle}`,
            html: ticketQrResendEmailHtml({
              eventName: ticket.eventTitle,
              buyerName: ticket.buyer_name,
            }),
            attachments: [
              {
                filename: "ticket-qr.png",
                content: qrPngBuffer,
                inlineContentId: "ticket-qr",
              },
            ],
          });

          finalResponse = "C'est renvoyé, vérifie ta boîte mail !";
          action = "resend_qr";
          aiHandled = true;
          escalated = false;
          newStatus = "resolved";
        } catch {
          finalResponse =
            "J'ai retrouvé ton billet mais l'envoi de l'email a échoué — je transmets à l'organisateur.";
          action = "escalate";
          aiHandled = false;
          escalated = true;
          newStatus = "in_progress";
        }
      }
    } else if (!ticket) {
      finalResponse =
        "Je ne trouve pas de billet associé à cette adresse — je transmets à l'organisateur pour vérifier.";
      action = "escalate";
      aiHandled = false;
      escalated = true;
      newStatus = "in_progress";
    }
    // If a ticket was found but RESEND_API_KEY is missing, fall through
    // with the AI's original suggested_response/action — no crash,
    // just no actual email sent.
  }

  // ============================================================
  // ACTION 2 — refund request: never auto-approve, mark for manual
  // review instead (no Stripe integration to actually process one).
  // ============================================================
  if (classification.category.startsWith("refund_")) {
    finalResponse = REFUND_MESSAGE;
    action = "pending_refund_review";
    aiHandled = false;
    escalated = true;
    newStatus = "in_progress";
    wantsPendingRefundReview = true;
    priority = "high";
  }

  await admin.from("support_conversations").insert({
    support_ticket_id: supportTicketId,
    message: finalResponse,
    sender_type: "ai",
    sender_id: null,
  });

  await admin
    .from("support_tickets")
    .update({
      category: CATEGORY_TO_DB_CATEGORY[classification.category] ?? "general",
      ai_handled: aiHandled,
      ai_solution: finalResponse,
      escalated_to_human: escalated,
      status: newStatus,
    })
    .eq("id", supportTicketId);

  // Separate, best-effort update: `priority` and the
  // 'pending_refund_review' status value were both added in migration
  // 0006 — if that hasn't been run yet in a given environment, this
  // fails silently instead of taking down the whole request, leaving
  // the ticket at status='in_progress' set above.
  if (priority !== "normal" || wantsPendingRefundReview) {
    await admin
      .from("support_tickets")
      .update({
        priority,
        ...(wantsPendingRefundReview ? { status: "pending_refund_review" } : {}),
      })
      .eq("id", supportTicketId);
  }

  return NextResponse.json({
    ticketId: supportTicketId,
    response: finalResponse,
    action,
  });
}
