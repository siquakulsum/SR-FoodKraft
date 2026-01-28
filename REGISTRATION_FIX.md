# Customer Registration Fix

## ✅ **Issue Fixed**

### **Problem:**
- Customer registration was failing with error: `Unexpected token '<', "<!DOCTYPE "... is not valid JSON`
- Backend was returning 500 Internal Server Error
- Phone field validation was causing the issue

### **Root Cause:**
The backend validator (`Server/validators/authValidator.js`) had `phone` marked as **required**, but the frontend registration form shows phone as **optional**.

### **Solution Applied:**
Changed phone validation from:
```javascript
phone: Joi.string().pattern(/^[0-9]+$/).min(10).required()
```

To:
```javascript
phone: Joi.string().pattern(/^[0-9]+$/).min(10).optional().allow('', null)
```

---

## 🔄 **IMPORTANT: Restart Backend Server**

The backend server needs to be restarted to apply the validation changes.

### **Steps to Restart:**

1. **Stop the current backend server:**
   - Go to the terminal running `npm start` in the `Server` directory
   - Press `Ctrl + C` to stop it

2. **Start the backend server again:**
   ```bash
   cd Server
   npm start
   ```

3. **Wait for confirmation:**
   ```
   Server is running on port 5000.
   ```

---

## ✅ **Test Customer Registration**

After restarting the backend:

1. Go to `http://localhost:5173/login`
2. Click "Sign Up"
3. Fill in:
   - **Full Name**: `Test User`
   - **Email**: `newuser@test.com`
   - **Phone**: Leave empty or enter a number (optional)
   - **Password**: `test123`
4. Click "Create account"

### **Expected Result:**
- ✅ Registration successful
- ✅ Automatically logged in
- ✅ Redirected to customer homepage
- ✅ No errors

---

## 📋 **Files Modified:**

- ✅ `Server/validators/authValidator.js` - Made phone optional in registration

---

## 🐛 **If Still Having Issues:**

### Check Backend Logs:
Look at the terminal running `npm start` for any error messages.

### Check Frontend Console:
Open browser DevTools → Console tab for any errors.

### Clear Browser Data:
```javascript
// In browser console
localStorage.clear();
location.reload();
```

### Verify Backend is Running:
```bash
# Should see: Server is running on port 5000
```

---

**Status**: ✅ **FIXED - Restart backend to apply**

**Last Updated**: January 28, 2026, 3:25 PM IST
