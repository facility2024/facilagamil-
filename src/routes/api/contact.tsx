import { createAPIFileRoute } from "@tanstack/react-start/api";
import nodemailer from "nodemailer";

export const Route = createAPIFileRoute("/api/contact")({
  POST: async ({ request }) => {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || "465", 10);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASSWORD;

    if (!smtpHost || !smtpUser || !smtpPass) {
      return new Response(
        JSON.stringify({ error: "Servico de email nao configurado. Contate o administrador." }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Dados invalidos" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: "Nome, email e mensagem sao obrigatorios" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });

    try {
      await transporter.sendMail({
        from: `"${name}" <${smtpUser}>`,
        replyTo: email,
        to: smtpUser,
        subject: subject || `Contato de ${name}`,
        html: `
          <div style="font-family:Arial; max-width:600px; margin:0 auto;">
            <h2 style="color:#1e2233;">Nova mensagem de contato</h2>
            <p><strong>Nome:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Assunto:</strong> ${subject || "N/A"}</p>
            <hr />
            <p style="white-space:pre-wrap;">${message}</p>
          </div>
        `,
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao enviar mensagem";
      return new Response(JSON.stringify({ error: msg }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
});
