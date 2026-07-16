import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import Razorpay from "razorpay";
import crypto from "crypto";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support up to 10MB JSON payloads
  app.use(express.json({ limit: "10mb" }));

  // Initialize Gemini safely
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  // Multi-turn Gemini Chatbot Endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, systemInstruction, model } = req.body;
      const selectedModel = model || "gemini-3.5-flash";
      
      const contents = messages.map((m: any) => ({
        role: m.role === "assistant" ? "model" : m.role,
        parts: [{ text: m.content || m.text }],
      }));

      const response = await ai.models.generateContent({
        model: selectedModel,
        contents,
        config: {
          systemInstruction,
        },
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Chat error:", error);
      res.status(500).json({ error: error.message || "Failed to generate chat response" });
    }
  });

  // High-Quality Image Generation & Aspect Ratio Control Endpoint
  app.post("/api/generate-image", async (req, res) => {
    try {
      const { prompt, model, aspectRatio, imageSize } = req.body;
      const selectedModel = model || "gemini-3.1-flash-image";

      // Map to standard supported ratios: "1:1", "3:4", "4:3", "9:16", "16:9", "1:4", "1:8", "4:1", "8:1"
      const getValidRatio = (ratio: string) => {
        const allowed = ["1:1", "3:4", "4:3", "9:16", "16:9", "1:4", "1:8", "4:1", "8:1"];
        if (allowed.includes(ratio)) return ratio;
        if (ratio === "2:3") return "3:4";
        if (ratio === "3:2") return "4:3";
        if (ratio === "21:9") return "16:9";
        return "1:1";
      };

      const response = await ai.models.generateContent({
        model: selectedModel,
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: getValidRatio(aspectRatio),
            imageSize: imageSize || "1K",
          },
        },
      });

      let base64Data = "";
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            base64Data = part.inlineData.data;
            break;
          }
        }
      }

      if (!base64Data) {
        throw new Error("No image was generated. Please verify your prompt, model choice, or billing limits.");
      }

      res.json({ imageUrl: `data:image/png;base64,${base64Data}` });
    } catch (error: any) {
      console.error("Image generation error:", error);
      res.status(500).json({ error: error.message || "Failed to generate image" });
    }
  });

  // Automated Email Notification on Order Placement Endpoint
  app.post("/api/send-order-email", async (req, res) => {
    try {
      const { orderId, customerName, customerEmail, customerPhone, totalAmount, items } = req.body;

      if (!orderId || !customerEmail || !items || !Array.isArray(items)) {
        res.status(400).json({ error: "Missing required order details." });
        return;
      }

      const hostUrl = process.env.APP_URL || "https://vlakshacrafts.com";
      const receiptUrl = `${hostUrl}?orderId=${orderId}`;

      // Build items table rows
      const itemRowsHtml = items.map((item: any) => {
        const name = item.product?.name || "Handmade Lippan Art Piece";
        const size = item.size || "Standard";
        const qty = item.quantity || 1;
        const price = item.product?.price || 0;
        const personalizationText = item.personalization?.text 
          ? `<br/><span style="font-size: 11px; color: #c5a059;">Custom Calligraphy: "${item.personalization.text}"</span>`
          : "";

        return `
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #EAE6DF;">
              <strong style="color: #1a2a4e;">${name}</strong>
              <br/><span style="font-size: 11px; color: #707070;">Size: ${size}</span>
              ${personalizationText}
            </td>
            <td style="padding: 12px 0; border-bottom: 1px solid #EAE6DF; text-align: center; color: #707070;">${qty}</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #EAE6DF; text-align: right; font-weight: bold;">₹${price.toLocaleString('en-IN')}</td>
          </tr>
        `;
      }).join("");

      // Beautiful responsive HTML email template
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmed - Vlaksha Crafts</title>
        </head>
        <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #FCFBF7; margin: 0; padding: 20px; color: #1a1a1a;">
          <div style="max-width: 600px; margin: 20px auto; background-color: #FFFFFF; border: 1px solid #c5a059; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
            
            <!-- Lippan work themed Header -->
            <div style="text-align: center; border-bottom: 2px solid #EAE6DF; padding-bottom: 20px; margin-bottom: 20px;">
              <div style="font-size: 24px; font-family: Georgia, serif; letter-spacing: 2px; color: #1a2a4e; margin-bottom: 5px;">
                VLAKSHA <span style="color: #c5a059; font-weight: normal;">CRAFTS</span>
              </div>
              <div style="font-size: 9px; letter-spacing: 3px; text-transform: uppercase; color: #c5a059; opacity: 0.8;">
                Artisanal Lippan & Mandala Studio
              </div>
            </div>

            <!-- Greeting -->
            <div style="font-size: 18px; font-family: Georgia, serif; color: #1a1a1a; margin-bottom: 15px;">
              Namaste, ${customerName}!
            </div>
            <p style="font-size: 14px; line-height: 1.6; color: #4a4a4a; margin-bottom: 25px;">
              Thank you for placing your order with Vlaksha Crafts. Laksha has received your order and began preparing the custom premium wooden base for your handmade mud-mirror clay relief art.
            </p>

            <div style="background-color: #FAF9F5; border-left: 3px solid #c5a059; padding: 15px; margin-bottom: 25px; font-size: 13px;">
              <strong>Order ID:</strong> <span style="font-family: monospace;">#${orderId}</span><br/>
              <strong>Contact Phone:</strong> ${customerPhone || "N/A"}<br/>
              <strong>Date:</strong> ${new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}
            </div>

            <!-- Summary Table -->
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <thead>
                <tr>
                  <th style="text-align: left; border-bottom: 2px solid #1a2a4e; padding-bottom: 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #707070;">Artwork</th>
                  <th style="text-align: center; border-bottom: 2px solid #1a2a4e; padding-bottom: 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #707070; width: 60px;">Qty</th>
                  <th style="text-align: right; border-bottom: 2px solid #1a2a4e; padding-bottom: 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #707070; width: 100px;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemRowsHtml}
                <tr style="font-weight: bold; font-size: 16px;">
                  <td colspan="2" style="padding-top: 20px; text-align: left;">Total Paid Amount</td>
                  <td style="padding-top: 20px; text-align: right; color: #1a2a4e;">₹${totalAmount.toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>

            <!-- Call to Action -->
            <div style="text-align: center; margin-top: 35px; margin-bottom: 30px;">
              <a href="${receiptUrl}" target="_blank" style="background-color: #1a2a4e; color: #ffffff !important; text-decoration: none; padding: 14px 30px; font-size: 11px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; display: inline-block; box-shadow: 0 4px 6px rgba(26, 42, 78, 0.15);">
                View Digital Receipt & Track Order
              </a>
            </div>

            <p style="font-size: 13px; line-height: 1.6; color: #707070; text-align: center;">
              Each order is fully crafted carefully by hand with premium glass and clay. You can track the production process in real-time on our studio portal.
            </p>

            <!-- Footer -->
            <div style="font-size: 11px; color: #999999; text-align: center; margin-top: 40px; border-top: 1px solid #EAE6DF; padding-top: 20px;">
              🌸 Handmolded with Divine Devotion in Noida, India 🌸<br/>
              Vlaksha Crafts • Artisanal Sacred Lippan Art<br/>
              <span style="font-size: 10px; color: #c5a059; margin-top: 5px; display: block;">If you have questions, reply to this email or contact Laksha directly via WhatsApp.</span>
            </div>

          </div>
        </body>
        </html>
      `;

      // Lazy Initialization of SMTP Transporter if configurations are available
      const smtpHost = process.env.SMTP_HOST;
      const smtpPort = parseInt(process.env.SMTP_PORT || "587");
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;
      const smtpFrom = process.env.SMTP_FROM || "Vlaksha Crafts <noreply@vlakshacrafts.com>";

      let emailSent = false;
      let logMessage = "Automated email triggered successfully (Simulated)";

      if (smtpHost && smtpUser && smtpPass) {
        console.log(`[SMTP] Sending real order confirmation email to ${customerEmail}...`);
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: {
            user: smtpUser,
            pass: smtpPass
          }
        });

        await transporter.sendMail({
          from: smtpFrom,
          to: customerEmail,
          subject: `✨ Order Confirmed! Vlaksha Crafts #${orderId}`,
          html: emailHtml
        });
        
        emailSent = true;
        logMessage = "Automated email sent successfully via SMTP";
      } else {
        // Log to console for preview developer inspection
        console.log("===============================================================================");
        console.log(`[SIMULATED EMAIL] To: ${customerEmail}`);
        console.log(`[SIMULATED EMAIL] Subject: ✨ Order Confirmed! Vlaksha Crafts #${orderId}`);
        console.log(`[SIMULATED EMAIL] Link: ${receiptUrl}`);
        console.log("===============================================================================");
      }

      res.json({
        success: true,
        message: logMessage,
        emailSent,
        receiptUrl,
        recipient: customerEmail
      });

    } catch (error: any) {
      console.error("Failed to process order email:", error);
      res.status(500).json({ error: error.message || "Failed to trigger order confirmation email." });
    }
  });

  // Get active Razorpay configuration & credentials
  const razorpayKeyId = process.env.RAZORPAY_KEY_ID || "rzp_test_TE7Zc6gfakq6Zm";
  const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || "0uO3rMamT6Fv5Iu6Bp6hkgex";

  let razorpayInstance: any = null;
  try {
    if (razorpayKeyId && razorpayKeySecret) {
      razorpayInstance = new Razorpay({
        key_id: razorpayKeyId,
        key_secret: razorpayKeySecret,
      });
    }
  } catch (err) {
    console.error("Failed to initialize Razorpay SDK:", err);
  }

  // Get Razorpay client configuration
  app.get("/api/payment/config", (req, res) => {
    res.json({
      keyId: razorpayKeyId || null,
      isActive: !!razorpayInstance
    });
  });

  // Create Razorpay order
  app.post("/api/payment/create-order", async (req, res) => {
    try {
      const { amount, currency } = req.body;
      if (!amount) {
        res.status(400).json({ error: "Amount is required" });
        return;
      }

      if (!razorpayInstance) {
        res.status(500).json({ error: "Razorpay integration is not initialized or configured." });
        return;
      }

      // Amount must be in subunits (e.g. paise for INR). Razorpay requires integer.
      const orderAmount = Math.round(amount * 100); 
      const options = {
        amount: orderAmount,
        currency: currency || "INR",
        receipt: `receipt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      };

      const order = await razorpayInstance.orders.create(options);
      res.json(order);
    } catch (error: any) {
      console.error("Razorpay order creation error:", error);
      res.status(500).json({ error: error.message || "Failed to create Razorpay order" });
    }
  });

  // Verify payment signature
  app.post("/api/payment/verify", async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        res.status(400).json({ error: "Missing verification parameters" });
        return;
      }

      const hmac = crypto.createHmac("sha256", razorpayKeySecret);
      hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
      const generated_signature = hmac.digest("hex");

      if (generated_signature === razorpay_signature) {
        res.json({ success: true, message: "Payment verified successfully" });
      } else {
        res.status(400).json({ success: false, error: "Payment verification failed. Signature mismatch." });
      }
    } catch (error: any) {
      console.error("Razorpay verification error:", error);
      res.status(500).json({ error: error.message || "Failed to verify signature" });
    }
  });

  // Vite middleware setup for Development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static assets in Production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on port ${PORT}`);
  });
}

startServer();
