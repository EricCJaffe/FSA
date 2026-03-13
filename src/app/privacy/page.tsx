import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy — Foundation Stone Advisors',
  description: 'Privacy Policy for Foundation Stone Advisors BusinessOS platform.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="mx-auto max-w-3xl px-6 py-5 flex items-center justify-between">
          <Link href="/" className="text-sm font-bold text-gray-900 hover:text-gray-700 transition-colors">
            <span className="text-[10px] uppercase tracking-widest text-gray-400 block">Foundation Stone</span>
            BusinessOS
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-10">Effective Date: March 6, 2026</p>

        <div className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-base prose-h3:mt-6 prose-h3:mb-2 prose-p:text-gray-700 prose-p:leading-relaxed prose-li:text-gray-700 prose-a:text-blue-600">
          <h2>1. Introduction</h2>
          <p>
            Foundation Stone Advisors (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) values your privacy and is committed to protecting your personal information. This Privacy Policy explains what information we collect, how we use it, how we share it, and the choices you have regarding your information.
          </p>
          <p>
            By accessing or using our website, products, or services (collectively, the &ldquo;Services&rdquo;), you agree to the practices described in this Privacy Policy.
          </p>

          <h2>2. Information We Collect</h2>
          <p>We may collect the following categories of information, depending on how you use our Services:</p>

          <h3>A. Information You Provide</h3>
          <ul>
            <li>Name, email address, and other contact details</li>
            <li>Account information (if you create an account)</li>
            <li>Information you submit through forms, surveys, or messages</li>
            <li>Communications with us (e.g., customer support requests)</li>
          </ul>

          <h3>B. Information Collected Automatically</h3>
          <ul>
            <li>Device and browser information (e.g., device type, operating system, browser type)</li>
            <li>IP address and approximate location derived from IP</li>
            <li>Log and usage data (e.g., pages viewed, links clicked, time spent, referring/exit pages, timestamps)</li>
            <li>Cookies and similar technologies (see Section 10)</li>
          </ul>

          <h3>C. Information From Connected Services and Integrations (Optional)</h3>
          <p>
            If you choose to connect third-party services or integrations, we may access and process information you authorize that third party to share with us (which may include account identifiers, authentication tokens, and data made available by the integration). You control what is shared through the authorization flow and your third-party provider settings.
          </p>

          <h3>D. Health, Biometric, or Fitness-Related Data (Optional)</h3>
          <p>
            Depending on the features you use and any integrations you enable, the Services may process health, biometric, or fitness-related data you provide or authorize access to (for example: activity metrics, workout data, heart rate-related metrics, sleep-related metrics, or similar wellness data).
          </p>
          <ul>
            <li>We process this data only to provide and improve the Services and features you request.</li>
            <li>We do not use health/biometric/fitness-related data to make decisions that produce legal or similarly significant effects about you.</li>
            <li>Unless you explicitly request otherwise, we do not treat this data as &ldquo;public&rdquo; or share it broadly.</li>
          </ul>
          <p>We collect only the information reasonably necessary to operate, maintain, and improve the Services.</p>

          <h2>3. How We Use Information</h2>
          <p>We use information we collect to:</p>
          <ul>
            <li>Provide, operate, and maintain the Services</li>
            <li>Create and manage accounts and authentication</li>
            <li>Deliver features and functionality you request</li>
            <li>Display or analyze data you choose to provide or connect through integrations</li>
            <li>Improve performance, reliability, and user experience</li>
            <li>Communicate with you (including responding to support requests)</li>
            <li>Monitor, prevent, and address security issues, fraud, and abuse</li>
            <li>Comply with legal obligations and enforce our terms and policies</li>
          </ul>

          <h2>4. Analytics, Advertising, and Tracking Technologies</h2>
          <p>We may use third-party analytics tools and tracking technologies (such as cookies, pixels, and similar technologies) to:</p>
          <ul>
            <li>Understand how users interact with our website and Services</li>
            <li>Measure and improve marketing effectiveness</li>
            <li>Deliver advertisements or content that may be more relevant to you</li>
            <li>Build audiences for advertising campaigns and measure conversions</li>
          </ul>
          <p>
            These tools may collect information such as your IP address, device identifiers, browser information, pages visited, and actions taken. Some of these tools may be provided by platforms such as analytics providers and social media/advertising networks.
          </p>
          <p>
            <strong>Your choices:</strong> You can limit or disable cookies through your browser settings, and some third-party providers may offer additional opt-out mechanisms. Disabling cookies may impact certain site functionality.
          </p>

          <h2>5. How We Share Information</h2>
          <p><strong>We do not sell your personal information.</strong></p>
          <p>We may share information only in these circumstances:</p>

          <h3>A. Service Providers</h3>
          <p>
            We may share information with trusted vendors that help us operate the Services (e.g., hosting, analytics, customer support tools, security services). These providers are authorized to use information only as needed to provide services to us and are subject to confidentiality and security obligations.
          </p>

          <h3>B. Legal and Safety</h3>
          <p>
            We may disclose information if required by law, legal process, or governmental request, or to protect the rights, property, and safety of our users, our business, or others.
          </p>

          <h3>C. Business Transfers</h3>
          <p>
            If we are involved in a merger, acquisition, financing, reorganization, bankruptcy, or sale of assets, information may be transferred as part of that transaction, subject to reasonable protections.
          </p>

          <h2>6. Data Retention</h2>
          <p>We retain personal information only as long as necessary to:</p>
          <ul>
            <li>Provide the Services</li>
            <li>Comply with legal obligations</li>
            <li>Resolve disputes</li>
            <li>Enforce our agreements</li>
            <li>Maintain security and prevent fraud/abuse</li>
          </ul>
          <p>Retention periods may vary depending on the type of data and how it is used.</p>

          <h2>7. Security</h2>
          <p>
            We use reasonable administrative, technical, and organizational safeguards designed to protect information against unauthorized access, loss, misuse, alteration, or destruction. However, no method of transmission or storage is 100% secure, and we cannot guarantee absolute security.
          </p>

          <h2>8. Your Rights and Choices</h2>
          <p>Depending on your location, you may have rights regarding your personal information, including:</p>
          <ul>
            <li>Accessing, correcting, or updating your information</li>
            <li>Requesting deletion of your account and associated data</li>
            <li>Objecting to or restricting certain processing</li>
            <li>Withdrawing consent where processing is based on consent</li>
          </ul>
          <p>
            To exercise these rights, contact us at{' '}
            <a href="mailto:admin@foundationstoneadvisors.com">admin@foundationstoneadvisors.com</a>.
            We may need to verify your identity before fulfilling certain requests. We may retain certain information where required by law or for legitimate business purposes (e.g., compliance, security, fraud prevention).
          </p>

          <h2>9. Integrations and Authorization Control</h2>
          <p>
            If you connect third-party services, you can typically revoke access at any time through your third-party account settings or within the integration settings provided in our Services (if available). After revocation, we will stop collecting new data from that integration, though we may retain previously collected data as described in this Policy unless you request deletion.
          </p>

          <h2>10. Cookies and Similar Technologies</h2>
          <p>
            We use cookies, pixels, local storage, and similar technologies to operate the Services, remember preferences, enable features, and analyze usage. You can control cookies through your browser settings and may be able to clear stored cookies at any time. If you disable cookies, some features may not function properly.
          </p>

          <h2>11. Third-Party Links and Services</h2>
          <p>
            The Services may contain links to third-party websites or services. Their privacy practices are governed by their own policies, and we are not responsible for third-party privacy practices.
          </p>

          <h2>12. Children&rsquo;s Privacy</h2>
          <p>
            Our Services are not directed to children under 13 (or the applicable minimum age in your jurisdiction), and we do not knowingly collect personal information from children. If you believe a child has provided personal information, please contact us so we can delete it.
          </p>

          <h2>13. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will post updates on this page and revise the effective date above. Your continued use of the Services after an update means you accept the updated Policy.
          </p>

          <h2>14. Contact Us</h2>
          <p>If you have questions about this Privacy Policy or wish to exercise your privacy rights, contact:</p>
          <p>
            <strong>Foundation Stone Advisors</strong><br />
            Email: <a href="mailto:admin@foundationstoneadvisors.com">admin@foundationstoneadvisors.com</a>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-16">
        <div className="mx-auto max-w-3xl px-6 py-6 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Foundation Stone Advisors. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
