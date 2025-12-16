/**
 * Script to seed mock data via API
 * This logs in as teste@teste.com and creates mock patients, notes, and medications
 */

import { createClient } from '@supabase/supabase-js';

const BASE_URL = process.env.BASE_URL || 'https://medical-annotations.vercel.app';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Mock data
const mockPatients = [
  { nome: 'John Smith', dataNascimento: '1985-03-15' },
  { nome: 'Mary Johnson', dataNascimento: '1990-07-22' },
  { nome: 'Robert Williams', dataNascimento: '1978-11-08' }
];

const mockNotes = {
  'John Smith': [
    {
      data: '2025-01-13',
      horaDormiu: '22:30',
      horaAcordou: '07:00',
      humor: 4,
      detalhesExtras: 'Patient reported a good night of sleep. No complications.',
      tags: ['Sleep', 'Wellbeing'],
      hourlyNotes: [
        { hora: '08:00', descricao: 'Complete breakfast. Good appetite.' },
        { hora: '12:00', descricao: 'Lunch without complications.' },
        { hora: '15:00', descricao: 'Participated in occupational therapy.' },
        { hora: '19:00', descricao: 'Quiet dinner. Talked with family members.' }
      ]
    },
    {
      data: '2025-01-14',
      horaDormiu: '23:00',
      horaAcordou: '06:30',
      humor: 3,
      detalhesExtras: 'Woke up tired. Reported difficulty falling asleep.',
      tags: ['Sleep', 'Fatigue']
    },
    {
      data: '2025-01-15',
      horaDormiu: '22:00',
      horaAcordou: '07:30',
      humor: 5,
      detalhesExtras: 'Excellent disposition. Slept well.',
      tags: ['Sleep', 'Energy']
    }
  ],
  'Mary Johnson': [
    {
      data: '2025-01-13',
      horaDormiu: '21:30',
      horaAcordou: '06:00',
      humor: 4,
      detalhesExtras: 'Productive day. No complaints.',
      tags: ['Routine', 'Productivity'],
      hourlyNotes: [
        { hora: '09:00', descricao: 'Group session. Active participation.' },
        { hora: '14:00', descricao: 'Garden walk.' },
        { hora: '18:00', descricao: 'Family visit. Good mood.' }
      ]
    },
    {
      data: '2025-01-14',
      horaDormiu: '22:30',
      horaAcordou: '07:00',
      humor: 5,
      detalhesExtras: 'Great mood. Participated in group activities.',
      tags: ['Social', 'Wellbeing']
    },
    {
      data: '2025-01-15',
      horaDormiu: null,
      horaAcordou: null,
      humor: 2,
      detalhesExtras: 'Patient reported anxiety. Follow-up needed.',
      tags: ['Anxiety', 'Follow-up']
    }
  ],
  'Robert Williams': [
    {
      data: '2025-01-13',
      horaDormiu: '23:30',
      horaAcordou: '08:00',
      humor: 3,
      detalhesExtras: 'Quiet night. Woke up rested.',
      tags: ['Sleep']
    },
    {
      data: '2025-01-14',
      horaDormiu: '22:00',
      horaAcordou: '07:00',
      humor: 4,
      detalhesExtras: 'Good day. Participated in physical therapy.',
      tags: ['Physical Therapy', 'Wellbeing']
    }
  ]
};

const mockMedications = {
  'John Smith': [
    {
      nome: 'Fluoxetine',
      dosagem: '20mg',
      frequencia: 'Once daily (morning)',
      observacoes: 'Take with food'
    },
    {
      nome: 'Clonazepam',
      dosagem: '2mg',
      frequencia: 'Once daily (night)',
      observacoes: 'May cause drowsiness'
    }
  ],
  'Mary Johnson': [
    {
      nome: 'Sertraline',
      dosagem: '50mg',
      frequencia: 'Once daily (morning)',
      observacoes: null
    },
    {
      nome: 'Melatonin',
      dosagem: '3mg',
      frequencia: 'Once daily (night)',
      observacoes: 'Sleep aid'
    }
  ],
  'Robert Williams': [
    {
      nome: 'Losartan',
      dosagem: '50mg',
      frequencia: 'Once daily (morning)',
      observacoes: 'Blood pressure control'
    }
  ]
};

