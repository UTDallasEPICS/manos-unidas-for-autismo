import { therapyTypes } from "~/composables/therapy/therapyData";

/**
 * Localized display labels for the fixed set of therapy types.
 *
 * The canonical keys (LEARNING_THERAPY, …) live in `therapyData` and are what
 * gets stored on `TherapyNoteType.therapyType` (a note may have several, one
 * row each); this maps them to translated strings for display. The `t()`
 * lookups live here (a .ts module) rather than inline in templates so the
 * i18n extractor never sees a dynamic key — the locale entries under
 * `therapyTypes.*` are referenced only through this helper.
 */
export function useTherapyTypes() {
	const { t } = useI18n();

	function therapyTypeLabel(key: string | null | undefined): string {
		if (!key) return "";
		const translationKey = `therapyTypes.${key}`;
		const translated = t(translationKey);
		// Fall back to the English label (or the raw key) for any value not in
		// the locale files — e.g. a legacy or unknown therapy type.
		if (translated === translationKey) return therapyTypes[key] ?? key;
		return translated;
	}

	const therapyTypeOptions = computed(() =>
		Object.keys(therapyTypes).map((value) => ({
			label: therapyTypeLabel(value),
			value,
		}))
	);

	function therapyTypeLabels(keys: string[] | null | undefined): string {
		if (!keys?.length) return "";
		return keys.map(therapyTypeLabel).join(", ");
	}

	/**
	 * TherapyDrilldown namespaces each objective checkbox's value as
	 * `${therapyType}::${label}` so the same objective label under two
	 * selected therapies doesn't collide. Strip that prefix back off for
	 * display (e.g. in the per-objective details textareas).
	 */
	function objectiveLabel(key: string): string {
		return key.includes("::") ? key.split("::").slice(1).join("::") : key;
	}

	return {
		therapyTypeLabel,
		therapyTypeLabels,
		therapyTypeOptions,
		objectiveLabel,
	};
}
