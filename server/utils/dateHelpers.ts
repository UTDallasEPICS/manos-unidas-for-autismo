export function computeAge(dob: Date): number {
	return Math.floor((Date.now() - dob.getTime()) / 1000 / 60 / 60 / 24 / 365);
}

export function parseDateOrNull(value?: string | null): Date | null {
	if (!value) return null;
	const d = new Date(value);
	return isNaN(d.getTime()) ? null : d;
}
