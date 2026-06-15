import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
const PORT = 3000;

// Initialize data if not exists
const DATA_FILE = path.join(__dirname, 'data.json');
const defaultData = {
  isSiteUp: true,
  trafficCount: 0,
  reasons: [
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
       content: 'Attracted significant Foreign Direct Investment into the agricultural and manufacturing sectors, driving Anambra\'s industrialization.',
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
  ]
};

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2));
}

function getData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

function saveData(data: any) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Track visits middleware
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.includes('.')) {
    const data = getData();
    data.trafficCount += 1;
    saveData(data);
  }
  next();
});

// API Routes
app.get('/api/site-status', (req, res) => {
  const data = getData();
  res.json({ isSiteUp: data.isSiteUp, trafficCount: data.trafficCount });
});

app.get('/api/reasons', (req, res) => {
  const { search, category, page = 1, limit = 10 } = req.query;
  const data = getData();
  
  if (!data.isSiteUp) {
    return res.status(503).json({ error: 'Site is temporarily down for maintenance.' });
  }

  let filtered = data.reasons.filter((r: any) => r.status === 'approved');

  if (search) {
    const q = String(search).toLowerCase();
    filtered = filtered.filter((r: any) => 
      r.title.toLowerCase().includes(q) || 
      r.content.toLowerCase().includes(q)
    );
  }

  if (category) {
    filtered = filtered.filter((r: any) => r.category === category);
  }

  const total = filtered.length;
  const startIndex = (Number(page) - 1) * Number(limit);
  const paginated = filtered.slice(startIndex, startIndex + Number(limit));

  res.json({
    data: paginated,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit))
  });
});

app.post('/api/reasons', (req, res) => {
  const { name, email, category, content, citation, anonymous } = req.body;
  if (!category || !content || !citation) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const data = getData();
  const nextNumber = data.reasons.filter((r:any) => r.status === 'approved').length + 1; // Simplify assigning numbers
  
  const newReason = {
    id: Date.now().toString(),
    number: nextNumber, // assigned properly on approval, but keep here
    category,
    title: content.substring(0, 30) + '...',
    content,
    citation,
    status: 'pending',
    submittedBy: anonymous ? 'Anonymous' : (name || 'Anonymous'),
    email,
    anonymous
  };

  data.reasons.push(newReason);
  saveData(data);
  res.json({ message: 'Reason submitted for review!' });
});

app.get('/api/mod/reasons', (req, res) => {
  const data = getData();
  res.json({
    isSiteUp: data.isSiteUp,
    trafficCount: data.trafficCount,
    reasons: data.reasons.sort((a:any, b:any) => Number(b.id) - Number(a.id))
  });
});

app.post('/api/mod/reasons/:id/approve', (req, res) => {
  const data = getData();
  const reason = data.reasons.find((r: any) => r.id === req.params.id);
  if (reason) {
    reason.status = 'approved';
    // recalculate numbers purely for approved ones
    let num = 1;
    data.reasons.forEach((r: any) => {
      if(r.status === 'approved') {
        r.number = num++;
      }
    });
    saveData(data);
    res.json({ message: 'Approved' });
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

app.post('/api/mod/reasons/:id/delete', (req, res) => {
  const data = getData();
  data.reasons = data.reasons.filter((r: any) => r.id !== req.params.id);
  
  // recalculate numbers purely for approved ones
  let num = 1;
  data.reasons.forEach((r: any) => {
    if(r.status === 'approved') {
      r.number = num++;
    }
  });

  saveData(data);
  res.json({ message: 'Deleted' });
});

app.post('/api/mod/system/toggle', (req, res) => {
  const data = getData();
  data.isSiteUp = !data.isSiteUp;
  saveData(data);
  res.json({ isSiteUp: data.isSiteUp });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      if(req.path.startsWith('/api')) return res.status(404).end();
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
