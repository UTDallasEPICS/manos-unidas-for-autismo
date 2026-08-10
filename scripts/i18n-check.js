// i18n guardrail — `npm run i18n:check` (also runs in the `checker` CI script).
//
// Fails (exit 1) when:
//   1. en.json and es.json key sets differ (a key in one, missing from the other)
//   2. any locale value is an empty string
//   3. a literal $t("...") key used in a .vue file is not defined in the locales
//   4. a .vue template has hardcoded UI text not wrapped in $t() — UNLESS the
//      file is grandfathered on LEGACY_I18N_ALLOWLIST (the ratchet: new files
//      must be clean; legacy files drop off the list as the redesign migrates
//      them — when the list hits 0, task #11 is done).
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

// 4. Hardcoded UI strings — literal template text (and label/placeholder/title
//    attributes) not wrapped in $t(). Brand/proper-noun strings are always
//    allowed; pages/dev is internal English-only tooling (permanent ignore);
//    legacy files pending the redesign are grandfathered on the allowlist and
//    must be removed from it once migrated (task #11).
const IGNORE_TEXT = new Set(
	[
		"Connected Care", // product name — not translated
		"FMUA",
		"fundación@manosunidasporautismo.org", // org contact address
	].map((s) => s.toLowerCase())
);
const IGNORE_FILE_PREFIXES = ["pages/dev/"];
const LEGACY_I18N_ALLOWLIST = new Set([
	"components/Form/Input/CheckboxGroup.vue",
	"components/Form/Input/CustomGoals.vue",
	"components/Form/Input/Multitext.vue",
	"components/Form/Input/ObjectiveDetails.vue",
	"components/Form/Input/TherapyDrilldown.vue",
	"components/profile/Details.vue",
	"components/profile/EditModal.vue",
	"components/recommendations/Modal.vue",
	"components/request/ViewRequestTable.vue",
	"components/schedule/CreateAppointment.vue",
	"components/schedule/FilterAppointments.vue",
	"components/schedule/WeekViewCalendar.vue",
	"components/therapy/NotesHistory.vue",
	"components/therapy/PatientModal.vue",
	"components/therapy/ReportModal.vue",
	"components/therapy/ViewNoteModal.vue",
	"components/userService/AssignModal.vue",
	"pages/admin/createAccount.vue",
	"pages/admin/employeeSearch.vue",
	"pages/admin/scheduleView.vue",
	"pages/contact.vue",
	"pages/intake/[id].vue",
	"pages/patient/patientProfile/[id].vue",
	"pages/patient/patientSearch.vue",
	"pages/patient/testingForm.vue",
	"pages/patient/viewContactForms.vue",
	"pages/userService/assignNeuroSpecialist.vue",
	"pages/userService/viewAppointmentRequests.vue",
]);

function walkVue(dir, out = []) {
	if (!fs.existsSync(dir)) return out;
	for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
		const p = path.join(dir, e.name);
		if (e.isDirectory()) walkVue(p, out);
		else if (e.name.endsWith(".vue")) out.push(p);
	}
	return out;
}

function rawTextViolations(file) {
	const src = fs.readFileSync(file, "utf8");
	const tmpl = src.match(/<template[^>]*>([\s\S]*)<\/template>/i);
	if (!tmpl) return [];
	// Drop comments, nested script/style, and code/pre (legit literal text),
	// then strip {{ }} interpolations — what's left between tags is raw text.
	const t = tmpl[1]
		.replace(/<!--[\s\S]*?-->/g, "")
		.replace(/<(script|style|pre|code)[\s\S]*?<\/\1>/gi, "")
		.replace(/\{\{[\s\S]*?\}\}/g, "");
	const hits = new Set();
	let m;
	const textNode = />([^<>]+)</g;
	while ((m = textNode.exec(t))) {
		const s = m[1].replace(/&[a-z]+;/gi, " ").trim();
		if (/[A-Za-z]{2,}/.test(s) && !IGNORE_TEXT.has(s.toLowerCase()))
			hits.add(s.slice(0, 60));
	}
	const attr =
		/\s(?:label|placeholder|title)=("|')([^"']*[A-Za-z]{2,}[^"']*)\1/g;
	while ((m = attr.exec(t))) {
		const val = m[2].trim();
		if (/^i-[a-z]/.test(val) || IGNORE_TEXT.has(val.toLowerCase()))
			continue;
		hits.add(`${val.slice(0, 40)} (attr)`);
	}
	return [...hits];
}

const vueFiles = [
	...walkVue("components"),
	...walkVue("pages"),
	...walkVue("layouts"),
];
for (const f of vueFiles) {
	const rel = f.split(path.sep).join("/");
	if (IGNORE_FILE_PREFIXES.some((p) => rel.startsWith(p))) continue;
	const v = rawTextViolations(f);
	if (v.length && !LEGACY_I18N_ALLOWLIST.has(rel))
		problems.push(
			`Hardcoded string(s) in ${rel} — wrap in $t(): ${v
				.slice(0, 3)
				.map((s) => JSON.stringify(s))
				.join(", ")}${v.length > 3 ? ` (+${v.length - 3} more)` : ""}`
		);
}
// Ratchet: a grandfathered file that is now clean (or gone) must be removed
// from the allowlist — that's how the list shrinks to zero.
for (const rel of LEGACY_I18N_ALLOWLIST) {
	if (!fs.existsSync(rel))
		problems.push(`Stale i18n allowlist entry (file gone): ${rel}`);
	else if (rawTextViolations(rel).length === 0)
		problems.push(
			`${rel} is now i18n-clean — remove it from LEGACY_I18N_ALLOWLIST in scripts/i18n-check.js (task #11).`
		);
}

if (problems.length) {
	console.error(`\n✖ i18n check failed — ${problems.length} problem(s):\n`);
	for (const p of problems) console.error("  • " + p);
	console.error(
		"\nFix: add the key to BOTH i18n/locales/en.json and es.json (no empty values).\n"
	);
	process.exit(1);
}
console.log(
	`✓ i18n check passed — en/es parity, no empty values, all $t() keys defined, no new hardcoded strings (${LEGACY_I18N_ALLOWLIST.size} legacy files still grandfathered — task #11).`
);
