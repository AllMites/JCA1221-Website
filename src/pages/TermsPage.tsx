import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppShell } from '@/shell/components/AppShell'
import { LegalPageLayout } from '@/components/LegalPageLayout'
import { NAV_ITEMS } from '@/lib/navigation'

export function TermsPage() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Terms of Service — JCA 1221 Holdings'
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
        title="Terms of Service"
        lastUpdated="June 1, 2026"
      >
        <p>
          These Terms of Service ("Terms") govern your use of the JCA 1221
          Holdings Inc. website (the "Site"). By accessing or using the Site,
          you agree to be bound by these Terms. If you do not agree, please
          discontinue use of the Site.
        </p>

        <h2>1. About JCA 1221 Holdings</h2>
        <p>
          JCA 1221 Holdings Inc. is a Philippine corporation engaged in
          environmental infrastructure development, including water reclamation,
          septage and sewage treatment, and solid waste management through
          public-private partnerships.
        </p>

        <h2>2. Use of the Site</h2>
        <p>
          You may use the Site for lawful purposes only. You agree not to:
        </p>
        <ul>
          <li>Submit false, misleading, or fraudulent information through our contact form.</li>
          <li>Use automated means (bots, scrapers, crawlers) to access or extract data from the Site without prior written permission.</li>
          <li>Attempt to interfere with the Site's operation, security, or accessibility.</li>
          <li>Use the Site in any way that violates applicable Philippine laws or regulations.</li>
        </ul>

        <h2>3. Intellectual Property</h2>
        <p>
          All content on this Site — including text, images, logos, graphics,
          project descriptions, and the JCA 1221 name and brand — is the
          intellectual property of JCA 1221 Holdings Inc. or its licensors and
          is protected by Philippine and international intellectual property laws.
        </p>
        <p>
          You may not reproduce, distribute, modify, or create derivative works
          from any Site content without our prior written consent. Partner logos
          displayed on the contact page are the property of their respective
          organizations and are used with permission.
        </p>

        <h2>4. No Professional Advice</h2>
        <p>
          The information on this Site is provided for general informational
          purposes only. Nothing on this Site constitutes legal, financial,
          engineering, or environmental consulting advice. You should consult
          qualified professionals for advice specific to your situation.
        </p>

        <h2>5. Contact Form Submissions</h2>
        <p>
          By submitting our contact form, you represent that:
        </p>
        <ul>
          <li>The information you provide is accurate and complete.</li>
          <li>You are authorized to represent the organization or LGU you name.</li>
          <li>You consent to being contacted by JCA 1221 regarding your inquiry.</li>
        </ul>
        <p>
          Submission of a contact form does not create a business relationship,
          partnership, or contractual obligation. JCA 1221 reserves the right
          to decline any inquiry at its sole discretion.
        </p>

        <h2>6. Third-Party Links</h2>
        <p>
          The Site may contain links to third-party websites (e.g., Google Maps for location). We do not control these sites and
          are not responsible for their content or practices. Access them at your
          own risk.
        </p>

        <h2>7. Disclaimer of Warranties</h2>
        <p>
          The Site is provided on an "as is" and "as available" basis. JCA 1221
          makes no warranties, express or implied, regarding the Site's
          availability, accuracy, completeness, or fitness for a particular
          purpose. We do not guarantee that the Site will be error-free or
          uninterrupted.
        </p>

        <h2>8. Limitation of Liability</h2>
        <p>
          To the fullest extent permitted by Philippine law, JCA 1221 Holdings
          Inc., its officers, directors, employees, and affiliates shall not be
          liable for any indirect, incidental, special, consequential, or
          punitive damages arising from or related to your use of the Site,
          even if advised of the possibility of such damages. Our total
          liability for any claim arising from these Terms shall not exceed
          PHP 1,000.00.
        </p>

        <h2>9. Indemnification</h2>
        <p>
          You agree to indemnify and hold harmless JCA 1221 Holdings Inc. and
          its affiliates from any claims, damages, losses, or expenses
          (including reasonable attorney's fees) arising from your violation
          of these Terms or your misuse of the Site.
        </p>

        <h2>10. Governing Law and Jurisdiction</h2>
        <p>
          These Terms are governed by the laws of the Republic of the
          Philippines. Any dispute arising from these Terms or your use of the
          Site shall be subject to the exclusive jurisdiction of the courts of
          Makati City, Philippines.
        </p>

        <h2>11. Changes to These Terms</h2>
        <p>
          We may update these Terms from time to time. Material changes will be
          posted on this page with an updated "Last updated" date. Your continued
          use of the Site after changes are posted constitutes acceptance of the
          revised Terms.
        </p>

        <h2>12. Contact</h2>
        <p>
          For questions about these Terms:
        </p>
        <ul>
          <li><strong>Email:</strong> <a href="mailto:legal@jca1221.com">legal@jca1221.com</a></li>
          <li><strong>Address:</strong> Unit 2808, 28th Floor, The Peak Tower, 107 Leviste Street, Salcedo Village, Makati City, Metro Manila 1227, Philippines</li>
        </ul>
      </LegalPageLayout>
    </AppShell>
  )
}
