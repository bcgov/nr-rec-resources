#!/usr/bin/env node
// Browser driver for the RST public + admin frontends.
// Reads one command per line on stdin (or from --script FILE) and drives a
// Playwright chromium page. Every line prints OK/ERR so the caller can parse it.
//
//   echo 'goto http://localhost:3100
//   ss home' | node .claude/skills/run-nr-rec-resources/driver.mjs
//
// playwright resolves from nr-rec-resources/node_modules (hoisted, browsers
// already downloaded into ~/Library/Caches/ms-playwright).

import { chromium } from 'playwright';
import { createInterface } from 'node:readline';
import { createReadStream } from 'node:fs';
import { mkdirSync } from 'node:fs';
import { dirname, resolve, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SHOTS = process.env.RST_SHOTS || resolve(HERE, 'shots');
const TIMEOUT = Number(process.env.RST_TIMEOUT || 15000);

const argv = process.argv.slice(2);
const flag = (n) => argv.includes(n);
const opt = (n, d) => {
  const i = argv.indexOf(n);
  return i === -1 ? d : argv[i + 1];
};

mkdirSync(SHOTS, { recursive: true });

// The repo's cached playwright browsers can lag the installed playwright
// version (cache is keyed by build number), which makes launch() die with
// "Executable doesn't exist". Fall back to the system Chrome install rather
// than forcing a ~150MB download.
const launchOpts = { headless: !flag('--headed'), args: ['--disable-dev-shm-usage'] };
let browser;
try {
  browser = await chromium.launch(launchOpts);
} catch (e) {
  if (!/Executable doesn't exist/.test(String(e))) throw e;
  console.log('OK note bundled chromium missing, falling back to channel=chrome');
  browser = await chromium.launch({ ...launchOpts, channel: 'chrome' });
}
const ctx = await browser.newContext({
  viewport: { width: Number(opt('--width', 1440)), height: Number(opt('--height', 900)) },
  ignoreHTTPSErrors: true,
});
const page = await ctx.newPage();

// Collected so `errors` can dump them. The admin app in particular fails
// silently in the browser (blank page, nothing on stdout) so this is the only
// way to see why.
const log = { console: [], pageerror: [], failed: [] };
page.on('console', (m) => {
  if (m.type() === 'error' || m.type() === 'warning')
    log.console.push(`[${m.type()}] ${m.text()}`);
});
page.on('pageerror', (e) => log.pageerror.push(String(e)));
page.on('requestfailed', (r) =>
  log.failed.push(`${r.method()} ${r.url()} -> ${r.failure()?.errorText}`),
);
page.on('response', (r) => {
  if (r.status() >= 400) log.failed.push(`${r.status()} ${r.request().method()} ${r.url()}`);
});

const sel = (s) => s;

// Pull a possibly-quoted first token off a command's argument string, so
// selectors containing spaces survive. Returns [first, remainder].
function splitFirst(rest) {
  const q = rest[0];
  if (q === '"' || q === "'") {
    const end = rest.indexOf(q, 1);
    if (end !== -1) return [rest.slice(1, end), rest.slice(end + 1).trim()];
  }
  const i = rest.indexOf(' ');
  return i === -1 ? [rest, ''] : [rest.slice(0, i), rest.slice(i + 1).trim()];
}

async function run(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const sp = trimmed.indexOf(' ');
  const cmd = (sp === -1 ? trimmed : trimmed.slice(0, sp)).toLowerCase();
  const rest = sp === -1 ? '' : trimmed.slice(sp + 1).trim();

  switch (cmd) {
    case 'goto': {
      const res = await page.goto(rest, { waitUntil: 'domcontentloaded', timeout: TIMEOUT });
      return `OK goto ${res?.status()} ${page.url()}`;
    }
    case 'click':
      await page.locator(sel(rest)).first().click({ timeout: TIMEOUT });
      return `OK click ${rest}`;
    case 'clicktext':
      await page.getByText(rest, { exact: false }).first().click({ timeout: TIMEOUT });
      return `OK clicktext ${rest}`;
    case 'fill': {
      // `fill <selector> <value>`. Quote the selector if it contains spaces:
      //   fill "input[placeholder='By name or community']" Cabin
      const [s, v] = splitFirst(rest);
      await page.locator(sel(s)).first().fill(v, { timeout: TIMEOUT });
      return `OK fill ${s}`;
    }
    case 'press':
      await page.keyboard.press(rest);
      return `OK press ${rest}`;
    case 'wait':
      await page.locator(sel(rest)).first().waitFor({ state: 'visible', timeout: TIMEOUT });
      return `OK wait ${rest}`;
    case 'waittext':
      await page.getByText(rest, { exact: false }).first()
        .waitFor({ state: 'visible', timeout: TIMEOUT });
      return `OK waittext ${rest}`;
    case 'waitidle':
      await page.waitForLoadState('networkidle', { timeout: TIMEOUT });
      return 'OK waitidle';
    case 'sleep':
      await page.waitForTimeout(Number(rest || 500));
      return `OK sleep ${rest}`;
    case 'text': {
      const t = await page.locator(sel(rest)).first().innerText({ timeout: TIMEOUT });
      return `OK text ${JSON.stringify(t)}`;
    }
    case 'alltext': {
      const t = await page.locator(sel(rest)).allInnerTexts();
      return `OK alltext ${JSON.stringify(t)}`;
    }
    case 'count':
      return `OK count ${await page.locator(sel(rest)).count()}`;
    case 'eval': {
      const v = await page.evaluate(rest);
      return `OK eval ${JSON.stringify(v)}`;
    }
    case 'url':
      return `OK url ${page.url()}`;
    case 'title':
      return `OK title ${await page.title()}`;
    case 'ss': {
      const name = rest || `shot-${Date.now()}`;
      const p = isAbsolute(name)
        ? name
        : resolve(SHOTS, name.endsWith('.png') ? name : `${name}.png`);
      mkdirSync(dirname(p), { recursive: true });
      await page.screenshot({ path: p, fullPage: !flag('--viewport-only') });
      return `OK ss ${p}`;
    }
    case 'errors':
      return `OK errors ${JSON.stringify(log, null, 1)}`;
    case 'clearerrors':
      log.console = []; log.pageerror = []; log.failed = [];
      return 'OK clearerrors';
    case 'login': {
      // Keycloak login form. `login <user> <pass>`
      const [u, p] = rest.split(/\s+/);
      await page.locator('#username').waitFor({ state: 'visible', timeout: TIMEOUT });
      await page.locator('#username').fill(u);
      await page.locator('#password').fill(p);
      await page.locator('#kc-login').click();
      await page.waitForLoadState('domcontentloaded', { timeout: TIMEOUT });
      return `OK login ${u} -> ${page.url()}`;
    }
    case 'quit':
      return null;
    default:
      throw new Error(`unknown command: ${cmd}`);
  }
}

const input = opt('--script') ? createReadStream(opt('--script')) : process.stdin;
const rl = createInterface({ input, crlfDelay: Infinity });

let failed = false;
for await (const line of rl) {
  try {
    const out = await run(line);
    if (out === null) break;
    if (out !== undefined) console.log(out);
  } catch (e) {
    failed = true;
    console.log(`ERR ${line.trim()} :: ${String(e).split('\n')[0]}`);
  }
}

await browser.close();
process.exit(failed ? 1 : 0);
