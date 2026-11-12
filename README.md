# RemovePwd Vue Pages Edition

[简体中文](./README.zh-CN.md) | English

A browser-only Vue port of the document editing restriction cleaner. PDF, DOCX, XLSX, XLSM and PPTX files are processed in browser memory; files are not uploaded. This release does not include the upstream PySide6 desktop source.

## Deploy

Create a GitHub repository and push this directory to its `main` branch. In **Settings → Pages**, choose **GitHub Actions** as the build and deployment source. The included workflow builds and publishes the site on each push to `main`.

## Supported files

- DOCX: remove the document editing protection marker.
- XLSX/XLSM: remove worksheet and workbook protection markers.
- PPTX: remove modification verifier markers.
- Encrypted PDFs can be decrypted locally when the correct opening password is provided.\n- The app never guesses, cracks, or bypasses opening passwords.
- PDF permissions can be rewritten locally; encrypted PDFs require the correct opening password.

## License and attribution

The upstream [cocolight/RemovePwd](https://github.com/cocolight/RemovePwd) repository includes a custom user agreement, not a standard open-source license. This repository does not include or relicense its desktop source. Publish this port only if you own the relevant rights or have permission from the rightsholder. The bundled `fflate` browser build is under MIT; see [`FFLATE-LICENSE.txt`](./FFLATE-LICENSE.txt).