// Utility function to make API calls with Supabase session cookies
async function apiCall(endpoint, method = 'GET', body = null, session = null) {
  const headers = {
    'Content-Type': 'application/json'
  };

  // Add Supabase session cookies if we have a session
  if (session) {
    // Format the session as Supabase cookies
    const cookieParts = [
      `sb-${SUPABASE_URL.split('//')[1].split('.')[0]}-auth-token=${encodeURIComponent(JSON.stringify({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
        expires_in: session.expires_in,
        token_type: session.token_type,
        user: session.user
      }))}`
    ];
    headers['Cookie'] = cookieParts.join('; ');
  }

  const options = {
    method,
    headers
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} - ${JSON.stringify(data)}`);
  }

  return data;
}

// Sleep utility
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  console.log('🚀 Starting mock data seeding...\n');

  try {
    // Step 1: Login with Supabase
    console.log('🔐 Logging in as teste@teste.com...');
    const { data: { session }, error: authError } = await supabase.auth.signInWithPassword({
      email: 'teste@teste.com',
      password: '123456'
    });

    if (authError) {
      throw new Error(`Authentication failed: ${authError.message}`);
    }

    if (!session) {
      throw new Error('No session returned after login');
    }

    console.log('✅ Login successful!\n');

    // Step 2: Create patients
    console.log('👥 Creating patients...');
    const patientIds = {};

    for (const patient of mockPatients) {
      const result = await apiCall('/api/patients', 'POST', patient, session);
      patientIds[patient.nome] = result.id;
      console.log(`  ✅ Created patient: ${patient.nome} (${result.id})`);
      await sleep(500);
    }
    console.log('');

    // Step 3: Create daily notes for each patient
    console.log('📝 Creating daily notes...');
    const noteIds = {};

    for (const [patientName, notes] of Object.entries(mockNotes)) {
      const patientId = patientIds[patientName];
      noteIds[patientName] = [];

      console.log(`  Creating notes for ${patientName}:`);

      for (const note of notes) {
        const { hourlyNotes, ...dailyNoteData } = note;

        const result = await apiCall('/api/notes', 'POST', {
          patientId,
          ...dailyNoteData
        }, session);

        const noteId = result.id;
        noteIds[patientName].push(noteId);
        console.log(`    ✅ Created note for ${note.data}`);
        await sleep(500);

        // Create hourly notes if present
        if (hourlyNotes && hourlyNotes.length > 0) {
          for (const hourlyNote of hourlyNotes) {
            await apiCall(`/api/notes/${noteId}/hourly`, 'POST', hourlyNote, session);
            console.log(`      ⏰ Added hourly note at ${hourlyNote.hora}`);
            await sleep(300);
          }
        }
      }
    }
    console.log('');

    // Step 4: Create medications for each patient
    console.log('💊 Creating medications...');

    for (const [patientName, medications] of Object.entries(mockMedications)) {
      const patientId = patientIds[patientName];

      console.log(`  Creating medications for ${patientName}:`);

      for (const medication of medications) {
        await apiCall('/api/medications', 'POST', {
          patientId,
          ...medication
        }, session);

        console.log(`    ✅ Created medication: ${medication.nome}`);
        await sleep(500);
      }
    }
    console.log('');

    // Summary
    console.log('🎉 Mock data seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`  - Patients created: ${Object.keys(patientIds).length}`);
    console.log(`  - Daily notes created: ${Object.values(mockNotes).flat().length}`);
    console.log(`  - Medications created: ${Object.values(mockMedications).flat().length}`);
    console.log('\n✨ You can now log in to teste@teste.com and see the mock data!');

  } catch (error) {
    console.error('❌ Error during seeding:');
    console.error(error.message);
    process.exit(1);
  }
}

// Run the script
main();
