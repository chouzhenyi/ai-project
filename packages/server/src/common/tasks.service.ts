import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { AlertsService } from "../alerts/alerts.service";

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private readonly alertsService: AlertsService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  checkExpiryAlerts() {
    this.logger.log("Running daily expiry check...");
    this.alertsService.checkExpiryAlerts();
  }
}
