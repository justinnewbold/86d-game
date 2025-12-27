// ============================================
// CASH FLOW ENGINE
// ============================================
// The #1 reason restaurants fail: "Profitable but out of cash"
// This system teaches the critical difference between profit and cash available

export interface Bill {
  id: string;
  type: 'rent' | 'utilities' | 'payroll' | 'supplier' | 'loan' | 'tax' | 'insurance';
  description: string;
  amount: number;
  dueWeek: number; // Week number when payment is due
  isPaid: boolean;
  isOverdue: boolean;
  lateFee?: number;
  daysPastDue?: number;
}

export interface Receivable {
  id: string;
  type: 'catering' | 'corporate_event' | 'gift_card_redemption';
  description: string;
  amount: number;
  expectedWeek: number; // Week when payment expected
  isCollected: boolean;
  // Real lesson: Not all receivables get paid
  collectProbability: number; // 0.85-0.98 typically
}

export interface CashFlowState {
  // Actual cash in bank RIGHT NOW
  cashOnHand: number;

  // Upcoming obligations (bills due)
  pendingBills: Bill[];

  // Money owed TO you (not yet received)
  accountsReceivable: Receivable[];

  // Historical tracking for education
  cashFlowHistory: WeeklyCashFlow[];

  // Key metrics for learning
  weeksOfRunway: number; // How many weeks can you survive?
  cashCrunchWarning: boolean; // About to run out?

  // Credit line (safety net that costs money)
  creditLineAvailable: number;
  creditLineUsed: number;
  creditLineInterestRate: number; // Weekly rate
}

export interface WeeklyCashFlow {
  week: number;

  // Cash IN (actual money received this week)
  cashFromSales: number; // POS sales - immediate
  cashFromDelivery: number; // Delivery platforms pay weekly
  cashFromCatering: number; // Collected receivables
  cashFromOther: number;
  totalCashIn: number;

  // Cash OUT (actual money paid this week)
  rentPaid: number;
  payrollPaid: number;
  suppliersPaid: number;
  utilitiesPaid: number;
  loanPaymentsPaid: number;
  taxesPaid: number;
  otherPaid: number;
  totalCashOut: number;

  // Net change
  netCashFlow: number;
  endingCash: number;

  // Comparison to P&L (the educational gap!)
  accountingProfit: number; // What the P&L says
  cashFlowDifference: number; // profit - netCashFlow (often negative!)
}

// Bill payment schedules (realistic timing)
export const BILL_SCHEDULES = {
  rent: {
    frequency: 'monthly', // Due 1st of month (every 4 weeks)
    dueDay: 1,
    lateFeePercent: 0.05, // 5% late fee
    gracePeriodDays: 5,
  },
  payroll: {
    frequency: 'biweekly', // Every 2 weeks
    // Real lesson: You can't skip payroll - employees quit immediately
    canDefer: false,
  },
  suppliers: {
    // Varies by relationship!
    newVendor: { terms: 'COD', daysToPayAfterDelivery: 0 },
    established: { terms: 'Net15', daysToPayAfterDelivery: 15 },
    preferred: { terms: 'Net30', daysToPayAfterDelivery: 30 },
  },
  utilities: {
    frequency: 'monthly',
    dueDay: 15,
    disconnectAfterDays: 30, // Real consequence!
  },
  taxes: {
    salesTax: { frequency: 'monthly', dueDay: 20 },
    payrollTax: { frequency: 'quarterly' },
    incomeTax: { frequency: 'quarterly' },
  },
  insurance: {
    frequency: 'monthly',
    // Real lesson: Lapse = no coverage = massive risk
    lapseConsequence: 'uninsured',
  },
  loans: {
    frequency: 'monthly',
    missedPaymentConsequence: 'default_warning',
    defaultAfterMissed: 3,
  },
};

