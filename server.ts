import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import Razorpay from "razorpay";
import crypto from "crypto";
import multer from "multer";
import { uploadImage, deleteImage } from "./src/server/cloudinary.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Support up to 10MB JSON payloads
  app.use(express.json({ limit: "10mb" }));

  // Initialize Gemini safely
  let ai: GoogleGenAI | null = null;
  try {
    if (process.env.GEMINI_API_KEY) {
      ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  } catch (e) {
    console.warn("GoogleGenAI client initialization notice:", e);
  }

  // Helper for graceful fallback when API quotas are exceeded
  const generateArtisanFallbackReply = (userMessage: string, _systemInstruction?: string): string => {
    const query = (userMessage || "").toLowerCase();
    
    if (query.includes("vastu") || query.includes("direction") || query.includes("placement") || query.includes("north") || query.includes("east")) {
      return `**Vastu & Decor Guidance for Lippan Art:**\n\n- **North-East / East Walls:** Ideal for solar-themed mandalas, lotus motifs, or gold-terracotta palettes. Invites clarity and positive energy.\n- **Living Room Foyer:** A 24-inch or 30-inch circular Lippan mirror plaque directly opposite the entryway reflects ambient light and welcomes guests with artisanal warmth.\n- **Bedrooms / Meditation Corners:** Choose soothing indigo, turquoise, or pastel gold palettes for serene, reflective vibes.\n\n*Would you like advice on custom dimensions or mirror shapes for your specific wall size?*`;
    }
    
    if (query.includes("mirror") || query.includes("clay") || query.includes("texture") || query.includes("shape") || query.includes("material")) {
      return `**Artisanal Design Specifications:**\n\n- **Mirror Work:** High-grade convex & diamond cut mirror studs (*Abhla*) set inside clay grooves.\n- **Clay Relief:** Hand-molded organic clay braids and dots on water-resistant MDF wooden base.\n- **Durability:** Sealed with protective matte lacquer to prevent moisture degradation.\n\n*Feel free to specify your preferred dimensions (12", 18", 24", 30", 36") or custom color theme!*`;
    }
    
    if (query.includes("shipping") || query.includes("delivery") || query.includes("time") || query.includes("lead") || query.includes("days")) {
      return `**Custom Order & Shipping Info:**\n\n- **Hand-painting Lead Time:** 5 to 7 working days for artisan crafting & mirror setting.\n- **Packaging:** Multi-layer bubble wrap in reinforced wood-grain boxes for 100% safe transit Pan-India.\n- **Free Shipping:** Applicable on all orders above ₹1,499.\n\n*Have any special delivery requests or urgent gift dates? Let us know!*`;
    }

    return `Namaste! Thank you for reaching out to Vlaksha Crafts. Laksha's studio specializes in authentic Indian Lippan (mud-mirror) art and custom mandala artwork.\n\nWhether you need custom color palettes, specific wall measurements, or Vastu guidance, I am here to assist your vision. How can I help customize your craft today?`;
  };

  // Multi-turn Gemini Chatbot Endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];
      const systemInstruction = req.body?.systemInstruction || "";
      const model = req.body?.model;
      const temperature = req.body?.temperature;

      const contents = messages.map((m: any) => ({
        role: m.role === "assistant" ? "model" : (m.role || "user"),
        parts: [{ text: String(m.content || m.text || "") }],
      }));

      // Candidate models list in order of reliability across free/paid tiers
      const modelsToTry = [
        model,
        "gemini-flash-latest",
        "gemini-3.1-pro",
        "gemini-3.5-flash",
        "gemini-3.1-pro-preview",
        "gemini-2.0-flash-exp",
        "gemini-2.0-flash",
        "gemini-1.5-flash",
        "gemini-1.5-pro"
      ].filter((m, idx, arr) => Boolean(m) && arr.indexOf(m) === idx);

      if (ai && process.env.GEMINI_API_KEY && contents.length > 0) {
        for (const modelCandidate of modelsToTry) {
          try {
            const response = await ai.models.generateContent({
              model: modelCandidate as string,
              contents,
              config: { 
                systemInstruction,
                ...(temperature !== undefined ? { temperature: Number(temperature) } : {})
              },
            });

            if (response?.text) {
              return res.json({ text: response.text });
            }
          } catch (err: any) {
            const errStr = String(err?.message || err);
            console.warn(`[Gemini Chat] ${modelCandidate} notice: ${errStr.substring(0, 100)}`);
          }
        }
      }

      // Quota / fallback response without ever returning non-200 status code
      const lastUserMsg = messages.filter((m: any) => m.role === 'user').pop()?.content || '';
      const fallbackText = generateArtisanFallbackReply(lastUserMsg, systemInstruction);
      return res.json({ text: fallbackText });

    } catch (error: any) {
      console.error("Chat handler error:", error);
      const lastUserMsg = req.body?.messages?.filter((m: any) => m.role === 'user').pop()?.content || '';
      return res.json({ text: generateArtisanFallbackReply(lastUserMsg) });
    }
  });

  // High-Quality Image Generation & Aspect Ratio Control Endpoint
  app.post("/api/generate-image", async (req, res) => {
    const { prompt, model, aspectRatio, imageSize } = req.body;
    
    // Map to standard supported ratios: "1:1", "3:4", "4:3", "9:16", "16:9", "1:4", "1:8", "4:1", "8:1"
    const getValidRatio = (ratio: string) => {
      const allowed = ["1:1", "3:4", "4:3", "9:16", "16:9", "1:4", "1:8", "4:1", "8:1"];
      if (allowed.includes(ratio)) return ratio;
      if (ratio === "2:3") return "3:4";
      if (ratio === "3:2") return "4:3";
      if (ratio === "21:9") return "16:9";
      return "1:1";
    };

    // Calculate dimensions for fallback AI generator
    const getRatioDimensions = (ratio: string) => {
      switch (ratio) {
        case "16:9": return { width: 1280, height: 720 };
        case "9:16": return { width: 720, height: 1280 };
        case "4:3": return { width: 1024, height: 768 };
        case "3:4": return { width: 768, height: 1024 };
        case "3:2": return { width: 1080, height: 720 };
        case "2:3": return { width: 720, height: 1080 };
        default: return { width: 1024, height: 1024 };
      }
    };

    const modelsToTry = [
      model,
      "gemini-2.5-flash-image",
      "gemini-2.0-flash-exp",
      "gemini-1.5-flash"
    ].filter((m, idx, arr) => Boolean(m) && arr.indexOf(m) === idx);

    let base64Data = "";

    // 1. Try Gemini Models if API key exists
    if (process.env.GEMINI_API_KEY) {
      for (const modelCandidate of modelsToTry) {
        try {
          const response = await ai.models.generateContent({
            model: modelCandidate as string,
            contents: {
              parts: [{ text: `${prompt}. Style: Authentic Kutchi Lippan mud and mirror relief art, handcrafted mirror mosaic on clay plaque, traditional Indian wall artwork, detailed 3D texture, photorealistic studio camera lighting.` }],
            },
            config: {
              imageConfig: {
                aspectRatio: getValidRatio(aspectRatio),
                imageSize: imageSize || "1K",
              },
            },
          });

          if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
              if (part.inlineData && part.inlineData.data) {
                base64Data = part.inlineData.data;
                const mime = part.inlineData.mimeType || "image/png";
                return res.json({ imageUrl: `data:${mime};base64,${base64Data}`, engine: "gemini" });
              }
            }
          }
        } catch (err: any) {
          const errStr = String(err?.message || err);
          if (errStr.includes("429") || errStr.includes("quota") || errStr.includes("RESOURCE_EXHAUSTED")) {
            console.log(`[Image Gen] Gemini API quota reached for ${modelCandidate}. Trying next model or fallback.`);
          }
        }
      }
    }

    // 2. High-Quality Fallback AI Generator (Pollinations Engine)
    try {
      const { width, height } = getRatioDimensions(aspectRatio);
      const seed = Math.floor(Math.random() * 900000) + 100000;
      const enhancedPrompt = `${prompt}, authentic Indian Lippan mud and mirror art, traditional Kutch clay relief art piece with sparkling mirrors, golden borders, detailed studio photograph`;
      const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=${width}&height=${height}&nologo=true&seed=${seed}&enhance=true`;

      return res.json({ 
        imageUrl: fallbackUrl, 
        engine: "pollinations"
      });
    } catch {
      // 3. Fallback to curated Unsplash Indian Handicraft Artwork
      const curatedArts = [
        "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?q=80&w=1000&auto=format&fit=crop"
      ];
      const selectedImg = curatedArts[Math.floor(Math.random() * curatedArts.length)];
      return res.json({ imageUrl: selectedImg, engine: "curated" });
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

  // Cloudinary Multer Setup
  const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 4.5 * 1024 * 1024 } // 4.5MB limit (Vercel serverless limit)
  });

  // Upload Image to Cloudinary
  app.post("/api/upload", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No image file provided" });
        return;
      }
      const folder = req.body.folder || "misc";
      const publicId = req.body.publicId;

      const result = await uploadImage(req.file.buffer, folder, publicId);
      res.json({
        secure_url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      });
    } catch (error: any) {
      console.error("Cloudinary upload failed:", error);
      res.status(500).json({ error: error.message || "Failed to upload image to Cloudinary" });
    }
  });

  // Delete Image from Cloudinary
  app.delete("/api/delete-image", async (req, res) => {
    try {
      const { public_id } = req.body;
      if (!public_id) {
        res.status(400).json({ error: "Missing public_id" });
        return;
      }
      const result = await deleteImage(public_id);
      res.json({ success: true, result });
    } catch (error: any) {
      console.error("Cloudinary delete failed:", error);
      res.status(500).json({ error: error.message || "Failed to delete image" });
    }
  });

  // Migration Endpoint (Stub for triggering manual migration later)
  app.post("/api/migrate-cloudinary", async (req, res) => {
    // This will be called from the frontend or a script to loop over Firestore documents
    // and upload their embedded base64 strings to Cloudinary.
    res.json({ message: "Migration endpoint ready. Please implement the Firestore loop client-side or here." });
  });

  // Vite middleware setup for Development
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    (async () => {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    })();
  } else if (!process.env.VERCEL) {
    // Serve static assets in Production (Non-Vercel)
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Express server running on port ${PORT}`);
    });
  }

export default app;
