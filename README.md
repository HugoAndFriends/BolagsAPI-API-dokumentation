# BolagsAPI documentation and collections

OpenAPI 3.1 schemas and generated Postman/Bruno collections for the published BolagsAPI API, including Identity enrichment response contracts. The current collection contains **65 operations**. [Endpoint inventory](docs/endpoints.md).

## Documentation and schemas

- [BolagsAPI guide](https://bolagsapi.se/docs)
- [Identity guide and complete response reference](https://bolagsapi.se/identity/docs#response-schemas)
- [Published OpenAPI](https://api.bolagsapi.se/openapi.json) · [offline snapshot](schemas/openapi.json)
- [Identity JSON Schema 2020-12](https://api.bolagsapi.se/identity/enrichment.schema.json) · [offline snapshot](schemas/identity-enrichment.schema.json)
- [Identity integration notes](docs/identity.md) · [BRF integration notes](docs/brf.md)

The snapshots include response field types, required fields, nullable values and enumerations where the API defines closed sets. See [source URLs, synchronization time and checksums](schemas/sources.json). The collection covers the published OpenAPI surface, not internal dashboard endpoints or all Auth features; the linked guides cover the wider products.

## Use the collections

**Postman:** import both JSON files in `postman/`, then select **BolagsAPI Production**.

**Bruno:** open `bruno/bolagsapi`, then select **Production**. Enter secrets locally in the environment.

| Variable | Purpose |
| --- | --- |
| `baseUrl` | BolagsAPI data API: `https://api.bolagsapi.se` |
| `bearerToken` | BolagsAPI API key from [dashboard keys](https://bolagsapi.se/dashboard/keys) |
| `authBaseUrl` | Identity API: `https://auth.byhugo.se` |
| `identityApiKey` | Auth client API key for the Identity REST flow |
| `authAccessToken` | OIDC access token for `/userinfo` |
| `orgnr` | Company to query; replace with the company relevant to your integration |
| `orderRef` | Order reference returned by Identity start |
| `reportId`, `webhookId`, `announcementId`, `person_id` | IDs obtained from the corresponding list/lookup responses |
| `webhookSecret` | Your own secret for webhook signature verification |

Replace `REPLACE_WITH_...` values before sending. Optional query parameters are disabled by default; enable and populate the ones you need. Request examples are editable starting points. Response contracts live in the schemas, rather than generated fake example responses.

These environments call production. Requests consume applicable units and mutation endpoints create/change/delete resources. Run selected requests deliberately; do not run the entire collection as a smoke test. Access depends on your subscription, modules and agreement; see [current pricing](https://bolagsapi.se/pricing) and your dashboard. Identity also requires completed onboarding and the appropriate Auth credentials. No keys or personal identifiers are bundled.

## Keep this repository current

Requires Node.js 22 or newer and npm.

```sh
npm ci
npm run sync       # Fetch published schemas and regenerate both collections
npm run check      # Check coverage, hosts, authentication, syntax and references
npm run check:live # Detect differences from the currently published schemas
```

Commit schema snapshots, source manifest and generated collections together. Do not edit generated files directly. Modify the canonical schema in `HugoAndFriends/bolagsapi`, publish it, then synchronize here. Reviewed request examples and environment defaults are maintained in `scripts/generate.mjs`.

CI checks every push/PR, including deterministic regeneration. A daily scheduled check detects upstream schema drift; maintainers should run `npm run sync` and review the diff when it fails. Synchronization does not make business API requests.

Generation uses [Postman's OpenAPI converter](https://github.com/postmanlabs/openapi-to-postman) and [Bruno's converters/serializer](https://github.com/usebruno/bruno), with explicit corrections for per-operation servers and credentials. Both clients are checked against the same endpoint inventory.

## Support and license

Contact **dev@bolagsapi.se**. These collections are proprietary and provided for use with [BolagsAPI](https://bolagsapi.se). All rights reserved.
