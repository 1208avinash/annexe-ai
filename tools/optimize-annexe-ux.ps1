$path = "D:\annex-web\index.html"
$encoding = [System.Text.Encoding]::Default
$content = [System.IO.File]::ReadAllText($path, $encoding)

$replacements = @(
    @{
        Old = '    <title>ANNEXE AI | Autonomous AI Employees for Enterprise Operations</title>'
        New = '    <title>ANNEXE AI | Autonomous AI Software Company</title>'
    },
    @{
        Old = '    <meta name="description"          content="Deploy autonomous AI employees that run your business 24/7. Automate sales, support, finance, and ops workflows — SOC 2 compliant, 268+ integrations, live in under a day.">'
        New = '    <meta name="description"          content="ANNEXE AI is the world''s first autonomous AI software company. We understand requirements, create proposals, design architecture, write production software, test it, deploy it, and deliver it.">'
    },
    @{
        Old = '    <meta name="keywords"             content="AI automation, enterprise AI, autonomous agents, AI workforce, RPA alternative, workflow automation, SOC 2 AI, HIPAA AI, GDPR AI">'
        New = '    <meta name="keywords"             content="autonomous AI software company, enterprise software, AI software factory, CRM, ERP, SaaS platform, production software, capability engine">'
    },
    @{
        Old = '    <meta property="og:title"         content="ANNEXE AI — Autonomous AI Employees for Enterprise">'
        New = '    <meta property="og:title"         content="ANNEXE AI — Autonomous AI Software Company">'
    },
    @{
        Old = '    <meta property="og:description"   content="Replace repetitive ops work with AI agents that run 24/7. SOC 2 Type II · GDPR · HIPAA · 268+ integrations. First 14 days free.">'
        New = '    <meta property="og:description"   content="Describe your business. ANNEXE AI understands requirements, creates proposals, designs architecture, writes production software, tests it, deploys it, and delivers it.">'
    },
    @{
        Old = '    <meta property="og:image:alt"     content="ANNEXE AI — autonomous AI employees dashboard showing live agent activity">'
        New = '    <meta property="og:image:alt"     content="ANNEXE AI — autonomous AI software company dashboard showing live company and factory activity">'
    },
    @{
        Old = '    <meta name="twitter:title"        content="ANNEXE AI — Autonomous AI Employees for Enterprise">'
        New = '    <meta name="twitter:title"        content="ANNEXE AI — Autonomous AI Software Company">'
    },
    @{
        Old = '    <meta name="twitter:description"  content="Deploy AI agents that run sales, support, finance, and ops 24/7. SOC 2 · GDPR · HIPAA. Live in under a day.">'
        New = '    <meta name="twitter:description"  content="Describe your business. ANNEXE AI turns it into proposal, architecture, production software, testing, deployment, and delivery.">'
    },
    @{
        Old = '    <meta name="twitter:image:alt"    content="ANNEXE AI dashboard — autonomous AI agents in action">'
        New = '    <meta name="twitter:image:alt"    content="ANNEXE AI dashboard — autonomous AI software company in action">'
    },
    @{
        Old = '          "description": "Enterprise AI automation platform. Deploy autonomous AI employees that run your business operations 24/7.",'
        New = '          "description": "Autonomous AI software company that turns business requests into production-ready enterprise software.",'
    },
    @{
        Old = '          "description": "Deploy autonomous AI employees for sales, support, finance, and operations. SOC 2 Type II certified, GDPR and HIPAA compliant, 268+ integrations.",'
        New = '          "description": "Describe your business and ANNEXE AI will deliver proposal, architecture, software, testing, deployment, and handoff.",'
    },
    @{
        Old = '        14-day free trial · No credit card required · Deploy your first AI agent in under a day'
        New = '        Start your software company with ANNEXE AI · No credit card required · Watch live generation'
    },
    @{
        Old = 'Start free →'
        New = 'Start Your Project'
    },
    @{
        Old = 'Deploy Now'
        New = 'Start Your Project'
    },
    @{
        Old = 'Intelligence that runs your business.'
        New = 'The world''s first autonomous AI software company.'
    },
    @{
        Old = 'Deploy autonomous AI employees and enterprise operating systems that work 24/7. Reduce operational costs, eliminate repetitive work, and scale infinitely.'
        New = 'Describe your business. ANNEXE AI understands requirements, creates proposals, designs architecture, writes production software, tests it, deploys it, and delivers it.'
    },
    @{
        Old = 'Start AI Transformation'
        New = 'Start Your Project'
    },
    @{
        Old = 'Watch System Demo'
        New = 'Watch Live Generation'
    },
    @{
        Old = 'AI workforce'
        New = 'autonomous software company'
    },
    @{
        Old = 'Ask your AI workforce anything…'
        New = 'Describe your software idea…'
    },
    @{
        Old = 'Talk to your<br/><span class="text-gradient">AI workforce</span>'
        New = 'Speak to your<br/><span class="text-gradient">AI software company</span>'
    },
    @{
        Old = 'Type any business question. Your AI agents answer in real time — querying data, drafting documents, and taking action across your entire stack.'
        New = 'Describe your business. The company responds in real time with analysis, proposals, architecture, software, and delivery actions.'
    },
    @{
        Old = 'Live AI Interface // Connected'
        New = 'Live Company Interface // Connected'
    },
    @{
        Old = 'ANNEXE AI // Neural Terminal v5.0'
        New = 'ANNEXE AI // Company Terminal v5.0'
    },
    @{
        Old = 'Autonomous Ops'
        New = 'Autonomous Delivery'
    },
    @{
        Old = 'Enterprise AI Agents'
        New = 'Enterprise Software Delivery'
    },
    @{
        Old = 'Enterprise Automation Library'
        New = 'What ANNEXE AI Builds'
    },
    @{
        Old = 'Search and deploy from our curated collection of 4,300+ professional AI and business workflows.'
        New = 'Production-ready applications, platforms, and enterprise systems delivered through the same factory kernel.'
    },
    @{
        Old = 'Search workflows... (e.g., lead routing, automated outreach)'
        New = 'Search software systems... (e.g., CRM, ERP, hospital, marketplace)'
    },
    @{
        Old = 'All Categories'
        New = 'All Systems'
    },
    @{
        Old = 'AI Agents'
        New = 'Software Types'
    },
    @{
        Old = 'Data Processing'
        New = 'Enterprise'
    },
    @{
        Old = 'CRM & Sales'
        New = 'Industry Apps'
    },
    @{
        Old = 'Finance'
        New = 'Operations'
    },
    @{
        Old = 'All Complexities'
        New = 'All Delivery Stages'
    },
    @{
        Old = 'All Triggers'
        New = 'All Capabilities'
    },
    @{
        Old = 'Total Workflows'
        New = 'Application Types'
    },
    @{
        Old = 'Active Systems'
        New = 'Capabilities'
    },
    @{
        Old = 'Integrations'
        New = 'Deployment Targets'
    },
    @{
        Old = 'Categories'
        New = 'Industries'
    },
    @{
        Old = 'Deploy specialized AI agents for sales, support, finance, and operations. Each agent learns your workflows and executes 24/7 without fatigue or errors.'
        New = 'Deploy specialized teams for sales, analysis, architecture, engineering, QA, and DevOps. Each department contributes to production software delivery.'
    },
    @{
        Old = 'Companies are replacing repetitive workflows with intelligent AI agents.'
        New = 'Companies are replacing fragmented vendors with a single autonomous software company.'
    },
    @{
        Old = 'Ready to deploy your <span class="text-gradient">AI workforce?</span>'
        New = 'Ready to build your <span class="text-gradient">software company with AI?</span>'
    },
    @{
        Old = 'Join 2,400+ enterprises automating their operations with ANNEXE AI. First 14 days free, no credit card required.'
        New = 'Ready to build your software company with AI? Start with a proposal, a blueprint, and a live build path.'
    },
    @{
        Old = 'Start 14-Day Free Trial'
        New = 'Start Building'
    },
    @{
        Old = 'Talk to an Expert'
        New = 'Book Demo'
    },
    @{
        Old = 'AI CONSULTANT ONLINE'
        New = 'AI CEO ONLINE'
    },
    @{
        Old = 'May I help you optimize your business?'
        New = 'What industry are you building for?'
    },
    @{
        Old = 'ANNEXE AI COMMAND CENTER'
        New = 'ANNEXE AI CEO COMMAND CENTER'
    },
    @{
        Old = 'AI Consulting Operations'
        New = 'Autonomous Software Company Operations'
    },
    @{
        Old = 'What business challenge should we analyze?'
        New = 'What industry are you in?'
    }
)

