export interface EquipmentSpecs {
    hurdleHeight?: string;
    implementWeight?: string;
    implementSpecs?: {
        shotPut?: string;
        discus?: string;
        hammer?: string;
        javelin?: string;
        [key: string]: string | undefined;
    };
}
export declare class EquipmentService {
    getEquipmentSpecs(category: string, discipline: string, gender: 'MALE' | 'FEMALE'): EquipmentSpecs;
    private getHurdleHeight;
    private getShotPutWeight;
    private getDiscusWeight;
    private getHammerWeight;
    private getJavelinWeight;
    private getCombinedEventSpecs;
    getAllCategories(): string[];
    getCategoryDescription(category: string): string;
}
