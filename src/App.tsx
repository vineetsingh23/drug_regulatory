import {
  ArrowRight,
  BadgeCheck,
  Bell,
  BriefcaseMedical,
  Building2,
  CalendarCheck,
  Check,
  ChevronRight,
  ClipboardCheck,
  FileCheck2,
  FileText,
  FolderUp,
  LayoutDashboard,
  LockKeyhole,
  LogIn,
  Menu,
  MessageSquareText,
  Send,
  Search,
  ShieldCheck,
  Smartphone,
  UploadCloud,
  UserRoundCheck,
  X,
} from 'lucide-react';
import type { ComponentType, FormEvent, ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { createServiceProposal, type ProposalFormData } from './lib/proposals';
import { isSupabaseConfigured } from './lib/supabase';

type Role = 'customer' | 'owner';
type View = 'home' | 'login' | 'proposal' | 'customer' | 'owner';
type FeeStatus = 'Pending review' | 'Quotation sent' | 'Accepted';
type StageStatus = 'done' | 'active' | 'next';

type ServiceStage = {
  label: string;
  status: StageStatus;
  date?: string;
};

type CommunicationLog = {
  id: string;
  type: string;
  title: string;
  message: string;
  actor: string;
  role: Role;
  date: string;
};

type DocumentItem = {
  name: string;
  type: string;
  status: 'Received' | 'Required' | 'In review';
  owner: string;
};

type ServiceRequest = {
  id: string;
  customer: string;
  company: string;
  service: string;
  product: string;
  market: string;
  status: string;
  priority: 'High' | 'Medium' | 'Normal';
  feeStatus: FeeStatus;
  dueDate: string;
  nextStep: string;
  stages: ServiceStage[];
  documents: DocumentItem[];
  logs: CommunicationLog[];
};

type IconType = ComponentType<{ className?: string }>;

const services = [
  'Drug registration and market authorization',
  'CTD and eCTD dossier preparation',
  'Clinical trial application support',
  'Pharmacovigilance and compliance documentation',
  'GMP, GDP, labeling, and artwork review',
  'FDA, EMA, CDSCO, MHRA, and WHO regulatory support',
];

const stages: ServiceStage[] = [
  { label: 'Proposal submitted', status: 'done', date: '28 Jun' },
  { label: 'Documents screened', status: 'done', date: '29 Jun' },
  { label: 'Fee accepted', status: 'done', date: '30 Jun' },
  { label: 'Dossier preparation', status: 'active', date: 'In progress' },
  { label: 'Regulatory review', status: 'next' },
  { label: 'Authority submission', status: 'next' },
  { label: 'Completion', status: 'next' },
];

const requests: ServiceRequest[] = [
  {
    id: 'RS-2026-014',
    customer: 'Anita Mehra',
    company: 'Aster Biopharma Pvt Ltd',
    service: 'CDSCO drug registration',
    product: 'Sterile injectable antibiotic',
    market: 'India',
    status: 'Dossier preparation',
    priority: 'High',
    feeStatus: 'Accepted',
    dueDate: '12 Jul 2026',
    nextStep: 'Upload stability study report and updated manufacturing license.',
    stages,
    documents: [
      { name: 'Product composition statement.pdf', type: 'Product data', status: 'Received', owner: 'Customer' },
      { name: 'Manufacturing license.pdf', type: 'License', status: 'Required', owner: 'Customer' },
      { name: 'Stability study report.xlsx', type: 'Technical', status: 'Required', owner: 'Customer' },
      { name: 'Draft regulatory checklist.pdf', type: 'Internal review', status: 'In review', owner: 'Owner' },
    ],
    logs: [
      {
        id: 'L-01',
        type: 'proposal_submitted',
        title: 'Proposal submitted',
        message: 'Customer submitted service request with initial product details and target market.',
        actor: 'Anita Mehra',
        role: 'customer',
        date: '28 Jun 2026, 10:15 AM',
      },
      {
        id: 'L-02',
        type: 'quotation_sent',
        title: 'Fee quotation sent',
        message: 'Owner shared fee criteria, estimated timeline, and document checklist.',
        actor: 'Regulatory Owner',
        role: 'owner',
        date: '29 Jun 2026, 04:20 PM',
      },
      {
        id: 'L-03',
        type: 'quotation_accepted',
        title: 'Fee criteria accepted',
        message: 'Customer accepted the quotation and authorized work to begin.',
        actor: 'Anita Mehra',
        role: 'customer',
        date: '30 Jun 2026, 09:05 AM',
      },
      {
        id: 'L-04',
        type: 'status_updated',
        title: 'Status updated to Dossier preparation',
        message: 'Technical team started compiling the CTD module checklist and gap report.',
        actor: 'Regulatory Owner',
        role: 'owner',
        date: '30 Jun 2026, 12:40 PM',
      },
    ],
  },
  {
    id: 'RS-2026-018',
    customer: 'Rahul Shah',
    company: 'NovaCure Labs',
    service: 'Labeling and artwork review',
    product: 'Oral solid dosage product',
    market: 'EU',
    status: 'Fee quotation sent',
    priority: 'Medium',
    feeStatus: 'Quotation sent',
    dueDate: '18 Jul 2026',
    nextStep: 'Waiting for customer acceptance of fee criteria.',
    stages: [
      { label: 'Proposal submitted', status: 'done', date: '27 Jun' },
      { label: 'Documents screened', status: 'done', date: '28 Jun' },
      { label: 'Fee quotation', status: 'active', date: 'Awaiting acceptance' },
      { label: 'Artwork review', status: 'next' },
      { label: 'Compliance report', status: 'next' },
    ],
    documents: [
      { name: 'Primary label artwork.ai', type: 'Artwork', status: 'Received', owner: 'Customer' },
      { name: 'SmPC draft.docx', type: 'Labeling', status: 'In review', owner: 'Owner' },
    ],
    logs: [
      {
        id: 'L-05',
        type: 'proposal_submitted',
        title: 'New proposal received',
        message: 'Customer requested EU labeling review and uploaded artwork files.',
        actor: 'Rahul Shah',
        role: 'customer',
        date: '27 Jun 2026, 01:35 PM',
      },
    ],
  },
];

const metrics = [
  { label: 'Active requests', value: '24', detail: '+6 this week', icon: ClipboardCheck },
  { label: 'Awaiting customer', value: '7', detail: 'documents or acceptance', icon: Bell },
  { label: 'Due in 7 days', value: '5', detail: 'priority files', icon: CalendarCheck },
  { label: 'Completed month', value: '11', detail: 'closed services', icon: BadgeCheck },
];

const footerGroups = [
  {
    title: 'Pages',
    links: [
      { label: 'Home', view: 'home' },
      { label: 'Services', view: 'home' },
      { label: 'Submit proposal', view: 'proposal' },
      { label: 'Login', view: 'login' },
    ],
  },
  {
    title: 'Portal',
    links: [
      { label: 'Customer dashboard', view: 'customer' },
      { label: 'Owner dashboard', view: 'owner' },
      { label: 'Documents', view: 'customer' },
      { label: 'Communication log', view: 'customer' },
    ],
  },
] satisfies { title: string; links: { label: string; view: View }[] }[];

const socialLinks = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com' },
  { label: 'Facebook', href: 'https://www.facebook.com' },
  { label: 'X', href: 'https://x.com' },
  { label: 'YouTube', href: 'https://www.youtube.com' },
];

