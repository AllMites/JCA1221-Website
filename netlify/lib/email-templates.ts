import type { ContactFormData } from '../../product/sections/contact-and-partnerships/types'

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

/** Notification email sent to the JCA team when someone submits. */
export function notificationEmail(data: ContactFormData) {
  const detail = (label: string, value?: string | null) =>
    value ? `<tr><td style="padding:6px 12px;font-weight:600;color:#334155;white-space:nowrap">${label}</td><td style="padding:6px 12px;color:#475569">${esc(value)}</td></tr>` : ''

  return {
    subject: `New Contact Form Inquiry — ${esc(data.fullName)}`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto">
        <div style="background:#1e293b;padding:24px;border-radius:12px 12px 0 0">
          <h1 style="color:#fff;margin:0;font-size:18px;font-weight:600">New Contact Form Inquiry</h1>
        </div>
        <div style="background:#fff;border:1px solid #e2e8f0;border-radius:0 0 12px 12px;padding:24px">
          <table style="width:100%;border-collapse:collapse">
            ${detail('Name', data.fullName)}
            ${detail('Email', data.email)}
            ${detail('Organization', data.organization)}
            ${detail('Phone', data.phone)}
            ${detail('Role', data.role)}
            ${detail('Project Type', data.projectType)}
            ${detail('Timeline', data.estimatedTimeline)}
          </table>
          <div style="margin-top:16px;padding:16px;background:#f8fafc;border-radius:8px">
            <p style="margin:0 0 6px;font-weight:600;color:#334155;font-size:14px">Message:</p>
            <p style="margin:0;color:#475569;font-size:14px;line-height:1.6;white-space:pre-wrap">${esc(data.message)}</p>
          </div>
        </div>
      </div>`,
    text: `New inquiry from ${data.fullName} (${data.email}, ${data.organization})\n\nMessage:\n${data.message}`,
  }
}

/** Auto-responder sent to the person who submitted the form. */
export function autoResponderEmail(name: string) {
  return {
    subject: `Thank You for Contacting JCA 1221 Holdings — ${esc(name)}`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto">
        <div style="background:#1e293b;padding:24px;border-radius:12px 12px 0 0">
          <h1 style="color:#fff;margin:0;font-size:18px;font-weight:600">JCA 1221 Holdings</h1>
        </div>
        <div style="background:#fff;border:1px solid #e2e8f0;border-radius:0 0 12px 12px;padding:24px">
          <p style="color:#334155;font-size:16px;line-height:1.6">Hi ${esc(name)},</p>
          <p style="color:#475569;font-size:15px;line-height:1.6">
            Thank you for reaching out to JCA 1221 Holdings. We've received your inquiry and our team will review it shortly.
          </p>
          <p style="color:#475569;font-size:15px;line-height:1.6">
            We typically respond within <strong>2 business days</strong>. If your inquiry is urgent, feel free to follow up with our Partnerships team directly.
          </p>
          <div style="margin-top:24px;padding:16px;background:#f8fafc;border-radius:8px;font-size:13px;color:#64748b">
            <p style="margin:0 0 6px;font-weight:600;color:#334155">JCA 1221 Holdings Inc.</p>
            <p style="margin:0">Unit 2808, 28th Floor, The Peak Tower<br/>107 Leviste Street, Salcedo Village<br/>Makati City, Metro Manila 1227, Philippines</p>
          </div>
        </div>
      </div>`,
    text: `Hi ${esc(name)},\n\nThank you for reaching out to JCA 1221 Holdings. We've received your inquiry and our team will review it shortly.\n\nWe typically respond within 2 business days.\n\n— JCA 1221 Holdings`,
  }
}
