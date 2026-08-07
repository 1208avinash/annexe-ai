import fs from "fs";

const path = "D:/annex-web/index.html";
let content = fs.readFileSync(path, "latin1");

const style = `
    <style id="annexe-immersive-style">
        .annexe-live-strip {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 12px;
            width: 100%;
            margin-top: 24px;
        }
        .annexe-live-chip,
        .annexe-dept-card,
        .annexe-stage-card,
        .annexe-deliverable-card,
        .annexe-compare-card,
        .annexe-simulator,
        .annexe-preview-modal {
            border: 1px solid rgba(56,189,248,0.12);
            background: linear-gradient(160deg, rgba(4,12,28,0.95), rgba(2,6,16,0.92));
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            box-shadow: 0 0 0 1px rgba(56,189,248,0.04) inset, 0 12px 42px rgba(0,0,0,0.32);
        }
        .annexe-live-chip {
            border-radius: 16px;
            padding: 14px 16px;
        }
        .annexe-live-chip .kicker,
        .annexe-dept-card .kicker,
        .annexe-stage-card .kicker,
        .annexe-deliverable-card .kicker,
        .annexe-compare-card .kicker {
            font-family: 'JetBrains Mono', monospace;
            font-size: 9px;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            color: rgba(226,234,244,0.32);
            margin-bottom: 8px;
        }
        .annexe-live-chip .value,
        .annexe-dept-card .value,
        .annexe-stage-card .value,
        .annexe-deliverable-card .value,
        .annexe-compare-card .value {
            font-size: 20px;
            font-weight: 700;
            letter-spacing: -0.03em;
            color: #fff;
        }
        .annexe-live-chip .sub,
        .annexe-dept-card .sub,
        .annexe-stage-card .sub,
        .annexe-deliverable-card .sub,
        .annexe-compare-card .sub {
            margin-top: 8px;
            font-size: 12px;
            color: rgba(226,234,244,0.48);
            line-height: 1.5;
        }
        .annexe-live-status {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 6px 12px;
            border-radius: 999px;
            border: 1px solid rgba(52,211,153,0.22);
            background: rgba(52,211,153,0.07);
            color: rgba(52,211,153,0.95);
            font-family: 'JetBrains Mono', monospace;
            font-size: 10px;
            letter-spacing: 0.12em;
            text-transform: uppercase;
        }
        .annexe-live-dot {
            width: 7px;
            height: 7px;
            border-radius: 999px;
            background: #34d399;
            box-shadow: 0 0 8px rgba(52,211,153,0.55);
            animation: annexePulse 1.8s ease-in-out infinite;
        }
        .annexe-section-title {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 14px;
            justify-content: space-between;
            margin-bottom: 28px;
        }
        .annexe-section-title p {
            color: rgba(226,234,244,0.45);
            max-width: 48rem;
        }
        .annexe-dept-grid,
        .annexe-stage-grid,
        .annexe-deliverable-grid,
        .annexe-compare-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 16px;
        }
        .annexe-dept-card,
        .annexe-stage-card,
        .annexe-deliverable-card,
        .annexe-compare-card {
            border-radius: 22px;
            padding: 18px;
            position: relative;
            overflow: hidden;
            transition: transform 0.35s cubic-bezier(0.16,1,0.3,1), border-color 0.25s, box-shadow 0.25s;
        }
        .annexe-dept-card:hover,
        .annexe-stage-card:hover,
        .annexe-deliverable-card:hover,
        .annexe-compare-card:hover {
            transform: translateY(-6px);
            border-color: rgba(56,189,248,0.38);
            box-shadow: 0 0 0 1px rgba(56,189,248,0.08) inset, 0 18px 48px rgba(0,0,0,0.42);
        }
        .annexe-progress {
            height: 7px;
            border-radius: 999px;
            background: rgba(255,255,255,0.05);
            overflow: hidden;
            margin-top: 14px;
        }
        .annexe-progress > span {
            display: block;
            height: 100%;
            border-radius: inherit;
            background: linear-gradient(90deg, #38bdf8, #818cf8, #34d399);
            box-shadow: 0 0 12px rgba(56,189,248,0.35);
            transition: width 0.5s ease;
        }
        .annexe-stage-row {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            margin-bottom: 10px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 10px;
            letter-spacing: 0.12em;
            text-transform: uppercase;
        }
        .annexe-pill {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            padding: 6px 10px;
            border-radius: 999px;
            border: 1px solid rgba(56,189,248,0.16);
            background: rgba(56,189,248,0.06);
            font-size: 10px;
            color: rgba(226,234,244,0.7);
        }
        .annexe-simulator {
            border-radius: 28px;
            padding: 22px;
            margin: 0 0 24px;
        }
        .annexe-sim-grid {
            display: grid;
            grid-template-columns: 1.2fr 0.8fr;
            gap: 18px;
        }
        .annexe-sim-input {
            width: 100%;
            border-radius: 16px;
            border: 1px solid rgba(56,189,248,0.16);
            background: rgba(255,255,255,0.03);
            color: #fff;
            padding: 14px 16px;
            font-size: 14px;
            outline: none;
        }
        .annexe-sim-input:focus {
            border-color: rgba(56,189,248,0.42);
            box-shadow: 0 0 0 1px rgba(56,189,248,0.12), 0 0 18px rgba(56,189,248,0.08);
        }
        .annexe-sim-timeline {
            display: grid;
            gap: 10px;
        }
        .annexe-sim-step {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 14px;
            padding: 12px 14px;
            border-radius: 14px;
            border: 1px solid rgba(255,255,255,0.06);
            background: rgba(255,255,255,0.02);
        }
        .annexe-sim-step .label {
            font-size: 12px;
            color: rgba(226,234,244,0.8);
        }
        .annexe-sim-step .state {
            font-family: 'JetBrains Mono', monospace;
            font-size: 9px;
            letter-spacing: 0.16em;
            text-transform: uppercase;
            color: rgba(226,234,244,0.35);
        }
        .annexe-sim-step.active .state { color: #38bdf8; }
        .annexe-sim-step.done .state { color: #34d399; }
        .annexe-compare-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
        }
        .annexe-compare-card .meter {
            display: grid;
            gap: 10px;
            margin-top: 14px;
        }
        .annexe-compare-card .meter div {
            height: 8px;
            border-radius: 999px;
            background: rgba(255,255,255,0.06);
            overflow: hidden;
        }
        .annexe-compare-card .meter span {
            display: block;
            height: 100%;
            border-radius: inherit;
            background: linear-gradient(90deg, #38bdf8, #818cf8);
        }
        .annexe-preview-modal {
            position: fixed;
            inset: 0;
            z-index: 1200;
            display: none;
            align-items: center;
            justify-content: center;
            padding: 24px;
            background: rgba(2,4,8,0.8);
        }
        .annexe-preview-modal.open { display: flex; }
        .annexe-preview-panel {
            width: min(960px, 100%);
            border-radius: 28px;
            border: 1px solid rgba(56,189,248,0.18);
            background: linear-gradient(160deg, rgba(4,12,28,0.98), rgba(2,6,16,0.94));
            padding: 22px;
            box-shadow: 0 0 0 1px rgba(56,189,248,0.05) inset, 0 26px 100px rgba(0,0,0,0.5);
        }
        .annexe-preview-panel pre {
            margin-top: 16px;
            white-space: pre-wrap;
            color: rgba(226,234,244,0.76);
            font-size: 13px;
            line-height: 1.7;
        }
        .annexe-hero-live {
            margin-top: 22px;
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 12px;
        }
        .annexe-hero-live .annexe-live-chip strong { display:block; font-size: 18px; color:#fff; }
        @keyframes annexePulse {
            0%,100% { opacity: 1; }
            50% { opacity: 0.45; }
        }
        @media (max-width: 1024px) {
            .annexe-live-strip,
            .annexe-dept-grid,
            .annexe-stage-grid,
            .annexe-deliverable-grid,
            .annexe-compare-grid,
            .annexe-hero-live,
            .annexe-sim-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
`;

