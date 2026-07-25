# Rongyok Video Player 🎬

เครื่องเล่นวิดีโอส่วนตัวสำหรับ rongyok.com ที่ออกแบบมาเพื่อความสะดวก ความเป็นส่วนตัว และการจดจำความคืบหน้า

---

## ✨ ฟีเจอร์หลัก

### 🎯 **เครื่องเล่น Fullscreen** 
- เปิดวิดีโอเต็มจอแบบสะอาด
- ไม่มีปุ่มและเมนูรบกวน
- แสดงเพียงชื่อตอน + ปุ่มควบคุม

### 💾 **Auto-Resume**
- จำตำแหน่งที่เล่นแล้ว
- กลับมาเล่นต่อจากจุดเดิม
- บันทึกสำหรับแต่ละตอน

### 🔄 **Auto-Save**
- บันทึกทุก 5 วินาที
- บันทึกโดยอัตโนมัติเมื่อหยุดเล่น
- เก็บในที่ฉันของเบราว์เซอร์

### 🎮 **ควบคุมมาตรฐาน**
- ปุ่ม Play/Pause
- ปุ่มเลื่อนเวลา
- ปุ่มควบคุมเสียง
- ปุ่มขยายเต็มจอ (⛶)

### 📱 **เข้ากันได้ทั่วไป**
- ทำงานบน Chrome, Firefox, Edge, Safari
- ใช้งานบนมือถือ
- ใช้งานบนเดสก์ท็อป

---

## 📦 ชุดความสามารถ

มี 2 วิธีใช้งาน:

### **1️⃣ Userscript (แนะนำ)** 
ใช้เมื่อเข้าเว็บ rongyok.com โดยตรง

- ✅ ทำงานเงียบๆ ข้างหลัง
- ✅ ไม่ต้องเปิด web app แยก
- ✅ Auto-extract MP4 จากเว็บ
- ✅ Auto-fullscreen เมื่อเล่น

### **2️⃣ Web App**
เปิด index.html ที่เครื่องของคุณ

- ✅ ดึงรายการวิดีโอจาก rongyok.com
- ✅ เลือกวิดีโอจากรายการ
- ✅ เล่นใน Fullscreen Player
- ✅ Auto-resume + Auto-save

---

## 🚀 วิธีติดตั้ง

### **ตัวเลือก A: ติดตั้ง Userscript**

