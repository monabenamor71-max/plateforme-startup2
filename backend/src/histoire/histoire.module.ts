import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { HistoireService } from "./histoire.service";
import { HistoireController } from "./histoire.controller";
import { Histoire } from "./histoire.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Histoire])],
  controllers: [HistoireController],
  providers: [HistoireService],
  exports: [HistoireService],
})
export class HistoireModule {}
