import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Experiment, ExperimentDocument } from '../schemas/experiment.schema';
import { Model, Types } from 'mongoose';
import { CreateExperimentDto } from '../../dtos/input/create-experiment.dto';
import { Device, DeviceDocument } from '../schemas/device.schema';
import {
  ExperimentParticipant,
  ExperimentParticipantDocument,
} from '../schemas/experiment-participant.schema';

@Injectable()
export class ExperimentsRepository {
  constructor(
    @InjectModel(Experiment.name)
    private experimentModel: Model<ExperimentDocument>,
    @InjectModel(Device.name)
    private deviceModel: Model<DeviceDocument>,
    @InjectModel(ExperimentParticipant.name)
    private experimentParticipantModel: Model<ExperimentParticipantDocument>,
  ) {}

  async createExperiment(data: CreateExperimentDto) {
    const experiment = new this.experimentModel(data);
    return experiment.save();
  }

  async completeExperiment(experimentName: string) {
    await this.experimentModel.updateOne(
      { name: experimentName },
      { isActive: false, completedAt: new Date() },
    );
  }

  async createDevice(deviceId: string) {
    const experiment = new this.deviceModel({ deviceId });
    return await experiment.save();
  }

  async createParticipant(
    deviceId: Types.ObjectId,
    experimentId: Types.ObjectId,
    variant: string,
  ) {
    const participant = new this.experimentParticipantModel({
      deviceId,
      experimentId,
      variant,
    });
    return participant.save();
  }
}
