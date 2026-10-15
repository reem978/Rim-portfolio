// Simple admin login: one password (from .env) gives a signed token valid for 8 hours.
// Uses only Node's built-in crypto, so no extra packages are needed.
const crypto = require("crypto");

const TOKEN_LIFETIME_MS = 8 * 60 * 60 * 1000;

function getSecret() {
  return process.env.TOKEN_SECRET;
}

function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", getSecret()).update(body).digest("base64url");
  return body + "." + signature;
}

function verify(token) {
  if (typeof token !== "string" || !token.includes(".")) return false;
  const [body, signature] = token.split(".");
  const expected = crypto.createHmac("sha256", getSecret()).update(body).digest("base64url");

  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString());
    return typeof payload.exp === "number" && payload.exp > Date.now();
  } catch {
    return false;
  }
}

// Compare passwords in constant time (hashing first makes the lengths equal)
function passwordMatches(input) {
  const hash = (value) => crypto.createHash("sha256").update(String(value)).digest();
  return crypto.timingSafeEqual(hash(input), hash(process.env.ADMIN_PASSWORD));
}

function createToken() {
  return sign({ role: "admin", exp: Date.now() + TOKEN_LIFETIME_MS });
}

// Express middleware: blocks the request unless a valid token is sent
function requireAdmin(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!verify(token)) {
    return res.status(401).json({ error: "Please log in again." });
  }
  next();
}

module.exports = { createToken, passwordMatches, requireAdmin, verify };