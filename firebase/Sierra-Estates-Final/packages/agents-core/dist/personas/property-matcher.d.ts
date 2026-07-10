import { BaseAgent, type AgentResult } from '../base-agent';
import type { ExchangeRecord } from '@sierra-estates/exchange/exchange-client';
export declare class PropertyMatcherAgent extends BaseAgent {
    readonly name = "property-matcher";
    readonly description = "Matches a lead with suitable properties based on criteria.";
    private ai;
    constructor();
    execute(record: ExchangeRecord): Promise<AgentResult>;
}
//# sourceMappingURL=property-matcher.d.ts.map