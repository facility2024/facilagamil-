import { defineEventHandler, readBody, setResponseStatus } from "h3";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL || "https://placeholder.supabase.co",
    process.env.SUPABASE_SERVICE_KEY || "placeholder",
  );
}

function buildEmailHtml({
  message,
  bannerUrl,
  imageUrl,
  buttonText,
  buttonLink,
  youtubeUrl,
  whatsappNumber,
  includeUnsubscribe,
  trackPixel,
  trackId,
  trackingBase,
}: {
  message: string;
  bannerUrl?: string;
  imageUrl?: string;
  buttonText?: string;
  buttonLink?: string;
  youtubeUrl?: string;
  whatsappNumber?: string;
  includeUnsubscribe: boolean;
  trackPixel: string;
  trackId: string;
  trackingBase: string;
}) {
  let html = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">`;

  if (bannerUrl) {
    html += `<div style="text-align: center; margin-bottom: 20px;"><img src="${bannerUrl}" alt="Banner" style="width: 100%; max-width: 600px; border-radius: 12px 12px 0 0; display: block;" /></div>`;
  }

  html += `<div style="padding: 24px; background: #ffffff; border-radius: 12px; border: 1px solid #eee;">`;
  html += `<div style="white-space: pre-wrap; font-size: 15px; line-height: 1.6;">${message}</div>`;

  if (imageUrl) {
    html += `<div style="margin-top: 20px; text-align: center;"><img src="${imageUrl}" alt="Imagem" style="max-width: 100%; border-radius: 8px;" /></div>`;
  }

  if (buttonText && buttonLink) {
    html += `<div style="margin-top: 24px; text-align: center;"><a href="${buttonLink}" style="display: inline-block; background: linear-gradient(135deg, #6ea8fe, #8b7cf6); color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 15px;">${buttonText}</a></div>`;
  }

  if (youtubeUrl) {
    html += `<div style="margin-top: 20px; text-align: center;"><a href="${youtubeUrl}" style="color: #ff0000; font-size: 14px; font-weight: bold;">&#9654; Assistir no YouTube</a></div>`;
  }

  if (whatsappNumber) {
    const cleanNumber = whatsappNumber.replace(/\D/g, "");
    html += `<div style="margin-top: 16px; text-align: center;"><a href="https://wa.me/${cleanNumber}" style="display: inline-block; background: #25D366; color: #fff; padding: 10px 24px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 14px;">Fale conosco no WhatsApp</a></div>`;
  }

  if (includeUnsubscribe) {
    html += `<div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #eee; text-align: center;"><p style="font-size: 12px; color: #999;">Se nao deseja mais receber nossos emails, <a href="${trackingBase}/api/track?action=unsubscribe&id=${trackId || ""}" style="color: #8b7cf6;">clique aqui para cancelar</a>.</p></div>`;
  }

  html += `</div></div>`;
  html += trackPixel;
  return html;
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const supabase = getSupabase();

  let smtpHost = process.env.SMTP_HOST;
  let smtpPort = parseInt(process.env.SMTP_PORT || "465", 10);
  let smtpUser = process.env.SMTP_USER;
  let smtpPass = process.env.SMTP_PASSWORD;
  let smtpFromName = "Facility Marketing";

  try {
    const { data: settings } = await supabase
      .from("user_settings")
      .select("*")
      .limit(1)
      .single();

    if (settings) {
      if (settings.smtp_host) smtpHost = settings.smtp_host;
      if (settings.smtp_port) smtpPort = parseInt(settings.smtp_port, 10);
      if (settings.smtp_user) smtpUser = settings.smtp_user;
      if (settings.smtp_password) smtpPass = settings.smtp_password;
      if (settings.smtp_from_name) smtpFromName = settings.smtp_from_name;
    }
  } catch {
    // use env vars
  }

  if (!smtpHost || !smtpUser || !smtpPass) {
    setResponseStatus(event, 400);
    return { error: "Servico de email nao configurado. Va a Configuracoes e insira suas credenciais SMTP." };
  }

  const {
    recipients,
    subject,
    message,
    bannerUrl,
    imageUrl,
    buttonText,
    buttonLink,
    youtubeUrl,
    whatsappNumber,
    includeUnsubscribe,
  } = body;

  if (!recipients || !subject || !message) {
    setResponseStatus(event, 400);
    return { error: "Assunto e mensagem sao obrigatorios" };
  }

  const recipientList = recipients
    .split(/[\n,;]+/)
    .map((e: string) => e.trim())
    .filter(Boolean);

  if (recipientList.length > 3000) {
    setResponseStatus(event, 400);
    return { error: "Maximo de 3.000 destinatarios por envio" };
  }

  const trackingBase = process.env.SITE_URL || "";

  let campaignId = "";
  try {
    const { data, error } = await supabase
      .from("email_campaigns")
      .insert({
        subject,
        message,
        banner_url: bannerUrl || null,
        image_url: imageUrl || null,
        button_text: buttonText || null,
        button_link: buttonLink || null,
        youtube_url: youtubeUrl || null,
        whatsapp_number: whatsappNumber || null,
        include_unsubscribe: includeUnsubscribe !== false,
        total_recipients: recipientList.length,
      })
      .select("id")
      .single();

    if (error) {
      console.error("CAMPAIGN_INSERT_ERROR:", JSON.stringify(error));
    } else {
      campaignId = data.id;
    }
  } catch (err) {
    console.error("CAMPAIGN_INSERT_EXCEPTION:", err);
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
    connectionTimeout: 10000,
    greetingTimeout: 5000,
  });

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const email of recipientList) {
    let trackId = "";
    if (campaignId) {
      try {
        const { data } = await supabase
          .from("email_tracks")
          .insert({ campaign_id: campaignId, recipient_email: email })
          .select("id")
          .single();
        if (data) trackId = data.id;
      } catch {
        // ignore
      }
    }

    const trackPixel = trackId
      ? `<img src="${trackingBase}/api/track?id=${trackId}" width="1" height="1" style="display:none;" alt="" />`
      : "";

    const html = buildEmailHtml({
      message,
      bannerUrl,
      imageUrl,
      buttonText,
      buttonLink,
      youtubeUrl,
      whatsappNumber,
      includeUnsubscribe: includeUnsubscribe !== false,
      trackPixel,
      trackId,
      trackingBase,
    });

    try {
      await transporter.sendMail({
        from: `"${smtpFromName}" <${smtpUser}>`,
        to: email,
        subject,
        html,
      });
      sent++;
    } catch (err: unknown) {
      failed++;
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${email}: ${msg}`);
    }
  }

  return {
    sent,
    failed,
    errors: errors.slice(0, 10),
    campaignId,
  };
});
