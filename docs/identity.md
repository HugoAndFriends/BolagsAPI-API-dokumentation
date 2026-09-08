# Identity response contract

The canonical contract is maintained in BolagsAPI, with explicit Auth servers on
Auth operations. Do not publish a second independently maintained schema in Auth.

- `https://api.bolagsapi.se/openapi.json`: OpenAPI 3.1, including Auth collect,
  enrichment follow-up and OIDC userinfo responses.
- `https://api.bolagsapi.se/identity/enrichment.schema.json`: JSON Schema 2020-12.
  Root validates `enrichment.bolag`; `$defs` contains all other named response
  schemas. All references in this artifact resolve locally for offline use.
- `https://bolagsapi.se/identity/docs#response-schemas`: Swedish/English field
  reference, values, scope-dependent claims, nullable fields and error variants.
- Auth's `/docs` links to these canonical resources.

Source: `openapi-identity-schemas.ts`, `openapi-identity.ts`, existing
`PersonCompaniesResponse`/`PersonCompanyEngagement` components and
`services/person-role-mapping.ts`. `identity-json-schema.ts` derives the standalone
artifact from these components. Tests validate generated lookup results and
failure variants using Ajv 2020-12. Changes to Auth's enrichment formatter,
claims or delivery envelopes must be checked against this contract.

`roles[].type` remains an open string because stored role types are passed
through. Known normalized values are exposed as `x-known-values`, not a closed
enum. Unknown roles must not make integrations fail. Additional response fields
are allowed for compatibility. No scoring, identity, consent or billing behavior
is changed by publishing these schemas.

Validated against local Auth and BolagsAPI source on 2026-09-08. The schema
includes both full `failed` lookup results and the smaller transport failure
object, and distinguishes absent optional fields from present null values.

## Try the REST flow

Set `identityApiKey`, send `startIdentity`, and use the returned BankID launch/QR
information as described in the Identity guide. Copy `orderRef` into the
environment before calling `collectIdentity`. Collect returns server-sent events,
not a single JSON response: each event's `data` is JSON. The OpenAPI
`x-sse-events` mapping gives the payload schema for each event.

A completed identity check does not necessarily mean enrichment is ready. Use
`getIdentityEnrichment` with the same order reference when enrichment is queued
or refreshing. Follow the documented retry delay. The enrichment endpoint uses
HTTP 200 for fresh/stale/not_found, 202 for queued/refreshing and 503 for failed;
expired follow-up access is a separate HTTP 410 error. Do not treat an unavailable
lookup as proof that the person has no companies.

`getIdentityUserInfo` belongs to the OIDC flow and needs `authAccessToken`, not the
REST API key. Claims depend on requested/granted scopes. Optional claims may be
absent; that does not imply they can be null. The standalone schema root validates
`enrichment.bolag`, while `$defs` provides the complete envelopes and user claims.

For typed clients or Effect Schemas, preserve the closed enums for company status,
source, mode and data status from the schema. Preserve `roles[].type` as an open
string with known values as suggestions. Keep nullable fields distinct from
optional properties, and handle both full lookup failures and transport errors.
