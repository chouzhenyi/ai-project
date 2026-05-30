import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { ItemsService } from "./items.service";

@ApiTags("物品")
@Controller("items")
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get()
  @ApiOperation({ summary: "物品列表" })
  findAll(
    @Query("keyword") keyword?: string,
    @Query("categoryId") categoryId?: string,
    @Query("locationId") locationId?: string,
    @Query("page") page?: number,
    @Query("pageSize") pageSize?: number,
  ) {
    return { data: this.itemsService.findAll({ keyword, categoryId, locationId, page, pageSize }) };
  }

  @Get(":id")
  @ApiOperation({ summary: "物品详情" })
  findById(@Param("id") id: string) {
    return { data: this.itemsService.findById(id) };
  }

  @Post()
  @ApiOperation({ summary: "创建物品" })
  create(@Body() body: Record<string, unknown>) {
    return { data: this.itemsService.create(body as any) };
  }

  @Patch(":id")
  @ApiOperation({ summary: "更新物品" })
  update(@Param("id") id: string, @Body() body: Record<string, unknown>) {
    return { data: this.itemsService.update(id, body) };
  }

  @Delete(":id")
  @ApiOperation({ summary: "删除物品" })
  delete(@Param("id") id: string) {
    return { data: this.itemsService.delete(id) };
  }
}