foreach ($item in $replacements) {
    $content = $content.Replace($item.Old, $item.New)
}

$content = $content.Replace(
    '                    <h2 class="text-4xl md:text-5xl font-bold text-white tracking-[-0.03em] mb-5 leading-tight">Talk to your<br/><span class="text-gradient">AI workforce</span></h2>',
    '                    <h2 class="text-4xl md:text-5xl font-bold text-white tracking-[-0.03em] mb-5 leading-tight">Speak to your<br/><span class="text-gradient">AI software company</span></h2>'
)

$content = $content.Replace(
    '            <h2 class="text-4xl md:text-5xl font-bold text-white tracking-[-0.03em] mb-4">Your entire business<br/><span class="text-gradient">on one screen</span></h2>',
    '            <h2 class="text-4xl md:text-5xl font-bold text-white tracking-[-0.03em] mb-4">Your entire software company<br/><span class="text-gradient">on one screen</span></h2>'
)

$content = $content.Replace(
    '            <p class="text-white/40 max-w-lg mx-auto">Every agent, every pipeline, every metric — unified in a single command center.</p>',
    '            <p class="text-white/40 max-w-lg mx-auto">Every department, every stage, every delivery signal — unified in a single command center.</p>'
)

$content = $content.Replace(
    '            <h2 class="text-4xl md:text-5xl font-bold text-white tracking-[-0.03em]">Deploy in <span class="text-gradient">three steps</span></h2>',
    '            <h2 class="text-4xl md:text-5xl font-bold text-white tracking-[-0.03em]">Deliver in <span class="text-gradient">three steps</span></h2>'
)

