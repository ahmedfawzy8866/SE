import { POST } from '../route';
import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/server/firebase-admin';
import { sendTelegramMessage } from '@/lib/services/telegram-controller';

// Mock the modules
jest.mock('@/lib/server/firebase-admin', () => {
  const mockAdd = jest.fn();
  const mockCollection = jest.fn(() => ({
    add: mockAdd,
  }));
  return {
    adminDb: {
      collection: mockCollection,
    },
  };
});

jest.mock('@/lib/services/telegram-controller', () => ({
  sendTelegramMessage: jest.fn(),
}));

describe('CRM Leads API POST', () => {
  const mockCollection = adminDb.collection as jest.Mock;
  const mockSendTelegram = sendTelegramMessage as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if name is missing', async () => {
    const req = new NextRequest('http://localhost/api/leads', {
      method: 'POST',
      body: JSON.stringify({
        phone: '+1234567890',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('Missing required fields');
  });

  it('should return 400 if phone is missing', async () => {
    const req = new NextRequest('http://localhost/api/leads', {
      method: 'POST',
      body: JSON.stringify({
        name: 'John Doe',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('Missing required fields');
  });

  it('should create lead and return 200 on success', async () => {
    const mockAdd = jest.fn().mockResolvedValue({ id: 'lead_123' });
    mockCollection.mockReturnValue({ add: mockAdd });
    mockSendTelegram.mockResolvedValue(true);

    const req = new NextRequest('http://localhost/api/leads', {
      method: 'POST',
      body: JSON.stringify({
        name: 'John Doe',
        phone: '+1234567890',
        email: 'john@example.com',
        budget: '5M',
        preferredCompounds: ['Mivida'],
        notes: 'Interested in a 2-bed apartment',
        source: 'web',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.id).toBe('lead_123');

    expect(mockCollection).toHaveBeenCalledWith('leads');
    expect(mockAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'John Doe',
        phone: '+1234567890',
        email: 'john@example.com',
        budget: '5M',
        preferredCompounds: ['Mivida'],
        notes: 'Interested in a 2-bed apartment',
        source: 'web',
        status: 'new',
        stage: 'S1_intake',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      })
    );
    expect(mockSendTelegram).toHaveBeenCalledWith(
      expect.stringContaining('New Investment Stakeholder')
    );
  });

  it('should return 500 when database insertion fails', async () => {
    const mockAdd = jest.fn().mockRejectedValue(new Error('Firestore error'));
    mockCollection.mockReturnValue({ add: mockAdd });

    const req = new NextRequest('http://localhost/api/leads', {
      method: 'POST',
      body: JSON.stringify({
        name: 'John Doe',
        phone: '+1234567890',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe('Failed to create stakeholder');
  });
});