function App() {
  const [view, setView] = useState<View>('home');
  const [role, setRole] = useState<Role>('customer');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeRequest = requests[0];

  const content = useMemo(() => {
    if (view === 'login') {
      return <LoginPage role={role} setRole={setRole} setView={setView} />;
    }

    if (view === 'proposal') {
      return <ProposalPage setView={setView} />;
    }

    if (view === 'customer') {
      return <CustomerDashboard request={activeRequest} setView={setView} />;
    }

    if (view === 'owner') {
      return <OwnerDashboard requests={requests} />;
    }

    return <HomePage setView={setView} />;
  }, [activeRequest, role, view]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <Header
        currentView={view}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        setView={setView}
      />
      {content}
      <Footer setView={setView} />
    </div>
  );
}

function Header({
  currentView,
  mobileMenuOpen,
  setMobileMenuOpen,
  setView,
}: {
  currentView: View;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  setView: (view: View) => void;
}) {
  const links: { label: string; view: View }[] = [
    { label: 'Services', view: 'home' },
    { label: 'Proposal', view: 'proposal' },
    { label: 'Customer portal', view: 'customer' },
    { label: 'Owner dashboard', view: 'owner' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <button
          className="flex items-center gap-3 text-left"
          onClick={() => setView('home')}
          type="button"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-700 text-white">
            <BriefcaseMedical className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-base font-bold text-slate-950">ReguTrack</span>
            <span className="block text-xs font-medium text-slate-500">Regulatory services portal</span>
          </span>
        </button>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <button
              className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                currentView === link.view ? 'bg-slate-100 text-teal-800' : 'text-slate-600 hover:bg-slate-100'
              }`}
              key={link.label}
              onClick={() => setView(link.view)}
              type="button"
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <button
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:border-teal-700 hover:text-teal-800"
            onClick={() => setView('login')}
            type="button"
          >
            Login
          </button>
          <button
            className="rounded-md bg-teal-700 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-teal-800"
            onClick={() => setView('proposal')}
            type="button"
          >
            Submit proposal
          </button>
        </div>

        <button
          aria-label="Open menu"
          className="rounded-md border border-slate-300 p-2 text-slate-700 lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          type="button"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileMenuOpen ? (
        <div className="border-t border-slate-200 bg-white px-4 py-3 lg:hidden">
          <div className="grid gap-2">
            {links.map((link) => (
              <button
                className="rounded-md px-3 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100"
                key={link.label}
                onClick={() => {
                  setView(link.view);
                  setMobileMenuOpen(false);
                }}
                type="button"
              >
                {link.label}
              </button>
            ))}
            <button
              className="rounded-md bg-teal-700 px-3 py-3 text-left text-sm font-bold text-white"
              onClick={() => {
                setView('login');
                setMobileMenuOpen(false);
              }}
              type="button"
            >
              Login
            </button>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function Footer({ setView }: { setView: (view: View) => void }) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.2fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <button className="flex items-center gap-3 text-left" onClick={() => setView('home')} type="button">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-500 text-slate-950">
              <BriefcaseMedical className="h-6 w-6" />
            </span>
            <span>
              <span className="block text-lg font-black">ReguTrack</span>
              <span className="block text-sm font-semibold text-slate-300">Drug regulatory services</span>
            </span>
          </button>
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300">
            A secure portal for regulatory proposals, document exchange, fee acceptance, stage tracking, and complete customer communication history.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {socialLinks.map((link) => (
              <a
                className="rounded-md border border-slate-700 px-3 py-2 text-sm font-bold text-slate-200 hover:border-teal-400 hover:text-teal-300"
                href={link.href}
                key={link.label}
                rel="noreferrer"
                target="_blank"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {footerGroups.map((group) => (
          <div key={group.title}>
            <h2 className="text-sm font-black uppercase tracking-wide text-teal-300">{group.title}</h2>
            <div className="mt-4 grid gap-3">
              {group.links.map((link) => (
                <button
                  className="w-fit text-left text-sm font-semibold text-slate-300 hover:text-white"
                  key={`${group.title}-${link.label}`}
                  onClick={() => setView(link.view)}
                  type="button"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div>
          <h2 className="text-sm font-black uppercase tracking-wide text-teal-300">Contact</h2>
          <div className="mt-4 grid gap-3 text-sm text-slate-300">
            <p>Regulatory affairs support for pharma, biotech, APIs, and healthcare products.</p>
            <a className="font-semibold hover:text-white" href="mailto:info@regutrack.com">
              info@regutrack.com
            </a>
            <a className="font-semibold hover:text-white" href="tel:+919876543210">
              +91 98765 43210
            </a>
            <button
              className="mt-2 inline-flex w-fit items-center gap-2 rounded-md bg-teal-500 px-4 py-2 text-sm font-black text-slate-950 hover:bg-teal-400"
              onClick={() => setView('proposal')}
              type="button"
            >
              Send proposal <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-sm text-slate-400 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>Copyright © {year} ReguTrack Regulatory Services. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <button className="font-semibold hover:text-white" type="button">
              Privacy policy
            </button>
            <button className="font-semibold hover:text-white" type="button">
              Terms of service
            </button>
            <button className="font-semibold hover:text-white" type="button">
              Compliance notice
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

function HomePage({ setView }: { setView: (view: View) => void }) {
  return (
    <main>
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-16">
          <div className="flex flex-col justify-center">
            <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-bold text-teal-800">
              <ShieldCheck className="h-4 w-4" />
              Compliance-first regulatory consulting
            </div>
            <h1 className="max-w-3xl text-4xl font-black leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Drug regulatory services with a secure customer tracking portal
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Manage proposals, fee acceptance, regulatory documents, service status updates, and every customer communication in one responsive portal.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                className="inline-flex items-center justify-center gap-2 rounded-md bg-teal-700 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-teal-800"
                onClick={() => setView('proposal')}
                type="button"
              >
                Start service request <ArrowRight className="h-4 w-4" />
              </button>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 hover:border-teal-700 hover:text-teal-800"
                onClick={() => setView('customer')}
                type="button"
              >
                View customer portal <LayoutDashboard className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm lg:p-6">
            <div className="rounded-md bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <p className="text-sm font-bold text-slate-500">Service request</p>
                  <h2 className="text-xl font-black text-slate-950">CDSCO drug registration</h2>
                </div>
                <span className="rounded-md bg-amber-100 px-3 py-1 text-xs font-black text-amber-800">In progress</span>
              </div>
              <Timeline stages={stages} compact />
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <FeatureMini icon={FolderUp} label="Documents" value="5 uploaded, 2 required" />
                <FeatureMini icon={MessageSquareText} label="Communication log" value="18 saved entries" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Platform modules"
          title="Built for the full regulatory service workflow"
          text="The portal supports public lead capture, secure service intake, internal owner review, customer status visibility, and permanent communication history."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <FeatureCard icon={FileText} title="Proposal and document intake" text="Customers submit service requirements, target markets, product details, and supporting documents." />
          <FeatureCard icon={FileCheck2} title="Fee criteria acceptance" text="Owner sends quotation and terms. Customer accepts before active regulatory work starts." />
          <FeatureCard icon={ClipboardCheck} title="Stage-wise service tracking" text="Each request moves through proposal, review, dossier, submission, query, and completion stages." />
          <FeatureCard icon={MessageSquareText} title="Saved communication log" text="Every message, document upload, fee action, and status update is recorded with date, actor, and role." />
          <FeatureCard icon={UserRoundCheck} title="Customer dashboard" text="Customers see active requests, missing documents, fee status, next steps, and service history." />
          <FeatureCard icon={Building2} title="Owner dashboard" text="Owners review proposals, update stages, request documents, and manage priority regulatory work." />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <PanelHeading icon={BriefcaseMedical} title="Regulatory services supported" />
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => (
              <div className="flex gap-3 rounded-md border border-slate-200 p-4 text-sm font-semibold text-slate-700" key={service}>
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />
                {service}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div className="lg:col-span-1">
            <SectionTitle
              eyebrow="Responsive design"
              title="Accessible on mobile, tablet, and desktop"
              text="Dashboards use cards, timelines, readable forms, and touch-friendly actions so customers and owners can work from any device."
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3 lg:col-span-2">
            <DeviceCard icon={Smartphone} title="Mobile" text="Single-column request cards and timeline updates." />
            <DeviceCard icon={LayoutDashboard} title="Tablet" text="Two-column dashboard layout with clear actions." />
            <DeviceCard icon={Search} title="Desktop" text="Dense owner views for filtering and reviewing requests." />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-slate-950 px-5 py-8 text-white sm:px-8 lg:flex lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-black">Ready to collect a customer proposal?</h2>
            <p className="mt-2 max-w-2xl text-slate-300">
              Start with the proposal form, then move the customer through quotation, acceptance, and live status updates.
            </p>
          </div>
          <button
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-md bg-teal-500 px-5 py-3 text-sm font-black text-slate-950 hover:bg-teal-400 lg:mt-0"
            onClick={() => setView('proposal')}
            type="button"
          >
            Submit proposal <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </main>
  );
}

function LoginPage({
  role,
  setRole,
  setView,
}: {
  role: Role;
  setRole: (role: Role) => void;
  setView: (view: View) => void;
}) {
  return (
    <main className="mx-auto grid min-h-[calc(100vh-67px)] max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
      <section className="flex flex-col justify-center">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-teal-700 text-white">
          <LockKeyhole className="h-6 w-6" />
        </div>
        <h1 className="text-3xl font-black text-slate-950 sm:text-5xl">Secure login for customers and owners</h1>
        <p className="mt-4 max-w-xl text-lg leading-8 text-slate-600">
          Customers track service status and upload missing documents. Owners review proposals, send quotations, and save every update to the communication log.
        </p>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="grid grid-cols-2 gap-2 rounded-md bg-slate-100 p-1">
          {(['customer', 'owner'] as Role[]).map((item) => (
            <button
              className={`rounded-md px-3 py-2 text-sm font-black capitalize ${
                role === item ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-600'
              }`}
              key={item}
              onClick={() => setRole(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>

        <form className="mt-6 grid gap-4">
          <Field label="Email address" placeholder="name@company.com" type="email" />
          <Field label="Password" placeholder="Enter secure password" type="password" />
          <button
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-md bg-teal-700 px-5 py-3 text-sm font-black text-white hover:bg-teal-800"
            onClick={(event) => {
              event.preventDefault();
              setView(role === 'customer' ? 'customer' : 'owner');
            }}
            type="submit"
          >
            Continue to {role === 'customer' ? 'customer portal' : 'owner dashboard'}
            <LogIn className="h-4 w-4" />
          </button>
        </form>
      </section>
    </main>
  );
}

function ProposalPage({ setView }: { setView: (view: View) => void }) {
  const [formData, setFormData] = useState<ProposalFormData>({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    serviceRequired: '',
    targetMarket: '',
    productName: '',
    productCategory: '',
    proposalNotes: '',
    acceptedFeeReview: false,
    documentNames: [],
  });
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  function updateField(field: keyof ProposalFormData, value: string | boolean | string[]) {
    setFormData((current) => ({ ...current, [field]: value }));
  }

  async function handleProposalSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitStatus('submitting');
    setSubmitMessage('');

    try {
      const requiredFields: (keyof ProposalFormData)[] = [
        'companyName',
        'contactPerson',
        'email',
        'serviceRequired',
        'targetMarket',
        'productName',
      ];
      const missingField = requiredFields.find((field) => !String(formData[field]).trim());

      if (missingField) {
        throw new Error('Please fill all required proposal details before submitting.');
      }

      if (!formData.acceptedFeeReview) {
        throw new Error('Please accept the fee review criteria before submitting.');
      }

      const savedProposal = await createServiceProposal(formData);
      setSubmitStatus('success');
      setSubmitMessage(`Proposal submitted successfully. Reference ID: ${savedProposal.id}`);
      setFormData({
        companyName: '',
        contactPerson: '',
        email: '',
        phone: '',
        serviceRequired: '',
        targetMarket: '',
        productName: '',
        productCategory: '',
        proposalNotes: '',
        acceptedFeeReview: false,
        documentNames: [],
      });
    } catch (error) {
      console.error('Proposal submit failed', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : error && typeof error === 'object' && 'message' in error
          ? String((error as { message?: string }).message)
          : 'Unable to submit proposal. Please try again.';
      setSubmitStatus('error');
      setSubmitMessage(errorMessage || 'Unable to submit proposal. Please try again.');
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SectionTitle
        eyebrow="Service intake"
        title="Submit proposal and supporting documents"
        text="This form captures the minimum details needed for owner review, fee quotation, document screening, and service tracking."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <form className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6" onSubmit={handleProposalSubmit}>
          {!isSupabaseConfigured ? (
            <div className="mb-5 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              Supabase is not configured yet. Add your project URL and anon key in <code>.env.local</code>, then restart the dev server.
            </div>
          ) : null}
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Company name" onChange={(value) => updateField('companyName', value)} placeholder="Aster Biopharma Pvt Ltd" required value={formData.companyName} />
            <Field label="Contact person" onChange={(value) => updateField('contactPerson', value)} placeholder="Full name" required value={formData.contactPerson} />
            <Field label="Email" onChange={(value) => updateField('email', value)} placeholder="name@company.com" required type="email" value={formData.email} />
            <Field label="Phone" onChange={(value) => updateField('phone', value)} placeholder="+91 98765 43210" value={formData.phone} />
            <Field label="Service required" onChange={(value) => updateField('serviceRequired', value)} placeholder="Drug registration, eCTD, labeling..." required value={formData.serviceRequired} />
            <Field label="Target market" onChange={(value) => updateField('targetMarket', value)} placeholder="India, US, EU, UK..." required value={formData.targetMarket} />
            <Field label="Product name" onChange={(value) => updateField('productName', value)} placeholder="Product or molecule name" required value={formData.productName} />
            <Field label="Product category" onChange={(value) => updateField('productCategory', value)} placeholder="API, finished dosage, biologic..." value={formData.productCategory} />
          </div>
          <label className="mt-4 block">
            <span className="text-sm font-bold text-slate-700">Proposal notes</span>
            <textarea
              className="mt-2 min-h-32 w-full rounded-md border border-slate-300 px-3 py-3 text-sm outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
              onChange={(event) => updateField('proposalNotes', event.target.value)}
              placeholder="Describe the service scope, current approval status, deadlines, and known regulatory questions."
              value={formData.proposalNotes}
            />
          </label>

          <div className="mt-5 rounded-lg border border-dashed border-teal-300 bg-teal-50 p-5 text-center">
            <UploadCloud className="mx-auto h-9 w-9 text-teal-800" />
            <h3 className="mt-3 text-base font-black text-slate-950">Upload proposal documents</h3>
            <p className="mt-1 text-sm text-slate-600">
              Product details, licenses, labels, previous approvals, stability data, and manufacturing information.
            </p>
            <label className="mt-4 inline-flex cursor-pointer rounded-md bg-white px-4 py-2 text-sm font-black text-teal-800 shadow-sm">
              Choose files
              <input
                className="sr-only"
                multiple
                onChange={(event) => {
                  const names = Array.from(event.target.files ?? []).map((file) => file.name);
                  updateField('documentNames', names);
                }}
                type="file"
              />
            </label>
            {formData.documentNames.length ? (
              <p className="mt-3 text-xs font-bold text-teal-900">{formData.documentNames.length} file name(s) ready to save with proposal.</p>
            ) : null}
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-start gap-3 text-sm text-slate-600">
              <input
                checked={formData.acceptedFeeReview}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-700"
                onChange={(event) => updateField('acceptedFeeReview', event.target.checked)}
                type="checkbox"
              />
              <span>I agree that the owner will review the request and send fee criteria before work begins.</span>
            </label>
            <button
              className="rounded-md bg-teal-700 px-5 py-3 text-sm font-black text-white hover:bg-teal-800 disabled:bg-slate-400"
              disabled={submitStatus === 'submitting'}
              type="submit"
            >
              {submitStatus === 'submitting' ? 'Submitting...' : 'Submit request'}
            </button>
          </div>
          {submitMessage ? (
            <div
              className={`mt-5 rounded-md p-4 text-sm font-semibold ${
                submitStatus === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
              }`}
            >
              {submitMessage}
              {submitStatus === 'success' ? (
                <button className="ml-2 underline" onClick={() => setView('customer')} type="button">
                  View customer dashboard
                </button>
              ) : null}
            </div>
          ) : null}
        </form>

        <aside className="grid gap-4">
          <InfoPanel
            icon={FileCheck2}
            title="After submission"
            items={[
              'Owner reviews proposal and documents',
              'Missing documents are requested',
              'Fee criteria and timeline are sent',
              'Customer accepts before service work starts',
            ]}
          />
          <InfoPanel
            icon={MessageSquareText}
            title="Communication saved"
            items={[
              'Proposal submission',
              'Document uploads',
              'Fee acceptance',
              'Every status update and message',
            ]}
          />
        </aside>
      </div>
    </main>
  );
}

function CustomerDashboard({ request, setView }: { request: ServiceRequest; setView: (view: View) => void }) {
  return (
    <PortalShell title="Customer dashboard" subtitle="Track regulatory service status, documents, fee acceptance, and communication history.">
      <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="grid gap-5">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-bold text-teal-800">{request.id}</p>
                <h2 className="mt-1 text-2xl font-black text-slate-950">{request.service}</h2>
                <p className="mt-2 text-sm text-slate-600">
                  {request.company} · {request.product} · {request.market}
                </p>
              </div>
              <StatusBadge label={request.status} tone="amber" />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <SummaryBlock label="Fee status" value={request.feeStatus} />
              <SummaryBlock label="Target due date" value={request.dueDate} />
              <SummaryBlock label="Priority" value={request.priority} />
            </div>

            <div className="mt-5 rounded-md bg-teal-50 p-4">
              <p className="text-sm font-black text-teal-950">Next step</p>
              <p className="mt-1 text-sm leading-6 text-teal-900">{request.nextStep}</p>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <PanelHeading icon={ClipboardCheck} title="Service timeline" />
            <Timeline stages={request.stages} />
          </div>

          <DocumentsTable documents={request.documents} />
        </section>

        <aside className="grid gap-5">
          <QuotationCard setView={setView} />
          <CommunicationTimeline logs={request.logs} />
        </aside>
      </div>
    </PortalShell>
  );
}

function OwnerDashboard({ requests: allRequests }: { requests: ServiceRequest[] }) {
  return (
    <PortalShell title="Owner dashboard" subtitle="Review proposals, update service stages, request documents, and monitor fee acceptance.">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard detail={metric.detail} icon={metric.icon} key={metric.label} label={metric.label} value={metric.value} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <PanelHeading icon={ClipboardCheck} title="Service requests" />
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-teal-700 sm:w-64"
                placeholder="Search customers"
              />
            </div>
          </div>
          <div className="grid gap-3 p-4">
            {allRequests.map((request) => (
              <div
                className="grid gap-4 rounded-lg border border-slate-200 p-4 md:grid-cols-[1.2fr_0.8fr_0.7fr_auto] md:items-center"
                key={request.id}
              >
                <div>
                  <p className="text-xs font-black text-teal-800">{request.id}</p>
                  <h3 className="mt-1 font-black text-slate-950">{request.company}</h3>
                  <p className="mt-1 text-sm text-slate-600">{request.service}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500">Market and product</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{request.market} · {request.product}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge label={request.status} tone="amber" />
                  <StatusBadge label={request.feeStatus} tone={request.feeStatus === 'Accepted' ? 'green' : 'blue'} />
                </div>
                <button className="rounded-md bg-slate-950 px-4 py-2 text-sm font-black text-white" type="button">
                  Review
                </button>
              </div>
            ))}
          </div>
        </section>

        <aside className="grid gap-5">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <PanelHeading icon={FileText} title="Owner actions" />
            <div className="mt-4 grid gap-3">
              {['Send fee quotation', 'Request missing document', 'Update service stage', 'Upload regulatory report'].map((action) => (
                <button
                  className="flex items-center justify-between rounded-md border border-slate-200 px-4 py-3 text-left text-sm font-bold text-slate-700 hover:border-teal-700 hover:text-teal-800"
                  key={action}
                  type="button"
                >
                  {action}
                  <ChevronRight className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
          <CommunicationTimeline logs={allRequests[0].logs} />
        </aside>
      </div>
    </PortalShell>
  );
}

function PortalShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-teal-800">Secure portal</p>
          <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">{title}</h1>
          <p className="mt-2 max-w-3xl text-slate-600">{subtitle}</p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-md border border-slate-300 px-4 py-2 text-sm font-black text-slate-700" type="button">
            Export log
          </button>
          <button className="rounded-md bg-teal-700 px-4 py-2 text-sm font-black text-white" type="button">
            New update
          </button>
        </div>
      </div>
      {children}
    </main>
  );
}

function Timeline({ stages: items, compact = false }: { stages: ServiceStage[]; compact?: boolean }) {
  return (
    <ol className={`mt-5 grid ${compact ? 'gap-3' : 'gap-4'}`}>
      {items.map((stage) => (
        <li className="flex gap-3" key={stage.label}>
          <span
            className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${
              stage.status === 'done'
                ? 'border-teal-700 bg-teal-700 text-white'
                : stage.status === 'active'
                  ? 'border-amber-500 bg-amber-100 text-amber-800'
                  : 'border-slate-300 bg-white text-slate-400'
            }`}
          >
            {stage.status === 'done' ? <Check className="h-4 w-4" /> : <span className="h-2 w-2 rounded-full bg-current" />}
          </span>
          <span>
            <span className="block text-sm font-black text-slate-900">{stage.label}</span>
            {stage.date ? <span className="text-xs font-semibold text-slate-500">{stage.date}</span> : null}
          </span>
        </li>
      ))}
    </ol>
  );
}

