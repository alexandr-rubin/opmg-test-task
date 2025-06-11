import { IsString } from 'class-validator';

export class GetActiveExperimentsForDeviceAndAssignToNewParamDto {
  @IsString()
  deviceId: string;
}
