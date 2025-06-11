import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type ExperimentParticipantDocument =
  HydratedDocument<ExperimentParticipant>;

@Schema({ timestamps: true })
export class ExperimentParticipant {
  @Prop({ type: Types.ObjectId, ref: 'Device', index: true })
  deviceId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Experiment', index: true })
  experimentId: Types.ObjectId;

  @Prop()
  variant: string;
}

export const ExperimentParticipantSchema = SchemaFactory.createForClass(
  ExperimentParticipant,
);
