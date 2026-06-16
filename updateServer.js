import fs from 'fs';
import path from 'path';

const content = `import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

// Initialize Supabase if env vars exist
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

// Initialize data if not exists (Fallback)
const DATA_FILE = path.join(__dirname, 'data.json');
const defaultData = {
  isSiteUp: true,
  trafficCount: 148,
  reasons: [
    {
      id: '1', number: 1, category: 'Education', title: 'Education Rebirth in Anambra', content: 'Returned schools to missions and provided massive funding, moving Anambra from 24th to 1st in NECO/WAEC examinations.', citation: 'https://vanguardngr.com', status: 'approved', submittedBy: 'Admin'
    },
    {
      id: '2', number: 2, category: 'Economy', title: 'Fiscal Prudence', content: 'Saved approximately 75 billion Naira in local and foreign currencies for Anambra State before leaving office, unprecedented in Nigeria.', citation: 'https://premiumtimesng.com', status: 'approved', submittedBy: 'Admin'
    },
    {
      id: '3', number: 3, category: 'Infrastructure', title: 'Massive Road Networks', content: 'Constructed over 800km of roads, giving Anambra the best road network in Nigeria and opening up rural agricultural areas.', citation: 'https://dailytrust.com', status: 'approved', submittedBy: 'Admin'
    },
    {
      id: '4', category: 'Governance', number: 4, title: 'Reducing Cost of Governance', content: "Cut down the governor's convoy, removed excessive security aides, and stopped using sirens to forcefully clear traffic, demonstrating servant leadership.", citation: 'https://punchng.com', status: 'approved'
    }
  ]
};

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2));
}

function getLocalData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

function saveLocalData(data: any) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

async function getReasonByNumber(num: string | number) {
  if (supabase) {
    const { data } = await supabase.from('reasons').select('*').eq('number', num).eq('status', 'approved').single();
    return data;
  }
  return getLocalData().reasons.find((r: any) => String(r.number) === String(num) && r.status === 'approved');
}

// Track visits middleware
app.use(async (req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.includes('.')) {
    if (supabase) {
      try {
         const { data } = await supabase.from('system_status').select('trafficCount').single();
         if (data) {
           await supabase.from('system_status').update({ trafficCount: data.trafficCount + 1 }).eq('id', 1);
         }
      } catch(e) {}
    } else {
      const data = getLocalData();
      data.trafficCount += 1;
      saveLocalData(data);
    }
  }
  next();
});

// API Routes
app.get('/api/site-status', async (req, res) => {
  if (supabase) {
    const { data } = await supabase.from('system_status').select('*').single();
    if (data) {
      return res.json({ isSiteUp: data.isSiteUp, trafficCount: data.trafficCount });
    }
    return res.json({ isSiteUp: true, trafficCount: 0 });
  }
  const data = getLocalData();
  res.json({ isSiteUp: data.isSiteUp, trafficCount: data.trafficCount });
});

app.get('/api/reasons', async (req, res) => {
  const { search, category, page = 1, limit = 10 } = req.query;
  const pg = Number(page);
  const lmt = Number(limit);

  if (supabase) {
    const { data: statusData } = await supabase.from('system_status').select('isSiteUp').single();
    if (statusData && !statusData.isSiteUp) {
      return res.status(503).json({ error: 'Site is temporarily down for maintenance.' });
    }
    
    let query = supabase.from('reasons').select('*', { count: 'exact' }).eq('status', 'approved');
    if (search) {
      query = query.or(\`title.ilike.%\${search}%,content.ilike.%\${search}%\`);
    }
    if (category && category !== 'All') {
      query = query.eq('category', category);
    }

    const start = (pg - 1) * lmt;
    const { data, count } = await query.order('number', { ascending: false }).range(start, start + lmt - 1);
    
    return res.json({
      data: data || [],
      total: count || 0,
      page: pg,
      totalPages: Math.ceil((count || 0) / lmt)
    });
  }

  const data = getLocalData();
  if (!data.isSiteUp) return res.status(503).json({ error: 'Site is temporarily down for maintenance.' });

  let filtered = data.reasons.filter((r: any) => r.status === 'approved');
  if (search) {
    const q = String(search).toLowerCase();
    filtered = filtered.filter((r: any) => r.title.toLowerCase().includes(q) || r.content.toLowerCase().includes(q));
  }
  if (category && category !== 'All') {
    filtered = filtered.filter((r: any) => r.category === category);
  }

  const total = filtered.length;
  const startIndex = (pg - 1) * lmt;
  const paginated = filtered.slice(startIndex, startIndex + lmt);

  res.json({ data: paginated, total, page: pg, totalPages: Math.ceil(total / lmt) });
});

app.post('/api/reasons', async (req, res) => {
  const { name, email, category, content, citation, anonymous } = req.body;
  if (!category || !content || !citation) return res.status(400).json({ error: 'Missing required fields' });

  if (supabase) {
    // Generate a secure title
    const nextResult = await supabase.from('reasons').select('number').eq('status', 'approved').order('number', { ascending: false }).limit(1);
    const nextNumber = nextResult.data && nextResult.data.length > 0 ? (nextResult.data[0].number || 0) + 1 : 1;

    const { error } = await supabase.from('reasons').insert([{
      number: nextNumber, // Assigned on approval officially, but staged here
      category,
      title: content.substring(0, 30) + '...',
      content,
      citation,
      status: 'pending',
      submittedBy: anonymous ? 'Anonymous' : (name || 'Anonymous'),
      email,
      anonymous
    }]);

    if (error) return res.status(500).json({ error: 'Failed to submit.' });
    return res.json({ message: 'Reason submitted for review!' });
  }

  const data = getLocalData();
  const nextNumber = data.reasons.filter((r:any) => r.status === 'approved').length + 1;
  const newReason = {
    id: Date.now().toString(), number: nextNumber, category, title: content.substring(0, 30) + '...', content, citation, status: 'pending', submittedBy: anonymous ? 'Anonymous' : (name || 'Anonymous'), email, anonymous
  };
  data.reasons.push(newReason);
  saveLocalData(data);
  res.json({ message: 'Reason submitted for review!' });
});

app.get('/api/mod/reasons', async (req, res) => {
  if (supabase) {
    const { data: statusData } = await supabase.from('system_status').select('*').single();
    const { data: reasons } = await supabase.from('reasons').select('*').order('created_at', { ascending: false });
    return res.json({
      isSiteUp: statusData ? statusData.isSiteUp : true,
      trafficCount: statusData ? statusData.trafficCount : 0,
      reasons: reasons || []
    });
  }

  const data = getLocalData();
  res.json({
    isSiteUp: data.isSiteUp,
    trafficCount: data.trafficCount,
    reasons: data.reasons.sort((a:any, b:any) => Number(b.id) - Number(a.id))
  });
});

app.post('/api/mod/reasons/:id/approve', async (req, res) => {
  if (supabase) {
    const { data: reason } = await supabase.from('reasons').select('*').eq('id', req.params.id).single();
    if (!reason) return res.status(404).json({ error: 'Not found' });
    
    await supabase.from('reasons').update({ status: 'approved' }).eq('id', req.params.id);
    
    // Recalculate numbers
    const { data: approved } = await supabase.from('reasons').select('id').eq('status', 'approved').order('created_at', { ascending: true });
    if (approved) {
      for (let i = 0; i < approved.length; i++) {
        await supabase.from('reasons').update({ number: i + 1 }).eq('id', approved[i].id);
      }
    }
    return res.json({ message: 'Approved' });
  }

  const data = getLocalData();
  const reason = data.reasons.find((r: any) => String(r.id) === req.params.id);
  if (reason) {
    reason.status = 'approved';
    let num = 1;
    data.reasons.forEach((r: any) => {
      if(r.status === 'approved') r.number = num++;
    });
    saveLocalData(data);
    return res.json({ message: 'Approved' });
  }
  res.status(404).json({ error: 'Not found' });
});

app.post('/api/mod/reasons/:id/delete', async (req, res) => {
  if (supabase) {
    await supabase.from('reasons').delete().eq('id', req.params.id);
    // Recalculate numbers
    const { data: approved } = await supabase.from('reasons').select('id').eq('status', 'approved').order('created_at', { ascending: true });
    if (approved) {
      for (let i = 0; i < approved.length; i++) {
        await supabase.from('reasons').update({ number: i + 1 }).eq('id', approved[i].id);
      }
    }
    return res.json({ message: 'Deleted' });
  }

  const data = getLocalData();
  data.reasons = data.reasons.filter((r: any) => String(r.id) !== req.params.id);
  let num = 1;
  data.reasons.forEach((r: any) => {
    if(r.status === 'approved') r.number = num++;
  });
  saveLocalData(data);
  res.json({ message: 'Deleted' });
});

app.post('/api/mod/system/toggle', async (req, res) => {
  if (supabase) {
    const { data } = await supabase.from('system_status').select('isSiteUp').single();
    if (data) {
      const newState = !data.isSiteUp;
      await supabase.from('system_status').update({ isSiteUp: newState }).eq('id', 1);
      return res.json({ isSiteUp: newState });
    }
    return res.json({ isSiteUp: false });
  }

  const data = getLocalData();
  data.isSiteUp = !data.isSiteUp;
  saveLocalData(data);
  res.json({ isSiteUp: data.isSiteUp });
});

// Pre-load font for OG Image Generation
let fontBuffer: ArrayBuffer | null = null;
fetch('https://raw.githubusercontent.com/rsms/inter/master/docs/font-files/Inter-SemiBold.woff')
  .then(res => res.arrayBuffer())
  .then(buffer => { fontBuffer = buffer; })
  .catch(err => console.error('Failed to load font:', err));

app.get('/api/og', async (req, res) => {
  try {
    const { reason: queryReason } = req.query;
    if (!queryReason) return res.status(400).send('Reason query parameter required');

    const reason = await getReasonByNumber(queryReason as string);

    if (!reason || !fontBuffer) {
      return res.status(404).send('Not Found');
    }

    const svg = await satori(
      {
        type: 'div',
        props: {
          style: { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#1E293B', width: '1200px', height: '630px', padding: '80px', color: 'white', fontFamily: 'Inter', textAlign: 'center' },
          children: [
            { type: 'div', props: { style: { fontSize: '80px', fontWeight: 600, color: '#60A5FA', marginBottom: '40px', lineHeight: 1 }, children: \`Reason #\${String(reason.number).padStart(3, '0')}\` } },
            { type: 'div', props: { style: { fontSize: '48px', fontWeight: 600, color: '#CBD5E1', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }, children: reason.content } },
            { type: 'div', props: { style: { position: 'absolute', bottom: '40px', fontSize: '32px', color: '#94A3B8', fontWeight: 600 }, children: '1000 Reasons • Documenting Institutional Legacy' } }
          ],
        },
      },
      { width: 1200, height: 630, fonts: [{ name: 'Inter', data: fontBuffer, weight: 600, style: 'normal' }] }
    );

    const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(pngBuffer);
  } catch (err) {
    console.error('OG Image Generation Error:', err);
    res.status(500).send('Server Error');
  }
});

async function injectHTML(req: any, templateString: string) {
  let html = templateString;
  const url = new URL(req.originalUrl, \`http://\${req.headers.host || 'localhost'}\`);
  const searchParams = url.searchParams;
  const reasonNum = searchParams.get('reason');

  if (req.path === '/explore' && reasonNum) {
    const reason = await getReasonByNumber(reasonNum);
    if (reason) {
      const ogTitle = \`Reason #\${String(reason.number).padStart(3, '0')} | 1000 Reasons\`;
      const ogDesc = reason.content;
      const ogImage = \`https://\${req.get('host')}/api/og?reason=\${reason.number}\`;

      html = html.replace('<title>1000 Reasons</title>', \`<title>\${ogTitle}</title>\`);
      const ogTags = \`
    <meta property="og:title" content="\${ogTitle}" />
    <meta property="og:description" content="\${ogDesc}" />
    <meta property="og:image" content="\${ogImage}" />
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:image" content="\${ogImage}" />\`;
      html = html.replace('</head>', \`\${ogTags}\\n  </head>\`);
    }
  }
  return html;
}

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'custom' });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      if(req.path.startsWith('/api')) return next();
      try {
        const urlLoc = req.originalUrl;
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(urlLoc, template);
        template = await injectHTML(req, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { index: false }));
    app.get('*', async (req, res) => {
      if(req.path.startsWith('/api')) return res.status(404).end();
      try {
        let template = fs.readFileSync(path.join(distPath, 'index.html'), 'utf-8');
        template = await injectHTML(req, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        res.status(500).end('Server Error');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(\`Server running on port \${PORT}\`);
  });
}

startServer();
`;

fs.writeFileSync(path.join(__dirname, 'server.ts'), content);
console.log('Successfully updated server.ts!');
