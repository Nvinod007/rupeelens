import type { Metadata } from 'next';

import {
  B,
  ContactBlock,
  LegalPage,
  P,
  Section,
  UL,
} from '@/components/legal/LegalDocument';
import { LEGAL, LEGAL_ROUTES } from '@/lib/legal';

export const metadata: Metadata = {
  description: 'The terms that apply when you use RupeeLens.',
  title: 'Terms of Service · RupeeLens',
};

export default function TermsPage() {
  return (
    <LegalPage sibling="privacy" title="Terms of Service">
      <P>
        These Terms of Service (“Terms”) are a binding agreement between you and{' '}
        {LEGAL.productName} (“we”, “us”) for your use of {LEGAL.url} and the{' '}
        {LEGAL.productName} web app (the “Service”). By signing in or using the
        Service you accept these Terms and our{' '}
        <a className="text-primary underline underline-offset-2" href={LEGAL_ROUTES.privacy}>
          Privacy Policy
        </a>
        . If you do not agree, do not use the Service. This is an electronic
        record under the Information Technology Act, 2000 and does not require
        a physical signature.
      </P>

      <Section id="eligibility" n={1} title="Who can use the Service">
        <P>
          You must be at least {LEGAL.minAge} years old and capable of entering
          a binding contract under the Indian Contract Act, 1872. The Service
          is intended for personal, non-commercial use.
        </P>
      </Section>

      <Section id="service" n={2} title="What the Service does">
        <P>
          {LEGAL.productName} helps you record personal expenses by voice, typed
          prompt or form, optionally uses AI to structure them, and lets you
          review and edit them. It is a record-keeping tool. We are{' '}
          <B>not</B> a bank, payment service, lender, accountant or financial
          adviser. We do not move money, connect to your bank, or give
          investment, tax or legal advice.
        </P>
      </Section>

      <Section id="account" n={3} title="Your account">
        <UL>
          <li>You sign in with your Google account and must keep it secure.</li>
          <li>You are responsible for all activity under your account.</li>
          <li>
            Provide accurate information and tell us promptly if you suspect
            unauthorised access.
          </li>
          <li>One person per account; do not share or sell access.</li>
        </UL>
      </Section>

      <Section id="byok" n={4} title="AI features and your Gemini key">
        <UL>
          <li>
            AI features work only with your own Google Gemini API key. You are
            solely responsible for the key, for any charges, quotas and limits
            on your Google account, and for complying with Google’s terms.
          </li>
          <li>
            We are not responsible for provider outages, billing, quota
            exhaustion, rate limits, model changes or account suspensions.
          </li>
          <li>
            You must be the lawful holder of the key and must not use a key
            belonging to someone else.
          </li>
          <li>
            AI can be wrong. It may misread amounts, dates, payees or
            categories. <B>Always review the fields before saving.</B> You are
            responsible for the accuracy of what you save.
          </li>
          <li>
            Keep sensitive data (passwords, card numbers, government IDs) out
            of voice notes and prompts.
          </li>
        </UL>
      </Section>

      <Section id="content" n={5} title="Your content">
        <P>
          You own the expense data and notes you enter (“Your Content”). You
          grant us a limited licence to store, process and display Your Content
          solely to operate the Service for you, including sending the text you
          choose to parse to Google Gemini with your key. We do not claim
          ownership of Your Content.
        </P>
      </Section>

      <Section id="use" n={6} title="Acceptable use">
        <P>You agree not to:</P>
        <UL>
          <li>break any law or infringe anyone’s rights;</li>
          <li>
            probe, scan or test the Service’s security, or bypass rate limits
            or access controls;
          </li>
          <li>
            use bots, scraping or automation to overload the Service or to
            extract data from other users;
          </li>
          <li>upload malware or attempt to disrupt the Service;</li>
          <li>reverse engineer the Service except where the law allows;</li>
          <li>use the Service for any commercial resale or to build a competing service.</li>
        </UL>
      </Section>

      <Section id="accuracy" n={7} title="No financial or tax advice">
        <P>
          Totals, summaries and categories are for your convenience only. They
          are not financial, accounting, tax or legal advice and should not be
          the sole basis for filing returns or making financial decisions.
          Verify important figures against your bank and payment records.
        </P>
      </Section>

      <Section id="availability" n={8} title="Availability and changes">
        <P>
          We work to keep the Service available but do not promise it will be
          uninterrupted or error-free. Features may change, be limited or be
          withdrawn, and some features may be in beta. We may apply usage
          limits (for example rate limits on AI requests) to protect the
          Service.
        </P>
      </Section>

      <Section id="termination" n={9} title="Suspension and termination">
        <P>
          You can stop using the Service and request account deletion at any
          time by emailing us. We may suspend or end your access, with notice
          where practical, if you breach these Terms, create risk or legal
          exposure for us or other users, or if we discontinue the Service.
          Sections that by their nature should survive termination (including
          sections 10 to 13) will survive.
        </P>
      </Section>

      <Section id="disclaimer" n={10} title="Disclaimers">
        <P>
          To the fullest extent permitted by law, the Service is provided “as
          is” and “as available”, without warranties of any kind, express or
          implied, including merchantability, fitness for a particular purpose,
          accuracy and non-infringement. Nothing in these Terms excludes rights
          you have under the Consumer Protection Act, 2019 that cannot be
          excluded.
        </P>
      </Section>

      <Section id="liability" n={11} title="Limitation of liability">
        <P>
          To the extent permitted by law, we are not liable for indirect,
          incidental, special or consequential loss, or for loss of data,
          profits or goodwill, arising from your use of the Service, including
          errors in AI output or charges on your own Google account. Our total
          liability for any claim relating to the Service is limited to the
          greater of the amount you paid us for the Service in the preceding 12
          months or ₹1,000. Nothing here limits liability that cannot be
          limited under applicable law.
        </P>
      </Section>

      <Section id="law" n={12} title="Governing law and disputes">
        <P>
          These Terms are governed by the laws of India. Please first contact
          us so we can try to resolve any dispute informally. If it cannot be
          resolved, the courts of competent jurisdiction in India will have
          exclusive jurisdiction, subject to any consumer rights you have to
          approach a consumer forum under the Consumer Protection Act, 2019.
        </P>
      </Section>

      <Section id="changes" n={13} title="Changes to these Terms">
        <P>
          We may update these Terms. We will change the effective date above
          and, for material changes, ask you to accept the new version when you
          next sign in. Continued use after that means you accept the changes.
        </P>
      </Section>

      <Section id="contact" n={14} title="Contact and grievances">
        <P>
          Questions, complaints or requests under the Information Technology
          Act, 2000 can be sent to our Grievance Officer:
        </P>
        <P>
          <B>{LEGAL.grievanceOfficer}</B>
        </P>
        <ContactBlock />
        <P>
          We acknowledge complaints within 48 hours and aim to resolve them
          within 30 days of receipt.
        </P>
      </Section>
    </LegalPage>
  );
}
