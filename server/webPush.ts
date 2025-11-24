import crypto from "crypto";
import https from "https";
import { URL } from "url";
import { getDb } from "./db";
import { pushSubscriptions } from "../drizzle/schema";
import { eq } from "drizzle-orm";

// VAPID keys devem ser configuradas no .env
// Execute: node server/generateVapidKeys.mjs para gerar
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:admin@example.com";

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
}

/**
 * Salva subscrição push no banco de dados
 */
export async function savePushSubscription(
  userId: string,
  subscription: PushSubscriptionData,
  userAgent?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Verificar se já existe subscrição para este endpoint
  const existing = await db
    .select()
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.endpoint, subscription.endpoint))
    .limit(1);

  if (existing.length > 0) {
    // Atualizar subscrição existente
    await db
      .update(pushSubscriptions)
      .set({
        userId,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userAgent,
      })
      .where(eq(pushSubscriptions.endpoint, subscription.endpoint));

    return existing[0];
  }

  // Criar nova subscrição
  const [result] = await db.insert(pushSubscriptions).values({
    userId,
    endpoint: subscription.endpoint,
    p256dh: subscription.keys.p256dh,
    auth: subscription.keys.auth,
    userAgent,
  });

  return result;
}

/**
 * Busca todas as subscrições de um usuário
 */
export async function getUserPushSubscriptions(userId: string) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.userId, userId));
}

/**
 * Remove subscrição push
 */
export async function removePushSubscription(endpoint: string) {
  const db = await getDb();
  if (!db) return false;

  await db
    .delete(pushSubscriptions)
    .where(eq(pushSubscriptions.endpoint, endpoint));
  return true;
}

/**
 * Gera JWT para autenticação VAPID
 */
function generateVapidAuthHeader(audience: string): string {
  const header = {
    typ: "JWT",
    alg: "ES256",
  };

  const jwtPayload = {
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60, // 12 horas
    sub: VAPID_SUBJECT,
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString(
    "base64url"
  );
  const encodedPayload = Buffer.from(JSON.stringify(jwtPayload)).toString(
    "base64url"
  );

  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  // Assinar com chave privada VAPID
  const privateKeyBuffer = Buffer.from(VAPID_PRIVATE_KEY, "base64url");
  const sign = crypto.createSign("SHA256");
  sign.update(unsignedToken);
  const signature = sign.sign({
    key: privateKeyBuffer,
    format: "der",
    type: "pkcs8",
  });

  const encodedSignature = signature.toString("base64url");

  return `${unsignedToken}.${encodedSignature}`;
}

/**
 * Envia notificação push para um endpoint
 */
export async function sendPushNotification(
  subscription: PushSubscriptionData,
  payload: PushNotificationPayload
): Promise<boolean> {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.error("[WebPush] VAPID keys not configured");
    return false;
  }

  try {
    const parsedUrl = new URL(subscription.endpoint);
    const audience = `${parsedUrl.protocol}//${parsedUrl.host}`;

    const vapidToken = generateVapidAuthHeader(audience);

    // Criptografar payload
    const payloadString = JSON.stringify(payload);
    const payloadBuffer = Buffer.from(payloadString);

    // Headers VAPID
    const headers = {
      "Content-Type": "application/octet-stream",
      "Content-Encoding": "aes128gcm",
      Authorization: `vapid t=${vapidToken}, k=${VAPID_PUBLIC_KEY}`,
      TTL: "86400", // 24 horas
    };

    // Enviar requisição HTTP POST
    return new Promise((resolve, reject) => {
      const req = https.request(
        subscription.endpoint,
        {
          method: "POST",
          headers,
        },
        res => {
          if (res.statusCode === 201) {
            resolve(true);
          } else if (res.statusCode === 410 || res.statusCode === 404) {
            // Subscrição expirada ou inválida
            console.warn(
              "[WebPush] Subscription expired or invalid:",
              subscription.endpoint
            );
            removePushSubscription(subscription.endpoint);
            resolve(false);
          } else {
            console.error("[WebPush] Push failed with status:", res.statusCode);
            resolve(false);
          }
        }
      );

      req.on("error", error => {
        console.error("[WebPush] Request error:", error);
        reject(error);
      });

      req.write(payloadBuffer);
      req.end();
    });
  } catch (error) {
    console.error("[WebPush] Error sending push:", error);
    return false;
  }
}

/**
 * Envia notificação push para todos os dispositivos de um usuário
 */
export async function sendPushToUser(
  userId: string,
  payload: PushNotificationPayload
) {
  const subscriptions = await getUserPushSubscriptions(userId);

  const results = await Promise.allSettled(
    subscriptions.map(sub =>
      sendPushNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        },
        payload
      )
    )
  );

  const successful = results.filter(
    r => r.status === "fulfilled" && r.value
  ).length;

  return {
    total: subscriptions.length,
    successful,
    failed: subscriptions.length - successful,
  };
}

export function getVapidPublicKey() {
  return VAPID_PUBLIC_KEY;
}
