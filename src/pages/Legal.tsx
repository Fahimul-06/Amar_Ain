import {
  ShieldCheck,
  FileText,
  Scale,
  Lock,
  Eye,
  Share2,
  Cookie,
  Mail,
  UserCheck,
  CreditCard,
  Gavel,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

/* Shared layout for legal pages */
function LegalLayout({
  icon,
  title,
  subtitle,
  lastUpdated,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  lastUpdated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-ink-50">
      <div className="border-b border-ink-100 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl gradient-gold">
            {icon}
          </div>
          <h1 className="font-display text-3xl font-extrabold text-ink-900 sm:text-4xl">{title}</h1>
          <p className="mt-3 text-ink-500">{subtitle}</p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-ink-400">
            Last updated: {lastUpdated}
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="card p-6 sm:p-10">{children}</div>
      </div>
    </div>
  );
}

function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8 last:mb-0">
      <h2 className="font-display text-lg font-bold text-ink-900">
        <span className="mr-2 text-gold-600">{number}.</span>
        {title}
      </h2>
      <div className="mt-2 space-y-3 text-sm leading-relaxed text-ink-600">{children}</div>
    </div>
  );
}

/* ============================================================
   PRIVACY POLICY
   ============================================================ */
export function PrivacyPolicyPage({ navigate }: { navigate: (to: string) => void }) {
  return (
    <LegalLayout
      icon={<Lock size={28} className="text-ink-950" />}
      title="Privacy Policy"
      subtitle="How we collect, use, and protect your personal information on Amar Ain."
      lastUpdated="15 July 2026"
    >
      <Section number="1" title="Introduction">
        <p>
          Amar Ain ("we", "us", "our") operates the platform at amarain.com.bd, providing legal
          consultation services to users in Bangladesh. This Privacy Policy explains how we collect,
          use, disclose, and safeguard your information when you use our platform.
        </p>
        <p>
          By creating an account or using our services, you consent to the practices described in this
          policy. If you do not agree with these terms, please do not use the platform.
        </p>
      </Section>

      <Section number="2" title="Information We Collect">
        <p>We collect the following categories of information:</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { icon: UserCheck, title: 'Account Data', desc: 'Full name, email, phone number, password (hashed), and role (client/lawyer).' },
            { icon: FileText, title: 'Profile Data', desc: 'Location, bio, avatar, Bar Council ID (for lawyers), and verification documents.' },
            { icon: CreditCard, title: 'Payment Data', desc: 'Transaction records via bKash, Nagad, and SSLCommerz. We do not store full card numbers.' },
            { icon: Eye, title: 'Usage Data', desc: 'Pages visited, booking history, messages, reviews, and device/browser information.' },
          ].map((d) => (
            <div key={d.title} className="rounded-xl border border-ink-100 p-4">
              <div className="mb-1.5 flex items-center gap-2 text-ink-900">
                <d.icon size={16} className="text-gold-600" />
                <span className="text-sm font-semibold">{d.title}</span>
              </div>
              <p className="text-xs text-ink-500">{d.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section number="3" title="How We Use Your Information">
        <ul className="space-y-2">
          {[
            'To create and manage your account and authenticate your identity.',
            'To match clients with lawyers and facilitate consultations.',
            'To process payments securely and maintain transaction records.',
            'To enable secure messaging between clients and lawyers.',
            'To verify lawyer credentials with the Bangladesh Bar Council.',
            'To send notifications about bookings, payments, and case updates.',
            'To resolve disputes and provide customer support.',
            'To comply with legal obligations under Bangladesh law.',
          ].map((u, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
              {u}
            </li>
          ))}
        </ul>
      </Section>

      <Section number="4" title="Information Sharing">
        <div className="flex items-start gap-3 rounded-xl bg-blue-50 p-4">
          <Share2 size={20} className="mt-0.5 shrink-0 text-blue-600" />
          <p>
            We <strong>do not sell</strong> your personal information to any third party. We share
            data only in the following circumstances:
          </p>
        </div>
        <ul className="space-y-2">
          {[
            'With your assigned lawyer or client to facilitate consultations.',
            'With payment processors (bKash, Nagad, SSLCommerz) to complete transactions.',
            'With the Bangladesh Bar Council for lawyer verification purposes.',
            'With law enforcement agencies when required by valid legal process.',
            'With service providers who help us operate the platform (under confidentiality agreements).',
          ].map((s, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-400" />
              {s}
            </li>
          ))}
        </ul>
      </Section>

      <Section number="5" title="Data Security">
        <p>
          We implement bank-grade security measures to protect your data, including:
        </p>
        <ul className="space-y-2">
          {[
            'TLS/SSL encryption for all data in transit.',
            'AES-256 encryption for sensitive data at rest.',
            'Row-level security policies on all database tables.',
            'Regular security audits and vulnerability assessments.',
            'Strict access controls — only authorized personnel can access user data.',
          ].map((s, i) => (
            <li key={i} className="flex items-start gap-2">
              <Lock size={16} className="mt-0.5 shrink-0 text-emerald-600" />
              {s}
            </li>
          ))}
        </ul>
      </Section>

      <Section number="6" title="Data Retention">
        <p>
          We retain your personal information for as long as your account is active. If you request
          account deletion, we will remove your personal data within 7 business days, except where
          we are legally required to retain records (e.g., transaction records for tax compliance,
          which are retained for 5 years per Bangladesh law).
        </p>
      </Section>

      <Section number="7" title="Cookies">
        <div className="flex items-start gap-3 rounded-xl bg-gold-50 p-4">
          <Cookie size={20} className="mt-0.5 shrink-0 text-gold-600" />
          <p>
            We use essential cookies to maintain your session and authenticate you. We do not use
            third-party advertising cookies. You can disable cookies in your browser, but this may
            affect platform functionality.
          </p>
        </div>
      </Section>

      <Section number="8" title="Your Rights">
        <p>You have the following rights regarding your personal data:</p>
        <ul className="space-y-2">
          {[
            'Right to access — request a copy of your personal data.',
            'Right to correction — update or correct inaccurate information.',
            'Right to deletion — request that we delete your account and data.',
            'Right to data portability — receive your data in a machine-readable format.',
            'Right to object — object to certain processing of your data.',
          ].map((r, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
              {r}
            </li>
          ))}
        </ul>
      </Section>

      <Section number="9" title="Children's Privacy">
        <p>
          Our platform is not intended for individuals under 18 years of age. We do not knowingly
          collect personal information from minors. If you believe a minor has provided us with
          personal data, please contact us and we will promptly delete it.
        </p>
      </Section>

      <Section number="10" title="Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time. We will notify you of significant
          changes by posting a notice on the platform or sending an email. Continued use of the
          platform after changes constitutes acceptance of the updated policy.
        </p>
      </Section>

      <Section number="11" title="Contact Us">
        <p>
          If you have questions about this Privacy Policy, please contact us:
        </p>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => navigate('/contact')} className="btn-outline">
            <Mail size={16} /> Contact page
          </button>
          <span className="rounded-xl border border-ink-100 bg-ink-50 px-3 py-2 text-sm text-ink-600">
            support@amarain.com.bd
          </span>
        </div>
      </Section>
    </LegalLayout>
  );
}

/* ============================================================
   TERMS OF SERVICE
   ============================================================ */
export function TermsOfServicePage({ navigate }: { navigate: (to: string) => void }) {
  return (
    <LegalLayout
      icon={<FileText size={28} className="text-ink-950" />}
      title="Terms of Service"
      subtitle="The terms and conditions governing your use of Amar Ain."
      lastUpdated="15 July 2026"
    >
      <Section number="1" title="Acceptance of Terms">
        <p>
          By accessing or using Amar Ain (the "Platform"), you agree to be bound by these Terms of
          Service ("Terms"). If you do not agree to these Terms, you may not access or use the
          Platform. These Terms form a legally binding agreement between you and Amar Ain.
        </p>
      </Section>

      <Section number="2" title="Eligibility">
        <p>
          You must be at least 18 years old and a resident of Bangladesh to use the Platform. By
          registering, you represent and warrant that you meet these eligibility requirements.
        </p>
      </Section>

      <Section number="3" title="Account Registration">
        <ul className="space-y-2">
          {[
            'You must provide accurate, complete, and current information during registration.',
            'You are responsible for maintaining the security of your password and account.',
            'You are responsible for all activities that occur under your account.',
            'You must not share your account credentials with any other person.',
            'You must notify us immediately of any unauthorized use of your account.',
          ].map((t, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
              {t}
            </li>
          ))}
        </ul>
      </Section>

      <Section number="4" title="Platform Services">
        <p>Amar Ain provides the following services:</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { icon: Scale, title: 'Lawyer Directory', desc: 'Browse and search verified lawyers by category, location, and rating.' },
            { icon: FileText, title: 'Consultation Booking', desc: 'Book text, phone, video, in-person, or document drafting services.' },
            { icon: CreditCard, title: 'Payment Processing', desc: 'Secure payments via bKash, Nagad, and SSLCommerz with escrow holding.' },
            { icon: Mail, title: 'Secure Messaging', desc: 'Private chat with your assigned lawyer for case updates.' },
          ].map((s) => (
            <div key={s.title} className="rounded-xl border border-ink-100 p-4">
              <div className="mb-1.5 flex items-center gap-2 text-ink-900">
                <s.icon size={16} className="text-gold-600" />
                <span className="text-sm font-semibold">{s.title}</span>
              </div>
              <p className="text-xs text-ink-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section number="5" title="For Clients">
        <ul className="space-y-2">
          {[
            'You agree to provide accurate information when booking consultations.',
            'You must pay the agreed fee before the consultation begins.',
            'You must not request legal advice through the AI assistant — it provides general information only.',
            'You must not harass, abuse, or mislead any lawyer on the Platform.',
            'You are responsible for evaluating the suitability of a lawyer for your needs.',
            'You acknowledge that Amar Ain is not a law firm and does not provide legal advice directly.',
          ].map((t, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-400" />
              {t}
            </li>
          ))}
        </ul>
      </Section>

      <Section number="6" title="For Lawyers">
        <ul className="space-y-2">
          {[
            'You must be a licensed advocate registered with the Bangladesh Bar Council.',
            'You must provide accurate credentials and submit to verification.',
            'You must not solicit direct payments outside the Platform.',
            'You must attend scheduled consultations on time or provide adequate notice.',
            'You must maintain professional conduct as per the Bangladesh Bar Council Code of Conduct.',
            'You are responsible for the legal advice you provide — Amar Ain is not liable for the content of consultations.',
          ].map((t, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-400" />
              {t}
            </li>
          ))}
        </ul>
      </Section>

      <Section number="7" title="Payments and Fees">
        <div className="flex items-start gap-3 rounded-xl bg-emerald-50 p-4">
          <CreditCard size={20} className="mt-0.5 shrink-0 text-emerald-600" />
          <div>
            <p>
              The Platform charges a <strong>10% commission</strong> on each consultation fee. This
              commission is deducted from the lawyer's payout. Clients pay the full fee as listed by
              the lawyer.
            </p>
          </div>
        </div>
        <ul className="space-y-2">
          {[
            'Payments are held in escrow until the consultation is marked as completed.',
            'Lawyers can request withdrawals of their available balance via bKash, Nagad, or bank transfer.',
            'Withdrawal requests are processed within 3-5 business days.',
            'Refunds are issued for cancelled or disputed consultations resolved in the client\'s favor.',
            'The Platform reserves the right to adjust commission rates with 30 days\' notice.',
          ].map((t, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
              {t}
            </li>
          ))}
        </ul>
      </Section>

      <Section number="8" title="Dispute Resolution">
        <div className="flex items-start gap-3 rounded-xl bg-gold-50 p-4">
          <AlertCircle size={20} className="mt-0.5 shrink-0 text-gold-600" />
          <p>
            If you have a dispute regarding a consultation, you may raise it through the Platform's
            dispute resolution system. Our admin team will review and mediate. If the dispute cannot
            be resolved through the Platform, it shall be referred to arbitration in Dhaka under the
            Arbitration Act 2001 of Bangladesh.
          </p>
        </div>
      </Section>

      <Section number="9" title="Prohibited Conduct">
        <p>You agree not to:</p>
        <ul className="space-y-2">
          {[
            'Use the Platform for any illegal or fraudulent purpose.',
            'Impersonate another person or misrepresent your credentials.',
            'Post false, misleading, or defamatory content.',
            'Attempt to gain unauthorized access to the Platform\'s systems.',
            'Circumvent payment systems or solicit off-platform transactions.',
            'Harass, threaten, or discriminate against any user.',
            'Upload malicious code or engage in data scraping.',
          ].map((t, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-0.5 text-red-500">✕</span>
              {t}
            </li>
          ))}
        </ul>
      </Section>

      <Section number="10" title="Intellectual Property">
        <p>
          The Platform, including its design, logos, content, and software, is the intellectual
          property of Amar Ain and is protected under the Copyright Act 2000 of Bangladesh. You may
          not copy, reproduce, or distribute any part of the Platform without our written consent.
        </p>
      </Section>

      <Section number="11" title="Limitation of Liability">
        <p>
          Amar Ain is a platform that connects clients with lawyers. We are not a law firm and do not
          provide legal advice. We are not liable for:
        </p>
        <ul className="space-y-2">
          {[
            'The quality, accuracy, or outcome of legal advice provided by lawyers on the Platform.',
            'Any damages arising from consultations or legal services.',
            'Indirect, incidental, or consequential damages.',
            'Any actions taken based on information from the AI legal assistant.',
          ].map((t, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-400" />
              {t}
            </li>
          ))}
        </ul>
        <p>
          Our total liability for any claim arising from the use of the Platform shall not exceed the
          total fees paid by you to the Platform in the preceding 3 months.
        </p>
      </Section>

      <Section number="12" title="Termination">
        <p>
          We may suspend or terminate your account at any time if you violate these Terms or engage
          in conduct that we determine, in our sole discretion, is harmful to the Platform or other
          users. You may delete your account at any time by contacting support.
        </p>
      </Section>

      <Section number="13" title="Governing Law">
        <p>
          These Terms are governed by the laws of the People\'s Republic of Bangladesh. Any disputes
          shall be subject to the exclusive jurisdiction of the courts of Dhaka, Bangladesh.
        </p>
      </Section>

      <Section number="14" title="Contact">
        <p>For questions about these Terms, please contact us:</p>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => navigate('/contact')} className="btn-outline">
            <Mail size={16} /> Contact page
          </button>
          <span className="rounded-xl border border-ink-100 bg-ink-50 px-3 py-2 text-sm text-ink-600">
            legal@amarain.com.bd
          </span>
        </div>
      </Section>
    </LegalLayout>
  );
}

/* ============================================================
   BAR COUNCIL COMPLIANCE
   ============================================================ */
export function BarCouncilCompliancePage({ navigate }: { navigate: (to: string) => void }) {
  return (
    <LegalLayout
      icon={<Gavel size={28} className="text-ink-950" />}
      title="Bar Council Compliance"
      subtitle="Our compliance framework with the Bangladesh Bar Council regulations."
      lastUpdated="15 July 2026"
    >
      <Section number="1" title="Overview">
        <p>
          Amar Ain is committed to full compliance with the Bangladesh Legal Practitioners and Bar
          Council Act, 1972 and the rules and regulations issued by the Bangladesh Bar Council. This
          page outlines our compliance framework.
        </p>
        <div className="flex items-start gap-3 rounded-xl bg-emerald-50 p-4">
          <ShieldCheck size={20} className="mt-0.5 shrink-0 text-emerald-600" />
          <p>
            Every lawyer listed on Amar Ain must be a registered, licensed advocate in good standing
            with the Bangladesh Bar Council. We verify this before any lawyer is listed as
            "verified" on our platform.
          </p>
        </div>
      </Section>

      <Section number="2" title="Lawyer Verification Process">
        <p>Our verification process consists of the following steps:</p>
        <div className="space-y-3">
          {[
            { step: '1', title: 'Bar Council ID Submission', desc: 'Lawyers submit their Bangladesh Bar Council enrollment number during registration.' },
            { step: '2', title: 'Document Upload', desc: 'Lawyers upload their Bar Council registration certificate or practicing license.' },
            { step: '3', title: 'Verification Check', desc: 'Our admin team verifies the Bar Council ID against official records.' },
            { step: '4', title: 'Approval', desc: 'Upon successful verification, the lawyer\'s status is updated to "verified" and they appear in search results.' },
            { step: '5', title: 'Ongoing Monitoring', desc: 'We periodically re-verify credentials to ensure continued good standing.' },
          ].map((s) => (
            <div key={s.step} className="flex items-start gap-3 rounded-xl border border-ink-100 p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold-50 text-sm font-bold text-gold-700">
                {s.step}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-ink-900">{s.title}</h3>
                <p className="text-xs text-ink-500">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section number="3" title="Compliance with Bar Council Rules">
        <p>
          We ensure compliance with the following key provisions of the Bangladesh Bar Council
          rules:
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { icon: UserCheck, title: 'Enrollment Verification', desc: 'Only advocates enrolled with the Bangladesh Bar Council are listed as verified lawyers.' },
            { icon: FileText, title: 'Code of Conduct', desc: 'Lawyers must adhere to the Bangladesh Bar Council Code of Conduct for advocates.' },
            { icon: CreditCard, title: 'Fee Transparency', desc: 'Consultation fees are transparently displayed. No hidden charges are permitted.' },
            { icon: ShieldCheck, title: 'Confidentiality', desc: 'Lawyer-client communications are kept confidential per attorney-client privilege.' },
            { icon: Gavel, title: 'No Unauthorized Practice', desc: 'Only enrolled advocates provide legal advice. The AI assistant provides general information only.' },
            { icon: Scale, title: 'Professional Independence', desc: 'Lawyers maintain professional independence in providing legal services.' },
          ].map((c) => (
            <div key={c.title} className="rounded-xl border border-ink-100 p-4">
              <div className="mb-1.5 flex items-center gap-2 text-ink-900">
                <c.icon size={16} className="text-gold-600" />
                <span className="text-sm font-semibold">{c.title}</span>
              </div>
              <p className="text-xs text-ink-500">{c.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section number="4" title="Platform's Role">
        <div className="flex items-start gap-3 rounded-xl bg-blue-50 p-4">
          <AlertCircle size={20} className="mt-0.5 shrink-0 text-blue-600" />
          <p>
            Amar Ain functions solely as a technology platform connecting clients with lawyers. We
            are <strong>not</strong> a law firm, do not employ lawyers, and do not provide legal
            advice. The lawyer-client relationship is established directly between the client and
            the lawyer, not with Amar Ain.
          </p>
        </div>
      </Section>

      <Section number="5" title="Fee Structure and Commission">
        <p>
          In compliance with Bar Council guidelines on fee transparency:
        </p>
        <ul className="space-y-2">
          {[
            'Lawyers set their own consultation fees — the Platform does not dictate pricing.',
            'The Platform charges a 10% service commission on each transaction.',
            'All fees are clearly displayed to clients before booking.',
            'Lawyers receive their net payout (fee minus commission) after the consultation is completed.',
            'The commission structure is disclosed to both parties at the time of registration.',
          ].map((t, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
              {t}
            </li>
          ))}
        </ul>
      </Section>

      <Section number="6" title="Handling Misconduct">
        <p>
          If a lawyer is found to have violated Bar Council rules or our Terms of Service, we will:
        </p>
        <ul className="space-y-2">
          {[
            'Suspend the lawyer\'s account pending investigation.',
            'Notify the affected parties and facilitate dispute resolution.',
            'Report serious violations to the Bangladesh Bar Council if required.',
            'Cooperate fully with any Bar Council inquiry.',
            'Permanently remove lawyers whose Bar Council enrollment is revoked.',
          ].map((t, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-0.5 text-red-500">⚠</span>
              {t}
            </li>
          ))}
        </ul>
      </Section>

      <Section number="7" title="Client Awareness">
        <p>
          Clients using Amar Ain should be aware that:
        </p>
        <ul className="space-y-2">
          {[
            'The AI legal assistant provides general legal information, not legal advice.',
            'Only a licensed advocate can provide legal advice specific to your situation.',
            'Booking a consultation through the Platform establishes a lawyer-client relationship with the individual lawyer, not Amar Ain.',
            'Clients have the right to choose any lawyer and are not obligated to use our Platform.',
            'Clients should verify the lawyer\'s Bar Council ID on their profile before booking.',
          ].map((t, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
              {t}
            </li>
          ))}
        </ul>
      </Section>

      <Section number="8" title="Data Protection Compliance">
        <p>
          In addition to Bar Council rules, we comply with the Bangladesh Digital Security Act,
          2018 and the Information and Communication Technology Act, 2006 regarding the protection
          of user data, lawyer credentials, and confidential communications.
        </p>
      </Section>

      <Section number="9" title="Contact for Compliance Matters">
        <p>
          For compliance-related questions or to report a compliance concern:
        </p>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => navigate('/contact')} className="btn-outline">
            <Mail size={16} /> Contact page
          </button>
          <span className="rounded-xl border border-ink-100 bg-ink-50 px-3 py-2 text-sm text-ink-600">
            compliance@amarain.com.bd
          </span>
        </div>
      </Section>
    </LegalLayout>
  );
}
