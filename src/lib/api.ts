import { Reason, AppState } from '../types';

// Default pre-approved reasons mapping to server.ts database structure
export const defaultReasons: Reason[] = [
  {
    id: '1',
    number: 1,
    category: 'Education',
    title: 'Education Rebirth in Anambra',
    content: 'Returned schools to missions and provided massive funding, moving Anambra from 24th to 1st in NECO/WAEC examinations.',
    citation: 'https://vanguardngr.com',
    readMoreLink: 'https://example.com/read-more',
    status: 'approved',
    submittedBy: 'Admin'
  },
  {
    id: '2',
    number: 2,
    category: 'Economy',
    title: 'Fiscal Prudence',
    content: 'Saved approximately 75 billion Naira in local and foreign currencies for Anambra State before leaving office, unprecedented in Nigeria.',
    citation: 'https://premiumtimesng.com',
    status: 'approved',
    submittedBy: 'Admin'
  },
  {
    id: '3',
    number: 3,
    category: 'Infrastructure',
    title: 'Massive Road Networks',
    content: 'Constructed over 800km of roads, giving Anambra the best road network in Nigeria and opening up rural agricultural areas.',
    citation: 'https://dailytrust.com',
    status: 'approved',
    submittedBy: 'Admin'
  },
  {
    id: '4',
    category: 'Governance',
    number: 4,
    title: 'Reducing Cost of Governance',
    content: "Cut down the governor's convoy, removed excessive security aides, and stopped using sirens to forcefully clear traffic, demonstrating servant leadership.",
    citation: 'https://punchng.com',
    status: 'approved'
  },
  {
    id: '5',
    number: 5,
    category: 'Healthcare',
    title: 'Healthcare Revitalization',
    content: 'Built the Chukwuemeka Odumegwu Ojukwu University Teaching Hospital from scratch, and revitalized several general hospitals across the state.',
    citation: 'https://channelstv.com',
    status: 'approved'
  },
  {
    id: '6',
    number: 6,
    category: 'Security',
    title: 'Unprecedented Security',
    content: 'Dismantled criminal networks in Anambra, heavily funding security agencies and community vigilantes, transforming the state into one of the safest in Nigeria.',
    citation: 'https://vanguardngr.com',
    status: 'approved',
    submittedBy: 'Admin'
  },
  {
    id: '7',
    number: 7,
    category: 'Economy',
    title: 'Foreign Direct Investment',
    content: "Attracted significant Foreign Direct Investment into the agricultural and manufacturing sectors, driving Anambra's industrialization.",
    citation: 'https://vanguardngr.com',
    status: 'approved',
    submittedBy: 'Admin'
  },
  {
    id: '8',
    number: 8,
    category: 'Governance',
    title: 'Integrity and Transparency',
    content: 'Demonstrated an unblemished record of transparency in public service, consistently rejecting embezzlement and corrupt practices.',
    citation: 'https://premiumtimesng.com',
    status: 'approved',
    submittedBy: 'Admin'
  },
  {
    id: '9',
    number: 9,
    category: 'Education',
    title: 'Digital Literacy in Schools',
    content: 'Initiated the distribution of laptops to secondary schools and equipped computer laboratories across the state to boost digital literacy.',
    citation: 'https://dailytrust.com',
    status: 'approved',
    submittedBy: 'Admin'
  },
  {
    id: '10',
    number: 10,
    category: 'Healthcare',
    title: 'Partnership with Health Agencies',
    content: 'Partnered with global health organizations to deliver immunizations and drastically reduce maternal and infant mortality rates.',
    citation: 'https://punchng.com',
    status: 'approved',
    submittedBy: 'Admin'
  },
  {
    id: '11',
    number: 11,
    category: 'Infrastructure',
    title: 'Public-Private Partnerships',
    content: 'Leveraged PPP models to develop state-of-the-art markets and business hubs, empowering local traders and SMEs.',
    citation: 'https://channelstv.com',
    status: 'approved',
    submittedBy: 'Admin'
  },
  {
    id: '12',
    number: 12,
    category: 'Other',
    title: 'Youth Empowerment',
    content: 'Created multiple skill acquisition programs and startup grants to foster youth entrepreneurship and reduce unemployment.',
    citation: 'https://vanguardngr.com',
    status: 'approved',
    submittedBy: 'Admin'
  }
];

// Initialize localStorage fallback if missing
const LOCAL_STORAGE_KEY_REASONS = '1000reasons_local_reasons';
const LOCAL_STORAGE_KEY_SITE_UP = '1000reasons_local_site_up';
const LOCAL_STORAGE_KEY_TRAFFIC = '1000reasons_local_traffic';

function getLocalReasons(): Reason[] {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY_REASONS);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_KEY_REASONS, JSON.stringify(defaultReasons));
    return defaultReasons;
  }
  return JSON.parse(data);
}

function saveLocalReasons(reasons: Reason[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY_REASONS, JSON.stringify(reasons));
}

function getLocalSiteUp(): boolean {
  const val = localStorage.getItem(LOCAL_STORAGE_KEY_SITE_UP);
  return val !== 'false';
}

function setLocalSiteUp(up: boolean) {
  localStorage.setItem(LOCAL_STORAGE_KEY_SITE_UP, String(up));
}

function getLocalTraffic(): number {
  const val = localStorage.getItem(LOCAL_STORAGE_KEY_TRAFFIC);
  if (!val) {
    const visits = 148; // cute starting visits counter for client mode
    localStorage.setItem(LOCAL_STORAGE_KEY_TRAFFIC, String(visits));
    return visits;
  }
  return parseInt(val, 10);
}

