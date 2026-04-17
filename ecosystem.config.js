module.exports = {
  apps: [
    {
      name: "hn-hired",
      script: "./build/server.js",
      cwd: "/home/yahya/.openclaw/workspace/hn-hired",
      interpreter: "/home/yahya/.nvm/versions/node/v24.13.0/bin/node",
      env: {
        NODE_ENV: "production",
      },
      env_file: "/home/yahya/.openclaw/workspace/hn-hired/.env",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "300M",
      error_file: "/tmp/hn-hired-err.log",
      out_file: "/tmp/hn-hired-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
