/**
 * Sierra Estates — COMMISSION & KPI ENGINE
 * Calculates commissions and tracks targets for Inside Sales, Closers, and Team Leaders.
 */

export interface DealDetails {
  type: 'rent' | 'sale';
  amount: number;
  source: 'owner' | 'broker';
  broughtBy: 'self' | 'other';
  handledBy: 'self' | 'other';
}

export interface EmployeeKPI {
  role: 'inside_sales' | 'closer' | 'team_leader';
  totalOwnersManaged: number;
  newUnitsThisMonth: number;
  dealsClosed: number;
  viewingsToday: number;
}

export class CommissionEngine {
  /**
   * Calculates commission for Inside Sales (Acquisition/Listing)
   */
  static calcInsideSalesCommission(deal: DealDetails): number {
    let commission = 0;
    
    if (deal.type === 'rent') {
      // 10% from tenant (if they handled the tenant)
      if (deal.handledBy === 'self') {
        commission += deal.amount * 0.10;
      }
      
      // Owner/Broker commission
      if (deal.source === 'owner') {
        commission += deal.amount * 0.15; // 15% from owner
      } else if (deal.source === 'broker') {
        commission += deal.amount * 0.05; // 5% from broker
      }
      
      // Split deal logic
      if (deal.broughtBy === 'self' && deal.handledBy === 'other') {
        commission += deal.amount * 0.10; // Brought the unit but someone else closed
      } else if (deal.broughtBy === 'other' && deal.handledBy === 'self') {
        commission += deal.amount * 0.125; // Someone else brought the unit, but this agent closed it
      }
    }
    
    return Math.round(commission);
  }

  /**
   * Calculates commission for Field Closers
   * Closers get 15% base. 20% if 2 viewings/day. 25% if > 2 viewings/day.
   */
  static calcCloserCommission(deal: DealDetails, dailyViewings: number): number {
    let percentage = 0.15;
    
    if (dailyViewings === 2) {
      percentage = 0.20;
    } else if (dailyViewings > 2) {
      percentage = 0.25;
    }
    
    return Math.round(deal.amount * percentage);
  }

  /**
   * Validates if an Inside Sales rep has met their monthly KPIs
   */
  static evaluateInsideSalesKPI(kpi: EmployeeKPI): {
    meetsQuota: boolean;
    status: string;
  } {
    const isOwnerQuotaMet = kpi.totalOwnersManaged >= 100;
    const isUnitTargetMet = kpi.newUnitsThisMonth >= 50; // Total 50/month (20 available, 20 rented, etc.)
    const isDealTargetMet = kpi.dealsClosed >= 2; // 2 rentals or 1 sale
    
    const meetsQuota = isOwnerQuotaMet && isUnitTargetMet && isDealTargetMet;
    
    return {
      meetsQuota,
      status: meetsQuota ? 'On Track' : 'Needs Improvement'
    };
  }
}
