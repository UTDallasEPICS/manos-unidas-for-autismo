import { PrismaClient } from "@prisma/client";

const prisma: PrismaClient = new PrismaClient();

const postCodes = [
	{ postCode: 216646, city: "Casal da Serra" },
	{ postCode: 4730938, city: "Casais" },
	{ postCode: 3515, city: "Los Angeles" },
	{ postCode: 8110, city: "Birganj" },
	{ postCode: 44729, city: "Bella Vista" },
	{ postCode: 10009, city: "Wanghu" },
];

const createPostCodes = async () => {
	await prisma.postCodeCity.createMany({ data: postCodes });
};

const therapistSpecializations = [
	"Learning",
	"Social Habilitation",
	"Conductual",
	"Interventional",
	"Language",
	"Occupational",
	"Independent Living",
];

const specializationIds = [];

const createSpecializations = async () => {
	for (const specialization of therapistSpecializations) {
		const { id } = await prisma.specialization.create({
			data: { name: specialization },
		});
		specializationIds.push(id);
	}
};

// users
const admin = [
	// admin
	{
		fName: "Admin",
		mInit: null,
		lName: "Account",
		email: "admin@email.com",
		phone: "184-286-0857",
		whatsApp: "Rubus hispidus L.",
		contactPref: "EMAIL",
		type: "ADMIN",
	},
	{
		fName: "Mahmud",
		mInit: null,
		lName: "Jenk",
		email: "mjenk0@sohu.com",
		phone: "137-422-0073",
		whatsApp: "Crassocephalum Moench",
		contactPref: "EMAIL",
		type: "ADMIN",
	},
	{
		fName: "User-Support",
		mInit: null,
		lName: "Account",
		email: "user-support@email.com",
		phone: "269-679-2852",
		whatsApp: "Brassica septiceps (L.H. Bailey) L.H. Bailey",
		contactPref: "EMAIL",
		type: "USER_SUPPORT",
	},
	{
		fName: "Brigit",
		mInit: "T",
		lName: "Marini",
		email: "bmarini1@ask.com",
		phone: "589-539-2321",
		whatsApp: "Multiclavula R. Petersen",
		contactPref: "EMAIL",
		type: "USER_SUPPORT",
	},
];
const therapists = [
	// therapists
	{
		user: {
			fName: "Therapist",
			mInit: null,
			lName: "Account",
			email: "therapist@email.com",
			phone: "364-107-4495",
			whatsApp: "Succisella inflexa (Kluk) G. Beck",
			contactPref: "EMAIL",
			type: "THERAPIST",
		},
		specializations: [0],
	},
	{
		user: {
			fName: "Brion",
			mInit: "G",
			lName: "Rannald",
			email: "brannald2@fda.gov",
			phone: "463-106-7220",
			whatsApp: "Hedyotis centranthoides (Hook. & Arn.) Steud",
			contactPref: "EMAIL",
			type: "THERAPIST",
		},
		specializations: [0, 1, 2, 6],
	},
	{
		user: {
			fName: "Bradly",
			mInit: "L",
			lName: "Worsall",
			email: "bworsall3@desdev.cn",
			phone: "737-349-1010",
			whatsApp: "Carex geophila Mack",
			contactPref: "PHONE",
			type: "THERAPIST",
		},
		specializations: [1, 3, 4],
	},
	{
		user: {
			fName: "Wilma",
			mInit: "P",
			lName: "Tincombe",
			email: "wtincombe4@yellowpages.com",
			phone: "807-471-3913",
			whatsApp:
				"Cistanthe parryi (A. Gray) Hershkovitz var. arizonica (J.T. Howell) Kartesz & Gandhi",
			contactPref: "EMAIL",
			type: "THERAPIST",
		},
		specializations: [2, 5],
	},
];
const patients = [
	// patients
	{
		user: {
			fName: "Patient",
			mInit: null,
			lName: "Account",
			email: "patient@email.com",
			phone: "386-206-4302",
			whatsApp: "Epidendrum anceps Jacq.",
			contactPref: "EMAIL",
			type: null,
		},
		nonEmployee: {
			dob: new Date("1/1/2001"),
			gender: "MALE",
			streetName: "Test",
			streetNum: 1,
			postCode: 216646,
		},
		patient: { identification: "1", diagnosed: false },
	},
	{
		user: {
			fName: "Dael",
			mInit: "P",
			lName: "Laverack",
			email: "dlaverack5@wikispaces.com",
			phone: "592-851-9415",
			whatsApp: "Cuphea strigulosa Kunth",
			contactPref: "EMAIL",
			type: null,
		},
		nonEmployee: {
			dob: new Date("1/22/2000"),
			gender: "MALE",
			streetName: "Starling",
			streetNum: 77658,
			buildingNum: 83,
			postCode: 216646,
		},
		patient: { identification: "1618594370", diagnosed: false },
	},
	{
		user: {
			fName: "Aileen",
			mInit: "J",
			lName: "Naylor",
			email: "anaylor6@newyorker.com",
			phone: "204-370-9127",
			whatsApp: "Astragalus vexilliflexus Sheldon var. nubilus Barneby",
			contactPref: "EMAIL",
			type: null,
		},
		nonEmployee: {
			dob: new Date("2/26/1986"),
			gender: "FEMALE",
			streetName: "Westend",
			streetNum: 8153,
			postCode: 4730938,
		},
		patient: { identification: "5619609928", diagnosed: true },
	},
	{
		user: {
			fName: "Dmitri",
			mInit: "F",
			lName: "Cymper",
			email: "dcymper7@who.int",
			phone: "349-939-8262",
			whatsApp: "Berberis thunbergii DC",
			contactPref: "WHATS_APP",
			type: null,
		},
		nonEmployee: {
			dob: new Date("11/21/2004"),
			gender: "FEMALE",
			streetName: "Kingsford",
			streetNum: 90863,
			postCode: 10009,
		},
		patient: { identification: "9079266183", diagnosed: false },
	},
	{
		user: {
			fName: "Basilio",
			mInit: null,
			lName: "Yashin",
			email: "byashin8@theguardian.com",
			phone: "396-472-9734",
			whatsApp: "Buddleja madagascariensis Lam",
			contactPref: "EMAIL",
			type: null,
		},
		nonEmployee: {
			dob: new Date("5/3/2002"),
			gender: "MALE",
			streetName: "Scott",
			streetNum: 6483,
			buildingNum: 271,
			postCode: 8110,
		},
		patient: { identification: "8539270684", diagnosed: false },
	},
	{
		user: {
			fName: "Lida",
			mInit: "G",
			lName: "MacPhaden",
			email: "lmacphaden9@nature.com",
			phone: "327-979-8308",
			whatsApp: "Lippia micromera Schauer",
			contactPref: "WHATS_APP",
			type: null,
		},
		nonEmployee: {
			dob: new Date("8/11/2001"),
			gender: "OTHER",
			streetName: "Scott",
			streetNum: 6483,
			buildingNum: 271,
			postCode: 8110,
		},
		patient: { identification: "6866733243", diagnosed: true },
	},
	{
		user: {
			fName: "Scotti",
			mInit: "I",
			lName: "Rattery",
			email: "srattery0@diigo.com",
			phone: "114-668-4037",
			whatsApp: "Hiptage Gaertn., nom. cons.",
			contactPref: "PHONE",
			type: null,
		},
		nonEmployee: {
			dob: new Date("6/15/2005"),
			gender: "OTHER",
			streetName: "Lane",
			streetNum: 98210,
			postCode: 44729,
		},
		patient: { identification: "9842987243", diagnosed: true },
	},
];
const parents = [
	// parents
	{
		user: {
			fName: "Parent",
			mInit: null,
			lName: "Account",
			email: "parent@email.com",
			phone: "513-608-6374",
			whatsApp: "Krascheninnikovia lanata (Pursh) A. Meeuse & Smit",
			contactPref: "WHATS_APP",
			type: null,
		},
		nonEmployee: {
			dob: new Date("2/2/2002"),
			gender: "MALE",
			streetName: "test",
			streetNum: 1,
			postCode: 216646,
		},
	},
	{
		user: {
			fName: "Willdon",
			mInit: "J",
			lName: "Budding",
			email: "wbuddinga@sina.com.cn",
			phone: "817-102-6185",
			whatsApp: "Lespedeza ×manniana Mack. & Bush (pro sp.)",
			contactPref: "WHATS_APP",
			type: null,
		},
		nonEmployee: {
			dob: new Date("3/1/1999"),
			gender: "MALE",
			streetName: "Starling",
			streetNum: 77658,
			buildingNum: 83,
			postCode: 216646,
		},
	},
	{
		user: {
			fName: "Ann-marie",
			mInit: "Q",
			lName: "Deek",
			email: "adeekb@illinois.edu",
			phone: "962-872-2209",
			whatsApp: "Ocimum canum Sims",
			contactPref: "PHONE",
			type: null,
		},
		nonEmployee: {
			dob: new Date("6/25/1986"),
			gender: "FEMALE",
			streetName: "Scott",
			streetNum: 6483,
			buildingNum: 271,
			postCode: 8110,
		},
	},
	{
		user: {
			fName: "Lorinda",
			mInit: "H",
			lName: "Showering",
			email: "lshoweringc@amazon.com",
			phone: "659-888-7155",
			whatsApp:
				"Descurainia pinnata (Walter) Britton ssp. paysonii Detling",
			contactPref: "EMAIL",
			type: null,
		},
		nonEmployee: {
			dob: new Date("4/3/1985"),
			gender: "OTHER",
			streetName: "Kingsford",
			streetNum: 90863,
			postCode: 10009,
		},
	},
];

