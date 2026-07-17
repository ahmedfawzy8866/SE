export interface AgentProfile {
    name: string;
    domain: string;
    description: string;
    systemPrompt: string;
    ruleRef?: string;
    dnaRef?: string;
}
export declare class AgentRegistry {
    private srcDir;
    private profiles;
    constructor(customSrcDir?: string);
    private loadAllProfiles;
    private parseMarkdownProfile;
    getAgent(name: string): AgentProfile | null;
    listAgents(): AgentProfile[];
}
export declare const registry: AgentRegistry;
//# sourceMappingURL=registry.d.ts.map