// Revenue collection timing (when you actually get the money)
export const REVENUE_TIMING = {
  // Dine-in: Immediate (credit card settles in 1-2 days, close enough)
  dineIn: { delay: 0, certainty: 1.0 },

  // Delivery platforms: Weekly settlement, minus their cut
  delivery: {
    delay: 7, // Days until you see the money
    certainty: 1.0,
    // The painful lesson: they take 25-30% AND hold your money
  },

  // Catering: Invoice terms vary
  catering: {
    corporate: { delay: 30, certainty: 0.92 }, // Net 30, some don't pay
    private: { delay: 0, certainty: 1.0 }, // Deposit + day-of payment
    wedding: { delay: -14, certainty: 0.98 }, // 50% deposit 2 weeks before
  },

  // Gift cards: You got cash upfront, but owe the service later
  giftCards: {
    // Real lesson: Gift card sales aren't revenue until redeemed
    // But the cash IS available immediately
    cashOnSale: true,
    revenueOnRedemption: true,
  },
};

/**
 * Calculate weeks of runway (how long until you're broke)
 */
export function calculateRunway(
  cashOnHand: number,
  weeklyBurn: number, // Average weekly cash out
  pendingBills: Bill[]
): number {
  if (weeklyBurn <= 0) return 52; // Cap at 1 year

  // Factor in upcoming large bills
  const next4WeeksBills = pendingBills
    .filter(b => !b.isPaid && b.dueWeek <= 4)
    .reduce((sum, b) => sum + b.amount, 0);

  const adjustedCash = cashOnHand - next4WeeksBills;
  const runway = Math.max(0, Math.floor(adjustedCash / weeklyBurn));

  return Math.min(runway, 52);
}

/**
 * Generate upcoming bills for a location
 */
export function generateUpcomingBills(
  currentWeek: number,
  monthlyRent: number,
  weeklyPayroll: number,
  monthlyUtilities: number,
  loanPayments: { amount: number; weekDue: number }[],
  supplierInvoices: { vendor: string; amount: number; terms: 'COD' | 'Net15' | 'Net30'; orderWeek: number }[]
): Bill[] {
  const bills: Bill[] = [];
  const weeksAhead = 8; // Look 8 weeks ahead

  // Rent - due every 4 weeks (monthly)
  for (let w = currentWeek; w < currentWeek + weeksAhead; w++) {
    if (w % 4 === 1) { // Due on week 1, 5, 9, etc.
      bills.push({
        id: `rent-${w}`,
        type: 'rent',
        description: `Monthly Rent`,
        amount: monthlyRent,
        dueWeek: w,
        isPaid: false,
        isOverdue: false,
        lateFee: monthlyRent * 0.05,
      });
    }
  }

  // Payroll - due every 2 weeks
  for (let w = currentWeek; w < currentWeek + weeksAhead; w++) {
    if (w % 2 === 0) {
      bills.push({
        id: `payroll-${w}`,
        type: 'payroll',
        description: `Bi-weekly Payroll`,
        amount: weeklyPayroll * 2,
        dueWeek: w,
        isPaid: false,
        isOverdue: false,
      });
    }
  }

  // Utilities - monthly
  for (let w = currentWeek; w < currentWeek + weeksAhead; w++) {
    if (w % 4 === 2) { // Due week 2, 6, 10, etc.
      bills.push({
        id: `utilities-${w}`,
        type: 'utilities',
        description: `Monthly Utilities`,
        amount: monthlyUtilities,
        dueWeek: w,
        isPaid: false,
        isOverdue: false,
      });
    }
  }

  // Loan payments
  loanPayments.forEach((loan, i) => {
    bills.push({
      id: `loan-${i}-${loan.weekDue}`,
      type: 'loan',
      description: `Loan Payment`,
      amount: loan.amount,
      dueWeek: loan.weekDue,
      isPaid: false,
      isOverdue: false,
    });
  });

  // Supplier invoices based on terms
  supplierInvoices.forEach((inv, i) => {
    const termsDelay = inv.terms === 'COD' ? 0 : inv.terms === 'Net15' ? 2 : 4; // weeks
    bills.push({
      id: `supplier-${i}-${inv.orderWeek}`,
      type: 'supplier',
      description: `${inv.vendor} (${inv.terms})`,
      amount: inv.amount,
      dueWeek: inv.orderWeek + termsDelay,
      isPaid: false,
      isOverdue: false,
    });
  });

  return bills.sort((a, b) => a.dueWeek - b.dueWeek);
}

