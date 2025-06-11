import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExperimentsModule } from './modules/experiments/experiments.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://localhost:27017/test',
    ),
    ExperimentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
