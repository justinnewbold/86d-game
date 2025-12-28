// ============================================
// STAFF CAREER DEVELOPMENT SYSTEM
// ============================================
// Tracks staff growth, training, and career paths
// Educational: Shows the real cost of turnover vs. investment in people

/**
 * Training certification that staff can earn
 */
export interface Certification {
  id: string;
  name: string;
  description: string;
  cost: number;
  duration: number; // weeks to complete
  requirements: {
    minSkill?: number;
    minWeeks?: number;
    department?: 'kitchen' | 'foh' | 'bar' | 'management';
    prerequisite?: string; // Other certification ID
  };
  benefits: {
    skillBoost: number;
    wageIncrease: number; // percentage
    moraleBoost: number;
    specialAbility?: string;
  };
  educationalNote: string;
}

/**
 * Career path / promotion opportunity
 */
export interface CareerPath {
  id: string;
  fromRole: string;
  toRole: string;
  requirements: {
    minSkill: number;
    minWeeks: number;
    certifications?: string[];
    minMorale?: number;
  };
  benefits: {
    newWage: number;
    moraleBoost: number;
    loyaltyBonus: number; // weeks of additional loyalty
  };
  educationalNote: string;
}

/**
 * Staff member with development tracking
 */
export interface DevelopedStaff {
  id: number;
  name: string;
  role: string;
  department: 'kitchen' | 'foh' | 'bar' | 'management';
  wage: number;
  skill: number;
  morale: number;
  weeks: number; // tenure

  // Development tracking
  certifications: string[];
  inTraining?: {
    certificationId: string;
    weeksRemaining: number;
  };
  careerPath?: string; // Current role in career ladder
  mentorId?: number; // Senior staff mentoring them

  // Loyalty system
  loyaltyScore: number; // 0-100, affects quit probability
  turnoverRisk: 'low' | 'medium' | 'high';
  lastRaiseWeek: number;

  // Performance
  weeklyPerformance: number[]; // Last 4 weeks
  customerCompliments: number;
  customerComplaints: number;
}

