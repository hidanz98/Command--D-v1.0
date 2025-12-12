import nodemailer from "nodemailer";
import { Resend } from "resend";
import { TenantSettings } from "@prisma/client";
import { decrypt } from "../utils/encryption";

type EmailProvider = "smtp" | "resend" | "sendgrid" | "mailgun";

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private resend: Resend | null = null;
  private provider: EmailProvider = "smtp";
  private fromAddress: string = "";
  private settings: TenantSettings;

  /**
   * Constructor que aceita TenantSettings diretamente
   */
  constructor(settings: TenantSettings) {
    this.settings = settings;
    
    if (!settings.emailEnabled) {
      throw new Error("Email não está habilitado para este tenant");
    }

    this.provider = (settings.emailProvider as EmailProvider) || "smtp";

    // Configurar endereço de remetente
    if (settings.emailFromName && settings.emailFromAddress) {
      this.fromAddress = `"${settings.emailFromName}" <${settings.emailFromAddress}>`;
    } else {
      this.fromAddress = `"Locadora Cinema" <noreply@locadora.com>`;
    }

    // Inicializar provedor específico
    if (this.provider === "resend") {
      this.initializeResend();
    } else if (this.provider === "smtp") {
      this.initializeSMTP();
    } else {
      throw new Error(`Provedor ${this.provider} não suportado ainda`);
    }

    console.log(`✅ EmailService inicializado com ${this.provider.toUpperCase()}`);
  }

  /**
   * Inicializar Resend API
   */
  private initializeResend() {
    if (!this.settings.resendApiKey) {
      throw new Error("API Key do Resend não configurada");
    }

    const apiKey = decrypt(this.settings.resendApiKey);
    this.resend = new Resend(apiKey);

    console.log("✅ Resend API Key configurada");
  }

  /**
   * Inicializar SMTP tradicional
   */
  private initializeSMTP() {
    if (!this.settings.smtpHost || !this.settings.smtpUser || !this.settings.smtpPassword) {
      throw new Error("Configurações de SMTP incompletas");
    }

    const password = decrypt(this.settings.smtpPassword);

    this.transporter = nodemailer.createTransport({
      host: this.settings.smtpHost,
      port: this.settings.smtpPort || 587,
      secure: this.settings.smtpPort === 465,
      auth: {
        user: this.settings.smtpUser,
        pass: password,
      },
      tls: {
        rejectUnauthorized: this.settings.smtpUseTLS,
      },
    });

    console.log("✅ SMTP configurado");
  }

  /**
   * Enviar email (usa o provedor configurado)
   */
  private async send(to: string, subject: string, html: string) {
    if (this.provider === "resend" && this.resend) {
      // Usar Resend API
      await this.resend.emails.send({
        from: this.fromAddress,
        to: to,
        subject: subject,
        html: html,
      });
    } else if (this.provider === "smtp" && this.transporter) {
      // Usar SMTP
      await this.transporter.sendMail({
        from: this.fromAddress,
        to: to,
        subject: subject,
        html: html,
      });
    } else {
      throw new Error("Nenhum provedor de email inicializado");
    }
  }

  /**
   * Template base HTML
   */
  private getBaseTemplate(content: string, companyName: string = "Locadora Cinema"): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              background: #ffffff;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .content {
              padding: 30px;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background: #F59E0B;
              color: white !important;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: bold;
            }
            .footer {
              background: #1F2937;
              color: #9CA3AF;
              padding: 20px;
              text-align: center;
              font-size: 12px;
            }
            .info-box {
              background: #FEF3C7;
              border-left: 4px solid #F59E0B;
              padding: 15px;
              margin: 20px 0;
              border-radius: 5px;
            }
            .table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            .table th, .table td {
              padding: 12px;
              text-align: left;
              border-bottom: 1px solid #E5E7EB;
            }
            .table th {
              background: #F3F4F6;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${companyName}</h1>
            </div>
            <div class="content">
              ${content}
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} ${companyName}. Todos os direitos reservados.</p>
              <p>Este é um email automático, por favor não responda.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Enviar confirmação de pedido/locação
   */
  async sendOrderConfirmation(
    customerEmail: string,
    customerName: string,
    orderNumber: string,
    startDate: Date,
    endDate: Date,
    items: Array<{ name: string; quantity: number; price: number }>,
    total: number
  ) {
    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    };

    const itemsHTML = items
      .map(
        (item) => `
        <tr>
          <td>${item.name}</td>
          <td style="text-align: center;">${item.quantity}</td>
          <td style="text-align: right;">R$ ${item.price.toFixed(2)}</td>
        </tr>
      `
      )
      .join("");

    const content = `
      <h2>Olá, ${customerName}!</h2>
      <p>Seu pedido <strong>#${orderNumber}</strong> foi confirmado com sucesso! 🎉</p>
      
      <div class="info-box">
        <strong>📅 Período da locação:</strong><br>
        Retirada: ${formatDate(startDate)}<br>
        Devolução: ${formatDate(endDate)}
      </div>

      <h3>Itens do Pedido:</h3>
      <table class="table">
        <thead>
          <tr>
            <th>Produto</th>
            <th style="text-align: center;">Quantidade</th>
            <th style="text-align: right;">Valor</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
        </tbody>
        <tfoot>
          <tr>
            <th colspan="2">Total</th>
            <th style="text-align: right;">R$ ${total.toFixed(2)}</th>
          </tr>
        </tfoot>
      </table>

      <p>Se você tiver alguma dúvida, não hesite em nos contatar!</p>
      <p>Obrigado por escolher nossos serviços! 😊</p>
    `;

    const html = this.getBaseTemplate(content);

    await this.send(
      customerEmail,
      `Pedido #${orderNumber} Confirmado - Locadora Cinema`,
      html
    );

    console.log(`📧 Email de confirmação enviado para ${customerEmail} via ${this.provider}`);
  }

  /**
   * Enviar lembrete de devolução
   */
  async sendReturnReminder(
    customerEmail: string,
    customerName: string,
    orderNumber: string,
    returnDate: Date
  ) {
    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    };

    const content = `
      <h2>Olá, ${customerName}!</h2>
      <p>Este é um lembrete amigável sobre a devolução do seu pedido <strong>#${orderNumber}</strong>.</p>
      
      <div class="info-box">
        <strong>⏰ Data de Devolução: ${formatDate(returnDate)}</strong>
      </div>

      <p>Por favor, certifique-se de devolver os itens na data combinada para evitar cobranças adicionais.</p>
      <p>Obrigado pela sua atenção! 🙏</p>
    `;

    const html = this.getBaseTemplate(content);

    await this.send(
      customerEmail,
      `Lembrete: Devolução do Pedido #${orderNumber}`,
      html
    );

    console.log(`📧 Lembrete de devolução enviado para ${customerEmail} via ${this.provider}`);
  }

  /**
   * Enviar nota fiscal (NFSe)
   */
  async sendInvoice(
    customerEmail: string,
    customerName: string,
    invoiceData: {
      orderNumber: string;
      invoiceNumber: string;
      invoiceUrl?: string;
      total: number;
      date: string;
    }
  ) {

    const content = `
      <h2>Olá, ${customerName}!</h2>
      <p>Sua nota fiscal referente ao pedido <strong>#${invoiceData.orderNumber}</strong> está disponível.</p>
      
      <div class="info-box">
        <strong>🧾 Número da Nota:</strong> ${invoiceData.invoiceNumber}<br>
        <strong>💰 Valor:</strong> R$ ${invoiceData.total.toFixed(2)}<br>
        <strong>📅 Data de Emissão:</strong> ${invoiceData.date}
      </div>

      ${
        invoiceData.invoiceUrl
          ? `
        <center>
          <a href="${invoiceData.invoiceUrl}" class="button">📥 Download da Nota Fiscal</a>
        </center>
      `
          : ""
      }

      <p>Guarde este documento para seus registros fiscais.</p>
      <p>Obrigado! 😊</p>
    `;

    const html = this.getBaseTemplate(content);

    await this.send(
      customerEmail,
      `Nota Fiscal #${invoiceData.invoiceNumber} - Pedido #${invoiceData.orderNumber}`,
      html
    );

    console.log(`📧 Nota fiscal enviada para ${customerEmail} via ${this.provider}`);
  }

  /**
   * Enviar email de redefinição de senha
   */
  async sendPasswordReset(
    userEmail: string,
    userName: string,
    resetToken: string,
    resetUrl: string
  ) {

    const content = `
      <h2>Olá, ${userName}!</h2>
      <p>Recebemos uma solicitação para redefinir sua senha.</p>
      
      <div class="info-box">
        <strong>🔒 Para redefinir sua senha, clique no botão abaixo:</strong>
      </div>

      <center>
        <a href="${resetUrl}" class="button">🔑 Redefinir Senha</a>
      </center>

      <p><small>Ou copie e cole este link no seu navegador:</small><br>
      <small style="color: #6B7280;">${resetUrl}</small></p>

      <p><strong>⚠️ Este link expira em 1 hora.</strong></p>

      <p>Se você não solicitou esta alteração, ignore este email.</p>
    `;

    const html = this.getBaseTemplate(content);

    await this.send(userEmail, "Redefinição de Senha - Locadora Cinema", html);

    console.log(`📧 Email de redefinição de senha enviado para ${userEmail} via ${this.provider}`);
  }

  /**
   * Testar envio de email
   */
  async sendTestEmail(toEmail: string) {

    const providerName = this.provider === "resend" ? "Resend API" : "SMTP";

    const content = `
      <h2>✅ Teste de Email</h2>
      <p>Se você está lendo isso, suas configurações de email estão funcionando perfeitamente!</p>
      
      <div class="info-box">
        <strong>🎉 Parabéns!</strong><br>
        Seu sistema de email está configurado corretamente e pronto para uso.<br>
        <strong>Provedor:</strong> ${providerName}
      </div>

      <p>Você pode agora enviar:</p>
      <ul>
        <li>✅ Confirmações de pedido</li>
        <li>✅ Lembretes de devolução</li>
        <li>✅ Notas fiscais</li>
        <li>✅ Redefinições de senha</li>
      </ul>

      <p>Tudo funcionando com <strong>${providerName}</strong>! 🚀</p>
    `;

    const html = this.getBaseTemplate(content);

    await this.send(toEmail, "✅ Teste de Email - Sistema Configurado", html);

    console.log(`📧 Email de teste enviado para ${toEmail} via ${this.provider}`);
  }
}
