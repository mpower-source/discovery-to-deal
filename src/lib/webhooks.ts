export async function postToWebhook(
  url: string,
  leadId: string,
  additionalData?: Record<string, any>
): Promise<void> {
  if (!url) {
    throw new Error('Webhook URL is not configured');
  }

  const payload = {
    lead_id: leadId,
    ...additionalData,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Webhook request failed: ${response.status} ${response.statusText}`);
  }
}

export function getWebhookUrls() {
  return {
    leadMagnet: import.meta.env.VITE_N8N_WEBHOOK_LEAD_MAGNET || '',
    discoveryCall: import.meta.env.VITE_N8N_WEBHOOK_DISCOVERY_CALL || '',
    proposal: import.meta.env.VITE_N8N_WEBHOOK_PROPOSAL || '',
  };
}
