import 'dotenv/config';
import { generateEventPlan } from '../lib/gemini';

async function main() {
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
  console.error('Error running test-plan:', err);
  process.exit(1);
});
