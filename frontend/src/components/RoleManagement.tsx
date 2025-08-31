import React, { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, AlertCircle, CheckCircle } from 'lucide-react';

// Simple UI components to avoid dependency issues
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-lg border shadow-sm ${className}`}>{children}</div>
);

const CardHeader = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pb-3 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
);

const CardContent = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);

const Button = ({ children, onClick, variant = "default", size = "default", className = "", type = "button" }: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: string;
  size?: string;
  className?: string;
  type?: "button" | "submit";
}) => (
  <button
    type={type}
    onClick={onClick}
    className={`px-4 py-2 rounded-md font-medium transition-colors ${
      variant === "outline" ? "border border-gray-300 bg-white hover:bg-gray-50" : "bg-blue-600 text-white hover:bg-blue-700"
    } ${size === "sm" ? "px-2 py-1 text-sm" : ""} ${className}`}
  >
    {children}
  </button>
);

const Badge = ({ children, className = "", variant = "default" }: { children: React.ReactNode; className?: string; variant?: string }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
    {children}
  </span>
);

const Input = ({ id, value, onChange, placeholder, type = "text", className = "" }: {
  id?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  className?: string;
}) => (
  <input
    id={id}
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
  />
);

const Label = ({ children, htmlFor, className = "" }: { children: React.ReactNode; htmlFor?: string; className?: string }) => (
  <label htmlFor={htmlFor} className={`block text-sm font-medium text-gray-700 ${className}`}>
    {children}
  </label>
);

const Select = ({ value, onValueChange, children }: { value: string; onValueChange: (value: string) => void; children: React.ReactNode }) => (
  <select
    value={value}
    onChange={(e) => onValueChange(e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    {children}
  </select>
);

const SelectTrigger = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const SelectValue = () => null;
const SelectContent = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const SelectItem = ({ value, children }: { value: string; children: React.ReactNode }) => (
  <option value={value}>{children}</option>
);

const Dialog = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
const DialogTrigger = ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => <>{children}</>;
const DialogContent = ({ children }: { children: React.ReactNode }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-96 overflow-y-auto">
      {children}
    </div>
  </div>
);
const DialogHeader = ({ children }: { children: React.ReactNode }) => <div className="mb-4">{children}</div>;
const DialogTitle = ({ children }: { children: React.ReactNode }) => <h2 className="text-xl font-semibold">{children}</h2>;

const Tabs = ({ defaultValue, children, className = "" }: { defaultValue: string; children: React.ReactNode; className?: string }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);
  return (
    <div className={className}>
      {React.Children.map(children, child => 
        React.isValidElement(child) ? React.cloneElement(child, { activeTab, setActiveTab } as any) : child
      )}
    </div>
  );
};

const TabsList = ({ children, activeTab, setActiveTab }: { children: React.ReactNode; activeTab?: string; setActiveTab?: (tab: string) => void }) => (
  <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-4">
    {React.Children.map(children, child => 
      React.isValidElement(child) ? React.cloneElement(child, { activeTab, setActiveTab } as any) : child
    )}
  </div>
);

const TabsTrigger = ({ value, children, activeTab, setActiveTab }: { value: string; children: React.ReactNode; activeTab?: string; setActiveTab?: (tab: string) => void }) => (
  <button
    onClick={() => setActiveTab?.(value)}
    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      activeTab === value ? "bg-white shadow-sm" : "hover:bg-gray-200"
    }`}
  >
    {children}
  </button>
);

const TabsContent = ({ value, children, activeTab }: { value: string; children: React.ReactNode; activeTab?: string }) => (
  activeTab === value ? <div>{children}</div> : null
);

interface TradeTeam {
  id: number;
  name: string;
  ba_group_prefix: string;
  trade_crews: TradeCrew[];
}

interface TradeCrew {
  id: number;
  name: string;
  ba_group_name: string;
  trade_team_id: number;
  role_assignments: RoleAssignment[];
}

interface RoleAssignment {
  id: number;
  role_level: string;
  assignment_category: string;
  trade_team_id?: number;
  trade_crew_id?: number;
  assigned_member_id?: number;
  is_vacant: boolean;
  status: string;
  consultation_completed: boolean;
  impact_assessment?: string;
  change_reason?: string;
  effective_date?: string;
}

const ROLE_LEVELS = [
  'overseer',
  'assistant_overseer', 
  'group_overseer',
  'assistant_group_overseer',
  'servant',
  'ministerial_servant',
  'brother'
];

const ASSIGNMENT_CATEGORIES = [
  'trade_team_leadership',
  'trade_crew_leadership'
];

