import { Link, NavLink, Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { platformData } from "./data/platform-data.js";

function Shell({ title, description, children }) {
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">A</span>
          <div>
            <strong>ANNEXE AI Commercial SaaS Platform</strong>
            <p>Commercial SaaS platform for autonomous software delivery</p>
          </div>
        </div>
        <nav className="nav">
          {platformData.navigation.map(item => (
            <NavLink key={item.path} to={item.path} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="main">
        <header className="hero">
          <p className="eyebrow">Commercial SaaS Platform</p>
          <h1>{title}</h1>
          <p>{description}</p>
          <div className="hero-actions">
            <Link className="button primary" to="/new-project">Generate Software</Link>
            <Link className="button secondary" to="/reports">Open Reports</Link>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}

function StatCard({ label, value, note }) {
  return (
    <article className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{note}</p>
    </article>
  );
}

function CardGrid({ items }) {
  return (
    <div className="card-grid">
      {items.map((item, index) => (
        <article className="card" key={index}>
          <p className="card-kicker">{item.kicker}</p>
          <h3>{item.title}</h3>
          <p>{item.description}</p>
        </article>
      ))}
    </div>
  );
}

function ProgressBar({ value }) {
  return (
    <div className="progress">
      <div style={{ width: `${value}%` }} />
    </div>
  );
}

function QuestionnaireWizard() {
  const [draft, setDraft] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("annexe.saas.draft") || "{}");
    } catch {
      return {};
    }
  });
  const [step, setStep] = useState(0);

  useEffect(() => {
    localStorage.setItem("annexe.saas.draft", JSON.stringify(draft));
  }, [draft]);

  const steps = [
    "Business context",
    "Requirements",
    "Integrations",
    "Review"
  ];

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Questionnaire</p>
          <h2>Multi-step wizard</h2>
        </div>
        <span>{step + 1}/{steps.length}</span>
      </div>
      <ProgressBar value={((step + 1) / steps.length) * 100} />
      <div className="wizard">
        <label>
          Industry
          <input value={draft.industry || ""} onChange={e => setDraft({ ...draft, industry: e.target.value })} />
        </label>
        <label>
          Problems
          <textarea rows="4" value={draft.problems || ""} onChange={e => setDraft({ ...draft, problems: e.target.value })} />
        </label>
        <label>
          Upload file
          <input type="file" onChange={e => setDraft({ ...draft, fileName: e.target.files?.[0]?.name || "" })} />
        </label>
        <label>
          Voice input
          <input placeholder="Voice input placeholder" readOnly />
        </label>
      </div>
      <div className="hero-actions">
        <button className="button secondary" onClick={() => setStep(Math.max(0, step - 1))}>Back</button>
        <button className="button primary" onClick={() => setStep(Math.min(steps.length - 1, step + 1))}>Next</button>
      </div>
      <p className="muted">Draft saving and resume later are enabled via localStorage.</p>
    </section>
  );
}

function ProposalActions() {
  const actions = ["Approve", "Reject", "Request Changes", "Approve Budget", "Approve Timeline"];
  const [comment, setComment] = useState("");
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Proposal Review</p>
          <h2>Commercial approval workflow</h2>
        </div>
      </div>
      <div className="action-row">
        {actions.map(action => <button key={action} className="button secondary">{action}</button>)}
      </div>
      <label>
        Leave comments
        <textarea rows="5" value={comment} onChange={e => setComment(e.target.value)} />
      </label>
    </section>
  );
}

function SectionPage({ title, description, items, extra }) {
  return (
    <Shell title={title} description={description}>
      {extra}
      <CardGrid items={items} />
    </Shell>
  );
}

function HomePage() {
  return (
    <Shell title="Commercial SaaS Platform" description={platformData.brand.tagline}>
      <div className="stats-grid">
        <StatCard label="Platform readiness" value="92%" note="Portal, orchestrator, and reports in place." />
        <StatCard label="Commercial readiness" value="88%" note="Proposal review, billing architecture, and delivery flow." />
        <StatCard label="Benchmark suite" value={platformData.benchmark.successRate + "%"} note="Automated generation across all supported application types." />
      </div>
      <CardGrid items={platformData.summary.logs.map((log, index) => ({
        kicker: "Log",
        title: `Entry ${index + 1}`,
        description: log
      }))} />
    </Shell>
  );
}

