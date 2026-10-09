import { Layout } from "@/components/Layout";
import { Helmet } from "react-helmet-async";
import { Link, useLocation } from "react-router-dom";

interface LegalPageSection {
  heading: string;
  paragraphs: string[];
}

interface LegalPageProps {
  title: string;
  description: string;
  lastUpdated: string;
  sections: LegalPageSection[];
}

export const legalPageLinks = [
  { label: "Privacy Policy", to: "/privacy-policy" },
  { label: "Terms of Service", to: "/terms-of-service" },
  { label: "Disclaimer", to: "/disclaimer" },
  { label: "Child Safety Policy", to: "/child-safety-policy" },
  { label: "Accessibility", to: "/accessibility" },
  { label: "Refund Policy", to: "/refund-policy" },
  { label: "Grievance Redressal", to: "/grievance-redressal" },
];

export function LegalPage({ title, description, lastUpdated, sections }: LegalPageProps) {
  const location = useLocation();

  return (
    <Layout>
      <Helmet>
        <title>{title} | Master International School</title>
        <meta name="description" content={description} />
      </Helmet>

      <div className="bg-slate-50 text-slate-900">
        <div className="container mx-auto px-4 py-16 lg:px-8">
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {legalPageLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    location.pathname === link.to
                      ? "border-gold bg-gold/10 text-navy"
                      : "border-slate-200 bg-white text-slate-600 hover:border-gold hover:text-navy"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">
                School Policies & Legal Documentation
              </p>
              <h1 className="mt-4 text-3xl font-bold text-navy md:text-5xl">{title}</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">{description}</p>
              <p className="mt-4 text-sm text-slate-500">Last updated: {lastUpdated}</p>
            </div>
          </div>

          <div className="space-y-8">
            {sections.map((section, index) => (
              <section key={section.heading} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-2xl font-semibold text-navy">
                  {index + 1}. {section.heading}
                </h2>
                <div className="mt-4 space-y-4 text-base leading-7 text-slate-700">
                  {section.paragraphs.map((paragraph, paragraphIndex) => (
                    <p key={`${section.heading}-${paragraphIndex}`}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export function PrivacyPolicyPage() {
  const sections: LegalPageSection[] = [
    {
      heading: "Introduction and scope",
      paragraphs: [
        "Master International School, Padamapur (the \"School\") is committed to protecting the privacy and personal information of parents, guardians, students, staff, applicants, and website visitors in a lawful, secure, and transparent manner.",
        "This Privacy Policy applies to information collected through the School's website, admission forms, student management systems, parent communication channels, fee payment interfaces, employee accounts, and any related digital or offline processes operated by the School or its authorised representatives.",
        "This Policy should be read together with the School's admissions process, fee policies, student handbook, and applicable educational and regulatory requirements. It is intended to explain how the School handles personal data in a manner consistent with the Digital Personal Data Protection Act, 2023, relevant rules issued thereunder, the Information Technology Act, 2000 and associated rules, and other applicable laws and school procedures.",
        "The School does not claim that every provision of the law is already in force in all respects at any given time. Where a provision is phased, conditional, or depends on commencement notification, the School will comply with the relevant applicable legal requirements as they come into force."
      ]
    },
    {
      heading: "Information we collect",
      paragraphs: [
        "The School may collect personal information from parents, guardians, students, applicants, teachers, employees, and website visitors, including contact details, demographic information, academic data, identity-related information relevant to admissions, fees, attendance records, and communication history.",
        "For admission and academic processes, the School may collect details such as a student's name, date of birth, gender, residence address, previous school information, photographs, documents required for admission verification, class applied for, and academic records. Parent or guardian details may include name, relation to student, mobile number, email address, address, occupation, emergency contacts, and consent records.",
        "The School may also collect staff and teacher information such as name, qualification, experience, service records, identification details used for employment administration, payment information, professional contact details, and login credentials necessary for approved school systems.",
        "Website visitors may be recorded through general technical information such as IP address, browser type, operating system, pages visited, time of visit, referral source, and server logs. Cookies and analytics tools may be used to measure usage, improve services, and monitor website performance."
      ]
    },
    {
      heading: "Admission and student records",
      paragraphs: [
        "Student admission forms and educational records may include academic performance, attendance, class information, examination results, assignment records, transportation details, health information where necessary for school administration, and personal information required for regulatory or compliance purposes.",
        "The School may process academic data for admissions, class allocation, timetable planning, student support, evaluation, report generation, parent communication, attendance monitoring, and lawful administrative reporting. This may also include evaluation data, teacher remarks, classroom participation, and internal school records created in the course of educational administration.",
        "Student information is treated as sensitive and should only be accessed by authorised personnel who need it for legitimate school functions. Where required by law or appropriate school policy, the School may keep records related to examinations, discipline, attendance, medical conditions relevant to school operations, and support requirements."
      ]
    },
    {
      heading: "Parent and guardian information",
      paragraphs: [
        "The School may collect and maintain parent and guardian contact information to communicate about admissions, academic progress, fees, notices, emergency situations, school events, and other operational matters. This may include mobile numbers, email addresses, residential addresses, alternate contacts, and correspondence history.",
        "This information may be used for communication, verification, consent management, emergency response, fee reminders, and school updates. Parents and guardians are expected to provide accurate and current information and to inform the School of changes to contact details that may affect communication or safety."
      ]
    },
    {
      heading: "Fee payment and financial information",
      paragraphs: [
        "The School may collect information relevant to fee collection, including invoice references, fee schedules, payment status, transaction references, student and parent identifiers, and bank or payment gateway confirmations. Financial information may be handled through approved payment service providers or payment gateways.",
        "The School does not store full card details in its general systems when the payment is processed through a secure third-party gateway, and card data should be provided only to the gateway or to the payment method used by the payer as applicable. If financial data is received through the School for operational reasons, it will be safeguarded and used only to the extent necessary and permitted by law."
      ]
    },
    {
      heading: "Teacher and staff information",
      paragraphs: [
        "The School may hold details for teaching and non-teaching staff such as professional qualifications, employment records, contact information, salary, attendance, leave details, and logins to internal systems. Such information is processed to support employment administration, payroll, communication, workforce management, internal compliance, and school operations.",
        "Access to staff data is limited to authorised personnel and controlled by role-based permissions. The School uses reasonable technical and organisational safeguards to reduce the risk of unauthorised access or misuse."
      ]
    },
    {
      heading: "Purposes of processing and lawful basis",
      paragraphs: [
        "The School processes personal information for legitimate educational, administrative, safety, and operational purposes, including admission processing, student support, fee administration, attendance and academic management, communication with parents and guardians, staff administration, regulatory compliance, and the maintenance of school records.",
        "Where required by law, the School will rely on applicable lawful grounds, including consent where legally required, contractual necessity where relevant, compliance with legal obligations, protection of vital interests, and legitimate interests of the School in running a secure and efficient educational institution. The School will seek consent where required by applicable law and will keep records of the manner in which consent was obtained and used.",
        "The School may also process personal information to prevent fraud, respond to security incidents, support emergency communication, maintain safety protocols, and fulfil obligations under applicable law or official directions."
      ]
    },
    {
      heading: "Protection of children and student data",
      paragraphs: [
        "The School recognises that student information may include data belonging to minors and therefore adopts specific safeguards to protect children. The School will not publicly disclose sensitive student information such as addresses, personal phone numbers, identity documents, passwords, medical information, or other confidential data without lawful basis and appropriate consent where required.",
        "Parents and guardians may be asked to provide consent for certain uses of a child's information, especially where personal images, school events, publications, or broader digital communications are involved. Consent will not be assumed to cover every possible public use of a child's information. The School will limit disclosure of student information to what is necessary and authorised under law and policy."
      ]
    },
    {
      heading: "Sharing, service providers and legal disclosures",
      paragraphs: [
        "The School may share personal information with authorised service providers that assist with IT systems, cloud hosting, communication, examination management, payment processing, analytics, and other operational support, subject to confidentiality obligations and technical safeguards. These providers are expected to process information only for the specified purpose and to protect it in accordance with applicable law.",
        "The School may also disclose personal information where required by law, court order, police or regulatory authority direction, child protection obligations, statutory reporting, or other lawful requirement. Such disclosures will be limited to the extent necessary and lawfully required, and the School will seek to provide notice where appropriate and legally permissible."
      ]
    },
    {
      heading: "Information security and breach response",
      paragraphs: [
        "The School uses reasonable administrative, technical, and physical security measures to protect personal information from unauthorised access, misuse, alteration, loss, or disclosure. These measures may include access restrictions, role-based permissions, password controls, secure hosting, monitoring, and review of internal systems. However, no system can be guaranteed to be completely secure and the School cannot be responsible for data compromises caused by circumstances beyond its reasonable control.",
        "If a data breach or unauthorised access is suspected, the School will assess the nature and extent of the incident, contain the issue, and determine whether the breach is required to be notified to the relevant authority or affected individual under applicable law. The School will cooperate with affected parties and regulators when legal notification obligations apply."
      ]
    },
    {
      heading: "Cookies, analytics and external links",
      paragraphs: [
        "The School may use cookies or similar technologies to support the website's operation, improve user experience, monitor website performance, and understand usage trends. Some cookies are session-based and expire when the browser closes, while others may remain for a defined period. Visitors can manage preferences through browser settings, subject to the limitations of the website's functionality.",
        "The School may also use analytics or third-party services to understand traffic and improve website quality. The School's website may contain links to external sites, including education portals, government websites, or service providers. The School is not responsible for the privacy practices, content, or policies of third-party websites and encourages users to review those notices carefully."
      ]
    },
    {
      heading: "Retention, correction, access and grievance",
      paragraphs: [
        "The School will retain personal information only for as long as required to fulfil the purposes for which it was collected, to meet legal or regulatory obligations, or to manage operational needs. Records will be securely deleted or anonymised when no longer required, subject to relevant retention obligations and lawful exceptions.",
        "Parents, guardians, staff, and other individuals may request access to their personal information, ask for correction of inaccurate data, or seek deletion or restriction of processing to the extent such action is lawful and practicable. Requests should be made through the School's designated contact channels. The School may require identification or reasonable information to process such requests and may deny or limit a request where permitted by law, such as where records must be retained for legal, safety, or operational purposes.",
        "Any grievance, complaint, or concern regarding privacy or data handling may be raised with the School through the grievance mechanism described in the School's grievance redressal policy. The School will review complaints reasonably and in good faith and may coordinate with relevant staff or authorities where required by law."
      ]
    },
    {
      heading: "Changes to this policy",
      paragraphs: [
        "The School may update this Privacy Policy from time to time to reflect changes in law, the School's practices, website operations, or the services offered. Material changes will be communicated through the website or by direct communication where appropriate.",
        "Users are encouraged to review this page periodically to stay informed about how personal information is used and protected. Continued use of the School's website, portal, or services after a change becomes effective indicates acceptance of the updated policy, subject to any applicable legal rights or requirements."
      ]
    },
    {
      heading: "Contact",
      paragraphs: [
        "For privacy-related concerns, requests, or grievances, please contact the School through the contact information published on the website or via the School's grievance redressal page. Please include sufficient details to allow the School to identify the matter and respond appropriately.",
        "The School will use reasonable efforts to address privacy concerns in a timely manner, subject to the applicable legal framework and the practical administrative needs of the institution."
      ]
    }
  ];

  return (
    <LegalPage
      title="Privacy Policy"
      description="This Privacy Policy explains how Master International School, Padamapur collects, uses, protects, shares, and manages personal information relating to students, parents, staff, applicants, and visitors to its website and related services."
      lastUpdated="15 March 2026"
      sections={sections}
    />
  );
}

export function TermsOfServicePage() {
  const sections: LegalPageSection[] = [
    {
      heading: "Acceptance of terms",
      paragraphs: [
        "By accessing or using the Master International School, Padamapur website, portals, or related online services, you agree to be bound by these Terms of Service, subject to applicable law and any separate written agreement governing your relationship with the School.",
        "These Terms apply to parents, guardians, students, applicants, teachers, employees, staff, and visitors who access the School's website or accounts. They do not replace separate admission rules, student handbooks, employment policies, fee terms, or other formal agreements that may apply in a specific context."
      ]
    },
    {
      heading: "Purpose and scope",
      paragraphs: [
        "The website is intended to provide general information about the School, admissions, academics, staff, facilities, policies, notices, communication channels, and selected online services. It is an informational and administrative resource and does not constitute a binding contract for admission, employment, or any other relationship unless separately agreed in writing.",
        "The School may update or change content on the website, and users should rely on official notices, written communications, and lawful regulatory requirements where these supersede website information."
      ]
    },
    {
      heading: "Eligibility and authorised use",
      paragraphs: [
        "The website is intended for lawful use by authorised users, including current or prospective students, parents, guardians, applicants, school staff, and the general public seeking educational information. Users must use the website in a manner consistent with applicable law, school policies, and reasonable community standards.",
        "Users must not impersonate another person or use the website in a way that misrepresents identity, interferes with school operations, or creates security or privacy risks."
      ]
    },
    {
      heading: "User responsibilities",
      paragraphs: [
        "Parents, guardians, students, applicants, and staff are responsible for providing accurate and complete information when submitting forms, documents, or information online. The School may rely on the information provided unless it is clearly inaccurate or fraudulent.",
        "Users are expected to keep account credentials confidential, use only authorised access, and promptly notify the School if they suspect unauthorised access, compromise, or misuse of their account. The School may suspend or restrict access to accounts where necessary for security, compliance, or lawful operational reasons."
      ]
    },
    {
      heading: "Admission applications and communications",
      paragraphs: [
        "Admission-related information submitted via the website is used to process applications, communicate with applicants, and assess eligibility according to the relevant admission criteria, timelines, and rules of the School. Admission decisions remain subject to the School's admissions process and applicable regulatory requirements.",
        "The School may contact applicants and parents through email, SMS, telephone, or other authorised channels for admission updates, document requests, fees, or notices. Applicants should provide accurate contact details and update the School when those details change."
      ]
    },
    {
      heading: "Account access and security",
      paragraphs: [
        "Student, parent, staff, and administrator access to online portals or systems must comply with the School's access control procedures, password rules, and role-based permissions. Users may be required to use secure credentials, protect login details, and avoid sharing accounts with third parties.",
        "The School may disable or restrict access if it reasonably suspects misuse, unauthorised access, credential compromise, abuse, or violation of these Terms. The School is not responsible for losses caused by user negligence, weak password practices, or sharing of credentials."
      ]
    },
    {
      heading: "Fee payment and transactions",
      paragraphs: [
        "If fee payment or transaction functionality is provided through the website or an authorised payment gateway, users must ensure that they are using the correct payment channel and agree to the terms of the payment processor as applicable. Payment confirmation, invoices, and transaction references are subject to the School's fee policies and the payment provider's procedures.",
        "The School may process or verify payments through approved service providers and may issue confirmation only after the payment is successfully received and acknowledged. Refunds and cancellations, where applicable, will be handled in accordance with the School's Refund, Cancellation & Fee Policy and applicable law."
      ]
    },
    {
      heading: "Intellectual property",
      paragraphs: [
        "All content displayed on the School's website, including text, images, graphics, logos, videos, teaching resources, forms, and design elements, is owned by the School or used under valid authorisation. The School's name, logo, branding, and related intellectual property are protected and may not be used without the School's prior written permission.",
        "Users must not reproduce, republish, scrape, copy, modify, or distribute website content in a manner that infringes copyright or other rights without proper permission. The School reserves all rights to enforce these protections where legally appropriate."
      ]
    },
    {
      heading: "Acceptable use and prohibited conduct",
      paragraphs: [
        "Users must not use the website to engage in hacking, unauthorised access, data scraping, malware distribution, attempts to bypass security controls, or interference with the operation of the School's systems or services. This includes attempts to access student data or confidential information without lawful authority."
      ]
    },
    {
      heading: "Website availability and limitation of liability",
      paragraphs: [
        "The School endeavours to keep the website available and functional, but no website can guarantee uninterrupted access or error-free service. Maintenance, technical upgrades, internet disruptions, server issues, and third-party outages may affect availability. The School may suspend or modify website functionality temporarily when necessary.",
        "To the maximum extent permitted by applicable law, the School shall not be liable for direct, incidental, consequential, or indirect damages arising from the use or inability to use the website, including loss of data, interruption of services, or reliance on inaccurate information. The School's liability, where enforceable, is limited to the extent permitted by law."
      ]
    },
    {
      heading: "External links and third-party services",
      paragraphs: [
        "The website may include links to government websites, educational portals, payment gateways, social media platforms, or other third-party resources. The School is not responsible for the content, reliability, privacy practices, or terms of such third-party services and encourages users to review those notices before use."
      ]
    },
    {
      heading: "Indemnity, dispute resolution and law",
      paragraphs: [
        "To the extent legally enforceable, users agree to indemnify the School against claims or losses arising from their misuse of the website, breach of these Terms, unauthorised access, or false information provided to the School. However, indemnity obligations will not be applied beyond what is lawful or enforceable under Indian law.",
        "These Terms are governed by the laws of India and the courts having jurisdiction in Odisha, India, shall be competent to hear disputes arising under or in connection with these Terms, subject to any other legal rights or remedies available to the user under applicable law.",
        "The School may amend these Terms from time to time. Continued use of the website after changes become effective constitutes acceptance of the revised Terms."
      ]
    },
    {
      heading: "Contact",
      paragraphs: [
        "For any legal, service, or access-related questions, users may contact the School through the contact details published on the website. The School will respond as reasonably possible in relation to the matter raised."
      ]
    }
  ];

  return (
    <LegalPage
      title="Terms of Service"
      description="These Terms of Service set out the rules governing access to and use of the Master International School, Padamapur website, portals, account-based services, and relevant digital communication channels."
      lastUpdated="15 March 2026"
      sections={sections}
    />
  );
}

export function DisclaimerPage() {
  const sections: LegalPageSection[] = [
    {
      heading: "General educational information",
      paragraphs: [
        "The website provides general educational and institutional information for convenience and informational purposes only. It is not a substitute for official written notices, statutory publications, admissions communications, school handbooks, or specific legal or regulatory guidance applicable to a person or situation.",
        "Information may change as academic schedules, admissions processes, fee structures, staffing, and school activities are updated. Users should verify important details with the School's authorised administrative office or published official communications before relying on information posted on the website."
      ]
    },
    {
      heading: "Accuracy and updates",
      paragraphs: [
        "The School endeavours to maintain accurate information, but it cannot guarantee that every page, notice, or document on the website is complete, current, or error-free, particularly where information is subject to change, delays, approvals, or external regulatory updates.",
        "The School may revise, correct, or remove information at any time without prior notice. Official school notices, written admissions communications, regulatory instructions, and other formal documents will generally take precedence over outdated website materials where legally appropriate."
      ]
    },
    {
      heading: "Admissions, examinations and notices",
      paragraphs: [
        "Any admissions announcements, examination schedules, school notices, fee deadlines, and academic information appearing on the website are informational only unless confirmed by official communication from the School. Admission eligibility, fee structures, class eligibility, and examination timetables may depend on formal verification and policy updates.",
        "The School may amend dates, programmes, or administrative procedures in accordance with academic schedules, regulatory guidance, or practical considerations. Users should verify essential details directly with the School before acting on them."
      ]
    },
    {
      heading: "Third-party links and services",
      paragraphs: [
        "The website may contain links to government portals, exam authorities, payment gateways, or other third-party services. The School does not control the content, security, privacy practices, or reliability of those external websites and services. The School is not responsible for errors, delays, interruptions, or losses arising from those third-party resources."
      ]
    },
    {
      heading: "Availability and technical limitations",
      paragraphs: [
        "The School may experience technical interruptions, scheduled maintenance, network outages, or system failures affecting website functionality. The School makes no guarantee that the website will be uninterrupted, secure, or error-free at all times. Users should not rely solely on the website for time-sensitive or critical decisions."
      ]
    },
    {
      heading: "Copyright and trademarks",
      paragraphs: [
        "All website content, including school branding, photographs, logos, educational materials, and written content, may be protected by copyright, trademark, or other intellectual property rights. School branding and official materials should not be reused without written permission from the School."
      ]
    },
    {
      heading: "Limitation of liability and statutory rights",
      paragraphs: [
        "To the extent permitted by law, the School disclaims all warranties, express or implied, with respect to the website and related content, including but not limited to merchantability, fitness for a particular purpose, and non-infringement. The School shall not be liable for any direct, incidental, consequential, or indirect damages arising from reliance on the website or its content.",
        "This disclaimer is intended to be read consistently with applicable Indian law and does not waive any rights or remedies that cannot lawfully be excluded or limited by contract or statute."
      ]
    }
  ];

  return (
    <LegalPage
      title="Disclaimer"
      description="This Disclaimer explains the limits of the information published on the Master International School, Padamapur website and clarifies that official school communications and applicable legal requirements take precedence whenever there is a conflict."
      lastUpdated="15 March 2026"
      sections={sections}
    />
  );
}

export function ChildSafetyPolicyPage() {
  const sections: LegalPageSection[] = [
    {
      heading: "Purpose and scope",
      paragraphs: [
        "Master International School, Padamapur recognises its responsibility to protect the personal information and wellbeing of students, especially children and minors. This Child Safety & Student Data Protection Policy explains how the School handles personal information and takes reasonable steps to reduce risk related to unauthorised disclosure, misuse, or inappropriate public exposure of student data."
      ]
    },
    {
      heading: "Parental consent and lawful handling",
      paragraphs: [
        "The School will process child-related personal information only for legitimate educational, administrative, safety, and lawful purposes. Where required by law or school practice, the School will obtain reasonable parental or guardian consent before using a student's data in a manner that is not strictly necessary for school operations or educational administration. Consent will not be assumed to authorise every public use of a child's image or personal information."
      ]
    },
    {
      heading: "Photographs, videos and publications",
      paragraphs: [
        "Student photographs, videos, event coverage, and school publications may be used only where there is a lawful basis and where the School has taken reasonable steps to protect student dignity, privacy, and safety. Sensitive student information, personal addresses, identity documents, medical information, or contact details will not be publicly published without appropriate legal basis and authorised disclosure.",
        "Where the School uses student images or names in school marketing or public communication, it will do so in a limited and respectful manner and will follow applicable consent and privacy requirements. In cases of concern, parents or guardians may raise specific objections regarding publication."
      ]
    },
    {
      heading: "Student records and role-based access",
      paragraphs: [
        "Student records will be kept only for lawful educational and administrative purposes and will be accessible only to authorised staff members whose responsibilities require access. Role-based permissions, account controls, and secure data handling procedures reduce the risk of unauthorised viewing or disclosure.",
        "Confidentiality must be maintained for student profiles, examination results, attendance logs, discipline records, medical or support information, and any other sensitive internal information. Staff and administrators are expected to use information strictly in accordance with their assigned responsibilities and relevant privacy rules."
      ]
    },
    {
      heading: "Prevention of unauthorised access",
      paragraphs: [
        "The School will implement reasonable procedures to prevent unauthorised access to student-related systems, including protected logins, restricted access control, secure information systems, staff training, and documented internal rules regarding student confidentiality. The School may suspend or restrict access in cases of suspected misuse or policy violation."
      ]
    },
    {
      heading: "Reporting incidents and responding to concerns",
      paragraphs: [
        "Any suspected exposure, unauthorised disclosure, or inappropriate access to student data should be reported to the School without delay. The School will take steps to assess the incident, contain the risk, and determine whether notification or corrective action is required under applicable law or internal procedures.",
        "Parents, guardians, staff, and students are encouraged to raise concerns promptly so that protective action can be taken in a timely manner."
      ]
    },
    {
      heading: "Retention, deletion and secure communication",
      paragraphs: [
        "Student information should be retained only for the period necessary for educational, administrative, legal, or regulatory purposes. When no longer required, records will be archived or deleted securely in accordance with the School's retention schedule, applicable law, and documented internal procedures.",
        "Secure communication methods should be used for parent or guardian contact, especially when sharing student information or sensitive documents. The School will avoid public disclosure of personal details and will limit the sharing of student information to authorised recipients."
      ]
    },
    {
      heading: "Compliance with child protection and data laws",
      paragraphs: [
        "The School will act in accordance with applicable child protection, education, and data protection laws, including lawful requirements concerning collection, use, access, disclosure, and retention of minor-related information. The School's policies should be interpreted consistently with the Digital Personal Data Protection Act, 2023, relevant rules, and other applicable legal requirements. Where a legal requirement is temporary, phased, or conditional, the School will comply with the version of the law that applies at the relevant time."
      ]
    }
  ];

  return (
    <LegalPage
      title="Child Safety & Student Data Protection Policy"
      description="This policy sets out the School's approach to protecting children's personal information, maintaining safe digital and physical environments, and ensuring responsible handling of student data."
      lastUpdated="15 March 2026"
      sections={sections}
    />
  );
}

export function AccessibilityPage() {
  const sections: LegalPageSection[] = [
    {
      heading: "Our commitment",
      paragraphs: [
        "Master International School is committed to making its website accessible to people with disabilities. We aim to provide a website that is usable, clear, and navigable for visitors using assistive technologies, keyboard-only navigation, screen readers, and responsive devices."
      ]
    },
    {
      heading: "Keyboard and navigation support",
      paragraphs: [
        "The website should be navigable without a mouse wherever practicable. Interactive elements such as links, buttons, menus, form fields, and controls are expected to be reachable using a keyboard and to provide clear focus visibility. Content should be organised logically so that screen reader users can understand sections and move through the information efficiently."
      ]
    },
    {
      heading: "Accessible content and forms",
      paragraphs: [
        "Forms and input fields should include clear labels, helpful error messages, and accessible validation where applicable. Information should be written in clear, readable language, and pages should be structured in a way that supports consistent navigation and understanding. Adequate colour contrast, readable font sizes, and responsive layout design are used to improve readability for users with visual or cognitive needs.",
        "Meaningful images and graphics should include alternative text or equivalent descriptive information where relevant. In cases where an image is decorative, it should not create unnecessary noise for assistive technology users."
      ]
    },
    {
      heading: "Responsive design and assistive technology",
      paragraphs: [
        "The website is designed to be responsive across desktop, tablet, and mobile devices to support different browsing needs. Videos, documents, and embedded media should be made accessible where reasonably possible by providing alternative text, transcripts, captions, or plain-language summaries when appropriate.",
        "The School continues to improve the accessibility of its digital content and encourages feedback on any barriers that may prevent access to information or services."
      ]
    },
    {
      heading: "Feedback and continuous improvement",
      paragraphs: [
        "If you experience difficulty accessing content on the website, please contact the School using the contact information provided on the website. The School will review the accessibility concern and make reasonable efforts to address barriers or provide a suitable alternative format where appropriate."
      ]
    }
  ];

  return (
    <LegalPage
      title="Website Accessibility Statement"
      description="This Accessibility Statement explains the School's commitment to making its website accessible to all users, including persons with disabilities, by following accessible design and user experience practices."
      lastUpdated="15 March 2026"
      sections={sections}
    />
  );
}

export function RefundPolicyPage() {
  const sections: LegalPageSection[] = [
    {
      heading: "Scope of this policy",
      paragraphs: [
        "This Refund, Cancellation & Fee Policy applies to fee-related transactions, admissions fees, refundable deposits, and other school charges where the School has communicated a fee policy or collected payment for a school service.",
        "The policy is intended to provide clarity and fairness in processing cancellations and refunds. It does not override any separate written agreement, statutory requirement, or law that may apply to a particular payment or service."
      ]
    },
    {
      heading: "Fee payment and schedule",
      paragraphs: [
        "School fees, admission charges, and term-wise payments are governed by the School's published fee schedule, admission notices, and applicable policies. The School may revise fee schedules or payment deadlines from time to time according to operational or regulatory requirements.",
        "Payments must be made within the prescribed deadlines. Late fees, non-payment consequences, or administrative action may apply where the School's fee policy or applicable law allows such measures."
      ]
    },
    {
      heading: "Refunds and cancellations",
      paragraphs: [
        "Refunds may be considered only in cases expressly permitted by the applicable fee policy, official communication, or law. Refunds may be denied or partially processed depending on the stage of admission, service provision, fee collection, or administrative processing. The School will consider each case objectively and communicate the outcome in writing.",
        "For admissions or fee-related cancellations, the School may require the submission of a formal request, documentary proof, and processing timelines before a refund can be approved. Any refund will typically be processed using the same payment channel used for the original payment, subject to the payment provider's rules and applicable law."
      ]
    },
    {
      heading: "Non-refundable charges",
      paragraphs: [
        "Certain charges may be non-refundable, including administrative costs, application handling charges, registration charges, processing fees, or charges already incurred for services or resources that have been provided. The School may also retain funds where a service has been rendered, a seat has been reserved, or a formal commitment has occurred."
      ]
    },
    {
      heading: "Disputes and enquiries",
      paragraphs: [
        "Where a payer disputes a payment or refund request, the School may request supporting documents, transaction references, and written explanations. The School will review the dispute reasonably and communicate the result in a timely manner. Nothing in this policy prevents a person from pursuing any statutory remedies or consumer rights available under applicable law."
      ]
    }
  ];

  return (
    <LegalPage
      title="Refund, Cancellation & Fee Policy"
      description="This policy explains how the School handles tuition and admission-related fee payments, cancellations, and refund requests in a fair and transparent manner and subject to applicable law."
      lastUpdated="15 March 2026"
      sections={sections}
    />
  );
}

export function GrievanceRedressalPage() {
  const sections: LegalPageSection[] = [
    {
      heading: "Purpose",
      paragraphs: [
        "The School is committed to receiving and addressing complaints or concerns in a fair, respectful, and timely manner. This grievance redressal page outlines the process for raising concerns related to privacy, admissions, website use, fee matters, student welfare, school operations, or other relevant issues."
      ]
    },
    {
      heading: "How to contact the School",
      paragraphs: [
        "Complaints and concerns may be sent through the contact information published on the School's website, including the official email address, telephone numbers, or school administrative office contact details. Please provide the nature of the complaint, relevant facts, dates, supporting evidence, and any contact information needed for a response."
      ]
    },
    {
      heading: "Acknowledgement and review",
      paragraphs: [
        "The School will acknowledge complaints as reasonably practicable and review the matter in line with internal procedures, applicable law, and the School's policies. Complainants may be asked for additional information where needed to understand the issue or identify the correct school authority to handle it."
      ]
    },
    {
      heading: "Escalation and resolution",
      paragraphs: [
        "If the issue is not resolved at the first point of contact, the matter may be escalated to a senior school official or the competent administrative authority responsible for the relevant area. The School will aim to resolve matters promptly, respectfully, and in a manner consistent with policy and legal obligations."
      ]
    },
    {
      heading: "Privacy and confidentiality",
      paragraphs: [
        "The School will handle complaints in a manner consistent with its privacy policies and child-protection obligations. Personal information provided as part of a complaint will be used only for the purpose of reviewing and resolving the matter, subject to lawful disclosure requirements."
      ]
    }
  ];

  return (
    <LegalPage
      title="Contact & Grievance Redressal"
      description="This page explains how to contact the School with concerns about privacy, fees, admission, student welfare, website issues, or other service matters."
      lastUpdated="15 March 2026"
      sections={sections}
    />
  );
}