const therapistIds = [];
const patientIds = [];

const createUsers = async () => {
	for (const user of admin) {
		await prisma.user.create({ data: user });
	}
	for (const user of therapists) {
		const { id } = await prisma.user.create({ data: user.user });

		therapistIds.push(id);

		// add list of specializations
		for (const specialization of user.specializations) {
			await prisma.user.update({
				where: { id: id },
				data: {
					Specializations: {
						connect: { id: specializationIds[specialization] },
					},
				},
			});
		}
	}
	for (const user of patients) {
		const { id } = await prisma.user.create({ data: user.user });

		patientIds.push(id);

		user.nonEmployee.id = id;
		await prisma.nonEmployee.create({ data: user.nonEmployee });
		user.patient.id = id;
		await prisma.patient.create({ data: user.patient });
	}
	for (const user of parents) {
		const { id } = await prisma.user.create({ data: user.user });
		user.nonEmployee.id = id;
		await prisma.nonEmployee.create({ data: user.nonEmployee });

		// add every patient with the same address as a child
		const children = await prisma.patient.findMany({
			where: {
				User: {
					streetName: user.nonEmployee.streetName,
					streetNum: user.nonEmployee.streetNum,
					buildingNum: user.nonEmployee.buildingNum,
				},
			},
		});
		for (const child of children) {
			await prisma.patient.update({
				where: { id: child.id },
				data: { Parents: { connect: { id: id } } },
			});
		}
	}
};

