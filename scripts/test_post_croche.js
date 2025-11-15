import fetch from 'node-fetch';

async function test() {
// Cambia el puerto aquí si tu backend está en otro (ejemplo: 3000, 3001, 3002)
const PORT = 3001;
const URL = `http://localhost:${PORT}/api/croche`;

const testData = {
  nome: 'Test Item',
  quantidade: 10,
  cor: 'Azul',
  tipo: 'Linha',
};

fetch(URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(testData),
})
  .then(res => res.json())
  .then(data => {
    console.log('Response:', data);
  })
  .catch(err => {
    console.error('Error:', err);
    console.error(`¿Está corriendo el backend en el puerto ${PORT}?`);
  });
}

test();