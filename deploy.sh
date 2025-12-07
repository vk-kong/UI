#!/bin/bash

# Kong Deploy UI - EC2 Deployment Script
# This script sets up the entire application on an EC2 instance

set -e  # Exit on any error

echo "========================================="
echo "Kong Deploy UI - EC2 Deployment"
echo "========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/var/www/kong-deploy"
DOMAIN="ec2-3-109-139-48.ap-south-1.compute.amazonaws.com"

# Detect docker compose command (V2 uses 'docker compose', V1 uses 'docker-compose')
if docker compose version > /dev/null 2>&1; then
    DOCKER_COMPOSE_CMD="docker compose"
elif docker-compose version > /dev/null 2>&1; then
    DOCKER_COMPOSE_CMD="docker-compose"
else
    DOCKER_COMPOSE_CMD="docker compose"  # Default to V2 syntax
fi

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

# Step 1: Update system
print_status "Updating system packages..."
apt-get update -y
apt-get upgrade -y

# Step 2: Install Node.js (v20.x)
print_status "Installing Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
else
    print_warning "Node.js already installed: $(node --version)"
fi

# Step 3: Install Docker and Docker Compose
print_status "Installing Docker and Docker Compose..."
if ! command -v docker &> /dev/null; then
    # Install Docker
    apt-get install -y ca-certificates curl gnupg lsb-release
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    systemctl enable docker
    systemctl start docker
else
    print_warning "Docker already installed: $(docker --version)"
fi

# Step 4: Install PM2 globally
print_status "Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
else
    print_warning "PM2 already installed: $(pm2 --version)"
fi

# Step 5: Install Nginx
print_status "Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    apt-get install -y nginx
    systemctl enable nginx
else
    print_warning "Nginx already installed"
fi

# Step 6: Create application directory
print_status "Creating application directory..."
mkdir -p $APP_DIR
mkdir -p /var/log/pm2
mkdir -p /var/www/html

# Step 7: Copy application files (assuming we're running from the project root)
print_status "Copying application files..."

# Get the script directory (project root)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Find backend directory (case-insensitive)
BACKEND_DIR=""
if [ -d "$SCRIPT_DIR/backend" ]; then
    BACKEND_DIR="$SCRIPT_DIR/backend"
elif [ -d "$SCRIPT_DIR/Backend" ]; then
    BACKEND_DIR="$SCRIPT_DIR/Backend"
else
    print_error "Backend directory not found (checked: backend, Backend)"
    print_error "Please make sure you're running this script from the project root directory"
    exit 1
fi

# Find frontend directory (case-insensitive)
FRONTEND_DIR=""
if [ -d "$SCRIPT_DIR/frontend" ]; then
    FRONTEND_DIR="$SCRIPT_DIR/frontend"
elif [ -d "$SCRIPT_DIR/Frontend" ]; then
    FRONTEND_DIR="$SCRIPT_DIR/Frontend"
else
    print_error "Frontend directory not found (checked: frontend, Frontend)"
    print_error "Please make sure you're running this script from the project root directory"
    exit 1
fi

if [ ! -f "$SCRIPT_DIR/docker-compose.yml" ]; then
    print_error "docker-compose.yml not found at $SCRIPT_DIR/docker-compose.yml"
    print_error "Please make sure you're running this script from the project root directory"
    exit 1
fi

print_status "Source directory: $SCRIPT_DIR"
print_status "Backend directory: $BACKEND_DIR"
print_status "Frontend directory: $FRONTEND_DIR"
print_status "Target directory: $APP_DIR"

if [ -d "$APP_DIR/backend" ]; then
    print_warning "Application directory already exists. Updating files..."
fi

