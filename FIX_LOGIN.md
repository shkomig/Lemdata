# פתרון בעיות התחברות

## הבעיות שזוהו ותוקנו

1. ✅ **Docker פועל** - PostgreSQL ו-Redis רצים
2. ✅ **Frontend רץ** - על פורט 3000
3. ✅ **שגיאות TypeScript תוקנו**
4. ⚠️ **Backend צריך להיפעל ידנית**

## הפעלת המערכת

### שלב 1: הפעל Backend

פתח **Terminal חדש** והרץ:

```bash
cd backend
npm run dev
```

אמור לראות:
```
✅ Database connected successfully
✅ Redis cache connected successfully
✅ Plugins loaded successfully
✅ Routes loaded successfully
🚀 Lemdata Backend Server running at http://0.0.0.0:3001
```

### שלב 2: בדוק משתמשים במסד נתונים

```bash
docker exec postgres-db psql -U admin -d lemdata -c "SELECT email, name, role FROM \"User\";"
```

אמור לראות 3 משתמשים:
- admin@lemdata.com
- teacher@lemdata.com
- student@lemdata.com

### שלב 3: התחבר

פתח דפדפן: **http://localhost:3000**

התחבר עם:
- **Email**: `admin@lemdata.com`
- **Password**: `admin123`

## אם עדיין לא עובד

### בדוק שהפורטים זמינים

```bash
netstat -ano | findstr ":3001"
netstat -ano | findstr ":3000"
```

### בדוק את הלוגים

אם Backend לא מתחיל, בדוק את הלוגים - יכול להיות:
- שגיאת חיבור למסד נתונים
- שגיאת Redis (לא קריטי)
- שגיאת קומפילציה

### פתרון מהיר - הפעל הכל ביחד

פתח **2 Terminals**:

**Terminal 1:**
```bash
cd backend
npm run dev
```

**Terminal 2:**
```bash
cd frontend  
npm run dev
```

ואז פתח: http://localhost:3000

---

**טיפ**: אם אתה רואה שגיאת 404 או CORS, זה אומר ש-Frontend לא מצליח להתחבר ל-Backend. ודא ש-Backend רץ על פורט 3001.




