import { Controller, Get, Query } from '@nestjs/common';
import { EquipmentService } from './equipment.service';

@Controller('equipment')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Get('categories')
  getAllCategories() {
    return {
      categories: this.equipmentService.getAllCategories().map((category) => ({
        value: category,
        label: this.equipmentService.getCategoryDescription(category),
      })),
    };
  }

  @Get('specs')
  getEquipmentSpecs(
    @Query('category') category: string,
    @Query('discipline') discipline: string,
    @Query('gender') gender: 'MALE' | 'FEMALE',
  ) {
    if (!category || !discipline || !gender) {
      return {
        error: 'Missing required parameters: category, discipline, gender',
      };
    }

    const specs = this.equipmentService.getEquipmentSpecs(
      category,
      discipline,
      gender,
    );
    return {
      category,
      discipline,
      gender,
      specs,
    };
  }

  @Get('category-description')
  getCategoryDescription(@Query('category') category: string) {
    if (!category) {
      return { error: 'Missing category parameter' };
    }

    return {
      category,
      description: this.equipmentService.getCategoryDescription(category),
    };
  }
}
