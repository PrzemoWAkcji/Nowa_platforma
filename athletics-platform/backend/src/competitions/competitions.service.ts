import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import * as fs from 'fs';
import * as multer from 'multer';
import * as path from 'path';
import { promisify } from 'util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompetitionDto } from './dto/create-competition.dto';
import { UpdateCompetitionDto } from './dto/update-competition.dto';

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const mkdir = promisify(fs.mkdir);

@Injectable()
export class CompetitionsService {
  constructor(private prisma: PrismaService) {}

  async create(createCompetitionDto: CreateCompetitionDto) {
    // Generuj unikalny agentId i token dla wyników na żywo
    const agentId = this.generateAgentId();
    const liveResultsToken = this.generateLiveResultsToken();

    // Znajdź pierwszego użytkownika admin lub utwórz zawody bez createdById
    const adminUser = await this.prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (!adminUser) {
      throw new Error('No admin user found in database');
    }

    return this.prisma.competition.create({
      data: {
        ...createCompetitionDto,
        agentId,
        liveResultsToken,
        createdById: adminUser.id,
      },
    });
  }

  async findAll() {
    return this.prisma.competition.findMany({
      include: {
        events: {
          select: {
            id: true,
            name: true,
            category: true,
            gender: true,
          },
        },
        _count: {
          select: {
            registrations: true,
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
      take: 50, // Limit do 50 najnowszych zawodów
    });
  }

  async findPublic() {
    return this.prisma.competition.findMany({
      where: {
        isPublic: true,
        status: {
          not: 'DRAFT', // Nie pokazuj szkiców
        },
      },
      include: {
        _count: {
          select: {
            registrations: true,
          },
        },
      },
      orderBy: {
        startDate: 'asc',
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.competition.findUnique({
      where: { id },
      include: {
        events: {
          include: {
            _count: {
              select: {
                registrationEvents: true,
                results: true,
              },
            },
          },
        },
        registrations: {
          include: {
            athlete: true,
          },
        },
      },
    });
  }

  async update(id: string, updateCompetitionDto: UpdateCompetitionDto) {
    return this.prisma.competition.update({
      where: { id },
      data: updateCompetitionDto,
    });
  }

  async remove(id: string) {
    // Sprawdź czy zawody istnieją
    const competition = await this.prisma.competition.findUnique({
      where: { id },
      include: {
        registrations: true,
        events: {
          include: {
            results: true,
            relayTeamRegistrations: true,
          },
        },
        relayTeams: {
          include: {
            results: true,
          },
        },
      },
    });

    if (!competition) {
      throw new NotFoundException('Zawody nie zostały znalezione');
    }

    // Sprawdź czy są rejestracje
    if (competition.registrations && competition.registrations.length > 0) {
      throw new BadRequestException(
        'Nie można usunąć zawodów, które mają rejestracje. Usuń najpierw wszystkie rejestracje.',
      );
    }

    // Sprawdź czy są wyniki w konkurencjach
    const hasResults = competition.events.some(
      (event) => event.results && event.results.length > 0,
    );

    if (hasResults) {
      throw new BadRequestException(
        'Nie można usunąć zawodów, które mają wyniki. Usuń najpierw wszystkie wyniki.',
      );
    }

    // Sprawdź czy są rejestracje zespołów sztafetowych
    const hasRelayRegistrations = competition.events.some(
      (event) =>
        event.relayTeamRegistrations && event.relayTeamRegistrations.length > 0,
    );

    if (hasRelayRegistrations) {
      throw new BadRequestException(
        'Nie można usunąć zawodów, które mają rejestracje zespołów sztafetowych. Usuń najpierw wszystkie zespoły.',
      );
    }

    // Sprawdź czy są wyniki zespołów sztafetowych
    const hasRelayResults = competition.relayTeams.some(
      (team) => team.results && team.results.length > 0,
    );

    if (hasRelayResults) {
      throw new BadRequestException(
        'Nie można usunąć zawodów, które mają wyniki zespołów sztafetowych. Usuń najpierw wszystkie wyniki.',
      );
    }

    // Sprawdź czy są zespoły sztafetowe
    if (competition.relayTeams && competition.relayTeams.length > 0) {
      throw new BadRequestException(
        'Nie można usunąć zawodów, które mają zespoły sztafetowe. Usuń najpierw wszystkie zespoły.',
      );
    }

    // Jeśli wszystko jest w porządku, usuń zawody
    return this.prisma.competition.delete({
      where: { id },
    });
  }

  /**
   * Włącza/wyłącza wyniki na żywo dla zawodów
   */
  async toggleLiveResults(id: string, enabled: boolean) {
    return this.prisma.competition.update({
      where: { id },
      data: { liveResultsEnabled: enabled },
    });
  }

  /**
   * Pobiera zawody po tokenie wyników na żywo
   */
  async findByLiveResultsToken(token: string) {
    return this.prisma.competition.findUnique({
      where: { liveResultsToken: token },
      include: {
        events: {
          include: {
            results: {
              include: {
                athlete: true,
              },
              orderBy: [{ position: 'asc' }, { result: 'asc' }],
            },
          },
          orderBy: { scheduledTime: 'asc' },
        },
      },
    });
  }

  /**
   * Pobiera zawody po agentId
   */
  async findByAgentId(agentId: string) {
    return this.prisma.competition.findUnique({
      where: { agentId },
      include: {
        events: {
          include: {
            registrationEvents: {
              include: {
                registration: {
                  include: {
                    athlete: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  /**
   * Generuje unikalny ID dla agenta
   */
  private generateAgentId(): string {
    const timestamp = Date.now().toString(36);
    const random = randomBytes(4).toString('hex');
    return `AGENT_${timestamp}_${random}`.toUpperCase();
  }

  /**
   * Generuje token dla wyników na żywo
   */
  private generateLiveResultsToken(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Automatyczne aktualizowanie statusów zawodów na podstawie dat
   * Zgodnie z przepisami LA, statusy muszą być aktualizowane automatycznie
   */
  async updateCompetitionStatuses() {
    const now = new Date();

    // Otwórz rejestrację dla zawodów, gdzie data rozpoczęcia rejestracji już minęła
    await this.prisma.competition.updateMany({
      where: {
        status: 'PUBLISHED',
        registrationStartDate: {
          lte: now,
        },
        OR: [
          { registrationEndDate: null },
          { registrationEndDate: { gte: now } },
        ],
      },
      data: {
        status: 'REGISTRATION_OPEN',
      },
    });

    // Zamknij rejestrację dla zawodów, gdzie data zakończenia rejestracji już minęła
    await this.prisma.competition.updateMany({
      where: {
        status: 'REGISTRATION_OPEN',
        registrationEndDate: {
          lt: now,
        },
      },
      data: {
        status: 'REGISTRATION_CLOSED',
      },
    });

    // Rozpocznij zawody, które już się zaczęły
    await this.prisma.competition.updateMany({
      where: {
        status: { in: ['REGISTRATION_CLOSED', 'PUBLISHED'] },
        startDate: {
          lte: now,
        },
        endDate: {
          gte: now,
        },
      },
      data: {
        status: 'ONGOING',
      },
    });

    // Zakończ zawody, które już się skończyły
    await this.prisma.competition.updateMany({
      where: {
        status: 'ONGOING',
        endDate: {
          lt: now,
        },
      },
      data: {
        status: 'COMPLETED',
      },
    });

    return { message: 'Statusy zawodów zostały zaktualizowane' };
  }

  /**
   * Przesyła logo dla zawodów
   */
  async uploadLogos(competitionId: string, files: multer.File[]) {
    // Sprawdź czy zawody istnieją
    const competition = await this.prisma.competition.findUnique({
      where: { id: competitionId },
    });

    if (!competition) {
      throw new NotFoundException('Zawody nie zostały znalezione');
    }

    // Pobierz istniejące logo
    const existingLogos = (competition.logos as any[]) || [];

    // Sprawdź limit (maksymalnie 5 logo)
    if (existingLogos.length + files.length > 5) {
      throw new BadRequestException(
        `Można przesłać maksymalnie 5 logo. Obecnie masz ${existingLogos.length} logo.`,
      );
    }

    // Utwórz folder na logo jeśli nie istnieje
    const uploadsDir = path.join(process.cwd(), 'uploads', 'logos');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Folder już istnieje
    }

    const newLogos: any[] = [];

    for (const file of files) {
      // Generuj unikalną nazwę pliku
      const fileExtension = path.extname(file.originalname);
      const fileName = `${competitionId}_${Date.now()}_${randomBytes(8).toString('hex')}${fileExtension}`;
      const filePath = path.join(uploadsDir, fileName);

      // Zapisz plik
      await writeFile(filePath, file.buffer);

      // Dodaj informacje o logo
      const logoInfo = {
        id: randomBytes(16).toString('hex'),
        filename: fileName,
        originalName: file.originalname,
        url: `/uploads/logos/${fileName}`,
        uploadedAt: new Date().toISOString(),
        size: file.size,
        mimetype: file.mimetype,
      };

      newLogos.push(logoInfo);
    }

    // Zaktualizuj bazę danych
    const updatedLogos = [...existingLogos, ...newLogos];

    const updatedCompetition = await this.prisma.competition.update({
      where: { id: competitionId },
      data: { logos: updatedLogos },
    });

    return {
      message: `Przesłano ${newLogos.length} logo`,
      logos: updatedLogos,
    };
  }

  /**
   * Usuwa logo zawodów
   */
  async deleteLogo(competitionId: string, logoId: string) {
    // Sprawdź czy zawody istnieją
    const competition = await this.prisma.competition.findUnique({
      where: { id: competitionId },
    });

    if (!competition) {
      throw new NotFoundException('Zawody nie zostały znalezione');
    }

    const existingLogos = (competition.logos as any[]) || [];
    const logoToDelete = existingLogos.find((logo) => logo.id === logoId);

    if (!logoToDelete) {
      throw new NotFoundException('Logo nie zostało znalezione');
    }

    // Usuń plik z dysku
    const filePath = path.join(
      process.cwd(),
      'uploads',
      'logos',
      logoToDelete.filename,
    );
    try {
      await unlink(filePath);
    } catch (error) {
      console.warn(`Nie można usunąć pliku: ${filePath}`, error);
    }

    // Usuń logo z listy
    const updatedLogos = existingLogos.filter((logo) => logo.id !== logoId);

    // Zaktualizuj bazę danych
    await this.prisma.competition.update({
      where: { id: competitionId },
      data: { logos: updatedLogos },
    });

    return {
      message: 'Logo zostało usunięte',
      logos: updatedLogos,
    };
  }

  /**
   * Pobiera logo zawodów
   */
  async getLogos(competitionId: string) {
    const competition = await this.prisma.competition.findUnique({
      where: { id: competitionId },
      select: { logos: true },
    });

    if (!competition) {
      throw new NotFoundException('Zawody nie zostały znalezione');
    }

    return {
      logos: (competition.logos as any[]) || [],
    };
  }
}
