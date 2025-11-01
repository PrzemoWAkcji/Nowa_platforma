import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { LiveResultsService } from './live-results.service';

@Controller('live-results')
export class LiveResultsController {
  constructor(private readonly liveResultsService: LiveResultsService) {}

  @Get(':token')
  async getLiveResults(@Param('token') token: string, @Res() res: Response) {
    try {
      const results = await this.liveResultsService.getLiveResults(token);

      // Zwróć HTML stronę z wynikami na żywo
      const html = this.generateLiveResultsHTML(results);

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(html);
    } catch (error) {
      res.status(404).send(`
        <html>
          <head>
            <title>Wyniki na żywo - Niedostępne</title>
            <meta charset="utf-8">
          </head>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h1>Wyniki na żywo niedostępne</h1>
            <p>Wyniki dla tych zawodów nie są obecnie dostępne lub zostały wyłączone.</p>
          </body>
        </html>
      `);
    }
  }

  @Get('api/:token')
  async getLiveResultsAPI(@Param('token') token: string) {
    return this.liveResultsService.getLiveResults(token);
  }

  private generateLiveResultsHTML(competition: any): string {
    const completedEvents = competition.events.filter((e) => e.isCompleted);
    const ongoingEvents = competition.events.filter((e) => !e.isCompleted);

    return `
<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wyniki na żywo - ${competition.name}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: 300;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 1.1em;
        }
        .content {
            padding: 30px;
        }
        .section {
            margin-bottom: 40px;
        }
        .section h2 {
            color: #333;
            border-bottom: 3px solid #667eea;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .event {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            border-left: 5px solid #28a745;
        }
        .event.completed {
            border-left-color: #28a745;
        }
        .event.ongoing {
            border-left-color: #ffc107;
            background: #fff8e1;
        }
        .event-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        .event-title {
            font-size: 1.3em;
            font-weight: 600;
            color: #333;
        }
        .event-category {
            background: #667eea;
            color: white;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.9em;
        }
        .event-specs {
            margin-bottom: 15px;
            font-size: 0.9em;
            color: #666;
        }
        .spec-item {
            display: inline-block;
            background: #e9ecef;
            padding: 4px 8px;
            border-radius: 4px;
            margin-right: 8px;
            margin-bottom: 4px;
        }
        .results-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        .results-table th,
        .results-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #dee2e6;
        }
        .results-table th {
            background: #f8f9fa;
            font-weight: 600;
            color: #495057;
        }
        .results-table tr:hover {
            background: #f8f9fa;
        }
        .position {
            font-weight: bold;
            color: #667eea;
        }
        .result {
            font-weight: 600;
            font-size: 1.1em;
        }
        .no-results {
            text-align: center;
            color: #6c757d;
            font-style: italic;
            padding: 20px;
        }
        .refresh-info {
            text-align: center;
            margin-top: 30px;
            padding: 20px;
            background: #e3f2fd;
            border-radius: 8px;
            color: #1976d2;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8em;
            font-weight: 600;
            text-transform: uppercase;
        }
        .status-completed {
            background: #d4edda;
            color: #155724;
        }
        .status-ongoing {
            background: #fff3cd;
            color: #856404;
        }
    </style>
    <script>
        // Auto-refresh co 30 sekund
        setTimeout(function() {
            window.location.reload();
        }, 30000);
    </script>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${competition.name}</h1>
            <p>${competition.location} • ${new Date(competition.startDate).toLocaleDateString('pl-PL')}</p>
        </div>
        
        <div class="content">
            ${
              completedEvents.length > 0
                ? `
            <div class="section">
                <h2>🏆 Zakończone konkurencje</h2>
                ${completedEvents.map((event) => this.generateEventHTML(event, true)).join('')}
            </div>
            `
                : ''
            }
            
            ${
              ongoingEvents.length > 0
                ? `
            <div class="section">
                <h2>⏱️ Konkurencje w trakcie</h2>
                ${ongoingEvents.map((event) => this.generateEventHTML(event, false)).join('')}
            </div>
            `
                : ''
            }
            
            ${
              competition.events.length === 0
                ? `
            <div class="no-results">
                <h3>Brak dostępnych konkurencji</h3>
                <p>Wyniki będą dostępne po rozpoczęciu zawodów.</p>
            </div>
            `
                : ''
            }
            
            <div class="refresh-info">
                <strong>📱 Strona odświeża się automatycznie co 30 sekund</strong><br>
                Ostatnia aktualizacja: ${new Date().toLocaleString('pl-PL')}
            </div>
        </div>
    </div>
</body>
</html>`;
  }

  private generateEventHTML(event: any, isCompleted: boolean): string {
    const statusClass = isCompleted ? 'completed' : 'ongoing';
    const statusBadge = isCompleted
      ? '<span class="status-badge status-completed">Zakończona</span>'
      : '<span class="status-badge status-ongoing">W trakcie</span>';

    return `
    <div class="event ${statusClass}">
        <div class="event-header">
            <div class="event-title">${event.name}</div>
            <div>
                <span class="event-category">${event.categoryDescription}</span>
                ${statusBadge}
            </div>
        </div>
        
        ${
          event.equipmentSpecs && event.equipmentSpecs.length > 0
            ? `
        <div class="event-specs">
            ${event.equipmentSpecs.map((spec) => `<span class="spec-item">${spec}</span>`).join('')}
        </div>
        `
            : ''
        }
        
        ${
          event.results && event.results.length > 0
            ? `
        <table class="results-table">
            <thead>
                <tr>
                    <th>Miejsce</th>
                    <th>Zawodnik</th>
                    <th>Klub</th>
                    <th>Wynik</th>
                    ${event.results.some((r) => r.wind) ? '<th>Wiatr</th>' : ''}
                </tr>
            </thead>
            <tbody>
                ${event.results
                  .map(
                    (result) => `
                <tr>
                    <td class="position">${result.position || '-'}</td>
                    <td><strong>${result.athlete.fullName}</strong></td>
                    <td>${result.athlete.club || '-'}</td>
                    <td class="result">${result.result}</td>
                    ${event.results.some((r) => r.wind) ? `<td>${result.wind || '-'}</td>` : ''}
                </tr>
                `,
                  )
                  .join('')}
            </tbody>
        </table>
        `
            : `
        <div class="no-results">Brak wyników</div>
        `
        }
    </div>`;
  }
}
