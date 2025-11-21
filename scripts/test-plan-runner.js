require('dotenv').config();
require('ts-node/register');

async function main() {
  const { generateEventPlan } = require('../lib/gemini');

  const plan = await generateEventPlan(
    {
      eventType: 'birthday',
      numberOfGuests: 10,
      ageRange: 'adults',
      genderDistribution: 'mixed',
      location: 'Santiago, Chile',
      eventDate: new Date().toISOString(),
      budget: 100000,
      preferences: 'Musica en vivo',
      currency: 'CLP',
      spendingStyle: 'balanced',
    },
    'es'
  );

  console.log(JSON.stringify(plan, null, 2));
}

main().catch((err) => {
  console.error('Runner error', err);
  process.exit(1);
});
