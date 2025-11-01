#!/usr/bin/env ts-node
declare const disciplines: ({
    name: string;
    performance: string;
    wind: string;
} | {
    name: string;
    performance: string;
    wind?: undefined;
})[];
