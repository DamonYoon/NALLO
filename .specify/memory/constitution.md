<!--
Sync Impact Report:
Version change: N/A → 1.0.0
Modified principles: N/A (initial creation)
Added sections:
  - Code Quality (Principle I)
  - Testing Standards (Principle II)
  - User Experience Consistency (Principle III)
  - Performance Requirements (Principle IV)
  - Development Workflow
  - Quality Gates
Removed sections: N/A
Templates requiring updates:
  - ✅ updated: .specify/templates/plan-template.md (Constitution Check section)
  - ✅ updated: .specify/templates/spec-template.md (Success Criteria alignment)
  - ✅ updated: .specify/templates/tasks-template.md (Testing standards alignment)
Follow-up TODOs: None
-->

# NALLO Constitution

## Core Principles

### I. Code Quality (NON-NEGOTIABLE)

All code MUST adhere to established quality standards before integration. Code quality is not negotiable and MUST be verified through automated tooling and peer review.

**Requirements:**
- All code MUST pass linting and formatting checks (zero warnings/errors)
- Code MUST follow project-specific style guides and conventions
- Functions MUST be single-purpose with clear, descriptive names
- Code complexity MUST be justified; cyclomatic complexity SHOULD remain below 15 per function
- All public APIs MUST have comprehensive documentation (docstrings, type hints, examples)
- Code MUST be self-documenting; comments explain "why", not "what"
- Dead code, unused imports, and commented-out code MUST be removed before merge
- Dependencies MUST be justified; avoid unnecessary external dependencies

**Rationale:** High code quality reduces technical debt, improves maintainability, and enables faster feature development. Automated quality gates prevent quality degradation over time.

### II. Testing Standards (NON-NEGOTIABLE)

Testing is mandatory for all features. Tests MUST be written, reviewed, and passing before code integration.

**Requirements:**
- Test-Driven Development (TDD) SHOULD be followed: write tests first, ensure they fail, then implement
- All user stories MUST have corresponding acceptance tests that verify independent functionality
- Unit tests MUST cover all business logic with minimum 80% code coverage
- Integration tests MUST verify contract compliance for all external-facing APIs
- Contract tests MUST be written for inter-service communication and shared schemas
- Tests MUST be independent, repeatable, and fast (< 1 second per test)
- Test failures MUST block merges; no test may be skipped without documented justification
- Test code MUST follow the same quality standards as production code
- Mocking SHOULD be used for external dependencies; avoid real external services in unit tests

**Rationale:** Comprehensive testing ensures reliability, prevents regressions, and enables confident refactoring. Independent testability allows parallel development and incremental delivery.

### III. User Experience Consistency

User-facing features MUST provide consistent, predictable experiences across all interfaces and interactions.

**Requirements:**
- UI/UX patterns MUST be consistent across all pages and features
- Error messages MUST be user-friendly, actionable, and consistent in tone
- Loading states, error states, and empty states MUST be handled consistently
- Navigation patterns MUST be predictable and follow established conventions
- Terminology MUST be consistent across all user-facing text (use Glossary/Concept system)
- Accessibility standards (WCAG 2.1 Level AA) MUST be met for all user interfaces
- Responsive design MUST work across target device sizes and browsers
- User feedback mechanisms (success/error notifications) MUST follow consistent patterns
- AI-generated content MUST maintain consistent tone and style per project settings

**Rationale:** Consistent UX reduces cognitive load, improves usability, and builds user trust. Inconsistent experiences lead to confusion and increased support burden.

### IV. Performance Requirements

System performance MUST meet defined performance targets. Performance is a feature, not an afterthought.

**Requirements:**
- API endpoints MUST respond within defined SLA targets (e.g., < 500ms for search, < 2s for page load)
- Database queries MUST be optimized; N+1 queries are prohibited
- Graph operations MUST complete within acceptable time limits (< 1s for 100 nodes)
- Frontend rendering MUST achieve target frame rates (60fps for interactive elements)
- Resource usage (memory, CPU) MUST be monitored and optimized
- Caching strategies MUST be implemented for frequently accessed data
- Lazy loading MUST be used for non-critical resources
- Performance budgets MUST be defined and enforced (bundle size, API response time)
- Performance regressions MUST be caught by automated performance tests
- AI operations MUST complete within acceptable time limits (< 5s for standard operations)

**Rationale:** Performance directly impacts user satisfaction and system scalability. Proactive performance management prevents costly rewrites and ensures system reliability under load.

## Development Workflow

All development MUST follow the established workflow to ensure quality and consistency.

**Requirements:**
- Feature development MUST start with specification (spec.md) and implementation plan (plan.md)
- Constitution compliance MUST be verified before Phase 0 research begins
- Code reviews MUST verify constitution compliance before approval
- All PRs MUST include tests, documentation updates, and performance considerations
- Breaking changes MUST be documented with migration guides
- Version control commits MUST follow conventional commit message format
- Feature branches MUST be kept up-to-date with main branch
- Documentation MUST be updated alongside code changes

**Rationale:** Structured workflows ensure consistency, reduce errors, and enable parallel development while maintaining quality standards.

## Quality Gates

Quality gates MUST be passed before code integration. These are non-negotiable checkpoints.

**Requirements:**
- **Linting/Formatting**: All code MUST pass automated linting (zero errors/warnings)
- **Tests**: All tests MUST pass; coverage thresholds MUST be met
- **Constitution Compliance**: All principles MUST be verified in code review
- **Performance**: Performance benchmarks MUST meet defined targets
- **Documentation**: All public APIs and user-facing features MUST have documentation
- **Security**: Security scans MUST pass; vulnerabilities MUST be addressed
- **UX Review**: User-facing changes MUST be reviewed for consistency and accessibility

**Rationale:** Quality gates prevent technical debt accumulation and ensure all code meets minimum standards before integration. Automated gates catch issues early when they are cheapest to fix.

## Governance

This constitution supersedes all other development practices and guidelines. All team members and contributors MUST comply with these principles.

**Amendment Procedure:**
- Constitution amendments MUST be documented with rationale
- Version MUST be incremented according to semantic versioning:
  - **MAJOR**: Backward incompatible principle removals or redefinitions
  - **MINOR**: New principle/section added or materially expanded guidance
  - **PATCH**: Clarifications, wording, typo fixes, non-semantic refinements
- Amendments MUST be reviewed and approved before adoption
- Migration plans MUST be provided for breaking changes

**Compliance:**
- All PRs and code reviews MUST verify constitution compliance
- Constitution violations MUST be addressed before merge
- Complexity additions MUST be justified in plan.md Complexity Tracking section
- Regular compliance reviews SHOULD be conducted to ensure adherence

**Version**: 1.0.0 | **Ratified**: 2025-12-07 | **Last Amended**: 2025-12-07