// currently only creates one sponsor
//  but set up to make an abitrary amount
const sponsors = [
	{
		data: {
			name: "Patient Sponsor One",
			contact: "is this a phone number? email?",
		},
		patientIds: [2],
	},
];

const createSponsors = async () => {
	for (const sponsor of sponsors) {
		const { id } = await prisma.sponsor.create({ data: sponsor.data });
		for (let patientId of sponsor.patientIds) {
			patientId = patientIds[patientId];
			await prisma.patient.update({
				where: { id: patientId },
				data: { sponsorId: id },
			});
		}
	}
};

const contactForms = [
	{
		nationality: "American",
		returnPatient: false,
		wantsEval: false,
		insurance: "SENASA_CONTRIBUTIVO",
		comment: "Sibling to Basilio.",
		status: "SCHEDULING",
		patientId: 4,
	},
	{
		nationality: "American",
		returnPatient: false,
		wantsEval: true,
		insurance: "SENASA_CONTRIBUTIVO",
		comment: "",
		status: "COMPLETED",
		patientId: 3,
	},
	{
		nationality: "Canadian",
		returnPatient: true,
		wantsEval: false,
		insurance: "MAPFRE",
		comment: "",
		status: "PROCESSING",
		patientId: 5,
	},
];

const createContactForms = async () => {
	for (const form of contactForms) {
		form.patientId = patientIds[form.patientId];
		await prisma.contactForm.create({ data: form });
	}
};

const medicalRecords = [
	{ data: "Diagnosis", patientId: 1 },
	{ data: "Diagnosis", patientId: 4 },
	{ data: "Diagnosis", patientId: 5 },
	{ data: "Record a", patientId: 0 },
	{ data: "Record b", patientId: 1 },
	{ data: "Record c", patientId: 2 },
	{ data: "Record d", patientId: 3 },
	{ data: "Record e", patientId: 4 },
	{ data: "Record f", patientId: 5 },
	{
		data: "These should probably be images, or in some way more detailed, but that's a pretty low priority",
		patientId: 5,
	},
];

const createMedicalRecords = async () => {
	for (const record of medicalRecords) {
		record.patientId = patientIds[record.patientId];
		await prisma.medicalRecord.create({ data: record });
	}
};

