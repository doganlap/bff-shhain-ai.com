#!/bin/bash

# GRC Application Security Hardening Script
# Implements comprehensive security measures for production deployment

set -e

echo "🔒 Starting GRC Application Security Hardening..."

# Create security directories
mkdir -p /etc/grc-security/{policies,certificates,secrets}

# 1. System Security Hardening
harden_system() {
    echo "🛡️ Hardening system security..."
    
    # Update system packages
    apt-get update && apt-get upgrade -y
    
    # Install security tools
    apt-get install -y \
        fail2ban \
        ufw \
        rkhunter \
        chkrootkit \
        lynis \
        aide \
        auditd
    
    # Configure firewall
    ufw --force reset
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow 22/tcp    # SSH
    ufw allow 80/tcp    # HTTP
    ufw allow 443/tcp   # HTTPS
    ufw allow 9090/tcp  # Prometheus (restrict to monitoring network)
    ufw allow 3001/tcp  # Grafana (restrict to monitoring network)
    ufw --force enable
    
    echo "✅ System security hardened"
}

# 2. Docker Security Configuration
harden_docker() {
    echo "🐳 Hardening Docker security..."
    
    # Create Docker daemon configuration
    cat > /etc/docker/daemon.json << 'EOF'
{
    "log-driver": "json-file",
    "log-opts": {
        "max-size": "10m",
        "max-file": "3"
    },
    "live-restore": true,
    "userland-proxy": false,
    "no-new-privileges": true,
    "seccomp-profile": "/etc/docker/seccomp.json",
    "apparmor-profile": "docker-default"
}
EOF
    
    # Create Docker seccomp profile
    cat > /etc/docker/seccomp.json << 'EOF'
{
    "defaultAction": "SCMP_ACT_ERRNO",
    "architectures": ["SCMP_ARCH_X86_64", "SCMP_ARCH_X86", "SCMP_ARCH_X32"],
    "syscalls": [
        {
            "names": [
                "accept", "accept4", "access", "adjtimex", "alarm", "bind", "brk", "capget", "capset",
                "chdir", "chmod", "chown", "chroot", "clock_getres", "clock_gettime", "clock_nanosleep",
                "close", "connect", "copy_file_range", "creat", "dup", "dup2", "dup3", "epoll_create",
                "epoll_create1", "epoll_ctl", "epoll_pwait", "epoll_wait", "eventfd", "eventfd2",
                "execve", "execveat", "exit", "exit_group", "faccessat", "fadvise64", "fallocate",
                "fanotify_mark", "fchdir", "fchmod", "fchmodat", "fchown", "fchownat", "fcntl",
                "fdatasync", "fgetxattr", "flistxattr", "flock", "fork", "fremovexattr", "fsetxattr",
                "fstat", "fstatfs", "fsync", "ftruncate", "futex", "getcwd", "getdents", "getdents64",
                "getegid", "geteuid", "getgid", "getgroups", "getitimer", "getpeername", "getpgid",
                "getpgrp", "getpid", "getppid", "getpriority", "getrandom", "getresgid", "getresuid",
                "getrlimit", "getrusage", "getsid", "getsockname", "getsockopt", "gettid", "gettimeofday",
                "getuid", "getxattr", "inotify_add_watch", "inotify_init", "inotify_init1", "inotify_rm_watch",
                "io_cancel", "io_destroy", "io_getevents", "io_setup", "io_submit", "ioctl", "ioprio_get",
                "ioprio_set", "ipc", "kill", "lchown", "link", "linkat", "listen", "listxattr", "llistxattr",
                "lremovexattr", "lseek", "lsetxattr", "lstat", "madvise", "memfd_create", "mincore",
                "mkdir", "mkdirat", "mknod", "mknodat", "mlock", "mlock2", "mlockall", "mmap", "mmap2",
                "mprotect", "mq_getsetattr", "mq_notify", "mq_open", "mq_timedreceive", "mq_timedsend",
                "mq_unlink", "mremap", "msgctl", "msgget", "msgrcv", "msgsnd", "msync", "munlock",
                "munlockall", "munmap", "nanosleep", "newfstatat", "open", "openat", "pause", "pipe",
                "pipe2", "poll", "ppoll", "prctl", "pread64", "preadv", "prlimit64", "pselect6", "ptrace",
                "pwrite64", "pwritev", "read", "readahead", "readlink", "readlinkat", "readv", "recv",
                "recvfrom", "recvmmsg", "recvmsg", "remap_file_pages", "removexattr", "rename", "renameat",
                "renameat2", "restart_syscall", "rmdir", "rt_sigaction", "rt_sigpending", "rt_sigprocmask",
                "rt_sigqueueinfo", "rt_sigreturn", "rt_sigsuspend", "rt_sigtimedwait", "rt_tgsigqueueinfo",
                "sched_get_priority_max", "sched_get_priority_min", "sched_getaffinity", "sched_getattr",
                "sched_getparam", "sched_getscheduler", "sched_rr_get_interval", "sched_setaffinity",
                "sched_setattr", "sched_setparam", "sched_setscheduler", "sched_yield", "seccomp",
                "select", "semctl", "semget", "semop", "semtimedop", "send", "sendfile", "sendfile64",
                "sendmmsg", "sendmsg", "sendto", "setfsgid", "setfsuid", "setgid", "setgroups", "setitimer",
                "setpgid", "setpriority", "setregid", "setresgid", "setresuid", "setreuid", "setrlimit",
                "setsid", "setsockopt", "setuid", "setxattr", "shmat", "shmctl", "shmdt", "shmget",
                "shutdown", "sigaltstack", "signalfd", "signalfd4", "sigpending", "sigprocmask", "sigreturn",
                "socket", "socketcall", "socketpair", "splice", "stat", "statfs", "statx", "symlink",
                "symlinkat", "sync", "sync_file_range", "syncfs", "sysinfo", "tee", "tgkill", "time",
                "timer_create", "timer_delete", "timer_getoverrun", "timer_gettime", "timer_settime",
                "timerfd_create", "timerfd_gettime", "timerfd_settime", "times", "tkill", "truncate",
                "ugetrlimit", "umask", "uname", "unlink", "unlinkat", "utime", "utimensat", "utimes",
                "vfork", "vmsplice", "wait4", "waitid", "waitpid", "write", "writev"
            ],
            "action": "SCMP_ACT_ALLOW"
        }
    ]
}
EOF
    
    # Restart Docker daemon
    systemctl restart docker
    
    echo "✅ Docker security hardened"
}

