import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Participant, ParticipantsData, ParticipantStatus, ParticipantStatusHistory } from '../types/participant';
import fs from 'fs/promises';
import path from 'path';

puppeteer.use(StealthPlugin());

const DATA_FILE = path.join(__dirname, '../../data/participants.json');

export class ScrapingService {
  private static instance: ScrapingService;
  private data: ParticipantsData = {
    bbb25: { participants: [], lastUpdate: new Date().toISOString() }
  };
  private updateInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.ensureDataDirectory();
    // Tentar carregar dados existentes imediatamente
    this.loadFromFile().catch(() => {
      console.log('Nenhum dado existente encontrado, iniciando com dados vazios');
    });
    // Iniciar o processo de atualização em background
    this.startBackgroundUpdate();
  }

  private startBackgroundUpdate() {
    // Primeira atualização imediata
    this.backgroundUpdate();

    // Configurar intervalo de 30 minutos
    this.updateInterval = setInterval(() => {
      this.backgroundUpdate();
    }, 30 * 60 * 1000);
  }

  private async backgroundUpdate() {
    try {
      console.log('Iniciando atualização em background...');
      await this.scrapeParticipants(true);
      console.log('Atualização em background concluída');
    } catch (error) {
      console.error('Erro na atualização em background:', error);
    }
  }

  private async ensureDataDirectory() {
    const dir = path.dirname(DATA_FILE);
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  public static getInstance(): ScrapingService {
    if (!ScrapingService.instance) {
      ScrapingService.instance = new ScrapingService();
    }
    return ScrapingService.instance;
  }

  private async loadFromFile(): Promise<boolean> {
    try {
      const data = await fs.readFile(DATA_FILE, 'utf-8');
      const loadedData = JSON.parse(data);
      this.data = {
        bbb25: loadedData.bbb25 || { participants: [], lastUpdate: new Date().toISOString() }
      };
      return true;
    } catch {
      return false;
    }
  }

  private async saveToFile() {
    await fs.writeFile(DATA_FILE, JSON.stringify(this.data, null, 2));
  }

  private shouldUpdate(lastUpdate: string): boolean {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    return new Date(lastUpdate) < thirtyMinutesAgo;
  }

  async scrapeParticipants(forceUpdate = false): Promise<Participant[]> {
    await this.loadFromFile();

    if (!forceUpdate &&
        !this.shouldUpdate(this.data.bbb25.lastUpdate) &&
        this.data.bbb25.participants.length > 0) {
      return this.data.bbb25.participants;
    }

    const browser = await puppeteer.launch({
      headless: true,
      executablePath: process.env.CHROME_BIN || undefined,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-notifications',
        '--window-size=1920,1080',
        '--lang=pt-BR',
        '--disable-blink-features=AutomationControlled',
        '--hide-scrollbars',
        '--mute-audio',
        '--ignore-certificate-errors',
        '--ignore-certificate-errors-spki-list',
        '--enable-automation'
      ]
    });

    try {
      const page = await browser.newPage();

      // Configurar timeouts maiores
      page.setDefaultNavigationTimeout(60000);
      page.setDefaultTimeout(60000);

      // Configurar user agent e viewport
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      await page.setViewport({ width: 1920, height: 1080 });

      // Configurar headers extras
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
      });

      // Modificar o navigator.webdriver
      await page.evaluateOnNewDocument(() => {
        delete Object.getPrototypeOf(navigator).webdriver;
        // @ts-ignore
        window.navigator.chrome = { runtime: {} };
      });

      // Otimizações para carregamento mais rápido
      await page.setRequestInterception(true);
      page.on('request', (request) => {
        const resourceType = request.resourceType();
        const url = request.url();

        // Permitir recursos essenciais do gshow
        if (url.includes('gshow.globo.com') || url.includes('globo.com')) {
          request.continue();
          return;
        }

        // Bloquear recursos desnecessários
        if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
          request.abort();
        } else {
          request.continue();
        }
      });

      await page.goto('https://gshow.globo.com/realities/bbb/bbb-25/participantes/', {
        waitUntil: 'domcontentloaded'
      });

      const participants = await page.evaluate(() => {
        const items = document.querySelectorAll("#glb-main-home > div.row.column.xlarge-22 > section > .performance_index__list > .performance_index__item");
        return Array.from(items).map((p) => ({
          name: p.querySelector("h3")?.textContent?.trim() || "",
          image: p.querySelector("figure>img")?.getAttribute("src") || "",
          link: p.querySelector("a")?.href || "",
          wasEliminated: p.classList.contains("performance_index__item__disabled"),
          season: 25,
          currentStatus: [],
          statusHistory: {
            lider: 0,
            paredao: 0,
            imune: 0,
            anjo: 0,
            'na-mira': 0,
            monstro: 0,
            vip: 0,
            xepa: 0
          }
        }));
      });

      // Buscar detalhes de cada participante
      for (const participant of participants) {
        let retries = 3;
        let success = false;

        while (retries > 0 && !success) {
          try {
            console.log(`Buscando detalhes de ${participant.name} (tentativa ${4 - retries}/3)`);

            // Navegar para a página do participante com estratégia mais simples
            await page.goto(participant.link, {
              waitUntil: 'domcontentloaded',
              timeout: 30000 // 30 segundos
            });

            // Esperar o nome do participante carregar (que é um dos primeiros elementos)
            await page.waitForSelector('.post-card-personalities-bbb__name-participant', { timeout: 15000 }); // 15 segundos

            // Esperar um pouco para garantir que a página carregou
            await new Promise(resolve => setTimeout(resolve, 3000)); // 3 segundos

            // Esperar a navegação carregar e clicar na aba de Resumo
            await page.evaluate(() => {
              // Aguardar um pouco para garantir que o JavaScript carregou
              return new Promise((resolve) => {
                setTimeout(() => {
                  const nav = document.querySelector('.post-card-personalities-bbb__nav');
                  if (nav) {
                    const buttons = nav.querySelectorAll('button');
                    const summaryButton = Array.from(buttons).find(btn => btn.textContent?.includes('Resumo'));
                    if (summaryButton) {
                      summaryButton.click();
                    }
                  }
                  resolve(true);
                }, 3000);
              });
            });

            // Esperar um pouco para garantir que o conteúdo carregou
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Verificar se os elementos necessários estão presentes
            const [statusExists, historicExists] = await Promise.all([
              page.evaluate(() => !!document.querySelector('.participant-status-item')),
              page.evaluate(() => !!document.querySelector('.block-historic'))
            ]);

            if (!statusExists || !historicExists) {
              throw new Error('Elementos necessários não encontrados após clique');
            }

            const details = await page.evaluate((season) => {
              const professionEl = document.querySelector('.post-card-personalities-bbb__job .bio-value');
              const ageEl = document.querySelector('.post-card-personalities-bbb__age .bio-value');
              const locationEl = document.querySelector('.post-card-personalities-bbb__place .bio-value');

              // Apenas para BBB 25
              const partnerImage = season === 25 ? document.querySelector('.post-card-personalities-bbb__participant-duo-image') : null;
              const partnerLink = season === 25 ? document.querySelector('.post-card-personalities-bbb__name-duo__link') : null;

              // Debug: Imprimir HTML relevante
              console.log('=== DEBUG PARTICIPANTE ===');
              console.log('Nome:', document.querySelector('.post-card-personalities-bbb__name-participant')?.textContent);
              console.log('Status Container HTML:', document.querySelector('.participant-status-item')?.outerHTML);

              // Debug status atuais
              const statusElements = document.querySelectorAll('.participant-status-item .jujubinha-status > div');
              console.log('Quantidade de elementos de status encontrados:', statusElements.length);

              statusElements.forEach((el, index) => {
                console.log(`Status ${index + 1}:`, {
                  html: el.outerHTML,
                  iconClasses: el.querySelector('.status-actual-icon')?.classList.toString()
                });
              });

              // Extrair status atuais
              const currentStatus: ParticipantStatus[] = [];

              statusElements.forEach(statusDiv => {
                const statusIcon = statusDiv.querySelector('.status-actual-icon');
                if (statusIcon) {
                  const classes = Array.from(statusIcon.classList);
                  console.log('Classes do ícone:', classes);

                  const statusClass = classes.find(cls => cls.startsWith('participant-status-'));
                  console.log('Classe de status encontrada:', statusClass);

                  if (statusClass) {
                    const status = statusClass.replace('participant-status-', '') as ParticipantStatus;
                    currentStatus.push(status);
                    console.log('Status adicionado:', status);
                  }
                }
              });

              console.log('Status finais encontrados:', currentStatus);

              // Debug histórico
              console.log('=== DEBUG HISTÓRICO ===');
              const historicContainer = document.querySelector('.block-historic');
              console.log('Container de histórico encontrado:', !!historicContainer);
              console.log('HTML do histórico:', historicContainer?.outerHTML);

              // Extrair histórico de status
              const statusHistory: ParticipantStatusHistory = {
                lider: 0,
                paredao: 0,
                imune: 0,
                anjo: 0,
                'na-mira': 0,
                monstro: 0,
                vip: 0,
                xepa: 0
              };

              const historicItems = document.querySelectorAll('.block-historic .item-historic');
              console.log('Quantidade de itens no histórico:', historicItems.length);

              historicItems.forEach((item, index) => {
                const statusIcon = item.querySelector('.status-icon');
                const countEl = item.querySelector('.item-historic-number');

                console.log(`Histórico ${index + 1}:`, {
                  html: item.outerHTML,
                  iconClasses: statusIcon?.classList.toString(),
                  count: countEl?.textContent
                });

                if (statusIcon && countEl) {
                  const statusClass = Array.from(statusIcon.classList)
                    .find(cls => cls.startsWith('participant-status-'));

                  if (statusClass) {
                    const status = statusClass.replace('participant-status-', '') as keyof ParticipantStatusHistory;
                    const count = parseInt(countEl.textContent || '0', 10);

                    if (!isNaN(count)) {
                      statusHistory[status] = count;
                      console.log(`Histórico atualizado: ${status} = ${count}`);
                    }
                  }
                }
              });

              console.log('Histórico final:', statusHistory);
              console.log('=== FIM DEBUG ===');

              return {
                profession: professionEl?.textContent?.trim(),
                age: ageEl?.textContent?.trim(),
                location: locationEl?.textContent?.trim(),
                partner: (season === 25 && partnerLink) ? {
                  name: partnerLink.textContent?.trim(),
                  link: partnerLink.getAttribute('href') || '',
                  image: partnerImage?.getAttribute('src') || ''
                } : undefined,
                currentStatus,
                statusHistory
              };
            }, 25);

            // Debug após evaluate
            console.log('Detalhes extraídos para participante:', {
              name: participant.name,
              currentStatus: details.currentStatus,
              statusHistory: details.statusHistory
            });

            Object.assign(participant, details);
            success = true;
            console.log(`Detalhes de ${participant.name} extraídos com sucesso`);
          } catch (error) {
            console.error(`Erro ao buscar detalhes de ${participant.name}:`, error);
            retries--;
            if (retries > 0) {
              console.log(`Tentando novamente em 5 segundos...`);
              await new Promise(resolve => setTimeout(resolve, 5000));
            }
          }
        }

        if (!success) {
          console.error(`Não foi possível extrair os detalhes de ${participant.name} após 3 tentativas`);
        }
      }

      this.data.bbb25.participants = participants;
      this.data.bbb25.lastUpdate = new Date().toISOString();

      await this.saveToFile();

      return participants;
    } finally {
      await browser.close();
    }
  }

  async getParticipants(): Promise<{
    bbb25: { participants: Participant[], lastUpdate: Date }
  }> {
    // Sempre carrega do arquivo primeiro
    await this.loadFromFile();

    // Se não houver dados, faz o scraping inicial
    if (this.data.bbb25.participants.length === 0) {
      await this.scrapeParticipants();
    }

    return {
      bbb25: {
        participants: this.data.bbb25.participants,
        lastUpdate: new Date(this.data.bbb25.lastUpdate)
      }
    };
  }
}