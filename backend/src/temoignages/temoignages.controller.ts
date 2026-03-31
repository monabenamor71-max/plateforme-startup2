import { Controller, Get, Post, Patch, Delete, Body, Param, Request, UseGuards } from "@nestjs/common";
import { TemoignagesService } from "./temoignages.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("temoignages")
export class TemoignagesController {
  constructor(private temoService: TemoignagesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() body: any, @Request() req: any) {
    return this.temoService.create(req.user.id, body.texte);
  }

  @Get("publics")
  getPublics() {
    return this.temoService.getPublics();
  }

  @Get("mes-temoignages")
  @UseGuards(JwtAuthGuard)
  getMes(@Request() req: any) {
    return this.temoService.getMesTemoignages(req.user.id);
  }

  @Get("all")
  getAll() {
    return this.temoService.getAll();
  }

  @Patch(":id/valider")
  valider(@Param("id") id: number) {
    return this.temoService.valider(id);
  }

  @Patch(":id/refuser")
  refuser(@Param("id") id: number) {
    return this.temoService.refuser(id);
  }

  @Delete(":id")
  supprimer(@Param("id") id: number) {
    return this.temoService.supprimer(id);
  }
}