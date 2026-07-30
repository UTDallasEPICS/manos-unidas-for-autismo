// Deny-by-default guarantee, enforced at build time.
//
// The runtime tripwire (server/plugins/authTripwire.ts) only runs after the
// handler, so it is defense-in-depth. THIS check is the real backstop: it fails
// the build if any server/api endpoint is not wrapped in defineAuthedHandler, so
// a forgotten wrapper can never ship.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = "server/api";
// Better Auth's catch-all handles its own authorization.
const EXEMPT = [join("auth", "[...all].ts")];

function walk(dir) {
	const out = [];
	for (const name of readdirSync(dir)) {
		const p = join(dir, name);
		if (statSync(p).isDirectory()) out.push(...walk(p));
		else if (p.endsWith(".ts")) out.push(p);
	}
	return out;
}

const offenders = walk(ROOT).filter((file) => {
	if (EXEMPT.some((e) => file.endsWith(e))) return false;
	return !readFileSync(file, "utf8").includes("defineAuthedHandler");
});

if (offenders.length) {
	console.error(
		"\n✖ deny-by-default check failed — these endpoints are not wrapped " +
			"in defineAuthedHandler:\n" +
			offenders.map((f) => "   " + f).join("\n") +
			"\n\nEvery server/api endpoint must make an explicit access decision.\n"
	);
	process.exit(1);
}

console.log(
	"✓ deny-by-default: all server/api endpoints wrapped in defineAuthedHandler"
);
