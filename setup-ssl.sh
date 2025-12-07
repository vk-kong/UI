#!/bin/bash

# SSL Certificate Setup Script for Kong Deploy UI
# This script sets up Let's Encrypt SSL certificate using certbot

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="ec2-3-109-139-48.ap-south-1.compute.amazonaws.com"
EMAIL="admin@example.com"  # Change this to your email

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    print_error "Please run as root (use sudo)"
    exit 1
fi

print_status "========================================="
print_status "SSL Certificate Setup"
print_status "========================================="

# Step 1: Install Certbot
print_status "Installing Certbot..."
if ! command -v certbot &> /dev/null; then
    apt-get update -y
    apt-get install -y certbot python3-certbot-nginx
else
    print_warning "Certbot already installed"
fi

# Step 2: Ensure Nginx is running
print_status "Checking Nginx status..."
if ! systemctl is-active --quiet nginx; then
    print_status "Starting Nginx..."
    systemctl start nginx
fi

# Step 3: Ensure port 80 is open
print_status "Checking firewall..."
if command -v ufw &> /dev/null; then
    ufw allow 80/tcp
    ufw allow 443/tcp
fi

# Step 4: Request SSL certificate
print_status "Requesting SSL certificate for $DOMAIN..."
print_warning "Note: Let's Encrypt requires the domain to be publicly accessible"
print_warning "Make sure your EC2 security group allows inbound traffic on ports 80 and 443"

# Request certificate with nginx plugin
certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email $EMAIL --redirect || {
    print_error "Failed to obtain SSL certificate"
    print_warning "This might be because:"
    print_warning "1. The domain is not publicly accessible"
    print_warning "2. Port 80 is not open in security group"
    print_warning "3. DNS is not properly configured"
    print_warning ""
    print_warning "You can try manual certificate setup:"
    print_warning "  certbot certonly --standalone -d $DOMAIN"
    exit 1
}

# Step 5: Test certificate renewal
print_status "Testing certificate renewal..."
certbot renew --dry-run

# Step 6: Set up auto-renewal
print_status "Setting up automatic certificate renewal..."
# Certbot automatically sets up a systemd timer, but let's verify
systemctl enable certbot.timer
systemctl start certbot.timer

# Step 7: Update backend FRONTEND_URL to HTTPS
print_status "Updating backend configuration for HTTPS..."
if [ -f "/var/www/kong-deploy/backend/.env.production" ]; then
    sed -i "s|FRONTEND_URL=http://|FRONTEND_URL=https://|g" /var/www/kong-deploy/backend/.env.production
    sed -i "s|FRONTEND_URL=.*|FRONTEND_URL=https://$DOMAIN|g" /var/www/kong-deploy/backend/.env.production
    print_status "Restarting backend..."
    pm2 restart kong-deploy-backend || print_warning "PM2 restart failed, may need manual restart"
fi

# Step 8: Reload Nginx
print_status "Reloading Nginx with SSL configuration..."
nginx -t && systemctl reload nginx

print_status "========================================="
print_status "SSL Certificate Setup Complete!"
print_status "========================================="
echo ""
print_status "Your application is now available at:"
echo "  HTTPS: https://$DOMAIN"
echo ""
print_status "Certificate will auto-renew before expiration"
print_status "To check renewal status: systemctl status certbot.timer"

