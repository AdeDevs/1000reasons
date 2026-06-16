import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_ANON_KEY || '');

async function seedData() {
  const DATA_FILE = path.join(__dirname, 'data.json');
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  
  for (const reason of data.reasons) {
    const { data: existing, error: errExisting } = await supabase.from('reasons').select('id').eq('number', reason.number).single();
    if (!existing) {
      console.log(`Inserting reason ${reason.number}`);
      const { error } = await supabase.from('reasons').insert([{
        number: reason.number,
        category: reason.category,
        title: reason.title,
        content: reason.content,
        citation: reason.citation,
        readMoreLink: reason.readMoreLink || null,
        status: reason.status || 'approved',
        submittedBy: reason.submittedBy || 'Admin',
        anonymous: reason.anonymous || false
      }]);
      if (error) console.error(`Error inserting reason ${reason.number}:`, error);
    } else {
      console.log(`Reason ${reason.number} already exists`);
    }
  }
}

seedData();
