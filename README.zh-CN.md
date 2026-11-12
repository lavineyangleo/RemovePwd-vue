# RemovePwd Vue Pages 版

简体中文 | [English](./README.md)

这是文档编辑限制清理工具的 Vue 浏览器移植版。PDF、DOCX、XLSX、XLSM 和 PPTX 文件仅在浏览器内存中处理，不会上传。本发布目录不包含上游 PySide6 桌面源码。

## 部署

创建 GitHub 仓库并将本目录推送到 `main` 分支。在仓库 **Settings → Pages** 中将构建与部署来源设为 **GitHub Actions**。仓库内工作流会在每次推送到 `main` 后自动构建并发布。

## 支持范围

- DOCX：清理文档编辑保护标记。
- XLSX/XLSM：清理工作表与工作簿保护标记。
- PPTX：清理修改验证标记。
- 加密 PDF 需要填写正确的打开密码后在本地解密。\n- 不会猜测、破解或绕过打开密码。
- PDF 权限可在本地重写；加密 PDF 需要填写正确的打开密码。

## 许可与归属

上游 [cocolight/RemovePwd](https://github.com/cocolight/RemovePwd) 附带自定义用户协议，并非标准开源许可。本仓库不包含或重新许可其桌面源码。仅当你拥有相关权利或已获得权利人许可时，才公开发布本移植版。随附的 `fflate` 浏览器构建采用 MIT 许可，见 [`FFLATE-LICENSE.txt`](./FFLATE-LICENSE.txt)。