function CommunicationTimeline({ logs }: { logs: CommunicationLog[] }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <PanelHeading icon={MessageSquareText} title="Communication log" />
      <div className="mt-4 grid gap-4">
        {logs.map((log) => (
          <article className="rounded-md border border-slate-200 p-4" key={log.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-black text-slate-950">{log.title}</p>
                <p className="mt-1 text-xs font-bold text-slate-500">{log.date}</p>
              </div>
              <span className={`rounded-md px-2 py-1 text-xs font-black ${log.role === 'owner' ? 'bg-blue-100 text-blue-800' : 'bg-teal-100 text-teal-800'}`}>
                {log.role}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{log.message}</p>
            <p className="mt-3 text-xs font-bold text-slate-500">By {log.actor} · {log.type}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function DocumentsTable({ documents }: { documents: DocumentItem[] }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <PanelHeading icon={FolderUp} title="Documents" />
        <button className="rounded-md bg-teal-700 px-3 py-2 text-sm font-black text-white" type="button">
          Upload
        </button>
      </div>
      <div className="mt-4 grid gap-3">
        {documents.map((document) => (
          <div className="grid gap-3 rounded-md border border-slate-200 p-4 sm:grid-cols-[1fr_auto] sm:items-center" key={document.name}>
            <div>
              <p className="text-sm font-black text-slate-950">{document.name}</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">{document.type} · Uploaded by {document.owner}</p>
            </div>
            <StatusBadge
              label={document.status}
              tone={document.status === 'Received' ? 'green' : document.status === 'Required' ? 'red' : 'blue'}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function QuotationCard({ setView }: { setView: (view: View) => void }) {
  return (
    <section className="rounded-lg border border-teal-200 bg-teal-50 p-5 shadow-sm">
      <PanelHeading icon={BadgeCheck} title="Fee criteria" />
      <p className="mt-3 text-sm leading-6 text-teal-950">
        Quotation accepted for CDSCO registration support. Future requests can require explicit acceptance before status changes to active work.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <SummaryBlock label="Amount" value="₹85,000" />
        <SummaryBlock label="Terms" value="Accepted" />
      </div>
      <button
        className="mt-4 w-full rounded-md bg-teal-700 px-4 py-3 text-sm font-black text-white"
        onClick={() => setView('proposal')}
        type="button"
      >
        Create another request
      </button>
    </section>
  );
}

function SectionTitle({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <div>
      <p className="text-sm font-black uppercase tracking-wide text-teal-800">{eyebrow}</p>
      <h2 className="mt-2 max-w-3xl text-3xl font-black leading-tight text-slate-950 sm:text-4xl">{title}</h2>
      <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">{text}</p>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, text }: { icon: IconType; title: string; text: string }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-md bg-teal-50 text-teal-800">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-lg font-black text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </article>
  );
}

function DeviceCard({ icon: Icon, title, text }: { icon: IconType; title: string; text: string }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-slate-50 p-5">
      <Icon className="h-7 w-7 text-teal-800" />
      <h3 className="mt-4 font-black text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </article>
  );
}

function FeatureMini({ icon: Icon, label, value }: { icon: IconType; label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 p-3">
      <Icon className="h-5 w-5 text-teal-800" />
      <p className="mt-2 text-xs font-bold text-slate-500">{label}</p>
      <p className="text-sm font-black text-slate-950">{value}</p>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, detail }: { icon: IconType; label: string; value: string; detail: string }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-slate-500">{label}</p>
        <Icon className="h-5 w-5 text-teal-800" />
      </div>
      <p className="mt-3 text-3xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{detail}</p>
    </article>
  );
}

function InfoPanel({ icon: Icon, title, items }: { icon: IconType; title: string; items: string[] }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <PanelHeading icon={Icon} title={title} />
      <ul className="mt-4 grid gap-3">
        {items.map((item) => (
          <li className="flex gap-3 text-sm leading-6 text-slate-600" key={item}>
            <Check className="mt-1 h-4 w-4 shrink-0 text-teal-700" />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Field({
  label,
  onChange,
  placeholder,
  required = false,
  type = 'text',
  value,
}: {
  label: string;
  onChange?: (value: string) => void;
  placeholder: string;
  required?: boolean;
  type?: string;
  value?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-700">
        {label}
        {required ? <span className="text-rose-600"> *</span> : null}
      </span>
      <input
        className="mt-2 w-full rounded-md border border-slate-300 px-3 py-3 text-sm outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        required={required}
        type={type}
        value={value}
      />
    </label>
  );
}

function SummaryBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-black text-slate-950">{value}</p>
    </div>
  );
}

function PanelHeading({ icon: Icon, title }: { icon: IconType; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-teal-50 text-teal-800">
        <Icon className="h-4 w-4" />
      </span>
      <h2 className="text-lg font-black text-slate-950">{title}</h2>
    </div>
  );
}

function StatusBadge({ label, tone }: { label: string; tone: 'amber' | 'blue' | 'green' | 'red' }) {
  const styles = {
    amber: 'bg-amber-100 text-amber-800',
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-emerald-100 text-emerald-800',
    red: 'bg-rose-100 text-rose-800',
  };

  return <span className={`w-fit rounded-md px-3 py-1 text-xs font-black ${styles[tone]}`}>{label}</span>;
}

export default App;
