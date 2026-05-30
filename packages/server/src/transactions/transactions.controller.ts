import { Controller, Get, Post, Param, Body, Query } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { TransactionsService } from "./transactions.service";

@ApiTags("交易")
@Controller()
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get("transactions")
  @ApiOperation({ summary: "操作记录列表" })
  findAll(
    @Query("itemId") itemId?: string,
    @Query("containerId") containerId?: string,
    @Query("type") type?: string,
    @Query("page") page?: number,
    @Query("pageSize") pageSize?: number,
  ) {
    return { data: this.transactionsService.findAll({ itemId, containerId, type, page, pageSize }) };
  }

  @Get("transactions/:id")
  @ApiOperation({ summary: "操作记录详情" })
  findById(@Param("id") id: string) {
    return { data: this.transactionsService.findById(id) };
  }

  @Post("checkin")
  @ApiOperation({ summary: "入库" })
  checkin(@Body() body: { containerId: string; items: { name: string; quantity: number; unit?: string; expiryDate?: string; notes?: string }[] }) {
    return { data: this.transactionsService.checkin(body) };
  }

  @Post("checkout")
  @ApiOperation({ summary: "出库" })
  checkout(@Body() body: { itemId: string; quantity: number; destination: string; destinationType?: string; notes?: string }) {
    return { data: this.transactionsService.checkout(body) };
  }

  @Post("transfer")
  @ApiOperation({ summary: "调拨" })
  transfer(@Body() body: { itemId: string; quantity: number; toContainerId: string; notes?: string }) {
    return { data: this.transactionsService.transfer(body) };
  }
}
