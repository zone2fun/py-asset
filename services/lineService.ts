import { Property, SubmissionForm } from '../types';
import { LINE_OA_ID } from '../constants';

/**
 * Generates a Deep Link to open LINE with a pre-filled message about a property.
 */
export const getPropertyInquiryUrl = (property: Property): string => {
  const message = `สนใจทรัพย์นี้ครับ:\n${property.title}\nราคา: ${property.price.toLocaleString()} บาท\nรหัสทรัพย์: ${property.id}`;
  const encodedMessage = encodeURIComponent(message);
  // Using line.me/R/oaMessage sends a message to the official account directly if added
  // Or use /ti/p/ to open profile. Using share link for broader compatibility here.
  // Note: 'line.me/R/oaMessage' works best on mobile.
  return `https://line.me/R/oaMessage/${LINE_OA_ID}/?${encodedMessage}`;
};

/**
 * Simulates sending user submission to a backend which would then forward to LINE.
 * Since this is a client-side demo, we format the data for the user to manually send 
 * or log it as a proof of concept.
 */
export const formatSubmissionMessage = (data: SubmissionForm): string => {
  const loc = data.latitude && data.longitude 
    ? `https://www.google.com/maps?q=${data.latitude},${data.longitude}` 
    : 'Not provided';
  
  const imageCount = data.images.length;
    
  return `
เสนอทรัพย์ใหม่:
ชื่อผู้ติดต่อ: ${data.name}
เบอร์โทร: ${data.phone}
รายละเอียด: ${data.description}
จำนวนรูปภาพ: ${imageCount} รูป
พิกัด: ${loc}
(หมายเหตุ: กรุณาส่งรูปภาพทั้ง ${imageCount} รูป เข้ามาในแชทหลังจากกดส่งข้อความนี้)
  `.trim();
};