const reports = [
	{ patientId: 0 },
	{ date: new Date("1/1/2025"), patientId: 1 },
	{ date: new Date("2/1/2025"), patientId: 1 },
	{ date: new Date("3/1/2025"), patientId: 1 },
	{ patientId: 1 },
	{ patientId: 2 },
	{ date: new Date("10/15/2024"), patientId: 3 },
	{ date: new Date("11/15/2024"), patientId: 3 },
	{ date: new Date("12/15/2024"), patientId: 3 },
	{ date: new Date("1/15/2025"), patientId: 3 },
	{ date: new Date("2/15/2025"), patientId: 3 },
	{ date: new Date("3/15/2025"), patientId: 3 },
	{ patientId: 3 },
	{ patientId: 4 },
];

const reportIds = [];

const createReports = async () => {
	for (const report of reports) {
		report.patientId = patientIds[report.patientId];
		const { id } = await prisma.report.create({ data: report });
		reportIds.push(id);
	}
};

const reportQuestions = [
	{
		reportId: 0,
		question: "How long does this take to run?",
		answer: "It takes about 115ms in my terminal.",
	},
	{ reportId: 0, question: "Question a", answer: "Answer enum" },
	{
		reportId: 0,
		question: "How was this data generated?",
		answer: "I tried to use Mockaroo, but I mostly ended up just having to do it farm to table.",
	},
	{ reportId: 1, question: "Question b", answer: "Answer Ok()" },
	{
		reportId: 2,
		question: "Write some text?",
		answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
	},
	{ reportId: 3, question: "Question a", answer: "Answer error" },
	{ reportId: 4, question: "ABC?", answer: "ZYX.." },
	{
		reportId: 4,
		question: "Why are the what's app entries so strange?",
		answer: "Mockaroo didn't have anything close, and I thought the plant names would be shorter.",
	},
	{
		reportId: 4,
		question: "The cheese?",
		answer: "The cheese melts in the, cheese melts in the, cheese melts in the, cheese melts in the, cheese melts in the, cheese melts in the, Sibelius.",
	},
	{
		reportId: 4,
		question: "Are you bored?",
		answer: "Yes, so I'm finishing this while watching very important people.",
	},
	{ reportId: 4, question: "Question a", answer: "Answer 404" },
	{ reportId: 5, question: "Question b", answer: "Answer 505" },
	{ reportId: 6, question: "Question c", answer: "Answer 8" },
	{
		reportId: 7,
		question: "Anything left to do?",
		answer: "I think I need to check a couple more DB constraints.",
	},
	{ reportId: 7, question: "Question ", answer: "Answer b" },
	{ reportId: 8, question: "What day is it?", answer: "2025/03/20" },
	{ reportId: 9, question: "Question a", answer: "Answer i palindrome i" },
	{ reportId: 9, question: "Question d", answer: "Answer answer" },
	{ reportId: 9, question: "Question e", answer: "Answer recursion" },
	{ reportId: 10, question: "Question c", answer: "Answer another question" },
	{ reportId: 10, question: "Question f", answer: "Answer yes?" },
	{ reportId: 11, question: "Question a", answer: "Answer no" },
	{ reportId: 12, question: "Question l", answer: "Answer yes" },
	{ reportId: 13, question: "Question nan", answer: "Answer -2" },
	{ reportId: 13, question: "Question nin", answer: "Answer 14" },
	{ reportId: 13, question: "Question nil", answer: "Answer 9" },
	{ reportId: 13, question: "Question null", answer: "Answer 3" },
];

const createReportData = async () => {
	for (const question of reportQuestions) {
		question.reportId = reportIds[question.reportId];
		await prisma.reportData.create({ data: question });
	}
};

const sessionTypes = [
	{ name: "Entrevista inicial", color: "BLUE" },
	{ name: "Cita de evaluación", color: "GREEN" },
	{ name: "Aplicación de pruebas diagnósticas", color: "GREEN" },
	{ name: "Entrega de informe de pruebas diagnósticas", color: "ORANGE" },
	{ name: "Evaluación de Programa terapéutico", color: "PURPLE" },
	{ name: "Terapias recurrentes", color: "RED" },
	{ name: "Consulta psicológica", color: "TEAL" },
	{ name: "Consulta Sexualidad para Jóvenes con TEA", color: "YELLOW" },
	{ name: "Other", color: "TEAL" },
	{ name: "IT", color: "GREEN" },
];

