import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { VariantDto } from '../../dtos/variant.dto';

export type ExperimentDocument = HydratedDocument<Experiment>;

@Schema({ timestamps: true })
export class Experiment {
  @Prop({ unique: true })
  name: string;

  @Prop({ type: [VariantDto] })
  variants: VariantDto[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Date })
  completedAt: Date;
}

export const ExperimentSchema = SchemaFactory.createForClass(Experiment);
