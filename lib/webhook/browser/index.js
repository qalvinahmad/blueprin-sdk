"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// lib/src/webhook/browser.ts
var browser_exports = {};
__export(browser_exports, {
  verifyWebhookSignatureBrowser: () => verifyWebhookSignatureBrowser
});
module.exports = __toCommonJS(browser_exports);
var encoder = new TextEncoder();
function toBase64(value) {
  let binary = "";
  for (const byte of new Uint8Array(value)) binary += String.fromCharCode(byte);
  return btoa(binary);
}
async function hmac(secret, value) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return toBase64(await crypto.subtle.sign("HMAC", key, encoder.encode(value)));
}
async function verifyWebhookSignatureBrowser(options) {
  const { rawBody, signature, secretKey, timestamp, toleranceSeconds = 300 } = options;
  if (!rawBody || !signature || !secretKey) {
    return { isValid: false, reason: "Missing required webhook parameters." };
  }
  if (timestamp && toleranceSeconds > 0) {
    const parsed = isNaN(Number(timestamp)) ? Date.parse(timestamp) : Number(timestamp) * (String(timestamp).length === 10 ? 1e3 : 1);
    if (!isNaN(parsed) && Math.abs(Date.now() - parsed) / 1e3 > toleranceSeconds) {
      return { isValid: false, reason: "Webhook timestamp expired." };
    }
  }
  const computed = await hmac(secretKey, rawBody);
  const normalized = signature.replace(/^HMACSHA256=/i, "").trim();
  return {
    isValid: computed === normalized,
    reason: computed === normalized ? void 0 : "Signature mismatch."
  };
}
//# sourceMappingURL=index.js.map
