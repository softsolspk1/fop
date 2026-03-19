import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding Virtual Lab Experiments for Pharmaceuticals ---');

  const labs = [
    {
      title: 'Drug Dissolution Test',
      description: 'Study the rate of drug release from tablet dosage forms using USP Dissolution Apparatus.',
      department: 'Pharmaceutics',
      provider: 'UOK Virtual Lab',
      difficulty: 'Intermediate',
      theory: 'Dissolution is the process by which a solid substance enters into a solvent to yield a solution. The rate of dissolution is critical for drug absorption.',
      objectives: 'To determine the percentage of drug release over time and understand the effect of RPM and tablet type.',
      safety: 'Wear lab coat and gloves. Handle dissolution media carefully.',
      year: 3
    },
    {
      title: 'Tablet Formulation & Granulation',
      description: 'Simulate the process of wet and dry granulation to produce pharmaceutical tablets.',
      department: 'Pharmaceutics',
      provider: 'UOK Virtual Lab',
      difficulty: 'Advanced',
      theory: 'Granulation is the process of collecting particles together by creating bonds between them. Bonds are formed by compression or by using a binding agent.',
      objectives: 'Evaluate the effect of binder and disintegrant concentration on tablet hardness and disintegration.',
      safety: 'Ensure proper handling of API and excipients. Use mask to avoid inhalation of dust.',
      year: 4
    },
    {
      title: 'Emulsion Preparation & Stability',
      description: 'Prepare oil-in-water and water-in-oil emulsions and evaluate their stability.',
      department: 'Pharmaceutics',
      provider: 'UOK Virtual Lab',
      difficulty: 'Beginner',
      theory: 'An emulsion is a system consisting of two immiscible liquid phases, one of which is dispersed as globules in the other.',
      objectives: 'Identify the type of emulsion and determine the stability score based on mixing speed and emulsifier.',
      safety: 'Avoid contact with eyes. Dispose of oily waste properly.',
      year: 2
    },
    {
      title: 'Tablet Assay by Titration',
      description: 'Determine the percentage purity of Aspirin tablets using acid-base back titration.',
      department: 'Pharmaceutical Chemistry',
      provider: 'PharmaSimuleX',
      difficulty: 'Intermediate',
      theory: 'Aspirin is hydrolyzed by excess NaOH. The unreacted NaOH is titrated with HCl to determine the aspirin content.',
      objectives: '1. Perform back titration. 2. Calculate percentage purity. 3. Understand neutralization reactions.',
      safety: 'Wear gloves and eye protection. Sodium Hydroxide is corrosive. Hydrochloric acid is an irritant.'
    },
    {
      title: 'UV-Visible Spectrophotometry',
      description: 'Analyze the concentration of Paracetamol in a solution using the Beer-Lambert Law.',
      department: 'Pharmaceutical Chemistry',
      provider: 'SpectraLab',
      difficulty: 'Beginner',
      theory: 'Absorbance (A) = εbc. The concentration of a substance is directly proportional to its absorbance at a specific wavelength.',
      objectives: '1. Prepare standard curve. 2. Measure absorbance at λmax (243nm). 3. Calculate unknown concentration.',
      safety: 'Handle glassware with care. Dispose of chemical waste according to lab guidelines.'
    },
    {
      title: 'HPLC Purity Analysis',
      description: 'Identify and quantify components in a multi-drug mixture using High Performance Liquid Chromatography.',
      department: 'Pharmaceutical Chemistry',
      provider: 'Chromatix VR',
      difficulty: 'Advanced',
      theory: 'Separation occurs due to differential distribution between mobile and stationary phases. Peak area is proportional to concentration.',
      objectives: '1. Interpret chromatograms. 2. Calculate Retention Time (Rt). 3. Determine peak area integration.',
      safety: 'Handle organic solvents in the fume hood. Avoid inhalation of vapors.'
    },
    {
      title: 'Organ Bath (Isolated Ileum)',
      description: 'Study the dose-response relationship of Acetylcholine (ACh) and the antagonistic effect of Atropine on isolated Rabbit Ileum.',
      department: 'Pharmacology',
      provider: 'BioSim VR',
      difficulty: 'Advanced',
      theory: 'Graded dose-response curves help determine ED50. Competitive antagonists like Atropine shift the curve to the right.',
      objectives: '1. Record tissue contractions. 2. Plot Log Dose-Response curves. 3. Observe competitive antagonism.',
      safety: 'Simulated environment. No biological waste.'
    },
    {
      title: 'Microbial Limit Test (MLT)',
      description: 'Screen pharmaceutical preparations for the presence of specified pathogens like E. coli and S. aureus.',
      department: 'Pharmaceutics',
      provider: 'MicroGuard',
      difficulty: 'Intermediate',
      theory: 'Growth on selective media indicates presence of specific microbes. Biochemical tests confirm identifying characteristics.',
      objectives: '1. Perform aseptic inoculation. 2. Observe colony morphology. 3. Interpret biochemical results.',
      safety: 'Handle cultures with aseptic techniques. Sterilize all equipment after use.'
    }
  ];

  console.log('Cleaning existing labs...');
  await prisma.lab.deleteMany({
    where: {
      title: {
        in: labs.map(l => l.title)
      }
    }
  });

  for (const l of labs) {
    await prisma.lab.create({
      data: l
    });
  }

  console.log('--- Pharmaceutical Labs Seeded Successfully ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
