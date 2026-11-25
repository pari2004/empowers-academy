import QRCode from "qrcode";

/** Encodes `data` (invoice number + amount + a placeholder verify URL) as a PNG buffer for embedding in a PDF. */
export function generateQrPngBuffer(data: string): Promise<Buffer> {
  return QRCode.toBuffer(data, { type: "png", margin: 1, width: 160 });
}
