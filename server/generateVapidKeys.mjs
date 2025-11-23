import crypto from "crypto";

/**
 * Gera par de chaves VAPID para Web Push API
 * VAPID (Voluntary Application Server Identification) permite que servidores
 * se identifiquem ao enviar notificações push
 */

function generateVapidKeys() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("ec", {
    namedCurve: "prime256v1",
    publicKeyEncoding: {
      type: "spki",
      format: "der",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "der",
    },
  });

  const publicKeyBase64 = publicKey.toString("base64url");
  const privateKeyBase64 = privateKey.toString("base64url");

  return {
    publicKey: publicKeyBase64,
    privateKey: privateKeyBase64,
  };
}

const keys = generateVapidKeys();

console.log("\n=== VAPID Keys Generated ===\n");
console.log("Public Key (adicione ao .env como VAPID_PUBLIC_KEY):");
console.log(keys.publicKey);
console.log("\nPrivate Key (adicione ao .env como VAPID_PRIVATE_KEY):");
console.log(keys.privateKey);
console.log("\n===========================\n");
console.log("Adicione estas linhas ao seu arquivo .env:");
console.log(`VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
console.log(`VAPID_SUBJECT=mailto:admin@example.com`);
console.log("\n");
