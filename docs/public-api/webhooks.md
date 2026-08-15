# Webhooks

Blueprin receives webhooks from DOKU for payment notifications. This document covers webhook handling, signature verification, and the payment flow.

## Overview

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    User      │     │     DOKU     │     │   Blueprin   │
│  Checkout    │────→│  Payment     │────→│  Webhook     │
│              │     │  Gateway     │     │  Handler     │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                    │
       │  1. POST /checkout │                    │
       │───────────────────→│                    │
       │                    │                    │
       │  2. Redirect to    │                    │
       │     payment page   │                    │
       │←───────────────────│                    │
       │                    │                    │
       │  3. Complete       │                    │
       │     payment        │                    │
       │───────────────────→│                    │
       │                    │                    │
       │                    │  4. POST webhook   │
       │                    │───────────────────→│
       │                    │                    │
       │                    │  5. Verify sig     │
       │                    │     Activate plan  │
       │                    │                    │
       │  6. Redirect to    │                    │
       │     success page   │                    │
       │←───────────────────│                    │
```

## DOKU Webhook Endpoint

### POST /api/webhooks/doku-api-payment

DOKU calls this endpoint when a payment is completed.

**Auth:** HMAC-SHA256 signature verification  
**Content-Type:** `application/json`

#### Webhook Payload

```json
{
  "order_id": "ORD-2026-08-15-001",
  "status": "SUCCESS",
  "amount": 25000,
  "currency": "IDR",
  "payment_method": "VA",
  "payment_code": "12345678901234",
  "reference_no": "DOKU-REF-123456",
  "paid_at": "2026-08-15T10:30:00Z",
  "customer": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### Signature Header

DOKU sends signature in header:

```
X-Doku-Signature: sha256=xxxxxxxxxxxxx
```

---

## Signature Verification

### How It Works

1. DOKU signs the payload with HMAC-SHA256 using a shared secret
2. Blueprin receives the webhook and extracts the signature
3. Blueprin recomputes the signature using the same secret
4. If signatures match, the webhook is authentic

### Verification Code

```javascript
// src/app/api/webhooks/doku-api-payment/route.js

import crypto from 'crypto';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const body = await request.json();
  const signature = request.headers.get('x-doku-signature');

  // 1. Verify signature
  const expectedSignature = crypto
    .createHmac('sha256', process.env.DOKU_SECRET_KEY)
    .update(JSON.stringify(body))
    .digest('hex');

  if (signature !== `sha256=${expectedSignature}`) {
    return NextResponse.json(
      { success: false, error: 'Invalid signature' },
      { status: 401 }
    );
  }

  // 2. Process payment
  const { order_id, status, amount } = body;

  if (status === 'SUCCESS') {
    // 3. Activate API plan
    await activateApiPlan(order_id, amount);
  }

  return NextResponse.json({ success: true });
}
```

### Signature Format

```
sha256=hex(hmac_sha256(secret, payload))
```

| Component | Description |
|-----------|-------------|
| `sha256` | Algorithm prefix |
| `=` | Separator |
| `hex(...)` | Hex-encoded HMAC-SHA256 |

---

## Payment Flow

### 1. User Initiates Checkout

```bash
POST /api/public/checkout
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "plan_code": "api_basic",
  "currency": "IDR"
}
```

### 2. Blueprin Creates Transaction

```javascript
// Creates record in payment_transactions table
const transaction = await supabase
  .from('payment_transactions')
  .insert({
    user_id: userId,
    order_id: `ORD-${Date.now()}`,
    plan_code: 'api_basic',
    amount: 25000,
    currency: 'IDR',
    status: 'pending',
  })
  .select()
  .single();
```

### 3. DOKU Checkout URL Created

```javascript
const checkoutUrl = await createDokuCheckout({
  order_id: transaction.order_id,
  amount: 25000,
  currency: 'IDR',
  callback_url: 'https://your-domain.com/api/webhooks/doku-api-payment',
  success_redirect: 'https://your-domain.com/home/api-keys?success=true',
  failure_redirect: 'https://your-domain.com/home/api-keys?failed=true',
});
```

### 4. User Completes Payment

User is redirected to DOKU payment page, completes payment.

### 5. DOKU Calls Webhook

```bash
POST /api/webhooks/doku-api-payment
X-Doku-Signature: sha256=xxxxxx

{
  "order_id": "ORD-1234567890",
  "status": "SUCCESS",
  "amount": 25000,
  ...
}
```

### 6. Blueprin Activates Plan

```javascript
async function activateApiPlan(orderId, amount) {
  // 1. Get transaction
  const { data: transaction } = await supabase
    .from('payment_transactions')
    .select('*')
    .eq('order_id', orderId)
    .single();

  // 2. Get plan details
  const { data: plan } = await supabase
    .from('api_plans')
    .select('*')
    .eq('code', transaction.plan_code)
    .single();

  // 3. Update transaction status
  await supabase
    .from('payment_transactions')
    .update({ status: 'completed', paid_at: new Date().toISOString() })
    .eq('id', transaction.id);

  // 4. Extend user's API keys
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + plan.duration_days);

  await supabase
    .from('api_keys')
    .update({
      plan_id: plan.id,
      expires_at: expiryDate.toISOString(),
    })
    .eq('user_id', transaction.user_id);
}
```

---

## Database Tables

### payment_transactions

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID (FK) | User who paid |
| order_id | TEXT (unique) | DOKU order ID |
| plan_code | TEXT | Plan purchased |
| amount | INTEGER | Amount in smallest unit (IDR: ratusan) |
| currency | TEXT | IDR / USD |
| status | TEXT | pending, completed, failed |
| payment_method | TEXT | VA, CC, etc. |
| reference_no | TEXT | DOKU reference |
| paid_at | TIMESTAMPTZ | Payment timestamp |
| created_at | TIMESTAMPTZ | Record creation |

### api_plans

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| code | TEXT (unique) | Plan code: api_free, api_basic, etc. |
| name | TEXT | Display name |
| price_amount | INTEGER | Price in smallest unit |
| currency | TEXT | IDR / USD |
| requests_per_day | INTEGER | Daily request limit |
| requests_per_month | INTEGER | Monthly request limit |
| rate_limit_per_second | INTEGER | Per-second rate limit |
| duration_days | INTEGER | Plan duration in days |
| features | JSONB | Feature list |

---

## Error Handling

### Invalid Signature

```json
{
  "success": false,
  "error": "Invalid signature"
}
```

**Cause:** Signature verification failed  
**Solution:** Check `DOKU_SECRET_KEY` environment variable

### Order Not Found

```json
{
  "success": false,
  "error": "Order not found"
}
```

**Cause:** Order ID doesn't exist in `payment_transactions`  
**Solution:** Ensure checkout was completed before webhook arrives

### Duplicate Webhook

```json
{
  "success": true,
  "message": "Already processed"
}
```

**Cause:** Webhook was already processed (idempotent)  
**Solution:** No action needed — DOKU may retry webhooks

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DOKU_SECRET_KEY` | Yes | HMAC-SHA256 secret for signature verification |
| `DOKU_CLIENT_ID` | Yes | DOKU client ID |
| `DOKU_API_KEY` | Yes | DOKU API key |
| `DOKU_SANDBOX` | No | `true` for sandbox, `false` for production |

---

## Testing Webhooks

### Using cURL

```bash
# Generate test signature
SECRET="your-doku-secret-key"
PAYLOAD='{"order_id":"TEST-001","status":"SUCCESS","amount":25000}'
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" | awk '{print $2}')

# Send test webhook
curl -X POST https://your-domain.com/api/webhooks/doku-api-payment \
  -H "Content-Type: application/json" \
  -H "X-Doku-Signature: sha256=$SIGNATURE" \
  -d "$PAYLOAD"
```

### Using DOKU Dashboard

1. Login to DOKU sandbox dashboard
2. Go to **Transactions** → **Webhook Test**
3. Enter your webhook URL
4. Select a test transaction
5. Click **Send Test Webhook**

---

## Security Best Practices

1. **Always verify signatures** — never trust unsigned webhooks
2. **Use HTTPS** — webhooks must use TLS
3. **Handle idempotency** — DOKU may retry webhooks
4. **Log all webhooks** — for debugging and audit
5. **Set timeout** — respond within 5 seconds
6. **Validate order_id** — ensure it exists before processing

---

## Troubleshooting

### "Invalid signature" error

- Check `DOKU_SECRET_KEY` environment variable
- Ensure payload is not modified before verification
- Check for encoding issues (UTF-8)

### Webhook not received

- Verify webhook URL in DOKU dashboard
- Check Blueprin server logs
- Ensure `/api/webhooks/*` is in `PUBLIC_API_PREFIXES` middleware

### Payment completed but plan not activated

- Check webhook logs for errors
- Verify `payment_transactions` table has the order
- Check `api_plans` table has the plan code
- Manually trigger activation if needed

### Duplicate activations

- Implement idempotency check (already done in code)
- Check `paid_at` timestamp before updating
- Use database transactions for consistency
