# Runbook

## Deploy

```bash
# rules + indexes first, then functions
firebase deploy --only firestore:rules,firestore:indexes,storage --project prod
firebase deploy --only functions --project prod
```

## Secrets

```bash
firebase functions:secrets:set STRIPE_SECRET_KEY      --project prod
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET  --project prod
firebase functions:secrets:set SENTRY_DSN             --project prod
```

## Promote a user to admin

```bash
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json \
  ts-node scripts/setClaims.ts <uid> admin
```

## Common incidents

- **"Permission denied" spike** → check rules deploy + custom claims for that uid.
- **Webhook 4xx in Stripe dashboard** → signature secret mismatch; rotate `STRIPE_WEBHOOK_SECRET`.
- **Doctor can't be matched** → verify `verificationStatus == "verified"`, `isAcceptingRequests == true`, `geohash` set, `lastSeenAt` recent (<5min).
