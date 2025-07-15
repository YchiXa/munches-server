import { defineConfig, loadEnv } from "@medusajs/framework/utils";
import { resolve } from "path";

loadEnv(process.env.NODE_ENV || "development", process.cwd());

export default defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    workerMode: process.env.MEDUSA_WORKER_MODE || "shared",
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },

  /* где лежит production-сборка админки */
  admin: {
    /**
     * `admin.path` должен быть **абсолютным** и начинаться с «/».
     * Мы копируем сборку в  `<projectRoot>/admin/build`, поэтому
     * просто даём абсолютный путь:
     */
    path: resolve(process.cwd(), "admin/build") as `/${string}`,
    disable: process.env.DISABLE_MEDUSA_ADMIN === "true",
    backendUrl: process.env.MEDUSA_BACKEND_URL,
  },

  /* Redis, S3, … */
  modules: {
    cache: {
      resolve: "@medusajs/cache-redis",
      options: { redisUrl: process.env.REDIS_URL, ttl: 3600 },
    },
    eventBus: {
      resolve: "@medusajs/event-bus-redis",
      options: { redisUrl: process.env.REDIS_URL },
    },
    workflows: {
      resolve: "@medusajs/workflow-engine-redis",
      options: { redis: { url: process.env.REDIS_URL } },
    },
    file: {
      resolve: "@medusajs/file",
      options: {
        providers: [
          {
            id: "s3",
            resolve: "@medusajs/file-s3",
            options: {
              endpoint: process.env.MINIO_ENDPOINT,
              region: process.env.S3_REGION || "us-east-1",
              bucket: process.env.MINIO_BUCKET,
              access_key_id: process.env.MINIO_ACCESS_KEY,
              secret_access_key: process.env.MINIO_SECRET_KEY,
              additional_client_config: { forcePathStyle: true },
            },
          },
        ],
      },
    },
  },
});
