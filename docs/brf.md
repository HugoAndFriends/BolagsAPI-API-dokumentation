# BRF integration

Structured housing association data, available with the BRF module.

- `GET /v1/company/{orgnr}/reports` — use the standard annual report list to find fiscal periods.
- `GET /v1/company/{orgnr}/brf?period=2025-12` — source-checked housing association data. Omit the period for the latest known report, without silently falling back to an older year.
- `GET /v1/company/{orgnr}/reports/{reportId}` — check `downloadable` first. BRF module PDF downloads return bytes with HTTP 200.

A successful BRF data response uses one of 10,000 units per module period. HTTP 202 and errors do not consume BRF units. Base API units are not also deducted. `X-BRF-Data-Remaining` gives the remaining allowance. HTTP 202 means processing; wait according to `Retry-After`. HTTP 404 means unavailable, 403 no access, and 429 quota/rate limit reached.

`quality.status=partial` does not certify the whole report. Each field has evidence (status, page, quote, unit); unknown or conflicting values are null. Empty loan/fee-change lists do not establish absence: inspect completeness flags. Amounts use SEK, areas m² and percentages percentage points. `apartments` and `residential_area_sqm` exclude rentals; `debt_per_sqm` uses total area, while `debt_per_residential_sqm` uses tenant-owned area. `fixed_until` is the interest reset date, not final maturity.

[Product and prices](https://bolagsapi.se/brf) · [BRF integration guide](https://bolagsapi.se/docs#brf-data) · [Full response schemas](https://api.bolagsapi.se/openapi.json)

