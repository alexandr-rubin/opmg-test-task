import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Device, DeviceDocument } from '../schemas/device.schema';
import {
  ExperimentParticipant,
  ExperimentParticipantDocument,
} from '../schemas/experiment-participant.schema';
import { AggregatedMongoResult } from '../../dtos/output/get-stats-agg';
import { Experiment, ExperimentDocument } from '../schemas/experiment.schema';

@Injectable()
export class ExperimentsQueryRepository {
  constructor(
    @InjectModel(Experiment.name)
    private experimentModel: Model<ExperimentDocument>,
    @InjectModel(Device.name)
    private deviceModel: Model<DeviceDocument>,
    @InjectModel(ExperimentParticipant.name)
    private experimentParticipantModel: Model<ExperimentParticipantDocument>,
  ) {}

  async getDeviceByDeviceId(deviceId: string) {
    return await this.deviceModel.findOne({ deviceId });
  }

  async getExperimentsForDevice(firstRequestAt: Date) {
    return await this.experimentModel.find({
      isActive: true,
      createdAt: { $gte: firstRequestAt },
    });
  }

  async getExperimentParticipantsForDevice(
    deviceId: Types.ObjectId,
    experimentsIds: Types.ObjectId[],
  ) {
    return await this.experimentParticipantModel.find({
      deviceId,
      experimentId: { $in: experimentsIds },
    });
  }

  async getParticipantsByExperimentId(
    experimentId: Types.ObjectId,
  ): Promise<ExperimentParticipant[]> {
    return this.experimentParticipantModel
      .find({ experimentId })
      .select('deviceId variant')
      .lean();
  }

  async getAllExperiments() {
    return await this.experimentModel.find();
  }

  async getExperimentByName(name: string) {
    return await this.experimentModel.findOne({
      name,
    });
  }

  async getExperimentStats(): Promise<AggregatedMongoResult[]> {
    return await this.experimentModel.aggregate([
      {
        $match: { isActive: true },
      },
      {
        $lookup: {
          from: 'experimentparticipants',
          localField: '_id',
          foreignField: 'experimentId',
          as: 'participants',
        },
      },
      {
        $unwind: '$variants',
      },
      {
        $project: {
          name: 1,
          variant: '$variants.variant',
          totalDevices: {
            $size: { $setUnion: ['$participants.deviceId', []] },
          },
          variantCount: {
            $size: {
              $filter: {
                input: '$participants',
                as: 'p',
                cond: { $eq: ['$$p.variant', '$variants.variant'] },
              },
            },
          },
        },
      },
      {
        $group: {
          _id: '$_id',
          name: { $first: '$name' },
          totalDevices: { $first: '$totalDevices' },
          variants: {
            $push: {
              variant: '$variant',
              count: '$variantCount',
            },
          },
        },
      },
      {
        $sort: { name: 1 },
      },
    ]);
  }
}
