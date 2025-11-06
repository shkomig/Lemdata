# סטטוס מערכת Lemdata

## ✅ מה עובד

1. **Docker Services**:
   - ✅ MinIO - פועל על פורטים 9010-9011
   - ✅ pgAdmin - פועל על פורט 8080
   - ✅ PostgreSQL - משתמש במסד נתונים קיים (postgres-db)
   - ✅ Redis - משתמש ב-redis-cache הקיים

2. **Database**:
   - ✅ משתמש `lemdata` נוצר
   - ✅ מסד נתונים `lemdata` נוצר
   - ⚠️ צריך להריץ `npm run db:push` ו-`npm run db:seed` מהתיקייה backend

3. **Backend & Frontend**:
   - ✅ רצים ברקע
   - Backend: http://localhost:3001
   - Frontend: http://localhost:3000

## 🔧 מה צריך לעשות

### 1. הכנת מסד נתונים

```bash
cd backend
npm run db:push
npm run db:seed
```

### 2. הוסף Gemini API Key (מומלץ)

ערוך `backend/.env` והוסף:
```
GEMINI_API_KEY=your-api-key-here
```

### 3. בדוק שהכל עובד

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Docs: http://localhost:3001/docs
- Health Check: http://localhost:3001/health

## 📝 משתמשי דוגמה

לאחר הרצת `db:seed`:
- **מנהל**: admin@lemdata.com / admin123
- **מורה**: teacher@lemdata.com / teacher123
- **תלמיד**: student@lemdata.com / student123

## 🔗 גישות

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **API Docs**: http://localhost:3001/docs
- **pgAdmin**: http://localhost:8080 (admin@lemdata.com / admin123)
- **MinIO Console**: http://localhost:9011 (lemdata / lemdata123456)

---

**המערכת מוכנה! רק צריך להריץ db:push ו-db:seed** 🚀