function BenchmarkPage() {
  return (
    <Shell title="Benchmark Suite" description="Generation, build, test, and validation coverage for every supported business platform.">
      <div className="stats-grid">
        <StatCard label="Benchmarks" value={platformData.benchmark.totalBenchmarks} note="All commercial application types." />
        <StatCard label="Validated" value={platformData.benchmark.validatedBenchmarks} note="Generation and build checks completed." />
        <StatCard label="Success rate" value={platformData.benchmark.successRate + "%"} note="Production readiness across the suite." />
      </div>
      <CardGrid items={platformData.benchmark.runs.map(run => ({
        kicker: run.applicationType,
        title: run.projectName || run.applicationType,
        description: `${run.success ? "Passed" : "Failed"} Ã‚Â· ${run.durationMs} ms Ã‚Â· ${run.validation?.frontend?.build ? "build ok" : "build pending"}`
      }))} />
    </Shell>
  );
}

function ReportsPage() {
  return (
    <Shell title="Report Center" description="Proposal, business analysis, architecture, sprint plan, engineering report, quality report, deployment report, and delivery package.">
      <div className="hero-actions">
        <button className="button primary" type="button" onClick={() => window.print()}>Export PDF</button>
        <a className="button secondary" href="/reports/platform/commercial-operating-system-report.json" download>Download Platform Report</a>
      </div>
      <div className="card-grid">
        {platformData.reports.map(report => (
          <article className="card" key={report.name}>
            <p className="card-kicker">Download</p>
            <h3>{report.name}</h3>
            <p>{report.path}</p>
            <a className="button secondary" href={report.path} download>Download</a>
          </article>
        ))}
      </div>
    </Shell>
  );
}

