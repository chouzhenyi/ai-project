import { Controller, Post, Body, NotFoundException } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { ContainersService } from "../containers/containers.service";
import { ItemsService } from "../items/items.service";

@ApiTags("扫码")
@Controller("scan")
export class ScanController {
  constructor(
    private readonly containersService: ContainersService,
    private readonly itemsService: ItemsService,
  ) {}

  @Post()
  @ApiOperation({ summary: "扫码解析" })
  scan(@Body() body: { code: string }) {
    const { code } = body;
    if (!code) throw new NotFoundException("无效的二维码");

    if (code.startsWith("C:")) {
      const id = code.slice(2);
      const container = this.containersService.findById(id);
      return { data: { ...container, scanType: "container" } };
    }

    if (code.startsWith("I:")) {
      const id = code.slice(2);
      const item = this.itemsService.findById(id);
      return { data: { ...item, scanType: "item" } };
    }

    throw new NotFoundException("无法识别的二维码");
  }
}
