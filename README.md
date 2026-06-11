# BolagsAPI Collections

Ready-to-use API testing collections for [BolagsAPI](https://bolagsapi.se) - Swedish Company Data API.

## Quick Start

1. Get your API key from [bolagsapi.se/dashboard](https://bolagsapi.se/dashboard)
2. Import the collection for your preferred tool
3. Set your API key in the environment variables
4. Start testing!

## OpenAPI Specification

The full OpenAPI 3.1 specification is available at:
- **Production**: https://api.bolagsapi.se/openapi.json
- **Documentation**: https://bolagsapi.se/docs

## Support

- **Documentation**: https://bolagsapi.se/docs
- **Email**: dev@bolagsapi.se

## Postman

### Import Collection

1. Open Postman
2. Click **Import** (top left)
3. Select `postman/bolagsapi.postman_collection.json`
4. Import the environment: `postman/bolagsapi.postman_environment.json`

### Configure Environment

1. Click the **Environment** dropdown (top right)
2. Select **BolagsAPI**
3. Click the eye icon to edit variables
4. Set `bearerToken` to your API key
5. Optionally set `orgnr` to a test organization number

### Run Requests

1. Expand the **BolagsAPI** collection
2. Select any endpoint
3. Click **Send**

## Bruno

[Bruno](https://www.usebruno.com/) is an open-source API client that stores collections as plain files - perfect for version control.

### Import Collection

1. Open Bruno
2. Click **Open Collection**
3. Select the `bruno/bolagsapi` folder

### Configure Environment

1. Click the **Environment** dropdown
2. Select **Production**
3. Click the gear icon to edit
4. Set `bearerToken` to your API key

### Alternative: Import from OpenAPI

Bruno can also import directly from our OpenAPI spec:

1. Click **Import Collection**
2. Select **OpenAPI V3 Spec**
3. Enter URL: `https://api.bolagsapi.se/openapi.json`

## Available Endpoints

### Account
- `GET /v1/me` - Get current API caller, API key metadata, and billing-period usage

### Company Data
- `GET /v1/company/{orgnr}` - Get company information
- `GET /v1/company/{orgnr}/signatory` - Get signatory rules (firmateckning)
- `GET /v1/company/{orgnr}/signatories` - Get signatories with signing rights
- `GET /v1/company/{orgnr}/persons` - Get board members, executives, auditors
- `GET /v1/company/{orgnr}/ownership` - Get ownership information
- `GET /v1/company/{orgnr}/beneficial-owners` - Official beneficial owners (verkliga huvudmän, Pro+)
- `GET /v1/company/{orgnr}/contact` - Get contact info (website, phone, email, LinkedIn)
- `GET /v1/company/{orgnr}/group` - Corporate group structure (Pro+)
- `GET /v1/company/{orgnr}/group/members` - All group members (Pro+)
- `GET /v1/company/{orgnr}/workplaces` - Workplace locations (CFAR, addresses, employee counts)
- `GET /v1/company/{orgnr}/announcements` - POIT legal announcements
- `GET /v1/company/{orgnr}/announcements/{id}` - Single announcement detail
- `GET /v1/company/{orgnr}/bankruptcy` - Bankruptcy status check (Starter+)
- `GET /v1/company/{orgnr}/creditor-call` - Creditor call check (Starter+)

### Validation
- `GET /v1/validate/{orgnr}` - Validate single org number
- `POST /v1/validate/batch` - Batch validate (up to 100)

### Search
- `GET /v1/search` - Full-text company search
- `GET /v1/search/persons` - Person search (Starter+)

### Person & Beneficial Ownership
- `POST /v1/person/companies` - Companies connected to a personnummer through registered roles (Pro+)
- `POST /v1/persons/beneficial-of` - Companies where a person is official beneficial owner (Pro+)

### Reports
- `GET /v1/company/{orgnr}/reports` - List annual reports
- `GET /v1/company/{orgnr}/reports/{id}` - Download report (PDF or iXBRL)
- `GET /v1/company/{orgnr}/reports/{id}/auditor` - Download auditor's report

### Financials (Starter+)
- `GET /v1/company/{orgnr}/financials` - Multi-year financial data
- `GET /v1/company/{orgnr}/financials/latest` - Latest fiscal year
- `GET /v1/company/{orgnr}/financials/summary` - Trends & growth

### Analytics
- `GET /v1/company/{orgnr}/health` - Health score (0-100)
- `GET /v1/company/{orgnr}/timeline` - Event timeline
- `GET /v1/company/{orgnr}/similar` - Similar companies
- `GET /v1/company/{orgnr}/analysis` - AI analysis (Pro+)

### Industry
- `GET /v1/industry/{sniCode}` - Industry statistics

### Valuation (Pro+)
- `GET /v1/company/{orgnr}/valuation` - Company valuation
- `GET /v1/company/{orgnr}/valuation/ai` - AI valuation

### Export
- `POST /v1/export` - Bulk data export

### Tax Rates
- `GET /v1/tax-rates` - List available years
- `GET /v1/tax-rates/year/{year}` - All municipalities for a year
- `GET /v1/tax-rates/kommun/{kommunCode}` - Municipality across years
- `GET /v1/tax-rates/kommun/{kommunCode}/{year}` - Specific rate
- `GET /v1/tax-rates/search` - Search municipalities

### Riksbank Rates
- `GET /v1/rates` - Latest interest rates and exchange rates
- `GET /v1/rates/series` - List available rate series
- `GET /v1/rates/series/{seriesId}` - Historical observations for a series
- `GET /v1/rates/latest/{seriesId}` - Latest observation for a series
- `GET /v1/rates/date/{date}` - All observations for a specific date

### Screening (Starter+)
- `GET /v1/screening/person/{name}` - PEP & sanctions person screening
- `GET /v1/company/{orgnr}/screening` - Company + board screening
- `POST /v1/screening/batch` - Batch screening (up to 50 names)
- `GET /v1/screening/stats` - Screening database statistics

### Reference Data
- `GET /v1/sni-codes` - SNI code reference list

### Webhooks (Starter+)
- `GET /v1/webhooks` - List webhooks
- `POST /v1/webhooks` - Create webhook
- `PATCH /v1/webhooks/{id}` - Update webhook
- `DELETE /v1/webhooks/{id}` - Delete webhook
- `GET /v1/webhooks/{id}/deliveries` - Get delivery history
- `POST /v1/webhooks/{id}/test` - Test webhook

## Test Data

Use these Swedish companies for testing (all have multiple digital annual reports):

| Company | Org Number | Description |
|---------|------------|-------------|
| Lindstroms Bil | 5560553561 | Lindstroms Bil Aktiebolag - Car dealership |
| Momentum Software | 5564742103 | Momentum Software AB - Software company |
| Herrljunga Drycker | 5560124603 | Herrljunga Drycker AB - Beverage company |
| Oddbird | 5568080351 | Oddbird International AB - Non-alcoholic wine |

## License

These collections are proprietary and provided for use with [BolagsAPI](https://bolagsapi.se). All rights reserved.
