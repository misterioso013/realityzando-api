import express, { Request, Response } from 'express';
import cors from 'cors';
import { ParticipantsController } from './controllers/participants.controller';
import { ScrapingService } from './services/scraping.service';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rotas
app.get('/participants', async (req: Request, res: Response) => {
  await ParticipantsController.getParticipants(req, res);
});

app.post('/participants/update', async (req: Request, res: Response) => {
  await ParticipantsController.updateParticipants(req, res);
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
  // Inicializar o ScrapingService
  ScrapingService.getInstance();
});