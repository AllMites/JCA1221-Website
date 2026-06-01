import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppShell } from '@/shell/components/AppShell'
import { LegalPageLayout } from '@/components/LegalPageLayout'
import { NAV_ITEMS } from '@/lib/navigation'

export function PrivacyPage() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Privacy Policy — JCA 1221 Holdings'
  }, [])

  const navItems = NAV_ITEMS.map((item) => ({
    ...item,
    isActive: location.pathname === item.href,
  }))

  return (
    <AppShell
      navigationItems={navItems}
      onNavigate={(href) => navigate(href)}
      onCtaClick={() => navigate('/contact')}
    >
      <LegalPageLayout
        title="Privacy Policy"
        lastUpdated="June 1, 2026"
      >
        <p>
          JCA 1221 Holdings Inc. ("JCA 1221," "we," "us," or "our") respects your
          privacy. This Privacy Policy explains how we collect, use, disclose, and
          safeguard your information when you visit our website or submit an inquiry
          through our contact form. This policy complies with the Philippine Data
          Privacy Act of 2012 (Republic Act No. 10173) and its implementing rules
          and regulations.
        </p>

        <h2>1. Information We Collect</h2>

        <h3>1.1 Information You Provide</h3>
        <p>
          When you fill out our contact form, we collect the information you
          voluntarily submit:
        </p>
        <ul>
          <li><strong>Required:</strong> Full name, email address, organization or LGU affiliation, and your message.</li>
          <li><strong>Optional:</strong> Phone number, your role, project type, and estimated timeline.</li>
        </ul>

        <h3>1.2 Information Collected Automatically</h3>
        <p>
          If you consent to analytics cookies, we collect:
        </p>
        <ul>
          <li>Pages visited and time spent on each page.</li>
          <li>Browser type, device type, and approximate geographic region.</li>
          <li>Referral source (how you arrived at our site).</li>
          <li>Button clicks and form interactions.</li>
        </ul>
        <p>
          This data is aggregated and does not identify you personally. We use
          it to understand which pages and projects visitors find most relevant.
        </p>

        <h2>2. How We Use Your Information</h2>
        <p>
          We use the information we collect for the following purposes:
        </p>
        <ul>
          <li>To respond to your partnership or project inquiry.</li>
          <li>To evaluate whether JCA 1221 can serve your community's environmental infrastructure needs.</li>
          <li>To improve our website and understand which content is most useful to visitors.</li>
          <li>To comply with legal obligations under Philippine law.</li>
        </ul>
        <p>
          We do <strong>not</strong> sell, rent, or trade your personal information
          to third parties. We do not use your data for automated decision-making
          or profiling.
        </p>

        <h2>3. Cookies</h2>
        <p>
          Our site uses cookies for two purposes:
        </p>
        <ul>
          <li><strong>Essential cookies:</strong> Remember your theme preference (light/dark mode) and your cookie consent choices. These cannot be disabled.</li>
          <li><strong>Analytics cookies:</strong> Help us understand site traffic and usage patterns. These are only set if you opt in via the cookie banner.</li>
        </ul>
        <p>
          You can change your cookie preferences at any time by clearing your
          browser's localStorage for this site and refreshing the page — the
          consent banner will reappear.
        </p>

        <h2>4. Data Storage and Security</h2>
        <p>
          Contact form submissions are transmitted over HTTPS and stored on
          secure servers. Access to form submissions is restricted to JCA 1221
          personnel who need the information to respond to your inquiry.
        </p>
        <p>
          We retain contact form submissions for a period of two (2) years
          following the conclusion of correspondence, or longer if required by
          Philippine law or ongoing partnership obligations.
        </p>

        <h2>5. Third-Party Services</h2>
        <p>
          We may use the following third-party services, each of which has its
          own privacy policy:
        </p>
        <ul>
          <li><strong>Google Fonts:</strong> Fonts loaded from fonts.googleapis.com. Google's privacy policy applies to those requests.</li>
          <li><strong>CDN (jsDelivr):</strong> JavaScript libraries loaded from cdn.jsdelivr.net for visual effects. jsDelivr's privacy policy applies.</li>
          <li><strong>Calendly:</strong> If you book a consultation call, you are redirected to Calendly's scheduling platform. Calendly's privacy policy applies to data you enter there.</li>
          <li><strong>Google Analytics (optional):</strong> If you consent to analytics cookies, Google Analytics processes anonymized usage data on our behalf.</li>
        </ul>

        <h2>6. Your Rights Under Philippine Law</h2>
        <p>
          Under the Data Privacy Act of 2012 (RA 10173), you have the right to:
        </p>
        <ul>
          <li>Be informed about how your personal data is processed.</li>
          <li>Access your personal data in our possession.</li>
          <li>Request correction of inaccurate or outdated data.</li>
          <li>Request deletion or blocking of your personal data.</li>
          <li>Withdraw consent to data processing at any time.</li>
          <li>File a complaint with the National Privacy Commission if you believe your rights have been violated.</li>
        </ul>
        <p>
          To exercise any of these rights, contact us at{' '}
          <a href="mailto:privacy@jca1221.com">privacy@jca1221.com</a> with the
          subject line "Data Privacy Request."
        </p>

        <h2>7. Children's Privacy</h2>
        <p>
          Our website is not directed at children under the age of 18. We do not
          knowingly collect personal information from minors. If you believe a
          minor has submitted information through our contact form, please contact
          us immediately.
        </p>

        <h2>8. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Material changes
          will be posted on this page with an updated "Last updated" date. We
          encourage you to review this policy periodically.
        </p>

        <h2>9. Contact</h2>
        <p>
          For questions about this Privacy Policy or to exercise your data
          privacy rights:
        </p>
        <ul>
          <li><strong>Data Protection Officer:</strong> Atty. Jehremiah Asis</li>
          <li><strong>Email:</strong> <a href="mailto:privacy@jca1221.com">privacy@jca1221.com</a></li>
          <li><strong>Phone:</strong> +63 2 8123 4567</li>
          <li><strong>Address:</strong> Unit 2808, 28th Floor, The Peak Tower, 107 Leviste Street, Salcedo Village, Makati City, Metro Manila 1227, Philippines</li>
        </ul>

        <p className="!mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500">
          This policy was drafted in compliance with Republic Act No. 10173 (Data
          Privacy Act of 2012), its implementing rules and regulations (IRR), and
          relevant issuances of the National Privacy Commission of the Philippines.
        </p>
      </LegalPageLayout>
    </AppShell>
  )
}
