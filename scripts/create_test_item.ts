import { createCrocheItem } from '../server/db';

async function main() {
  try {
    const created = await createCrocheItem('local', { name: 'Test Lã', quantity: 3, price: 12.5 });
    console.log('Created:', created);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

main();