const script = `
    <script>
    (function () {
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const hero = document.querySelector('#page-content header');
        if (hero && !document.getElementById('annexe-hero-live')) {
            const actions = hero.querySelector('[class*="sm:flex-row"]') || hero.querySelector('.flex.flex-col') || hero.querySelector('.flex');
            if (actions) {
                actions.insertAdjacentHTML('afterend', \`
                    <div id="annexe-hero-live" class="annexe-hero-live">
                        <div class="annexe-live-chip">
                            <div class="kicker">AI Company Online</div>
                            <strong id="hero-company-state">Live</strong>
                            <div class="sub">Factory health and delivery flow are active right now.</div>
                        </div>
                        <div class="annexe-live-chip">
                            <div class="kicker">Factory Health</div>
                            <strong id="hero-factory-health">100%</strong>
                            <div class="sub">Validation, build, and deployment signals are green.</div>
                        </div>
                        <div class="annexe-live-chip">
                            <div class="kicker">Projects Building</div>
                            <strong id="hero-projects-building">12</strong>
                            <div class="sub">CRM, ERP, HRMS, healthcare, marketplace, and more.</div>
                        </div>
                        <div class="annexe-live-chip">
                            <div class="kicker">Departments Active</div>
                            <strong id="hero-departments-active">11</strong>
                            <div class="sub">Sales through Delivery are working as one company.</div>
                        </div>
                    </div>
                \`);
            }
        }

        const companySection = document.getElementById('ai-terminal-section');
        if (companySection && !document.getElementById('annexe-department-board')) {
            companySection.insertAdjacentHTML('beforeend', \`
                <div id="annexe-department-board" style="margin-top:24px;">
                    <div class="annexe-section-title">
                        <div>
                            <div class="annexe-pill">Live AI Company</div>
                            <h3 style="margin-top:12px;font-size:28px;color:#fff;letter-spacing:-0.03em;">Departments working in real time</h3>
                        </div>
                        <p>Each department reports its current task, progress, completion, and ETA so the visitor experiences a live software company instead of a brochure.</p>
                    </div>
                    <div class="annexe-dept-grid" id="annexe-dept-grid"></div>
                </div>
            \`);
        }

        const factorySection = document.getElementById('holo-dashboard-section');
        if (factorySection && !document.getElementById('annexe-factory-pipeline')) {
            const insertPoint = factorySection.querySelector('#holo-dash') || factorySection.firstElementChild;
            insertPoint.insertAdjacentHTML('beforebegin', \`
                <div id="annexe-factory-pipeline" style="margin-bottom:24px;">
                    <div class="annexe-section-title">
                        <div>
                            <div class="annexe-pill">Live Software Factory</div>
                            <h3 style="margin-top:12px;font-size:28px;color:#fff;letter-spacing:-0.03em;">Animated production pipeline</h3>
                        </div>
                        <p>Business Discovery, Requirements, Proposal, Architecture, Database, Backend, Frontend, Testing, Deployment, and Delivery move through queued, running, and completed states.</p>
                    </div>
                    <div class="annexe-stage-grid" id="annexe-stage-grid"></div>
                </div>
            \`);
        }

        const workflowSection = document.getElementById('workflow-library');
        if (workflowSection && !document.getElementById('annexe-build-simulator')) {
            const banner = workflowSection.querySelector('.glass-panel.tilt-card.w-full.max-w-6xl');
            if (banner) {
                banner.insertAdjacentHTML('afterend', \`
                    <div id="annexe-build-simulator" class="annexe-simulator">
                        <div class="annexe-section-title">
                            <div>
                                <div class="annexe-pill">Interactive Build Simulator</div>
                                <h3 style="margin-top:12px;font-size:28px;color:#fff;letter-spacing:-0.03em;">Type a project idea and watch the company simulate delivery</h3>
                            </div>
                            <p>Pure frontend simulation. Try <strong>CRM for Real Estate</strong> or any software request and the factory will animate analysis, architecture, engineering, QA, and deployment.</p>
                        </div>
                        <div class="annexe-sim-grid">
                            <div>
                                <input id="annexe-sim-input" class="annexe-sim-input" value="CRM for Real Estate" aria-label="Build simulator input">
                                <div style="display:flex;gap:10px;margin-top:12px;flex-wrap:wrap;">
                                    <button id="annexe-sim-run" class="btn-3d burst-btn relative group overflow-hidden bg-white text-[#020408] px-6 py-3 rounded-xl font-semibold text-sm">Simulate Build</button>
                                    <span class="annexe-pill">No backend required</span>
                                </div>
                                <div style="margin-top:14px;color:rgba(226,234,244,0.45);font-size:13px;line-height:1.7;">
                                    <span id="annexe-sim-copy">Awaiting project idea. The company will respond with a live build sequence.</span>
                                </div>
                            </div>
                            <div class="annexe-sim-timeline" id="annexe-sim-timeline"></div>
                        </div>
                    </div>
                \`);
            }
        }

        const trustSection = document.getElementById('trust-section');
        if (trustSection && !document.getElementById('annexe-deliverables')) {
            trustSection.insertAdjacentHTML('beforebegin', \`
                <section id="annexe-deliverables" class="w-full py-24 px-6 max-w-7xl mx-auto reveal-up relative z-10">
                    <div class="annexe-section-title">
                        <div>
                            <div class="annexe-pill">Generated Deliverables</div>
                            <h2 style="margin-top:12px;font-size:34px;color:#fff;letter-spacing:-0.03em;">Open the actual outputs customers receive</h2>
                        </div>
                        <p>Proposal, architecture, database schema, API docs, frontend, backend, Docker, CI, QA report, deployment guide, and delivery package.</p>
                    </div>
                    <div class="annexe-deliverable-grid" id="annexe-deliverable-grid"></div>
                </section>
            \`);
        }

        const vsSection = document.getElementById('vs-section');
        if (vsSection && !document.getElementById('annexe-comparison-grid')) {
            const table = vsSection.querySelector('#vs-table');
            if (table && table.parentElement) {
                table.parentElement.style.display = 'none';
                table.parentElement.insertAdjacentHTML('beforebegin', \`
                    <div id="annexe-comparison-grid" style="margin-bottom:18px;">
                        <div class="annexe-section-title">
                            <div>
                                <div class="annexe-pill">Animated Comparison</div>
                                <h3 style="margin-top:12px;font-size:28px;color:#fff;letter-spacing:-0.03em;">ANNEXE AI versus the old ways of building software</h3>
                            </div>
                            <p>Speed, quality, architecture, automation, testing, and deployment are shown as live bars instead of a static table.</p>
                        </div>
                        <div class="annexe-compare-grid" id="annexe-compare-grid"></div>
                    </div>
                \`);
            }
        }

        const chatbotWindow = document.getElementById('chatbot-window');
        if (chatbotWindow) {
            const label = document.getElementById('annexe-greeting-label');
            const greeting = document.getElementById('annexe-greeting-text');
            if (label) label.textContent = 'AI CEO ONLINE';
            if (greeting) greeting.textContent = "I'm the AI CEO of ANNEXE AI. Tell me about your business. I'll assemble an AI company to build your software.";
            const messages = document.getElementById('chat-messages');
            if (messages && !document.getElementById('annexe-ceo-example')) {
                messages.insertAdjacentHTML('beforeend', \`
                    <div class="message user" id="annexe-ceo-example">I need software.</div>
                    <div class="message bot" id="annexe-ceo-response">What industry are you in?<br><br>How many users will use it?<br><br>What problems are you trying to solve?</div>
                \`);
            }
        }

        const departments = [
            ['Sales Consultant', 'New opportunities detected', 91, '02m'],
            ['Business Analyst', 'Requirements being composed', 86, '03m'],
            ['Solution Architect', 'Blueprint ready', 95, '05m'],
            ['Project Manager', 'Delivery plan updated', 88, '04m'],
            ['Engineering Director', 'Factory allocations approved', 92, '03m'],
            ['Frontend Engineers', 'UI building in progress', 84, '06m'],
            ['Backend Engineers', 'API routes being wired', 89, '06m'],
            ['Database Engineers', 'Schemas and migrations active', 93, '05m'],
            ['QA Department', 'Validation suite running', 87, '04m'],
            ['DevOps', 'Deployment packaging complete', 90, '03m'],
            ['Delivery', 'Hand-off sequence prepared', 96, '02m']
        ];

        const stages = [
            ['Business Discovery', 'completed'],
            ['Requirements', 'completed'],
            ['Proposal', 'completed'],
            ['Architecture', 'running'],
            ['Database', 'queued'],
            ['Backend', 'queued'],
            ['Frontend', 'queued'],
            ['Testing', 'queued'],
            ['Deployment', 'queued'],
            ['Delivery', 'queued']
        ];

        const deliverables = [
            ['Proposal', 'commercial package'],
            ['Architecture', 'blueprint and stack'],
            ['Database Schema', 'entities and relationships'],
            ['API Docs', 'endpoint catalog'],
            ['Frontend', 'React build artifact'],
            ['Backend', 'FastAPI build artifact'],
            ['Docker', 'containerization assets'],
            ['CI', 'automation workflow'],
            ['QA Report', 'validation evidence'],
            ['Deployment Guide', 'release steps'],
            ['Delivery Package', 'handoff bundle']
        ];

        const compare = [
            ['Traditional Agency', [22, 34, 28, 20, 24, 24]],
            ['Freelancers', [35, 40, 30, 18, 26, 22]],
            ['Low-Code', [54, 48, 42, 50, 38, 44]],
            ['ANNEXE AI', [96, 95, 98, 97, 96, 99]]
        ];

        function renderDepartments() {
            const grid = document.getElementById('annexe-dept-grid');
            if (!grid) return;
            grid.innerHTML = departments.map(([name, task, progress, eta], index) => \`
                <article class="annexe-dept-card">
                    <div class="kicker">Department \${String(index + 1).padStart(2, '0')}</div>
                    <div class="value">\${name}</div>
                    <div style="display:flex;justify-content:space-between;gap:10px;margin-top:12px;">
                        <span class="annexe-pill">Status: Active</span>
                        <span class="annexe-pill">ETA \${eta}</span>
                    </div>
                    <div class="sub">Current task: \${task}</div>
                    <div class="annexe-progress"><span style="width:\${progress}%"></span></div>
                    <div class="sub" style="display:flex;justify-content:space-between;margin-top:10px;">
                        <span>Progress</span><strong style="color:#fff;">\${progress}%</strong>
                    </div>
                </article>
            \`).join('');
        }

        function renderStages(activeIndex = 3) {
            const grid = document.getElementById('annexe-stage-grid');
            if (!grid) return;
            grid.innerHTML = stages.map(([label, state], index) => \`
                <article class="annexe-stage-card \${state === 'running' ? 'is-running' : ''}">
                    <div class="annexe-stage-row">
                        <span>\${String(index + 1).padStart(2, '0')}</span>
                        <span class="state">\${state}</span>
                    </div>
                    <div class="value">\${label}</div>
                    <div class="sub">\${state === 'running' ? 'Currently processing live generation steps.' : state === 'completed' ? 'Completed and locked.' : 'Queued for the next stage.'}</div>
                    <div class="annexe-progress"><span style="width:\${state === 'completed' ? 100 : state === 'running' ? 72 : 12}%"></span></div>
                </article>
            \`).join('');
        }

        function renderSimulator(idea) {
            const timeline = document.getElementById('annexe-sim-timeline');
            const copy = document.getElementById('annexe-sim-copy');
            if (!timeline || !copy) return;
            const simStages = [
                ['Business Analysis', 'running', 26],
                ['Architecture', 'queued', 15],
                ['Engineering', 'queued', 12],
                ['QA', 'queued', 8],
                ['Deployment', 'queued', 5]
            ];
            copy.textContent = \`Simulating \${idea}. The factory is composing the delivery path in real time.\`;
            timeline.innerHTML = simStages.map(([label, state, progress]) => \`
                <div class="annexe-sim-step \${state === 'running' ? 'active' : ''} \${progress >= 20 ? 'done' : ''}">
                    <div>
                        <div class="label">\${label}</div>
                        <div class="annexe-progress" style="margin-top:8px;"><span style="width:\${progress}%"></span></div>
                    </div>
                    <div class="state">\${state}</div>
                </div>
            \`).join('');
        }

        function renderDeliverables() {
            const grid = document.getElementById('annexe-deliverable-grid');
            if (!grid) return;
            grid.innerHTML = deliverables.map(([title, subtitle], index) => \`
                <article class="annexe-deliverable-card" data-deliverable="\${title}">
                    <div class="kicker">Deliverable \${String(index + 1).padStart(2, '0')}</div>
                    <div class="value">\${title}</div>
                    <div class="sub">\${subtitle}</div>
                    <div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap;">
                        <span class="annexe-pill">Preview</span>
                        <span class="annexe-pill">Open modal</span>
                    </div>
                </article>
            \`).join('');
        }

        function renderComparison() {
            const grid = document.getElementById('annexe-compare-grid');
            if (!grid) return;
            const labels = ['Speed', 'Quality', 'Architecture', 'Automation', 'Testing', 'Deployment'];
            grid.innerHTML = compare.map(([name, values]) => \`
                <article class="annexe-compare-card">
                    <div class="kicker">\${name}</div>
                    <div class="value">\${name === 'ANNEXE AI' ? 'Recommended' : 'Alternative'}</div>
                    <div class="meter">
                        \${values.map((value, idx) => \`<div title="\${labels[idx]}"><span style="width:\${value}%"></span></div>\`).join('')}
                    </div>
                    <div class="sub">\${labels.map((label, idx) => \`\${label}: \${values[idx]}%\`).join(' | ')}</div>
                </article>
            \`).join('');
        }

        function mountModal() {
            if (document.getElementById('annexe-preview-modal')) return;
            document.body.insertAdjacentHTML('beforeend', \`
                <div class="annexe-preview-modal" id="annexe-preview-modal" aria-hidden="true">
                    <div class="annexe-preview-panel">
                        <div style="display:flex;justify-content:space-between;gap:16px;align-items:center;">
                            <div>
                                <div class="annexe-pill">Generated Output Preview</div>
                                <h3 id="annexe-preview-title" style="margin-top:10px;font-size:28px;color:#fff;letter-spacing:-0.03em;">Proposal</h3>
                            </div>
                            <button id="annexe-preview-close" class="btn-3d burst-btn px-5 py-3 rounded-xl font-semibold text-sm text-white border border-[rgba(56,189,248,0.2)] hover:bg-[rgba(56,189,248,0.08)]">Close</button>
                        </div>
                        <pre id="annexe-preview-body">Preview content</pre>
                    </div>
                </div>
            \`);

            const modal = document.getElementById('annexe-preview-modal');
            const close = document.getElementById('annexe-preview-close');
            if (modal && close) {
                close.addEventListener('click', () => modal.classList.remove('open'));
                modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('open'); });
            }
        }

        function openPreview(title) {
            const modal = document.getElementById('annexe-preview-modal');
            const body = document.getElementById('annexe-preview-body');
            const titleEl = document.getElementById('annexe-preview-title');
            if (!modal || !body || !titleEl) return;
            const previewMap = {
                Proposal: 'Commercial proposal\\n\\n- Project overview\\n- Scope and timeline\\n- Commercial assumptions\\n- Approval path',
                Architecture: 'System architecture\\n\\n- Frontend: React\\n- Backend: FastAPI\\n- Database: PostgreSQL\\n- Delivery: Docker + CI/CD',
                'Database Schema': 'Database schema\\n\\n- Tenants\\n- Users\\n- Projects\\n- Deliverables\\n- Deployments',
                'API Docs': 'API documentation\\n\\n- /health\\n- /auth/login\\n- /projects\\n- /deliverables',
                Frontend: 'Frontend preview\\n\\n- Responsive portal\\n- Live sections\\n- Motion-rich product UI',
                Backend: 'Backend preview\\n\\n- FastAPI routers\\n- JWT auth\\n- CRUD endpoints\\n- Validation',
                Docker: 'Docker preview\\n\\n- Containerized web app\\n- Production runtime\\n- Deployable image',
                CI: 'CI preview\\n\\n- Lint\\n- Build\\n- Test\\n- Validation gates',
                'QA Report': 'QA report\\n\\n- Syntax validation: pass\\n- Build validation: pass\\n- Runtime validation: pass',
                'Deployment Guide': 'Deployment guide\\n\\n- Environment setup\\n- Docker\\n- Render / Railway / Vercel options',
                'Delivery Package': 'Delivery package\\n\\n- Source code\\n- Reports\\n- Handover notes\\n- Version manifest'
            };
            titleEl.textContent = title;
            body.textContent = previewMap[title] || 'Preview unavailable.';
            modal.classList.add('open');
        }

        function updateHeroStats() {
            const map = [
                ['hero-company-state', 'Online'],
                ['hero-factory-health', '100%'],
                ['hero-projects-building', '12'],
                ['hero-departments-active', '11']
            ];
            map.forEach(([id, value]) => {
                const el = document.getElementById(id);
                if (el) el.textContent = value;
            });
        }

        renderDepartments();
        renderStages();
        renderComparison();
        renderDeliverables();
        mountModal();
        updateHeroStats();
        renderSimulator('CRM for Real Estate');

        const simInput = document.getElementById('annexe-sim-input');
        const simRun = document.getElementById('annexe-sim-run');
        if (simRun && simInput) {
            simRun.addEventListener('click', () => renderSimulator(simInput.value.trim() || 'CRM for Real Estate'));
        }
        if (simInput) {
            simInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') renderSimulator(simInput.value.trim() || 'CRM for Real Estate');
            });
        }

        document.addEventListener('click', (e) => {
            const card = e.target.closest('.annexe-deliverable-card');
            if (card) {
                openPreview(card.getAttribute('data-deliverable') || 'Proposal');
            }
        });

        if (!reduceMotion) {
            const statTargets = [
                ['#hero-projects-building', 12],
                ['#hero-departments-active', 11]
            ];
            let tick = 0;
            setInterval(() => {
                tick++;
                const company = document.getElementById('hero-company-state');
                if (company) company.textContent = tick % 2 === 0 ? 'Online' : 'Live';
                statTargets.forEach(([selector, base], index) => {
                    const el = document.querySelector(selector);
                    if (el) el.textContent = String(base + ((tick + index) % 3));
                });
                const stagesEls = document.querySelectorAll('#annexe-stage-grid .annexe-stage-card');
                stagesEls.forEach((el, index) => {
                    const state = index < 3 ? 'completed' : index === (tick % stagesEls.length) + 2 ? 'running' : 'queued';
                    const stateEl = el.querySelector('.state');
                    if (stateEl) stateEl.textContent = state;
                });
            }, 3200);
        }
    })();
    </script>
`;

content = content.replace(/<style id="annexe-immersive-style">[\s\S]*?<\/style>\r?\n?/g, "");
content = content.replace(/<script>\s*\(function \(\) \{\s*const reduceMotion = window\.matchMedia\('\(prefers-reduced-motion: reduce\)'\)\.matches;[\s\S]*?\n\s*<\/script>\r?\n?/g, "");
content = content.replace('</head>', `${style}</head>`);
content = content.replace('</body>', `${script}</body>`);

fs.writeFileSync(path, content, "latin1");
