import { EquipmentService } from './equipment.service';
export declare class EquipmentController {
    private readonly equipmentService;
    constructor(equipmentService: EquipmentService);
    getAllCategories(): {
        categories: {
            value: string;
            label: string;
        }[];
    };
    getEquipmentSpecs(category: string, discipline: string, gender: 'MALE' | 'FEMALE'): {
        error: string;
        category?: undefined;
        discipline?: undefined;
        gender?: undefined;
        specs?: undefined;
    } | {
        category: string;
        discipline: string;
        gender: "MALE" | "FEMALE";
        specs: import("./equipment.service").EquipmentSpecs;
        error?: undefined;
    };
    getCategoryDescription(category: string): {
        error: string;
        category?: undefined;
        description?: undefined;
    } | {
        category: string;
        description: string;
        error?: undefined;
    };
}
