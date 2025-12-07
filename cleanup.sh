#!/bin/bash

# Kong Deploy UI - Cleanup Script
# This script cleans up all resources created during deployment

set -e  # Exit on any error

echo "========================================="
echo "Kong Deploy UI - Cleanup Script"
echo "========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/var/www/kong-deploy"
DOMAIN="ec2-3-109-139-48.ap-south-1.compute.amazonaws.com"

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

# Confirmation prompt
echo ""
print_warning "This script will remove:"
echo "  - PM2 processes and logs"
echo "  - Docker containers and volumes"
echo "  - Application directory ($APP_DIR)"
echo "  - Nginx site configuration"
echo "  - SSL certificates (optional)"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    print_status "Cleanup cancelled."
    exit 0
fi

# Step 1: Stop and remove PM2 processes
print_status "Stopping PM2 processes..."
if command -v pm2 &> /dev/null; then
    pm2 delete kong-deploy-backend 2>/dev/null || print_warning "PM2 process not found or already stopped"
    pm2 save 2>/dev/null || true
    print_status "PM2 processes stopped"
else
    print_warning "PM2 not installed, skipping..."
fi

# Step 2: Stop and remove Docker containers
print_status "Stopping Docker containers..."
if command -v docker &> /dev/null; then
    cd $APP_DIR 2>/dev/null || true
    if [ -f "$APP_DIR/docker-compose.yml" ]; then
        # Detect docker compose command
        if docker compose version > /dev/null 2>&1; then
            DOCKER_COMPOSE_CMD="docker compose"
        elif docker-compose version > /dev/null 2>&1; then
            DOCKER_COMPOSE_CMD="docker-compose"
        else
            DOCKER_COMPOSE_CMD="docker compose"
        fi
        
        print_status "Stopping containers..."
        $DOCKER_COMPOSE_CMD down -v 2>/dev/null || print_warning "No containers to stop"
        
        # Remove volumes
        print_status "Removing volumes..."
        $DOCKER_COMPOSE_CMD down -v --remove-orphans 2>/dev/null || true
    else
        print_warning "docker-compose.yml not found"
    fi
    
    # Remove any orphaned containers
    print_status "Cleaning up orphaned containers..."
    docker ps -a --filter "name=kong-postgres" -q | xargs -r docker rm -f 2>/dev/null || true
else
    print_warning "Docker not installed, skipping..."
fi

# Step 3: Remove application directory
print_status "Removing application directory..."
if [ -d "$APP_DIR" ]; then
    rm -rf $APP_DIR
    print_status "Application directory removed: $APP_DIR"
else
    print_warning "Application directory not found: $APP_DIR"
fi

# Step 4: Remove Nginx site configuration
print_status "Removing Nginx configuration..."
if [ -f "/etc/nginx/sites-available/kong-deploy" ]; then
    rm -f /etc/nginx/sites-available/kong-deploy
    print_status "Removed nginx site configuration"
fi

if [ -L "/etc/nginx/sites-enabled/kong-deploy" ]; then
    rm -f /etc/nginx/sites-enabled/kong-deploy
    print_status "Removed nginx site symlink"
fi

# Test and reload nginx if it's running
if systemctl is-active --quiet nginx 2>/dev/null; then
    if nginx -t 2>/dev/null; then
        systemctl reload nginx 2>/dev/null || true
        print_status "Nginx configuration reloaded"
    fi
fi

# Step 5: Remove SSL certificates (optional)
echo ""
read -p "Do you want to remove SSL certificates? (yes/no): " remove_ssl

if [ "$remove_ssl" = "yes" ]; then
    print_status "Removing SSL certificates..."
    if [ -d "/etc/letsencrypt/live/$DOMAIN" ]; then
        certbot delete --cert-name $DOMAIN --non-interactive 2>/dev/null || true
        print_status "SSL certificates removed"
    else
        print_warning "SSL certificates not found"
    fi
else
    print_status "SSL certificates preserved"
fi

# Step 6: Remove PM2 log files
print_status "Cleaning up PM2 log files..."
if [ -d "/var/log/pm2" ]; then
    rm -f /var/log/pm2/kong-deploy-backend-*.log 2>/dev/null || true
    print_status "PM2 log files removed"
fi

# Step 7: Remove any remaining Docker volumes
print_status "Checking for remaining Docker volumes..."
if command -v docker &> /dev/null; then
    # Remove volumes with kong-deploy in the name
    docker volume ls -q | grep -i kong-deploy | xargs -r docker volume rm 2>/dev/null || true
    # Remove postgres_data volume if it exists
    docker volume rm kong-deploy_postgres_data 2>/dev/null || true
    print_status "Docker volumes cleaned up"
fi

# Step 8: Clean up any orphaned processes
print_status "Checking for orphaned Node.js processes..."
pkill -f "kong-deploy-backend" 2>/dev/null || print_warning "No orphaned processes found"

# Step 9: Remove firewall rules (optional)
echo ""
read -p "Do you want to remove firewall rules for ports 80 and 443? (yes/no): " remove_firewall

if [ "$remove_firewall" = "yes" ]; then
    if command -v ufw &> /dev/null; then
        print_status "Removing firewall rules..."
        ufw delete allow 80/tcp 2>/dev/null || true
        ufw delete allow 443/tcp 2>/dev/null || true
        print_status "Firewall rules removed"
    else
        print_warning "UFW not found, skipping firewall cleanup"
    fi
else
    print_status "Firewall rules preserved"
fi

# Summary
echo ""
print_status "========================================="
print_status "Cleanup completed!"
print_status "========================================="
echo ""
print_status "Removed resources:"
echo "  ✓ PM2 processes"
echo "  ✓ Docker containers and volumes"
echo "  ✓ Application directory"
echo "  ✓ Nginx site configuration"
if [ "$remove_ssl" = "yes" ]; then
    echo "  ✓ SSL certificates"
fi
if [ "$remove_firewall" = "yes" ]; then
    echo "  ✓ Firewall rules"
fi
echo ""
print_status "Note: System packages (Node.js, Docker, PM2, Nginx) were NOT removed."
print_status "To remove system packages, you'll need to do it manually."
echo ""

