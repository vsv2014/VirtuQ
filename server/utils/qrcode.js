const QRCode = require('qrcode');

const generateQRCode = async (data) => {
  try {
    const qrCode = await QRCode.toDataURL(JSON.stringify(data));
    return qrCode;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

module.exports = { generateQRCode };
