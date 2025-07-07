import app from './app';

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`Logbook service listening on port ${PORT}`);
});
