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
  description: 'How RupeeLens collects, uses, stores and protects your data.',
  title: 'Privacy Policy · RupeeLens',
};

export default function PrivacyPage() {
  return (
    <LegalPage sibling="terms" title="Privacy Policy">
      <P>
        This Privacy Policy explains how {LEGAL.productName} (“we”, “us”) handles
        your personal data when you use {LEGAL.url} and the {LEGAL.productName}{' '}
        web app (the “Service”). It is written to comply with the Information
        Technology Act, 2000, the Information Technology (Reasonable Security
        Practices and Procedures and Sensitive Personal Data or Information)
        Rules, 2011, and the Digital Personal Data Protection Act, 2023 and the
        rules made under it. By signing in you consent to the practices
        described here. If you do not agree, please do not use the Service.
      </P>

      <Section id="collect" n={1} title="What we collect">
        <UL>
          <li>
            <B>Google account details.</B> When you sign in with Google we
            receive your name, email address and profile picture, plus a unique
            account ID. We never receive your Google password.
          </li>
          <li>
            <B>Expense data.</B> The transactions you create: payee or title,
            amount, category, date and time, notes and status (draft or saved).
          </li>
          <li>
            <B>Voice notes and prompts.</B> The text of what you said or typed
            to add an expense (the “transcript”). We store this text with the
            transaction so you can review and edit it later.
          </li>
          <li>
            <B>Your Gemini API key.</B> If you choose to enable AI parsing, the
            key you paste into Settings (see section 4).
          </li>
          <li>
            <B>Technical data.</B> IP address, browser type and request logs,
            used to run, secure and rate-limit the Service and to investigate
            abuse or bugs.
          </li>
          <li>
            <B>Consent record.</B> The version of these documents you accepted
            and when.
          </li>
        </UL>
        <P>
          We do <B>not</B> collect bank account numbers, card details, UPI PINs
          or SMS content, and we do not connect to your bank.
        </P>
      </Section>

      <Section id="use" n={2} title="How we use your data">
        <UL>
          <li>To create your account and keep you signed in.</li>
          <li>To store, show, edit and summarise your expenses.</li>
          <li>
            To turn your voice note or prompt into structured fields (amount,
            payee, category, date) when you ask for it.
          </li>
          <li>
            To protect the Service: prevent abuse, enforce rate limits, debug
            problems and keep it secure.
          </li>
          <li>To respond to your requests and grievances.</li>
          <li>To comply with applicable law and lawful requests.</li>
        </UL>
        <P>
          We do not sell your personal data, we do not show ads, and we do not
          use your expense data to build profiles for third parties.
        </P>
      </Section>

      <Section id="voice" n={3} title="Voice and microphone">
        <P>
          Voice input uses the speech recognition built into your browser (the
          Web Speech API). In browsers such as Chrome, your audio is sent to
          the browser vendor (for example Google) to be converted into text,
          under that vendor’s own privacy policy.{' '}
          <B>{LEGAL.productName} never receives or stores your audio.</B> We
          only receive the resulting text, and only after you choose to save,
          draft or refine it. You can block the microphone at any time in your
          browser’s site settings and use the Prompt or Form options instead.
        </P>
      </Section>

      <Section id="ai" n={4} title="AI processing and your Gemini key">
        <P>
          {LEGAL.productName} uses a “bring your own key” model. AI features
          work only if you add your own Google Gemini API key in Settings.
        </P>
        <UL>
          <li>
            When you press Save (after a voice note or prompt) or Refine with
            AI, the transcript text and the current date and time zone are sent
            from our server to Google’s Gemini API using <B>your</B> key.
          </li>
          <li>
            Usage is billed to, and governed by the terms of, your own Google
            account. Depending on your Google plan, Google may retain or review
            prompts under its Gemini API terms; please read them.
          </li>
          <li>
            Your key is encrypted (AES-256-GCM) before it is stored and is
            never written to logs or shown back to you. You can revoke it at
            any time in Settings, which deletes it from our systems.
          </li>
          <li>
            If you add no key, nothing is sent to Gemini. Drafts and the Form
            option keep working without AI.
          </li>
        </UL>
        <P>
          Do not put sensitive information such as passwords, card numbers or
          government ID numbers into voice notes or prompts.
        </P>
      </Section>

      <Section id="share" n={5} title="Who we share data with">
        <P>
          We share data only with service providers that help us run the
          Service, and only as needed:
        </P>
        <UL>
          <li>
            <B>Google (Sign-In).</B> Authenticates you.
          </li>
          <li>
            <B>Google (Gemini API).</B> Parses your text using your own key, as
            described above.
          </li>
          <li>
            <B>Supabase.</B> Provides our database and authentication, where
            your account and expense data are stored.
          </li>
          <li>
            <B>Hosting providers</B> (currently Vercel for the web app and
            Fly.io for the API). They process requests and technical logs on
            our behalf.
          </li>
        </UL>
        <P>
          We may also disclose information if required by law, court order or
          a lawful government request, or to protect the rights, safety and
          security of users and the Service.
        </P>
      </Section>

      <Section id="storage" n={6} title="Where your data is stored">
        <P>
          Your data is stored on Supabase’s cloud infrastructure and processed
          by the providers listed above. These providers may operate servers
          outside India, so your data may be transferred to and processed in
          other countries. We rely on reputable providers with security
          commitments and do not transfer data to any country restricted by the
          Government of India.
        </P>
      </Section>

      <Section id="retention" n={7} title="Retention and deletion">
        <UL>
          <li>
            We keep your data for as long as your account is active and as
            needed to provide the Service.
          </li>
          <li>
            You can ask us to delete specific transactions or voice notes by
            email. We remove them from our database once verified.
          </li>
          <li>
            Revoking your Gemini key deletes it immediately from our systems.
          </li>
          <li>
            To delete your account and all associated data, email us. We will
            action verified requests within 30 days. Residual copies in
            provider backups are overwritten on the provider’s normal backup
            cycle.
          </li>
          <li>
            We may retain limited records (for example consent records and
            security logs) where required by law or to resolve disputes.
          </li>
        </UL>
      </Section>

      <Section id="security" n={8} title="Security">
        <P>
          We use reasonable security practices appropriate to the data we hold:
          encrypted connections (HTTPS), encryption of API keys at rest,
          row-level access controls so one user cannot read another’s data,
          verified sign-in tokens, and rate limiting. No system is perfectly
          secure. If a personal data breach affects you, we will notify you and
          the relevant authorities as required by law.
        </P>
      </Section>

      <Section id="cookies" n={9} title="Cookies and local storage">
        <P>
          We use only what is necessary to run the Service: a sign-in session
          (stored by Supabase in cookies), and your theme and consent
          preferences (stored in your browser’s local storage). We do not use
          advertising or third-party analytics cookies.
        </P>
      </Section>

      <Section id="rights" n={10} title="Your rights">
        <P>
          Under the Digital Personal Data Protection Act, 2023 and the
          Information Technology Act, 2000 and its rules, you may:
        </P>
        <UL>
          <li>Ask what personal data we hold about you and how it is used.</li>
          <li>Ask us to correct inaccurate or incomplete data.</li>
          <li>Ask us to erase your data and close your account.</li>
          <li>
            Withdraw your consent at any time (this does not affect past
            processing; some features may stop working).
          </li>
          <li>Nominate another person to exercise your rights if you die or cannot do so.</li>
          <li>Have your grievance addressed (section 13).</li>
        </UL>
        <P>
          You can edit your transactions and revoke your Gemini key inside the
          app. For deletion, access and everything else, email us. If you are
          not satisfied with our response you may approach the Data Protection
          Board of India once it is operational.
        </P>
      </Section>

      <Section id="children" n={11} title="Children">
        <P>
          The Service is meant for people aged {LEGAL.minAge} and over. We do
          not knowingly collect data from anyone under {LEGAL.minAge}. If you
          believe a child has given us data, contact us and we will delete it.
        </P>
      </Section>

      <Section id="changes" n={12} title="Changes to this policy">
        <P>
          We may update this policy as the Service or the law changes. We will
          change the effective date above and, for material changes, ask you to
          review and accept the new version the next time you sign in. See also
          our <a className="text-primary underline underline-offset-2" href={LEGAL_ROUTES.terms}>Terms of Service</a>.
        </P>
      </Section>

      <Section id="grievance" n={13} title="Grievance Officer and contact">
        <P>
          In accordance with the Information Technology Act, 2000 and the rules
          made under it, the details of our Grievance Officer are:
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
