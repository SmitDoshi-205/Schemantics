const express = require('express');
const app = express();
app.use(express.json());

const broken = { get: false, post: false, patch: false, delete: false };

function payload(method) {
  if (!broken[method]) {
    return { id: 101, title: 'Breaking News', content: 'Full article text here.' };
  }
  return { id: 101, title: 'Breaking News', content: 'Full article text here.', test: 'test_value' }; // field added
}

app.get('/item', (req, res) => res.json(payload('get')));
app.post('/item', (req, res) => res.json(payload('post')));
app.patch('/item', (req, res) => res.json(payload('patch')));
app.delete('/item', (req, res) => res.json(payload('delete')));

app.post('/break/:method', (req, res) => {
  if (!(req.params.method in broken)) return res.status(400).json({ error: 'unknown method' });
  broken[req.params.method] = true;
  res.json({ method: req.params.method, broken: true });
});

app.post('/reset/:method', (req, res) => {
  if (!(req.params.method in broken)) return res.status(400).json({ error: 'unknown method' });
  broken[req.params.method] = false;
  res.json({ method: req.params.method, broken: false });
});

app.listen(4000, () => console.log('Demo API on http://localhost:4000'));