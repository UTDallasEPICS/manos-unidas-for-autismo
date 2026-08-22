// Bilingual seed source for the TherapyType / TherapyObjective tables.
// EN structure migrated from the former composables/therapy/therapyData.ts;
// es-DO translations produced for FMUA (Dominican autism center).
//
// The combined "Behavioral Therapy & Early Intervention Therapy" type is split
// into two: BEHAVIORAL_THERAPY and EARLY_INTERVENTION. Both start with the same
// objectives (to be refined in-app later — see issue #304). The original
// BEHAVIORAL_EARLY key is kept as an inactive legacy type so historical
// TherapyNotes still resolve a label.

export type SeedObjectiveKind = "objective" | "header" | "subheader";
export interface SeedObjective {
	kind: SeedObjectiveKind;
	labelEn: string;
	labelEs: string;
}
export interface SeedTherapyType {
	key: string;
	labelEn: string;
	labelEs: string;
	order: number;
	active: boolean;
	objectives: SeedObjective[];
}

const o = (labelEn: string, labelEs: string): SeedObjective => ({
	kind: "objective",
	labelEn,
	labelEs,
});
const h = (labelEn: string, labelEs: string): SeedObjective => ({
	kind: "header",
	labelEn,
	labelEs,
});
const sh = (labelEn: string, labelEs: string): SeedObjective => ({
	kind: "subheader",
	labelEn,
	labelEs,
});

// Shared A–P "Basic Student Skills" block (appears in several therapies).
const basicStudentSkills: SeedObjective[] = [
	sh("Basic Student Skills", "Habilidades Básicas del Estudiante"),
	o(
		"A. Cooperation and Reinforcer Effectiveness",
		"A. Cooperación y Efectividad de los Reforzadores"
	),
	o("B. Visual Performance", "B. Desempeño Visual"),
	o("C. Receptive Language", "C. Lenguaje Receptivo"),
	o("D. Motor Imitation", "D. Imitación Motora"),
	o("E. Vocal Imitation", "E. Imitación Vocal"),
	o("F. Requests", "F. Peticiones"),
	o("G. Labeling", "G. Etiquetado (Denominación)"),
	o("H. Intraverbals", "H. Intraverbales"),
	o("I. Spontaneous Vocalizations", "I. Vocalizaciones Espontáneas"),
	o("J. Syntax and Grammar", "J. Sintaxis y Gramática"),
	o("K. Recess and Free Time", "K. Recreo y Tiempo Libre"),
	o("L. Social Interaction", "L. Interacción Social"),
	o("M. Group Instruction", "M. Instrucción en Grupo"),
	o("N. Following Classroom Routines", "N. Seguimiento de Rutinas del Aula"),
	o("P. Generalized Responses", "P. Respuestas Generalizadas"),
];
const academicSkills: SeedObjective[] = [
	sh("Academic Skills", "Habilidades Académicas"),
	o("Q. Reading Skills", "Q. Habilidades de Lectura"),
	o("R. Math Skills", "R. Habilidades de Matemáticas"),
	o("S. Writing Skills", "S. Habilidades de Escritura"),
	o("T. Spelling Skills", "T. Habilidades de Ortografía"),
];
const executiveFns: SeedObjective[] = [
	sh("Executive Functions", "Funciones Ejecutivas"),
	o("1. Working memory", "1. Memoria de trabajo"),
	o("2. Processing speed", "2. Velocidad de procesamiento"),
	o("3. Inhibitory control", "3. Control inhibitorio"),
	o("4. Cognitive flexibility", "4. Flexibilidad cognitiva"),
	o("5. Planning", "5. Planificación"),
];
const cognitiveSkills: SeedObjective[] = [
	sh("Cognitive Skills", "Habilidades Cognitivas"),
	o("1. Comprehension", "1. Comprensión"),
	o("2. Reasoning", "2. Razonamiento"),
	o("3. Attention", "3. Atención"),
	o("4. Problem-solving", "4. Resolución de problemas"),
];

