# הוראות הפעלת מערכת Lemdata

## דרישות מקדימות

1. **Node.js 18+** - מותקן ✅
2. **Docker Desktop** - **צריך להפעיל!**
3. **Google Gemini API Key** (אופציונלי אבל מומלץ)

## שלבי הפעלה

### 1. הפעל Docker Desktop

**חשוב!** Docker Desktop חייב להיות פועל לפני המשך.

פתח את Docker Desktop ובדוק שהוא רץ (אייקון ירוק בתחתית המסך).

### 2. הפעל שירותי Docker

```bash
docker-compose up -d
```

זה יפעיל:
- PostgreSQL על פורט 5432
- Redis על פורט 6379
- MinIO על פורטים 9000-9001
- pgAdmin על פורט 8080

### 3. הכנת מסד נתונים

```bash
cd backend
npm run db:push
npm run db:seed
```

זה יצור את הטבלאות ויוסיף משתמשי דוגמה:
- admin@lemdata.com / admin123
- teacher@lemdata.com / teacher123
- student@lemdata.com / student123

### 4. הגדרת API Key (מומלץ)

ערוך את `backend/.env` והוסף:

```
GEMINI_API_KEY=your-api-key-here
```

קבל מפתח מ: https://ai.google.dev/

**ללא מפתח Gemini, המערכת תעבוד אבל עם פונקציונליות מוגבלת.**

### 5. הפעלת המערכת

```bash
# מהתיקייה הראשית
npm run dev
```

או בנפרד:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 6. גישה למערכת

לאחר ההפעלה:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/docs
- **Health Check**: http://localhost:3001/health

## פתרון בעיות

### Docker לא עובד

1. בדוק ש-Docker Desktop פועל
2. נסה להפעיל מחדש: `docker-compose down && docker-compose up -d`
3. בדוק שהפורטים 5432, 6379 לא תפוסים

### שגיאת חיבור למסד נתונים

- ודא ש-Docker Desktop פועל
- בדוק ש-PostgreSQL רץ: `docker ps`
- נסה להפעיל מחדש: `docker-compose restart postgres`

### שגיאת API

- ודא שיש `GEMINI_API_KEY` ב-`backend/.env`
- בדוק שהפורט 3001 לא תפוס
- בדוק את הלוגים ב-console

## משתמשי דוגמה

לאחר הרצת `db:seed`, תוכל להתחבר עם:

- **מנהל**: admin@lemdata.com / admin123
- **מורה**: teacher@lemdata.com / teacher123
- **תלמיד**: student@lemdata.com / student123

---

**בהצלחה! 🚀**

