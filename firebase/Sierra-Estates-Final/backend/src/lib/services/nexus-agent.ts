import { GoogleAIService } from '@/lib/server/google-ai';
import { adminDb } from '@/lib/server/firebase-admin';

const ai = new GoogleAIService();

export class NexusAgent {
  async processOrder(order: Record<string, unknown>): Promise<unknown> {
    const { instruction, context } = order as { instruction: string; context?: Record<string, unknown> };

    const tools = [
      { name: 'search_listings', description: 'Search portfolio assets by criteria' },
      { name: 'get_lead',        description: 'Fetch investment stakeholder details' },
      { name: 'create_proposal', description: 'Generate a property proposal' },
      { name: 'send_alert',      description: 'Send a Telegram alert to the team' },
    ];

    const result = await ai.generateContent(
      `You are the Nexus orchestration agent for Sierra Estates.\n\nAvailable tools: ${JSON.stringify(tools)}\n\nInstruction: ${instruction}\n\nContext: ${JSON.stringify(context || {})}\n\nDetermine the best course of action and return a JSON plan: {steps: [{tool, params}], summary}`
    );

    let plan: Record<string, unknown> = {};
    try { plan = JSON.parse(result); } catch { plan = { summary: result }; }

    // Execute steps
    const steps = (plan.steps as Array<{ tool: string; params: Record<string, unknown> }>) || [];
    const results: unknown[] = [];

    for (const step of steps) {
      try {
        const stepResult = await this.executeTool(step.tool, step.params);
        results.push(stepResult);
      } catch (err) {
        results.push({ error: String(err) });
      }
    }

    return { plan, results };
  }

  private async executeTool(tool: string, params: Record<string, unknown>): Promise<unknown> {
    switch (tool) {
      case 'search_listings': {
        const snap = await adminDb.collection('listings').where('status', '==', 'active').limit(10).get();
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      }
      case 'get_lead': {
        const { leadId } = params as { leadId: string };
        const doc = await adminDb.collection('leads').doc(leadId).get();
        return doc.exists ? { id: doc.id, ...doc.data() } : null;
      }
      default:
        return { skipped: true, tool };
    }
  }
}
