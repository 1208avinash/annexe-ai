# ANNEXE AI V5
# Developer Guide
## Version 1.0
### Document ID: AF-10

---

# 1. Purpose

This guide explains how engineers extend, maintain, test, and contribute to ANNEXE AI while preserving the architecture defined during Architecture Freeze 1.0.

All contributors must follow this guide before implementing production changes.

---

# 2. Development Philosophy

ANNEXE AI follows an Architecture First methodology.

The implementation lifecycle is:

Idea

↓

Architecture

↓

Specification

↓

Public Contract

↓

Test Design

↓

Implementation

↓

Integration

↓

Documentation

↓

Release

No production feature begins with code.

---

# 3. Repository Structure

Recommended layout:

docs/

api/

frontend/

tests/

scripts/

config/

Every subsystem should remain modular and independently understandable.

---

# 4. Adding a New Worker

Before creating a worker:

- Define its responsibility.
- Identify its subsystem.
- Define its inputs.
- Define its outputs.
- Define consumed and produced contracts.

Implementation steps:

1. Create worker.
2. Register worker.
3. Register agent.
4. Register routing.
5. Add tests.
6. Add documentation.

---

# 5. Adding an Engineering Brain Module

Every new module must specify:

Purpose

Inputs

Outputs

Dependencies

Evidence Sources

Success Criteria

Testing Strategy

Documentation

---

# 6. Adding a Governance Policy

Every governance policy requires:

Policy ID

Purpose

Severity

Validation Logic

Required Actions

Audit Requirements

---

# 7. Public Contract Rules

All subsystem communication must use versioned contracts.

Breaking changes require a new major version.

Backward compatibility should be maintained whenever practical.

---

# 8. Testing Requirements

Every production change requires:

Unit Tests

Integration Tests

Regression Tests

Where applicable:

Contract Tests

Workflow Tests

Architecture Fitness Tests

---

# 9. Documentation Requirements

Every production module must include:

Purpose

Responsibilities

Inputs

Outputs

Dependencies

Examples

Failure Modes

Related Contracts

---

# 10. Git Workflow

Recommended workflow:

Create feature branch

Implement feature

Run tests

Update documentation

Commit with meaningful message

Open review

Merge after approval

---

# 11. Architecture Review Checklist

Before merging:

- Architecture aligned with AF-01
- Correct subsystem ownership
- Public contracts respected
- No circular dependencies
- Tests passing
- Documentation updated
- Governance requirements satisfied

---

# 12. Definition of Done

A feature is complete only when:

Architecture Approved

Specification Updated

Implementation Complete

Tests Passing

Documentation Updated

Governance Passed

Release Notes Updated

---

# 13. Contributor Principles

Contributors should:

Preserve architecture

Prefer reuse over duplication

Keep modules focused

Write explainable code

Document decisions

Respect subsystem boundaries

---

# 14. Future Evolution

Future contributors should:

Extend architecture before implementation.

Avoid introducing architectural drift.

Preserve versioned contracts.

Keep Engineering Brain independent from Software Factory.

Continuously improve Engineering Memory.

---

# 15. Success Criteria

The Developer Guide succeeds when new contributors can extend ANNEXE AI consistently while preserving architectural integrity, engineering quality, and long-term maintainability.

---

END OF DOCUMENT