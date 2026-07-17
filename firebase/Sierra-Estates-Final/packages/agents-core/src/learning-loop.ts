/**
 * Learning Loop - Sierra Estates Agent Self-Improvement System
 * 
 * This module implements the "develop themselves day after day" requirement.
 * 
 * How it works:
 * 1. COLLECT: Every agent execution is logged to shared memory
 * 2. ANALYZE: Nightly (or after N executions), analyze patterns and outcomes
 * 3. EXTRACT: Identify successful patterns and failure modes
 * 4. TEACH: Write insights back to shared memory so all agents improve
 * 5. ADAPT: Each agent reads insights on startup and enriches their system prompt
 * 
 * Insights are stored in obedian-store.json with tag 'learning-insight'
 * and grow cumulatively over time, making the agent network smarter each day.
 */

import { sharedMemory, SharedMemoryEntry } from '@sierra-estates/memory-engine'


// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ExecutionRecord {
  agentName: string
  taskDescription: string
  intent?: string
  output: string
  success: boolean
  durationMs?: number
  clientPhone?: string
  timestamp: string
}

export interface LearningInsight {
  category: 'successful_pattern' | 'failure_mode' | 'client_preference' | 'market_trend'
  agentName: string
  description: string
  evidence: string[]
  confidence: number
  discoveredAt: string
  timesReinforced: number
}

