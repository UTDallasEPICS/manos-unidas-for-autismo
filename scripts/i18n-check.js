// i18n guardrail — `npm run i18n:check` (also runs in the `checker` CI script).
//
// Fails (exit 1) when:
//   1. en.json and es.json key sets differ (a key in one, missing from the other)
//   2. any locale value is an empty string
//   3. a literal $t("...") key used in a .vue file is not defined in the locales
//
// Deterministic: no network, no auto-translation. Spanish stays human-authored.
// This is what makes "everything translated" enforceable rather than aspirational.
import fs from "node:fs";
import path from "node:path";
import VueI18NExtract from "vue-i18n-extract";

function flatten(obj, prefix = "", out = {}) {
	for (const [k, v] of Object.entries(obj)) {
		const key = prefix ? `${prefix}.${k}` : k;
		if (v && typeof v === "object" && !Array.isArray(v))
			flatten(v, key, out);
		else out[key] = v;
	}
	return out;
}

const load = (p) =>
	flatten(JSON.parse(fs.readFileSync(path.resolve(p), "utf8")));

const en = load("./i18n/locales/en.json");
const es = load("./i18n/locales/es.json");
const problems = [];

const enKeys = new Set(Object.keys(en));
const esKeys = new Set(Object.keys(es));
for (const k of enKeys)
	if (!esKeys.has(k)) problems.push(`Key missing from es.json: "${k}"`);
for (const k of esKeys)
	if (!enKeys.has(k)) problems.push(`Key in es.json not in en.json: "${k}"`);
for (const [k, v] of Object.entries(en))
	if (typeof v === "string" && v.trim() === "")
		problems.push(`Empty value in en.json: "${k}"`);
for (const [k, v] of Object.entries(es))
	if (typeof v === "string" && v.trim() === "")
		problems.push(`Empty value in es.json: "${k}"`);

// Keys referenced in code but undefined in the locales (recursive — the old
// report script only scanned the top level of components/ and pages/).
// vue-i18n-extract prints its own report tables; silence them so this script's
// output is just the pass/fail verdict.
const silenced = ["log", "table", "info", "warn"];
const orig = {};
for (const m of silenced) {
	orig[m] = console[m];
	console[m] = () => {};
}
let report;
try {
	report = await VueI18NExtract.createI18NReport({
		vueFiles: "./{components,pages,layouts}/**/*.vue",
		languageFiles: "./i18n/locales/{en,es}.json",
	});
} finally {
	for (const m of silenced) console[m] = orig[m];
}
for (const m of report.missingKeys ?? [])
	problems.push(
		`$t("${m.path}") used in ${m.file} but missing from ${m.language}`
	);

if (problems.length) {
	console.error(`\n✖ i18n check failed — ${problems.length} problem(s):\n`);
	for (const p of problems) console.error("  • " + p);
	console.error(
		"\nFix: add the key to BOTH i18n/locales/en.json and es.json (no empty values).\n"
	);
	process.exit(1);
}
console.log(
	"✓ i18n check passed — en/es in parity, no empty values, all $t() keys defined."
);
