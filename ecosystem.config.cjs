module.exports = {
  apps: [{
    name: 'amar-ain',
    cwd: __dirname,
    script: 'server/dist/server.js',
    instances: 1,
    exec_mode: 'fork',
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    max_memory_restart: '500M',
    autorestart: true,
    time: true
  }]
};