function PortalApp() {
  const routes = useMemo(() => platformData.navigation.map(item => item.path), []);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/dashboard" element={<SectionPage title="Dashboard" description="Current stage, progress, current department, estimated completion, generated files, reports, logs, and deployments." items={[
        { kicker: "Stage", title: "Completed", description: "Current department Delivery." },
        { kicker: "Files", title: String(platformData.summary.generatedFiles), description: "Generated files tracked in the portal." },
        { kicker: "Deployments", title: String(platformData.summary.deployments.length), description: "Deployment records and status." }
      ]} />} />
      <Route path="/projects" element={<SectionPage title="Projects" description="Every generated project, every proposal, every report, every deployment, every version." items={platformData.projects.map(project => ({
        kicker: project.type,
        title: project.name,
        description: `${project.industry} Ã‚Â· ${project.stage} Ã‚Â· ${project.progress}%`
      }))} />} />
      <Route path="/new-project" element={<Shell title="New Project" description="A resumable multi-step questionnaire with file upload and voice input placeholder."><QuestionnaireWizard /></Shell>} />
      <Route path="/proposal" element={<Shell title="Proposal" description="Approvals, budget review, timeline review, and comments."><ProposalActions /><CardGrid items={platformData.proposal.comments.map((comment, index) => ({ kicker: "Comment", title: `Note ${index + 1}`, description: comment }))} /></Shell>} />
      <Route path="/billing" element={<SectionPage title="Payment Center" description="Advance payment, completion payment, and monthly subscription billing." items={[
        { kicker: "Initial Project", title: "50% advance / 50% completion", description: "Advance " + platformData.customerPortal.billingModel.initialProject.advance + "% and completion " + platformData.customerPortal.billingModel.initialProject.completion + "%." },
        { kicker: "Upgrade", title: "50% advance / 50% completion", description: "Upgrade billing follows the same commercial policy." },
        { kicker: "Maintenance", title: platformData.customerPortal.billingModel.maintenance.type, description: "Monthly subscription for support and lifecycle operations." }
      ]} />} />
      <Route path="/upgrade-center" element={<SectionPage title="Upgrade Center" description="Lifecycle recommendations, upgrade requests, and evolution suggestions." items={[
        { kicker: "Recommendations", title: platformData.customerPortal.upgradeCenter.improvementRecommendations.length + " suggestions", description: platformData.customerPortal.upgradeCenter.improvementRecommendations.join(" â€¢ ") || "Ready for recommendations." },
        { kicker: "Upgrade Requests", title: platformData.customerPortal.upgradeCenter.upgradeRequests.length + " requests", description: platformData.customerPortal.upgradeCenter.upgradeRequests.join(" â€¢ ") || "No upgrade requests yet." },
        { kicker: "Evolution", title: platformData.customerPortal.upgradeCenter.evolutionSuggestions.length + " suggestions", description: platformData.customerPortal.upgradeCenter.evolutionSuggestions.join(" â€¢ ") || "Evolution suggestions available." }
      ]} />} />
      <Route path="/architecture" element={<SectionPage title="Architecture" description="Architecture diagram, stack, database, and API composition." items={[
        { kicker: "Frontend", title: platformData.architecture.stack.frontend || "React", description: "Customer portal and admin portal." },
        { kicker: "Backend", title: platformData.architecture.stack.backend || "FastAPI", description: "Reusable generation and company orchestration APIs." },
        { kicker: "Database", title: platformData.architecture.stack.database || "PostgreSQL", description: "Persisted project history and reporting." }
      ]} />} />
      <Route path="/generation" element={<SectionPage title="Generation" description="Live company pipeline stages from sales through delivery." items={[
        { kicker: "Sales Consultant", title: "Running", description: "Conversation to proposal." },
        { kicker: "Business Analysis", title: "Completed", description: "Requirements and composition captured." },
        { kicker: "Engineering", title: "Completed", description: "Factory wrote the buildable project." }
      ]} />} />
      <Route path="/deployment" element={<SectionPage title="Deployment" description="Docker, Render, Railway, Vercel, AWS, Azure, and GCP readiness." items={platformData.deployment.providers.map(provider => ({
        kicker: "Target",
        title: provider,
        description: `Deployment status: ${platformData.deployment.status}`
      }))} />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/settings" element={<SectionPage title="Settings" description="Theme, notification, and workflow preferences." items={[
        { kicker: "Theme", title: "Aurora / Slate / Graphite", description: "High-contrast commercial UI palette." },
        { kicker: "Notifications", title: "Enabled", description: "Actions are logged and surfaced." },
        { kicker: "Resume", title: "Draft saving", description: "Every workflow can be resumed later." }
      ]} />} />
      <Route path="/authentication" element={<SectionPage title="Authentication" description="Customer login and SSO placeholder." items={platformData.authentication.providers.map(provider => ({
        kicker: "Provider",
        title: provider,
        description: platformData.authentication.status
      }))} />} />
      <Route path="/profile" element={<SectionPage title="Profile" description="Account and ownership details." items={[
        { kicker: "Name", title: platformData.profile.name, description: platformData.profile.role },
        { kicker: "Email", title: platformData.profile.email, description: "Profile settings ready." }
      ]} />} />
      <Route path="/admin" element={<SectionPage title="Admin Dashboard" description="CEO, Sales, Engineering, QA, Security, DevOps, and Upgrade views." items={[
        { kicker: "CEO View", title: platformData.adminDashboard.ceo.revenue, description: platformData.adminDashboard.ceo.projects + " projects and " + platformData.adminDashboard.ceo.customers + " customers." },
        { kicker: "Sales View", title: platformData.adminDashboard.sales.leads + " leads", description: platformData.adminDashboard.sales.proposals + " proposals and " + platformData.adminDashboard.sales.conversions + " conversions." },
        { kicker: "Engineering View", title: platformData.adminDashboard.engineering.activeProjects + " active projects", description: "Workload " + platformData.adminDashboard.engineering.workload + "." },
        { kicker: "QA View", title: platformData.adminDashboard.qa.certifications + " certification(s)", description: "QA certificates and quality gate status." },
        { kicker: "Security View", title: platformData.adminDashboard.security.vulnerabilities + " vulnerabilities", description: "Security posture and risk exposure." },
        { kicker: "DevOps View", title: platformData.adminDashboard.devops.deployments + " deployments", description: "Deployment operations and observability." },
        { kicker: "Upgrade View", title: platformData.adminDashboard.upgrade.recurringRevenue, description: "Recurring revenue from upgrades and maintenance." }
      ]} />} />
      <Route path="/benchmark" element={<BenchmarkPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return <PortalApp />;
}
