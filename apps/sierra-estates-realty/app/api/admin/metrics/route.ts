/**
 * GET /api/admin/metrics
 *
 * Exposes the admin dashboard metrics (KPIs, live pipeline-stage breakdown,
 * recent lead activity) that lib/services/dashboard-metrics.ts already
 * computed but which had no route wiring it to the admin UI. Reimplemented
 * here against the Admin SDK (adminDb) to match the other admin routes'
 * convention — server-side, auth-guarded, bypasses Firestore rules — rather
 * than calling the client-SDK service.
 *
 * Query params:
 *   ?type=kpis | pipeline | activity | all   (default: all)
 *   ?limit=<n>  recent-activity rows (default 8, max 50)
 */
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/server/auth-guard';
import { adminDb } from '@/lib/server/firebase-admin';
import { COLLECTIONS, type PipelineStage } from '@/lib/models/schema';
import type { QueryDocumentSnapshot, DocumentData } from 'firebase-admin/firestore';
import { logger } from '@/lib/logger';

/** All PipelineStage values except the closed-won terminal state. */
const ACTIVE_STAGES: PipelineStage[] = [
  'inbound', 'qualify', 'engage', 'proposal', 'viewing', 'negotiate', 'reserve', 'contract', 'handover',
];

export async function GET(req: NextRequest) {
  const authResult = await verifyAdminRequest(req);
  if (!authResult.authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'all';
    const activityLimit = Math.min(Math.max(Number(searchParams.get('limit')) || 8, 1), 50);

    const data: Record<string, unknown> = {};

    if (type === 'kpis' || type === 'all') {
      const [unitsSnap, activeSnap, syncSnap] = await Promise.all([
        adminDb.collection(COLLECTIONS.units).count().get(),
        adminDb.collection(COLLECTIONS.stakeholders).where('stage', 'in', ACTIVE_STAGES).count().get(),
        adminDb.collection(COLLECTIONS.syncLog).orderBy('createdAt', 'desc').limit(1).get(),
      ]);

      data.kpis = {
        totalUnits: unitsSnap.data().count,
        activeLeads: activeSnap.data().count,
        syncStatus: syncSnap.empty ? null : (syncSnap.docs[0].data().status as string) ?? null,
      };
    }

    if (type === 'pipeline' || type === 'all') {
      const stages: PipelineStage[] = [...ACTIVE_STAGES, 'closed-won'];
      const counts = await Promise.all(
        stages.map((stage) =>
          adminDb.collection(COLLECTIONS.stakeholders).where('stage', '==', stage).count().get()
            .then((snap) => snap.data().count)
            .catch((err) => {
              logger.error(`metrics: pipeline count failed for stage=${stage}:`, err);
              return 0;
            })
        )
      );
      data.pipeline = Object.fromEntries(stages.map((s, i) => [s, counts[i]]));
    }

    if (type === 'activity' || type === 'all') {
      const snap = await adminDb
        .collection(COLLECTIONS.stakeholders)
        .orderBy('updatedAt', 'desc')
        .limit(activityLimit)
        .get();

      data.recentActivity = snap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => {
        const doc = d.data();
        return {
          id: d.id,
          name: doc.name ?? null,
          stage: doc.stage ?? null,
          source: doc.source ?? null,
          updatedAt: doc.updatedAt?.toDate?.()?.toISOString?.() ?? null,
          budget: doc.budget ?? null,
        };
      });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    logger.error('Error fetching admin metrics:', err);
    return NextResponse.json(
      { error: 'Failed to fetch metrics', details: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
