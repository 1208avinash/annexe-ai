// ── ANNEXE AI — Product Vault Schema ─────────────────────────────────────────
//
// Defines the structure of every product in the ANNEXE Product Vault.
// Framework-independent — no database, no external dependencies.
//
// ─────────────────────────────────────────────────────────────────────────────


/**
 * createProduct
 *
 * Factory function for a Product Vault entry.
 *
 * @param {object} data - Seed values (all optional)
 * @returns {object}    - Complete product record
 */
export function createProduct(data = {}) {

  return {

    // ── Identity ──────────────────────────────────────────────────────────────

    productId:   data.productId   || "PROD-" + Date.now(),
    name:        data.name        || null,
    description: data.description || null,
    category:    data.category    || null,


    // ── Capability map ────────────────────────────────────────────────────────
    //
    // modules  — high-level functional areas (e.g. "authentication", "crm")
    // features — granular capabilities (e.g. "two-factor auth", "lead scoring")
    //
    // The product agent scores against both.

    modules:  data.modules  || [],
    features: data.features || [],


    // ── Technology stack ──────────────────────────────────────────────────────

    technology: {
      frontend:   data.technology?.frontend   || null,
      backend:    data.technology?.backend    || null,
      database:   data.technology?.database   || null,
      aiLayer:    data.technology?.aiLayer    || null,
      deployment: data.technology?.deployment || null
    },


    // ── Source ────────────────────────────────────────────────────────────────

    repository: data.repository || null,    // placeholder — no real repo yet
    version:    data.version    || "1.0.0",


    // ── Lifecycle ─────────────────────────────────────────────────────────────
    //
    // status values:
    //   "development" — being built
    //   "stable"      — internal use approved
    //   "production"  — deployed and client-proven

    status:    data.status    || "development",
    createdAt: data.createdAt || new Date().toISOString()

  };

}
