# LDC Tools Excel POC - Construction Group Volunteer Management

**Version:** 1.0.0  
**Date:** January 6, 2026  
**Purpose:** Proof of Concept for regional/CG volunteer tracking

---

## 📁 Files Included

1. **volunteers.csv** - Master volunteer list
2. **trade-teams.csv** - Trade team definitions
3. **projects.csv** - Active projects
4. **assignments.csv** - Volunteer assignments
5. **crew-requests.csv** - Crew request tracking
6. **dashboard-formulas.txt** - Excel formulas for dashboard

---

## 🚀 Quick Start

### Step 1: Create New Excel Workbook
1. Open Excel
2. Create new blank workbook
3. Save as: `LDC-Tools-CG0205.xlsx`

### Step 2: Import Data Sheets
For each CSV file:
1. Create new sheet (name it: Volunteers, TradeTeams, Projects, Assignments, CrewRequests)
2. Data → From Text/CSV
3. Select the CSV file
4. Import into sheet

### Step 3: Convert to Tables
For each sheet:
1. Select all data (Ctrl+A)
2. Insert → Table
3. Check "My table has headers"
4. Name the table (e.g., "VolunteersTable")

### Step 4: Create Dashboard Sheet
1. Create new sheet named "Dashboard"
2. Copy formulas from `dashboard-formulas.txt`
3. Create charts using the data

---

## 📊 Sheet Descriptions

### **Volunteers**
Master list of all volunteers with contact info, skills, and availability.

**Key Columns:**
- ID, Name, Email, Phone
- Congregation, Trade Team
- Skills, Availability, Status

### **TradeTeams**
8 standard trade teams with leadership.

**Teams:**
- Site Work, Structural, Roofing
- Electrical, Plumbing
- Drywall & Paint, Flooring & Tile
- Finish Carpentry

### **Projects**
Active construction projects.

**Key Columns:**
- Project ID, Name, Location
- Start/End Dates, Status
- Project Manager

### **Assignments**
Links volunteers to projects.

**Key Columns:**
- Volunteer, Project, Trade Team
- Start/End Dates, Role, Status

### **CrewRequests**
Track requests for trade crews.

**Key Columns:**
- Project, Trade Team Needed
- Number of Workers, Dates
- Status (Pending/Approved/Fulfilled)

---

## 🎯 Key Features

### **Data Validation**
- Dropdowns for consistent entry
- Date validation
- Status tracking

### **Formulas**
- Auto-count volunteers per team
- Calculate available workers
- Track assignment conflicts
- Summary statistics

### **Reports**
- Volunteer roster by trade team
- Project assignments
- Available volunteers
- Crew request summary

---

## 💡 Usage Tips

### **Adding a New Volunteer**
1. Go to Volunteers sheet
2. Add new row at bottom
3. Fill in required fields
4. Use dropdowns for Trade Team, Status

### **Creating an Assignment**
1. Go to Assignments sheet
2. Add new row
3. Select Volunteer from dropdown
4. Select Project from dropdown
5. Set dates and role

### **Requesting a Crew**
1. Go to CrewRequests sheet
2. Add new row
3. Select Project and Trade Team
4. Enter number of workers needed
5. Set status to "Pending"

### **Viewing Dashboard**
1. Go to Dashboard sheet
2. See summary statistics
3. View charts and graphs
4. Refresh if data changes

---

## 🔧 Customization

### **Add New Trade Team**
1. Go to TradeTeams sheet
2. Add new row with team info
3. Update dropdown validation in Volunteers sheet

### **Add Custom Fields**
1. Add column to appropriate sheet
2. Update formulas if needed
3. Add to dashboard if relevant

### **Change Congregation List**
1. Create new sheet "Congregations"
2. List all congregations
3. Update dropdown validation

---

## ⚠️ Limitations

**What Excel CAN'T Do:**
- Multi-user editing (use OneDrive for sharing)
- Real-time notifications
- Automated workflows
- Advanced permissions
- Mobile app (use Excel mobile for basic access)

**Workarounds:**
- Share via OneDrive/SharePoint
- Email manually for notifications
- Use comments for collaboration
- Password protect sensitive sheets

---

## 📈 Next Steps

### **If POC Works:**
1. Add your actual volunteer data
2. Customize for your CG
3. Share with team via OneDrive
4. Train users on basic functions

### **If You Need More:**
- Consider Power Apps for multi-user
- Upgrade to full LDC Tools web app
- Hybrid: Excel for data entry, app for reporting

---

## 🆘 Support

### **Common Issues**

**Dropdowns not working:**
- Check data validation settings
- Ensure source data is in Table format

**Formulas showing errors:**
- Check table names match
- Ensure all sheets are present
- Verify column names

**Charts not updating:**
- Right-click chart → Refresh
- Check data range includes new rows

---

**Created by:** Cascade AI  
**For:** Construction Group 0205  
**Contact:** Use for regional/CG volunteer management