// Available certifications
export const CERTIFICATIONS: Certification[] = [
  // Kitchen certifications
  {
    id: 'servsafe-food',
    name: 'ServSafe Food Handler',
    description: 'Basic food safety certification required in most states',
    cost: 150,
    duration: 1,
    requirements: { department: 'kitchen' },
    benefits: {
      skillBoost: 5,
      wageIncrease: 0,
      moraleBoost: 5,
      specialAbility: 'Can train others on food safety',
    },
    educationalNote: 'Most states require at least one ServSafe certified person on shift. It\'s cheap insurance.',
  },
  {
    id: 'servsafe-manager',
    name: 'ServSafe Manager',
    description: 'Advanced food safety certification for supervisors',
    cost: 450,
    duration: 2,
    requirements: {
      department: 'kitchen',
      minSkill: 6,
      prerequisite: 'servsafe-food',
    },
    benefits: {
      skillBoost: 8,
      wageIncrease: 5,
      moraleBoost: 10,
      specialAbility: 'Reduces health inspection risk by 50%',
    },
    educationalNote: 'ServSafe Managers can handle inspections and train staff. Worth the investment.',
  },
  {
    id: 'knife-skills',
    name: 'Advanced Knife Skills',
    description: 'Professional culinary knife technique course',
    cost: 800,
    duration: 3,
    requirements: {
      department: 'kitchen',
      minSkill: 5,
      minWeeks: 8,
    },
    benefits: {
      skillBoost: 10,
      wageIncrease: 8,
      moraleBoost: 15,
      specialAbility: 'Prep time reduced 15%',
    },
    educationalNote: 'Skilled prep cooks are worth their weight in gold. Faster prep = lower labor cost.',
  },
  {
    id: 'grill-master',
    name: 'Grill Master Certification',
    description: 'Mastery of all grill and broiler stations',
    cost: 600,
    duration: 4,
    requirements: {
      department: 'kitchen',
      minSkill: 7,
      minWeeks: 12,
    },
    benefits: {
      skillBoost: 12,
      wageIncrease: 10,
      moraleBoost: 20,
      specialAbility: 'Reduces protein waste by 20%',
    },
    educationalNote: 'A great grill cook can save thousands in wasted steaks. Train your best.',
  },

  // FOH certifications
  {
    id: 'wine-101',
    name: 'Wine Fundamentals',
    description: 'Basic wine knowledge and service',
    cost: 300,
    duration: 2,
    requirements: { department: 'foh' },
    benefits: {
      skillBoost: 5,
      wageIncrease: 3,
      moraleBoost: 10,
      specialAbility: 'Wine upsells increase 20%',
    },
    educationalNote: 'Wine is high-margin. Knowledgeable servers sell more.',
  },
  {
    id: 'sommelier-1',
    name: 'Level 1 Sommelier',
    description: 'Court of Master Sommeliers introductory certification',
    cost: 1200,
    duration: 6,
    requirements: {
      department: 'foh',
      minSkill: 7,
      prerequisite: 'wine-101',
    },
    benefits: {
      skillBoost: 15,
      wageIncrease: 15,
      moraleBoost: 25,
      specialAbility: 'Can design wine program, wine sales +40%',
    },
    educationalNote: 'A real sommelier transforms a restaurant\'s beverage program. Major revenue driver.',
  },
  {
    id: 'hospitality-excellence',
    name: 'Hospitality Excellence',
    description: 'Advanced guest service and conflict resolution',
    cost: 400,
    duration: 2,
    requirements: {
      department: 'foh',
      minWeeks: 8,
    },
    benefits: {
      skillBoost: 8,
      wageIncrease: 5,
      moraleBoost: 15,
      specialAbility: 'Reduces customer complaints 30%',
    },
    educationalNote: 'One bad review can cost you 30 customers. Training prevents problems.',
  },

  // Bar certifications
  {
    id: 'bartender-basics',
    name: 'Professional Bartender',
    description: 'Core cocktail and bar operations training',
    cost: 500,
    duration: 3,
    requirements: { department: 'bar' },
    benefits: {
      skillBoost: 10,
      wageIncrease: 8,
      moraleBoost: 15,
      specialAbility: 'Cocktail speed +25%',
    },
    educationalNote: 'Fast bartenders make more drinks = more revenue. Speed matters.',
  },
  {
    id: 'mixologist',
    name: 'Craft Mixologist',
    description: 'Advanced cocktail creation and bar program development',
    cost: 1500,
    duration: 6,
    requirements: {
      department: 'bar',
      minSkill: 8,
      prerequisite: 'bartender-basics',
    },
    benefits: {
      skillBoost: 15,
      wageIncrease: 20,
      moraleBoost: 25,
      specialAbility: 'Can create signature cocktails with 40% margin',
    },
    educationalNote: 'Signature cocktails can\'t be replicated by chains. Major differentiator.',
  },

  // Management certifications
  {
    id: 'shift-leader',
    name: 'Shift Leader Training',
    description: 'Basics of shift management and team coordination',
    cost: 350,
    duration: 2,
    requirements: {
      minSkill: 6,
      minWeeks: 16,
    },
    benefits: {
      skillBoost: 8,
      wageIncrease: 10,
      moraleBoost: 20,
      specialAbility: 'Can run shifts without manager present',
    },
    educationalNote: 'Developing shift leaders gives you flexibility and backup for your managers.',
  },
  {
    id: 'p&l-basics',
    name: 'Restaurant P&L Basics',
    description: 'Understanding restaurant financials and cost control',
    cost: 600,
    duration: 4,
    requirements: {
      department: 'management',
      minSkill: 7,
    },
    benefits: {
      skillBoost: 10,
      wageIncrease: 12,
      moraleBoost: 15,
      specialAbility: 'Reduces waste 10% through better ordering',
    },
    educationalNote: 'Managers who understand P&L make decisions that protect margins.',
  },
];

