'use client';

import React from 'react';
import { Download, Upload, FileText, Table, FileSpreadsheet } from 'lucide-react';

export default function ImportExportHelp() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">📊 Import & Export Data</h1>
      
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <p className="text-blue-900">
          Import and export features help you manage large amounts of data efficiently. 
          You can bulk import volunteers and projects, or export data for reporting and backup purposes.
        </p>
      </div>

      {/* Volunteers Import/Export */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <Upload className="h-6 w-6 mr-2 text-blue-600" />
          Importing Volunteers
        </h2>
        
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <h3 className="text-xl font-semibold mb-3">How to Import Volunteers</h3>
          
          <ol className="list-decimal list-inside space-y-3 mb-4">
            <li>
              <strong>Download the Template</strong>
              <p className="ml-6 text-gray-600">Click the "Template" button on the Volunteers page to download a CSV template with the correct format.</p>
            </li>
            <li>
              <strong>Fill in Your Data</strong>
              <p className="ml-6 text-gray-600">Open the template in Excel or Google Sheets and enter your volunteer information. Follow the column headers exactly.</p>
            </li>
            <li>
              <strong>Save as CSV</strong>
              <p className="ml-6 text-gray-600">Save your file as CSV format (not Excel format).</p>
            </li>
            <li>
              <strong>Upload the File</strong>
              <p className="ml-6 text-gray-600">Click the "Upload CSV" button and select your file. The system will process and import your volunteers.</p>
            </li>
          </ol>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
            <p className="text-sm text-yellow-900">
              <strong>Important:</strong> Make sure all required fields are filled in. The import will show you how many volunteers were successfully imported and any errors that occurred.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-3">Required Fields</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li><strong>first_name</strong> - Volunteer's first name</li>
            <li><strong>last_name</strong> - Volunteer's last name</li>
            <li><strong>congregation</strong> - Congregation name</li>
            <li><strong>phone</strong> - Contact phone number</li>
            <li><strong>email</strong> - Email address</li>
          </ul>
        </div>
      </section>

      {/* Projects Import/Export */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <Upload className="h-6 w-6 mr-2 text-blue-600" />
          Importing Projects
        </h2>
        
        <div className="bg-white rounded-lg shadow p-6">
          <p className="mb-4">The process for importing projects is similar to importing volunteers:</p>
          
          <ol className="list-decimal list-inside space-y-3">
            <li>Download the Projects CSV template</li>
            <li>Fill in project details (name, status, location, type, etc.)</li>
            <li>Save as CSV and upload</li>
          </ol>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-4">
            <p className="text-sm text-blue-900">
              <strong>Tip:</strong> Projects are automatically linked to your Construction Group and Region when imported.
            </p>
          </div>
        </div>
      </section>

      {/* Export Features */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <Download className="h-6 w-6 mr-2 text-green-600" />
          Exporting Data
        </h2>
        
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <h3 className="text-xl font-semibold mb-3">Export Options</h3>
          
          <div className="space-y-4">
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold flex items-center">
                <FileSpreadsheet className="h-5 w-5 mr-2 text-green-600" />
                Excel Export
              </h4>
              <p className="text-gray-600">Export data to Excel format (.xlsx) for analysis, reporting, or sharing with others.</p>
              <p className="text-sm text-gray-500 mt-2">Available on: Volunteers, Projects, Calendar</p>
            </div>

            <div className="border-l-4 border-red-500 pl-4">
              <h4 className="font-semibold flex items-center">
                <FileText className="h-5 w-5 mr-2 text-red-600" />
                PDF Export
              </h4>
              <p className="text-gray-600">Generate formatted PDF documents for printing or distribution.</p>
              <p className="text-sm text-gray-500 mt-2">Available on: Volunteers, Projects, Calendar, Trade Teams Overview</p>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold flex items-center">
                <Table className="h-5 w-5 mr-2 text-blue-600" />
                CSV Export
              </h4>
              <p className="text-gray-600">Export raw data in CSV format for use in other systems or custom analysis.</p>
              <p className="text-sm text-gray-500 mt-2">Available on: Volunteers, Trade Teams Overview</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-3">How to Export</h3>
          
          <ol className="list-decimal list-inside space-y-3">
            <li>
              <strong>Apply Filters (Optional)</strong>
              <p className="ml-6 text-gray-600">Use the filter options to narrow down what data you want to export.</p>
            </li>
            <li>
              <strong>Click Export Button</strong>
              <p className="ml-6 text-gray-600">Click the green "Export" button and choose your format (Excel, PDF, or CSV).</p>
            </li>
            <li>
              <strong>Download File</strong>
              <p className="ml-6 text-gray-600">The file will automatically download to your computer with a timestamped filename.</p>
            </li>
          </ol>
        </div>
      </section>

      {/* Calendar Export */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <FileText className="h-6 w-6 mr-2 text-purple-600" />
          Calendar Schedule Export
        </h2>
        
        <div className="bg-white rounded-lg shadow p-6">
          <p className="mb-4">The Calendar page offers multiple export formats for project schedules:</p>
          
          <div className="space-y-3">
            <div className="bg-green-50 p-3 rounded">
              <h4 className="font-semibold text-green-900">Excel Export</h4>
              <p className="text-sm text-green-800">Complete schedule data in spreadsheet format for analysis and planning.</p>
            </div>

            <div className="bg-red-50 p-3 rounded">
              <h4 className="font-semibold text-red-900">PDF: Simple List</h4>
              <p className="text-sm text-red-800">Basic schedule table showing trade teams, crews, dates, and notes.</p>
            </div>

            <div className="bg-purple-50 p-3 rounded">
              <h4 className="font-semibold text-purple-900">PDF: With Duration</h4>
              <p className="text-sm text-purple-800">Enhanced schedule with calculated duration for each crew assignment.</p>
            </div>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-4">
            <p className="text-sm text-blue-900">
              <strong>Tip:</strong> PDF exports use clean filenames based on your project name for easy organization.
            </p>
          </div>
        </div>
      </section>

      {/* Common Questions */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">❓ Common Questions</h2>
        
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-2">What happens if my import has errors?</h3>
            <p className="text-gray-700">
              The system will show you how many records were successfully imported and how many failed. 
              Check the browser console for detailed error messages about which rows had problems.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-2">Can I export filtered data?</h3>
            <p className="text-gray-700">
              Yes! Apply filters before exporting, and only the filtered data will be included in your export file.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-2">What format should I use for dates in CSV imports?</h3>
            <p className="text-gray-700">
              Use standard date formats like "MM/DD/YYYY" or "YYYY-MM-DD". The system will automatically parse common date formats.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-2">Where do my exported files go?</h3>
            <p className="text-gray-700">
              Exported files download to your browser's default download folder. Files are named with the data type and current date for easy identification.
            </p>
          </div>
        </div>
      </section>

      {/* Need Help */}
      <div className="bg-gray-50 rounded-lg p-6 mt-8">
        <h2 className="text-xl font-semibold mb-3">📞 Need More Help?</h2>
        <p className="text-gray-700 mb-3">
          If you're having trouble with import or export features:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Check that your CSV file follows the template format exactly</li>
          <li>Verify all required fields are filled in</li>
          <li>Contact your system administrator for assistance</li>
          <li>Use the "Send Feedback" button to report issues</li>
        </ul>
      </div>
    </div>
  );
}
