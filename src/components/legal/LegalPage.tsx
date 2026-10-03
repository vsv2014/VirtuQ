import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { NotFound } from '../NotFound';

interface Section {
  heading: string;
  body?: string;
  items?: string[];
}

interface Doc {
  title: string;
  updated: string;
  intro?: string;
  sections: Section[];
}

const DOCS: Record<string, Doc> = {
  terms: {
    title: 'Terms and Conditions',
    updated: '1 January 2026',
    intro:
      'Welcome to TryNStyle! By using our application, you agree to adhere to and be bound by the following terms and conditions. Please read them carefully.',
    sections: [
      {
        heading: '1. Introduction',
        body: 'These terms and conditions outline the rules for your use of TryNStyle, a fashion marketplace platform operated by TryNStyle Technologies Private Limited, based in Bengaluru, India. By accessing our application, you acknowledge and accept these terms in their entirety.',
      },
      {
        heading: '2. Using the App',
        body: 'To use our application, you must be at least 18 years old. You agree to use the application only for legitimate purposes and in a manner that does not infringe on the rights of others.',
      },
      {
        heading: '3. Your Account',
        body: 'Access to certain features requires an account. You agree to provide truthful, current and complete information, and to keep your login credentials secure. You are responsible for activity that happens under your account.',
      },
      {
        heading: '4. Home Trials, Orders and Payments',
        body: 'When you place an order you are requesting a home trial, not making a purchase. You are charged only for the items you choose to keep at the end of the trial period. All orders depend on product availability and confirmation of the order price.',
      },
      {
        heading: '5. Delivery',
        body: 'We deliver to select locations and delivery times may vary based on product availability and your location. While we strive to deliver within the estimated time, we cannot be held responsible for delays caused by factors beyond our control.',
      },
      {
        heading: '6. Returns and Refunds',
        body: 'Returns and refunds follow our Return and Refund Policy. Items must be returned in the condition they were received, with original packaging and tags intact.',
      },
      {
        heading: '7. Limitation of Liability',
        body: 'To the maximum extent allowed by law, TryNStyle will not be liable for any indirect, incidental, special or consequential damages, nor for any loss of profits or revenues.',
      },
      {
        heading: '8. Changes to Terms',
        body: 'We may change these terms at any time. Updates are posted on this page and take effect immediately upon posting.',
      },
      {
        heading: '9. Governing Law',
        body: 'These terms are governed by the laws of India. Disputes fall under the exclusive jurisdiction of the courts in Bengaluru, Karnataka.',
      },
      {
        heading: '10. Contact',
        body: 'Questions about these terms? Reach us at care@trynstyle.com.',
      },
    ],
  },

  privacy: {
    title: 'We Respect Your Privacy',
    updated: '1 January 2026',
    intro:
      'This policy explains what we collect, why we collect it, and the choices you have. We collect the minimum we need to run the service.',
    sections: [
      {
        heading: 'What we collect',
        items: [
          'Mobile number — used to create and secure your account.',
          'Delivery address — used to deliver and collect trial items.',
          'Order and trial history — used to support refunds and disputes.',
          'Basic device and usage data — used to diagnose crashes and improve the app.',
        ],
      },
      {
        heading: 'What we never do',
        items: [
          'We do not sell your personal data.',
          'We do not share your number with marketers.',
          'We do not store full card details on our servers.',
        ],
      },
      {
        heading: 'Your choices',
        body: 'You can update your profile, manage saved addresses, or ask us to delete your account at any time by writing to care@trynstyle.com.',
      },
    ],
  },

  'refund-policy': {
    title: 'Return & Refund Policy',
    updated: '1 January 2026',
    intro:
      'Trying at home is the point of TryNStyle, so returning what you do not love is free and simple.',
    sections: [
      {
        heading: 'Trial window',
        body: 'Your 2-hour trial starts the moment your order is delivered. Decide what to keep before the timer runs out — the app shows the countdown.',
      },
      {
        heading: 'How refunds work',
        items: [
          'You are only charged for the items you mark as "keep".',
          'Items you return are never charged.',
          'If you have already paid and then raise a valid return, the refund is issued to the original payment method within 5–7 business days.',
        ],
      },
      {
        heading: 'Condition of returns',
        body: 'Items must come back unworn, unwashed and with all tags and original packaging. Our delivery partner checks condition at the door and may decline items that do not meet this bar.',
      },
    ],
  },

  faq: {
    title: 'Frequently Asked Questions',
    updated: '1 January 2026',
    sections: [
      {
        heading: 'How does a home trial work?',
        body: 'Pick up to 10 items. We deliver them in about 30 minutes, you try everything for 2 hours, then pay only for what you keep. The rest go back with the delivery partner.',
      },
      {
        heading: 'Do I pay anything upfront?',
        body: 'No. There is no upfront payment. A flat handling fee is added only when you keep at least one item.',
      },
      {
        heading: 'What if the 2 hours is not enough?',
        body: 'The timer is shown on the Home Trial screen. If you need more time, contact support from the order page before it expires.',
      },
      {
        heading: 'Which cities do you serve?',
        body: 'We currently deliver to select pin codes in Bengaluru and Hyderabad, and we are expanding. Enter your pin code at checkout to see if we cover your area.',
      },
      {
        heading: 'Is there a limit on items?',
        body: 'Yes — up to 10 items per trial, with a maximum of 5 units of any single item.',
      },
    ],
  },

  contact: {
    title: 'Contact Us',
    updated: '1 January 2026',
    intro: 'Our customer care team is available every day, 9am to 9pm IST.',
    sections: [
      {
        heading: 'Ways to reach us',
        items: [
          'Email: care@trynstyle.com',
          'Phone: +91 80 4718 2200',
          'Registered office: TryNStyle Technologies Pvt Ltd, Bengaluru, Karnataka, India',
        ],
      },
      {
        heading: 'Faster help',
        body: 'Open the order in My Orders and use "View details" — that gives our team the order reference straight away.',
      },
    ],
  },

  'how-to-return': {
    title: 'How to Return?',
    updated: '1 January 2026',
    intro: 'Returning an item takes about a minute.',
    sections: [
      {
        heading: 'Steps',
        items: [
          'Open Home Trial before your 2-hour window closes.',
          'Keep only what you love — everything else is marked for return.',
          'Complete payment for the items you are keeping.',
          'Open Return Pickup from your order and confirm the collection.',
          'Show the QR code or pickup code to the delivery partner.',
        ],
      },
      {
        heading: 'Good to know',
        body: 'Returns are free. Keep items in their original packaging with tags attached so the pickup is not declined at the door.',
      },
    ],
  },
};

export function LegalPage({ slug }: { slug: string }) {
  const navigate = useNavigate();
  const doc = DOCS[slug];

  if (!doc) return <NotFound />;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-xl bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center">
          <button
            type="button"
            onClick={() => {
              // navigate(-1) strands users who landed here directly, so fall
              // back to the home page when there is no history to go back to.
              if (window.history.length > 1) navigate(-1);
              else navigate('/');
            }}
            aria-label="Go back"
            className="mr-4 rounded-full p-2 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold">{doc.title}</h1>
            <p className="text-sm text-gray-500">Last updated {doc.updated}</p>
          </div>
        </div>

        <div className="prose prose-purple max-w-none">
          {doc.intro ? <p className="text-gray-600">{doc.intro}</p> : null}

          {doc.sections.map((section) => (
            <section key={section.heading} className="mb-8">
              <h2 className="mb-4 text-xl font-semibold">{section.heading}</h2>
              {section.body ? <p className="text-gray-700">{section.body}</p> : null}
              {section.items ? (
                <ul className="list-disc space-y-2 pl-5 text-gray-700">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}

          <p className="text-gray-600">
            Still need help?{' '}
            <Link to="/contact" className="text-purple-600 hover:underline">
              Contact customer care
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
