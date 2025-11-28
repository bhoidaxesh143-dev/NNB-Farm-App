# Hostinger Quick Start Guide

## 🚀 Automated Setup (Recommended)

The easiest way to deploy on Hostinger Cloud Starter:

### Step 1: Access Your VPS

```bash
# SSH into your Hostinger VPS
ssh root@your-vps-ip
```

### Step 2: Run Automated Setup

```bash
# Download and run the setup script
curl -O https://raw.githubusercontent.com/yourusername/mern-app/main/scripts/setup-hostinger.sh
chmod +x setup-hostinger.sh
sudo bash setup-hostinger.sh
```

The script will ask for:
- Application username (default: mernapp)
- Your domain name
- Email for SSL certificate
- Git repository URL

### Step 3: Done! 🎉

Your application will be:
- ✅ Fully installed and configured
- ✅ Running with PM2
- ✅ Accessible at https://yourdomain.com
- ✅ Secured with SSL certificate
- ✅ Protected by firewall

**Important:** Save the credentials file:
```bash
cat /var/www/mern-app/.credentials
```

---

## 📖 Manual Setup

If you prefer manual setup or need more control, follow the detailed guide:

👉 **[Full Hostinger Deployment Guide](./HOSTINGER_DEPLOYMENT.md)**

---

## 🔧 Quick Commands

After deployment, use these commands:

```bash
# Switch to application user
su - mernapp

# Check application status
pm2 status

# View logs
pm2 logs mern-server

# Restart application
pm2 restart mern-server

# Deploy updates
cd /var/www/mern-app && ./scripts/deploy.sh

# Backup database
cd /var/www/mern-app && ./scripts/backup.sh

# Health check
curl https://yourdomain.com/api/v1/health
```

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] Hostinger Cloud Starter VPS (or higher)
- [ ] Domain name configured in Hostinger DNS
- [ ] SSH access to your VPS
- [ ] Git repository with your code
- [ ] Updated domain name in all configs

---

## 🆘 Need Help?

- **Full Guide:** [HOSTINGER_DEPLOYMENT.md](./HOSTINGER_DEPLOYMENT.md)
- **Architecture:** [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Security:** [SECURITY.md](./SECURITY.md)
- **General Deployment:** [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 💰 Cost

**Hostinger Cloud Starter:** ~$15-25/month
- Includes: VPS, MongoDB, Redis, SSL (all self-hosted)
- No additional cloud service costs!

---

## 🎯 What the Setup Script Does

1. ✅ Updates system packages
2. ✅ Creates application user
3. ✅ Configures firewall (UFW)
4. ✅ Installs Node.js 18
5. ✅ Installs MongoDB 7
6. ✅ Installs Redis
7. ✅ Installs Nginx
8. ✅ Installs PM2
9. ✅ Clones your repository
10. ✅ Generates secure passwords & JWT secrets
11. ✅ Configures MongoDB with authentication
12. ✅ Configures Redis with password
13. ✅ Sets up environment variables
14. ✅ Installs application dependencies
15. ✅ Builds client application
16. ✅ Starts server with PM2
17. ✅ Configures Nginx reverse proxy
18. ✅ Installs SSL certificate (Let's Encrypt)
19. ✅ Configures auto-renewal

**Total setup time:** ~15-20 minutes

---

## 🔐 Security Features

The setup includes:
- ✅ Firewall configured (only SSH, HTTP, HTTPS)
- ✅ Non-root user for application
- ✅ MongoDB authentication enabled
- ✅ Redis password protection
- ✅ Strong JWT secrets generated
- ✅ SSL/HTTPS enabled
- ✅ Nginx security headers
- ✅ Rate limiting configured

---

## 📊 After Deployment

Visit your application:
- **Frontend:** https://yourdomain.com
- **API Health:** https://yourdomain.com/api/v1/health
- **Register:** https://yourdomain.com/register

Create your first user and start using the application!

---

**Ready to deploy? Run the automated setup script! 🚀**

