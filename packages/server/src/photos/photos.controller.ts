import { Controller, Post, Get, Delete, Param, UploadedFile, UseInterceptors, Res } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { Response } from "express";
import { PhotosService } from "./photos.service";

interface MulterFile {
  originalname: string;
  buffer: Buffer;
  mimetype: string;
  size: number;
  fieldname: string;
  encoding: string;
}

@ApiTags("图片")
@Controller("photos")
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @Post("upload")
  @UseInterceptors(FileInterceptor("file"))
  @ApiOperation({ summary: "上传图片" })
  async upload(@UploadedFile() file: MulterFile) {
    return { data: await this.photosService.upload(file) };
  }

  @Get(":year/:month/:filename")
  @ApiOperation({ summary: "获取图片" })
  get(@Param("year") year: string, @Param("month") month: string, @Param("filename") filename: string, @Res() res: Response) {
    const filePath = this.photosService.getFilePath(`/${year}/${month}/${filename}`);
    res.sendFile(filePath);
  }

  @Delete(":year/:month/:filename")
  @ApiOperation({ summary: "删除图片" })
  delete(@Param("year") year: string, @Param("month") month: string, @Param("filename") filename: string) {
    return { data: this.photosService.delete(`/${year}/${month}/${filename}`) };
  }
}
