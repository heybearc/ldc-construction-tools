module.exports = {
  apps: [{
    name: "ldc-production",
    script: "node_modules/.bin/next",
    args: "start -p 3001",
    cwd: "/opt/ldc-construction-tools/frontend",
    exec_mode: "fork",
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: "1G",
    env: {
      NODE_ENV: "production"
    }
  }]
}
