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
exports.LiveResultsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let LiveResultsService = class LiveResultsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getLiveResults(token) {
        const competition = await this.prisma.competition.findUnique({
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
        if (!competition || !competition.liveResultsEnabled) {
            throw new Error('Live results not available');
        }
        const formattedEvents = competition.events.map((event) => ({
            ...event,
            isCompleted: event.isCompleted,
            categoryDescription: this.getCategoryDescription(event.category),
            equipmentSpecs: this.getEquipmentSpecsForEvent(event),
            results: event.results.map((result) => ({
                ...result,
                athlete: {
                    ...result.athlete,
                    fullName: `${result.athlete.firstName} ${result.athlete.lastName}`,
                },
            })),
        }));
        return {
            ...competition,
            events: formattedEvents,
        };
    }
    getCategoryDescription(category) {
        const descriptions = {
            WIELE: 'Wiele kategorii',
            AGE_5: '5 lat',
            AGE_6: '6 lat',
            AGE_7: '7 lat',
            AGE_8: '8 lat',
            AGE_9: '9 lat',
            AGE_10: '10 lat',
            AGE_11: '11 lat',
            CLASS_1: '1. Klasa szkoły średniej',
            CLASS_2: '2. Klasa szkoły średniej',
            CLASS_3: '3. Klasa szkoły średniej',
            CLASS_4: '4. Klasa szkoły średniej',
            CLASS_5: '5. Klasa szkoły średniej',
            CLASS_6: '6. Klasa szkoły średniej',
            CLASS_7: '7. Klasa',
            CLASS_8: '8. Klasa',
            U8: 'Do lat 8',
            U9: 'Do lat 9',
            U10: 'Do lat 10',
            U11: 'Do lat 11',
            U12: 'Do lat 12',
            U13: 'Do lat 13',
            U14: 'Do lat 14',
            U15: 'Do lat 15',
            U16: 'Do lat 16',
            U18: 'Do lat 18',
            U20: 'Do lat 20',
            U23: 'Do lat 23',
            SENIOR: 'Seniorzy (20+)',
            M35: 'Masters 35+',
            M40: 'Masters 40+',
            M45: 'Masters 45+',
            M50: 'Masters 50+',
            M55: 'Masters 55+',
            M60: 'Masters 60+',
            M65: 'Masters 65+',
            M70: 'Masters 70+',
            M75: 'Masters 75+',
            M80: 'Masters 80+',
            M85: 'Masters 85+',
            M90: 'Masters 90+',
            M95: 'Masters 95+',
            M100: 'Masters 100+',
            M105: 'Masters 105+',
            M110: 'Masters 110+',
        };
        return descriptions[category] || category;
    }
    getEquipmentSpecsForEvent(event) {
        const specs = [];
        if (event.hurdleHeight) {
            specs.push(`Wysokość płotków: ${event.hurdleHeight}`);
        }
        if (event.implementWeight) {
            specs.push(`Waga przyrządu: ${event.implementWeight}`);
        }
        if (event.implementSpecs) {
            const additionalSpecs = event.implementSpecs;
            if (additionalSpecs.shotPut)
                specs.push(`Kula: ${additionalSpecs.shotPut}`);
            if (additionalSpecs.discus)
                specs.push(`Dysk: ${additionalSpecs.discus}`);
            if (additionalSpecs.hammer)
                specs.push(`Młot: ${additionalSpecs.hammer}`);
            if (additionalSpecs.javelin)
                specs.push(`Oszczep: ${additionalSpecs.javelin}`);
        }
        return specs;
    }
};
exports.LiveResultsService = LiveResultsService;
exports.LiveResultsService = LiveResultsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LiveResultsService);
//# sourceMappingURL=live-results.service.js.map