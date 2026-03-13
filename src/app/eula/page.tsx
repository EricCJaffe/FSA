import Link from 'next/link'

export const metadata = {
  title: 'End User License Agreement — Foundation Stone Advisors',
  description: 'End User License Agreement (EULA) for Foundation Stone Advisors BusinessOS platform.',
}

export default function EulaPage() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">End User License Agreement (EULA)</h1>
        <p className="text-sm text-gray-500 mb-10">Effective Date: March 6, 2026</p>

        <div className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-base prose-h3:mt-6 prose-h3:mb-2 prose-p:text-gray-700 prose-p:leading-relaxed prose-li:text-gray-700 prose-a:text-blue-600">
          <h2>1. Acceptance of Terms</h2>
          <p>
            This End User License Agreement (&ldquo;Agreement&rdquo;) is a legal agreement between you (&ldquo;User,&rdquo; &ldquo;you,&rdquo; or &ldquo;your&rdquo;) and Foundation Stone Advisors (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) governing your use of our website, software, applications, tools, and related services (collectively, the &ldquo;Services&rdquo;).
          </p>
          <p>
            By accessing or using the Services, you agree to be bound by this Agreement. If you do not agree to these terms, you should not use the Services.
          </p>

          <h2>2. License Grant</h2>
          <p>
            Subject to this Agreement, Foundation Stone Advisors grants you a limited, non-exclusive, non-transferable, revocable license to access and use the Services for their intended purposes.
          </p>
          <p>You may not:</p>
          <ul>
            <li>Copy, modify, distribute, or create derivative works from the Services</li>
            <li>Reverse engineer, decompile, or attempt to extract source code</li>
            <li>Use the Services for unlawful purposes</li>
            <li>Resell, sublicense, or commercially exploit the Services unless explicitly authorized</li>
          </ul>

          <h2>3. User Accounts</h2>
          <p>Some features may require you to create an account. You agree to:</p>
          <ul>
            <li>Provide accurate information</li>
            <li>Maintain the security of your account credentials</li>
            <li>Notify us promptly of any unauthorized use</li>
          </ul>
          <p>You are responsible for activity that occurs under your account.</p>

          <h2>4. User Content and Data</h2>
          <p>
            You may provide or upload information, data, or content while using the Services (&ldquo;User Content&rdquo;).
          </p>
          <p>
            You retain ownership of your User Content. However, you grant us a limited license to use, process, store, and display the content solely to operate, maintain, and improve the Services.
          </p>
          <p>
            Your use of the Services and handling of personal information is also governed by our{' '}
            <Link href="/privacy">Privacy Policy</Link>.
          </p>

          <h2>5. Integrations and Third-Party Services</h2>
          <p>
            The Services may allow connections to third-party platforms or integrations. If you enable these integrations, you authorize us to access the data you permit through those services.
          </p>
          <p>We are not responsible for the availability, security, or practices of third-party services.</p>

          <h2>6. Health, Biometric, or Fitness Data</h2>
          <p>
            If you choose to provide or authorize access to health, biometric, or fitness-related data through the Services or integrations, we process that information only to provide the features you request and improve the Services.
          </p>
          <p>
            We do not use such data to make decisions that produce legal or similarly significant effects about you.
          </p>

          <h2>7. Acceptable Use</h2>
          <p>You agree not to misuse the Services. Prohibited activities include:</p>
          <ul>
            <li>Attempting to gain unauthorized access to systems or accounts</li>
            <li>Interfering with the operation or security of the Services</li>
            <li>Uploading harmful code, malware, or malicious content</li>
            <li>Using the Services in violation of applicable laws or regulations</li>
          </ul>

          <h2>8. Intellectual Property</h2>
          <p>
            All software, content, designs, trademarks, and materials provided through the Services are the property of Foundation Stone Advisors or its licensors and are protected by applicable intellectual property laws.
          </p>
          <p>This Agreement does not grant you ownership of any intellectual property rights in the Services.</p>

          <h2>9. Service Availability and Modifications</h2>
          <p>
            We may modify, suspend, or discontinue parts of the Services at any time. We may also update features, functionality, or requirements as the Services evolve.
          </p>
          <p>We are not liable for any modification, suspension, or discontinuation of the Services.</p>

          <h2>10. Disclaimer of Warranties</h2>
          <p>The Services are provided &ldquo;as is&rdquo; and &ldquo;as available.&rdquo;</p>
          <p>
            To the fullest extent permitted by law, Foundation Stone Advisors disclaims all warranties, including but not limited to:
          </p>
          <ul>
            <li>Merchantability</li>
            <li>Fitness for a particular purpose</li>
            <li>Non-infringement</li>
            <li>Continuous or error-free operation</li>
          </ul>

          <h2>11. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, Foundation Stone Advisors will not be liable for any indirect, incidental, special, or consequential damages arising from or related to your use of the Services.
          </p>
          <p>
            Our total liability for any claim relating to the Services will not exceed the amount you paid for the Services, if any, in the preceding 12 months.
          </p>

          <h2>12. Termination</h2>
          <p>
            We may suspend or terminate your access to the Services if you violate this Agreement or misuse the Services.
          </p>
          <p>You may stop using the Services at any time.</p>
          <p>Upon termination, your license to use the Services immediately ends.</p>

          <h2>13. Changes to This Agreement</h2>
          <p>
            We may update this Agreement from time to time. Updated versions will be posted with a revised effective date. Continued use of the Services after updates constitutes acceptance of the revised Agreement.
          </p>

          <h2>14. Governing Law</h2>
          <p>
            This Agreement will be governed by and interpreted under the laws of the jurisdiction in which Foundation Stone Advisors operates, without regard to conflict of law principles.
          </p>

          <h2>15. Contact</h2>
          <p>If you have questions about this Agreement, please contact:</p>
          <p>
            <strong>Foundation Stone Advisors</strong><br />
            Email: <a href="mailto:admin@foundationstoneadvisors.com">admin@foundationstoneadvisors.com</a>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-16">
        <div className="mx-auto max-w-3xl px-6 py-6 flex items-center justify-center gap-4 text-xs text-gray-400">
          <Link href="/privacy" className="hover:text-gray-600 transition-colors">Privacy Policy</Link>
          <span>&middot;</span>
          <span>&copy; {new Date().getFullYear()} Foundation Stone Advisors. All rights reserved.</span>
        </div>
      </footer>
    </div>
  )
}
