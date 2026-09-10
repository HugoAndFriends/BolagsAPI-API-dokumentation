# Foundations and representatives

BolagsAPI imports Länsstyrelsen's foundation registry every night. It covers published active foundations in the county administrative boards' register, excluding pension, staff and collective-agreement foundations. [Official source](https://stiftelser.lansstyrelsen.se/%C3%96ppendata).

## Existing requests, additional data

| Request | Foundation data |
| --- | --- |
| `GET /v1/company/{orgnr}` | Additive `foundation` object: purpose, type, location, contact information, signing rules and all current source roles. |
| `GET /v1/company/{orgnr}/persons` | Person representatives, plus the full `foundation` source projection. |
| `GET /v1/company/{orgnr}/signatory` | Original signing-rule text. |
| `GET /v1/company/{orgnr}/signatories` | Explicit signatory roles with `signing_right: UNKNOWN`; no signing authority inferred from text. |
| `POST /v1/person/companies` | Foundation engagements linked to the same verified person identity as existing company engagements. |
| `GET /v1/search/persons` | Person observations from foundations, with unresolved identities kept separate. |

Use your existing API key and the same requests in Postman or Bruno. The `foundation` object is omitted when the organization has no linked source record. Organizations without a valid organization number are retained internally and cannot be queried through an organization-number route.

For example, a person lookup remains:

```http
POST /v1/person/companies
Authorization: Bearer <API_KEY>
Content-Type: application/json

{"person_id":"<person_id returned by a previous lookup>"}
```

The existing `companies` array can now include foundation engagements as well as company engagements. Existing `person_id` values remain usable.

## Role observations and identity

`foundation.roles` contains all current source observations, including organizations acting as auditors or administrators. Such organizations use `related_orgnr` and do not appear as people in the `persons` array.

Useful fields:

- `source_record_id`: stable source-role observation ID, **not** a globally identified person.
- `type` / `title`: normalized role and original title. `auditor_deputy` is distinct from a board deputy; `administrator` represents a förvaltare.
- `entity_type`: `organization` or `person_or_unknown`.
- `identifier_precision`: `person`, `organization`, `birth_date_only` or `unknown`.
- `identity_resolution`: whether a person identity is resolved. Unresolved observations have null `person_id` and `personnummer_hash`.

A name or date of birth alone never causes an automatic merge with another person. Raw personal identifiers and representatives' private contact payloads are not returned. Roles do not establish ownership or beneficial ownership.

## Freshness and coverage

`foundation.source` is `lansstyrelsen_stiftelser`. `last_checked_at` records the latest successful verification; `published_at` records our publication of that file version; `content_hash` identifies the downloaded file. Unchanged content advances verification time without duplicating roles.

`data_status` becomes `stale` after 36 hours without verification. The last good dataset remains available when an import fails. `active_in_source: false` means the organization left the current source population; it does not prove deregistration. A current foundation snapshot does not establish a complete list of a person's engagements.

Existing BV/SCB company fields retain priority. The `foundation` object preserves Länsstyrelsen's source-specific view, including any differing values.

[Swedish/English customer guide and examples](https://bolagsapi.se/docs#company) · [Persons guide](https://bolagsapi.se/docs#persons) · [Person-company lookup](https://bolagsapi.se/docs#person-companies) · [OpenAPI snapshot](../schemas/openapi.json)
