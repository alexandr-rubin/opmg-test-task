import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type DeviceDocument = HydratedDocument<Device>;

@Schema({ timestamps: true })
export class Device {
  @Prop({ unique: true, index: true })
  deviceId: string;

  @Prop({ type: Date, default: () => new Date() })
  firstRequestAt: Date;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);
