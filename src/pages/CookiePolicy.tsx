import { Layout } from "@/components/Layout";
import { useCookieConsent } from "@/contexts/CookieConsentContext";
import {
  COOKIE_INVENTORY,
  CONSENT_EXPIRY_DAYS,
  CONSENT_POLICY_LAST_UPDATED,
  CONSENT_POLICY_VERSION,
} from "@/lib/consent/config";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

interface Section {
  title: string;
  body: JSX.Element;
}

const p = (text: string) => <p className="text-muted-foreground leading-relaxed">{text}</p>;

const CookiePolicy = () => {
  const { openSettings, withdrawConsent } = useCookieConsent();

  const sections: Section[] = [
    {
      title: "1. Introduction",
      body: p(
        "This Cookie Policy explains how the website of Master International School, Padamapur uses cookies and similar technologies. It should be read together with our Privacy Policy. This policy is designed with reference to applicable Indian law, including the Digital Personal Data Protection Act, 2023, to the extent applicable and in force. It is provided for transparency and does not constitute legal certification or a guarantee of compliance.",
      ),
    },
    {
      title: "2. What cookies are",
      body: p(
        "Cookies are small data files stored on your device by a website. Similar technologies — such as browser local storage and session storage — can also store small amounts of information on your device. In this policy, “cookies” refers to all of these technologies.",
      ),
    },
    {
      title: "3. Why this website uses cookies",
      body: p(
        "We use a small number of cookies and similar technologies so that the website works correctly (for example, keeping staff and students signed in to their portals), to remember your preferences, and to remember the privacy choices you make. We do not use cookies to advertise to you, and we never use children's information for advertising or profiling.",
      ),
    },
    {
      title: "4. Strictly necessary cookies",
      body: p(
        "These are essential for the website to function and for security: they keep authenticated sessions working for the staff portal, student portal and admission portal, prevent the visitor counter from counting the same visit repeatedly, and store your cookie preferences themselves. They are limited to what is necessary for the service you request and cannot be switched off.",
      ),
    },
    {
      title: "5. Functional cookies",
      body: p(
        "These remember choices you make, such as your light/dark display preference, whether you have dismissed the app-install banner, and whether you have seen an important announcement. They are disabled until you give consent where required.",
      ),
    },
    {
      title: "6. Analytics cookies",
      body: (
        <p className="text-muted-foreground leading-relaxed">
          Analytics cookies would help us understand visitor traffic and website usage patterns.{" "}
          <strong className="text-foreground">
            This website does not currently use any analytics cookies or analytics services.
          </strong>{" "}
          The analytics category is off by default and no analytics technology will be loaded unless you give
          consent and the school has reviewed and activated a specific provider.
        </p>
      ),
    },
    {
      title: "7. Advertising and marketing cookies",
      body: (
        <p className="text-muted-foreground leading-relaxed">
          These cookies measure advertising campaigns and marketing effectiveness.{" "}
          <strong className="text-foreground">
            This website does not use any advertising or marketing cookies, pixels or trackers.
          </strong>{" "}
          We do not use children's information for advertising or profiling.
        </p>
      ),
    },
    {
      title: "8. First-party and third-party cookies",
      body: p(
        "All storage currently used by this website is first-party — it is set by this website itself, on this domain. Our sign-in services are provided by our cloud platform and operate under our own domain configuration. No third-party tracking providers set cookies through this website.",
      ),
    },
    {
      title: "9. Cookie storage duration",
      body: p(
        `Your cookie preferences are remembered for ${CONSENT_EXPIRY_DAYS} days, after which we will ask you to confirm them again. Session-storage items are deleted automatically when you close the browser. Other durations are listed in the cookie inventory below.`,
      ),
    },
    {
      title: "10. Browser cookie controls",
      body: p(
        "Most browsers let you view, delete and block cookies through their settings (usually under “Privacy” or “Security”). Blocking strictly necessary storage may stop sign-in and application forms from working. Browser controls operate alongside — not instead of — the preference controls on this website.",
      ),
    },
    {
      title: "11. How to withdraw consent",
      body: (
        <p className="text-muted-foreground leading-relaxed">
          You can withdraw all optional consent at any time: open{" "}
          <button type="button" onClick={openSettings} className="text-gold font-medium hover:underline">
            Cookie Settings
          </button>{" "}
          and choose “Reject Non-Essential”, or{" "}
          <button type="button" onClick={withdrawConsent} className="text-gold font-medium hover:underline">
            withdraw consent directly
          </button>
          . Withdrawal stops all future optional storage use. Cookies or data already stored by external
          providers (if any are ever enabled) may require separate deletion through your browser or the
          provider's own settings.
        </p>
      ),
    },
    {
      title: "12. How to change cookie preferences",
      body: (
        <p className="text-muted-foreground leading-relaxed">
          Open{" "}
          <button type="button" onClick={openSettings} className="text-gold font-medium hover:underline">
            Cookie Settings
          </button>{" "}
          (also linked in the footer of every page), adjust the categories, and select “Save My Preferences”.
          Your choice is remembered between visits and is never bundled with admission applications or other
          school services.
        </p>
      ),
    },
    {
      title: "13. Cookies used by authentication and payment services",
      body: p(
        "Our staff, student and admission portals keep you signed in using a secure first-party authentication token stored in your browser; this is strictly necessary for those services to work. Fee payments recorded through this website are confirmed by the school office — this website does not embed a third-party payment gateway, so no payment-provider cookies are set.",
      ),
    },
    {
      title: "14. Privacy and personal data",
      body: p(
        "Cookie preferences never contain passwords, payment details, identity documents, student records or other sensitive personal information — only your category choices, the policy version and the date you chose. How we handle personal data generally is described in our Privacy Policy.",
      ),
    },
    {
      title: "15. Third-party services",
      body: p(
        "We reviewed this website's code before publishing this policy. It loads no third-party analytics, advertising, tag-manager or social-media tracking scripts. Fonts, images and documents are served from our own site or our cloud hosting. If a third-party service is ever added, it will be reviewed, listed in the inventory below, and activated only after consent where required.",
      ),
    },
    {
      title: "16. Policy changes",
      body: p(
        `This is version ${CONSENT_POLICY_VERSION} of our Cookie Policy, last updated on ${CONSENT_POLICY_LAST_UPDATED}. If we change this policy or the cookies we use, the version number changes and every visitor is asked to confirm their preferences again.`,
      ),
    },
    {
      title: "17. Contact information",
      body: (
        <p className="text-muted-foreground leading-relaxed">
          Questions about this policy or your privacy choices: Master International School, Gate Chak,
          Padamapur, Anandapur, Odisha 768021 · Phone: +91 70082 82967, +91 91148 60906 · Email:{" "}
          <a href="mailto:mispadamapur@hembram.onmicrosoft.com" className="text-gold hover:underline">
            mispadamapur@hembram.onmicrosoft.com
          </a>
          . You may also use our <Link to="/grievance-redressal" className="text-gold hover:underline">Grievance Redressal</Link> process.
        </p>
      ),
    },
  ];

  return (
    <Layout>
      <Helmet>
        <title>Cookie Policy — Master International School, Padamapur</title>
        <meta
          name="description"
          content="How the Master International School, Padamapur website uses cookies and similar technologies, the categories we use, and how to manage or withdraw your consent."
        />
      </Helmet>

      <section className="pt-32 pb-16 bg-navy">
        <div className="container mx-auto px-4 lg:px-8">
          <span className="text-gold font-semibold text-sm uppercase tracking-wider">Legal</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mt-4 mb-4">Cookie Policy</h1>
          <p className="text-white/70 max-w-2xl">
            Version {CONSENT_POLICY_VERSION} · Last updated {CONSENT_POLICY_LAST_UPDATED}
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <div className="space-y-10">
            {sections.map((section) => (
              <div key={section.title}>
                <h2 className="font-display text-xl font-bold text-foreground mb-3">{section.title}</h2>
                {section.body}
              </div>
            ))}
          </div>

          {/* Verified cookie inventory */}
          <div className="mt-16">
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              Cookie &amp; Storage Inventory
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              Verified against the current website code on {CONSENT_POLICY_LAST_UPDATED}. Only technologies
              that are actually implemented are listed — no analytics or advertising providers are active.
            </p>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-navy text-white text-left">
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold">Type</th>
                    <th className="px-4 py-3 font-semibold">Category</th>
                    <th className="px-4 py-3 font-semibold">Purpose</th>
                    <th className="px-4 py-3 font-semibold">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {COOKIE_INVENTORY.map((item) => (
                    <tr key={item.name} className="border-t border-border align-top">
                      <td className="px-4 py-3 font-mono text-xs">{item.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{item.type}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{item.category}</td>
                      <td className="px-4 py-3 text-muted-foreground">{item.purpose}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{item.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-12 rounded-2xl bg-muted/60 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Want to review or change your choices?
            </p>
            <button
              type="button"
              onClick={openSettings}
              className="inline-flex items-center justify-center rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-navy hover:bg-gold-dark transition-colors"
            >
              Open Cookie Settings
            </button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CookiePolicy;
