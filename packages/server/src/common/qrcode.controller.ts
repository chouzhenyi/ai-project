import { Controller, Get, Param, Res } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { Response } from "express";
import QRCode from "qrcode";

@ApiTags("二维码")
@Controller("qrcodes")
export class QrcodeController {
  @Get("container/:id")
  @ApiOperation({ summary: "生成容器二维码" })
  async getContainerQr(@Param("id") id: string, @Res() res: Response) {
    const qr = await QRCode.toBuffer(`C:${id}`, { width: 300, margin: 2 });
    res.type("image/png");
    res.send(qr);
  }

  @Get("item/:id")
  @ApiOperation({ summary: "生成物品二维码" })
  async getItemQr(@Param("id") id: string, @Res() res: Response) {
    const qr = await QRCode.toBuffer(`I:${id}`, { width: 300, margin: 2 });
    res.type("image/png");
    res.send(qr);
  }
}