export interface LearningReport {
  generatedAt: string
  executionsAnalyzed: number
  newInsights: number
  reinforcedInsights: number
  insights: LearningInsight[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Execution Recorder
// ─────────────────────────────────────────────────────────────────────────────

export async function recordExecution(record: ExecutionRecord): Promise<void> {
  const id = `execution-${record.agentName}-${Date.now()}`
  await sharedMemory.write(id, record, {
    author: record.agentName as any,
    tags: ['execution-log', record.agentName, record.success ? 'success' : 'failure'],
    // Keep execution logs for 30 days
    ttl: 30 * 24 * 60 * 60 * 1000,
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Pattern Analyzer
// ─────────────────────────────────────────────────────────────────────────────

export class LearningLoop {
  private minExecutionsToAnalyze: number
  private confidenceThreshold: number

  constructor(options?: { minExecutions?: number; confidenceThreshold?: number }) {
    this.minExecutionsToAnalyze = options?.minExecutions ?? 10
    this.confidenceThreshold = options?.confidenceThreshold ?? 0.6
  }

  /**
   * Main analysis method - run nightly or after every N executions.
   * Analyzes all execution logs and extracts learnable patterns.
   */
  async runAnalysis(): Promise<LearningReport> {
    const startedAt = Date.now()
    console.log('[LearningLoop] Starting analysis...')

    // Fetch all execution logs
    const rawEntries = await sharedMemory.search('', ['execution-log'])
    const executions: ExecutionRecord[] = rawEntries
      .map((e: SharedMemoryEntry) => {
        const payload = e.value as { _meta?: unknown; data?: ExecutionRecord }
        return payload?.data ?? (e.value as ExecutionRecord)
      })
      .filter((e: ExecutionRecord | null) => e && e.agentName)


    if (executions.length < this.minExecutionsToAnalyze) {
      console.log(`[LearningLoop] Not enough data yet (${executions.length}/${this.minExecutionsToAnalyze}). Skipping.`)
      return {
        generatedAt: new Date().toISOString(),
        executionsAnalyzed: executions.length,
        newInsights: 0,
        reinforcedInsights: 0,
        insights: [],
      }
    }

    const insights: LearningInsight[] = []

    // ── Analyze Success Patterns by Agent ───────────────────────────────────
    const byAgent = this.groupBy(executions, (e) => e.agentName)
    for (const [agent, agentExecs] of Object.entries(byAgent)) {
      const successRate = agentExecs.filter((e) => e.success).length / agentExecs.length
      const avgDuration = agentExecs.reduce((sum, e) => sum + (e.durationMs ?? 0), 0) / agentExecs.length

      if (successRate >= this.confidenceThreshold) {
        insights.push({
          category: 'successful_pattern',
          agentName: agent,
          description: `${agent} achieves ${Math.round(successRate * 100)}% success rate`,
          evidence: agentExecs
            .filter((e) => e.success)
            .slice(0, 3)
            .map((e) => e.taskDescription),
          confidence: successRate,
          discoveredAt: new Date().toISOString(),
          timesReinforced: 0,
        })
      }

      if (successRate < 0.4) {
        const failureReasons = agentExecs
          .filter((e) => !e.success)
          .slice(0, 3)
          .map((e) => e.taskDescription)

        insights.push({
          category: 'failure_mode',
          agentName: agent,
          description: `${agent} struggles with certain task types. Review these patterns.`,
          evidence: failureReasons,
          confidence: 1 - successRate,
          discoveredAt: new Date().toISOString(),
          timesReinforced: 0,
        })
      }
    }

    // ── Analyze Client Preference Patterns ──────────────────────────────────
    const conversationEntries = await sharedMemory.search('', ['conversation-history'])
    const clientMessages = conversationEntries
      .map((e: SharedMemoryEntry) => {
        const payload = e.value as { data?: { message?: string; direction?: string } }
        return payload?.data
      })
      .filter((d: any) => d?.direction === 'inbound' && d?.message)

    if (clientMessages.length >= 5) {
      const propertyTypePattern = clientMessages.filter((m: any) =>
        /شقة|apartment/i.test(m!.message!)
      ).length
      const villaPattern = clientMessages.filter((m: any) =>
        /فيلا|villa/i.test(m!.message!)
      ).length


      if (propertyTypePattern > villaPattern * 2) {
        insights.push({
          category: 'client_preference',
          agentName: 'sierra',
          description: 'Most clients prefer apartments over villas. Prioritize apartment matches.',
          evidence: [`${propertyTypePattern} apartment mentions vs ${villaPattern} villa mentions`],
          confidence: 0.8,
          discoveredAt: new Date().toISOString(),
          timesReinforced: 0,
        })
      }
    }

    // ── Reinforce existing insights ──────────────────────────────────────────
    const existingInsights = await sharedMemory.search('', ['learning-insight'])
    let reinforcedCount = 0

    for (const existing of existingInsights) {
      const payload = existing.value as { data?: LearningInsight }
      const insight = payload?.data
      if (!insight) continue

      // Check if any new insight corroborates an existing one
      const corroborated = insights.find(
        (ni) => ni.category === insight.category && ni.agentName === insight.agentName
      )
      if (corroborated) {
        await sharedMemory.write(existing.id, {
          ...insight,
          timesReinforced: insight.timesReinforced + 1,
          confidence: Math.min(1.0, insight.confidence + 0.05),
          lastReinforced: new Date().toISOString(),
        }, {
          author: 'system',
          tags: ['learning-insight', insight.agentName, insight.category],
        })
        reinforcedCount++
      }
    }

    // ── Save new insights to shared memory ───────────────────────────────────
    for (const insight of insights) {
      await sharedMemory.saveInsight(
        `${insight.agentName}-${insight.category}-${Date.now()}`,
        insight,
        'system',
        ['learning-insight', insight.agentName, insight.category]
      )
    }

    const report: LearningReport = {
      generatedAt: new Date().toISOString(),
      executionsAnalyzed: executions.length,
      newInsights: insights.length,
      reinforcedInsights: reinforcedCount,
      insights,
    }

    // Save the report itself
    await sharedMemory.write(`learning-report-${Date.now()}`, report, {
      author: 'system',
      tags: ['learning-report'],
      ttl: 90 * 24 * 60 * 60 * 1000, // Keep reports 90 days
    })

    const elapsed = Date.now() - startedAt
    console.log(
      `[LearningLoop] Analysis complete in ${elapsed}ms. ` +
      `New insights: ${insights.length}, Reinforced: ${reinforcedCount}`
    )

    return report
  }

  /**
   * Fetch all current insights for a specific agent (used at startup to enrich prompts)
   */
  async getInsightsForAgent(agentName: string): Promise<LearningInsight[]> {
    const entries = await sharedMemory.search('', ['learning-insight', agentName])
    return entries
      .map((e: SharedMemoryEntry) => {
        const payload = e.value as { data?: LearningInsight }
        return payload?.data
      })
      .filter((i: LearningInsight | undefined): i is LearningInsight => !!i)
      .sort((a: LearningInsight, b: LearningInsight) => b.confidence - a.confidence)
  }


  /**
   * Generate enriched system prompt additions from insights
   */
  async generateInsightContext(agentName: string): Promise<string> {
    const insights = await this.getInsightsForAgent(agentName)

    if (insights.length === 0) {
      return ''
    }

    const lines = insights.map((i) =>
      `[${i.category.toUpperCase()}] (confidence: ${Math.round(i.confidence * 100)}%) ${i.description}`
    )

    return `
=========================================
LEARNED INSIGHTS (auto-updated daily)
=========================================
${lines.join('\n')}
=========================================
`
  }

  // ── Scheduler ──────────────────────────────────────────────────────────────

  /**
   * Start the nightly learning cron (runs every 24h by default)
   */
  startNightlyCron(intervalMs: number = 24 * 60 * 60 * 1000): any {
    console.log(`[LearningLoop] Nightly cron started. Interval: ${intervalMs / 3600000}h`)
    return setInterval(async () => {
      try {
        const report = await this.runAnalysis()
        console.log(`[LearningLoop] Nightly report: ${report.newInsights} new insights discovered.`)
      } catch (err) {
        console.error('[LearningLoop] Cron analysis failed:', err)
      }
    }, intervalMs)
  }


  // ── Helpers ────────────────────────────────────────────────────────────────

  private groupBy<T>(arr: T[], keyFn: (item: T) => string): Record<string, T[]> {
    return arr.reduce((groups, item) => {
      const key = keyFn(item)
      if (!groups[key]) groups[key] = []
      groups[key].push(item)
      return groups
    }, {} as Record<string, T[]>)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Singleton
// ─────────────────────────────────────────────────────────────────────────────

export const learningLoop = new LearningLoop()
export default learningLoop
