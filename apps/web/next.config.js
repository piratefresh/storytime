// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/ui"],
  serverExternalPackages: ["@node-rs/argon2", "@node-rs/bcrypt"],
};

module.exports = nextConfig;
