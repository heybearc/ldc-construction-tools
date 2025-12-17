'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Plus, Calendar, Copy, Check, Trash2, Download } from 'lucide-react';
import { getTradeTeamConfig } from '@/lib/trade-team-config';

interface Project {
  id: string;
  name: string;
  projectNumber: string | null;
  status: string;
}

interface TradeTeam {
  id: string;
  name: string;
}

interface Crew {
  id: string;
  name: string;
  tradeTeamId: string;
}

interface ScheduleEntry {
  id: string;
  eventName: string;
  startDate: string;
  endDate: string;
  volunteerCount: number | null;
  notes: string | null;
  tradeTeam: TradeTeam | null;
  crew: Crew | null;
}

interface ScheduleVersion {
  id: string;
  versionNumber: number;
  name: string;
  notes: string | null;
  isCurrent: boolean;
  projectId: string;
  _count?: { entries: number };
}

function CalendarContent() {
  const searchParams = useSearchParams();
  const projectIdParam = searchParams.get('project');

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [versions, setVersions] = useState<ScheduleVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<ScheduleVersion | null>(null);
  const [entries, setEntries] = useState<ScheduleEntry[]>([]);
  const [tradeTeams, setTradeTeams] = useState<TradeTeam[]>([]);
  const [crews, setCrews] = useState<Crew[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const [showNewVersionModal, setShowNewVersionModal] = useState(false);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ScheduleEntry | null>(null);
  
  const [versionForm, setVersionForm] = useState({ name: '', notes: '', duplicateFrom: '' });
  const [entryForm, setEntryForm] = useState({
    tradeTeamId: '', crewId: '', eventName: '',
    startDate: '', endDate: '', volunteerCount: '', notes: '',
  });

  useEffect(() => { fetchProjects(); fetchTradeTeams(); }, []);

  useEffect(() => {
    if (projectIdParam && projects.length > 0 && !selectedProject) {
      const project = projects.find(p => p.id === projectIdParam);
      if (project) setSelectedProject(project);
    }
  }, [projectIdParam, projects]);

  useEffect(() => {
    if (selectedProject) { fetchVersions(selectedProject.id); }
    else { setVersions([]); setSelectedVersion(null); setEntries([]); }
  }, [selectedProject]);

  useEffect(() => {
    if (selectedVersion) { fetchEntries(selectedVersion.id); }
    else { setEntries([]); }
  }, [selectedVersion]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/projects');
      if (res.ok) setProjects(await res.json());
    } catch (err) { console.error('Failed to fetch projects:', err); }
    finally { setLoading(false); }
  };

  const fetchVersions = async (projectId: string) => {
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/schedule`);
      if (res.ok) {
        const data = await res.json();
        setVersions(data);
        const current = data.find((v: ScheduleVersion) => v.isCurrent) || data[0];
        setSelectedVersion(current || null);
      }
    } catch (err) { console.error('Failed to fetch versions:', err); }
  };

  const fetchEntries = async (versionId: string) => {
    try {
      const res = await fetch(`/api/v1/projects/${selectedProject?.id}/schedule/${versionId}/entries`);
      if (res.ok) setEntries(await res.json());
    } catch (err) { console.error('Failed to fetch entries:', err); }
  };

  const fetchTradeTeams = async () => {
    try {
      const res = await fetch('/api/v1/trade-teams');
      if (res.ok) setTradeTeams(await res.json());
    } catch (err) { console.error('Failed to fetch trade teams:', err); }
  };

  const fetchCrewsForTeam = async (teamId: string) => {
    if (!teamId) { setCrews([]); return; }
    try {
      const res = await fetch(`/api/v1/trade-teams/${teamId}/crews`);
      if (res.ok) setCrews(await res.json());
    } catch (err) { console.error('Failed to fetch crews:', err); }
  };

  const handleCreateVersion = async () => {
    if (!selectedProject) return;
    try {
      const res = await fetch(`/api/v1/projects/${selectedProject.id}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: versionForm.name,
          notes: versionForm.notes,
          duplicateFromVersionId: versionForm.duplicateFrom || undefined,
        }),
      });
      if (res.ok) {
        setShowNewVersionModal(false);
        setVersionForm({ name: '', notes: '', duplicateFrom: '' });
        fetchVersions(selectedProject.id);
      }
    } catch (err) { console.error('Failed to create version:', err); }
  };

  const handleDeleteVersion = async (versionId: string) => {
    if (!selectedProject) return;
    const version = versions.find(v => v.id === versionId);
    if (!version) return;
    if (version.isCurrent) { alert('Cannot delete the current version. Set another version as current first.'); return; }
    if (!confirm(`Delete schedule "${version.name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/v1/projects/${selectedProject.id}/schedule/${versionId}`, { method: 'DELETE' });
      if (res.ok) fetchVersions(selectedProject.id);
    } catch (err) { console.error('Failed to delete version:', err); }
  };

  const handleSetCurrent = async (versionId: string) => {
    if (!selectedProject) return;
    try {
      await fetch(`/api/v1/projects/${selectedProject.id}/schedule/${versionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCurrent: true }),
      });
      fetchVersions(selectedProject.id);
    } catch (err) { console.error('Failed to set current:', err); }
  };

  const handleSaveEntry = async () => {
    if (!selectedProject || !selectedVersion) return;
    try {
      const url = editingEntry 
        ? `/api/v1/projects/${selectedProject.id}/schedule/${selectedVersion.id}/entries/${editingEntry.id}`
        : `/api/v1/projects/${selectedProject.id}/schedule/${selectedVersion.id}/entries`;
      const res = await fetch(url, {
        method: editingEntry ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entryForm),
      });
      if (res.ok) {
        setShowEntryModal(false);
        setEditingEntry(null);
        resetEntryForm();
        fetchEntries(selectedVersion.id);
      }
    } catch (err) { console.error('Failed to save entry:', err); }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!selectedProject || !selectedVersion || !confirm('Delete this schedule entry?')) return;
    try {
      await fetch(`/api/v1/projects/${selectedProject.id}/schedule/${selectedVersion.id}/entries/${entryId}`, { method: 'DELETE' });
      fetchEntries(selectedVersion.id);
    } catch (err) { console.error('Failed to delete entry:', err); }
  };

  const resetEntryForm = () => {
    setEntryForm({ tradeTeamId: '', crewId: '', eventName: '', startDate: '', endDate: '', volunteerCount: '', notes: '' });
  };

  const openEditEntry = (entry: ScheduleEntry) => {
    setEditingEntry(entry);
    setEntryForm({
      tradeTeamId: entry.tradeTeam?.id || '',
      crewId: entry.crew?.id || '',
      eventName: entry.eventName,
      startDate: entry.startDate.split('T')[0],
      endDate: entry.endDate.split('T')[0],
      volunteerCount: entry.volunteerCount?.toString() || '',
      notes: entry.notes || '',
    });
    if (entry.tradeTeam?.id) fetchCrewsForTeam(entry.tradeTeam.id);
    setShowEntryModal(true);
  };

  const getWeeksInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      currentWeek.push(new Date(current));
      if (currentWeek.length === 7) { weeks.push(currentWeek); currentWeek = []; }
      current.setDate(current.getDate() + 1);
    }
    return weeks;
  };

  const formatMonthYear = (date: Date) => date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const getEntryBarStyle = (entry: ScheduleEntry, weekDays: Date[]) => {
    const start = new Date(entry.startDate); start.setHours(0, 0, 0, 0);
    const end = new Date(entry.endDate); end.setHours(23, 59, 59, 999);
    const weekStart = new Date(weekDays[0]); weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekDays[6]); weekEnd.setHours(23, 59, 59, 999);
    if (end < weekStart || start > weekEnd) return null;
    let startCol = 0, endCol = 6;
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekDays[i]); day.setHours(12, 0, 0, 0);
      if (day >= start && startCol === 0 && i > 0) startCol = i;
      if (day <= end) endCol = i;
    }
    if (start < weekStart) startCol = 0;
    return { left: `${(startCol / 7) * 100}%`, width: `${((endCol - startCol + 1) / 7) * 100}%` };
  };

  const getEntriesForWeek = (weekDays: Date[]) => {
    const weekStart = new Date(weekDays[0]); weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekDays[6]); weekEnd.setHours(23, 59, 59, 999);
    return entries.filter(entry => {
      const start = new Date(entry.startDate); start.setHours(0, 0, 0, 0);
      const end = new Date(entry.endDate); end.setHours(23, 59, 59, 999);
      return !(end < weekStart || start > weekEnd);
    });
  };

  const weeks = getWeeksInMonth(currentMonth);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Project Calendar</h1>
          <p className="mt-1 text-gray-600">Build and manage project schedules</p>
        </div>
        <button onClick={() => { resetEntryForm(); setEditingEntry(null); setShowEntryModal(true); }} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50" disabled={!selectedVersion}>
          <Plus className="h-4 w-4 mr-2" />Add Entry
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Project:</label>
            <select value={selectedProject?.id || ''} onChange={(e) => { const p = projects.find(p => p.id === e.target.value); setSelectedProject(p || null); }} className="border border-gray-300 rounded-md px-3 py-2 min-w-[200px]">
              <option value="">Select a project...</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name} {p.projectNumber ? `(${p.projectNumber})` : ''}</option>)}
            </select>
          </div>
          {selectedProject && (
            <>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Schedule:</label>
                <select value={selectedVersion?.id || ''} onChange={(e) => { const v = versions.find(v => v.id === e.target.value); setSelectedVersion(v || null); }} className="border border-gray-300 rounded-md px-3 py-2">
                  {versions.length === 0 && <option value="">No schedules yet</option>}
                  {versions.map(v => <option key={v.id} value={v.id}>{v.name} {v.isCurrent ? '✓' : ''}</option>)}
                </select>
              </div>
              {selectedVersion && !selectedVersion.isCurrent && (
                <button onClick={() => handleSetCurrent(selectedVersion.id)} className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"><Check className="h-4 w-4 mr-1" />Set Current</button>
              )}
              {selectedVersion && !selectedVersion.isCurrent && (
                <button onClick={() => handleDeleteVersion(selectedVersion.id)} className="inline-flex items-center text-sm text-red-600 hover:text-red-800"><Trash2 className="h-4 w-4 mr-1" />Delete</button>
              )}
              <button onClick={() => setShowNewVersionModal(true)} className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"><Copy className="h-4 w-4 mr-2" />New Version</button>{selectedVersion && entries.length > 0 && (<a href={`/api/v1/projects/${selectedProject?.id}/schedule/${selectedVersion?.id}/export`} className="inline-flex items-center px-3 py-2 border border-green-300 bg-green-50 text-green-700 rounded-md text-sm hover:bg-green-100"><Download className="h-4 w-4 mr-2" />Export Excel</a>)}
            </>
          )}
        </div>
      </div>

      {selectedProject ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b flex items-center justify-between bg-gray-50">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-200 rounded-full"><ChevronLeft className="h-5 w-5" /></button>
            <h2 className="text-xl font-semibold">{formatMonthYear(currentMonth)}</h2>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-200 rounded-full"><ChevronRight className="h-5 w-5" /></button>
          </div>
          <div className="grid grid-cols-7 border-b bg-gray-50">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="px-2 py-2 text-center text-sm font-medium text-gray-600 border-r last:border-r-0">{day}</div>)}
          </div>
          {weeks.map((weekDays, weekIdx) => {
            const weekEntries = getEntriesForWeek(weekDays);
            const isCurrentMonth = (d: Date) => d.getMonth() === currentMonth.getMonth();
            return (
              <div key={weekIdx} className="border-b last:border-b-0">
                <div className="grid grid-cols-7">
                  {weekDays.map((date, dayIdx) => {
                    const isToday = date.toDateString() === new Date().toDateString();
                    const inMonth = isCurrentMonth(date);
                    return <div key={dayIdx} className={`px-2 py-1 text-sm border-r last:border-r-0 ${isToday ? 'bg-blue-100 font-bold text-blue-700' : inMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'}`}>{date.getDate()}</div>;
                  })}
                </div>
                <div className="relative min-h-[60px] bg-white">
                  {weekEntries.length === 0 ? <div className="h-[60px]"></div> : (
                    <div className="relative" style={{ minHeight: `${Math.max(60, weekEntries.length * 28 + 8)}px` }}>
                      {weekEntries.map((entry, entryIdx) => {
                        const barStyle = getEntryBarStyle(entry, weekDays);
                        if (!barStyle) return null;
                        const config = getTradeTeamConfig(entry.tradeTeam?.name || '');
                        const hasNotes = entry.notes && entry.notes.trim().length > 0;
                        return (
                          <div key={entry.id} onClick={() => openEditEntry(entry)} className={`absolute h-6 rounded cursor-pointer flex items-center px-2 text-xs font-medium truncate border ${config.bgColor} ${config.color} ${config.borderColor} hover:opacity-80 transition-opacity`} style={{ ...barStyle, top: `${4 + entryIdx * 28}px` }} title={`${entry.tradeTeam?.name || ''} | ${entry.eventName}${entry.volunteerCount ? ` - ${entry.volunteerCount}` : ''}${hasNotes ? '\n📝 ' + entry.notes : ''}`}>
                            <span className="mr-1">{config.icon}</span>
                            <span className="truncate">{entry.eventName}</span>
                            {entry.volunteerCount && <span className="ml-1 opacity-75">({entry.volunteerCount})</span>}
                            {hasNotes && <span className="ml-1">📝</span>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Select a Project</h3>
          <p className="text-gray-500 mt-2">Choose a project above to view or build its schedule.</p>
        </div>
      )}

      {selectedVersion && entries.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b"><h2 className="text-lg font-medium">Schedule Entries ({entries.length})</h2></div>
          <div className="divide-y max-h-[500px] overflow-y-auto">
            {entries.map(entry => {
              const config = getTradeTeamConfig(entry.tradeTeam?.name || '');
              const hasNotes = entry.notes && entry.notes.trim().length > 0;
              return (
                <div key={entry.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <span className={`text-xl p-1.5 rounded ${config.bgColor} mt-0.5`}>{config.icon}</span>
                      <div>
                        <div className="font-medium text-gray-900">{entry.eventName}</div>
                        <div className="text-sm text-gray-500">
                          {entry.tradeTeam?.name || 'No trade team'}
                          {entry.crew && ` • ${entry.crew.name}`}
                          {entry.volunteerCount && ` • ${entry.volunteerCount} volunteers`}
                          {' • '}{new Date(entry.startDate).toLocaleDateString()} - {new Date(entry.endDate).toLocaleDateString()}
                        </div>
                        {hasNotes && (
                          <div className="mt-2 text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded border border-amber-200">
                            📝 {entry.notes}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button onClick={() => openEditEntry(entry)} className="text-sm text-blue-600 hover:text-blue-800">Edit</button>
                      <button onClick={() => handleDeleteEntry(entry.id)} className="text-sm text-red-600 hover:text-red-800">Delete</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showNewVersionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b"><h2 className="text-lg font-medium">Create New Schedule Version</h2></div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Version Name</label>
                <input type="text" value={versionForm.name} onChange={(e) => setVersionForm({ ...versionForm, name: e.target.value })} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2" placeholder="e.g., January 2026 Revised" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Duplicate From (Optional)</label>
                <select value={versionForm.duplicateFrom} onChange={(e) => setVersionForm({ ...versionForm, duplicateFrom: e.target.value })} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2">
                  <option value="">Start fresh</option>
                  {versions.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea value={versionForm.notes} onChange={(e) => setVersionForm({ ...versionForm, notes: e.target.value })} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2" rows={2} placeholder="Why is this version being created?" />
              </div>
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <button onClick={() => setShowNewVersionModal(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">Cancel</button>
              <button onClick={handleCreateVersion} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Create Version</button>
            </div>
          </div>
        </div>
      )}

      {showEntryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
            <div className="px-6 py-4 border-b"><h2 className="text-lg font-medium">{editingEntry ? 'Edit' : 'Add'} Schedule Entry</h2></div>
            <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Trade Team</label>
                  <select value={entryForm.tradeTeamId} onChange={(e) => { setEntryForm({ ...entryForm, tradeTeamId: e.target.value, crewId: '' }); fetchCrewsForTeam(e.target.value); }} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2">
                    <option value="">Select trade team</option>
                    {tradeTeams.map(t => <option key={t.id} value={t.id}>{getTradeTeamConfig(t.name).icon} {t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Crew (Optional)</label>
                  <select value={entryForm.crewId} onChange={(e) => setEntryForm({ ...entryForm, crewId: e.target.value })} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2" disabled={!entryForm.tradeTeamId}>
                    <option value="">Select crew</option>
                    {crews.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Event Name *</label>
                <input type="text" value={entryForm.eventName} onChange={(e) => setEntryForm({ ...entryForm, eventName: e.target.value })} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2" placeholder="e.g., Drywall - Texture, Rough-In" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Date *</label>
                  <input type="date" value={entryForm.startDate} onChange={(e) => setEntryForm({ ...entryForm, startDate: e.target.value })} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date *</label>
                  <input type="date" value={entryForm.endDate} onChange={(e) => setEntryForm({ ...entryForm, endDate: e.target.value })} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Volunteer Count</label>
                <input type="number" value={entryForm.volunteerCount} onChange={(e) => setEntryForm({ ...entryForm, volunteerCount: e.target.value })} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2" placeholder="Expected count" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea value={entryForm.notes} onChange={(e) => setEntryForm({ ...entryForm, notes: e.target.value })} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2" rows={3} placeholder="Any additional information..." />
              </div>
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <button onClick={() => { setShowEntryModal(false); setEditingEntry(null); resetEntryForm(); }} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">Cancel</button>
              <button onClick={handleSaveEntry} disabled={!entryForm.eventName || !entryForm.startDate || !entryForm.endDate} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">{editingEntry ? 'Save Changes' : 'Add Entry'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CalendarPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
      <CalendarContent />
    </Suspense>
  );
}
