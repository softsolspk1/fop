import { PrismaClient, EnrollmentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10);
  
  console.log('--- Starting University Database Seeding (Master) ---');

  // 1. Seed Departments
  const depts = [
    { name: 'Department of Pharmaceutical Chemistry' },
    { name: 'Department of Pharmaceutics' },
    { name: 'Department of Pharmacognosy' },
    { name: 'Department of Pharmacology' },
    { name: 'Department of Pharmacy Practice' },
  ];

  for (const d of depts) {
    await prisma.department.upsert({
      where: { name: d.name },
      update: {},
      create: d
    });
  }
  
  const chemDept = await prisma.department.findUnique({ where: { name: 'Department of Pharmaceutical Chemistry' } });
  const ceuticsDept = await prisma.department.findUnique({ where: { name: 'Department of Pharmaceutics' } });
  const cognosyDept = await prisma.department.findUnique({ where: { name: 'Department of Pharmacognosy' } });
  const pharmaDept = await prisma.department.findUnique({ where: { name: 'Department of Pharmacology' } });
  const practiceDept = await prisma.department.findUnique({ where: { name: 'Department of Pharmacy Practice' } });

  const DEPT_MAP: Record<string, string | undefined> = {
    PHC: chemDept?.id,
    PHT: ceuticsDept?.id,
    PHG: cognosyDept?.id,
    PHL: pharmaDept?.id,
    PHP: practiceDept?.id,
  };

  // 2. Seed All Faculty and Roles
  const facultyMembers = [
    // Core Demo Accounts
    { email: 'vc@uok.edu.pk', name: 'Vice Chancellor (Main Admin)', role: 'MAIN_ADMIN', departmentId: undefined },
    { email: 'dean@uok.edu.pk', name: 'Dean (Super Admin)', role: 'SUPER_ADMIN', departmentId: undefined },
    { email: 'office@uok.edu.pk', name: 'Dean Office (Sub-Admin)', role: 'SUB_ADMIN', departmentId: undefined },
    { email: 'student@uok.edu.pk', name: 'Demo Student', role: 'STUDENT', departmentId: pharmaDept?.id, year: "Second" },

    // Pharmaceutics
    { name: "Prof. Dr. Syed Muhammad Farid Hasan", email: "smfhassan@uok.edu.pk", departmentId: ceuticsDept?.id, role: "HOD" },
    { name: "Prof. Dr. Rabia Ismail Yousuf", email: "riyousuf@uok.edu.pk", departmentId: ceuticsDept?.id, role: "FACULTY" },
    { name: "Prof. Dr. Iyad Naeem Muhammad", email: "iyadnaeem@uok.edu.pk", departmentId: ceuticsDept?.id, role: "FACULTY" },
    { name: "Prof. Dr. Rabia Bushra", email: "rabia.bushra@uok.edu.pk", departmentId: ceuticsDept?.id, role: "FACULTY" },
    { name: "Dr. Farya Zafar", email: "farya.zafar@uok.edu.pk", departmentId: ceuticsDept?.id, role: "FACULTY" },
    { name: "Dr. Sabahat Jabeen", email: "sajabeen@uok.edu.pk", departmentId: ceuticsDept?.id, role: "FACULTY" },
    { name: "Ms. Rehana Saeed", email: "rehana@uok.edu.pk", departmentId: ceuticsDept?.id, role: "FACULTY" },
    { name: "Dr. Faaiza Qazi", email: "fqazi@uok.edu.pk", departmentId: ceuticsDept?.id, role: "FACULTY" },
    { name: "Dr. Farrukh Rafiq Ahmed", email: "farruhk.ahmed@uok.edu.pk", departmentId: ceuticsDept?.id, role: "FACULTY" },
    { name: "Dr. Kamran Ahmed", email: "kamran.ahmed@uok.edu.pk", departmentId: ceuticsDept?.id, role: "FACULTY" },
    { name: "Dr. Sadaf Farooqi", email: "Sadaf.farooqi@uok.edu.pk", departmentId: ceuticsDept?.id, role: "FACULTY" },
    { name: "Dr. Tazeen Hussain", email: "tznhusain@uok.edu.pk", departmentId: ceuticsDept?.id, role: "FACULTY" },

    // Pharmaceutical Chemistry
    { name: "Prof. Dr. Asia Naz Awan", email: "asia.naz@uok.edu.pk", departmentId: chemDept?.id, role: "HOD" },
    { name: "Prof. Dr. Nousheen Mushtaq", email: "nmushtaq@uok.edu.pk", departmentId: chemDept?.id, role: "FACULTY" },
    { name: "Prof. Dr. Sohail Hassan", email: "shassan@uok.edu.pk", departmentId: chemDept?.id, role: "FACULTY" },
    { name: "Prof. Dr. Safila Naveed", email: "safila.sharif@uok.edu.pk", departmentId: chemDept?.id, role: "FACULTY" },
    { name: "Dr. Shazia Haider", email: "shazia.haider@uok.edu.pk", departmentId: chemDept?.id, role: "FACULTY" },
    { name: "Dr. Rubina Siddiqui", email: "rsiddiqui@uok.edu.pk", departmentId: chemDept?.id, role: "FACULTY" },
    { name: "Dr. Urooj Nazim", email: "urooj.nazim@uok.edu.pk", departmentId: chemDept?.id, role: "FACULTY" },

    // Pharmacology
    { name: "Dr. Azra Riaz", email: "azra.wasif@uok.edu.pk", departmentId: pharmaDept?.id, role: "HOD" },
    { name: "Prof. Dr. Syeda Afroz", email: "safroz@uok.edu.pk", departmentId: pharmaDept?.id, role: "FACULTY" },
    { name: "Prof. Dr. Afshan Siddiq", email: "afshan@uok.edu.pk", departmentId: pharmaDept?.id, role: "FACULTY" },
    { name: "Dr. Saira Saeed Khan", email: "saira.khan@uok.edu.pk", departmentId: pharmaDept?.id, role: "FACULTY" },
    { name: "Dr. Shadab Ahmed", email: "a_shadab@uok.edu.pk", departmentId: pharmaDept?.id, role: "FACULTY" },
    { name: "Dr. Sadia Ghousia Baig", email: "sgbaig@uok.edu.pk", departmentId: pharmaDept?.id, role: "FACULTY" },
    { name: "Dr. Nuzhat Sultana", email: "nuzhat.sultana@uok.edu.pk", departmentId: pharmaDept?.id, role: "FACULTY" },
    { name: "Dr. Sana Sarfaraz", email: "ssarfaraz@uok.edu.pk", departmentId: pharmaDept?.id, role: "FACULTY" },
    { name: "Dr. Adnan Iqbal", email: "adnaniqbal@uok.edu.pk", departmentId: pharmaDept?.id, role: "FACULTY" },

    // Pharmacognosy
    { name: "Prof. Dr. Muhammad Mohtasheem ul Hasan", email: "mohassan@uok.edu.pk", departmentId: cognosyDept?.id, role: "HOD" },
    { name: "Prof. Dr. Huma Sharif", email: "huma.shareef@uok.edu.pk", departmentId: cognosyDept?.id, role: "FACULTY" },
    { name: "Dr. Maryam Ahmed", email: "maryamahmed@uok.edu.pk", departmentId: cognosyDept?.id, role: "FACULTY" },
    { name: "Ms. Farah Mazhar", email: "famazhar@uok.edu.pk", departmentId: cognosyDept?.id, role: "FACULTY" },
    { name: "Dr. Salman Ahmed", email: "salmanahmed@uok.edu.pk", departmentId: cognosyDept?.id, role: "FACULTY" },
    { name: "Dr. Safia Abidi", email: "safiaabidi@uok.edu.pk", departmentId: cognosyDept?.id, role: "FACULTY" },
  ];

  for (const u of facultyMembers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { password: hashedPassword, role: u.role as any, status: EnrollmentStatus.APPROVED, departmentId: u.departmentId },
      create: { 
        email: u.email,
        name: u.name,
        password: hashedPassword,
        role: u.role as any,
        status: EnrollmentStatus.APPROVED,
        departmentId: u.departmentId,
        year: (u as any).year
       }
    });
    console.log(`Seeded user: ${u.email} (${u.role})`);
  }

  // 3. Seed Master Courses (First to Fifth Professional)
  const teacher = await (prisma.user as any).findFirst({ where: { role: 'FACULTY' } });
  
  const coursesToSeed = [
    // FIRST Professional
    { code: "PHT-301", name: "Physical Pharmacy - I", creditHours: "3", professional: "First", semesterName: "1st Semester", contents: "Introduction to Pharmacy and History: orientation with latest applications, survey from ancient Greek/Arab periods, contribution of Muslim scientists, Industrial Revolution, 20th and 21st century developments (Biotechnology, Nanotechnology, AI). Pharmaceutical Literature: scientific literature types, official texts and compendia. Physico-Chemical Principles: solutions, solubility, solubilization, dissolution, permeation, polymorphism. Ionization and Buffers. Micromeritics: particle size distribution, morphological characteristics, methods of analysis, flow properties." },
    { code: "PHT-303", name: "Physical Pharmacy (Lab) - I", creditHours: "1", professional: "First", semesterName: "1st Semester", contents: "Concepts of Physicochemical Principles. Preparation of Solutions, Dilutions, and Standard Curve. Concentration expressions (Molarity, Normality, Percentage). Solubility determination techniques. Buffer solutions and pH meter calibration. Characterization of powders (particle size, Carr’s Index, Hausner’s ratio, angle of repose)." },
    { code: "PHC-305", name: "Organic Chemistry - I", creditHours: "3", professional: "First", semesterName: "1st Semester", contents: "Basic concepts: Chemical Bonding, Hybridization, Resonance, Hyperconjugation, Aromaticity, Electronegativity, Dipole Moment, Tautomerism. Synthesis, structure, and applications of alkanes, alkenes, alkynes, phenols, ethers, amines, ketones, aldehydes, carboxylic acids, esters, amides, and aromatic compounds. Organic Reactions Mechanism: Oxidation, Reduction, Substitution (SN1, SN2), Elimination, Addition, Rearrangement. Stereochemistry: Optical Isomerism, Chirality, Geometrical Isomerism (cis/trans, E/Z), Fischer and Sawhorse Projections." },
    { code: "PHC-307", name: "Organic Chemistry (Lab) - I", creditHours: "1", professional: "First", semesterName: "1st Semester", contents: "Good laboratory practice, handling of materials, introduction to lab apparatus. Functional group identification (carboxylic acids, phenol, aldehydes, ketones, amines, nitro group, alcohol). Synthesis of derivatives (esters, amides, salts, etc.). Determination of melting and boiling points. Purification via recrystallization. Identification of various organic compounds." },
    { code: "PHC-309", name: "Biochemistry - I", creditHours: "2", professional: "First", semesterName: "1st Semester", contents: "General introduction to Pharmaceutical Biochemistry. Biochemistry of Carbohydrates: classification, isomerism, metabolism (glycolysis, pentose phosphate pathway, citric acid cycle), metabolic disorders. Bioenergetics: Electron transport chain, oxidative phosphorylation, reactive oxygen species. Biochemistry of Lipids: classification, digestion, absorption, metabolism (beta-oxidation, biosynthesis), metabolic disorders. Biochemistry of Vitamins: classification, structures, metabolic functions, deficiencies. Biochemistry of Hormones: classification, pharmaceutical importance." },
    { code: "PHC-311", name: "Biochemistry (Lab) - I", creditHours: "1", professional: "First", semesterName: "1st Semester", contents: "General introduction. Qualitative and Quantitative analysis of Carbohydrates (monosaccharides, disaccharides, reducing sugars) using common tests (Molisch, Benedict, Fehling, etc.). Analysis of lipids and Sterols (Cholesterol), Bile salts, Bilirubin. Analysis of Glucose, Cholesterol, and Creatinine in Blood." },
    { code: "PHL-313", name: "Physiology - I", creditHours: "3", professional: "First", semesterName: "1st Semester", contents: "Basic Cell Functions: structure, fluid balance, cell cycle, apoptosis, transport mechanisms. Muscle Physiology: skeletal muscle fibers, contraction mechanisms, neuromuscular junction. Circulation: blood vessels, blood pressure regulation, arterial pressure, baroreceptor reflex, renin-angiotensin system. The Heart: anatomy, cardiac cycle, conduction system, ECG patterns, clinical significance. The Blood Cells: erythropoiesis, hemoglobin, white blood cells, types of T-cells, B-cells, platelets, blood coagulation, blood types. Digestion and Absorption of Food. Temperature Regulation and pathophysiology of fever." },
    { code: "PHL-315", name: "Physiology (Lab) - I", creditHours: "1", professional: "First", semesterName: "1st Semester", contents: "Measurement of blood pressure and heart rate. Venous blood sampling and injection techniques. Body mass index (BMI) calculation. Peristaltic activity in rabbit jejunum. Visual acuity and field of vision. Abnormal ECG pattern identification. Effects of isotonic/hypotonic solutions on red blood cells." },
    { code: "PHG-317", name: "Functional English", creditHours: "3", professional: "First", semesterName: "1st Semester", contents: "Reading and Writing Skills: previewing, scanning essays, informational texts, process model for writing (prompts, proposals), CV and job application letters. Oral Interaction Skills: articulation, English accent, informational speeches, academic presentations, group discussions, decision-making templates. Vocabulary Skills: prefixes, suffixes, roots, derivation, academic word list. Grammar Skills: identifying grammatical terms, simple sentence types, tenses (past, present, future)." },
    { code: "PHT-302", name: "Physical Pharmacy - II", creditHours: "3", professional: "First", semesterName: "2nd Semester", contents: "Surface and Interfacial Phenomena: surface tension, surfactants, micellization. Adsorption mechanisms and isotherms. Disperse Systems: Colloids, Emulsions (theories of emulsification), Suspensions (suspending agents, stability). Rheology: fluid flow behaviors, Newtonian/non-Newtonian liquids, thixotropy, rheopexy. Stability Studies in Pharmacy. Unit Operations: Precipitation, crystallization, evaporation, distillation, lyophilization, centrifugation, trituration, dialysis." },
    { code: "PHT-304", name: "Physical Pharmacy (Lab) - II", creditHours: "1", professional: "First", semesterName: "2nd Semester", contents: "Chemical Kinetics: effect of temperature on stability, reaction rate constants, expiry date determination. Interfacial Phenomena: Critical Micelle Concentration (CMC) determination, flocculation volume analysis. Rheology: viscosity determination, rheogram plotting, stability of suspensions." },
    { code: "PHC-306", name: "Organic Chemistry - II", creditHours: "3", professional: "First", semesterName: "2nd Semester", contents: "Heterocyclic Chemistry: medicinally important compounds (pyrrole, furan, thiophene, pyridine, pyrimidine, pyrazine, indole, quinoline), imidazole, purine/pyrimidine bases. Reaction Mechanisms and Intermediates: Carbocations, Carbanions, Carbenes, Nitrenes, Benzynes, Free Radicals. Named reactions (Baeyer-Villiger, Diels Alder, Grignard, Friedel Craft, Perkin, etc.). Advanced Organic Chemistry: Total Synthesis, Semi Synthesis, Green Chemistry." },
    { code: "PHC-308", name: "Organic Chemistry (Lab) - II", creditHours: "1", professional: "First", semesterName: "2nd Semester", contents: "Identification of organic compounds (Oxalic acid, salicylic acid, etc.). Synthesis of salicylic acid, Nifedipine, paracetamol, etc. Green Metallurgy methodology. Synthesis of Aspirin, Acetanilide, Iodoform. Elimination and Substitution reactions." },
    { code: "PHC-310", name: "Biochemistry - II", creditHours: "2", professional: "First", semesterName: "2nd Semester", contents: "Proteins and Amino acids: classification, digestion, absorption, metabolism, urea cycle, biosynthesis of heme. Biochemistry of Nucleic Acids: bases, gene therapy, diagnostics, vaccines, nanotechnology. Biochemistry of Enzymes: classification, inhibition, activation, drug-enzyme interactions. Secondary Messengers: cAMP, Calcium ions. Clinical Biochemistry: lab tests for diagnosis (uric acid, cholesterol, etc.)." },
    { code: "PHC-312", name: "Biochemistry (Lab) - II", creditHours: "1", professional: "First", semesterName: "2nd Semester", contents: "Analysis of Proteins (Biuret/Ninhydrin). Analysis of normal and abnormal Urine components. Estimation of Blood Urea Nitrogen, Serum Bilirubin, Calcium, Uric Acid, etc. Liver and Kidney Function Tests." },
    { code: "PHL-314", name: "Anatomy and Histology", creditHours: "2", professional: "First", semesterName: "2nd Semester", contents: "Thoracic region: skeletal, respiratory, and cardiovascular structures. Abdominal organs and related systems. Urinary system, limbs, and nervous system (spinal cord, brain, cranial nerves). Histological techniques and pharmacological relevance." },
    { code: "PHL-316", name: "Anatomy and Histology (Lab)", creditHours: "1", professional: "First", semesterName: "2nd Semester", contents: "Anatomoical study of thoracic and abdominal organs using models. Urinary and reproductive system anatomy. Upper and lower limb bone/joint analysis. Brain/spinal cord structure identification. Tissue Fixation and micro-anatomy." },
    { code: "PHL-318", name: "Physiology - II", creditHours: "3", professional: "First", semesterName: "2nd Semester", contents: "Nervous system control: neurons, action potentials, synapse function, neurotransmitters, central and autonomic systems. Respiratory system: gas exchange, lung volumes/capacities. Kidney function: urine formation, fluid/electrolyte balance. Reproductive systems: gamete formation, menstrual cycle." },
    { code: "PHL-320", name: "Physiology (Lab) - II", creditHours: "1", professional: "First", semesterName: "2nd Semester", contents: "Hematological tests: hemoglobin, ESR, RBC counting, coagulation time. AB0/Rh blood grouping. Respiratory parameters: tidal volume, inspiratory reserve, pulmonary function. Nebulization techniques and CPR. Vector control strategies. Heart/lung sound identification." },
    { code: "PHL-322", name: "Islamic Studies", creditHours: "2", professional: "First", semesterName: "2nd Semester", contents: "Need for religion and role of Wahi. Islamic concept of life and Universe. Islamic Beliefs (Aqaid): Tawhid, angels, prophethood, revealed books, Hereafter. Worship practices (Ibadat): Salat, Zakat, Sawm, Hajj. Ideology of Pakistan: historical movements, Constitution of 1973. Islamic moral values." },

    // SECOND Professional
    { code: "PHT-401", name: "Pharmaceutics-Pharmaceutical Dosage Forms-II", creditHours: "3", professional: "Second", semesterName: "1st Semester", contents: "Purpose of dosage forms, pre-formulation studies, Solid Dosage Forms (Powders, Tablets, Capsules), Basic Principles of Compounding, Pharmaceutical Incompatibilities." },
    { code: "PHT-403", name: "Pharmaceutics - Microbiology- I", creditHours: "3", professional: "Second", semesterName: "1st Semester", contents: "General introduction, functional anatomy of bacteria, microbial techniques, environmental microbiology, human-microbiome interactions, diseases caused by microorganisms." },
    { code: "PHC-405", name: "Pharmaceutical Chemistry-Physical-I", creditHours: "3", professional: "Second", semesterName: "1st Semester", contents: "Surface and Interfacial Phenomena, Adsorption, Disperse Systems (Colloids, Emulsions, Suspensions), Rheology, Stability studies." },
    { code: "PHL-407", name: "Pharmacology- Physiology & Histology (Practical)", creditHours: "3", professional: "Second", semesterName: "1st Semester", contents: "Experiments on Blood Pressure, Heart Rate measurement. Body Mass Index (BMI). ECG patterns. Peristaltic activity. Visual acuity." },
    { code: "PHL-409", name: "Pharmacology-Pharmacology & Therapeutics", creditHours: "3", professional: "Second", semesterName: "1st Semester" },
    { code: "PHG-411", name: "Pharmacognosy- Herbal Quality Control Lab-I (Practical)", creditHours: "3", professional: "Second", semesterName: "1st Semester" },
    { code: "PHL-413", name: "Pharmacology-Pathology", creditHours: "2", professional: "Second", semesterName: "1st Semester" },
    { code: "PHT-402", name: "Pharmaceutics-Pharmaceutical Dosage Forms (Lab)", creditHours: "3", professional: "Second", semesterName: "2nd Semester" },
    { code: "PHT-404", name: "Pharmaceutics-Microbiology-II", creditHours: "3", professional: "Second", semesterName: "2nd Semester" },
    { code: "PHC-406", name: "Pharmaceutical Chemistry-Physical-I (Practical)", creditHours: "2", professional: "Second", semesterName: "2nd Semester" },
    { code: "PHC-408", name: "Pharmaceutical Chemistry- Physical-II", creditHours: "3", professional: "Second", semesterName: "2nd Semester" },
    { code: "PHL-410", name: "Pharmacology-Systemic Pharmacology - I", creditHours: "3", professional: "Second", semesterName: "2nd Semester", contents: "Pharmacology of drugs acting on Autonomic Nervous System, Cardiovascular System, Renal system." },
    { code: "PHG-412", name: "Pharmacognosy-Chemical Pharmacognosy-I", creditHours: "3", professional: "Second", semesterName: "2nd Semester", contents: "Introduction to Pharmacognosy, Historical development, Scope. Quality control of crude drugs. General methods of extraction and isolation." },
    { code: "PHT-414", name: "Pharmaceutics-Physical Pharmacy", creditHours: "3", professional: "Second", semesterName: "2nd Semester" },

    // THIRD Professional
    { code: "PHT-501", name: "Pharmaceutics – Pharmaceutical Microbiology (Lab.)", creditHours: "3", professional: "Third", semesterName: "1st Semester" },
    { code: "PHC-503", name: "Pharmaceutical Chemistry- Physical-II (Practical)", creditHours: "3", professional: "Third", semesterName: "1st Semester" },
    { code: "PHC-505", name: "Pharmaceutical Chemistry- Quality Control", creditHours: "3", professional: "Third", semesterName: "1st Semester" },
    { code: "PHL-507", name: "Pharmacology- Systemic Pharmacology - II", creditHours: "3", professional: "Third", semesterName: "1st Semester" },
    { code: "PHL-509", name: "Pharmacology - Pathology (Practical)", creditHours: "2", professional: "Third", semesterName: "1st Semester" },
    { code: "PHG-511", name: "Pharmacognosy - Chemical Pharmacognosy- II", creditHours: "3", professional: "Third", semesterName: "1st Semester" },
    { code: "PHT-513", name: "Pharmaceutics - Computer Application in Pharmacy", creditHours: "2", professional: "Third", semesterName: "1st Semester" },
    { code: "PHT-502", name: "Pharmaceutics - Physical Pharmacy (Lab)", creditHours: "3", professional: "Third", semesterName: "2nd Semester", contents: "Experiments to demonstrate some of physico-chemical processes, like simple distillation, steam distillation, crystallization, Dialysis. Determination of emulsion systems. Practicals based on rheological and structural character of emulsions stabilized by mixed films of emulsifier. Determination of particle size, angle of repose of powders. Preparation of buffer solutions and isotonic solution. Determination of percentage composition of solutions by specific gravity method. Partition-coefficient, surface tensions, viscosity. Determination of various pH by acidic and alkaline buffers. Drug stability experiments, preparation of stock solution (dilution method). Determination of critical micelle concentration (CMC) of surface-active agents. Flocculation and deflocculation of Kaolin Suspensions." },
    { code: "PHT-504", name: "Pharmaceutics - Industrial Pharmacy- I (Unit Operations)", creditHours: "3", professional: "Third", semesterName: "2nd Semester", contents: "Mixing Fundamentals, mechanism. Mixing equipment used in liquid/liquid, liquid/solid and solid/solid mixing. Comminution (size reduction), Reasons for size reduction. Factors affecting size reduction, size analysis. Sieving, energy mills (Ball mill, edrunner, edge runner mill disintegrant, colloid mill, hammer mill, cutter mill, fluid energy mill etc.)." },
    { code: "PHC-506", name: "Pharmaceutical Chemistry- Prep/Q.C. (Practical)", creditHours: "3", professional: "Third", semesterName: "2nd Semester" },
    { code: "PHC-508", name: "Pharmaceutical Chemistry- Pharmaceutical Analysis- I", creditHours: "3", professional: "Third", semesterName: "2nd Semester" },
    { code: "PHL-510", name: "Pharmacology- Pharmacology (Practical)", creditHours: "3", professional: "Third", semesterName: "2nd Semester" },
    { code: "PHG-512", name: "Pharmacognosy- Herbal Quality Control Lab -II (Practical)", creditHours: "3", professional: "Third", semesterName: "2nd Semester" },
    { code: "PHG-514", name: "Pharmacognosy - Natural Toxins", creditHours: "2", professional: "Third", semesterName: "2nd Semester" },

    // FOURTH Professional
    { code: "PHP-601", name: "Pharmacy Practice - I", creditHours: "3", professional: "Fourth", semesterName: "1st Semester", contents: "Hospital and Its Organization: Brief history of hospital, Classification of hospitals, Minimum requirements for registering a hospitals, Organizational structure, Administration, Clinical departments, Nursing, dietetic, pathology, blood bank, radiology and other supportive services, Hospital finances. Role of Pharmacy in Hospitals, Role of Pharmacist in Small Hospitals, Nursing Homes etc. Minimum Standards for Hospital Pharmacies as per ASHP: Pharmacy, its organization and personnel, The Physical plant and its equipment, Pharmacy specialist, Drug information centre, Poison control centre and antidote bank, Pharmacy education, CEs and CMEs, internship program, clerkship, etc. Professional services rendered, The Pharmacy: central sterile supply room (eye drops, ear drops) and hyper alimentation. Nuclear pharmacy, Investigational use of drugs, Health accessories, ancillary supplies and surgical supplies. Dispensing to Inpatients: Methods of dispensing and SOP’s, Unit dose dispensing, Other concepts of dispensing, satellite pharmacy etc. 200 Contact Hours Hospital Pharmacy Internship in a Tertiary Care General Hospital Covering the Clinical Units." },
    { code: "PHT-603", name: "Pharmaceutics - Industrial Pharmacy - II - Pharmaceutical Engineering", creditHours: "3", professional: "Fourth", semesterName: "1st Semester" },
    { code: "PHT-605", name: "Pharmaceutics - Industrial Pharmacy (Lab)", creditHours: "3", professional: "Fourth", semesterName: "1st Semester" },
    { code: "PHC-607", name: "Pharma. Chemistry- Pharmaceutical Analysis- I (Practical)", creditHours: "3", professional: "Fourth", semesterName: "1st Semester" },
    { code: "PHL-609", name: "Pharmacology- Systemic Pharmacology - III", creditHours: "3", professional: "Fourth", semesterName: "1st Semester" },
    { code: "PHG-611", name: "Pharmacognosy - Advance Pharmacognosy", creditHours: "3", professional: "Fourth", semesterName: "1st Semester" },
    { code: "PHT-613", name: "Pharmaceutics- Pharmaceutical Technology", creditHours: "3", professional: "Fourth", semesterName: "1st Semester", contents: "Barriers to Drug Delivery Systems (DDS): Oral, IV, IM, Rectal, Pulmonary DDS. Reticulo-endothelial system. Principles of Non-Targeting/Conventional Pharmaceutical Formulations and Dosage Form Design: Need, product formulation and preformulation studies. Formulation development of Aerosols, Opthalmic and Parentral Preparations. Formulation development of Osmotic, Sustained-Release, Rapidly Disintegrating, Gastro-retentive drug delivery systems. Concept of Targeting DDS: Active vs. Passive Targeting. Targeting Strategies (Environment and stimuli sensitive targeting: pH, temperature, ions, photo, magnetic, ultrasound, etc. Regulated systems: enzyme complex etc. Ligand based targeting: Polymeric conjugates, biomacromolecular conjugates like antibody, affibody, aptamer and peptides etc.). Introduction and Types of Various Dosage Forms and DDS: Nanoparticles, nanospheres, dendrimers, nanohydrogels, liposomes, niosomes, gold and iron oxide nanoparticles. Brief over view of theragnostic systems. Principles of Formulation of Novel Drug Delivery Systems: Introduction and brief overview of biomedical polymers, their physical and structure-property relationship. Examples of bio-responsive and stimuli responsive polymers. Overview of methods to formulate polymeric nanoparticles, dendrimers, liposomes, niosomes, hydrogels and gold nanoparticles etc. Selection of ligands for delivery system with examples to targeting substrates. Formulation stability issues associated with novel DDS. Characterization Techniques for Novel DDS: Spectrophotometric (FT-IR, HPLC, UV, Fluorescence-spectroscopy, NMR etc.). Particles size characterization (SEM, TEM, DLS, Size-exclusion chromatography etc.). Crystalline Structure (XRD etc.). Miscellaneous techniques (AFM, Raman-spectroscopy etc.). Pharmacokinetic and Pharmacological Aspects of Novel DDS: Clearance and in-vivo stability of novel DDS. Concept and strategies of designing long-circulating DDS. Drug and Disease Candidates for Novel DDS: Principles of selection of a disease. Principles of selection of drug(s) candidates for a disease." },
    { code: "PHP-602", name: "Pharmacy Practice-II", creditHours: "3", professional: "Fourth", semesterName: "2nd Semester" },
    { code: "PHT-604", name: "Pharmaceutics – Biopharmaceutics and Pharmacokinetics (I)", creditHours: "3", professional: "Fourth", semesterName: "2nd Semester" },
    { code: "PHT-606", name: "Pharmaceutics - Clinical Pharmacokinetics", creditHours: "3", professional: "Fourth", semesterName: "2nd Semester", contents: "Compartment Models: One compartment model. Two compartment models. Three compartment models. Non-compartmental models. Biological Half-life in Vitamin. Clearance, Elevation. Protein Bounding. Multiple dosage. Application of Pharmacokinetics in Clinical Situation. Application in Dosage Sites. Bioavailability and bioequivalence testing. Pharmacokinetics of intravenous infusion." },
    { code: "PHC-608", name: "Pharmaceutical Chemistry - Pharmaceutical Analysis-II", creditHours: "3", professional: "Fourth", semesterName: "2nd Semester" },
    { code: "PHC-610", name: "Pharmaceutical Chemistry- Medicinal- I", creditHours: "3", professional: "Fourth", semesterName: "2nd Semester" },
    { code: "PHL-612", name: "Pharmacology - Pharmacology Lab-II", creditHours: "3", professional: "Fourth", semesterName: "2nd Semester" },
    { code: "PHT-614", name: "Pharmaceutics - Pharmaceutical Technology (Lab)", creditHours: "3", professional: "Fourth", semesterName: "2nd Semester", contents: "To prepare matrix tablet of drugs by single-punch machine. Preparation of matrix tablet for less water-soluble drug. Preparation of matrix tablet for highly water-soluble drug. Perform dissolution testing by USP method I and II. Formulation of 2 Model Drugs (highly soluble and less soluble) in Nano particles/Micro particles. To prepare polymeric Nano/Micro particles by single / double emulsion / nanoprecipitation method(s). Hydrophilic drugs by double emulsion method. Hydrophobic drugs by single emulsion method. Hydrophobic drugs by nanoprecipitation method. To visualize the nano/microparticles under stereromicroscope. To perform the release testing of 2 model drugs from nanoparticles stirring method (UV-visible spectroscopy). To prepare the oral formulation of drugs by extrusion/spheronization method. Matrix based pellets. Coated pellets (perform coating). Pellitization to form immediate release, controlled/extended release and enteric coated pellets." },

    // FIFTH Professional
    { code: "PHT-701", name: "Pharmaceutics - Biopharmaceutics & Pharmacokinetics (Lab)", creditHours: "3", professional: "Fifth", semesterName: "1st Semester" },
    { code: "PHT-703", name: "Pharmaceutics - Forensic Pharmacy", creditHours: "3", professional: "Fifth", semesterName: "1st Semester" },
    { code: "PHP-705", name: "Pharmacy Practice – III", creditHours: "3", professional: "Fifth", semesterName: "1st Semester" },
    { code: "PHC-707", name: "Pharmaceutical Chemistry- Pharmaceutical Analysis- II (Practical)", creditHours: "3", professional: "Fifth", semesterName: "1st Semester", contents: "Assay of pharmaceutical compounds based on spectrophotometric methods. Separation, identification and quantitation of a drug substance by chromatographic methods such as TLC, GLC, HPLC. To study the methods development procedure of a drug substance by UV-Visible spectroscopy/TLC/GLC/HPLC. To study the experimental methodology of validation of a drug substance by UV-Visible spectroscopy/TLC/GLC/HPLC." },
    { code: "PHC-709", name: "Pharmaceutical Chemistry- Medicinal- II", creditHours: "3", professional: "Fifth", semesterName: "1st Semester", contents: "To study the chemistry, structure, mechanism of action, structure activity relationship and therapeutic applications of the following: Analgesic and Antipyretics: Paracetamol, salicylic acid analogues, quinolines derivatives pyrazalone and pyrazolidines, N-aryl anthranilic acids, aryl and heteroaryl acetic acid derivatives. Local Anesthetics: Benzoic acid derivatives, lidocaine derivatives (anilids), amino benzoic acid, miscellaneous compounds such as: Procaine, lignocaine, eucaine, cocaine and benzocaine." },
    { code: "PHL-711", name: "Pharmacology - Clinical Pharmacology", creditHours: "2", professional: "Fifth", semesterName: "1st Semester" },
    { code: "PHG-713", name: "Pharmacognosy - Clinical Pharmacognosy", creditHours: "2", professional: "Fifth", semesterName: "1st Semester" },
    { code: "PHT-702", name: "Pharmaceutics - Prescription & Community Pharmacy", creditHours: "3", professional: "Fifth", semesterName: "2nd Semester" },
    { code: "PHT-704", name: "Pharmaceutics - Pharma. Management & Marketing", creditHours: "3", professional: "Fifth", semesterName: "2nd Semester" },
    { code: "PHT-706", name: "Pharmaceutics - Prescription Pharmacy (Lab)", creditHours: "3", professional: "Fifth", semesterName: "2nd Semester" },
    { code: "PHT-708", name: "Pharmaceutics - Pharmaceutical Quality Management", creditHours: "3", professional: "Fifth", semesterName: "2nd Semester" },
    { code: "PHC-710", name: "Pharmaceutical Chemistry - Medicinal- III", creditHours: "3", professional: "Fifth", semesterName: "2nd Semester" },
    { code: "PHL-712", name: "Pharmacology – Toxicology", creditHours: "2", professional: "Fifth", semesterName: "2nd Semester" },
    { code: "PHP-714", name: "Pharmacy Practice – IV", creditHours: "3", professional: "Fifth", semesterName: "2nd Semester", contents: "Pharmacotherapy of Drugs Used in: CVS Unit (covering IHD, hypertension etc.). Pulmonary Unit (asthma, COPD, pneumonia etc.). Infection Unit (bacterial, fungal and viral infections). Endocrinology Unit (DM, hyper / hypothyroidism etc.). Nephrology Unit (renal failures etc.). Hematology Unit (bleeding disorders, coagulopathies). Manufacturing Bulk and Sterile: Total parenteral nutrition (TPN)." }
  ];

  for (const c of coursesToSeed) {
    const prefix = c.code.split('-')[0];
    const deptId = DEPT_MAP[prefix];
    if (deptId) {
      await prisma.course.upsert({
        where: { code: c.code },
        update: { name: c.name, creditHours: c.creditHours, professional: c.professional, semesterName: c.semesterName, departmentId: deptId },
        create: {
          code: c.code,
          name: c.name,
          creditHours: c.creditHours,
          professional: c.professional,
          semesterName: c.semesterName,
          contents: (c as any).contents,
          departmentId: deptId,
          teacherId: teacher?.id || 'default'
        }
      });
    }
  }

  console.log('--- Master Seeding Completed Successfully ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
