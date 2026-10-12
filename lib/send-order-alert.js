export async function sendOrderAlert(subject, message) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Dad Standard Co Alerts <alerts@dadstandardco.com>",
      to: ["rwoods1835@gmail.com"],
      subject,
      text: message,
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend email failed: HTTP ${response.status}`);
  }

  const result = await response.json();
  return result.id;
}