# 3. Application Security Configuration
harden_application() {
    echo "🔐 Hardening application security..."
    
    # Create security policy for containers
    cat > /etc/grc-security/policies/container-security.yaml << 'EOF'
apiVersion: v1
kind: SecurityPolicy
metadata:
  name: grc-container-security
spec:
  runAsNonRoot: true
  runAsUser: 1000
  runAsGroup: 1000
  fsGroup: 1000
  seLinuxOptions:
    level: "s0:c123,c456"
  seccompProfile:
    type: Localhost
    localhostProfile: docker-default
  capabilities:
    drop:
      - ALL
    add:
      - NET_BIND_SERVICE
  allowPrivilegeEscalation: false
  readOnlyRootFilesystem: true
  volumes:
    - configMap
    - emptyDir
    - projected
    - secret
    - downwardAPI
    - persistentVolumeClaim
EOF
    
    # Create application security configuration
    cat > /etc/grc-security/app-security.conf << 'EOF'
# GRC Application Security Configuration

# Rate limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_SKIP_SUCCESSFUL=false

# Security headers
SECURITY_HEADERS_ENABLED=true
HSTS_MAX_AGE=31536000
CSP_ENABLED=true
XSS_PROTECTION_ENABLED=true
NOSNIFF_ENABLED=true
FRAME_OPTIONS=SAMEORIGIN

# Authentication
JWT_ALGORITHM=RS256
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
PASSWORD_MIN_LENGTH=12
PASSWORD_REQUIRE_SYMBOLS=true
PASSWORD_REQUIRE_NUMBERS=true
PASSWORD_REQUIRE_UPPERCASE=true
PASSWORD_REQUIRE_LOWERCASE=true

# Session security
SESSION_SECURE=true
SESSION_HTTP_ONLY=true
SESSION_SAME_SITE=strict
SESSION_MAX_AGE=3600

# Database security
DB_SSL_ENABLED=true
DB_SSL_REJECT_UNAUTHORIZED=true
DB_CONNECTION_LIMIT=20
DB_IDLE_TIMEOUT=30000
DB_QUERY_TIMEOUT=30000

# File upload security
UPLOAD_MAX_FILE_SIZE=10485760
UPLOAD_ALLOWED_TYPES=pdf,doc,docx,xls,xlsx,png,jpg,jpeg
UPLOAD_SCAN_ENABLED=true
UPLOAD_QUARANTINE_ENABLED=true

# Audit and logging
AUDIT_ENABLED=true
AUDIT_LOG_LEVEL=info
AUDIT_RETENTION_DAYS=90
LOG_SANITIZATION_ENABLED=true
LOG_IP_ANONYMIZATION=true
EOF
    
    echo "✅ Application security configured"
}

