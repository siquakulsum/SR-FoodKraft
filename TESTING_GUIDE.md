# Testing the Unified Login System

## ✅ **How to Test**

### **1. Test Admin Login**

#### Steps:
1. Open browser to `http://localhost:5173/login`
2. Enter credentials:
   - **Email**: `admin@srfoodkraft.com`
   - **Password**: `admin123`
3. Click "Sign In"

#### Expected Result:
- ✅ Login successful
- ✅ Redirected to `/admin/dashboard`
- ✅ Admin dashboard loads with admin interface
- ✅ No console errors
- ✅ User can access all admin features

---

### **2. Test Customer Login**

#### Steps:
1. **Logout** if currently logged in as admin
2. Go to `http://localhost:5173/login`
3. Enter credentials:
   - **Email**: `customer@test.com`
   - **Password**: `customer123`
4. Click "Sign In"

#### Expected Result:
- ✅ Login successful
- ✅ Redirected to `/` (customer homepage)
- ✅ Customer interface loads
- ✅ No console errors
- ✅ User can browse menu, add to cart, etc.

---

### **3. Test Customer Registration**

#### Steps:
1. Go to `http://localhost:5173/login`
2. Click "Sign Up" tab
3. Fill in the form:
   - **Name**: `Test User`
   - **Email**: `testuser@example.com`
   - **Password**: `test123`
   - **Phone**: `1234567890` (optional)
4. Click "Sign Up"

#### Expected Result:
- ✅ Registration successful
- ✅ Automatically logged in
- ✅ Redirected to customer homepage
- ✅ New account created with `role: 'customer'`
- ✅ Can immediately use the application

---

### **4. Test Protected Routes**

#### Test Admin Protection:
1. **Without logging in**, try to access: `http://localhost:5173/admin/dashboard`
2. **Expected**: Redirected to `/login`

#### Test Customer Access to Admin:
1. Login as customer
2. Try to access: `http://localhost:5173/admin/dashboard`
3. **Expected**: Redirected to `/login` (customers can't access admin)

---

### **5. Test Session Persistence**

#### Steps:
1. Login as admin
2. Refresh the page (`F5` or `Ctrl+R`)
3. **Expected**: Still logged in, admin dashboard loads

#### Steps:
1. Login as customer
2. Refresh the page
3. **Expected**: Still logged in, customer homepage loads

---

### **6. Test Logout**

#### Admin Logout:
1. Login as admin
2. Click profile icon → Logout
3. **Expected**: Redirected to `/login`, token cleared

#### Customer Logout:
1. Login as customer
2. Click user menu → Logout
3. **Expected**: Redirected to `/login`, token cleared

---

## 🐛 **Common Issues & Solutions**

### Issue: "Cannot read properties of undefined (reading 'role')"
**Solution**: 
- This has been fixed in the latest code
- Make sure you've refreshed the browser
- Clear localStorage if needed: `localStorage.clear()`

### Issue: Admin login redirects to customer page
**Solution**:
- Check that the user has `role: 'admin'` in database
- Run: `node Server/scripts/createTestUsers.js` to ensure test users exist
- Check browser console for any errors

### Issue: Stuck on loading screen
**Solution**:
- Check that backend server is running on port 5000
- Check browser console for API errors
- Verify database connection

### Issue: Token persists but user not logged in
**Solution**:
- Clear localStorage: `localStorage.clear()`
- Hard refresh: `Ctrl + Shift + R`
- Login again

---

## 📊 **What to Check in Console**

### Successful Admin Login:
```
Admin session restored successfully
```

### Successful Customer Login:
```
User is not admin, redirecting...
(This is normal when accessing /admin as customer)
```

### No Errors:
- ✅ No red errors in console
- ✅ No 401/403 errors
- ✅ No "undefined" errors

---

## 🔍 **Debugging Tips**

### Check Token:
```javascript
// In browser console
localStorage.getItem('token')
```

### Check User Data:
```javascript
// After login, check what's stored
// For Customer app:
// Check React DevTools → AppContext

// For Admin app:
// Check React DevTools → Zustand store
```

### Clear Everything and Start Fresh:
```javascript
// In browser console
localStorage.clear();
location.reload();
```

---

## ✅ **Success Checklist**

- [ ] Admin can login with admin credentials
- [ ] Admin is redirected to `/admin/dashboard`
- [ ] Customer can login with customer credentials
- [ ] Customer is redirected to `/` (homepage)
- [ ] New customers can register
- [ ] Protected routes block unauthorized access
- [ ] Session persists after page refresh
- [ ] Logout works correctly
- [ ] No console errors
- [ ] Role-based redirection works

---

## 📝 **Test Credentials Summary**

| Role | Email | Password | Redirect |
|------|-------|----------|----------|
| Admin | admin@srfoodkraft.com | admin123 | /admin/dashboard |
| Customer | customer@test.com | customer123 | / (homepage) |

---

**Last Updated**: January 28, 2026, 3:05 PM IST
