const fs = require('fs');
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');

const client = new Client({
    authStrategy: new LocalAuth() // menyimpan auth session otomatis di folder .wwebjs_auth
});

// Data bibit alpukat
const bibitData = {
    miki: { '45': 15000, '60': 25000, '80': 33000, '100': 45000, '150': 150000, '200': 200000 },
    aligator: { '45': 15000, '60': 25000, '80': 33000, '100': 45000, '150': 150000, '200': 200000 },
    kelud: { '45': 15000, '60': 25000, '80': 33000, '100': 45000, '150': 150000, '200': 200000 },
    redvietnam: { '45': 15000, '60': 25000, '80': 33000, '100': 45000, '150': 150000, '200': 200000 },
    markus: { '45': 15000, '60': 25000, '80': 33000, '100': 45000, '150': 150000, '200': 200000 },
    sab034: { '45': 17000, '60': 27000, '80': 35000, '100': 47000, '150': 180000, '200': 230000 },
    cuba: { '45': 17000, '60': 27000, '80': 35000, '100': 47000, '150': 180000, '200': 230000 },
    b10: { '45': 17000, '60': 27000, '80': 35000, '100': 47000, '150': 180000, '200': 230000 },
    siger: { '45': 20000, '60': 40000, '80': 70000, '100': 120000, '150': 200000, '200': 280000 },
    hass: { '45': 15000, '60': 25000, '80': 33000, '100': 45000, '150': 150000, '200': 200000 },
    yellowvietnam: { '45': 17000, '60': 27000, '80': 35000, '100': 47000, '150': 180000, '200': 230000 }
};

const catatan = '\n\n*Catatan:* Untuk pembelian grosir (minimal 50 batang), harga bisa lebih murah. dan untuk Ukuran 150cm ke atas grosir minimal 15 batang. dan harganya bisa di nego kak';

let context = {}; // Untuk menyimpan konteks chat per nomor

// Handle QR Code generation
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
    console.log('✅ Silakan scan QR code di atas untuk menghubungkan WhatsApp Web');
});

client.on('ready', () => {
    console.log('🤖 Bot siap melayani!');
});

