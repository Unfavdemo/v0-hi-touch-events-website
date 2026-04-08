/**
 * PM2 process for production Next.js (`next start`).
 * On the VPS, from the repo root: `pm2 start ecosystem.config.cjs`
 * Then save: `pm2 save` and enable boot: `pm2 startup` (follow the printed command).
 */
module.exports = {
  apps: [
    {
      name: "hi-touch-events",
      cwd: __dirname,
      script: "node_modules/next/dist/bin/next",
      args: "start",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
      },
    },
  ],
}