// Career paths / promotions
export const CAREER_PATHS: CareerPath[] = [
  // Kitchen track
  {
    id: 'dishwasher-prep',
    fromRole: 'Dishwasher',
    toRole: 'Prep Cook',
    requirements: {
      minSkill: 4,
      minWeeks: 8,
    },
    benefits: {
      newWage: 14,
      moraleBoost: 25,
      loyaltyBonus: 12,
    },
    educationalNote: 'Promoting from within builds loyalty and saves on hiring costs.',
  },
  {
    id: 'prep-line',
    fromRole: 'Prep Cook',
    toRole: 'Line Cook',
    requirements: {
      minSkill: 6,
      minWeeks: 16,
      certifications: ['servsafe-food'],
    },
    benefits: {
      newWage: 17,
      moraleBoost: 25,
      loyaltyBonus: 16,
    },
    educationalNote: 'Line cooks are your core kitchen. Develop them internally for consistency.',
  },
  {
    id: 'line-sous',
    fromRole: 'Line Cook',
    toRole: 'Sous Chef',
    requirements: {
      minSkill: 8,
      minWeeks: 32,
      certifications: ['servsafe-manager', 'knife-skills'],
      minMorale: 60,
    },
    benefits: {
      newWage: 24,
      moraleBoost: 35,
      loyaltyBonus: 26,
    },
    educationalNote: 'A sous chef who came up through your ranks knows your standards perfectly.',
  },

  // FOH track
  {
    id: 'host-server',
    fromRole: 'Host',
    toRole: 'Server',
    requirements: {
      minSkill: 5,
      minWeeks: 8,
    },
    benefits: {
      newWage: 12, // Plus tips
      moraleBoost: 20,
      loyaltyBonus: 8,
    },
    educationalNote: 'Hosts who become servers know the floor and handle waits better.',
  },
  {
    id: 'server-lead',
    fromRole: 'Server',
    toRole: 'Lead Server',
    requirements: {
      minSkill: 7,
      minWeeks: 20,
      certifications: ['hospitality-excellence'],
    },
    benefits: {
      newWage: 15,
      moraleBoost: 25,
      loyaltyBonus: 12,
    },
    educationalNote: 'Lead servers train new hires and handle VIPs. Worth the investment.',
  },
  {
    id: 'lead-fohmanager',
    fromRole: 'Lead Server',
    toRole: 'FOH Manager',
    requirements: {
      minSkill: 8,
      minWeeks: 40,
      certifications: ['hospitality-excellence', 'shift-leader'],
      minMorale: 65,
    },
    benefits: {
      newWage: 52000 / 52, // $52K annual
      moraleBoost: 40,
      loyaltyBonus: 26,
    },
    educationalNote: 'Promoting FOH managers internally ensures they know your culture.',
  },
];

/**
 * Calculate turnover risk for a staff member
 */
export function calculateTurnoverRisk(staff: DevelopedStaff): 'low' | 'medium' | 'high' {
  let riskScore = 0;

  // Morale is the biggest factor
  if (staff.morale < 40) riskScore += 40;
  else if (staff.morale < 60) riskScore += 20;
  else if (staff.morale < 75) riskScore += 10;

  // Tenure affects loyalty (but new employees also quit easily)
  if (staff.weeks < 4) riskScore += 25; // New hires quit easily
  else if (staff.weeks < 12) riskScore += 15;
  else if (staff.weeks > 52) riskScore -= 15; // Veterans are loyal

  // Recent raise helps
  const weeksSinceRaise = staff.weeks - staff.lastRaiseWeek;
  if (weeksSinceRaise > 52) riskScore += 20; // No raise in a year
  else if (weeksSinceRaise > 26) riskScore += 10;

  // Certifications increase job satisfaction
  riskScore -= staff.certifications.length * 5;

  // High skill without promotion = risk
  if (staff.skill > 7 && !staff.certifications.length && staff.weeks > 20) {
    riskScore += 15;
  }

  if (riskScore >= 40) return 'high';
  if (riskScore >= 20) return 'medium';
  return 'low';
}

/**
 * Calculate the true cost of losing an employee
 */
export function calculateTurnoverCost(staff: DevelopedStaff): {
  totalCost: number;
  breakdown: { item: string; cost: number }[];
  educationalNote: string;
} {
  const breakdown: { item: string; cost: number }[] = [];

  // Hiring costs
  const hiringCost = 500; // Posting, interviewing time
  breakdown.push({ item: 'Hiring & recruiting', cost: hiringCost });

  // Training costs (2-4 weeks of reduced productivity)
  const trainingWeeks = staff.skill > 6 ? 4 : 2;
  const trainingCost = staff.wage * 40 * trainingWeeks * 0.5; // 50% productivity
  breakdown.push({ item: `Training (${trainingWeeks} weeks)`, cost: trainingCost });

  // Lost institutional knowledge
  const knowledgeCost = Math.min(staff.weeks * 50, 2000);
  breakdown.push({ item: 'Lost institutional knowledge', cost: knowledgeCost });

  // Impact on team morale
  const moraleCost = 300;
  breakdown.push({ item: 'Team morale impact', cost: moraleCost });

  // Certification investment lost
  const certCost = staff.certifications.length * 400;
  if (certCost > 0) {
    breakdown.push({ item: 'Lost certification investment', cost: certCost });
  }

  const totalCost = breakdown.reduce((sum, item) => sum + item.cost, 0);

  return {
    totalCost,
    breakdown,
    educationalNote: `Turnover costs 50-200% of an employee's annual salary. Prevention (good pay, development, respect) is always cheaper than replacement.`,
  };
}

/**
 * Check available promotions for a staff member
 */
export function getAvailablePromotions(
  staff: DevelopedStaff
): CareerPath[] {
  return CAREER_PATHS.filter(path => {
    if (path.fromRole !== staff.role) return false;
    if (staff.skill < path.requirements.minSkill) return false;
    if (staff.weeks < path.requirements.minWeeks) return false;
    if (path.requirements.minMorale && staff.morale < path.requirements.minMorale) return false;
    if (path.requirements.certifications) {
      const hasAll = path.requirements.certifications.every(
        cert => staff.certifications.includes(cert)
      );
      if (!hasAll) return false;
    }
    return true;
  });
}

