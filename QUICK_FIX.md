# פתרון מהיר - בעיות התחברות

## הבעיות שנמצאו

1. ✅ Docker פועל - PostgreSQL ו-Redis רצים
2. ✅ Frontend רץ על פורט 3000
3. ❌ Backend לא רץ על פורט 3001

## פתרון

### שלב 1: הפעל Backend ידנית

פתח Terminal חדש והרץ:

```bash
cd backend
npm run dev
```

השרת צריך להתחיל ולהציג:
```
🚀 Lemdata Backend Server running at http://0.0.0.0:3001
```

### שלב 2: בדוק שהמשתמשים קיימים

```bash
docker exec postgres-db psql -U admin -d lemdata -c 'SELECT email, name, role FROM "User";'
```

### שלב 3: נסה להתחבר

פתח דפדפן: http://localhost:3000

התחבר עם:
- **Email**: admin@lemdata.com
- **Password**: admin123

## אם עדיין לא עובד

### בדוק את הלוגים של Backend

אם יש שגיאות בלוגים, זה יכול להיות:
1. חיבור למסד נתונים - בדוק `DATABASE_URL` ב-`backend/.env`
2. Redis לא מחובר - זה לא קריטי, המערכת תעבוד גם בלי
3. שגיאת קומפילציה - בדוק שה-TypeScript מתוקמפל

### בדוק את ה-Console של הדפדפן

פתח Developer Tools (F12) ובדוק אם יש שגיאות:
- שגיאות CORS
- שגיאות חיבור ל-API
- שגיאות 404/500

### פתרון חלופי - הפעל הכל ביחד

```bash
# Terminal 1
cd backend
npm run dev

# Terminal 2  
cd frontend
npm run dev
```

ואז פתח: http://localhost:3000

---

**טיפ**: בדוק שהפורט 3001 לא תפוס על ידי משהו אחר:
```bash
netstat -ano | findstr ":3001"
```

אם יש משהו, הרג אותו או שנה את ה-PORT ב-`backend/.env`.