// Objectives for the two split types (formerly BEHAVIORAL_EARLY).
const behavioralEarlyObjectives: SeedObjective[] = [
	...basicStudentSkills,
	...academicSkills,
	sh("Self-help Skills", "Habilidades de Autoayuda"),
	o("U. Dressing Skills", "U. Habilidades de Vestido"),
	o("V. Eating Skills", "V. Habilidades de Alimentación"),
	o("W. Personal Maintenance", "W. Cuidado Personal"),
	o(
		"X. Personal Hygiene and Toilet Training",
		"X. Higiene Personal y Control de Esfínteres"
	),
	sh("Motor Skills", "Habilidades Motoras"),
	o("Y. Gross Motor Skills", "Y. Motricidad Gruesa"),
	o("Z. Fine Motor Skills", "Z. Motricidad Fina"),
];

export const therapyTypeSeed: SeedTherapyType[] = [
	{
		key: "LEARNING_THERAPY",
		labelEn: "Learning Therapy",
		labelEs: "Terapia de Aprendizaje",
		order: 1,
		active: true,
		objectives: [
			h("From ABLLS", "Del ABLLS"),
			...basicStudentSkills,
			...academicSkills,
			...executiveFns,
			...cognitiveSkills,
			h("Other Areas", "Otras Áreas"),
			...executiveFns,
			...cognitiveSkills,
			sh("Others", "Otros"),
			o("Other(Specify)", "Otro (Especificar)"),
		],
	},
	{
		key: "BEHAVIORAL_THERAPY",
		labelEn: "Behavioral Therapy",
		labelEs: "Terapia Conductual",
		order: 2,
		active: true,
		objectives: behavioralEarlyObjectives,
	},
	{
		key: "EARLY_INTERVENTION",
		labelEn: "Early Intervention Therapy",
		labelEs: "Terapia de Intervención Temprana",
		order: 3,
		active: true,
		objectives: behavioralEarlyObjectives,
	},
	{
		key: "SPEECH_THERAPY",
		labelEn: "Speech Therapy",
		labelEs: "Terapia del Habla y Lenguaje",
		order: 4,
		active: true,
		objectives: [
			o("C. Receptive Language", "C. Lenguaje Receptivo"),
			o("E. Vocal Imitation", "E. Imitación Vocal"),
			o("F. Requests", "F. Peticiones"),
			o("G. Labeling", "G. Etiquetado (Denominación)"),
			o("H. Intraverbals", "H. Intraverbales"),
			o("I. Spontaneous Vocalizations", "I. Vocalizaciones Espontáneas"),
			o("J. Syntax and Grammar", "J. Sintaxis y Gramática"),
			o("L. Social Interaction", "L. Interacción Social"),
		],
	},
	{
		key: "SOCIAL_SKILLS",
		labelEn: "Social Skills Therapy",
		labelEs: "Terapia de Habilidades Sociales",
		order: 5,
		active: true,
		objectives: [
			sh("Program Modules:", "Módulos del Programa:"),
			o(
				"1. Development of Social Autonomy",
				"1. Desarrollo de la Autonomía Social"
			),
			o(
				"2. Understanding Bullying",
				"2. Comprensión del Acoso Escolar (Bullying)"
			),
			o(
				"3. Identifying Healthy Relationships",
				"3. Identificación de Relaciones Saludables"
			),
			o(
				"4. Setting Personal Boundaries",
				"4. Establecimiento de Límites Personales"
			),
		],
	},
	{
		key: "OCCUPATIONAL_THERAPY",
		labelEn: "Occupational Therapy",
		labelEs: "Terapia Ocupacional",
		order: 6,
		active: true,
		objectives: [
			h(
				"Occupational Therapy Objectives",
				"Objetivos de Terapia Ocupacional"
			),
			sh("1. Sensory Integration", "1. Integración Sensorial"),
			o(
				"Regulation of sensory responses (hyper- or hypo-reactivity)",
				"Regulación de las respuestas sensoriales (hiper o hiporreactividad)"
			),
			o(
				"Improving sensory modulation for functional participation",
				"Mejorar la modulación sensorial para la participación funcional"
			),
			sh("2. Gross and Fine Motor Skills", "2. Motricidad Gruesa y Fina"),
			o(
				"Motor coordination (balance, strength, motor planning)",
				"Coordinación motora (equilibrio, fuerza, planificación motora)"
			),
			o(
				"Manual precision and skills for play, writing, and daily activities",
				"Precisión manual y destrezas para el juego, la escritura y las actividades diarias"
			),
			sh(
				"3. Self-regulation Skills",
				"3. Habilidades de Autorregulación"
			),
			o(
				"Emotional management and adaptive behavior",
				"Manejo emocional y conducta adaptativa"
			),
			o(
				"Coping strategies for frustration and changes",
				"Estrategias de afrontamiento ante la frustración y los cambios"
			),
			sh(
				"4. Daily Living Skills (DLS)",
				"4. Actividades de la Vida Diaria (AVD)"
			),
			o(
				"Eating, dressing, hygiene, toileting",
				"Alimentación, vestido, higiene y uso del baño"
			),
			o(
				"Promoting independence in daily routines",
				"Fomentar la independencia en las rutinas diarias"
			),
			sh(
				"5. Functional Communication and Social Skills",
				"5. Comunicación Funcional y Habilidades Sociales"
			),
			o(
				"Supporting interaction with others (children, adults)",
				"Apoyar la interacción con los demás (niños, adultos)"
			),
			o(
				"Taking turns, eye contact, body language for communication",
				"Respetar turnos, contacto visual y lenguaje corporal para la comunicación"
			),
			sh("6. Play and Leisure", "6. Juego y Tiempo Libre"),
			o(
				"Participation in age-appropriate games",
				"Participación en juegos acordes a la edad"
			),
			o(
				"Development of symbolic, functional, and shared play",
				"Desarrollo del juego simbólico, funcional y compartido"
			),
			sh(
				"7. Cognitive and Attention Skills",
				"7. Habilidades Cognitivas y de Atención"
			),
			o(
				"Sustained attention, memory, problem-solving",
				"Atención sostenida, memoria y resolución de problemas"
			),
			o(
				"Transitioning between activities and following instructions",
				"Transición entre actividades y seguimiento de instrucciones"
			),
			sh(
				"8. Environmental Adaptation and Visual Supports",
				"8. Adaptación del Entorno y Apoyos Visuales"
			),
			o(
				"Using environmental adaptations and visual supports to enhance participation",
				"Uso de adaptaciones del entorno y apoyos visuales para favorecer la participación"
			),
		],
	},
	{
		key: "INDEPENDENT_LIVING",
		labelEn: "Independent Living Skills Training Program",
		labelEs:
			"Programa de Entrenamiento en Habilidades para la Vida Independiente",
		order: 7,
		active: true,
		objectives: [
			h(
				"Independent Living Skills Training Program",
				"Programa de Entrenamiento en Habilidades para la Vida Independiente"
			),
			sh("Autonomy Modules", "Módulos de Autonomía"),
			sh(
				"Introduction to the Autonomy Workshop",
				"Introducción al Taller de Autonomía"
			),
			o(
				"1. Meeting peers and creating rules for coexistence",
				"1. Conocer a los compañeros y crear normas de convivencia"
			),
			o(
				"2. Expressing personal information and workshop activities",
				"2. Expresar información personal y las actividades del taller"
			),
			o(
				"3. Understanding how and why to make choices (knowing one's rights)",
				"3. Comprender cómo y por qué tomar decisiones (conocer sus derechos)"
			),
			sh("Personal Hygiene Autonomy", "Autonomía en la Higiene Personal"),
			o(
				"1. Following a bathing routine (body hygiene)",
				"1. Seguir una rutina de baño (higiene corporal)"
			),
			o(
				"2. Brushing teeth (oral care)",
				"2. Cepillarse los dientes (higiene bucal)"
			),
			o(
				"3. Combing hair (hair care)",
				"3. Peinarse (cuidado del cabello)"
			),
			o(
				"4. Cleaning and trimming nails (nail care)",
				"4. Limpiarse y cortarse las uñas (cuidado de las uñas)"
			),
			o("5. Washing hands", "5. Lavarse las manos"),
			o(
				"6. Choosing and wearing clothes",
				"6. Escoger y ponerse la ropa"
			),
			o(
				"7. Using cutlery and tableware (meal autonomy and table manners)",
				"7. Usar los cubiertos y la vajilla (autonomía en las comidas y modales en la mesa)"
			),
			sh(
				"Home Tasks and Appliance Use Autonomy",
				"Autonomía en las Tareas del Hogar y el Uso de Electrodomésticos"
			),
			o("1. Tidying up bedroom", "1. Ordenar la habitación"),
			o(
				"2. Dusting areas and objects",
				"2. Sacudir el polvo de áreas y objetos"
			),
			o(
				"3. Sweeping and mopping floors",
				"3. Barrer y trapear los pisos"
			),
			o("4. Cleaning the bathroom", "4. Limpiar el baño"),
			o(
				"5. Safely using appliances",
				"5. Usar los electrodomésticos de forma segura"
			),
			o(
				"6. Setting and clearing the table",
				"6. Poner y recoger la mesa"
			),
			o("7. Dishwashing", "7. Fregar los platos"),
			o(
				"8. Using and cleaning the kitchen",
				"8. Usar y limpiar la cocina"
			),
			o(
				"9. Using and cleaning laundry appliances",
				"9. Usar y limpiar los electrodomésticos de lavandería"
			),
			sh("Money Use Autonomy", "Autonomía en el Uso del Dinero"),
			o(
				"1. Learning about money: production and distribution",
				"1. Aprender sobre el dinero: producción y distribución"
			),
			o(
				"2. Understanding the use of money",
				"2. Comprender el uso del dinero"
			),
			o(
				"3. Identifying and calculating bills and coins",
				"3. Identificar y calcular billetes y monedas"
			),
			o(
				"4. Using credit and debit cards",
				"4. Usar tarjetas de crédito y débito"
			),
			o(
				"5. Recognizing ATMs and simulating their use",
				"5. Reconocer los cajeros automáticos y simular su uso"
			),
			o("6. Making a simple purchase", "6. Realizar una compra sencilla"),
			sh(
				"Travel and Mobility Autonomy",
				"Autonomía en el Traslado y la Movilidad"
			),
			o("1. Identifying common places", "1. Identificar lugares comunes"),
			o(
				"2. Recognizing traffic signs",
				"2. Reconocer las señales de tránsito"
			),
			o(
				"3. Recognizing public and private transportation",
				"3. Reconocer el transporte público y privado"
			),
			o(
				"4. Learning about street safety",
				"4. Aprender sobre la seguridad en la calle"
			),
			sh(
				"Technology Use Autonomy",
				"Autonomía en el Uso de la Tecnología"
			),
			o(
				"1. Using the computer with assistance",
				"1. Usar la computadora con ayuda"
			),
			o(
				"2. Using the tablet with assistance",
				"2. Usar la tableta con ayuda"
			),
			o(
				"3. Using the cellphone with assistance",
				"3. Usar el celular con ayuda"
			),
			o(
				"4. Using the ATM with assistance",
				"4. Usar el cajero automático con ayuda"
			),
			h("Additional Modules", "Módulos Adicionales"),
			sh("Camping", "Campamento"),
			o(
				"1. Encourage coexistence and teamwork",
				"1. Fomentar la convivencia y el trabajo en equipo"
			),
			o(
				"2. Develop basic survival skills",
				"2. Desarrollar habilidades básicas de supervivencia"
			),
			o(
				"3. Connect with nature and the environment",
				"3. Conectar con la naturaleza y el medio ambiente"
			),
			o(
				"4. Improve self-esteem and autonomy",
				"4. Mejorar la autoestima y la autonomía"
			),
			o(
				"5. Promote fun and rest",
				"5. Promover la diversión y el descanso"
			),
			sh("Gardening", "Jardinería"),
			o(
				"1. Promote sustainability and recycling",
				"1. Promover la sostenibilidad y el reciclaje"
			),
			o(
				"2. Create a green and relaxing space",
				"2. Crear un espacio verde y relajante"
			),
			o(
				"3. Develop responsibility and care habits",
				"3. Desarrollar la responsabilidad y hábitos de cuidado"
			),
			sh("Crafts", "Manualidades"),
			o(
				"1. Develop manual skills and stimulate creativity",
				"1. Desarrollar destrezas manuales y estimular la creatividad"
			),
			o(
				"2. Foster patience and perseverance",
				"2. Fomentar la paciencia y la perseverancia"
			),
			o(
				"3. Encourage step-by-step project work",
				"3. Fomentar el trabajo en proyectos paso a paso"
			),
			o(
				"4. Build problem-solving capacity",
				"4. Desarrollar la capacidad de resolución de problemas"
			),
			o(
				"5. Promote teamwork skills",
				"5. Promover las habilidades de trabajo en equipo"
			),
			sh("Cooking", "Cocina"),
			o("1. Prepare daily meals", "1. Preparar las comidas del día"),
			h(
				"Occupational Therapy Skills Module",
				"Módulo de Habilidades de Terapia Ocupacional"
			),
			o(
				"1. Strengthen gross motor coordination",
				"1. Fortalecer la coordinación motora gruesa"
			),
			o("2. Promote fine motor skills", "2. Promover la motricidad fina"),
			o(
				"3. Encourage decision-making",
				"3. Fomentar la toma de decisiones"
			),
			o(
				"4. Stimulate problem-solving",
				"4. Estimular la resolución de problemas"
			),
			o(
				"5. Manage frustration and build resilience",
				"5. Manejar la frustración y desarrollar la resiliencia"
			),
			o(
				"6. Improve social interactions",
				"6. Mejorar las interacciones sociales"
			),
			h(
				"Arts, Movement & Communication Module",
				"Módulo de Arte, Movimiento y Comunicación"
			),
			sh("Arts", "Arte"),
			o(
				"1. Stimulate lateral thinking and creativity",
				"1. Estimular el pensamiento lateral y la creatividad"
			),
			o("2. Support self-regulation", "2. Apoyar la autorregulación"),
			o(
				"3. Express emotions and interests",
				"3. Expresar emociones e intereses"
			),
			o(
				"4. Develop visuomotor coordination",
				"4. Desarrollar la coordinación visomotora"
			),
			o("5. Practice waiting", "5. Practicar la espera"),
			o("6. Interpret reality", "6. Interpretar la realidad"),
			o(
				"7. Encourage attentive observation",
				"7. Fomentar la observación atenta"
			),
			o(
				"8. Improve attention to detail",
				"8. Mejorar la atención a los detalles"
			),
			o(
				"9. Develop fine motor skills",
				"9. Desarrollar la motricidad fina"
			),
			o(
				"10. Stimulate problem-solving",
				"10. Estimular la resolución de problemas"
			),
			sh("Communication", "Comunicación"),
			o("1. Encourage oral expression", "1. Fomentar la expresión oral"),
			o(
				"2. Show feelings and express emotions appropriately",
				"2. Mostrar sentimientos y expresar emociones de forma adecuada"
			),
			o("3. Express interests", "3. Expresar intereses"),
			o(
				"4. Stimulate social interactions",
				"4. Estimular las interacciones sociales"
			),
			o(
				"5. Vocalization, projection, rhythm, imitation",
				"5. Vocalización, proyección, ritmo, imitación"
			),
			o("6. Encourage reading", "6. Fomentar la lectura"),
			o("7. Practice diction", "7. Practicar la dicción"),
			o("8. Promote teamwork", "8. Promover el trabajo en equipo"),
			o("9. Stimulate imitation", "9. Estimular la imitación"),
			sh("Movement", "Movimiento"),
			o(
				"1. Increase body awareness and flexibility",
				"1. Aumentar la conciencia corporal y la flexibilidad"
			),
			o(
				"2. Coordinate with others in group activities",
				"2. Coordinarse con los demás en actividades grupales"
			),
			o("3. Stimulate imitation", "3. Estimular la imitación"),
			o("4. Move with awareness", "4. Moverse con conciencia"),
			o("5. Foster attention", "5. Fomentar la atención"),
			o(
				"6. Develop gross motor skills",
				"6. Desarrollar la motricidad gruesa"
			),
		],
	},
	{
		// Legacy combined type — kept inactive so historical TherapyNotes that
		// stored therapyType = "BEHAVIORAL_EARLY" still resolve a label. Not
		// shown in the drilldown. See issue #304.
		key: "BEHAVIORAL_EARLY",
		labelEn: "Behavioral Therapy & Early Intervention Therapy",
		labelEs: "Terapia Conductual y Terapia de Intervención Temprana",
		order: 99,
		active: false,
		objectives: [],
	},
];
