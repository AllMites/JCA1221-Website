import sgMail from '@sendgrid/mail'

const apiKey = process.env.SENDGRID_API_KEY ?? ''
const fromEmail = process.env.FROM_EMAIL ?? 'noreply@jca1221.com'

if (apiKey) {
  sgMail.setApiKey(apiKey)
}

export interface EmailPayload {
  to: string
  subject: string
  text: string
  html: string
}

/** Send a single email via SendGrid. Returns true on success. */
export async function sendMail(payload: EmailPayload): Promise<boolean> {
  if (!apiKey) {
    console.warn('[send-email] SENDGRID_API_KEY not set — email skipped')
    return false
  }
  try {
    await sgMail.send({
      to: payload.to,
      from: { email: fromEmail, name: 'JCA 1221 Holdings' },
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
    })
    return true
  } catch (err) {
    console.error('[send-email] SendGrid error:', err)
    return false
  }
}
