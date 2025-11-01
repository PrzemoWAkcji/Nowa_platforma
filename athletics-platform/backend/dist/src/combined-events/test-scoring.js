#!/usr/bin/env ts-node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const combined_events_service_1 = require("./combined-events.service");
const sample_data_1 = require("./examples/sample-data");
const mockPrismaService = {};
const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
};
const service = new combined_events_service_1.CombinedEventsService(mockPrismaService, mockCacheManager);
console.log('🏃‍♂️ Test systemu punktacji wielobojów\n');
console.log('=== DZIESIĘCIOBÓJ (DECATHLON) ===');
console.log('Przykład bardzo dobrego wyniku (~8500 punktów):\n');
const decathlonResults = sample_data_1.SAMPLE_DECATHLON_RESULTS.excellent;
let totalPoints = 0;
Object.entries(decathlonResults).forEach(([discipline, performance]) => {
    try {
        const points = service.calculatePoints(discipline, performance, 'MALE');
        totalPoints += points;
        console.log(`${discipline.padEnd(8)} ${performance.padEnd(10)} = ${points.toString().padStart(4)} punktów`);
    }
    catch (error) {
        console.log(`${discipline.padEnd(8)} ${performance.padEnd(10)} = ERROR: ${error.message}`);
    }
});
console.log(`${''.padEnd(20, '-')}`);
console.log(`RAZEM: ${totalPoints.toString().padStart(4)} punktów\n`);
console.log('=== SIEDMIOBÓJ (HEPTATHLON) ===');
console.log('Przykład bardzo dobrego wyniku (~6500 punktów):\n');
const heptathlonResults = sample_data_1.SAMPLE_HEPTATHLON_RESULTS.excellent;
totalPoints = 0;
Object.entries(heptathlonResults).forEach(([discipline, performance]) => {
    try {
        const points = service.calculatePoints(discipline, performance, 'FEMALE');
        totalPoints += points;
        console.log(`${discipline.padEnd(8)} ${performance.padEnd(10)} = ${points.toString().padStart(4)} punktów`);
    }
    catch (error) {
        console.log(`${discipline.padEnd(8)} ${performance.padEnd(10)} = ERROR: ${error.message}`);
    }
});
console.log(`${''.padEnd(20, '-')}`);
console.log(`RAZEM: ${totalPoints.toString().padStart(4)} punktów\n`);
console.log('=== REKORDY ŚWIATA ===');
console.log('Dziesięciobój - Kevin Mayer (2018):\n');
const worldRecordDecathlon = sample_data_1.WORLD_RECORDS.DECATHLON.results;
totalPoints = 0;
Object.entries(worldRecordDecathlon).forEach(([discipline, performance]) => {
    try {
        const points = service.calculatePoints(discipline, performance, 'MALE');
        totalPoints += points;
        console.log(`${discipline.padEnd(8)} ${performance.padEnd(10)} = ${points.toString().padStart(4)} punktów`);
    }
    catch (error) {
        console.log(`${discipline.padEnd(8)} ${performance.padEnd(10)} = ERROR: ${error.message}`);
    }
});
console.log(`${''.padEnd(20, '-')}`);
console.log(`RAZEM: ${totalPoints.toString().padStart(4)} punktów`);
console.log(`Rekord świata: 9126 punktów (Kevin Mayer, 2018)\n`);
console.log('=== TESTY WALIDACJI ===');
const validationTests = [
    { discipline: '100M', performance: '10.85', expected: true },
    { discipline: '100M', performance: '8.50', expected: false },
    { discipline: 'HJ', performance: '2.05', expected: true },
    { discipline: 'HJ', performance: '3.50', expected: false },
    { discipline: 'SP', performance: '15.20', expected: true },
    { discipline: 'HT', performance: '45.20', expected: true },
];
validationTests.forEach((test) => {
    const isValid = service.validatePerformance(test.discipline, test.performance);
    const status = isValid === test.expected ? '✅' : '❌';
    console.log(`${status} ${test.discipline} ${test.performance} - ${isValid ? 'POPRAWNY' : 'NIEPOPRAWNY'}`);
});
console.log('\n🏃‍♂️ PIĘCIOBÓJ U16 CHŁOPCY - Dobry wynik dla młodzieży:');
const u16MaleResults = {
    '110MH': '16.50',
    LJ: '6.20',
    SP: '12.50',
    HJ: '1.75',
    '1000M': '3:15.00',
};
let totalU16MalePoints = 0;
Object.entries(u16MaleResults).forEach(([discipline, performance]) => {
    try {
        const points = service.calculatePoints(discipline, performance, 'MALE');
        totalU16MalePoints += points;
        console.log(`${discipline.padEnd(8)} ${performance.padEnd(10)} = ${points.toString().padStart(4)} punktów`);
    }
    catch (error) {
        console.log(`${discipline.padEnd(8)} ${performance.padEnd(10)} = ERROR: ${error.message}`);
    }
});
console.log(`${''.padEnd(20, '-')}`);
console.log(`RAZEM: ${totalU16MalePoints} punktów`);
console.log('Dyscypliny: 110m ppł, skok w dal, kula 5kg, skok wzwyż, 1000m\n');
console.log('🏃‍♀️ PIĘCIOBÓJ U16 DZIEWCZĘTA - Dobry wynik dla młodzieży:');
const u16FemaleResults = {
    '80MH': '12.85',
    HJ: '1.60',
    SP: '10.50',
    LJ: '5.20',
    '600M': '1:38.50',
};
let totalU16FemalePoints = 0;
Object.entries(u16FemaleResults).forEach(([discipline, performance]) => {
    try {
        const points = service.calculatePoints(discipline, performance, 'FEMALE');
        totalU16FemalePoints += points;
        console.log(`${discipline.padEnd(8)} ${performance.padEnd(10)} = ${points.toString().padStart(4)} punktów`);
    }
    catch (error) {
        console.log(`${discipline.padEnd(8)} ${performance.padEnd(10)} = ERROR: ${error.message}`);
    }
});
console.log(`${''.padEnd(20, '-')}`);
console.log(`RAZEM: ${totalU16FemalePoints} punktów`);
console.log('Dyscypliny: 80m ppł, skok wzwyż, kula 3kg, skok w dal, 600m\n');
console.log('\n🎉 Test zakończony!');
console.log('\n=== TEST FORMATÓW CZASU ===');
const timeFormats = ['10.85', '1:38.50', '3:15.00', '10:85', '1:38.5'];
timeFormats.forEach((timeString) => {
    try {
        const points = service.calculatePoints('100M', timeString, 'MALE');
        console.log(`${timeString.padEnd(10)} = ${points} punktów`);
    }
    catch (error) {
        console.log(`${timeString.padEnd(10)} - ERROR: ${error.message}`);
    }
});
console.log('\n=== TEST RÓŻNIC PŁCI ===');
const genderTests = [
    { discipline: 'SP', performance: '15.20', gender: 'MALE' },
    { discipline: 'SP', performance: '15.20', gender: 'FEMALE' },
    { discipline: 'HJ', performance: '2.05', gender: 'MALE' },
    { discipline: 'HJ', performance: '2.05', gender: 'FEMALE' },
];
genderTests.forEach((test) => {
    try {
        const points = service.calculatePoints(test.discipline, test.performance, test.gender);
        console.log(`${test.discipline} ${test.performance} (${test.gender}) = ${points} punktów`);
    }
    catch (error) {
        console.log(`${test.discipline} ${test.performance} - ERROR: ${error.message}`);
    }
});
//# sourceMappingURL=test-scoring.js.map