# Secure Deployment Guide for Anti-Doxxing Protection

## Critical Security Setup for Self-Hosting

### Pre-Deployment Checklist

1. **VPN Configuration (MANDATORY)**
   ```bash
   # Verify VPN is active before starting
   curl ifconfig.me  # Should show VPN IP, not your real IP
   ```

2. **Firewall Configuration**
   ```bash
   # Ubuntu/Debian
   sudo ufw enable
   sudo ufw default deny incoming
   sudo ufw default allow outgoing
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw deny 22/tcp  # Block SSH from external
   ```

3. **Environment Variables Setup**
   Create `.env` file:
   ```env
   NODE_ENV=production
   SESSION_SECRET=your-cryptographically-secure-random-secret-256-bits
   DATABASE_URL=your-secure-database-connection
   ALLOWED_ORIGINS=https://yourdomain.com
   PORT=5000
   ```

### Reverse Proxy Configuration (Nginx)

Install and configure Nginx as a reverse proxy to hide your Node.js server:

```nginx
# /etc/nginx/sites-available/ratemykol
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Hide server information
    server_tokens off;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy no-referrer;
    add_header Content-Security-Policy "default-src 'self'";
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;
    
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Hide upstream server info
        proxy_hide_header X-Powered-By;
        proxy_hide_header Server;
        
        # Apply rate limiting
        limit_req zone=api burst=20 nodelay;
    }
    
    location /api/auth {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Strict rate limiting for auth
        limit_req zone=login burst=5 nodelay;
    }
}
```

### SSL/TLS Configuration

Use Let's Encrypt for free SSL certificates:

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Process Management (PM2)

Install and configure PM2 for production:

```bash
# Install PM2
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'ratemykol',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    log_date_format: 'YYYY-MM-DD HH:mm Z'
  }]
};
EOF

# Start application
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### Network Security Measures

1. **Router Configuration**
   - Change default admin password
   - Disable WPS
   - Enable WPA3 encryption
   - Disable remote management
   - Change default DNS to Cloudflare (1.1.1.1)

2. **MAC Address Randomization**
   ```bash
   # Enable on Linux
   sudo systemctl enable systemd-networkd
   
   # Edit network config
   sudo nano /etc/systemd/network/wlan0.network
   # Add: MACAddressPolicy=random
   ```

3. **DNS Protection**
   - Use Cloudflare DNS (1.1.1.1, 1.0.0.1)
   - Enable DNS over HTTPS
   - Use Cloudflare proxy if using their DNS

### Monitoring and Alerting

Create monitoring script for security events:

```bash
#!/bin/bash
# /opt/security-monitor.sh

LOG_FILE="/var/log/ratemykol-security.log"
WEBHOOK_URL="your-secure-webhook-url"

# Monitor for honeypot triggers
tail -f /path/to/app/logs/combined.log | grep "Honeypot triggered" | while read line; do
    echo "$(date): SECURITY ALERT - $line" >> $LOG_FILE
    
    # Send alert (replace with your preferred method)
    curl -X POST "$WEBHOOK_URL" \
         -H "Content-Type: application/json" \
         -d "{\"text\":\"🚨 Security Alert: Honeypot triggered - $line\"}"
done &

# Monitor for failed authentication attempts
tail -f /path/to/app/logs/combined.log | grep "authentication attempts" | while read line; do
    echo "$(date): AUTH ALERT - $line" >> $LOG_FILE
done &
```

### Backup Security

Ensure backups don't expose sensitive information:

```bash
#!/bin/bash
# /opt/secure-backup.sh

# Encrypt database backup
pg_dump $DATABASE_URL | gpg --cipher-algo AES256 --compress-algo 1 \
    --symmetric --output /backups/db_$(date +%Y%m%d).sql.gpg

# Backup application files (excluding sensitive data)
tar -czf /backups/app_$(date +%Y%m%d).tar.gz \
    --exclude='.env' \
    --exclude='node_modules' \
    --exclude='logs' \
    --exclude='.git' \
    /path/to/app/

# Upload to secure cloud storage with encryption
# (implement based on your preferred provider)
```

### Emergency Procedures

Create kill switches for immediate shutdown:

```bash
#!/bin/bash
# /opt/emergency-shutdown.sh

echo "EMERGENCY SHUTDOWN INITIATED"

# Stop application
pm2 stop all

# Stop nginx
sudo systemctl stop nginx

# Flush iptables (blocks all traffic)
sudo iptables -F
sudo iptables -P INPUT DROP
sudo iptables -P FORWARD DROP
sudo iptables -P OUTPUT DROP

# Clear logs that might contain sensitive data
> /var/log/nginx/access.log
> /var/log/nginx/error.log
> /path/to/app/logs/combined.log

echo "SYSTEM SECURED - All services stopped and traffic blocked"
```

### Regular Security Maintenance

1. **Weekly Tasks**
   - Review security logs
   - Check for failed authentication attempts
   - Verify VPN connection integrity
   - Update dependencies

2. **Monthly Tasks**
   - Rotate session secrets
   - Update SSL certificates
   - Review firewall rules
   - Test emergency procedures

3. **Quarterly Tasks**
   - Full security audit
   - Penetration testing
   - Update security configurations
   - Review and update documentation

### Additional Protection Layers

1. **Cloudflare Integration**
   - Use Cloudflare as CDN/proxy
   - Enable DDoS protection
   - Use Cloudflare's security features
   - Hide real server IP behind Cloudflare

2. **VPS/Cloud Hosting Recommendations**
   - Use providers that accept cryptocurrency
   - Choose providers outside your country
   - Use privacy-focused hosting services
   - Enable all available security features

3. **Domain Privacy**
   - Use WHOIS privacy protection
   - Register domain with privacy-focused registrars
   - Use separate email for domain registration
   - Consider using domain through a proxy service

### Testing Security Implementation

Before going live, test all security measures:

```bash
# Test honeypots
curl http://yourdomain.com/admin
curl http://yourdomain.com/.env
curl http://yourdomain.com/wp-admin

# Test rate limiting
for i in {1..20}; do curl http://yourdomain.com/api/traders; done

# Test security headers
curl -I http://yourdomain.com

# Test with security scanner (from external IP)
nmap -sV yourdomain.com
nikto -h http://yourdomain.com
```

### Legal and Operational Security

1. **Communication Security**
   - Use Signal or similar for sensitive communications
   - Never use personal email for project-related communication
   - Use Tor browser for sensitive research

2. **Financial Privacy**
   - Use cryptocurrency for hosting payments when possible
   - Separate financial accounts for project expenses
   - Use privacy-focused payment methods

3. **Documentation Security**
   - Keep security documentation encrypted
   - Use separate devices for security management
   - Regular security document updates

Remember: Security is an ongoing process, not a one-time setup. Regularly review and update all security measures.