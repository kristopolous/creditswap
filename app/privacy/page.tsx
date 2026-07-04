export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded border border-gray-800/50 bg-gray-900/60 p-8 sm:p-12">
        <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
        <p className="mt-2 text-sm text-gray-400">Last updated: July 3, 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-gray-300">
          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">1. Information We Collect</h2>
            <p>
              When you sign in via GitHub or Google OAuth, we collect your email address and display
              name. We do not store passwords. When you purchase or sell credits, we record
              transaction details including platform, amount, and price per credit.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">2. How We Use Your Information</h2>
            <p>
              We use your information to operate the marketplace, match buy and sell orders, generate
              API proxy keys, and provide customer support. We do not sell your personal data to third
              parties.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">3. Data Storage</h2>
            <p>
              Account information is stored via Auth.js session cookies. Order and key data is stored
              in memory during development. In production, data is persisted in a database with
              encryption at rest.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">4. Cookies</h2>
            <p>
              We use essential session cookies for authentication. No third-party tracking cookies are
              used. You can control cookie settings in your browser.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">5. Third-Party Services</h2>
            <p>
              OAuth authentication is handled by GitHub and Google. Each provider&apos;s privacy policy
              applies to the data they process during authentication. We receive only the information
              you authorize (email and name).
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">6. Data Retention</h2>
            <p>
              We retain your account information until you request deletion. Transaction records are
              retained for tax and compliance purposes as required by law.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">7. Your Rights</h2>
            <p>
              You may request access to, correction of, or deletion of your personal data at any time
              by contacting us. You may also revoke OAuth access via your GitHub or Google account
              settings.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">8. Contact</h2>
            <p>
              For privacy-related inquiries, contact privacy@creditswap.ai.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
