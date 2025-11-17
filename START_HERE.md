# 🚀 הפעלת מערכת Lemdata - מדריך מהיר

## ✅ מה כבר מוכן

1. ✅ **Docker Services פועלים** - PostgreSQL, Redis, MinIO, pgAdmin
2. ✅ **מסד נתונים מוכן** - טבלאות נוצרו, משתמשים נוצרו
3. ✅ **Frontend רץ** - על http://localhost:3000
4. ⚠️ **Backend צריך להפעיל ידנית**

## 🔧 הפעלת המערכת

### שלב 1: הפעל Backend (חשוב!)

פתח **Terminal חדש** או **PowerShell** והרץ:

```powershell
cd c:\Vs-Pro\Lemdata\backend
npm run dev
```

**אמור לראות:**
```
✅ Database connected successfully
✅ Redis cache connected successfully  
✅ Plugins loaded successfully
✅ Routes loaded successfully
🚀 Lemdata Backend Server running at http://0.0.0.0:3001
📖 API Documentation: http://localhost:3001/docs
🔍 Health Check: http://localhost:3001/health
```

### שלב 2: בדוק שהמשתמשים קיימים

```powershell
docker exec postgres-db psql -U admin -d lemdata -c "SELECT email, name, role FROM \"User\";"
```

**אמור לראות 3 משתמשים:**
- admin@lemdata.com - מנהל מערכת
- teacher@lemdata.com - מורה דוגמה  
- student@lemdata.com - תלמיד דוגמה

### שלב 3: התחבר למערכת

1. פתח דפדפן: **http://localhost:3000**
2. התחבר עם:
   - **Email**: `admin@lemdata.com`
   - **Password**: `admin123`

## 🔍 בדיקות מהירות

### בדוק ש-Backend רץ

פתח דפדפן: http://localhost:3001/health

**אמור לראות:**
```json
{
  "status": "ok",
  "timestamp": "...",
  "uptime": ...
}
```

### בדוק API Documentation

פתח: http://localhost:3001/docs

אמור לראות Swagger UI עם כל ה-endpoints.

## 🐛 פתרון בעיות

### Backend לא מתחיל

1. **בדוק שגיאות בקונסול** - יכול להיות חיבור למסד נתונים
2. **בדוק שהפורט 3001 לא תפוס:**
   ```powershell
   netstat -ano | findstr ":3001"
   ```
3. **נסה להריץ build לפני:**
   ```powershell
   cd backend
   npm run build
   npm run dev
   ```

### לא מצליח להתחבר

1. **ודא ש-Backend רץ** - בדוק http://localhost:3001/health
2. **בדוק Console בדפדפן** (F12) - יכול להיות CORS או שגיאת API
3. **נסה לבדוק ב-Postman/curl:**
   ```powershell
   curl http://localhost:3001/api/auth/login -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"admin@lemdata.com","password":"admin123"}'
   ```

### Docker לא רץ

אם Docker לא רץ:
1. פתח Docker Desktop
2. המתן עד שיהיה ירוק
3. הרץ: `docker-compose up -d`

## 📝 משתמשי דוגמה

לאחר הרצת `db:seed` (כבר בוצע):

| תפקיד | Email | Password |
|-------|-------|----------|
| מנהל | admin@lemdata.com | admin123 |
| מורה | teacher@lemdata.com | teacher123 |
| תלמיד | student@lemdata.com | student123 |

## 🎯 מה הלאה?

לאחר התחברות מוצלחת:
1. נסה את הצ'אט - שאל שאלות
2. העלה תמונות - בדוק OCR
3. צפה באנליטיקה - בדוק התקדמות

**הצלחה! 🚀**




