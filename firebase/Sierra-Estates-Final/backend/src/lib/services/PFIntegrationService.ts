import { adminDb } from '@/lib/server/firebase-admin';
import { PropertyFinderService } from './PropertyFinderService';

const pf = PropertyFinderService.getInstance();

export class PFIntegrationService {
  async syncIncomingLeads(): Promise<{ synced: number; errors: number }> {
    let synced = 0;
    let errors = 0;

    try {
      const data = await pf.get('leads', { limit: '50', status: 'new' });
      const leads = (data as { data?: unknown[] }).data || [];

      for (const lead of leads as Record<string, unknown>[]) {
        try {
          await adminDb.collection('leads').add({
            ...lead,
            source: 'property_finder',
            status: 'new',
            stage: 'S1_intake',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          synced++;
        } catch {
          errors++;
        }
      }
    } catch (err) {
      console.error('[PFIntegrationService] syncIncomingLeads failed:', err);
      errors++;
    }

    return { synced, errors };
  }

  async syncIncomingListings(): Promise<{ synced: number; errors: number }> {
    let synced = 0;
    let errors = 0;

    try {
      const data = await pf.get('properties', { limit: '100', location_id: 'cairo-new-cairo' });
      const listings = (data as { data?: unknown[] }).data || [];

      for (const listing of listings as Record<string, unknown>[]) {
        try {
          await adminDb.collection('listings').add({
            ...listing,
            source: 'property_finder',
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          synced++;
        } catch {
          errors++;
        }
      }
    } catch (err) {
      console.error('[PFIntegrationService] syncIncomingListings failed:', err);
      errors++;
    }

    return { synced, errors };
  }

  async publishListing(listingId: string): Promise<{ success: boolean; id?: string; error?: string }> {
    const doc = await adminDb.collection('listings').doc(listingId).get();
    if (!doc.exists) return { success: false, error: 'Listing not found' };

    const data = doc.data()!;

    try {
      const result = await pf.post('properties', {
        title:           data.title,
        price:           data.price,
        area:            data.area,
        bedrooms:        data.bedrooms,
        bathrooms:       data.bathrooms,
        location_id:     'cairo-new-cairo',
        property_type:   data.propertyType || 'apartment',
        purpose:         'sale',
        description:     data.description || '',
        images:          data.images || [],
      }) as { id?: string };

      await adminDb.collection('listings').doc(listingId).update({
        syncedToPF: true,
        pfId: result.id || null,
        syncedAt: new Date().toISOString(),
      });

      return { success: true, id: result.id };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  }
}
