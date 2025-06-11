import {
  ArrayMinSize,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { VariantDto } from '../variant.dto';
import { Type } from 'class-transformer';

export class CreateExperimentDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => VariantDto)
  variants: VariantDto[];
}