const sessionTypeIds = [];

const createSessionTypes = async () => {
	for (const sessionType of sessionTypes) {
		const { id } = await prisma.sessionType.create({ data: sessionType });
		sessionTypeIds.push(id);
	}
};

const sessions = [
	{
		time: new Date("2/28/2025"),
		duration: 50,
		maxAttendance: 5,
		typeId: 0,
		therapistId: 0,
	},
	{
		time: new Date("3/15/2025"),
		duration: 15,
		comment: "This is a session comment.",
		maxAttendance: 7,
		typeId: 1,
		therapistId: 1,
	},
	{
		time: new Date("3/15/2025"),
		duration: 30,
		comment: "This is a large group session.",
		maxAttendance: 16,
		typeId: 1,
		therapistId: 2,
	},
	{
		time: new Date("3/20/2025"),
		duration: 90,
		maxAttendance: 4,
		typeId: 2,
		therapistId: 0,
	},
	{
		time: new Date("3/20/2025"),
		duration: 75,
		maxAttendance: 9,
		typeId: 4,
		therapistId: 1,
	},
	{
		time: new Date("3/20/2025"),
		duration: 30,
		maxAttendance: 12,
		typeId: 5,
		therapistId: 2,
	},
	{
		time: new Date("3/21/2025"),
		duration: 60,
		maxAttendance: 2,
		typeId: 6,
		therapistId: 0,
	},
	{
		time: new Date("3/21/2025"),
		duration: 60,
		maxAttendance: 1,
		typeId: 7,
		therapistId: 1,
	},
	{
		time: new Date("3/21/2025"),
		duration: 60,
		maxAttendance: 1,
		typeId: 8,
		therapistId: 2,
	},
	{
		time: new Date("3/22/2025"),
		duration: 60,
		maxAttendance: 5,
		typeId: 1,
		therapistId: 0,
	},
	{
		duration: 30,
		comment: "This session was rescheduled.",
		maxAttendance: 1,
		typeId: 3,
		therapistId: 0,
	},
	{ duration: 30, maxAttendance: 6, typeId: 3, therapistId: 1 },
	{ duration: 120, maxAttendance: 8, typeId: 6, therapistId: 2 },
];

const sessionIds = [];

const createSessions = async () => {
	for (const session of sessions) {
		session.typeId = sessionTypeIds[session.typeId];
		session.therapistId = therapistIds[session.therapistId];
		const { id } = await prisma.session.create({ data: session });
		sessionIds.push(id);
	}
};

const sessionPatients = [
	{ sessionId: 0, patientId: 0, paid: true },
	{ sessionId: 1, patientId: 0, paid: true },
	{ sessionId: 2, patientId: 0, paid: true },
	{ sessionId: 3, patientId: 0, paid: true },
	{ sessionId: 4, patientId: 0, paid: true },
	{ sessionId: 5, patientId: 0, paid: true },
	{ sessionId: 6, patientId: 0, paid: true },
	{ sessionId: 7, patientId: 0, paid: true },
	{ sessionId: 8, patientId: 0, paid: true },
	{ sessionId: 9, patientId: 0, paid: true },
	{ sessionId: 10, patientId: 0, paid: true },
	{ sessionId: 11, patientId: 0, paid: true },
	{ sessionId: 12, patientId: 0, paid: true },
	{ sessionId: 2, patientId: 1, paid: true },
	{ sessionId: 2, patientId: 2, paid: true },
	{ sessionId: 2, patientId: 3, paid: true },
	{ sessionId: 2, patientId: 4, paid: true },
	{ sessionId: 5, patientId: 2, paid: true },
	{ sessionId: 5, patientId: 3, paid: true },
	{ sessionId: 11, patientId: 3, paid: true },
	{ sessionId: 12, patientId: 3, paid: true },
];

const createSessionPatients = async () => {
	for (const sessionPatient of sessionPatients) {
		sessionPatient.sessionId = sessionIds[sessionPatient.sessionId];
		sessionPatient.patientId = patientIds[sessionPatient.patientId];
		await prisma.sessionPatient.create({ data: sessionPatient });
	}
};

const main = async () => {
	await createPostCodes();
	await createSpecializations();
	await createUsers();
	await createSponsors();
	await createContactForms();
	await createReports();
	await createReportData();
	await createMedicalRecords();
	await createSessionTypes();
	await createSessions();
	await createSessionPatients();
};

main().catch((err) => {
	console.warn("Error while generating seed: \n", err);
});