client.on('message', async msg => {
    const message = msg.body.toLowerCase();
    const number = msg.from;
    let reply = '';
    const jenisList = Object.keys(bibitData);
    const ukuranList = ['45', '60', '80', '100', '150', '200'];

    const cariJenis = jenisList.find(j => message.includes(j));
    const cariUkuran = ukuranList.find(u => message.includes(u));
    const mintaJenis = /(jenis|apa saja|macam|tipe|varietas).*(bibit|alpukat)|(bibit|alpukat).*(jenis|apa saja|macam|tipe|varietas)/i.test(message);
    const mintaUkuran = /ukuran|ukrn/.test(message);
    const mintaHarga = /harga|berapa|hrg|brp|daftar harga|list harga/i.test(message);
    const mintaSemuaHarga = /semua harganya|harganya semua|list harganya|list harga|daftar harga|daftar harganya|dftr hrgnya|dftar hrganya|daftar hrgnya|berapaan harganya|berapa harga bibit alpukatnya|brp hrg bbt alpkatnya|brapa hrga bibit alpukatnya|bibitnya harganya berapa|hrgnya brp/i.test(message); // Kondisi baru

    
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    async function sendWithDelay(msg, replyText, delayMs = 1000) {
        await delay(delayMs);
        await msg.reply(replyText);
    }
    
    // [1] Jika minta daftar SEMUA HARGA
    if (mintaSemuaHarga) {
        let daftarHarga = "📊 *DAFTAR HARGA BIBIT ALPUKAT* 📊\n\n";
        
        for (const [jenis, ukuranData] of Object.entries(bibitData)) {
            daftarHarga += `*${jenis.toUpperCase()}*:\n`;
            
            for (const [ukuran, harga] of Object.entries(ukuranData)) {
                daftarHarga += `- ${ukuran}cm: Rp${harga.toLocaleString()}\n`;
            }
            
            daftarHarga += "\n";
        }
        
        reply = daftarHarga + catatan;
    }
    // Kasus: Tanya jenis apa saja
    else if (mintaJenis && !cariJenis) {
        reply = `siap Berikut jenis bibit alpukat yang tersedia:\n- ${jenisList.join('\n- ')}`;
    }
   
    // Kasus: Tanya ukuran dari jenis tertentu
    else if (mintaUkuran && cariJenis && !cariUkuran) {
        reply = `Ukuran bibit alpukat *${cariJenis.toUpperCase()}* yang tersedia:\n- ${Object.keys(bibitData[cariJenis]).join(' cm\n- ')} cm`;
    }
    // Kasus: Tanya harga jenis + ukuran
    else if (mintaHarga && cariJenis && cariUkuran) {
        const harga = bibitData[cariJenis]?.[cariUkuran];
        if (harga) {
            reply = `Harga bibit *${cariJenis.toUpperCase()}* ukuran *${cariUkuran}cm* adalah Rp${harga.toLocaleString()}.${catatan}`;
        } else {
            reply = `Maaf, data untuk ukuran itu tidak tersedia.\nUkuran tersedia untuk *${cariJenis.toUpperCase()}*: ${Object.keys(bibitData[cariJenis]).join(', ')} cm`;
        }
    }
    // Kasus: Tanya harga jenis tapi tanpa ukuran
    else if (mintaHarga && cariJenis && !cariUkuran) {
    const ukuranTersedia = Object.keys(bibitData[cariJenis]);
    reply = `Baiki ini list ukuran dan harga bibit *${cariJenis.toUpperCase()}*:\n`;
    ukuranTersedia.forEach(ukuran => {
        const harga = bibitData[cariJenis][ukuran];
        reply += `- ${ukuran}cm: Rp${harga.toLocaleString()}\n`;
    });
    reply += catatan;
   }

    // Kasus: Tanya apakah ada jenis tertentu
    else if (/ada|punya/.test(message) && cariJenis && !cariUkuran && !mintaHarga) {
        context[number] = cariJenis;
        reply = `Ada kak, mau ukuran berapa?\nkami memiliki ukuran paling kecil 45cm dan yang paling tinggi ukuran 200cm `;
    }

    else if (context[number] && mintaHarga && !cariUkuran) {
        const cariJenis = context[number];
        if (bibitData[cariJenis]) {
            const ukuranTersedia = Object.keys(bibitData[cariJenis]);
            reply = `Baik! ini list ukuran dan harga bibit *${cariJenis.toUpperCase()}*:\n`;
            ukuranTersedia.forEach(ukuran => {
                const harga = bibitData[cariJenis][ukuran];
                reply += `- ${ukuran}cm: Rp${harga.toLocaleString()}\n`;
            });
            reply += catatan;
        } else {
            reply = `Maaf, belum ada data harga untuk jenis ${cariJenis.toUpperCase()}`;
        }
    }
    
    // Kasus: Lanjutan setelah tanya "ada miki" lalu tanya ukuran/harga
    else if (context[number] && (cariUkuran || mintaHarga)) {
        const jenisSebelumnya = context[number];
        if (cariUkuran && mintaHarga && bibitData[jenisSebelumnya]?.[cariUkuran]) {
            const harga = bibitData[jenisSebelumnya][cariUkuran];
            reply = `Harga bibit *${jenisSebelumnya.toUpperCase()}* ukuran *${cariUkuran}cm* adalah Rp${harga.toLocaleString()}.${catatan}`;
            delete context[number];
        } else {
            reply = `Ukuran tersedia untuk *${jenisSebelumnya.toUpperCase()}*: ${Object.keys(bibitData[jenisSebelumnya]).join(', ')} cm`;
        }
    }

 
      
    else if (/trimakasih|terimakasih|thanks/i.test(message)) {
        delete context[number];
        reply = `Sama-sama kak! 😊\nJika butuh info lagi, tinggal tanya ya!`;
    }
    
    // Jika tidak mengandung kata kunci yang relevan, jangan balas
    else if (!mintaJenis && !mintaUkuran && !mintaHarga && !mintaSemuaHarga && !cariJenis && !cariUkuran && !context[number]) {
    return; // abaikan pesan
   }

   if (reply && reply.trim() !== '') {
    if (reply) await sendWithDelay(msg, reply);
}


    

    
});

// Inisialisasi client
client.initialize();