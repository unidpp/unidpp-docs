---
title: "Tutorial: stand up a whitelabel tenant end to end"
description: "Create a tenant, brand it, start it, issue and verify a passport, bundle it, and drill the restore — every command verified against the reference pilot."
---

# Tutorial: stand up a whitelabel tenant

Every step below runs against the
[reference pilot](/get-started/reference-stack/). A tenant is a
directory: `tenants/<name>/unidpp-operator.yaml` + journals. No code,
no forks — the manifest is the deployment.

## 1. Create the tenant

Either through the console (**Tenants → new tenant**: name, base
port, profile — the wizard validates before it writes), or by hand:

```sh
mkdir -p tenants/northwind
$EDITOR tenants/northwind/unidpp-operator.yaml   # model it on tenants/acme
../unidpp-config/target/release/unidpp-config validate tenants/northwind/unidpp-operator.yaml
# valid: northwind (profile whitelabel, 3 service(s): ["registry", "issuer", "console"])
```

Copy an existing tenant's manifest and change `deployment.name`,
`branding`, the binds (each tenant owns its port range), and — if
sovereign — `sovereignty` and `services.issuer.pack_suites`
(`[sm2]` for a CN-profile tenant).

## 2. Brand it (the admin interface configures itself)

Open the tenant's console (the bind its manifest declares) →
**Branding** → set organization, product name, logo URL, primary and
accent hex colors, footer links → *Save branding*. The save goes
through the validated path — an invalid hex is refused, and nothing
outside the branding block is touched. Every console surface
re-renders in the new colors on the next load.

## 3. Start it

```sh
./tenants/up.sh northwind start
#   registry: started (pid …)
#   issuer: started (pid …)
#   console: started (pid …)
./tenants/up.sh northwind status
```

The runner renders each service's environment from the manifest
(`unidpp-config render-env`) and starts exactly the declared
services.

## 4. Issue a passport and mint its pack

```sh
curl -s -X POST http://127.0.0.1:<issuer-bind>/passports \
  -H 'content-type: application/json' \
  -d '{"identity":"sgtin:4006381333931+21+NW-001",
       "type_ref":"battery-li-ion","config":[],
       "capability":"S1","eo_id":"northwind"}'
# -> {"passport_id":"urn:unidpp:passport:iss-…", …}

curl -s -X POST http://127.0.0.1:<issuer-bind>/passports/urn:unidpp:passport:iss-…/pack \
  -H 'content-type: application/json' -d '{}'
# -> {"pack":"…hex…", "anchor":"…"}
```

## 5. Verify offline, the verifier's way

Pin the issuer's published anchor — use `public_serialized` (the
suite-certain `suite:hex` form; 65-byte keys need it, since SM2 and
P-256 points are indistinguishable by length):

```sh
curl -s http://127.0.0.1:<issuer-bind>/keyring | jq -r '.roles.pack.public_serialized'
# ecdsa-p256:04d90cd961…

unidpp verify pack.hex --anchor ecdsa-p256:04d90cd961…
```

Expect the honest verdict: a tenant issuer without a wired
transparency log produces packs that verify **cryptographically**
but degrade **evidentiarily** (no log-head commitment). Wire
`UNIDPP_LOG_URL` for the full chain — degradation is explicit,
never silent.

## 6. Take the tenant elsewhere

```sh
./unidpp-ops bundle northwind --data-only
# the tenant-state artifact: manifest (${VAR} refs only), journals,
# .env template — verified like a backup; restore it on any
# deployment that already runs the engine:
./unidpp-ops restore <archive> northwind
```

The full bundle (drop `--data-only`) additionally packs the release
binaries for exactly the services the manifest declares — the
air-gapped sovereign artifact.

## 7. Prove the restore path

```sh
./unidpp-ops drill
# drill: GREEN — byte parity, manifest validated, report written
```

Run it after every upgrade rehearsal. A backup nobody ever restored
is a hope, not a capability.

## Where to go next

- [Multi-tenant operations](/operators/multi-tenant/) — the tenant
  model in depth.
- [The manifest reference](/operators/manifest/) — every field, and
  the [JSON Schema](/operator-manifest.schema.json).
- [Backups and restore drills](/operations/backups/) — the whole
  durability routine.
