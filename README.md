# BolagsAPI Collections

Ready-to-use API testing collections for [BolagsAPI](https://bolagsapi.se) - Swedish Company Data API.

## Quick Start

1. Get your API key from [bolagsapi.se/dashboard](https://bolagsapi.se/dashboard)
2. Import the collection for your preferred tool
3. Set your API key in the environment variables
4. Start testing!

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

### Company Data
- `GET /v1/company/{orgnr}` - Get company information
- `GET /v1/company/{orgnr}/reports` - List annual reports
- `GET /v1/company/{orgnr}/reports/{id}` - Download report

### Validation
- `GET /v1/validate/{orgnr}` - Validate single org number
- `POST /v1/validate/batch` - Batch validate (up to 100)

### Search
- `GET /v1/search` - Full-text company search

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

### Webhooks (Starter+)
- `GET /v1/webhooks` - List webhooks
- `POST /v1/webhooks` - Create webhook
- `PATCH /v1/webhooks/{id}` - Update webhook
- `DELETE /v1/webhooks/{id}` - Delete webhook

## Test Data

Use these Swedish companies for testing (all have multiple digital annual reports):

| Company | Org Number | Description |
|---------|------------|-------------|
| Lindströms Bil | 5560553561 | Lindströms Bil Aktiebolag - Car dealership |
| Momentum Software | 5564742103 | Momentum Software AB - Software company |
| Herrljunga Drycker | 5560124603 | Herrljunga Drycker AB - Beverage company |
| Oddbird | 5568080351 | Oddbird International AB - Non-alcoholic wine |

## OpenAPI Specification

The full OpenAPI 3.1 specification is available at:
- **Production**: https://api.bolagsapi.se/openapi.json
- **Documentation**: https://bolagsapi.se/docs

## Support

- **Documentation**: https://bolagsapi.se/docs
- **Email**: support@hugoandfriends.se
- **Issues**: https://github.com/HugoAndFriends/BolagsAPI-API-dokumentation/issues

## License

These collections are proprietary and provided for use with [BolagsAPI](https://bolagsapi.se). All rights reserved.
