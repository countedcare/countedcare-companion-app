import Layout from "@/components/Layout";

const PrivacyPolicy = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <section id="privacy-policy" className="prose prose-neutral dark:prose-invert max-w-none">
          <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground mb-6"><strong>Effective Date:</strong> December 2024</p>

          <p className="mb-6">CountedCare Inc. ("CountedCare," "we," "our," or "us") values your trust and is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile and web applications, website, and related services (collectively, the "Services").</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Information We Collect</h2>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li><strong>Personal Information You Provide:</strong> Name, email, phone number, expense entries, receipt uploads, mileage logs, caregiving notes.</li>
            <li><strong>Financial Information (via Plaid):</strong> Bank account and transaction data if you connect your accounts. We do not store your credentials; access is handled securely via Plaid.</li>
            <li><strong>Uploaded Content:</strong> Receipts, tax-related documentation, and other files you upload.</li>
            <li><strong>Automatically Collected Data:</strong> Device info, IP address, usage data, cookies.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">2. How We Use Your Information</h2>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Provide, maintain, and improve the Services</li>
            <li>Categorize caregiving-related expenses</li>
            <li>Help identify potential tax-deductible expenses under IRS Publication 502</li>
            <li>Provide AI-driven financial insights</li>
            <li>Send service-related communications and updates</li>
            <li>Conduct internal research (using aggregated, non-identifiable data)</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">3. How We Share Information</h2>
          <p className="mb-6">We do not sell personal data. We may share information with service providers (Plaid, Stripe, Supabase, Google Cloud), to comply with law, during a business transfer, or in aggregated form.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Data Security</h2>
          <p className="mb-6">We use Supabase, Google Cloud, and encryption to safeguard your data. No system is completely secure, and you use the Services at your own risk.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Your Choices</h2>
          <p className="mb-6">You may update or delete your account at any time. You may opt out of marketing communications. Depending on your jurisdiction, you may have rights to access, correct, or delete data.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Children's Privacy</h2>
          <p className="mb-6">CountedCare is not directed to children under 13 (or under 16 in certain regions). We do not knowingly collect children's data.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Changes to This Policy</h2>
          <p className="mb-6">We may update this Privacy Policy. Updates will be posted with a new "Effective Date."</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">8. Contact Us</h2>
          <div className="bg-muted p-4 rounded-lg">
            <p>
              CountedCare Inc.<br />
              1301 N Broadway STE 32274<br />
              Los Angeles, CA 90012<br />
              Email: <a href="mailto:info@countedcare.com" className="text-primary hover:underline">info@countedcare.com</a>
            </p>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default PrivacyPolicy;