# 4. Network Security
harden_network() {
    echo "🌐 Hardening network security..."
    
    # Configure fail2ban for SSH protection
    cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3
backend = systemd

[sshd]
enabled = true
port = ssh
logpath = %(sshd_log)s
backend = %(sshd_backend)s

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
maxretry = 3

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
logpath = /var/log/nginx/error.log
maxretry = 10

[nginx-botsearch]
enabled = true
filter = nginx-botsearch
logpath = /var/log/nginx/access.log
maxretry = 2
EOF
    
    # Create custom fail2ban filters
    cat > /etc/fail2ban/filter.d/nginx-limit-req.conf << 'EOF'
[Definition]
failregex = limiting requests, excess: .* by zone .*, client: <HOST>
ignoreregex =
EOF
    
    cat > /etc/fail2ban/filter.d/nginx-botsearch.conf << 'EOF'
[Definition]
failregex = <HOST> .* "(GET|POST).*/(admin|wp-admin|phpmyadmin|xmlrpc\.php|wp-login\.php)" .*
ignoreregex =
EOF
    
    # Start fail2ban
    systemctl enable fail2ban
    systemctl start fail2ban
    
    echo "✅ Network security hardened"
}

# 5. Secrets Management
setup_secrets_management() {
    echo "🔑 Setting up secrets management..."
    
    # Install HashiCorp Vault (for production use)
    wget -O- https://apt.releases.hashicorp.com/gpg | gpg --dearmor | tee /usr/share/keyrings/hashicorp-archive-keyring.gpg
    echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | tee /etc/apt/sources.list.d/hashicorp.list
    apt-get update && apt-get install -y vault
    
    # Create Vault configuration
    cat > /etc/vault.d/vault.hcl << 'EOF'
ui = true
disable_mlock = true

storage "file" {
  path = "/opt/vault/data"
}

listener "tcp" {
  address     = "127.0.0.1:8200"
  tls_disable = "true"
}

api_addr = "http://127.0.0.1:8200"
cluster_addr = "https://127.0.0.1:8201"
EOF
    
    # Create vault directories
    mkdir -p /opt/vault/data
    chown -R vault:vault /opt/vault
    
    # Create secrets rotation script
    cat > /usr/local/bin/rotate-secrets.sh << 'EOF'
#!/bin/bash

# Rotate application secrets
VAULT_ADDR="http://127.0.0.1:8200"
VAULT_TOKEN=$(cat /etc/vault.d/root-token)

# Generate new JWT secret
NEW_JWT_SECRET=$(openssl rand -base64 64)
vault kv put secret/grc/jwt secret="$NEW_JWT_SECRET"

# Generate new database password
NEW_DB_PASSWORD=$(openssl rand -base64 32)
vault kv put secret/grc/database password="$NEW_DB_PASSWORD"

# Update application configuration
docker-compose restart grc-app

echo "Secrets rotated successfully at $(date)"
EOF
    
    chmod +x /usr/local/bin/rotate-secrets.sh
    
    # Schedule secret rotation (monthly)
    (crontab -l 2>/dev/null; echo "0 2 1 * * /usr/local/bin/rotate-secrets.sh") | crontab -
    
    echo "✅ Secrets management configured"
}

# 6. Compliance and Auditing
setup_compliance() {
    echo "📋 Setting up compliance and auditing..."
    
    # Configure auditd for security logging
    cat > /etc/audit/rules.d/grc-audit.rules << 'EOF'
# GRC Application Audit Rules

# Monitor file access
-w /app -p wa -k grc-file-access
-w /etc/grc-security -p wa -k grc-security-config
-w /var/log/grc -p wa -k grc-logs

# Monitor network connections
-a always,exit -F arch=b64 -S socket -F success=1 -k grc-network
-a always,exit -F arch=b64 -S connect -F success=1 -k grc-network

# Monitor privilege escalation
-w /bin/su -p x -k privilege-escalation
-w /usr/bin/sudo -p x -k privilege-escalation
-w /etc/sudoers -p wa -k privilege-escalation

# Monitor authentication
-w /var/log/auth.log -p wa -k authentication
-w /var/log/secure -p wa -k authentication

# Monitor Docker events
-w /var/lib/docker -p wa -k docker-events
-w /etc/docker -p wa -k docker-config
EOF
    
    # Restart auditd
    systemctl restart auditd
    
    # Create compliance monitoring script
    cat > /usr/local/bin/compliance-check.sh << 'EOF'
#!/bin/bash

# GRC Compliance Monitoring Script
REPORT_FILE="/var/log/grc/compliance-$(date +%Y%m%d).log"
mkdir -p /var/log/grc

echo "=== GRC Compliance Check - $(date) ===" >> $REPORT_FILE

# Check SSL certificate validity
if openssl x509 -in /app/ssl/certificate.crt -checkend 2592000 -noout; then
    echo "SSL Certificate: VALID (>30 days remaining)" >> $REPORT_FILE
else
    echo "SSL Certificate: WARNING (expires within 30 days)" >> $REPORT_FILE
fi

# Check security updates
UPDATES=$(apt list --upgradable 2>/dev/null | grep -i security | wc -l)
echo "Security Updates Available: $UPDATES" >> $REPORT_FILE

# Check failed login attempts
FAILED_LOGINS=$(grep "Failed password" /var/log/auth.log | wc -l)
echo "Failed Login Attempts (24h): $FAILED_LOGINS" >> $REPORT_FILE

# Check disk encryption
if cryptsetup status /dev/mapper/encrypted 2>/dev/null; then
    echo "Disk Encryption: ENABLED" >> $REPORT_FILE
else
    echo "Disk Encryption: DISABLED" >> $REPORT_FILE
fi

# Check firewall status
UFW_STATUS=$(ufw status | grep "Status: active" | wc -l)
if [ $UFW_STATUS -eq 1 ]; then
    echo "Firewall: ACTIVE" >> $REPORT_FILE
else
    echo "Firewall: INACTIVE" >> $REPORT_FILE
fi

echo "=== End Compliance Check ===" >> $REPORT_FILE
EOF
    
    chmod +x /usr/local/bin/compliance-check.sh
    
    # Schedule daily compliance checks
    (crontab -l 2>/dev/null; echo "0 6 * * * /usr/local/bin/compliance-check.sh") | crontab -
    
    echo "✅ Compliance monitoring configured"
}

