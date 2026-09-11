import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import converter from 'openapi-to-postmanv2';
import { postmanToBruno } from '@usebruno/converters';
import { jsonToBruV2, envJsonToBruV2 } from '@usebruno/lang';

const spec = JSON.parse(await readFile('schemas/openapi.json', 'utf8'));
const methods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];
const operations = Object.entries(spec.paths).flatMap(([path, item]) => methods.filter(m => item[m]).map(method => ({ path, method, item, operation: item[method] })));
// One request per operation, even when the specification assigns several tags.
const input = structuredClone(spec);
for (const { path, method } of operations) input.paths[path][method].tags = input.paths[path][method].tags?.slice(0, 1);
const converted = await new Promise((resolve, reject) => converter.convertV2({ type: 'json', data: input }, { folderStrategy: 'Tags', parametersResolution: 'Example' }, (error, result) => error ? reject(error) : resolve(result)));
if (!converted.result) throw new Error(converted.reason);
const collection = converted.output[0].data;
const variables = { datasetId: 'TAB2017', ordinal: '0', code: '0180', baseUrl: 'https://api.bolagsapi.se', authBaseUrl: 'https://auth.byhugo.se', bearerToken: '', identityApiKey: '', authAccessToken: '', webhookSecret: '', orgnr: '5560553561', sniCode: '62010', kommunCode: '0180', year: '2026', date: '2026-09-01', seriesId: 'SECBREPOEFF', reportId: 'REPLACE_WITH_REPORT_ID', webhookId: 'REPLACE_WITH_WEBHOOK_ID', announcementId: 'REPLACE_WITH_ANNOUNCEMENT_ID', name: 'Anna Andersson', sessionId: 'REPLACE_WITH_SESSION_ID', person_id: 'REPLACE_WITH_PERSON_ID', personnummer: 'REPLACE_WITH_AUTHORIZED_PERSONNUMMER' };
const bodies = {
  queryStatistics: { dataset: 'TAB2017', selection: { Region: ['0180'], ContentsCode: ['OE0101D1'], Tid: ['2026'] } },
  validateVatNumber: { country_code: 'SE', vat_number: '556016068001' },
  startIdentity: { scopes: ['profile', 'enrichment:bolag'] },
  postPersonCompanies: { person_id: '{{person_id}}' },
  getPersonBeneficialOf: { personnummer: '{{personnummer}}' },
  batchValidate: { orgnrs: ['{{orgnr}}'] },
  exportCompanies: { filters: { sni_codes: ['62010'], cities: ['Stockholm'], status: 'active' }, preview: true },
  createWebhook: { url: 'https://example.com/webhook', secret: '{{webhookSecret}}', events: ['company.name_changed'] },
  updateWebhook: { active: false },
  batchScreen: { names: ['Anna Andersson'], min_score: 80 },
};
const requests = items => items.flatMap(item => item.item ? requests(item.item) : [item]);
for (const item of requests(collection.item)) {
  const path = '/' + item.request.url.path.join('/').replace(/:([^/]+)/g, '{$1}');
  const op = operations.find(o => o.path === path && o.method === item.request.method.toLowerCase());
  if (!op) throw new Error(`Unmapped request ${path}`);
  const { operation } = op;
  item.name = operation.operationId;
  delete item.id;
  delete item.response;
  const security = operation.security ?? spec.security ?? [];
  const token = security.some(s => 'identityAccessToken' in s) ? 'authAccessToken' : security.some(s => 'identityApiKey' in s) ? 'identityApiKey' : 'bearerToken';
  const host = token === 'bearerToken' ? 'baseUrl' : 'authBaseUrl';
  item.request.auth = { type: 'bearer', bearer: [{ key: 'token', value: `{{${token}}}`, type: 'string' }] };
  const resolvedPath = path.replace(/\{([^}]+)\}/g, (_, name) => {
    const key = name === 'id' ? path.includes('/statistics/datasets') ? 'datasetId' : path.includes('webhooks') ? 'webhookId' : 'announcementId' : name;
    variables[key] ??= `REPLACE_WITH_${key.toUpperCase()}`;
    return `{{${key}}}`;
  });
  const params = [...(op.item.parameters ?? []), ...(operation.parameters ?? [])].filter(p => p.in === 'query');
  const query = params.map(p => {
    let value = p.example ?? p.schema?.example ?? p.schema?.default ?? p.schema?.const ?? '';
    if (operation.operationId === 'getScbIndustryBenchmarks') value = ({ year: '2024', size_class: '1-4', metrics: '0000028M' })[p.name] ?? value;
    if (p.name === 'sessionId') value = '{{sessionId}}';
    if (p.required && value === '') { variables[p.name] ??= `REPLACE_WITH_${p.name.toUpperCase()}`; value = `{{${p.name}}}`; }
    return { key: p.name, value: String(value), description: p.description ?? '', disabled: !p.required };
  });
  const url = `{{${host}}}${resolvedPath}`;
  const enabled = query.filter(q => !q.disabled);
  item.request.url = { raw: url + (enabled.length ? '?' + enabled.map(q => `${q.key}=${q.value}`).join('&') : ''), host: [`{{${host}}}`], path: resolvedPath.slice(1).split('/'), query };
  item.request.header = [{ key: 'Accept', value: Object.keys(operation.responses?.['200']?.content ?? { 'application/json': {} }).join(', ') }];
  delete item.request.body;
  if (operation.requestBody) {
    if (!bodies[operation.operationId]) throw new Error(`Add reviewed body for ${operation.operationId}`);
    item.request.body = { mode: 'raw', raw: JSON.stringify(bodies[operation.operationId], null, 2), options: { raw: { language: 'json' } } };
    item.request.header.push({ key: 'Content-Type', value: 'application/json' });
  }
  item.request.description = `${operation.summary ?? ''}\n\n${operation.description ?? ''}\n\nResponse contracts: see schemas/openapi.json. Replace placeholders before sending. Requests use production and may incur charges.`;
}
collection.info = { name: 'BolagsAPI', schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json', description: 'Generated from the published OpenAPI specification. See README.md before sending production requests.' };
collection.variable = [];
const environment = { name: 'BolagsAPI Production', values: Object.entries(variables).map(([key, value]) => ({ key, value, type: /Token|Key$|Secret$/.test(key) ? 'secret' : 'default', enabled: true })), _postman_variable_scope: 'environment' };
await writeFile('postman/bolagsapi.postman_collection.json', JSON.stringify(collection, null, 2) + '\n');
await writeFile('postman/bolagsapi.postman_environment.json', JSON.stringify(environment, null, 2) + '\n');
const bruno = await postmanToBruno(collection);
if (bruno.issues?.length) throw new Error(JSON.stringify(bruno.issues));
await rm('bruno/bolagsapi', { recursive: true, force: true });
await mkdir('bruno/bolagsapi/environments', { recursive: true });
await writeFile('bruno/bolagsapi/bruno.json', JSON.stringify({ version: '1', name: 'BolagsAPI', type: 'collection', ignore: ['node_modules', '.git'] }, null, 2) + '\n');
await writeFile('bruno/bolagsapi/collection.bru', 'headers {\n  Accept: application/json\n}\n');
await writeFile('bruno/bolagsapi/environments/Production.bru', envJsonToBruV2({ name: 'Production', variables: Object.entries(variables).map(([name, value]) => ({ name, value, enabled: true, type: 'text', secret: /Token|Key$|Secret$/.test(name) })) }));
async function save(items, directory) {
  for (const [index, item] of items.entries()) {
    const name = item.name.replace(/[^\w .-]/g, '-');
    if (item.type === 'folder') { await mkdir(`${directory}/${name}`, { recursive: true }); await save(item.items, `${directory}/${name}`); }
    else {
      item.seq = index + 1;
      item.request.url = item.request.url.replace(/^https?:\/\/(?=\{\{)/, '');
      delete item.examples;
      await writeFile(`${directory}/${name}.bru`, jsonToBruV2({ meta: { name: item.name, type: 'http', seq: item.seq }, http: { method: item.request.method.toLowerCase(), url: item.request.url, auth: 'bearer', body: item.request.body?.mode === 'json' ? 'json' : 'none' }, headers: item.request.headers, params: item.request.params, auth: item.request.auth, body: item.request.body, settings: item.settings }));
    }
  }
}
await save(bruno.collection.items, 'bruno/bolagsapi');
await mkdir('docs', { recursive: true });
await writeFile('docs/endpoints.md', '# Published endpoint inventory\n\nGenerated from `schemas/openapi.json`. This covers the published OpenAPI surface; internal/dashboard and other Auth endpoints are outside this collection. See the specification for parameters, responses and security alternatives.\n\n| Method | Path | Authentication | Operation |\n| --- | --- | --- | --- |\n' + operations.map(o => `| ${o.method.toUpperCase()} | \`${o.path}\` | ${Object.keys((o.operation.security ?? spec.security)[0]).join(', ')} | ${o.operation.operationId} |`).join('\n') + '\n');
console.log(`Generated ${operations.length} operations for Postman and Bruno.`);
