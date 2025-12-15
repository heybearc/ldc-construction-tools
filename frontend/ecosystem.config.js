module.exports = {
  apps: [{
    name: 'ldc-production',
    script: 'npm',
    args: 'start',
    cwd: '/opt/ldc-construction-tools/frontend',
    instances: 1,
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
}
