import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Podcast } from './podcast.entity';
import { PodcastService } from './podcast.service';
import { PodcastController } from './podcast.controller';
import { Expert } from '../user/expert.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Podcast, Expert])],
  controllers: [PodcastController],
  providers: [PodcastService],
  exports: [PodcastService],
})
export class PodcastModule {}