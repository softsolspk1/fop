/**
 * Dissolution Simulation Logic
 * Noyce-Whitney simplified model
 */
export const simulateDissolution = (params: {
  temp: number; // Celsius (Ideal 37)
  rpm: number;  // 50-150
  solubility: number; // 0.1 - 1.0 (Drug property)
  samplingInterval: number; // Minutes
  totalTime: number; // Minutes
}) => {
  const { temp, rpm, solubility, samplingInterval, totalTime } = params;
  
  // Base rate constant adjusted by temp and rpm
  // Temp factor: Arrhenius-like (higher temp = faster)
  const tempFactor = Math.pow(1.05, temp - 37);
  // RPM factor: Faster rotation = thinner diffusion layer
  const rpmFactor = Math.sqrt(rpm / 50);
  
  const k = 0.05 * solubility * tempFactor * rpmFactor;
  
  const points = [];
  for (let t = 0; t <= totalTime; t += samplingInterval) {
    const dissolved = 100 * (1 - Math.exp(-k * t));
    points.push({
      time: t,
      concentration: parseFloat(dissolved.toFixed(2))
    });
  }
  
  return points;
};

/**
 * Tablet Formulation Logic
 */
export const simulateTablet = (formulation: {
  apiWeight: number;
  diluentWeight: number;
  binderWeight: number;
  disintegrantWeight: number;
  compressionForce: number; // kN
}) => {
  const totalWeight = formulation.apiWeight + formulation.diluentWeight + formulation.binderWeight + formulation.disintegrantWeight;
  const binderPercent = (formulation.binderWeight / totalWeight) * 100;
  const disintegrantPercent = (formulation.disintegrantWeight / totalWeight) * 100;
  
  // Predicted Hardness (Strongly linked to binder and force)
  const hardness = (binderPercent * 0.8) + (formulation.compressionForce * 1.5);
  
  // Predicted Disintegration Time (Minutes)
  // Higher hardness = slower, Higher disintegrant = faster
  let disintegrationTime = (hardness * 2) / (disintegrantPercent + 1);
  disintegrationTime = Math.max(1, disintegrationTime); // Min 1 min
  
  // Quality Check
  const isUniform = totalWeight > 0;
  const passedHardness = hardness >= 4 && hardness <= 10; // Standard 4-10 kp
  const passedDisintegration = disintegrationTime <= 15; // Standard < 15 min for immediate release
  
  return {
    totalWeight,
    hardness: parseFloat(hardness.toFixed(1)),
    disintegrationTime: parseFloat(disintegrationTime.toFixed(1)),
    quality: {
      passed: passedHardness && passedDisintegration,
      feedback: passedHardness ? (passedDisintegration ? 'Ideal Formulation' : 'Slow Disintegration') : 'Low Hardness'
    }
  };
};

/**
 * Emulsion Prep Logic (HLB Method)
 */
export const simulateEmulsion = (params: {
  oilHLB: number;
  surfactant1HLB: number;
  surfactant1Ratio: number; // 0-1
  surfactant2HLB: number;
}) => {
  const s2Ratio = 1 - params.surfactant1Ratio;
  const systemHLB = (params.surfactant1HLB * params.surfactant1Ratio) + (params.surfactant2HLB * s2Ratio);
  
  const deviation = Math.abs(systemHLB - params.oilHLB);
  
  // Stability Score (100 is perfect)
  const stability = Math.max(0, 100 - (deviation * 20));
  
  let state = 'Stable';
  if (stability < 40) state = 'Cracked';
  else if (stability < 70) state = 'Creaming';
  
  return {
    calculatedHLB: parseFloat(systemHLB.toFixed(2)),
    stabilityScore: parseFloat(stability.toFixed(1)),
    state,
    feedback: stability > 80 ? 'Perfectly balance HLB' : 'HLB Mismatch detected'
  };
};
