# 🚀 התחלה מהירה - Lemdata Quick Start

## ✅ מצב מערכת נוכחי / Current System Status

### מה עובד עכשיו / What's Working Now
- ✅ **Frontend רץ / Frontend Running** - http://localhost:3000
- ✅ **Backend מוגדר לפורט 3001 / Backend configured for port 3001**
- ⏸️ **Docker Services - צריכים הפעלה / Need to start**

### שינוי פורט בוצע בהצלחה / Port Change Completed ✓
- פורט Backend שונה מ-3000 ל-**3001** 
- Frontend נשאר על **3000**
- אין יותר קונפליקטים! / No more conflicts!

---

## 🎯 התחלה מהירה / Quick Start (3 שלבים / 3 Steps)

### שלב 1: הפעל Docker Desktop / Step 1: Start Docker Desktop
פתח את Docker Desktop במחשב Windows ו וחכה שיעלה.

Open Docker Desktop on Windows and wait for it to start.

### שלב 2: הפעל שירותי מסד נתונים / Step 2: Start Database Services
```bash
cd /mnt/c/Vs-Pro/Lemdata
docker-compose up -d
```

חכה ~30 שניות לאתחול השירותים.
Wait ~30 seconds for services to initialize.

### שלב 3: הפעל את האפליקציה / Step 3: Start the Application
```bash
npm run dev
```

**זהו!** האפליקציה שלך תרוץ ב:
**That's it!** Your app will run at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

---

## 🌐 גישה לאפליקציה / Access the Application

פתח דפדפן וגש ל / Open browser and go to:
```
http://localhost:3000
```

### ממשקים נוספים / Additional Interfaces
- **תיעוד API / API Documentation:** http://localhost:3001/docs
- **ניהול מסד נתונים / Database Admin (pgAdmin):** http://localhost:8080
  - Email: `admin@lemdata.com`
  - Password: `admin123`
- **אחסון קבצים / File Storage (MinIO):** http://localhost:9011
  - Username: `lemdata`
  - Password: `4rysgEhmyHOAXbCux8brvRiwibWCIH+3CPmT5KF22QA=`

### משתמשי מערכת / System Users
- **Admin**: admin@lemdata.com / admin123
- **Teacher**: teacher@lemdata.com / teacher123
- **Student**: student@lemdata.com / student123

---

## 🛑 עצירת המערכת / Stop Everything

לחץ `Ctrl+C` בטרמינל שבו רץ האפליקציה, ואז:
Press `Ctrl+C` in the terminal running the app, then:
```bash
docker-compose down
```

---

## 🔧 פתרון בעיות / Troubleshooting

### Backend לא מתחיל / Backend Won't Start
```bash
# וודא ש-Docker רץ / Ensure Docker is running
docker ps

# התחל מחדש את השירותים / Restart services
cd /mnt/c/Vs-Pro/Lemdata
docker-compose restart
```

### Frontend לא נטען / Frontend Won't Load
Frontend כבר רץ עכשיו! / Frontend is already running now!
פתח: http://localhost:3000 / Open: http://localhost:3000

---

## 📚 צריך עזרה נוספת? / Need More Help?

ראה את המדריך המפורט / See comprehensive guide: `RUNNING_GUIDE.md`

---

## ✨ מה עובד עכשיו / What's Working Now

**Frontend כבר רץ!** תוכל לגשת אליו ב-http://localhost:3000 עכשיו.

**Frontend is already running!** You can access it at http://localhost:3000 right now.

להשלמת ההתקנה המלאה, פשוט הפעל את Docker Desktop והרץ את הפקודות למעלה.

To complete the full setup, just start Docker Desktop and run the commands above.

---

**עדכון אחרון / Last Updated:** 12 נובמבר 2025 / November 12, 2025  
**גרסה / Version:** 1.0.0


