# Data

This directory contains data sources, processing scripts, and processed datasets.

## Structure

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

## Guidelines

- Never commit large binary files (use Git LFS if needed)
- Document data sources and licenses
- Include data dictionaries for datasets
- Track data lineage and transformations
- Use consistent file naming conventions

## Data Privacy

- Never commit sensitive or personal data
- Anonymize data when necessary
- Follow applicable data protection regulations
