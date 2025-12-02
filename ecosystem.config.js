module.exports = {
  apps: [
    {
      name: 'gym-api',
      script: './gym-backend/dist/server.js',
      cwd: process.cwd(),
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      },
      error_file: './gym-backend/logs/err.log',
      out_file: './gym-backend/logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_file: './gym-backend/.env'
    }
  ]
};