/**
 * Process weekly cash flow - the heart of the educational system
 */
export function processWeeklyCashFlow(
  currentWeek: number,
  state: CashFlowState,
  weeklyRevenue: {
    dineIn: number;
    delivery: number;
    cateringCollected: number;
    other: number;
  },
  accountingProfit: number // What the P&L says
): {
  newState: CashFlowState;
  weekFlow: WeeklyCashFlow;
  alerts: CashFlowAlert[];
} {
  const alerts: CashFlowAlert[] = [];

  // Cash IN this week
  const cashIn = {
    cashFromSales: weeklyRevenue.dineIn, // Immediate
    cashFromDelivery: weeklyRevenue.delivery, // Actually delayed, but simplified
    cashFromCatering: weeklyRevenue.cateringCollected,
    cashFromOther: weeklyRevenue.other,
    totalCashIn: 0,
  };
  cashIn.totalCashIn = cashIn.cashFromSales + cashIn.cashFromDelivery +
                        cashIn.cashFromCatering + cashIn.cashFromOther;

  // Bills due this week
  const billsDueThisWeek = state.pendingBills.filter(
    b => !b.isPaid && b.dueWeek <= currentWeek
  );

  // Cash OUT - pay what we can
  let cashAvailable = state.cashOnHand + cashIn.totalCashIn;
  const cashOut = {
    rentPaid: 0,
    payrollPaid: 0,
    suppliersPaid: 0,
    utilitiesPaid: 0,
    loanPaymentsPaid: 0,
    taxesPaid: 0,
    otherPaid: 0,
    totalCashOut: 0,
  };

  const updatedBills = [...state.pendingBills];

  // Priority order for paying bills (this is a real decision owners make!)
  // 1. Payroll - employees quit if not paid
  // 2. Utilities - get shut off
  // 3. Suppliers - need inventory
  // 4. Rent - has grace period
  // 5. Loans - can sometimes defer

  const paymentPriority: Bill['type'][] = ['payroll', 'utilities', 'supplier', 'rent', 'loan', 'tax', 'insurance'];

  for (const priorityType of paymentPriority) {
    const billsOfType = billsDueThisWeek.filter(b => b.type === priorityType);

    for (const bill of billsOfType) {
      const billIndex = updatedBills.findIndex(b => b.id === bill.id);

      if (cashAvailable >= bill.amount) {
        // Can pay this bill
        cashAvailable -= bill.amount;
        updatedBills[billIndex] = { ...bill, isPaid: true };

        // Track what category
        switch (bill.type) {
          case 'rent': cashOut.rentPaid += bill.amount; break;
          case 'payroll': cashOut.payrollPaid += bill.amount; break;
          case 'supplier': cashOut.suppliersPaid += bill.amount; break;
          case 'utilities': cashOut.utilitiesPaid += bill.amount; break;
          case 'loan': cashOut.loanPaymentsPaid += bill.amount; break;
          case 'tax': cashOut.taxesPaid += bill.amount; break;
          default: cashOut.otherPaid += bill.amount;
        }
      } else {
        // Can't pay - mark overdue
        updatedBills[billIndex] = {
          ...bill,
          isOverdue: true,
          daysPastDue: (bill.daysPastDue || 0) + 7,
        };

        // Generate alert based on bill type
        alerts.push({
          type: 'unpaid_bill',
          severity: bill.type === 'payroll' ? 'critical' : 'warning',
          message: `Cannot pay ${bill.description}: $${bill.amount.toLocaleString()}`,
          consequence: getUnpaidConsequence(bill.type),
        });
      }
    }
  }

  cashOut.totalCashOut = cashOut.rentPaid + cashOut.payrollPaid + cashOut.suppliersPaid +
                          cashOut.utilitiesPaid + cashOut.loanPaymentsPaid +
                          cashOut.taxesPaid + cashOut.otherPaid;

  const netCashFlow = cashIn.totalCashIn - cashOut.totalCashOut;
  const endingCash = state.cashOnHand + netCashFlow;

  // The key educational metric!
  const cashFlowDifference = accountingProfit - netCashFlow;

  // Create weekly record
  const weekFlow: WeeklyCashFlow = {
    week: currentWeek,
    ...cashIn,
    ...cashOut,
    netCashFlow,
    endingCash,
    accountingProfit,
    cashFlowDifference,
  };

  // Calculate runway
  const avgWeeklyBurn = state.cashFlowHistory.length > 0
    ? state.cashFlowHistory.slice(-4).reduce((s, w) => s + w.totalCashOut, 0) / 4
    : cashOut.totalCashOut;

  const weeksOfRunway = calculateRunway(endingCash, avgWeeklyBurn, updatedBills);

  // Cash crunch warning
  if (weeksOfRunway < 4) {
    alerts.push({
      type: 'low_runway',
      severity: weeksOfRunway < 2 ? 'critical' : 'warning',
      message: `Only ${weeksOfRunway} weeks of cash remaining!`,
      consequence: 'You may not be able to pay upcoming bills',
    });
  }

  // The educational moment: profitable but cash-negative
  if (accountingProfit > 0 && netCashFlow < 0) {
    alerts.push({
      type: 'profitable_but_negative_cash',
      severity: 'info',
      message: `Profitable ($${accountingProfit.toLocaleString()}) but cash flow negative ($${netCashFlow.toLocaleString()})`,
      consequence: 'This is the #1 reason restaurants fail - profitable on paper but out of cash',
    });
  }

  const newState: CashFlowState = {
    ...state,
    cashOnHand: endingCash,
    pendingBills: updatedBills.filter(b => !b.isPaid),
    cashFlowHistory: [...state.cashFlowHistory, weekFlow].slice(-52), // Keep 1 year
    weeksOfRunway,
    cashCrunchWarning: weeksOfRunway < 4,
  };

  return { newState, weekFlow, alerts };
}

