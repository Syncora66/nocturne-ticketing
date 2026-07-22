export function ticketQrResendEmailHtml({
  eventName,
  buyerName,
}: {
  eventName: string;
  buyerName: string | null;
}) {
  return `
<div style="background:#0A0A0A;padding:40px 20px;font-family:sans-serif;">
  <div style="max-width:480px;margin:0 auto;background:#1A1A1A;border-radius:8px;padding:32px;">
    <p style="color:#F5F5F5;font-size:20px;font-weight:800;margin:0 0 16px;">
      Nocturne Ticketing
    </p>
    <p style="color:#CCCCCC;font-size:15px;line-height:1.6;margin:0 0 24px;">
      Salut${buyerName ? ` ${buyerName}` : ""},<br /><br />
      Voici ton billet pour <strong style="color:#F5F5F5;">${eventName}</strong>.
      Le QR code ci-dessous est ton nouveau billet — l'ancien n'est plus valide.
    </p>
    <div style="text-align:center;margin:24px 0;">
      <img src="cid:ticket-qr" alt="QR code du billet" width="220" height="220" style="border-radius:8px;" />
    </div>
    <p style="color:#666666;font-size:12px;line-height:1.6;margin:24px 0 0;">
      Présente ce QR code à l'entrée. Une question ? Réponds directement à cet email.
    </p>
  </div>
</div>`;
}