/**
 * Check available certifications for a staff member
 */
export function getAvailableCertifications(
  staff: DevelopedStaff
): Certification[] {
  return CERTIFICATIONS.filter(cert => {
    // Already has it
    if (staff.certifications.includes(cert.id)) return false;

    // Already in training
    if (staff.inTraining?.certificationId === cert.id) return false;

    // Check requirements
    if (cert.requirements.minSkill && staff.skill < cert.requirements.minSkill) return false;
    if (cert.requirements.minWeeks && staff.weeks < cert.requirements.minWeeks) return false;
    if (cert.requirements.department && staff.department !== cert.requirements.department) return false;
    if (cert.requirements.prerequisite && !staff.certifications.includes(cert.requirements.prerequisite)) {
      return false;
    }

    return true;
  });
}

/**
 * Start training for a certification
 */
export function startTraining(
  staff: DevelopedStaff,
  certificationId: string
): DevelopedStaff | null {
  const cert = CERTIFICATIONS.find(c => c.id === certificationId);
  if (!cert) return null;

  // Verify eligible
  const available = getAvailableCertifications(staff);
  if (!available.some(c => c.id === certificationId)) return null;

  return {
    ...staff,
    inTraining: {
      certificationId,
      weeksRemaining: cert.duration,
    },
  };
}

/**
 * Process weekly training progress
 */
export function processTrainingWeek(staff: DevelopedStaff): {
  updatedStaff: DevelopedStaff;
  completed: Certification | null;
} {
  const training = staff.inTraining;
  if (!training) {
    return { updatedStaff: staff, completed: null };
  }

  const weeksRemaining = training.weeksRemaining - 1;

  if (weeksRemaining <= 0) {
    // Training complete!
    const cert = CERTIFICATIONS.find(c => c.id === training.certificationId);

    return {
      updatedStaff: {
        ...staff,
        inTraining: undefined,
        certifications: [...staff.certifications, training.certificationId],
        skill: Math.min(10, staff.skill + (cert?.benefits.skillBoost || 0) / 10),
        morale: Math.min(100, staff.morale + (cert?.benefits.moraleBoost || 0)),
        wage: staff.wage * (1 + (cert?.benefits.wageIncrease || 0) / 100),
        loyaltyScore: Math.min(100, staff.loyaltyScore + 10),
      },
      completed: cert || null,
    };
  }

  return {
    updatedStaff: {
      ...staff,
      inTraining: {
        ...training,
        weeksRemaining,
      },
    },
    completed: null,
  };
}

/**
 * Promote a staff member
 */
export function promoteStaff(
  staff: DevelopedStaff,
  pathId: string
): DevelopedStaff | null {
  const path = CAREER_PATHS.find(p => p.id === pathId);
  if (!path) return null;

  // Verify eligible
  const available = getAvailablePromotions(staff);
  if (!available.some(p => p.id === pathId)) return null;

  return {
    ...staff,
    role: path.toRole,
    wage: path.benefits.newWage,
    morale: Math.min(100, staff.morale + path.benefits.moraleBoost),
    loyaltyScore: Math.min(100, staff.loyaltyScore + 20),
    careerPath: path.id,
  };
}

/**
 * Educational lessons about staff development
 */
export const STAFF_DEVELOPMENT_LESSONS = [
  {
    title: 'Turnover Is Expensive',
    lesson: 'Replacing an employee costs 50-200% of their annual salary. Investing in retention is almost always cheaper.',
  },
  {
    title: 'Promote From Within',
    lesson: 'Internal promotions cost less, maintain culture, and boost morale across the team.',
  },
  {
    title: 'Training Pays For Itself',
    lesson: 'A $500 certification can save thousands in reduced waste, faster service, or prevented lawsuits.',
  },
  {
    title: 'Morale Affects Everything',
    lesson: 'Happy staff = better food, better service, lower turnover. It\'s not soft - it\'s profitable.',
  },
  {
    title: 'Top Performers Have Options',
    lesson: 'Your best employees can always find another job. If you don\'t value them, someone else will.',
  },
];

export default {
  CERTIFICATIONS,
  CAREER_PATHS,
  calculateTurnoverRisk,
  calculateTurnoverCost,
  getAvailablePromotions,
  getAvailableCertifications,
  startTraining,
  processTrainingWeek,
  promoteStaff,
  STAFF_DEVELOPMENT_LESSONS,
};
