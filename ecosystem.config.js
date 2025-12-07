module.exports = {
  apps: [{
    name: 'kong-deploy-backend',
    script: '/var/www/kong-deploy/backend/server.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_file: '/var/www/kong-deploy/backend/.env.production',
    error_file: '/var/log/pm2/kong-deploy-backend-error.log',
    out_file: '/var/log/pm2/kong-deploy-backend-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000
  }]
};

