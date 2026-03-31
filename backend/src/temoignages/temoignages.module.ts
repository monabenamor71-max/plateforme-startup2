import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TemoignagesService } from "./temoignages.service";
import { TemoignagesController } from "./temoignages.controller";
import { Temoignage } from "./temoignage.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Temoignage])],
  controllers: [TemoignagesController],
  providers: [TemoignagesService],
  exports: [TemoignagesService],
})
export class TemoignagesModule {}