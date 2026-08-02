# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability within the Blueprin SDK, please send an email to [security@blueprin.id](mailto:security@blueprin.id). All security vulnerabilities will be promptly addressed.

**Please do not report security vulnerabilities through public GitHub issues.**

## Disclosure Policy

When the security team receives a security bug report, they will assign it to a primary handler. This person will coordinate the fix and release process, involving the following steps:

1. Confirm the problem and determine the affected versions.
2. Audit code to find any potential similar problems.
3. Prepare fixes for all releases still under maintenance. These fixes will be released as fast as possible.

## Security Update Notifications

Security updates will be announced via:

- **GitHub Security Advisories**: [github.com/qalvinahmad/blueprin-sdk/security/advisories](https://github.com/qalvinahmad/blueprin-sdk/security/advisories)
- **npm advisories**: Automatic notifications via `npm audit`
- **CHANGELOG.md**: All security fixes are documented in the changelog

## Security Best Practices for Plugin Developers

When building plugins with the Blueprin SDK:

### Input Validation

- Always validate and sanitize user input
- Use parameterized queries when interacting with databases
- Never trust data from external sources without validation

### Authentication & Authorization

- Use the SDK's `AuthClient` for authentication operations
- Implement proper authorization checks in your plugin's API calls
- Store tokens securely using the SDK's `StorageAdapter`

### Data Handling

- Never store sensitive data in plain text
- Use the SDK's encrypted storage options for sensitive data
- Implement proper data access controls in your plugins

### Network Security

- Always use HTTPS for API calls
- Validate SSL certificates
- Implement proper timeout and retry logic

## Dependency Security

This project uses automated dependency scanning via:

- **GitHub Dependabot**: Automated dependency updates and security alerts
- **npm audit**: Regular security audits of dependencies
- **CI/CD Security Scanning**: Automated vulnerability checks in GitHub Actions

## Verification

To verify the integrity of your installation:

```bash
npm audit
```

## Contact

For any security concerns, please contact:

- Email: [security@blueprin.id](mailto:security@blueprin.id)
- GitHub: [@qalvinahmad](https://github.com/qalvinahmad)

## Acknowledgments

We would like to thank all security researchers who responsibly disclose vulnerabilities to us. Your help in keeping the Blueprin SDK secure is greatly appreciated.
