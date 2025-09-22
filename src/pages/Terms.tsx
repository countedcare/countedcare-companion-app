import Layout from "@/components/Layout";
import { Link } from "react-router-dom";

const Terms = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <section id="terms" className="prose prose-neutral dark:prose-invert max-w-none">
          <h1 className="text-3xl font-bold mb-4">Terms & Conditions</h1>
          <p className="text-muted-foreground mb-6"><strong>Effective Date:</strong> December 2024</p>

          <p className="mb-6">These Terms & Conditions ("Terms") govern your use of CountedCare Inc.'s services ("Services"). By creating an account or using the Services, you agree to these Terms.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Use of Services</h2>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>CountedCare provides tools for expense tracking, receipt uploads, Plaid account connections, and AI-powered financial insights.</li>
            <li>We are <strong>not a tax advisor, accountant, or legal advisor</strong>. Information is for educational purposes only. Consult professionals for advice.</li>
            <li>Eligibility for tax deductions or programs is <strong>not guaranteed</strong>.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Subscriptions & Payments</h2>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Stripe processes subscription payments.</li>
            <li>Plans may be billed monthly or annually and auto-renew unless canceled before renewal.</li>
            <li><strong>Refund Policy:</strong> Subscriptions are non-refundable except where required by law.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">3. User Responsibilities</h2>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Provide accurate and truthful information for expenses, receipts, and accounts.</li>
            <li>Comply with all applicable laws.</li>
            <li>Do not engage in prohibited uses including fraudulent claims, hacking, scraping data, or impersonation.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Data & Privacy</h2>
          <p className="mb-6">Use of our Services is also subject to our <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Limitation of Liability</h2>
          <p className="mb-6">Services are provided "as is." CountedCare Inc. is not liable for errors in data entry, tax filings, or financial decisions. We disclaim all warranties to the fullest extent permitted by law.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Governing Law & Dispute Resolution</h2>
          <p className="mb-6">These Terms are governed by California law. Any disputes will be resolved by binding arbitration in Los Angeles County, California. You waive the right to participate in class actions.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Modifications</h2>
          <p className="mb-6">We may update these Terms. Continued use after updates means you accept the new Terms.</p>

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

export default Terms;