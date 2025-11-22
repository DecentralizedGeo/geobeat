# Geobeat Data Directory

This directory contains data sources, processing scripts, processed datasets, and the data source inventory for the Geobeat geographic decentralization index.

## Structure

### Data Source Inventory and Assessment
- **inventory/**: Machine-readable catalog of all blockchain node data sources
  - `sources.json` - Main inventory (machine-readable)
  - `sources.yaml` - Alternative YAML format (optional)
  - `schema.json` - JSON Schema for validation
- **assessments/**: Detailed quality assessments for each data source
  - `[source-id]/quality_report.md` - Full evaluation
  - `[source-id]/sample_data.json` - Example data
  - `[source-id]/integration_notes.md` - Technical notes
  - `comparison_matrix.md` - Cross-source comparison
- **templates/**: Templates for documenting new data sources
  - `source_template.json` - Blank source entry
  - `assessment_template.md` - Quality assessment guide

### Data Pipeline
- **raw/**: Original, unmodified data from sources
  - Keep raw data immutable
  - Document source and collection date
  - Include metadata files describing the data
- **processed/**: Cleaned and transformed datasets
  - Document processing steps
  - Include data validation results
  - Version processed datasets
- **scripts/**: Data collection and processing scripts
  - Document script purpose and usage
  - Include requirements/dependencies
  - Add error handling and logging

## Quick Start

### Adding a New Data Source
1. Copy `templates/source_template.json` to `inventory/sources/[source-id].json`
2. Fill in required fields (id, name, url, networks, type, signals, license)
3. Add to main `inventory/sources.json`
4. For high-priority sources, create `assessments/[source-id]/` directory
5. Complete quality assessment using `templates/assessment_template.md`

### Using the Inventory
See comprehensive best practices in `/research/DATA_SOURCE_BEST_PRACTICES.md`

Quick reference in `/research/QUICK_REFERENCE.md`

## Data Source Evaluation Process

### Phase 1: Initial Reconnaissance
Identify and document basic information about data sources

### Phase 2: Deep Evaluation
Access testing, quality assessment, license review for high-priority sources

### Phase 3: Comparative Analysis
Coverage matrices, overlap analysis, dependency mapping

### Phase 4: Selection and Integration
Final source selection, compliance documentation, pipeline implementation

See detailed workflow in `/research/DATA_SOURCE_BEST_PRACTICES.md`

## Guidelines

### General
- Never commit large binary files (use Git LFS if needed)
- Document data sources and licenses (create `/LICENSES.md`)
- Include data dictionaries for datasets
- Track data lineage and transformations
- Use consistent file naming conventions

### Data Source Documentation
- Mark unknown fields as "unknown" rather than guessing
- Document limitations and biases explicitly
- Always cite GeoIP provider and version
- Note assessment date and assessor
- Update regularly as sources evolve

### Quality Standards
- Cross-validate sources when possible
- Test API access before committing to a source
- Verify license compatibility with project goals
- Document integration complexity and effort
- Acknowledge all known biases (NAT, vantage point, etc.)

## Data Privacy

- Never commit sensitive or personal data
- Anonymize data when necessary
- Follow applicable data protection regulations
- For blockchain node data: IP addresses are public, but document limitations

## References

- **Comprehensive Guide**: `/research/DATA_SOURCE_BEST_PRACTICES.md` (60+ pages)
- **Quick Reference**: `/research/QUICK_REFERENCE.md` (condensed essentials)
- **Research Bibliography**: `/research/RESOURCES.md`

## Support

Questions about data source evaluation? See the best practices documentation or templates in this directory.
