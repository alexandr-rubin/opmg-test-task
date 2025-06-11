import { IsString } from 'class-validator';

export class CompleteExperimentParamDto {
  @IsString()
  experimentName: string;
}