export interface CashFlowAlert {
  type: 'unpaid_bill' | 'low_runway' | 'profitable_but_negative_cash' | 'overdue_warning';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  consequence: string;
}

function getUnpaidConsequence(billType: Bill['type']): string {
  switch (billType) {
    case 'payroll':
      return 'Staff morale drops sharply. Risk of employees quitting.';
    case 'utilities':
      return 'Risk of service disconnection. Cannot operate without power/gas.';
    case 'rent':
      return 'Late fee added. Risk of eviction notice after 30 days.';
    case 'supplier':
      return 'Vendor relationship damaged. May require COD terms going forward.';
    case 'loan':
      return 'Negative credit impact. Risk of default after 3 missed payments.';
    case 'tax':
      return 'Penalties and interest accrue. Risk of liens.';
    case 'insurance':
      return 'Coverage lapses. Operating uninsured is extremely risky.';
    default:
      return 'Financial stress increases.';
  }
}

/**
 * Educational: Explain the difference between profit and cash flow
 */
export function explainCashFlowGap(weekFlow: WeeklyCashFlow): string {
  const gap = weekFlow.cashFlowDifference;

  if (Math.abs(gap) < 100) {
    return "Your cash flow matched your profit this week - that's unusual but good!";
  }

  if (gap > 0) {
    // Profit > Cash Flow (you recorded revenue you haven't collected)
    return `You're $${gap.toLocaleString()} "profitable" on paper, but that money isn't in your bank yet. ` +
           `This happens when customers owe you (catering invoices, delayed delivery payments) or ` +
           `you've accrued revenue you haven't collected. Watch your actual cash!`;
  } else {
    // Cash Flow > Profit (you paid bills before matching revenue came in)
    return `You spent $${Math.abs(gap).toLocaleString()} more in cash than your profit shows. ` +
           `This is normal when paying bills that were accrued previously, making deposits, ` +
           `or stocking up inventory. But watch your cash reserves!`;
  }
}