# 7. Incident Response
setup_incident_response() {
    echo "🚨 Setting up incident response..."
    
    # Create incident response script
    cat > /usr/local/bin/incident-response.sh << 'EOF'
#!/bin/bash

# GRC Incident Response Script
INCIDENT_TYPE="$1"
SEVERITY="$2"
DESCRIPTION="$3"

INCIDENT_DIR="/var/log/grc/incidents"
mkdir -p $INCIDENT_DIR

INCIDENT_ID="INC-$(date +%Y%m%d%H%M%S)"
INCIDENT_FILE="$INCIDENT_DIR/$INCIDENT_ID.log"

# Log incident
cat > $INCIDENT_FILE << EOL
Incident ID: $INCIDENT_ID
Type: $INCIDENT_TYPE
Severity: $SEVERITY
Description: $DESCRIPTION
Timestamp: $(date)
Reporter: $(whoami)
System: $(hostname)

=== System State ===
$(docker ps --format "table {{.Names}}\t{{.Status}}")

=== Recent Logs ===
$(tail -50 /var/log/grc/app.log)

=== Network Connections ===
$(netstat -tuln)
EOL

# Automated response based on severity
case $SEVERITY in
    "critical")
        # Immediate containment
        echo "CRITICAL incident detected - initiating containment" >> $INCIDENT_FILE
        
        # Isolate affected containers
        docker network disconnect grc-network grc-app || true
        
        # Create memory dump
        docker exec grc-app cat /proc/meminfo >> $INCIDENT_FILE
        
        # Notify security team
        curl -X POST "$SECURITY_WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{\"incident_id\":\"$INCIDENT_ID\",\"severity\":\"$SEVERITY\",\"type\":\"$INCIDENT_TYPE\"}"
        ;;
    "high")
        # Enhanced monitoring
        echo "HIGH severity incident - enhanced monitoring activated" >> $INCIDENT_FILE
        ;;
    "medium"|"low")
        echo "$SEVERITY severity incident logged" >> $INCIDENT_FILE
        ;;
esac

echo "Incident $INCIDENT_ID logged to $INCIDENT_FILE"
EOF
    
    chmod +x /usr/local/bin/incident-response.sh
    
    echo "✅ Incident response configured"
}

# Main execution
main() {
    echo "🔒 GRC Application Security Hardening"
    echo "====================================="
    
    # Check if running as root
    if [ "$EUID" -ne 0 ]; then
        echo "❌ This script must be run as root"
        exit 1
    fi
    
    # Execute hardening steps
    harden_system
    harden_docker
    harden_application
    harden_network
    setup_secrets_management
    setup_compliance
    setup_incident_response
    
    echo ""
    echo "🎉 Security hardening completed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Review and customize security policies in /etc/grc-security/"
    echo "2. Initialize Vault: vault operator init"
    echo "3. Configure SSL certificates: ./ssl/generate-ssl.sh yourdomain.com production"
    echo "4. Test incident response: /usr/local/bin/incident-response.sh test low 'Test incident'"
    echo "5. Review compliance report: /usr/local/bin/compliance-check.sh"
    echo ""
    echo "⚠️  Remember to:"
    echo "- Change default passwords"
    echo "- Configure proper DNS and SSL certificates"
    echo "- Set up monitoring alerts"
    echo "- Train team on incident response procedures"
}

# Execute main function
main "$@"
