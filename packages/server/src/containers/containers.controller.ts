import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { ContainersService } from "./containers.service";

@ApiTags("容器")
@Controller("containers")
export class ContainersController {
  constructor(private readonly containersService: ContainersService) {}

  @Get()
  @ApiOperation({ summary: "容器列表" })
  findAll(@Query("parentId") parentId?: string, @Query("keyword") keyword?: string) {
    return { data: this.containersService.findAll(parentId, keyword) };
  }

  @Get("tree")
  @ApiOperation({ summary: "位置树" })
  getTree() {
    return { data: this.containersService.getTree() };
  }

  @Get(":id")
  @ApiOperation({ summary: "容器详情（含物品）" })
  findById(@Param("id") id: string) {
    return { data: this.containersService.findById(id) };
  }

  @Post()
  @ApiOperation({ summary: "创建容器" })
  create(@Body() body: { name: string; parentId?: string; type: string; conditions?: string }) {
    return { data: this.containersService.create(body) };
  }

  @Patch(":id")
  @ApiOperation({ summary: "更新容器" })
  update(@Param("id") id: string, @Body() body: Record<string, unknown>) {
    return { data: this.containersService.update(id, body) };
  }

  @Delete(":id")
  @ApiOperation({ summary: "删除容器" })
  delete(@Param("id") id: string) {
    return { data: this.containersService.delete(id) };
  }
}
