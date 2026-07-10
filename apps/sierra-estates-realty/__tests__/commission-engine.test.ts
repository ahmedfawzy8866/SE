import { CommissionEngine, DealDetails, EmployeeKPI } from '../lib/services/commission-engine';

describe('CommissionEngine', () => {
  describe('calcInsideSalesCommission', () => {
    it('should calculate rental commission properly when handled by self and sourced from owner', () => {
      const deal: DealDetails = {
        type: 'rent',
        amount: 20000,
        source: 'owner',
        broughtBy: 'self',
        handledBy: 'self',
      };
      
      // Handled by self: 10% of 20000 = 2000
      // Source owner: 15% of 20000 = 3000
      // Brought by self & closed by self -> no split deal bonus applied
      // Total: 2000 + 3000 = 5000
      const commission = CommissionEngine.calcInsideSalesCommission(deal);
      expect(commission).toBe(5000);
    });

    it('should calculate rental commission with broker source and split broughtBy self', () => {
      const deal: DealDetails = {
        type: 'rent',
        amount: 20000,
        source: 'broker',
        broughtBy: 'self',
        handledBy: 'other',
      };
      
      // Handled by other: 0
      // Source broker: 5% of 20000 = 1000
      // Brought by self & handled by other: 10% of 20000 = 2000
      // Total: 3000
      const commission = CommissionEngine.calcInsideSalesCommission(deal);
      expect(commission).toBe(3000);
    });

    it('should return 0 commission for non-rent deals', () => {
      const deal: DealDetails = {
        type: 'sale',
        amount: 5000000,
        source: 'owner',
        broughtBy: 'self',
        handledBy: 'self',
      };
      const commission = CommissionEngine.calcInsideSalesCommission(deal);
      expect(commission).toBe(0);
    });
  });

  describe('calcCloserCommission', () => {
    const deal: DealDetails = {
      type: 'sale',
      amount: 100000,
      source: 'owner',
      broughtBy: 'self',
      handledBy: 'self',
    };

    it('should calculate 15% base commission for 0 or 1 viewings', () => {
      expect(CommissionEngine.calcCloserCommission(deal, 0)).toBe(15000);
      expect(CommissionEngine.calcCloserCommission(deal, 1)).toBe(15000);
    });

    it('should calculate 20% commission for exactly 2 viewings', () => {
      expect(CommissionEngine.calcCloserCommission(deal, 2)).toBe(20000);
    });

    it('should calculate 25% commission for more than 2 viewings', () => {
      expect(CommissionEngine.calcCloserCommission(deal, 3)).toBe(25000);
    });
  });

  describe('evaluateInsideSalesKPI', () => {
    it('should return on track status when all targets are met', () => {
      const kpi: EmployeeKPI = {
        role: 'inside_sales',
        totalOwnersManaged: 100,
        newUnitsThisMonth: 50,
        dealsClosed: 2,
        viewingsToday: 0
      };
      const evaluation = CommissionEngine.evaluateInsideSalesKPI(kpi);
      expect(evaluation.meetsQuota).toBe(true);
      expect(evaluation.status).toBe('On Track');
    });

    it('should return needs improvement status when some targets are missed', () => {
      const kpi: EmployeeKPI = {
        role: 'inside_sales',
        totalOwnersManaged: 99,
        newUnitsThisMonth: 50,
        dealsClosed: 2,
        viewingsToday: 0
      };
      const evaluation = CommissionEngine.evaluateInsideSalesKPI(kpi);
      expect(evaluation.meetsQuota).toBe(false);
      expect(evaluation.status).toBe('Needs Improvement');
    });
  });
});
