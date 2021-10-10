import express from 'express';
import { autoquesterFunc } from './functions/autoquester/autoquester';

const app = express();
const PORT = 3000;
app.use(express.json());

app.get('/', (req, res) => res.send('Express + TypeScript Server'));
app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});


app.post("/test", async (request, response) =>
{    
    console.log(`Got request ${request.baseUrl}`);
    autoquesterFunc(JSON.stringify(request.body));

    response.status(200).send();
})