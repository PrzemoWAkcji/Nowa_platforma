"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompetitionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const crypto_1 = require("crypto");
const fs = require("fs");
const path = require("path");
const util_1 = require("util");
const writeFile = (0, util_1.promisify)(fs.writeFile);
const unlink = (0, util_1.promisify)(fs.unlink);
const mkdir = (0, util_1.promisify)(fs.mkdir);
let CompetitionsService = class CompetitionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createCompetitionDto) {
        const agentId = this.generateAgentId();
        const liveResultsToken = this.generateLiveResultsToken();
        const adminUser = await this.prisma.user.findFirst({
            where: { role: 'ADMIN' }
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
            take: 50,
        });
    }
    async findPublic() {
        return this.prisma.competition.findMany({
            where: {
                isPublic: true,
                status: {
                    not: 'DRAFT',
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
    async findOne(id) {
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
    async update(id, updateCompetitionDto) {
        return this.prisma.competition.update({
            where: { id },
            data: updateCompetitionDto,
        });
    }
    async remove(id) {
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
            throw new common_1.NotFoundException('Zawody nie zostały znalezione');
        }
        if (competition.registrations && competition.registrations.length > 0) {
            throw new common_1.BadRequestException('Nie można usunąć zawodów, które mają rejestracje. Usuń najpierw wszystkie rejestracje.');
        }
        const hasResults = competition.events.some(event => event.results && event.results.length > 0);
        if (hasResults) {
            throw new common_1.BadRequestException('Nie można usunąć zawodów, które mają wyniki. Usuń najpierw wszystkie wyniki.');
        }
        const hasRelayRegistrations = competition.events.some(event => event.relayTeamRegistrations && event.relayTeamRegistrations.length > 0);
        if (hasRelayRegistrations) {
            throw new common_1.BadRequestException('Nie można usunąć zawodów, które mają rejestracje zespołów sztafetowych. Usuń najpierw wszystkie zespoły.');
        }
        const hasRelayResults = competition.relayTeams.some(team => team.results && team.results.length > 0);
        if (hasRelayResults) {
            throw new common_1.BadRequestException('Nie można usunąć zawodów, które mają wyniki zespołów sztafetowych. Usuń najpierw wszystkie wyniki.');
        }
        if (competition.relayTeams && competition.relayTeams.length > 0) {
            throw new common_1.BadRequestException('Nie można usunąć zawodów, które mają zespoły sztafetowe. Usuń najpierw wszystkie zespoły.');
        }
        return this.prisma.competition.delete({
            where: { id },
        });
    }
    async toggleLiveResults(id, enabled) {
        return this.prisma.competition.update({
            where: { id },
            data: { liveResultsEnabled: enabled },
        });
    }
    async findByLiveResultsToken(token) {
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
    async findByAgentId(agentId) {
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
    generateAgentId() {
        const timestamp = Date.now().toString(36);
        const random = (0, crypto_1.randomBytes)(4).toString('hex');
        return `AGENT_${timestamp}_${random}`.toUpperCase();
    }
    generateLiveResultsToken() {
        return (0, crypto_1.randomBytes)(32).toString('hex');
    }
    async updateCompetitionStatuses() {
        const now = new Date();
        await this.prisma.competition.updateMany({
            where: {
                status: 'PUBLISHED',
                registrationStartDate: {
                    lte: now
                },
                OR: [
                    { registrationEndDate: null },
                    { registrationEndDate: { gte: now } }
                ]
            },
            data: {
                status: 'REGISTRATION_OPEN'
            }
        });
        await this.prisma.competition.updateMany({
            where: {
                status: 'REGISTRATION_OPEN',
                registrationEndDate: {
                    lt: now
                }
            },
            data: {
                status: 'REGISTRATION_CLOSED'
            }
        });
        await this.prisma.competition.updateMany({
            where: {
                status: { in: ['REGISTRATION_CLOSED', 'PUBLISHED'] },
                startDate: {
                    lte: now
                },
                endDate: {
                    gte: now
                }
            },
            data: {
                status: 'ONGOING'
            }
        });
        await this.prisma.competition.updateMany({
            where: {
                status: 'ONGOING',
                endDate: {
                    lt: now
                }
            },
            data: {
                status: 'COMPLETED'
            }
        });
        return { message: 'Statusy zawodów zostały zaktualizowane' };
    }
    async uploadLogos(competitionId, files) {
        const competition = await this.prisma.competition.findUnique({
            where: { id: competitionId },
        });
        if (!competition) {
            throw new common_1.NotFoundException('Zawody nie zostały znalezione');
        }
        const existingLogos = competition.logos || [];
        if (existingLogos.length + files.length > 5) {
            throw new common_1.BadRequestException(`Można przesłać maksymalnie 5 logo. Obecnie masz ${existingLogos.length} logo.`);
        }
        const uploadsDir = path.join(process.cwd(), 'uploads', 'logos');
        try {
            await mkdir(uploadsDir, { recursive: true });
        }
        catch (error) {
        }
        const newLogos = [];
        for (const file of files) {
            const fileExtension = path.extname(file.originalname);
            const fileName = `${competitionId}_${Date.now()}_${(0, crypto_1.randomBytes)(8).toString('hex')}${fileExtension}`;
            const filePath = path.join(uploadsDir, fileName);
            await writeFile(filePath, file.buffer);
            const logoInfo = {
                id: (0, crypto_1.randomBytes)(16).toString('hex'),
                filename: fileName,
                originalName: file.originalname,
                url: `/uploads/logos/${fileName}`,
                uploadedAt: new Date().toISOString(),
                size: file.size,
                mimetype: file.mimetype,
            };
            newLogos.push(logoInfo);
        }
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
    async deleteLogo(competitionId, logoId) {
        const competition = await this.prisma.competition.findUnique({
            where: { id: competitionId },
        });
        if (!competition) {
            throw new common_1.NotFoundException('Zawody nie zostały znalezione');
        }
        const existingLogos = competition.logos || [];
        const logoToDelete = existingLogos.find(logo => logo.id === logoId);
        if (!logoToDelete) {
            throw new common_1.NotFoundException('Logo nie zostało znalezione');
        }
        const filePath = path.join(process.cwd(), 'uploads', 'logos', logoToDelete.filename);
        try {
            await unlink(filePath);
        }
        catch (error) {
            console.warn(`Nie można usunąć pliku: ${filePath}`, error);
        }
        const updatedLogos = existingLogos.filter(logo => logo.id !== logoId);
        await this.prisma.competition.update({
            where: { id: competitionId },
            data: { logos: updatedLogos },
        });
        return {
            message: 'Logo zostało usunięte',
            logos: updatedLogos,
        };
    }
    async getLogos(competitionId) {
        const competition = await this.prisma.competition.findUnique({
            where: { id: competitionId },
            select: { logos: true },
        });
        if (!competition) {
            throw new common_1.NotFoundException('Zawody nie zostały znalezione');
        }
        return {
            logos: competition.logos || [],
        };
    }
};
exports.CompetitionsService = CompetitionsService;
exports.CompetitionsService = CompetitionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CompetitionsService);
//# sourceMappingURL=competitions.service.js.map