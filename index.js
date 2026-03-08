const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { OpenAI } = require("openai");

// إعداد Gemini
const genAI = new GoogleGenerativeAI("AIzaSyD6d4so1YhFaE7Ry1CWtnWaAvtnlNtAVqo");
const geminiModel = genAI.getGenerativeModel({ model: "gemini-pro"});

// إعداد ChatGPT
const openai = new OpenAI({ 
    apiKey: "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" 
});

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    console.log('--- SCAN THIS QR CODE ---');
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('✅ البوت المزدوج خدام دابا!');
});

client.on('message', async (message) => {
    const msg = message.body.toLowerCase();

    try {
        // إذا بغيتي تسول ChatGPT ابدأ بكلمة "gpt"
        if (msg.startsWith('gpt ')) {
            const prompt = message.body.slice(4);
            const completion = await openai.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "gpt-3.5-turbo",
            });
            message.reply("🤖 ChatGPT:\n" + completion.choices[0].message.content);

        // إذا بغيتي تسول Gemini ابدأ بكلمة "gemini"
        } else if (msg.startsWith('gemini ')) {
            const prompt = message.body.slice(7);
            const result = await geminiModel.generateContent(prompt);
            const response = await result.response;
            message.reply("🌟 Gemini:\n" + response.text());
        }
    } catch (error) {
        console.error("Error:", error.message);
        message.reply("❌ وقع مشكل في الاتصال بالذكاء الاصطناعي.");
    }
});

client.initialize();

