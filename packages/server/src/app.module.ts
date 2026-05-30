import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { DbModule } from "./db/db.module";
import { CommonModule } from "./common/common.module";
import { ItemsModule } from "./items/items.module";
import { ContainersModule } from "./containers/containers.module";
import { TransactionsModule } from "./transactions/transactions.module";
import { AlertsModule } from "./alerts/alerts.module";
import { AiModule } from "./ai/ai.module";
import { PhotosModule } from "./photos/photos.module";
import { TasksService } from "./common/tasks.service";
import { ScanController } from "./common/scan.controller";
import { QrcodeController } from "./common/qrcode.controller";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    DbModule,
    CommonModule,
    ItemsModule,
    ContainersModule,
    TransactionsModule,
    AlertsModule,
    AiModule,
    PhotosModule,
  ],
  controllers: [ScanController, QrcodeController],
  providers: [TasksService],
})
export class AppModule {}