$content = $content.Replace(
    '                <h3 class="tilt-pop text-lg font-bold text-white mb-3">Map Your Business</h3>',
    '                <h3 class="tilt-pop text-lg font-bold text-white mb-3">Define the business</h3>'
)

$content = $content.Replace(
    '                <p class="tilt-pop-sm text-white/60 text-sm leading-relaxed">Connect your tools, share your workflows, and let our AI map your entire operational landscape in minutes.</p>',
    '                <p class="tilt-pop-sm text-white/60 text-sm leading-relaxed">Share the industry, users, integrations, and deployment preference. ANNEXE AI maps the request into a buildable blueprint.</p>'
)

$content = $content.Replace(
    '                <h3 class="tilt-pop text-lg font-bold text-white mb-3">Deploy AI Agents</h3>',
    '                <h3 class="tilt-pop text-lg font-bold text-white mb-3">Generate the factory plan</h3>'
)

$content = $content.Replace(
    '                <p class="tilt-pop-sm text-white/60 text-sm leading-relaxed">Select from 4,343 pre-built automation workflows or custom-build your own. One-click deployment to production.</p>',
    '                <p class="tilt-pop-sm text-white/60 text-sm leading-relaxed">Create proposal, architecture, backend, frontend, and delivery flow from the same factory kernel. One-click generation to production.</p>'
)

$content = $content.Replace(
    '                <h3 class="tilt-pop text-lg font-bold text-white mb-3">Scale Infinitely</h3>',
    '                <h3 class="tilt-pop text-lg font-bold text-white mb-3">Deliver production software</h3>'
)

$content = $content.Replace(
    '                <p class="tilt-pop-sm text-white/60 text-sm leading-relaxed">Monitor performance in real-time. Every agent self-optimizes. Scale from 1 to 10,000 automations instantly.</p>',
    '                <p class="tilt-pop-sm text-white/60 text-sm leading-relaxed">Monitor build quality, validation, deployment readiness, and version history as the company moves from idea to delivery.</p>'
)

$content = $content.Replace(
    '                <h2 class="text-4xl md:text-5xl font-bold text-white tracking-[-0.03em] mb-5">AI agents running<br/><span class="text-gradient">across the globe</span></h2>',
    '                <h2 class="text-4xl md:text-5xl font-bold text-white tracking-[-0.03em] mb-5">Company departments running<br/><span class="text-gradient">in real time</span></h2>'
)

$content = $content.Replace(
    '                        <p class="text-white/40 leading-relaxed mb-8">Every deployment, every automation, every decision — happening right now across 47 countries.</p>',
    '                        <p class="text-white/40 leading-relaxed mb-8">Every request, every department, every delivery step — happening right now inside the autonomous company.</p>'
)

$content = $content.Replace(
    '            <h2 class="text-4xl md:text-5xl font-bold text-white tracking-[-0.03em] mb-5">',
    '            <h2 class="text-4xl md:text-5xl font-bold text-white tracking-[-0.03em] mb-5">'
)

$content = $content.Replace(
    '                <h2 class="text-4xl md:text-5xl font-bold text-white tracking-[-0.03em] mb-5">',
    '                <h2 class="text-4xl md:text-5xl font-bold text-white tracking-[-0.03em] mb-5">'
)

[System.IO.File]::WriteAllText($path, $content, $encoding)
