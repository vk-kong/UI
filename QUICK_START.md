# Quick Start Deployment Guide

## Copy-Paste Deployment Steps

### 1. Connect to EC2 Instance

```bash
ssh -i your-key.pem ubuntu@ec2-3-109-139-48.ap-south-1.compute.amazonaws.com
```

### 2. Update System and Install Git

```bash
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get install -y git
```

### 3. Clone or Upload Code

**Option A - Git:**
```bash
cd /tmp
git clone <your-repository-url> UI
cd UI
```

**Option B - Manual Upload:**
On your local machine:
```bash
cd /Users/vk/Desktop
tar -czf UI.tar.gz UI/
scp -i your-key.pem UI.tar.gz ubuntu@ec2-3-109-139-48.ap-south-1.compute.amazonaws.com:/tmp/
```

On EC2:
```bash
cd /tmp
tar -xzf UI.tar.gz
cd UI
```

### 4. Run Deployment Script

```bash
sudo chmod +x deploy.sh
sudo ./deploy.sh
```

### 5. Set Up SSL Certificate

```bash
sudo chmod +x setup-ssl.sh
sudo ./setup-ssl.sh
```

**Note:** Update the email in `setup-ssl.sh` (line 10) before running if needed.

### 6. Verify Deployment

```bash
# Check services
pm2 status
sudo systemctl status nginx
cd /var/www/kong-deploy && sudo docker-compose ps

# Test application
curl http://ec2-3-109-139-48.ap-south-1.compute.amazonaws.com/health
```

### 7. Access Application

- **HTTP:** http://ec2-3-109-139-48.ap-south-1.compute.amazonaws.com
- **HTTPS:** https://ec2-3-109-139-48.ap-south-1.compute.amazonaws.com (after SSL setup)

## Important Notes

1. **Security Group:** Ensure EC2 security group allows:
   - SSH (port 22)
   - HTTP (port 80)
   - HTTPS (port 443)

2. **Database Credentials:**
   - Database: `kong`
   - User: `kong`
   - Password: `Kong@123`

3. **Application Location:** `/var/www/kong-deploy`

4. **Logs:**
   - Backend: `pm2 logs kong-deploy-backend`
   - Nginx: `sudo tail -f /var/log/nginx/error.log`
   - Database: `cd /var/www/kong-deploy && sudo docker-compose logs postgres`

For detailed troubleshooting, see [DEPLOYMENT.md](DEPLOYMENT.md).

