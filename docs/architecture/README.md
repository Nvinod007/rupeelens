# Rupeelens architecture

System design docs ([Eraser — Rupeelens System Design](https://app.eraser.io/workspace/6WIDyjBdvEcD1JYZvlJL)).

**Status:** Planned / draft — modules and schema describe the target build, not necessarily what exists in `apps/` today.

## Docs

| Doc                                                                    | Contents                                             |
| ---------------------------------------------------------------------- | ---------------------------------------------------- |
| [01-product-and-hld.md](./01-product-and-hld.md)                       | Product summary, HLD, components                     |
| [02-lld.md](./02-lld.md)                                               | Nx layout, Nest modules, planned services            |
| [03-database.md](./03-database.md)                                     | ERD, tables, Prisma schema                           |
| [04-api.md](./04-api.md)                                               | REST endpoints and DTOs                              |
| [05-flows-etl-security-roadmap.md](./05-flows-etl-security-roadmap.md) | Consent/webhook/ledger flows, ETL, security, roadmap |
| [diagrams/](./diagrams/README.md)                                      | Diagram sources (paste into Eraser)                |

## Diagrams (Eraser)

| Diagram                      | Eraser link                                                                               |
| ---------------------------- | ----------------------------------------------------------------------------------------- |
| ERD                          | [Open](https://app.eraser.io/workspace/6WIDyjBdvEcD1JYZvlJL?diagram=0jqWkaQXvCZ1M4hbdt5L) |
| HLD (cloud)                  | [Open](https://app.eraser.io/workspace/6WIDyjBdvEcD1JYZvlJL?diagram=UXdwDIDapTBPZYNZZI_d) |
| Sequence (consent + webhook) | [Open](https://app.eraser.io/workspace/6WIDyjBdvEcD1JYZvlJL?diagram=NzqFf_b9A33X0SQizD5v) |
| ETL flowchart                | [Open](https://app.eraser.io/workspace/6WIDyjBdvEcD1JYZvlJL?diagram=SvriT_StUjgcu2Tvn4aw) |

## Related

- [Backend learnings](../learnings/be/README.md) — hands-on Prisma + Nest wiring
- [Setu field map template](../learnings/be/setu-field-map-TEMPLATE.md)
