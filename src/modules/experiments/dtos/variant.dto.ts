import { IsNumber, IsString, Max, MaxLength, Min } from 'class-validator';

export class VariantDto {
  @IsString()
  @MaxLength(255)
  variant: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  weight: number;
}
