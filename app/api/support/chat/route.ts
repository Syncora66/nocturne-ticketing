import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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
  refund_valid: "refund",
  refund_questionable: "escalate",
  refund_high_risk: "escalate",
  payment_issue: "diagnose_payment",
  fraud: "escalate",
};

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

  let body: { ticketId?: unknown; message?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Corps de requête invalide." },
      { status: 400 }
    );
  }

  const { ticketId, message } = body;

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

  // Resolve the support ticket: use the given one (verified to belong
  // to one of the caller's orgs) or create a fresh one under the
  // caller's org.
  let supportTicketId: string;

  const { data: memberships } = await admin
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id);
  const memberOrgIds = new Set((memberships ?? []).map((m) => m.organization_id));

  if (typeof ticketId === "string" && ticketId) {
    const { data: existing, error: fetchError } = await admin
      .from("support_tickets")
      .select("id, organization_id")
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
  } else {
    const orgId = memberships?.[0]?.organization_id;

    if (!orgId) {
      return NextResponse.json(
        { error: "Aucune organisation trouvée pour cet utilisateur." },
        { status: 400 }
      );
    }

    const { data: created, error: createError } = await admin
      .from("support_tickets")
      .insert({
        organization_id: orgId,
        customer_email: user.email ?? "inconnu@nocturne.app",
        customer_name: user.email?.split("@")[0] ?? "Organisateur",
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

  await admin.from("support_conversations").insert({
    support_ticket_id: supportTicketId,
    message: classification.suggested_response,
    sender_type: "ai",
    sender_id: null,
  });

  await admin
    .from("support_tickets")
    .update({
      category: classification.category,
      ai_handled: classification.decision === "autonomous",
      ai_solution: classification.suggested_response,
      escalated_to_human: classification.decision === "escalade",
      status: classification.decision === "escalade" ? "escalated" : "answered",
    })
    .eq("id", supportTicketId);

  const action =
    classification.decision === "escalade"
      ? "escalate"
      : CATEGORY_TO_ACTION[classification.category] ?? "answered";

  return NextResponse.json({
    ticketId: supportTicketId,
    response: classification.suggested_response,
    action,
  });
}
