import { therapyTypes } from "~/composables/therapy/therapyData";

/**
 * Localized display labels for the fixed set of therapy types.
 *
 * The canonical keys (LEARNING_THERAPY, …) live in `therapyData` and are what
 * gets stored on `TherapyNote.therapyType`; this maps them to translated
 * strings for display. The `t()` lookups live here (a .ts module) rather than
 * inline in templates so the i18n extractor never sees a dynamic key — the
 * locale entries under `therapyTypes.*` are referenced only through this helper.
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

	return { therapyTypeLabel, therapyTypeOptions };
}