# Copy all files to app directory (always use lowercase for target)
cp -r "$BACKEND_DIR" $APP_DIR/backend
cp -r "$FRONTEND_DIR" $APP_DIR/frontend
cp $SCRIPT_DIR/docker-compose.yml $APP_DIR/
cp $SCRIPT_DIR/ecosystem.config.js $APP_DIR/
mkdir -p $APP_DIR/nginx
if [ -d "$SCRIPT_DIR/nginx" ]; then
    cp -r $SCRIPT_DIR/nginx/* $APP_DIR/nginx/
fi

# Step 8: Set up PostgreSQL with Docker Compose
print_status "Setting up PostgreSQL with Docker Compose..."
print_status "Using: $DOCKER_COMPOSE_CMD"
cd $APP_DIR

# Stop and remove containers if they exist
$DOCKER_COMPOSE_CMD down 2>/dev/null || true

# If volume exists but password changed, remove it to recreate with new password
if docker volume ls | grep -q "kong-deploy_postgres_data"; then
    print_warning "Existing PostgreSQL volume found. Removing to ensure password matches..."
    $DOCKER_COMPOSE_CMD down -v 2>/dev/null || true
    docker volume rm kong-deploy_postgres_data 2>/dev/null || true
fi

# Start PostgreSQL container
$DOCKER_COMPOSE_CMD up -d

# Wait for PostgreSQL to be ready
print_status "Waiting for PostgreSQL to be ready..."
sleep 5
for i in {1..30}; do
    if $DOCKER_COMPOSE_CMD exec -T postgres pg_isready -U kong -d kong > /dev/null 2>&1; then
        print_status "PostgreSQL is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "PostgreSQL failed to start"
        exit 1
    fi
    sleep 2
done

# Step 9: Create backend .env.production file (BEFORE migrations)
print_status "Creating backend environment file..."
cat > $APP_DIR/backend/.env.production << EOF
NODE_ENV=production
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kong
DB_USER=kong
DB_PASSWORD=Kong@123

# JWT Configuration
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=7d

# Frontend URL
FRONTEND_URL=https://$DOMAIN
EOF

# Step 10: Run database migrations
print_status "Running database migrations..."
cd $APP_DIR/backend
npm install --production
if [ -f "migrations/run.js" ]; then
    # Wait a bit more for database to be fully ready
    sleep 2
    node migrations/run.js || print_warning "Migration may have failed or already run"
fi

# Step 11: Create default admin user
print_status "Creating default admin user..."
cd $APP_DIR/backend
if [ -f "scripts/create-admin-user.js" ]; then
    node scripts/create-admin-user.js || print_warning "Admin user creation may have failed or user already exists"
else
    print_warning "Admin user creation script not found"
fi

# Step 12: Build frontend
print_status "Building frontend..."
cd $APP_DIR/frontend
npm install
# Create frontend .env.production
cat > $APP_DIR/frontend/.env.production << EOF
VITE_API_URL=/api
EOF
npm run build

# Step 13: Configure Nginx
print_status "Configuring Nginx..."
# Copy nginx configuration
cp $APP_DIR/nginx/nginx.conf /etc/nginx/nginx.conf
cp $APP_DIR/nginx/sites-available/kong-deploy /etc/nginx/sites-available/kong-deploy

# Create symlink for site
ln -sf /etc/nginx/sites-available/kong-deploy /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
nginx -t

# Step 14: Start backend with PM2
print_status "Starting backend with PM2..."
cd $APP_DIR
pm2 delete kong-deploy-backend 2>/dev/null || true
pm2 start $APP_DIR/ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root || print_warning "PM2 startup command may need manual setup"

# Step 15: Configure firewall
print_status "Configuring firewall..."
if command -v ufw &> /dev/null; then
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw --force enable || print_warning "UFW may already be enabled"
else
    print_warning "UFW not found, please configure firewall manually"
fi

# Step 16: Start Nginx (before SSL setup)
print_status "Starting Nginx..."
systemctl restart nginx
systemctl enable nginx

print_status "========================================="
print_status "Deployment completed successfully!"
print_status "========================================="
echo ""
print_status "Next steps:"
echo "1. Run the SSL setup script: sudo ./setup-ssl.sh"
echo "2. Or manually set up SSL certificate with certbot"
echo ""
print_status "Application will be available at:"
echo "  HTTP:  http://$DOMAIN"
echo "  HTTPS: https://$DOMAIN (after SSL setup)"
echo ""
print_status "To check application status:"
echo "  PM2:   pm2 status"
echo "  Nginx: systemctl status nginx"
echo "  DB:    $DOCKER_COMPOSE_CMD ps (in $APP_DIR)"