const STATUS_OPTIONS = [
  'no_adjustment_needed',
  'adjustment_needed',
  'pending_consultation',
  'consultation_scheduled',
  'change_approved',
  'change_implemented'
];

export default function RoleManagement() {
  const [tradeTeams, setTradeTeams] = useState<TradeTeam[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<TradeTeam | null>(null);
  const [selectedCrew, setSelectedCrew] = useState<TradeCrew | null>(null);
  const [roleAssignments, setRoleAssignments] = useState<RoleAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRole, setEditingRole] = useState<RoleAssignment | null>(null);

  useEffect(() => {
    fetchTradeTeams();
    fetchRoleAssignments();
  }, []);

  const fetchTradeTeams = async () => {
    try {
      const response = await fetch('/api/trade-teams');
      const data = await response.json();
      setTradeTeams(data);
    } catch (error) {
      console.error('Error fetching trade teams:', error);
    }
  };

  const fetchRoleAssignments = async () => {
    try {
      const response = await fetch('/api/role-assignments');
      const data = await response.json();
      setRoleAssignments(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching role assignments:', error);
      setLoading(false);
    }
  };

  const updateRoleAssignment = async (roleId: number, updates: Partial<RoleAssignment>) => {
    try {
      const response = await fetch(`/api/role-assignments/${roleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (response.ok) {
        await fetchRoleAssignments();
        setEditingRole(null);
      }
    } catch (error) {
      console.error('Error updating role assignment:', error);
    }
  };

  const getRoleStatusColor = (status: string) => {
    switch (status) {
      case 'no_adjustment_needed': return 'bg-green-100 text-green-800';
      case 'adjustment_needed': return 'bg-yellow-100 text-yellow-800';
      case 'pending_consultation': return 'bg-orange-100 text-orange-800';
      case 'consultation_scheduled': return 'bg-blue-100 text-blue-800';
      case 'change_approved': return 'bg-purple-100 text-purple-800';
      case 'change_implemented': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTeamRoles = (teamId: number) => {
    return roleAssignments.filter(role => 
      role.trade_team_id === teamId && role.assignment_category === 'trade_team_leadership'
    );
  };

  const getCrewRoles = (crewId: number) => {
    return roleAssignments.filter(role => 
      role.trade_crew_id === crewId && role.assignment_category === 'trade_crew_leadership'
    );
  };

  const getVacantRoles = () => {
    return roleAssignments.filter(role => role.is_vacant);
  };

  const getRolesNeedingAttention = () => {
    return roleAssignments.filter(role => 
      role.status !== 'no_adjustment_needed' && role.status !== 'change_implemented'
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading role management system...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Role Management System</h1>
          <p className="text-gray-600 mt-1">USLDC-2829-E Assignment Change Tracking</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-sm">
            <Users className="w-4 h-4 mr-1" />
            {tradeTeams.length} Teams
          </Badge>
          <Badge variant="outline" className="text-sm">
            <UserCheck className="w-4 h-4 mr-1" />
            {roleAssignments.filter(r => !r.is_vacant).length} Assigned
          </Badge>
          <Badge variant="outline" className="text-sm">
            <UserX className="w-4 h-4 mr-1" />
            {getVacantRoles().length} Vacant
          </Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">
                  {roleAssignments.filter(r => r.status === 'no_adjustment_needed').length}
                </div>
                <div className="text-sm text-gray-600">No Adjustment Needed</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">
                  {getRolesNeedingAttention().length}
                </div>
                <div className="text-sm text-gray-600">Need Attention</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserX className="w-5 h-5 text-red-600" />
              <div>
                <div className="text-2xl font-bold">{getVacantRoles().length}</div>
                <div className="text-sm text-gray-600">Vacant Positions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{roleAssignments.length}</div>
                <div className="text-sm text-gray-600">Total Positions</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="teams" className="space-y-4">
        <TabsList>
          <TabsTrigger value="teams">Trade Teams</TabsTrigger>
          <TabsTrigger value="crews">Trade Crews</TabsTrigger>
          <TabsTrigger value="vacant">Vacant Positions</TabsTrigger>
          <TabsTrigger value="attention">Need Attention</TabsTrigger>
        </TabsList>

        <TabsContent value="teams" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tradeTeams.map(team => (
              <Card key={team.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{team.name}</CardTitle>
                  <p className="text-sm text-gray-600">BA Group: {team.ba_group_prefix}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {getTeamRoles(team.id).map(role => (
                      <div key={role.id} className="flex justify-between items-center">
                        <span className="text-sm font-medium">{role.role_level.replace('_', ' ')}</span>
                        <div className="flex gap-2">
                          <Badge 
                            className={`text-xs ${getRoleStatusColor(role.status)}`}
                          >
                            {role.is_vacant ? 'Vacant' : 'Assigned'}
                          </Badge>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setEditingRole(role)}
                              >
                                Edit
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Role Assignment</DialogTitle>
                              </DialogHeader>
                              <RoleEditForm 
                                role={role} 
                                onUpdate={updateRoleAssignment}
                                onCancel={() => setEditingRole(null)}
                              />
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="crews" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tradeTeams.map(team => 
              team.trade_crews.map(crew => (
                <Card key={crew.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{crew.name}</CardTitle>
                    <p className="text-sm text-gray-600">
                      Team: {team.name} | BA: {crew.ba_group_name}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {getCrewRoles(crew.id).map(role => (
                        <div key={role.id} className="flex justify-between items-center">
                          <span className="text-sm font-medium">{role.role_level.replace('_', ' ')}</span>
                          <div className="flex gap-2">
                            <Badge 
                              className={`text-xs ${getRoleStatusColor(role.status)}`}
                            >
                              {role.is_vacant ? 'Vacant' : 'Assigned'}
                            </Badge>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">Edit</Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edit Role Assignment</DialogTitle>
                                </DialogHeader>
                                <RoleEditForm 
                                  role={role} 
                                  onUpdate={updateRoleAssignment}
                                  onCancel={() => setEditingRole(null)}
                                />
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="vacant">
          <Card>
            <CardHeader>
              <CardTitle>Vacant Positions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getVacantRoles().map(role => (
                  <div key={role.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{role.role_level.replace('_', ' ')}</div>
                      <div className="text-sm text-gray-600">
                        {role.assignment_category.replace('_', ' ')}
                      </div>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline">Assign</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Assign Role</DialogTitle>
                        </DialogHeader>
                        <RoleEditForm 
                          role={role} 
                          onUpdate={updateRoleAssignment}
                          onCancel={() => setEditingRole(null)}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attention">
          <Card>
            <CardHeader>
              <CardTitle>Roles Needing Attention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getRolesNeedingAttention().map(role => (
                  <div key={role.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{role.role_level.replace('_', ' ')}</div>
                      <Badge className={`text-xs ${getRoleStatusColor(role.status)} mt-1`}>
                        {role.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline">Update</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Update Role Status</DialogTitle>
                        </DialogHeader>
                        <RoleEditForm 
                          role={role} 
                          onUpdate={updateRoleAssignment}
                          onCancel={() => setEditingRole(null)}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface RoleEditFormProps {
  role: RoleAssignment;
  onUpdate: (roleId: number, updates: Partial<RoleAssignment>) => void;
  onCancel: () => void;
}

function RoleEditForm({ role, onUpdate, onCancel }: RoleEditFormProps) {
  const [formData, setFormData] = useState({
    status: role.status,
    is_vacant: role.is_vacant,
    consultation_completed: role.consultation_completed,
    impact_assessment: role.impact_assessment || '',
    change_reason: role.change_reason || '',
    effective_date: role.effective_date || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(role.id, formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="status">Status</Label>
        <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map(status => (
              <SelectItem key={status} value={status}>
                {status.replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="is_vacant"
          checked={formData.is_vacant}
          onChange={(e) => setFormData({...formData, is_vacant: e.target.checked})}
        />
        <Label htmlFor="is_vacant">Position is vacant</Label>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="consultation_completed"
          checked={formData.consultation_completed}
          onChange={(e) => setFormData({...formData, consultation_completed: e.target.checked})}
        />
        <Label htmlFor="consultation_completed">Consultation completed</Label>
      </div>

      <div>
        <Label htmlFor="change_reason">Change Reason</Label>
        <Input
          id="change_reason"
          value={formData.change_reason}
          onChange={(e) => setFormData({...formData, change_reason: e.target.value})}
          placeholder="Reason for assignment change..."
        />
      </div>

      <div>
        <Label htmlFor="effective_date">Effective Date</Label>
        <Input
          id="effective_date"
          type="date"
          value={formData.effective_date}
          onChange={(e) => setFormData({...formData, effective_date: e.target.value})}
        />
      </div>

      <div>
        <Label htmlFor="impact_assessment">Impact Assessment</Label>
        <textarea
          id="impact_assessment"
          className="w-full p-2 border rounded-md"
          rows={3}
          value={formData.impact_assessment}
          onChange={(e) => setFormData({...formData, impact_assessment: e.target.value})}
          placeholder="Assessment of change impact..."
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Update Role
        </Button>
      </div>
    </form>
  );
}
