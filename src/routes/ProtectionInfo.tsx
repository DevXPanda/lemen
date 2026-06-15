import { useLocation } from "react-router-dom";
import paymentImage from "@/assets/pravixo-flow.jpeg";

export default function ProtectionInfo() {
  const location = useLocation();

  const title =
    location.state?.type === "creator"
      ? "How do I get paid?"
      : "How is my money protected?";

  const steps = [
    {
      step: "STEP 1",
      title: "Brands Post Campaigns",
      content:
        "Brands create campaigns and define their requirements, budget, deliverables, and timelines.",
    },
    {
      step: "STEP 2",
      title: "Creators Apply",
      content:
        "Relevant creators browse opportunities and submit their applications.",
    },
    {
      step: "STEP 3",
      title: "Brand Selects Creator",
      content:
        "Brands review creator profiles, portfolios, and proposals before selecting the best fit.",
    },
    {
      step: "STEP 4",
      title: "Payment Secured by Pravixo",
      content:
        "Before work begins, the brand deposits the creator fee with Pravixo. The payment is securely held by the platform until the campaign is successfully completed. This protects both brands and creators.",
    },
    {
      step: "STEP 5",
      title: "Creator Starts Work",
      content:
        "Once payment is secured, the creator receives the campaign assignment and begins content creation.",
    },
    {
      step: "STEP 6",
      title: "Content Delivery",
      content:
        "The creator uploads the agreed deliverables, including Reels, Videos, UGC Content, Product Reviews, Social Media Posts, and Creative Assets.",
    },
    {
      step: "STEP 7",
      title: "Brand Reviews Deliverables",
      content:
        "The brand reviews the submitted work and can approve deliverables or request revisions.",
    },
    {
      step: "STEP 8",
      title: "Creator Gets Paid",
      content:
        "After approval, Pravixo releases payment to the creator. Example: Creator Fee ₹1,000 | Pravixo Platform Fee (20%): ₹200 | Creator Receives: ₹800. No invoices to chase. No payment disputes. No collection hassles.",
    },
    {
      step: "STEP 9",
      title: "Campaign Completed",
      content:
        "Both parties can rate each other, helping build trust and credibility within the Pravixo ecosystem.",
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      {/* Dynamic Heading */}
      <h1 className="font-display text-4xl font-bold text-center">
        {title}
      </h1>

      <p className="mt-4 text-center text-muted-foreground">
        Pravixo ensures a secure and transparent experience for both creators
        and brands.
      </p>

      {/* Image */}
      <div className="mt-10 overflow-hidden rounded-3xl border border-border shadow-soft">
        <img
          src={paymentImage}
          alt="Pravixo Payment Protection"
          className="w-full object-cover"
        />
      </div>

      {/* How Pravixo Works */}
      <div className="mt-12">
        <h2 className="font-display text-3xl font-bold">
          HOW PRAVIXO WORKS
        </h2>

        <p className="mt-2 text-muted-foreground">
          Secure Collaborations. Protected Payments. Trusted Results.
        </p>

        <p className="mt-4 text-muted-foreground">
          Pravixo makes it easy for brands and creators to collaborate with
          complete transparency and payment security.
        </p>
      </div>

      {/* Steps */}
      <div className="mt-10 space-y-6">
        {steps.map((item) => (
          <div
            key={item.step}
            className="rounded-3xl border border-border bg-card p-6 shadow-soft"
          >
            <p className="text-sm font-semibold text-primary">
              {item.step}
            </p>

            <h3 className="mt-2 font-display text-xl font-bold">
              {item.title}
            </h3>

            <p className="mt-3 text-muted-foreground">
              {item.content}
            </p>
          </div>
        ))}
      </div>

      {/* Why Brands Love Pravixo */}
      <div className="mt-10 rounded-3xl border border-border bg-card p-6 shadow-soft">
        <h3 className="font-display text-2xl font-bold">
          WHY BRANDS LOVE PRAVIXO
        </h3>

        <ul className="mt-4 space-y-2 text-muted-foreground">
          <li>✓ Verified Creator Marketplace</li>
          <li>✓ Secure Payment Protection</li>
          <li>✓ Faster Campaign Execution</li>
          <li>✓ Transparent Workflow</li>
          <li>✓ Reduced Risk</li>
        </ul>
      </div>

      {/* Why Creators Love Pravixo */}
      <div className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-soft">
        <h3 className="font-display text-2xl font-bold">
          WHY CREATORS LOVE PRAVIXO
        </h3>

        <ul className="mt-4 space-y-2 text-muted-foreground">
          <li>✓ No Upfront Joining Fees</li>
          <li>✓ Payment Secured Before Work Starts</li>
          <li>✓ Access to Brand Opportunities</li>
          <li>✓ Transparent Earnings</li>
          <li>✓ Build Long-Term Brand Relationships</li>
        </ul>
      </div>

      {/* Payment Protection */}
      <div className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-soft">
        <h3 className="font-display text-2xl font-bold">
          🔒 PRAVIXO PAYMENT PROTECTION
        </h3>

        <ul className="mt-4 space-y-2 text-muted-foreground">
          <li>🔒 Brand funds are securely held by Pravixo.</li>
          <li>
            🔒 Creators know the payment is already secured before they start
            work.
          </li>
          <li>
            🔒 Brands release payment only after reviewing deliverables.
          </li>
          <li>
            🔒 Pravixo automatically deducts platform charges and transfers
            creator earnings.
          </li>
        </ul>

        <p className="mt-6 font-semibold text-primary">
          Safe for Brands. Trusted by Creators. Powered by Pravixo.
        </p>
      </div>
    </div>
  );
}

