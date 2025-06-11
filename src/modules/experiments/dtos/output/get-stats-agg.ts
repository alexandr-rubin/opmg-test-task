import { Types } from 'mongoose';

export class AggregatedMongoResult {
  _id: Types.ObjectId;
  totalDevices: number;
  variants: ExperimentVariantCountDto[];
}

export class ExperimentVariantCountDto {
  variant: string;
  count: number;
}

export class ExperimentVariantStatsDto extends ExperimentVariantCountDto {
  percent: string;
}

export class ExperimentStatsResponseDto {
  experimentId: Types.ObjectId;
  name: string;
  totalDevices: number;
  variants: ExperimentVariantStatsDto[];
}
