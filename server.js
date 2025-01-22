import express from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

//middleware

app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res) => { 
  res.status(404).send('Page not found!'); });

/* app.get('/', (req, res) => {
  res.send('Hello World!');
}   ); */

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}   );