"""
Export service for generating Excel files from LDC Construction Tools data
"""

from typing import List, Dict, Any
import pandas as pd
from io import BytesIO
from datetime import datetime

from app.schemas.trade_teams import TradeTeamSummary, TradeCrewSummary, CrewMemberSummary
from app.schemas.projects import ProjectExportData, ProjectAssignmentSummary


class ExportService:
    """Service for exporting data to Excel format"""
    
    @staticmethod
    def export_trade_teams_to_excel(
        teams: List[TradeTeamSummary],
        crews: List[TradeCrewSummary],
        members: List[CrewMemberSummary]
    ) -> BytesIO:
        """Export trade teams data to Excel file"""
        
        # Create Excel writer
        output = BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            
            # Trade Teams summary
            teams_data = []
            for team in teams:
                teams_data.append({
                    'Team ID': team.id,
                    'Team Name': team.name,
                    'Total Crews': team.crew_count,
                    'Active Crews': team.active_crews,
                    'Total Members': team.total_members,
                    'Status': 'Active' if team.is_active else 'Inactive'
                })
            
            teams_df = pd.DataFrame(teams_data)
            teams_df.to_excel(writer, sheet_name='Trade Teams', index=False)
            
            # Trade Crews summary
            crews_data = []
            for crew in crews:
                crews_data.append({
                    'Crew ID': crew.id,
                    'Crew Name': crew.name,
                    'Specialization': crew.specialization or '',
                    'Capacity': crew.capacity or '',
                    'Current Members': crew.member_count,
                    'Trade Crew Overseer': crew.overseer_name or 'Not Assigned',
                    'Status': 'Active' if crew.is_active else 'Inactive'
                })
            
            crews_df = pd.DataFrame(crews_data)
            crews_df.to_excel(writer, sheet_name='Trade Crews', index=False)
            
            # Crew Members details
            members_data = []
            for member in members:
                members_data.append({
                    'Member ID': member.id,
                    'Full Name': member.full_name,
                    'Role': member.role,
                    'Phone': member.phone or '',
                    'JW.ORG Email': member.email_jw or '',
                    'Congregation': member.congregation or '',
                    'Trade Crew Overseer': 'Yes' if member.is_overseer else 'No',
                    'Assistant': 'Yes' if member.is_assistant else 'No',
                    'Status': 'Active' if member.is_active else 'Inactive'
                })
            
            members_df = pd.DataFrame(members_data)
            members_df.to_excel(writer, sheet_name='Crew Members', index=False)
        
        output.seek(0)
        return output
    
    @staticmethod
    def export_project_to_excel(project_data: ProjectExportData) -> BytesIO:
        """Export project data to Excel file"""
        
        output = BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            
            # Project Information
            project_info = {
                'Field': [
                    'Project Name', 'Project Number', 'Location', 'Project Type',
                    'Status', 'Current Phase', 'Start Date', 'End Date',
                    'Total Assignments', 'Active Assignments'
                ],
                'Value': [
                    project_data.project_info.name,
                    project_data.project_info.project_number or '',
                    project_data.project_info.location or '',
                    project_data.project_info.project_type or '',
                    project_data.project_info.status,
                    project_data.project_info.current_phase or '',
                    project_data.project_info.start_date.strftime('%Y-%m-%d') if project_data.project_info.start_date else '',
                    project_data.project_info.end_date.strftime('%Y-%m-%d') if project_data.project_info.end_date else '',
                    project_data.project_info.assignment_count,
                    project_data.project_info.active_assignments
                ]
            }
            
            project_df = pd.DataFrame(project_info)
            project_df.to_excel(writer, sheet_name='Project Info', index=False)
            
            # Project Assignments
            assignments_data = []
            for assignment in project_data.assignments:
                assignments_data.append({
                    'Assignment ID': assignment.id,
                    'Trade Team': assignment.trade_team_name,
                    'Trade Crew': assignment.trade_crew_name,
                    'Role Description': assignment.role_description or '',
                    'Construction Phase': assignment.phase or '',
                    'Status': assignment.status,
                    'Start Date': assignment.start_date.strftime('%Y-%m-%d') if assignment.start_date else '',
                    'End Date': assignment.end_date.strftime('%Y-%m-%d') if assignment.end_date else '',
                    'Trade Crew Overseer': assignment.overseer_name or '',
                    'Overseer Phone': assignment.overseer_phone or '',
                    'Overseer Email': assignment.overseer_email or ''
                })
            
            assignments_df = pd.DataFrame(assignments_data)
            assignments_df.to_excel(writer, sheet_name='Project Assignments', index=False)
            
            # Construction Phases
            phases_data = []
            for phase in project_data.construction_phases:
                phases_data.append({
                    'Phase ID': phase.id,
                    'Phase Name': phase.name,
                    'Description': phase.description or '',
                    'Sequence Order': phase.sequence_order,
                    'Status': 'Active' if phase.is_active else 'Inactive'
                })
            
            phases_df = pd.DataFrame(phases_data)
            phases_df.to_excel(writer, sheet_name='Construction Phases', index=False)
        
        output.seek(0)
        return output
    
    @staticmethod
    def export_contact_list_to_excel(members: List[CrewMemberSummary]) -> BytesIO:
        """Export contact information to Excel file for Construction Group reference"""
        
        output = BytesIO()
        
        # Handle empty members list
        if not members:
            # Create a minimal Excel file with headers only
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                empty_df = pd.DataFrame({
                    'Name': [],
                    'Role': [],
                    'Trade Crew Overseer': [],
                    'Phone': [],
                    'JW.ORG Email': [],
                    'Congregation': [],
                    'Notes': []
                })
                empty_df.to_excel(writer, sheet_name='Contact List', index=False)
        else:
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                
                # Contact List - optimized for Construction Group use
                contacts_data = []
                for member in members:
                    if member.is_active:  # Only include active members
                        contacts_data.append({
                            'Name': member.full_name,
                            'Role': member.role,
                            'Trade Crew Overseer': 'Yes' if member.is_overseer else 'No',
                            'Phone': member.phone or '',
                            'JW.ORG Email': member.email_jw or '',
                            'Congregation': member.congregation or '',
                            'Notes': ''  # Empty column for Construction Group notes
                        })
                
                # Create DataFrame and handle empty case
                if contacts_data:
                    contacts_df = pd.DataFrame(contacts_data)
                    contacts_df = contacts_df.sort_values(['Trade Crew Overseer', 'Name'], ascending=[False, True])
                    contacts_df.to_excel(writer, sheet_name='Contact List', index=False)
                    
                    # Summary by Role
                    role_summary = contacts_df.groupby('Role').size().reset_index(name='Count')
                    role_summary.to_excel(writer, sheet_name='Role Summary', index=False)
                else:
                    # No active members found
                    empty_df = pd.DataFrame({
                        'Name': [],
                        'Role': [],
                        'Trade Crew Overseer': [],
                        'Phone': [],
                        'JW.ORG Email': [],
                        'Congregation': [],
                        'Notes': []
                    })
                    empty_df.to_excel(writer, sheet_name='Contact List', index=False)
        
        output.seek(0)
        return output
    
    @staticmethod
    def get_export_filename(export_type: str, project_name: str = None) -> str:
        """Generate standardized filename for exports"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        if export_type == "trade_teams":
            return f"LDC_Trade_Teams_{timestamp}.xlsx"
        elif export_type == "project" and project_name:
            # Clean project name for filename
            clean_name = "".join(c for c in project_name if c.isalnum() or c in (' ', '-', '_')).rstrip()
            clean_name = clean_name.replace(' ', '_')
            return f"LDC_Project_{clean_name}_{timestamp}.xlsx"
        elif export_type == "contacts":
            return f"LDC_Contact_List_{timestamp}.xlsx"
        else:
            return f"LDC_Export_{timestamp}.xlsx"
