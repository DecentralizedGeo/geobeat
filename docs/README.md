# GEOBEAT Documentation

This directory contains comprehensive documentation for the GEOBEAT Geographic Decentralization Index.

## Core Documentation

### [PROPOSED_METHODOLOGY.md](PROPOSED_METHODOLOGY.md)
**The academic ideal**: Rigorous, peer-reviewed methodology for v1.0

Comprehensive documentation of the proposed Geographic Decentralization Index calculation methodology, including:
- Physical Distribution Index (PDI) with Moran's I, ENL, and Spatial HHI
- Jurisdictional Diversity Index (JDI) with country and organization diversity
- Infrastructure Heterogeneity Index (IHI) with cloud provider concentration
- Academic foundations and references
- Future enhancements

**Use this when**: Writing grant proposals, academic papers, or explaining the ideal methodology to technical stakeholders.

### [DEMO_IMPLEMENTATION.md](DEMO_IMPLEMENTATION.md)
**What we actually built**: Pragmatic demo implementation with trade-offs explained

Documentation of the current production implementation (`gdi_standalone.py`), including:
- Actual formulas used in the dashboard
- Trade-offs and compromises made for the demo
- Known issues and limitations
- Comparison with proposed methodology
- Roadmap to v1.0

**Use this when**: Understanding the current dashboard, debugging calculations, or explaining why demo scores differ from theoretical expectations.

### [DASHBOARD_UI_BEST_PRACTICES.md](DASHBOARD_UI_BEST_PRACTICES.md)
**UI/UX guidelines**: Design principles and best practices for the dashboard

Guidelines for building and maintaining the GEOBEAT dashboard interface.

**Use this when**: Working on frontend features, improving visualizations, or designing new UI components.

## Document Status

| Document | Status | Purpose | Audience |
|----------|--------|---------|----------|
| **PROPOSED_METHODOLOGY.md** | ✅ Stable | Academic/rigorous approach | Researchers, grant reviewers, technical stakeholders |
| **DEMO_IMPLEMENTATION.md** | ✅ Stable | Current production system | Developers, users, debugging |
| **DASHBOARD_UI_BEST_PRACTICES.md** | 📝 Reference | UI/UX guidelines | Frontend developers, designers |

## Quick Navigation

- **For grant proposals**: Start with [PROPOSED_METHODOLOGY.md](PROPOSED_METHODOLOGY.md)
- **For understanding dashboard scores**: Read [DEMO_IMPLEMENTATION.md](DEMO_IMPLEMENTATION.md)
- **For contributing to analysis code**: See `/src/analysis/README.md`
- **For system architecture**: See `/ARCHITECTURE.md` at repository root
- **For frontend development**: See [DASHBOARD_UI_BEST_PRACTICES.md](DASHBOARD_UI_BEST_PRACTICES.md)

## Related Documentation

- `/src/analysis/README.md` - Python implementation details and GDI calculation scripts
- `/ARCHITECTURE.md` - Overall system architecture and technology stack
- `/README.md` - Project overview and setup instructions
- `/CONTRIBUTING.md` - Contribution guidelines

## Versioning

- **v0 (Demo)**: Current production implementation with pragmatic compromises
- **v1.0 (Proposed)**: Rigorous academic methodology (target: Q2 2025)
- **v2.0 (Future)**: Advanced features like time-series, scenario analysis, ML

## Contributing to Documentation

When updating methodology documentation:

1. **Proposed methodology changes**: Update [PROPOSED_METHODOLOGY.md](PROPOSED_METHODOLOGY.md)
   - Maintain academic rigor and citations
   - Explain rationale for changes
   - Keep formula specifications precise

2. **Implementation changes**: Update [DEMO_IMPLEMENTATION.md](DEMO_IMPLEMENTATION.md)
   - Document actual code behavior
   - Explain trade-offs honestly
   - Update real network scores if formulas change
   - Keep synchronized with `gdi_standalone.py`

3. **UI changes**: Update [DASHBOARD_UI_BEST_PRACTICES.md](DASHBOARD_UI_BEST_PRACTICES.md)
   - Add screenshots for visual guidelines
   - Explain design decisions
   - Maintain consistency with existing patterns

## Changelog

- **2025-11-27**: Reorganized documentation structure
  - Created PROPOSED_METHODOLOGY.md (clean academic version)
  - Created DEMO_IMPLEMENTATION.md (honest implementation details)
  - Removed redundant files (GDI_V0_FINAL.md, GDI_V0_SIMPLE.md, etc.)
  - Removed nested Docusaurus structure (docs/docs/)

- **2025-11-23**: Added methodology review documents
- **2025-11-22**: Initial documentation structure

---

For questions or feedback, open a GitHub issue or discussion.
