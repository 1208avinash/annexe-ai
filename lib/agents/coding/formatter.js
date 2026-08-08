// ── ANNEXE AI — Code Formatter ────────────────────────────────────────────────
//
// Basic normalisation utilities for code proposals.
// Does NOT perform language-aware formatting (that is an LLM/Prettier concern).
//
// ─────────────────────────────────────────────────────────────────────────────


// ── Required file-level fields ────────────────────────────────────────────────

const FILE_DEFAULTS = {
  action:   "CREATE",
  path:     "",
  language: "javascript",
  content:  "",
  reason:   ""
};


// ── formatCode ────────────────────────────────────────────────────────────────

/**
 * Basic normalisation of a raw code string.
 *
 * - Ensures the value is a string.
 * - Removes trailing whitespace from each line.
 * - Guarantees a single trailing newline.
 *
 * @param {*}      content
 * @param {string} language  — reserved for future language-specific handling
 * @returns {string}
 */
export function formatCode(content, language = "javascript") {

  if (content === null || content === undefined) {
    return "";
  }

  const str = String(content);

  // Strip trailing whitespace per line
  const trimmed = str
    .split("\n")
    .map(line => line.trimEnd())
    .join("\n");

  // Ensure exactly one trailing newline
  return trimmed.endsWith("\n") ? trimmed : trimmed + "\n";

}


// ── normalizeProposal ─────────────────────────────────────────────────────────

/**
 * Ensures a proposal object has the expected shape:
 *   - files  {array}  — each entry has all required fields
 *   - tests  {array}  — each entry has all required fields
 *
 * Missing fields are filled with safe defaults; extra fields are preserved.
 *
 * @param {object} proposal
 * @returns {object} normalised proposal
 */
export function normalizeProposal(proposal) {

  if (!proposal || typeof proposal !== "object") {
    return { files: [], tests: [] };
  }

  const normalizeFileEntry = entry => {
    if (!entry || typeof entry !== "object") return { ...FILE_DEFAULTS };

    return {
      ...FILE_DEFAULTS,
      ...entry,
      // Normalise content for every file entry
      content: formatCode(entry.content, entry.language)
    };
  };

  const files = Array.isArray(proposal.files)
    ? proposal.files.map(normalizeFileEntry)
    : [];

  const tests = Array.isArray(proposal.tests)
    ? proposal.tests.map(normalizeFileEntry)
    : [];

  return {
    ...proposal,
    files,
    tests
  };

}
