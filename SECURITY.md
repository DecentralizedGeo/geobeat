# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in GEOBEAT, please email security@geobeat.xyz

Please do not file public issues for security vulnerabilities.

We will respond to security reports within 48 hours and work with you to understand and address the issue.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.x.x   | ✅                 |

## Data Privacy

GEOBEAT analyzes publicly available blockchain node data (IP addresses and geographic locations).

- All data sources are documented in `/data-sources/INVENTORY.md`
- IP addresses analyzed are already publicly visible on blockchain networks
- GeoIP lookups use third-party services (MaxMind GeoLite2)
- No personal data beyond publicly available node information is collected

## Security Best Practices

If you're deploying GEOBEAT:

- Never commit `.env` files with API keys
- Use environment variables for sensitive configuration
- Keep dependencies up to date (`npm audit`, `pip check`)
- Review data source licenses before use
- Follow responsible disclosure for any issues found
