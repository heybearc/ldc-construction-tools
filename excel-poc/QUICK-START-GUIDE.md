# LDC Tools Excel POC - Quick Start Guide

**5-Minute Setup** | **Construction Group 0205**

---

## 🚀 Step-by-Step Setup

### **Step 1: Open Excel** (30 seconds)
1. Open Microsoft Excel
2. Create new blank workbook
3. Save as: `LDC-Tools-CG0205.xlsx`

---

### **Step 2: Import Data** (2 minutes)

**For each CSV file, do this:**

1. **Create new sheet**
   - Click `+` at bottom to add sheet
   - Name it (Volunteers, TradeTeams, Projects, Assignments, CrewRequests)

2. **Import CSV**
   - Go to: Data → Get Data → From File → From Text/CSV
   - Select the CSV file
   - Click "Load"

**Import these 5 files:**
- ✅ `volunteers.csv` → Sheet: "Volunteers"
- ✅ `trade-teams.csv` → Sheet: "TradeTeams"
- ✅ `projects.csv` → Sheet: "Projects"
- ✅ `assignments.csv` → Sheet: "Assignments"
- ✅ `crew-requests.csv` → Sheet: "CrewRequests"

---

### **Step 3: Convert to Tables** (1 minute)

**For each sheet:**
1. Click anywhere in the data
2. Press `Ctrl+T` (Windows) or `Cmd+T` (Mac)
3. Check "My table has headers"
4. Click OK
5. Name the table (right-click table → Table → Table Name)
   - Volunteers → `Volunteers`
   - TradeTeams → `TradeTeams`
   - Projects → `Projects`
   - Assignments → `Assignments`
   - CrewRequests → `CrewRequests`

---

### **Step 4: Create Dashboard** (1.5 minutes)

1. **Create new sheet** named "Dashboard"

2. **Copy these formulas:**

**Cell A1:**
```
CONSTRUCTION GROUP 0205 - VOLUNTEER DASHBOARD
```
(Make it bold, 18pt)

**Cell A3:** `Total Volunteers:`  
**Cell B3:** `=COUNTA(Volunteers[FirstName])`

**Cell A4:** `Active Projects:`  
**Cell B4:** `=COUNTIF(Projects[Status],"Active")`

**Cell A5:** `Pending Crew Requests:`  
**Cell B5:** `=COUNTIF(CrewRequests[Status],"Pending")`

3. **Create a simple chart:**
   - Select cells A13:B20 (after adding trade team data)
   - Insert → Bar Chart
   - Title: "Volunteers by Trade Team"

---

## ✅ You're Done!

**What you have now:**
- ✅ 50 sample volunteers
- ✅ 8 trade teams
- ✅ 5 active projects
- ✅ 20 assignments
- ✅ 10 crew requests
- ✅ Working dashboard

---

## 📊 How to Use

### **Add a New Volunteer**
1. Go to "Volunteers" sheet
2. Click in last row
3. Fill in: Name, Email, Phone, Congregation, Trade Team
4. Dashboard updates automatically!

### **Create an Assignment**
1. Go to "Assignments" sheet
2. Add new row
3. Select Volunteer (type name)
4. Select Project (type name)
5. Set dates and role

### **Request a Crew**
1. Go to "CrewRequests" sheet
2. Add new row
3. Select Project and Trade Team
4. Enter number of workers needed
5. Set status to "Pending"

### **View Reports**
1. Go to "Dashboard" sheet
2. See summary statistics
3. View charts
4. Filter data in any sheet

---

## 🎯 Next Steps

### **Customize for Your CG:**
1. Replace sample volunteers with real data
2. Update projects with actual projects
3. Add your congregations
4. Adjust trade teams if needed

### **Share with Team:**
1. Save to OneDrive
2. Share link with team
3. Set permissions (view or edit)
4. Collaborate!

### **Advanced Features:**
- Add data validation (dropdowns)
- Create more charts
- Add conditional formatting
- Build custom reports

---

## 💡 Pro Tips

**Keyboard Shortcuts:**
- `Ctrl+T` - Create table
- `Ctrl+F` - Find/search
- `Alt+A+T` - Filter
- `F2` - Edit cell

**Best Practices:**
- Always use tables (not ranges)
- Use dropdowns for consistency
- Save often
- Back up to OneDrive
- Don't delete column headers

**Common Issues:**
- Formula errors? Check table names
- Can't find data? Use Ctrl+F
- Chart not updating? Right-click → Refresh
- Lost changes? Check OneDrive version history

---

## 📞 Need Help?

**Common Questions:**

**Q: How do I add more volunteers?**  
A: Just add rows to the Volunteers table. It auto-expands!

**Q: Can multiple people edit at once?**  
A: Save to OneDrive and share. Excel Online supports co-authoring.

**Q: How do I print reports?**  
A: Select data → File → Print → Print Selection

**Q: Can I use this on my phone?**  
A: Yes! Use Excel mobile app (limited features)

**Q: What if I make a mistake?**  
A: Press Ctrl+Z to undo, or restore from OneDrive version history

---

## 🎉 Success!

You now have a working volunteer management system!

**What's working:**
- ✅ Track all volunteers
- ✅ Manage projects
- ✅ Assign workers
- ✅ Request crews
- ✅ View dashboard
- ✅ Generate reports

**Total setup time:** ~5 minutes  
**Cost:** $0 (uses Excel you already have)  
**Maintenance:** Minimal

---

**Created:** January 6, 2026  
**Version:** 1.0.0  
**For:** Construction Group 0205  
**Status:** Ready to Use! 🚀
