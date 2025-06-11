import { ConflictException, Injectable } from '@nestjs/common';
import { CreateExperimentDto } from './dtos/input/create-experiment.dto';
import { ExperimentsRepository } from './infrastructure/repositories/experiments.repository';
import { ExperimentsQueryRepository } from './infrastructure/repositories/experiments.query-repository';
import { Types } from 'mongoose';
import { GetExperimentsForDeviceDto } from './dtos/output/get-experiments-for-device.dto';
import { crc32 } from 'crc';
import { ExperimentStatsResponseDto } from './dtos/output/get-stats-agg';
import {
  Experiment,
  ExperimentDocument,
} from './infrastructure/schemas/experiment.schema';

@Injectable()
export class ExperimentsService {
  constructor(
    private readonly experimentsRepository: ExperimentsRepository,
    private readonly experimentsQueryRepository: ExperimentsQueryRepository,
  ) {}

  async createExperiment(data: CreateExperimentDto) {
    const experiment =
      await this.experimentsQueryRepository.getExperimentByName(data.name);

    if (experiment) {
      throw new ConflictException(
        `Experiment with name "${data.name}" already exists.`,
      );
    }

    await this.experimentsRepository.createExperiment(data);
  }

  async completeExperiment(experimentName: string) {
    await this.experimentsRepository.completeExperiment(experimentName);
  }

  async getActiveExperimentsForDeviceAndAssignToNew(
    deviceId: string,
  ): Promise<GetExperimentsForDeviceDto[]> {
    let device =
      await this.experimentsQueryRepository.getDeviceByDeviceId(deviceId);

    if (!device) {
      device = await this.experimentsRepository.createDevice(deviceId);
    }

    const activeExperiments =
      await this.experimentsQueryRepository.getExperimentsForDevice(
        device.firstRequestAt,
      );

    const existingParticipants =
      await this.experimentsQueryRepository.getExperimentParticipantsForDevice(
        device._id,
        activeExperiments.map((exp) => exp._id),
      );

    const assignedMap = new Map(
      existingParticipants.map((p) => [p.experimentId.toString(), p.variant]),
    );

    await this.assignVariantsToDevice(
      device.deviceId,
      device._id,
      activeExperiments,
      assignedMap,
    );

    return activeExperiments.map((exp) => ({
      name: exp.name,
      variant: assignedMap.get(exp._id.toString())!,
    }));
  }

  async getExperimentStats(): Promise<ExperimentStatsResponseDto[]> {
    const statsAgg = await this.experimentsQueryRepository.getExperimentStats();

    const experiments =
      await this.experimentsQueryRepository.getAllExperiments();
    const expMap = new Map(
      experiments.map((exp) => [exp._id.toString(), exp.name]),
    );

    return statsAgg.map((stat) => {
      const totalDevices = stat.totalDevices;
      const variants = stat.variants.map((v) => ({
        variant: v.variant,
        count: v.count,
        percent: totalDevices
          ? ((v.count / totalDevices) * 100).toFixed(2) + '%'
          : '0%',
      }));

      return {
        experimentId: stat._id,
        name: expMap.get(stat._id.toString()) ?? '',
        totalDevices,
        variants,
      };
    });
  }

  private async assignVariantsToDevice(
    deviceId: string,
    deviceObjectId: Types.ObjectId,
    activeExperiments: ExperimentDocument[],
    assignedMap: Map<string, string>,
  ) {
    await Promise.all(
      activeExperiments.map(async (exp) => {
        if (!assignedMap.has(exp._id.toString())) {
          const variant = this.chooseVariant(deviceId, exp);

          await this.experimentsRepository.createParticipant(
            deviceObjectId,
            exp._id,
            variant,
          );

          assignedMap.set(exp._id.toString(), variant);
        }
      }),
    );
  }

  private chooseVariant(deviceId: string, experiment: Experiment): string {
    const hash = crc32(deviceId + experiment.name);
    const totalWeight = experiment.variants.reduce(
      (sum, v) => sum + v.weight,
      0,
    );
    const target = ((hash % 10000) / 10000) * totalWeight;

    let acc = 0;
    for (const v of experiment.variants) {
      acc += v.weight;
      if (target <= acc) return v.variant;
    }

    return experiment.variants[experiment.variants.length - 1].variant;
  }
}