function incrementLocalTraffic() {
  const current = getLocalTraffic();
  localStorage.setItem(LOCAL_STORAGE_KEY_TRAFFIC, String(current + 1));
}

// Global detection if the server API fails or is completely absent
let isStaticFallbackMode = false;

// Graceful fetch utility
async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  if (isStaticFallbackMode) {
    throw new Error('FALLBACK');
  }

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      if (response.status === 404) {
        // Automatically switch to static fallback on first 404
        isStaticFallbackMode = true;
        console.warn('API route 404 detected. Enabling local client-side offline fallback.');
        throw new Error('FALLBACK');
      }
      if (response.status === 503) {
        throw new Error('Site is down for maintenance.');
      }
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json() as T;
  } catch (error: any) {
    if (error.message === 'Site is down for maintenance.') {
      throw error;
    }
    // Network errors or 404s trigger client fallback
    isStaticFallbackMode = true;
    console.warn('Backend server connection failed. Utilizing client-side storage simulator:', error);
    throw new Error('FALLBACK');
  }
}

export async function fetchReasons(options: {
  page: number;
  limit: number;
  category?: string;
  search?: string;
}): Promise<{ data: Reason[]; total: number; page: number; totalPages: number }> {
  const { page, limit, category, search } = options;
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (category && category !== 'All') {
    params.append('category', category);
  }
  if (search) {
    params.append('search', search);
  }

  try {
    return await apiFetch<{ data: Reason[]; total: number; page: number; totalPages: number }>(
      `/api/reasons?${params.toString()}`
    );
  } catch (err: any) {
    if (err.message === 'Site is down for maintenance.') {
      throw err;
    }
    // Simulation logic
    const isUp = getLocalSiteUp();
    if (!isUp) {
      throw new Error('Site is down for maintenance.');
    }

    incrementLocalTraffic();
    const local = getLocalReasons();
    let filtered = local.filter(r => r.status === 'approved');

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(r => 
        r.title.toLowerCase().includes(q) || 
        r.content.toLowerCase().includes(q)
      );
    }

    if (category && category !== 'All') {
      filtered = filtered.filter(r => r.category === category);
    }

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return {
      data: paginated,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1
    };
  }
}

export async function submitReason(formData: {
  name: string;
  email: string;
  category: string;
  content: string;
  citation: string;
  anonymous: boolean;
}): Promise<{ message: string }> {
  try {
    return await apiFetch<{ message: string }>('/api/reasons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
  } catch (err: any) {
    if (err.message === 'Site is down for maintenance.') {
      throw err;
    }

    // Submission client fallback
    const local = getLocalReasons();
    const approvedCount = local.filter(r => r.status === 'approved').length;
    const newReason: Reason = {
      id: Date.now().toString(),
      number: approvedCount + 1,
      category: formData.category,
      title: formData.content.substring(0, 30) + '...',
      content: formData.content,
      citation: formData.citation,
      status: 'pending',
      submittedBy: formData.anonymous ? 'Anonymous' : (formData.name || 'Anonymous'),
      email: formData.email,
      anonymous: formData.anonymous
    };

    local.push(newReason);
    saveLocalReasons(local);
    return { message: 'Reason submitted for review!' };
  }
}

export async function getModData(): Promise<{ isSiteUp: boolean; trafficCount: number; reasons: Reason[] }> {
  try {
    return await apiFetch<{ isSiteUp: boolean; trafficCount: number; reasons: Reason[] }>('/api/mod/reasons');
  } catch (err: any) {
    const local = getLocalReasons();
    return {
      isSiteUp: getLocalSiteUp(),
      trafficCount: getLocalTraffic(),
      reasons: [...local].sort((a, b) => Number(b.id) - Number(a.id))
    };
  }
}

export async function approveReason(id: string): Promise<{ message: string }> {
  try {
    return await apiFetch<{ message: string }>(`/api/mod/reasons/${id}/approve`, {
      method: 'POST'
    });
  } catch (err: any) {
    const local = getLocalReasons();
    const reason = local.find(r => r.id === id);
    if (reason) {
      reason.status = 'approved';
      // Recalculate approved numbers
      let num = 1;
      local.forEach(r => {
        if (r.status === 'approved') {
          r.number = num++;
        }
      });
      saveLocalReasons(local);
    }
    return { message: 'Approved' };
  }
}

export async function deleteReason(id: string): Promise<{ message: string }> {
  try {
    return await apiFetch<{ message: string }>(`/api/mod/reasons/${id}/delete`, {
      method: 'POST'
    });
  } catch (err: any) {
    let local = getLocalReasons();
    local = local.filter(r => r.id !== id);
    // Recalculate numbers
    let num = 1;
    local.forEach(r => {
      if (r.status === 'approved') {
        r.number = num++;
      }
    });
    saveLocalReasons(local);
    return { message: 'Deleted' };
  }
}

export async function toggleSystem(): Promise<{ isSiteUp: boolean }> {
  try {
    return await apiFetch<{ isSiteUp: boolean }>('/api/mod/system/toggle', {
      method: 'POST'
    });
  } catch (err: any) {
    const nextVal = !getLocalSiteUp();
    setLocalSiteUp(nextVal);
    return { isSiteUp: nextVal };
  }
}

export async function getSiteStatus(): Promise<{ isSiteUp: boolean; trafficCount: number }> {
  try {
    return await apiFetch<{ isSiteUp: boolean; trafficCount: number }>('/api/site-status');
  } catch (err: any) {
    return {
      isSiteUp: getLocalSiteUp(),
      trafficCount: getLocalTraffic()
    };
  }
}