#### ขั้นตอนที่ 1: ติดตั้ง Tampermonkey
- **Chrome/Edge/Brave**: [ดาวน์โหลด](https://chrome.google.com/webstore/detail/tampermonkey/)
- **Firefox**: [ดาวน์โหลด](https://addons.mozilla.org/firefox/addon/tampermonkey/)
- **Safari**: [ดาวน์โหลด](https://apps.apple.com/app/tampermonkey/id1482490089)

#### ขั้นตอนที่ 2: ติดตั้ง Script
คลิกลิงก์นี้:
```
https://raw.githubusercontent.com/Prasong1993/rongyok-video-player/main/rongyok-auto-fullscreen.user.js
```

Tampermonkey จะแสดง "Install" → คลิก ✅

#### ขั้นตอนที่ 3: ใช้งาน
1. เปิดวิดีโอใน rongyok.com
2. Script ทำงานอัตโนมัติ
3. เล่นวิดีโอเต็มจอ
4. Progress บันทึกอัตโนมัติ ✓

---

### **ตัวเลือก B: ใช้ Web App**

#### ขั้นตอนที่ 1: Clone/Download
```bash
git clone https://github.com/Prasong1993/rongyok-video-player.git
cd rongyok-player
```

#### ขั้นตอนที่ 2: เปิดเบราว์เซอร์
- เปิด `index.html` ในเบราว์เซอร์
- หรือใช้ Live Server ในเครื่อง

#### ขั้นตอนที่ 3: ใช้งาน
1. หน้าแรกจะโหลดรายการวิดีโอจาก rongyok.com
2. คลิกวิดีโอ → เปิด Fullscreen Player
3. Progress บันทึกอัตโนมัติ ✓

---

## 🎮 วิธีใช้งาน

### **Userscript**
```
เข้า rongyok.com → เลือกตอน → Fullscreen Player เปิดเอง ✓
```

### **Web App**
```
เปิด index.html → เลือกตอน → Fullscreen Player เปิด ✓
```

---

## 🎬 Fullscreen Player Controls

| ปุ่ม | การทำงาน |
|-----|---------|
| **Play/Pause** | คลิกวิดีโอ หรือ Spacebar |
| **Seek** | คลิกบนแถบความคืบหน้า |
| **Volume** | ใช้ scroll wheel หรือปุ่มควบคุม |
| **Fullscreen** | ปุ่ม ⛶ ขยายเต็มหน้าจออย่างแท้จริง |
| **Close** | ปุ่ม ✕ ปิดกลับเว็บ |

---

## 💾 การจัดเก็บข้อมูล

- **ที่เก็บ**: Local Storage (ที่ฉันของเบราว์เซอร์)
- **ข้อมูลที่บันทึก**: 
  - ตำแหน่งเล่น (วินาที)
  - ระยะเวลารวม
  - ชื่อตอน
  - วันเวลาบันทึก
- **ความปลอดภัย**: ไม่มีข้อมูลส่งออก ทั้งหมดเก็บที่เครื่องของคุณ

---

## 🔧 ตั้งค่า

### **Userscript**
เปิดไฟล์ `rongyok-auto-fullscreen.user.js` แล้วแก้บรรทัด ~20:

```javascript
const CONFIG = {
    STORAGE_KEY: 'rongyok_watch_history_v4',
    AUTO_SAVE_INTERVAL: 5000,      // ความถี่บันทึก (ms)
    DEBUG: true,                    // เปิด/ปิด debug log
    MIN_WATCH_TIME: 10              // เวลาต่ำสุด (วินาที)
};
```

### **Web App**
แก้ไฟล์ `rongyok-player/js/app.js` และ `player.js`

---

## 🐛 แก้ไขปัญหา

### **ปัญหา: Script ไม่ทำงาน**
1. ตรวจสอบ Tampermonkey เปิดอยู่
2. กด F5 รีเฟรชหน้า
3. ตรวจสอบ Console (F12)

### **ปัญหา: ไม่พบวิดีโอ**
1. รอ 2-3 วินาที ให้หน้าโหลด
2. ตรวจสอบ Internet Connection
3. ลองวิดีโอตัวอื่น

### **ปัญหา: Progress ไม่บันทึก**
1. ตรวจสอบ Local Storage ว่างพอ
2. ไม่ใช้โหมด Incognito
3. ตรวจสอบ Browser Privacy Settings

---

## 📁 โครงสร้างไฟล์

```
rongyok-video-player/
├── rongyok-auto-fullscreen.user.js    # Userscript หลัก ⭐
├── README.md                           # ไฟล์นี้
├── rongyok-player/                    # Web App
│   ├── index.html
│   ├── manifest.json
│   ├── sw.js
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── app.js
│       ├── player.js
│       ├── storage.js
│       └── proxy.js
└── rongyok-player-v2.user.js          # Script เก่า (backup)
```

---

## 🔐 ความเป็นส่วนตัวและความปลอดภัย

✅ **ไม่มีการติดตาม** - ข้อมูลเก็บในเครื่องของคุณ  
✅ **ไม่มีโฆษณา** - ดูวิดีโอสะอาดๆ  
✅ **โอเพนซอร์ส** - โค้ดเปิดให้ดู  
✅ **ไม่ต้องเข้าสู่ระบบ** - ทำงานออฟไลน์  
✅ **ไม่มีการเรียก API ภายนอก** (นอกจากดึงวิดีโอ)

---

## 📝 ใบอนุญาต

MIT License - ใช้ได้อย่างอิสระ!

---

## 🤝 ช่วยพัฒนา

มีเรื่องดีๆ อยากแนะนำ? 
1. เปิด Issue
2. ส่ง Pull Request
3. บอกผลการใช้งาน

---

## 📞 ติดต่อ

- GitHub: [Prasong1993](https://github.com/Prasong1993)
- Issues: [ที่นี่](https://github.com/Prasong1993/rongyok-video-player/issues)

---

**สร้างด้วย ❤️ เพื่อให้ดูวิดีโอสะดวก**

*อัปเดตล่าสุด: 2026*
