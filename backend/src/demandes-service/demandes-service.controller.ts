import { Controller, Get, Post, Patch, Delete, Body, Param, Req, UseGuards } from "@nestjs/common";
import { DemandesServiceService } from "./demandes-service.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("demandes-service")
export class DemandesServiceController {
  constructor(private svc: DemandesServiceService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req: any, @Body() body: any) {
    return this.svc.create(req.user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get("mes-demandes")
  mesDemandes(@Req() req: any) {
    return this.svc.getMesDemandes(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get("all")
  all() {
    return this.svc.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id/valider")
  valider(@Param("id") id: string, @Body() body: any) {
    return this.svc.valider(+id, body.commentaire);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id/refuser")
  refuser(@Param("id") id: string, @Body() body: any) {
    return this.svc.refuser(+id, body.commentaire);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  supprimer(@Param("id") id: string) {
    return this.svc.supprimer(+id);
  }
}
