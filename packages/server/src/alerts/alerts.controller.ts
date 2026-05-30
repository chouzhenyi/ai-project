import { Controller, Get, Patch, Param, Query } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { AlertsService } from "./alerts.service";

@ApiTags("预警")
@Controller("alerts")
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  @ApiOperation({ summary: "预警列表" })
  findAll(@Query("resolved") resolved?: string) {
    const filterResolved = resolved === "true" ? true : resolved === "false" ? false : undefined;
    return { data: this.alertsService.findAll(filterResolved) };
  }

  @Get("summary")
  @ApiOperation({ summary: "预警统计" })
  getSummary() {
    return { data: this.alertsService.getSummary() };
  }

  @Patch(":id/resolve")
  @ApiOperation({ summary: "标记已处理" })
  resolve(@Param("id") id: string) {
    return { data: this.alertsService.resolve(id) };
  }
}
