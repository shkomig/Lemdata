# Contributing to Lemdata

תודה על העניין שלך לתרום לפרויקט Lemdata! 🎉

## 🤝 איך לתרום

### דיווח על בעיות (Issues)

אם מצאת בעיה או יש לך רעיון לשיפור:

1. בדוק אם כבר קיימת issue דומה
2. פתח issue חדשה עם:
   - תיאור ברור של הבעיה/הצעה
   - צעדים לשחזור (אם רלוונטי)
   - סביבת העבודה שלך
   - צילומי מסך (אם רלוונטי)

### תרומת קוד

1. **Fork את הפרויקט**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Lemdata.git
   ```

2. **צור branch חדש**
   ```bash
   git checkout -b feature/amazing-feature
   # או
   git checkout -b bugfix/fix-something
   ```

3. **בצע את השינויים**
   - עקוב אחר הוראות הקודינג
   - הוסף בדיקות במידת הצורך
   - עדכן תיעוד

4. **Commit השינויים**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

5. **Push ל-GitHub**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **פתח Pull Request**

## 📝 כללי קודינג

### Backend (TypeScript/Fastify)
- השתמש ב-TypeScript עם types מלאים
- עקוב אחר ESLint rules
- הוסף JSDoc לפונקציות חשובות
- טפל בשגיאות באופן מקיף

### Frontend (Next.js/React)
- השתמש ב-functional components עם hooks
- עקוב אחר React best practices
- השתמש ב-TailwindCSS לעיצוב
- הוסף accessibility attributes

### הוראות Git Commit

השתמש בפורמט הבא:
```
type(scope): description

body (optional)

footer (optional)
```

**Types:**
- `feat`: תכונה חדשה
- `fix`: תיקון באג
- `docs`: עדכון תיעוד
- `style`: שינויים בעיצוב קוד
- `refactor`: שינוי קוד ללא תיקון באג או תכונה חדשה
- `test`: הוספת בדיקות
- `chore`: משימות maintenance

**דוגמאות:**
```
feat(ai): add document analysis endpoint
fix(auth): resolve token validation issue
docs: update installation instructions
```

## 🧪 הרצת בדיקות

```bash
# Backend tests
cd lemdata-app/backend
npm test

# Frontend tests
cd lemdata-app/frontend
npm test
```

## 🚀 סביבת פיתוח

1. **דרישות:**
   - Node.js 18+
   - Docker & Docker Compose
   - Git

2. **הגדרה:**
   ```bash
   # Clone הפרויקט
   git clone https://github.com/shkomig/Lemdata.git
   cd Lemdata
   
   # הפעל Docker services
   docker-compose up -d
   
   # התקן dependencies
   cd lemdata-app/backend && npm install
   cd ../frontend && npm install
   ```

3. **הרצה:**
   ```bash
   # Terminal 1: Backend
   cd lemdata-app/backend
   npm run dev
   
   # Terminal 2: Frontend
   cd lemdata-app/frontend
   npx next dev -p 3003
   ```

## 📚 משאבים

- [Next.js Documentation](https://nextjs.org/docs)
- [Fastify Documentation](https://www.fastify.io/docs/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## ❓ שאלות

יש לך שאלות? פתח issue או צור קשר דרך:
- GitHub Issues
- Discussions בפרויקט

## 🙏 קוד התנהגות

אנחנו מחויבים ליצור סביבה פתוחה ומזמינה לכולם. אנא התנהג בכבוד ובהבנה.

תודה על התרומה שלך! 🚀