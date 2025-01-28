import { Request, Response } from 'express';
import { ScrapingService } from '../services/scraping.service';

export class ParticipantsController {
  static async getParticipants(req: Request, res: Response) {
    try {
      const scrapingService = ScrapingService.getInstance();
      const data = await scrapingService.getParticipants();
      res.json(data);
    } catch (error) {
      console.error('Erro ao buscar participantes:', error);
      res.status(500).json({ error: 'Erro ao buscar participantes' });
    }
  }

  static async updateParticipants(req: Request, res: Response) {
    try {
      const scrapingService = ScrapingService.getInstance();
      const participants = await scrapingService.scrapeParticipants(true);
      res.json({
        participants,
        lastUpdate: new Date()
      });
    } catch (error) {
      console.error('Erro ao atualizar participantes:', error);
      res.status(500).json({ error: 'Erro ao atualizar participantes' });
    }
  }
}