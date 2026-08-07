export function renderLayout({ title, modules = [] }) {
  return `
    <main class="app-shell">
      <section class="hero">
        <p class="eyebrow">ANNEXE AI</p>
        <h1>${title}</h1>
        <p>Generated enterprise CRM foundation.</p>
      </section>
      <section class="modules">
        ${modules.map(module => `<article class="card"><h2>${module}</h2></article>`).join("")}
      </section>
    </main>
  `;
}
