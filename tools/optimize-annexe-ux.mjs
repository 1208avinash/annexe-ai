import fs from "fs";

const path = "D:/annex-web/index.html";
let content = fs.readFileSync(path, "latin1");

const fixedReplacements = [
  [/<title>.*?<\/title>/s, "<title>ANNEXE AI | Autonomous AI Software Company</title>"],
  [/<meta name="description"[\s\S]*?>/, '    <meta name="description"          content="ANNEXE AI is the world\'s first autonomous AI software company. We understand requirements, create proposals, design architecture, write production software, test it, deploy it, and deliver it.">'],
  [/<meta name="keywords"[\s\S]*?>/, '    <meta name="keywords"             content="autonomous AI software company, enterprise software, AI software factory, CRM, ERP, SaaS platform, production software, capability engine">'],
  [/<meta property="og:title"[\s\S]*?>/, '    <meta property="og:title"         content="ANNEXE AI - Autonomous AI Software Company">'],
  [/<meta property="og:description"[\s\S]*?>/, '    <meta property="og:description"   content="Describe your business. ANNEXE AI understands requirements, creates proposals, designs architecture, writes production software, tests it, deploys it, and delivers it.">'],
  [/<meta property="og:image:alt"[\s\S]*?>/, '    <meta property="og:image:alt"     content="ANNEXE AI - autonomous AI software company dashboard showing live company and factory activity">'],
  [/<meta name="twitter:title"[\s\S]*?>/, '    <meta name="twitter:title"        content="ANNEXE AI - Autonomous AI Software Company">'],
  [/<meta name="twitter:description"[\s\S]*?>/, '    <meta name="twitter:description"  content="Describe your business. ANNEXE AI turns it into proposal, architecture, production software, testing, deployment, and delivery.">'],
  [/<meta name="twitter:image:alt"[\s\S]*?>/, '    <meta name="twitter:image:alt"    content="ANNEXE AI dashboard - autonomous AI software company in action">'],
  [/\"description\":\s*\"Enterprise AI automation platform\.[^\"]*\"/, '"description": "Autonomous AI software company that turns business requests into production-ready enterprise software."'],
  [/\"description\":\s*\"Deploy autonomous AI employees for sales, support, finance, and operations\.[^\"]*\"/, '"description": "Describe your business and ANNEXE AI will deliver proposal, architecture, software, testing, deployment, and handoff."'],
  ["14-day free trial Â· No credit card required Â· Deploy your first AI agent in under a day", "Start your software company with ANNEXE AI Â· No credit card required Â· Watch live generation"],
  ["Start free â†’", "Start Your Project"],
  ["Deploy Now", "Start Your Project"],
  ["Intelligence that runs your business.", "The world's first autonomous AI software company."],
  ["Deploy autonomous AI employees and enterprise operating systems that work 24/7. Reduce operational costs, eliminate repetitive work, and scale infinitely.", "Describe your business. ANNEXE AI understands requirements, creates proposals, designs architecture, writes production software, tests it, deploys it, and delivers it."],
  ["Start AI Transformation", "Start Your Project"],
  ["Watch System Demo", "Watch Live Generation"],
  ["Ask your AI workforce anythingâ€¦", "Describe your software ideaâ€¦"],
  ["Talk to your<br/><span class=\"text-gradient\">AI workforce</span>", "Speak to your<br/><span class=\"text-gradient\">AI software company</span>"],
  ["Type any business question. Your AI agents answer in real time â€” querying data, drafting documents, and taking action across your entire stack.", "Describe your business. The company responds in real time with analysis, proposals, architecture, software, and delivery actions."],
  ["Live AI Interface // Connected", "Live Company Interface // Connected"],
  ["ANNEXE AI // Neural Terminal v5.0", "ANNEXE AI // Company Terminal v5.0"],
  ["Autonomous Ops", "Autonomous Delivery"],
  ["Enterprise AI Agents", "Enterprise Software Delivery"],
  ["Enterprise Automation Library", "What ANNEXE AI Builds"],
  ["Search and deploy from our curated collection of 4,300+ professional AI and business workflows.", "Production-ready applications, platforms, and enterprise systems delivered through the same factory kernel."],
  ["Search workflows... (e.g., lead routing, automated outreach)", "Search software systems... (e.g., CRM, ERP, hospital, marketplace)"],
  ["All Categories", "All Systems"],
  ["AI Agents", "Software Types"],
  ["Data Processing", "Enterprise"],
  ["CRM & Sales", "Industry Apps"],
  ["Finance", "Operations"],
  ["All Complexities", "All Delivery Stages"],
  ["All Triggers", "All Capabilities"],
  ["Total Workflows", "Application Types"],
  ["Active Systems", "Capabilities"],
  ["Integrations", "Deployment Targets"],
  ["Categories", "Industries"],
  ["Deploy specialized AI agents for sales, support, finance, and operations. Each agent learns your workflows and executes 24/7 without fatigue or errors.", "Deploy specialized teams for sales, analysis, architecture, engineering, QA, and DevOps. Each department contributes to production software delivery."],
  ["Companies are replacing repetitive workflows with intelligent AI agents.", "Companies are replacing fragmented vendors with a single autonomous software company."],
  ["Ready to deploy your <span class=\"text-gradient\">AI workforce?</span>", "Ready to build your <span class=\"text-gradient\">software company with AI?</span>"],
  ["Join 2,400+ enterprises automating their operations with ANNEXE AI. First 14 days free, no credit card required.", "Ready to build your software company with AI? Start with a proposal, a blueprint, and a live build path."],
  ["Start 14-Day Free Trial", "Start Building"],
  ["Talk to an Expert", "Book Demo"],
  ["AI CONSULTANT ONLINE", "AI CEO ONLINE"],
  ["May I help you optimize your business?", "What industry are you building for?"],
  ["ANNEXE AI COMMAND CENTER", "ANNEXE AI CEO COMMAND CENTER"],
  ["AI Consulting Operations", "Autonomous Software Company Operations"],
  ["What business challenge should we analyze?", "What industry are you in?"],
  ["Your entire business<br/><span class=\"text-gradient\">on one screen</span>", "Your entire software company<br/><span class=\"text-gradient\">on one screen</span>"],
  ["Every agent, every pipeline, every metric â€” unified in a single command center.", "Every department, every stage, every delivery signal â€” unified in a single command center."],
  ["Deploy in <span class=\"text-gradient\">three steps</span>", "Deliver in <span class=\"text-gradient\">three steps</span>"],
  ["Map Your Business", "Define the business"],
  ["Connect your tools, share your workflows, and let our AI map your entire operational landscape in minutes.", "Share the industry, users, integrations, and deployment preference. ANNEXE AI maps the request into a buildable blueprint."],
  ["Deploy AI Agents", "Generate the factory plan"],
  ["Select from 4,343 pre-built automation workflows or custom-build your own. One-click deployment to production.", "Create proposal, architecture, backend, frontend, and delivery flow from the same factory kernel. One-click generation to production."],
  ["Scale Infinitely", "Deliver production software"],
  ["Monitor performance in real-time. Every agent self-optimizes. Scale from 1 to 10,000 automations instantly.", "Monitor build quality, validation, deployment readiness, and version history as the company moves from idea to delivery."],
  ["AI agents running<br/><span class=\"text-gradient\">across the globe</span>", "Company departments running<br/><span class=\"text-gradient\">in real time</span>"],
  ["Every deployment, every automation, every decision â€” happening right now across 47 countries.", "Every request, every department, every delivery step â€” happening right now inside the autonomous company."],
  ["Speak to your<br/><span class=\"text-gradient\">AI software company</span>", "Speak to your<br/><span class=\"text-gradient\">AI software company</span>"],
];

for (const [from, to] of fixedReplacements) {
  content = content.replace(from, to);
}

content = content.replace(
  /<h1 class="text-\[42px\][\s\S]*?<\/h1>/,
  '<h1 class="text-[42px] md:text-[72px] lg:text-[88px] font-bold mb-6 tracking-[-0.04em] text-white leading-[1.0] decode-text glitch" data-glitch="The world\'s first autonomous AI software company." data-value="The world\'s first autonomous AI software company.">\n                The world\'s first <br/>\n                <span class="text-gradient">autonomous AI software company.</span>\n            </h1>'
);

content = content.replace(
  /<p class="text-lg md:text-xl text-white\/70 max-w-2xl mx-auto mb-10 leading-relaxed font-normal decode-text"[\s\S]*?<\/p>/,
  '<p class="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed font-normal decode-text" data-value="Describe your business. ANNEXE AI understands requirements, creates proposals, designs architecture, writes production software, tests it, deploys it, and delivers it.">\n                Describe your business. ANNEXE AI understands requirements, creates proposals, designs architecture, writes production software, tests it, deploys it, and delivers it.\n            </p>'
);

content = content.replace(
  /<div class="inline-flex items-center gap-2 px-3 py-1\.5 rounded-lg border border-\[rgba\(52,211,153,0\.25\)\] bg-\[rgba\(52,211,153,0\.06\)\] mb-6">[\s\S]*?<h2 class="text-4xl md:text-5xl font-bold text-white tracking-\[-0\.03em\] mb-5 leading-tight">[\s\S]*?<\/div>/,
  '<div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[rgba(52,211,153,0.25)] bg-[rgba(52,211,153,0.06)] mb-6">\n                        <span class="w-1.5 h-1.5 rounded-full bg-[var(--c-emerald)] animate-pulse shadow-[0_0_6px_var(--c-emerald)]"></span>\n                        <span class="text-[10px] font-sans uppercase tracking-[0.06em] text-[var(--c-emerald)]">Live Company Interface // Connected</span>\n                    </div>\n                    <h2 class="text-4xl md:text-5xl font-bold text-white tracking-[-0.03em] mb-5 leading-tight">Speak to your<br/><span class="text-gradient">AI software company</span></h2>\n                    <p class="text-white/45 leading-relaxed mb-8">Describe your business. The company responds in real time with analysis, proposals, architecture, software, and delivery actions.</p>'
);

content = content.replace(
  /<div class="inline-flex items-center gap-2 px-3 py-1\.5 rounded-lg border border-\[rgba\(129,140,248,0\.25\)\] bg-\[rgba\(129,140,248,0\.06\)\] mb-6">[\s\S]*?<p class="text-white\/40 max-w-lg mx-auto">[\s\S]*?<\/p>/,
  '<div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[rgba(129,140,248,0.25)] bg-[rgba(129,140,248,0.06)] mb-6">\n                    <span class="text-[10px] font-sans uppercase tracking-[0.06em] text-[var(--c-brand2)]">Live Software Factory // Connected</span>\n                </div>\n                <h2 class="text-4xl md:text-5xl font-bold text-white tracking-[-0.03em] mb-4">Your entire software company<br/><span class="text-gradient">on one screen</span></h2>\n                <p class="text-white/40 max-w-lg mx-auto">Every department, every stage, every delivery signal — unified in a single command center.</p>'
);

content = content.replace(
  /<div class="inline-flex items-center gap-2 px-3 py-1\.5 rounded-lg border border-\[rgba\(56,189,248,0\.2\)\] bg-\[rgba\(56,189,248,0\.05\)\] mb-6">[\s\S]*?<p class="text-white\/40 leading-relaxed mb-8">[\s\S]*?<\/p>/,
  '<div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[rgba(56,189,248,0.2)] bg-[rgba(56,189,248,0.05)] mb-6">\n                            <span class="w-1.5 h-1.5 rounded-full bg-[var(--c-brand)] animate-pulse shadow-[0_0_6px_var(--c-brand)]"></span>\n                            <span class="text-[10px] font-sans uppercase tracking-[0.06em] text-[var(--c-brand)]">Global Software Operations // Real-time</span>\n                        </div>\n                        <h2 class="text-4xl md:text-5xl font-bold text-white tracking-[-0.03em] mb-5">Company departments running<br/><span class="text-gradient">in real time</span></h2>\n                        <p class="text-white/40 leading-relaxed mb-8">Every request, every department, every delivery step — happening right now inside the autonomous company.</p>'
);

fs.writeFileSync(path, content, "latin1");
