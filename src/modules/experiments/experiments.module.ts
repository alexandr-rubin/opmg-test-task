import { Module } from '@nestjs/common';
import { ExperimentsController } from './experiments.controller';
import { ExperimentsRepository } from './infrastructure/repositories/experiments.repository';
import { ExperimentsService } from './experiments.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ExperimentsQueryRepository } from './infrastructure/repositories/experiments.query-repository';
import { Device, DeviceSchema } from './infrastructure/schemas/device.schema';
import {
  ExperimentParticipant,
  ExperimentParticipantSchema,
} from './infrastructure/schemas/experiment-participant.schema';
import {
  Experiment,
  ExperimentSchema,
} from './infrastructure/schemas/experiment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Experiment.name, schema: ExperimentSchema },
      { name: Device.name, schema: DeviceSchema },
      { name: ExperimentParticipant.name, schema: ExperimentParticipantSchema },
    ]),
  ],
  controllers: [ExperimentsController],
  providers: [
    ExperimentsRepository,
    ExperimentsQueryRepository,
    ExperimentsService,
  ],
})
export class ExperimentsModule {}
