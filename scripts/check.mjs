import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { bruToJsonV2, bruToEnvJsonV2 } from '@usebruno/lang';
const json = async path => JSON.parse(await readFile(path, 'utf8'));
const spec = await json('schemas/openapi.json');
const env = await json('postman/bolagsapi.postman_environment.json');
const variables = new Set(env.values.map(v => v.key));
const collection = await json('postman/bolagsapi.postman_collection.json');
const flatten = items => items.flatMap(i => i.item ? flatten(i.item) : [i]);
const requests = flatten(collection.item);
const operations = Object.entries(spec.paths).flatMap(([path, item]) => Object.entries(item).filter(([method]) => ['get','post','put','patch','delete','head','options'].includes(method)).map(([method, operation]) => ({ path, method, operation })));
assert.equal(requests.length, operations.length);
assert.equal(new Set(requests.map(r => r.name)).size, operations.length);
async function files(dir) { return (await Promise.all((await readdir(dir, { withFileTypes: true })).map(f => f.isDirectory() ? files(`${dir}/${f.name}`) : `${dir}/${f.name}`))).flat(); }
const bruno = [];
for (const file of await files('bruno/bolagsapi')) {
  if (!file.endsWith('.bru') || file.endsWith('collection.bru')) continue;
  const text = await readFile(file, 'utf8');
  if (file.includes('/environments/')) { bruToEnvJsonV2(text); continue; }
  const data = bruToJsonV2(text);
  assert.ok(data.http?.url, `Missing request: ${file}`);
  bruno.push(data);
  for (const [, key] of text.matchAll(/\{\{([^}]+)\}\}/g)) assert.ok(variables.has(key), `Undefined variable ${key}`);
}
assert.equal(bruno.length, operations.length);
for (const { path, method, operation: op } of operations) {
  const pm = requests.find(r => r.name === op.operationId);
  const bru = bruno.find(r => r.meta.name === op.operationId);
  assert.ok(pm && bru, `Missing operation ${op.operationId}`);
  assert.equal(pm.request.method.toLowerCase(), method);
  assert.equal(bru.http.method, method);
  const security = Object.keys((op.security ?? spec.security)[0]);
  const token = security.includes('identityApiKey') ? 'identityApiKey' : security.includes('identityAccessToken') ? 'authAccessToken' : 'bearerToken';
  const host = token === 'bearerToken' ? 'baseUrl' : 'authBaseUrl';
  assert.equal(env.values.find(v => v.key === host).value, (op.servers ?? spec.paths[path].servers ?? spec.servers)[0].url);
  assert.ok(pm.request.url.raw.startsWith(`{{${host}}}/`));
  assert.equal(bru.http.url, pm.request.url.raw);
  assert.equal(bru.auth.bearer.token, `{{${token}}}`);
  assert.equal(pm.request.auth.bearer[0].value, `{{${token}}}`);
  const template = pm.request.url.path.join('/').replace(/\{\{[^}]+\}\}/g, '{}');
  assert.equal(template, path.slice(1).replace(/\{[^}]+\}/g, '{}'));
  for (const [, key] of JSON.stringify(pm.request).matchAll(/\{\{([^}]+)\}\}/g)) assert.ok(variables.has(key), `Undefined variable ${key}`);
  if (pm.request.body) assert.deepEqual(JSON.parse(bru.body.json), JSON.parse(pm.request.body.raw));
}
for (const v of env.values.filter(v => /Token|Key$|Secret$/.test(v.key))) assert.equal(v.value, '', `Committed secret ${v.key}`);
const manifest = await json('schemas/sources.json');
for (const [file, source] of Object.entries(manifest.sources)) {
  const text = await readFile(`schemas/${file}`, 'utf8');
  assert.equal(createHash('sha256').update(text).digest('hex'), source.sha256);
  const data = JSON.parse(text);
  for (const [, ref] of text.matchAll(/"\$ref":\s*"([^"]+)"/g)) {
    assert.ok(ref.startsWith('#/'), `External reference ${ref}`);
    assert.ok(ref.slice(2).split('/').reduce((obj, k) => obj?.[k.replace(/~1/g, '/').replace(/~0/g, '~')], data), `Unresolved ${ref}`);
  }
  if (process.argv.includes('--live')) {
    const response = await fetch(source.url);
    assert.ok(response.ok);
    assert.deepEqual(await response.json(), data, `Published schema changed: run npm run sync (${file})`);
  }
}
console.log(`Verified ${operations.length} operations, authentication, Bruno syntax, variables and schema references.`);
