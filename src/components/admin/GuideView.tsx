export function GuideView() {
  return (
    <div className="max-w-3xl mx-auto space-y-10 pb-16">
      <header>
        <h1 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">
          Content Editor Guide
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Quick reference for managing website content. Full guide with examples available in <code className="text-xs px-1 py-0.5 rounded bg-slate-100 dark:bg-white/5 font-mono">docs/content-editor-guide.md</code>
        </p>
      </header>

      {/* ── JSON REFERENCE ── */}
      <section>
        <h2 className="text-lg font-heading font-bold text-slate-900 dark:text-white mb-3">JSON Quick Reference</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Some fields store data as JSON. Paste into <a href="https://jsonlint.com" target="_blank" className="text-blue-500 hover:underline">jsonlint.com</a> to validate before saving.
        </p>
        <div className="space-y-4">
          <CodeBlock
            title="Project Stats"
            json={`[\n  { "label": "Population Served", "value": "300,000+" },\n  { "label": "Treatment Capacity", "value": "50 MLD" }\n]`}
          />
          <CodeBlock
            title="Project Technology"
            json={`{\n  "description": "SBR technology for biological treatment",\n  "tags": ["SBR", "Biological Treatment"]\n}`}
          />
          <CodeBlock
            title="Project Impact Metrics"
            json={`[\n  { "label": "Water Treated", "value": "50M L/day", "improvement": "+30%" },\n  { "label": "Energy Efficiency", "value": "100 kWh", "improvement": "-15%" }\n]`}
          />
          <CodeBlock
            title="Team Links"
            json={`[\n  { "type": "linkedin", "label": "LinkedIn", "url": "https://..." },\n  { "type": "email", "label": "Email", "url": "mailto:..." }\n]`}
          />
          <CodeBlock
            title="CSR Timeline"
            json={`[\n  {\n    "date": "2024-01",\n    "title": "Project Launch",\n    "description": "Started...",\n    "photo": null\n  }\n]`}
          />
        </div>
      </section>

      {/* ── COMMON MISTAKES ── */}
      <section>
        <h2 className="text-lg font-heading font-bold text-slate-900 dark:text-white mb-3">Common JSON Mistakes</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10">
                <th className="text-left py-2 px-3 text-slate-500 font-medium">Wrong</th>
                <th className="text-left py-2 px-3 text-slate-500 font-medium">Fixed</th>
                <th className="text-left py-2 px-3 text-slate-500 font-medium">Why</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              <tr className="border-b border-slate-100 dark:border-white/5">
                <td className="py-2 px-3 text-red-500">{`{label: "text"}`}</td>
                <td className="py-2 px-3 text-emerald-600">{`{"label": "text"}`}</td>
                <td className="py-2 px-3 text-slate-400 font-sans">Keys need double quotes</td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-white/5">
                <td className="py-2 px-3 text-red-500">{`["text",]`}</td>
                <td className="py-2 px-3 text-emerald-600">{`["text"]`}</td>
                <td className="py-2 px-3 text-slate-400 font-sans">No trailing comma</td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-white/5">
                <td className="py-2 px-3 text-red-500">{`{}{}`}</td>
                <td className="py-2 px-3 text-emerald-600">{`[{}, {}]`}</td>
                <td className="py-2 px-3 text-slate-400 font-sans">Multiple items need [] wrapper</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-red-500">{`{"a":1 "b":2}`}</td>
                <td className="py-2 px-3 text-emerald-600">{`{"a":1, "b":2}`}</td>
                <td className="py-2 px-3 text-slate-400 font-sans">Missing comma between props</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── COMMA-SEPARATED FIELDS ── */}
      <section>
        <h2 className="text-lg font-heading font-bold text-slate-900 dark:text-white mb-3">Comma-Separated Fields</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Type items separated by commas — no brackets or quotes needed.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10">
                <th className="text-left py-2 px-3 text-slate-500 font-medium">Field</th>
                <th className="text-left py-2 px-3 text-slate-500 font-medium">Form</th>
                <th className="text-left py-2 px-3 text-slate-500 font-medium">Example</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-white/5">
                <td className="py-2 px-3 text-slate-700 dark:text-slate-300 font-medium">News Tags</td>
                <td className="py-2 px-3 text-slate-500">News form</td>
                <td className="py-2 px-3 text-slate-500 font-mono">Puerto Princesa, Awards, Water</td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-white/5">
                <td className="py-2 px-3 text-slate-700 dark:text-slate-300 font-medium">Expertise</td>
                <td className="py-2 px-3 text-slate-500">Team form</td>
                <td className="py-2 px-3 text-slate-500 font-mono">Water Treatment, PPP, Engineering</td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-white/5">
                <td className="py-2 px-3 text-slate-700 dark:text-slate-300 font-medium">Gallery</td>
                <td className="py-2 px-3 text-slate-500">Project/CSR form</td>
                <td className="py-2 px-3 text-slate-500 font-mono">https://img1.jpg, https://img2.jpg</td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-white/5">
                <td className="py-2 px-3 text-slate-700 dark:text-slate-300 font-medium">SDG Tags</td>
                <td className="py-2 px-3 text-slate-500">CSR form</td>
                <td className="py-2 px-3 text-slate-500 font-mono">SDG 14, SDG 13, SDG 11</td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-white/5">
                <td className="py-2 px-3 text-slate-700 dark:text-slate-300 font-medium">Project IDs</td>
                <td className="py-2 px-3 text-slate-500">Partner form</td>
                <td className="py-2 px-3 text-slate-500 font-mono">uuid-1, uuid-2</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── SLUGS ── */}
      <section>
        <h2 className="text-lg font-heading font-bold text-slate-900 dark:text-white mb-3">Slugs</h2>
        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">•</span>
            <span><strong className="text-slate-700 dark:text-slate-300">Auto-generated</strong> from project name on creation (e.g. "Puerto Princesa WTP" → <code className="text-xs px-1 py-0.5 rounded bg-slate-100 dark:bg-white/5 font-mono">puerto-princesa-wtp</code>)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">•</span>
            <span><strong className="text-slate-700 dark:text-slate-300">Override</strong> by typing — once edited, auto-generation stops for that field</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">•</span>
            <span><strong className="text-slate-700 dark:text-slate-300">Rules</strong>: lowercase, hyphens-only (no spaces or special characters)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">⚠</span>
            <span><strong className="text-amber-600 dark:text-amber-400">Warning</strong>: changing a slug on a published item breaks existing links to that page</span>
          </li>
        </ul>
      </section>

      {/* ── PUBLISHING ── */}
      <section>
        <h2 className="text-lg font-heading font-bold text-slate-900 dark:text-white mb-3">Publishing & Ordering</h2>
        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">•</span>
            <span><strong className="text-slate-700 dark:text-slate-300">Publish</strong> — visible on the live site immediately</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">•</span>
            <span><strong className="text-slate-700 dark:text-slate-300">Save as Draft</strong> — saves without making visible</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">•</span>
            <span><strong className="text-slate-700 dark:text-slate-300">Order</strong> — lower numbers appear first. Same order = alphabetical</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">•</span>
            <span><strong className="text-slate-700 dark:text-slate-300">News</strong> sorts by date (newest first) regardless of order</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">⚠</span>
            <span><strong className="text-amber-600 dark:text-amber-400">Deleting</strong> — removed items cannot be recovered. No trash bin.</span>
          </li>
        </ul>
      </section>

      {/* ── TROUBLESHOOTING ── */}
      <section>
        <h2 className="text-lg font-heading font-bold text-slate-900 dark:text-white mb-3">Troubleshooting</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10">
                <th className="text-left py-2 px-3 text-slate-500 font-medium">Symptom</th>
                <th className="text-left py-2 px-3 text-slate-500 font-medium">Likely Cause</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-white/5">
                <td className="py-2 px-3 text-slate-700 dark:text-slate-300">Item not showing on site</td>
                <td className="py-2 px-3 text-slate-500">Check Published toggle. Check Order value.</td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-white/5">
                <td className="py-2 px-3 text-slate-700 dark:text-slate-300">JSON field shows blank</td>
                <td className="py-2 px-3 text-slate-500">Syntax error. Paste into jsonlint.com.</td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-white/5">
                <td className="py-2 px-3 text-slate-700 dark:text-slate-300">Image not loading</td>
                <td className="py-2 px-3 text-slate-500">Broken URL or uses HTTP (needs HTTPS).</td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-white/5">
                <td className="py-2 px-3 text-slate-700 dark:text-slate-300">Page shows 404</td>
                <td className="py-2 px-3 text-slate-500">Slug was changed or URL is wrong.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function CodeBlock({ title, json }: { title: string; json: string }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.02] overflow-hidden">
      <div className="px-4 py-2 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">{title}</span>
        <button
          onClick={() => navigator.clipboard.writeText(json)}
          className="text-[11px] text-blue-500 hover:text-blue-600 hover:underline"
        >
          Copy
        </button>
      </div>
      <pre className="p-4 text-xs font-mono text-slate-800 dark:text-slate-200 overflow-x-auto leading-relaxed whitespace-pre">{json}</pre>
    </div>
  )
}
