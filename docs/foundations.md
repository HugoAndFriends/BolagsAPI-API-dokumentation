# Foundations and representatives

Look up foundation purposes, representatives and signing rules using your existing API requests. Coverage includes published active foundations in the county administrative boards' register, excluding pension, staff and collective-agreement foundations.

## Existing requests, additional data

| Request | Foundation data |
| --- | --- |
| `GET /v1/company/{orgnr}` | Additive `foundation` object: purpose, type, location, contact information, signing rules and all current source roles. |
| `GET /v1/company/{orgnr}/persons` | Person representatives, plus the full `foundation` source projection. |
| `GET /v1/company/{orgnr}/signatory` | Original signing-rule text. |
| `GET /v1/company/{orgnr}/signatories` | Explicit signatory roles with `signing_right: UNKNOWN`; no signing authority inferred from text. |
| `POST /v1/person/companies` | Foundation engagements linked to the same verified person identity as existing company engagements. |
| `GET /v1/search/persons` | Person observations from foundations, with unresolved identities kept separate. |

Use your existing API key and the same requests in Postman or Bruno. The `foundation` object is omitted when the organization has no linked source record.

For example, a person lookup remains:

```http
POST /v1/person/companies
Authorization: Bearer <API_KEY>
Content-Type: application/json

{"person_id":"<person_id returned by a previous lookup>"}
```

The existing `companies` array can now include foundation engagements as well as company engagements. Existing `person_id` values remain usable.

## Access to embedded fields

The additive object preserves the same access rules as the original endpoints:

- Full `roles`: persons endpoint access (Pro or higher), with no active customer-specific restriction. Otherwise `roles` is null and `roles_access` is `restricted`; `role_count` still describes the source total.
- `signatory_rules`: signatory endpoint access (Starter or higher). Restricted text is null and `signatory_rules_access` is `restricted`.
- `phone` / `website`: contact endpoint access (Starter or higher). Restricted fields are null and `contact_access` is `restricted`.

Available groups are marked `available`. Basic foundation fields and source metadata can remain visible when a field group is restricted. Null due to restricted access must not be interpreted as missing source data.

## Role observations and identity

`foundation.roles` contains all current source observations, including organizations acting as auditors or administrators. Such organizations use `related_orgnr` and do not appear as people in the `persons` array.

Useful fields:

- `source_record_id`: stable source-role observation ID, **not** a globally identified person.
- `type` / `title`: normalized role and original title. `auditor_deputy` is distinct from a board deputy; `administrator` represents a förvaltare.
- `entity_type`: `organization` or `person_or_unknown`.
- `identifier_precision`: `person`, `organization`, `birth_date_only` or `unknown`.
- `identity_resolution`: whether a person identity is resolved. Unresolved observations have null `person_id` and `personnummer_hash`.

Unresolved observations do not establish that two roles belong to the same person. Roles do not establish ownership or beneficial ownership.

## Freshness and coverage

`foundation.source` is `lansstyrelsen_stiftelser`. `last_checked_at` is the latest successful verification, `published_at` the data publication time and `content_hash` the source version identifier.

`data_status: stale` means the data has not been verified recently. `active_in_source: false` means the organization left the current source population; it does not prove deregistration. A current foundation snapshot does not establish a complete list of a person's engagements.

The `foundation` object contains foundation-specific information and may differ from the general company fields.

[Swedish/English customer guide and examples](https://bolagsapi.se/docs#company) · [Persons guide](https://bolagsapi.se/docs#persons) · [Person-company lookup](https://bolagsapi.se/docs#person-companies) · [OpenAPI snapshot](../schemas/openapi.json)
