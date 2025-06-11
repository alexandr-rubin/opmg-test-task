import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ExperimentsService } from './experiments.service';
import { CreateExperimentDto } from './dtos/input/create-experiment.dto';
import { CompleteExperimentParamDto } from './dtos/input/complete-experiment-params.dto';
import { GetActiveExperimentsForDeviceAndAssignToNewParamDto } from './dtos/input/get-active-experiments-for-device-and-assign-to-new-params.dto';
import { BasicAuthGuard } from 'src/common/guards/auth.guard';

@Controller('experiments')
export class ExperimentsController {
  constructor(private readonly experimentsService: ExperimentsService) {}

  @Post()
  @UseGuards(BasicAuthGuard)
  createExperiment(@Body() body: CreateExperimentDto) {
    return this.experimentsService.createExperiment(body);
  }

  @Patch('complete/:experimentName')
  @UseGuards(BasicAuthGuard)
  completeExperiment(@Param() param: CompleteExperimentParamDto) {
    return this.experimentsService.completeExperiment(param.experimentName);
  }

  @Post('participants/:deviceId')
  getActiveExperimentsForDeviceAndAssignToNew(
    @Param() param: GetActiveExperimentsForDeviceAndAssignToNewParamDto,
  ) {
    return this.experimentsService.getActiveExperimentsForDeviceAndAssignToNew(
      param.deviceId,
    );
  }

  @Get()
  getExperimentsStatistic() {
    return this.experimentsService.getExperimentStats();
  }
}
