# Security & Anti-Doxxing Implementation

## Overview
This document outlines the comprehensive security measures implemented to protect the website owner's identity and prevent doxxing attempts when hosting this application.

## Anti-Doxxing Measures

### 1. IP Address Protection
- **Header Sanitization**: All identifying headers (X-Forwarded-For, X-Real-IP, etc.) are stripped
- **IP Obfuscation**: Real IP addresses are replaced with anonymized versions in logs
- **Proxy Detection Prevention**: Headers that could reveal proxy usage are removed

### 2. Server Fingerprinting Protection
- **Server Header Spoofing**: Server identifies as "nginx" instead of revealing actual technology
- **Powered-By Headers**: All X-Powered-By headers are removed
- **Version Information**: No version numbers or technology stacks are exposed
- **Timing Randomization**: Response times are randomized to prevent timing analysis

### 3. Error Information Protection
- **Generic Error Messages**: All errors return generic messages to prevent information leakage
- **Status Code Obfuscation**: Most errors return 503 to prevent enumeration attacks
- **Stack Trace Hiding**: No technical details are exposed in error responses
- **Error ID Tracking**: Errors are tracked internally with random IDs for debugging

### 4. Request/Response Security
- **CORS Restriction**: Strict origin control prevents unauthorized cross-origin requests
- **Referrer Policy**: Set to "no-referrer" to prevent referrer information leakage
- **Content Security Policy**: Strict CSP in production prevents code injection
- **Frame Protection**: X-Frame-Options set to DENY prevents clickjacking

## Hosting Security Recommendations

### For Self-Hosting Protection:

1. **Use a VPN**: Always connect through a reputable VPN service before starting the server
2. **Reverse Proxy**: Use Nginx or Cloudflare as a reverse proxy to hide your real server
3. **Firewall Configuration**: Block all unnecessary ports and limit access
4. **Domain Privacy**: Use WHOIS privacy protection on any domains
5. **DNS Protection**: Use Cloudflare DNS or similar to hide your real IP
6. **SSL/TLS**: Always use HTTPS with certificates from Let's Encrypt or similar

### Environment Variables for Production:

Create a `.env` file with these settings:

```env
NODE_ENV=production
SESSION_SECRET=your-super-secure-random-secret-here
DATABASE_URL=your-secure-database-connection
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Network Security:

1. **Router Configuration**: Change default router passwords and disable WPS
2. **MAC Address Randomization**: Enable MAC address randomization on your devices
3. **Network Segmentation**: Host the server on a separate network segment
4. **VPN Kill Switch**: Ensure your VPN has a kill switch to prevent IP leaks

## Security Headers Implemented

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: no-referrer`
- `Permissions-Policy: geolocation=(), microphone=(), camera=()`
- `Strict-Transport-Security` (HTTPS only)

## Rate Limiting

- **Production**: 100 requests per 15 minutes per IP
- **Authentication**: 5 login attempts per 15 minutes per IP
- **File Uploads**: 10 uploads per minute per IP
- **Development**: Rate limiting disabled for localhost

## Input Validation

All user inputs are validated and sanitized:
- Username: Alphanumeric and underscores only
- Email: Valid email format required
- Passwords: Minimum security requirements
- Search queries: Length limits and sanitization
- File uploads: Type and size restrictions

## Additional Security Features

- **Session Security**: Secure cookies with httpOnly and sameSite flags
- **Password Hashing**: bcrypt with salt rounds for password storage
- **SQL Injection Prevention**: Parameterized queries and ORM usage
- **XSS Prevention**: Input sanitization and CSP headers
- **CSRF Protection**: SameSite cookies and origin validation

## Monitoring & Logging

- **Anonymous Logging**: Real IPs are not stored in logs
- **Error Tracking**: Errors are tracked with random IDs for debugging
- **Security Events**: Failed login attempts and suspicious activity logging
- **Rate Limit Violations**: Automated blocking of excessive requests

## Emergency Procedures

If you suspect a doxxing attempt:
1. Immediately stop the server
2. Check your VPN connection
3. Review recent logs for suspicious activity
4. Consider changing your IP address
5. Update all passwords and tokens
6. Monitor for any information leakage

## Regular Security Maintenance

- Update dependencies monthly
- Review logs weekly
- Test security headers quarterly
- Audit user permissions semi-annually
- Update VPN configurations as needed

## Contact Information

For security vulnerabilities or concerns, use secure communication channels only.
Never expose personal contact information in the codebase or documentation.