import { adminDb } from '@/lib/server/firebase-admin';
import { sendTelegramMessage } from './telegram-controller';

export async function scheduleViewing(
  viewingId: string,
  scheduledDate: string
): Promise<void> {
  const doc = await adminDb.collection('viewingRequests').doc(viewingId).get();
  if (!doc.exists) throw new Error(`Viewing request not found: ${viewingId}`);

  const data = doc.data()!;

  await adminDb.collection('viewingRequests').doc(viewingId).update({
    scheduledDate,
    status: 'scheduled',
    updatedAt: new Date().toISOString(),
  });

  await sendTelegramMessage(
    `📅 *Viewing Scheduled*\n\n👤 ${data.stakeholderName}\n🏢 Asset: ${data.assetId}\n⏰ ${scheduledDate}`
  );
}

export async function completeViewing(
  viewingId: string,
  outcome: string,
  notes?: string
): Promise<void> {
  await adminDb.collection('viewingRequests').doc(viewingId).update({
    status: 'completed',
    outcome,
    notes: notes || '',
    completedAt: new Date().toISOString(),
  });
}
