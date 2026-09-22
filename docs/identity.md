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

Set `identityApiKey`. `startIdentity` calls `POST /api/v1/identify/init` on Auth.
BankID requires the end user's IP address. Your backend must supply the visitor's IPv4 or IPv6 address in JSON `endUserIp` (recommended), or
in the `X-Forwarded-For` header. Replace the example `203.0.113.42` with the
address seen by your backend or trusted proxy; do not trust a visitor-supplied
value. JSON takes precedence over the first header address. Invalid JSON IP
values return HTTP 400; use a single address without a port. If the visitor's
address is not forwarded, the caller's IP is normally used instead.

If your proxy sends `Forwarded` ([RFC
7239](https://www.rfc-editor.org/rfc/rfc7239.html)), `for=` and `by=` can help you check
the proxy setup. `for=` identifies the node that connected to the proxy — the visitor in
a single-proxy setup — and `by=` identifies the proxy’s receiving interface. `by=` alone
does not prove who sent the header. Only trust information from trusted proxy hops, and
check how your provider handles client-supplied headers and protects the connection to
your backend.

Auth does not parse `Forwarded` directly. Extract the visitor’s IP in your backend using
your framework’s trusted-proxy support or an RFC 7239 parser, then send just the IP
address as `endUserIp` or `X-Forwarded-For`. Do not send the entire `for=` value: it may
contain quotes, a port or a value that is not an IP address.

Send the request and use the returned BankID launch/QR
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
