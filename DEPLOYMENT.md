# EC2 Deployment Guide

This guide provides step-by-step instructions to deploy the Kong Deploy UI application on an EC2 instance with PostgreSQL, Nginx, and HTTPS support.

## Prerequisites

- EC2 instance running Ubuntu (20.04 or later recommended)
- EC2 instance with public DNS: `ec2-3-109-139-48.ap-south-1.compute.amazonaws.com`
- SSH access to the EC2 instance
- Security group configured to allow:
  - SSH (port 22)
  - HTTP (port 80)
  - HTTPS (port 443)

## Step 1: Connect to EC2 Instance

```bash
ssh -i your-key.pem ubuntu@ec2-3-109-139-48.ap-south-1.compute.amazonaws.com
```

Replace `your-key.pem` with your actual SSH key file.

## Step 2: Update System and Install Git

```bash
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get install -y git
```

## Step 3: Clone or Upload Your Code

### Option A: If your code is in a Git repository

```bash
cd /home/ubuntu
git clone https://github.com/vk-kong/UI.git UI
cd UI
```

### Option B: If you need to upload code manually

On your local machine, create a tarball:

```bash
# On your local machine
cd /Users/vk/Desktop
tar -czf UI.tar.gz UI/
scp -i your-key.pem UI.tar.gz ubuntu@ec2-3-109-139-48.ap-south-1.compute.amazonaws.com:/home/ubuntu/
```

Then on EC2:

```bash
cd /home/ubuntu
tar -xzf UI.tar.gz
cd UI
```

## Step 4: Run the Deployment Script

**Important:** Make sure you're in the project root directory (where `deploy.sh` is located) before running the script.

```bash
cd /home/ubuntu/UI
sudo chmod +x deploy.sh
sudo ./deploy.sh
```

The script will automatically detect its location and copy files from the project directory to `/var/www/kong-deploy`.

This script will:
- Install Node.js, Docker, Docker Compose, PM2, and Nginx
- Set up PostgreSQL in a Docker container
- Build the frontend application
- Configure the backend
- Set up Nginx as a reverse proxy
- Configure firewall rules

**Note:** The deployment script will take approximately 5-10 minutes to complete.

## Step 5: Set Up SSL Certificate

After the deployment script completes, set up HTTPS:

```bash
cd /home/ubuntu/UI
sudo chmod +x setup-ssl.sh
sudo ./setup-ssl.sh
```

**Important:** Before running the SSL setup, ensure:
1. Your EC2 security group allows inbound traffic on ports 80 and 443
2. The domain/DNS name is publicly accessible
3. Update the email in `setup-ssl.sh` if needed (line 10)

If SSL setup fails, you can manually obtain a certificate:

```bash
sudo certbot --nginx -d ec2-3-109-139-48.ap-south-1.compute.amazonaws.com
```

## Step 6: Verify Deployment

### Check Application Status

```bash
# Check PM2 (backend)
pm2 status

# Check Nginx
sudo systemctl status nginx

# Check PostgreSQL container
cd /var/www/kong-deploy
sudo docker-compose ps
```

### Test the Application

1. **HTTP (should redirect to HTTPS after SSL setup):**
   ```
   http://ec2-3-109-139-48.ap-south-1.compute.amazonaws.com
   ```

2. **HTTPS (after SSL setup):**
   ```
   https://ec2-3-109-139-48.ap-south-1.compute.amazonaws.com
   ```

3. **Health Check:**
   ```
   https://ec2-3-109-139-48.ap-south-1.compute.amazonaws.com/health
   ```

## Step 7: Configure Security Group (If Not Done)

If you haven't configured the security group yet, do the following:

1. Go to AWS EC2 Console
2. Select your instance
3. Click on "Security" tab
4. Click on the security group
5. Edit inbound rules and add:
   - Type: SSH, Port: 22, Source: Your IP
   - Type: HTTP, Port: 80, Source: 0.0.0.0/0
   - Type: HTTPS, Port: 443, Source: 0.0.0.0/0

## Troubleshooting

### Backend Not Starting

```bash
# Check PM2 logs
pm2 logs kong-deploy-backend

# Restart backend
pm2 restart kong-deploy-backend

# Check if port 3000 is in use
sudo netstat -tlnp | grep 3000
```

### Database Connection Issues

```bash
# Check PostgreSQL container
cd /var/www/kong-deploy
sudo docker-compose ps
sudo docker-compose logs postgres

# Restart PostgreSQL
sudo docker-compose restart postgres

# Test database connection
sudo docker-compose exec postgres psql -U kong -d kong -c "SELECT version();"
```

### Nginx Issues

```bash
# Check Nginx status
sudo systemctl status nginx

# Check Nginx configuration
sudo nginx -t

# View Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Test certificate renewal
sudo certbot renew --dry-run

# Manually renew certificate
sudo certbot renew
```

### Frontend Not Loading

```bash
# Check if frontend build exists
ls -la /var/www/kong-deploy/frontend/dist

# Rebuild frontend if needed
cd /var/www/kong-deploy/frontend
npm run build
```

## Manual Configuration (If Scripts Fail)

### Create Backend Environment File

```bash
sudo nano /var/www/kong-deploy/backend/.env.production
```

Add the following content:

```
NODE_ENV=production
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=kong
DB_USER=kong
DB_PASSWORD=Kong@123

JWT_SECRET=<generate-with-openssl-rand-base64-32>
JWT_EXPIRES_IN=7d

FRONTEND_URL=https://ec2-3-109-139-48.ap-south-1.compute.amazonaws.com
```

### Create Frontend Environment File

```bash
sudo nano /var/www/kong-deploy/frontend/.env.production
```

Add:

```
VITE_API_URL=https://ec2-3-109-139-48.ap-south-1.compute.amazonaws.com/api
```

## Useful Commands

### View Logs

```bash
# Backend logs (PM2)
pm2 logs kong-deploy-backend

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# PostgreSQL logs
cd /var/www/kong-deploy
sudo docker-compose logs -f postgres
```

### Restart Services

```bash
# Restart backend
pm2 restart kong-deploy-backend

# Restart Nginx
sudo systemctl restart nginx

# Restart PostgreSQL
cd /var/www/kong-deploy
sudo docker-compose restart postgres
```

### Update Application

```bash
# Pull latest code (if using git)
cd /var/www/kong-deploy
git pull

# Rebuild frontend
cd frontend
npm install
npm run build

# Restart backend
pm2 restart kong-deploy-backend

# Reload Nginx
sudo systemctl reload nginx
```

## Database Information

- **Host:** localhost (from EC2 perspective)
- **Port:** 5432
- **Database:** kong
- **Username:** kong
- **Password:** Kong@123

## Application Structure

```
/var/www/kong-deploy/
├── backend/          # Node.js backend
├── frontend/         # React frontend (built files in dist/)
├── docker-compose.yml
└── ecosystem.config.js
```

## Security Notes

1. **JWT Secret:** The deployment script generates a random JWT secret. For production, ensure it's strong and unique.
2. **Database Password:** The default password is `Kong@123`. Consider changing it for production.
3. **Firewall:** UFW is configured to allow only necessary ports (22, 80, 443).
4. **SSL:** Let's Encrypt certificates auto-renew. Monitor renewal status.

## Support

If you encounter issues:
1. Check the logs (see Troubleshooting section)
2. Verify all services are running
3. Check security group settings
4. Ensure DNS is properly configured

## Next Steps

After successful deployment:
1. Test the login functionality
2. Verify API endpoints are working
3. Monitor application logs
4. Set up monitoring and alerts (optional)
5. Configure backups for the database (optional)

