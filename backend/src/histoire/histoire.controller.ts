import { Controller, Get, Put, Body } from "@nestjs/common";
import { HistoireService } from "./histoire.service";

@Controller("histoire")
export class HistoireController {
  constructor(private readonly histoireService: HistoireService) {}

  @Get()
  get() {
    return this.histoireService.get();
  }

  @Put()
  update(@Body() body: any) {
    return this.histoireService.update(body);
  }
}