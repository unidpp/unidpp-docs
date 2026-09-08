---
title: "Operations: backups, schedules, and restore drills"
description: "The durability contract as a routine: nightly backups, retention reporting, and the drill that proves restore works."
---

# Backups, schedules, and restore drills

A deployment is data: the manifest, every journal, the seed assets.
`unidpp-ops` (in
[unidpp-pilot-data](https://github.com/unidpp/unidpp-pilot-data))
packages that contract as four commands and a routine around them.
See also [Backup and restore](/operators/backup-restore/) for the
concepts.

## The routine

```sh
./unidpp-ops backup              # snapshot now (tar.gz + JSON sidecar
                                 # with per-file sha256 + the log tree
                                 # head as the consistency point)
./unidpp-ops schedule --install  # nightly backup at 03:17, merged
                                 # into the crontab idempotently
./unidpp-ops prune --keep 14     # retention REPORT (report-only;
                                 # --apply deletes exactly what it listed)
./unidpp-ops drill               # the restore rehearsal
```

`prune` never deletes unless `--apply` names the act — deletion is an
explicit operator decision, not a default.

## The drill

A backup nobody has ever restored is a hope, not a capability. The
drill proves the capability on live state:

1. **backup** — a fresh snapshot;
2. **restore** into a drill tenant the drill itself owns (production
   state is never touched; an existing drill tenant is refused);
3. **parity** — every archive member byte-identical after restore
   (the manifest is rewritten by design: journal paths and the tenant
   name rebased to the drill tenant — that rewrite is then
   **validated** with `unidpp-config`);
4. **report** — `backups/<label>.drill.json` (checksums, byte
   parity, manifest validation, consistency point);
5. **cleanup** — the drill tenant is removed (unless `--keep`).

Run the drill after every upgrade rehearsal and before any
infrastructure change. If it ever fails: do not touch production
restore until the failure is understood — a failed drill is the
cheapest possible discovery of a broken backup.

## Restoring for real

```sh
./unidpp-ops restore <archive> <tenant>        # refuses an existing tenant
./unidpp-ops restore <archive> <tenant> --force  # renames it aside,
                                                 # never deletes
```

Every checksum is verified before a single file unpacks. Only the
backup's OWN tenant journals rewrite into the restored tenant; other
tenants' journals restore as archive material under their original
paths.
