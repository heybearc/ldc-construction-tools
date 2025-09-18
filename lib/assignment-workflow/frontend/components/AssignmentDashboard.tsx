/**
 * Assignment Dashboard Component
 * Overview and management of assignment requests with USLDC-2829-E compliance
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Tooltip,
  Badge,
  Fab
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
  CheckCircle as ApproveIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

// Types
interface AssignmentRequest {
  id: number;
  requester_id: number;
  assignment_type: 'emergency' | 'standard' | 'scheduled';
  priority_level: number;
  requested_role: string;
  project_id?: number;
  trade_team_id?: number;
  trade_crew_id?: number;
  start_date: string;
  end_date?: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
  requester?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  project?: {
    id: number;
    name: string;
  };
  trade_team?: {
    id: number;
    name: string;
  };
  trade_crew?: {
    id: number;
    name: string;
  };
}

interface PendingApproval {
  id: number;
  assignment_request_id: number;
  approval_level: number;
  created_at: string;
  assignment_request: AssignmentRequest;
}

interface DashboardStats {
  total_requests: number;
  pending_requests: number;
  approved_requests: number;
  rejected_requests: number;
  my_requests: number;
  pending_approvals: number;
}

interface AssignmentDashboardProps {
  onCreateNew: () => void;
  onViewRequest: (id: number) => void;
  onEditRequest: (id: number) => void;
  onApproveRequest: (id: number) => void;
  currentUserId: number;
  userRole: string;
}

export const AssignmentDashboard: React.FC<AssignmentDashboardProps> = ({
  onCreateNew,
  onViewRequest,
  onEditRequest,
  onApproveRequest,
  currentUserId,
  userRole
}) => {
  // State management
  const [assignments, setAssignments] = useState<AssignmentRequest[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filtering
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [showMyRequests, setShowMyRequests] = useState(false);
  
  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRequest, setSelectedRequest] = useState<AssignmentRequest | null>(null);

  // Load data on component mount and filter changes
  useEffect(() => {
    loadAssignments();
    loadPendingApprovals();
    loadStats();
  }, [page, rowsPerPage, statusFilter, typeFilter, priorityFilter, showMyRequests]);

  // Data loading functions
  const loadAssignments = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        skip: (page * rowsPerPage).toString(),
        limit: rowsPerPage.toString(),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(typeFilter !== 'all' && { assignment_type: typeFilter }),
        ...(showMyRequests && { requester_id: currentUserId.toString() })
      });

      const response = await fetch(`/api/v1/assignments/requests?${params}`);
      if (!response.ok) throw new Error('Failed to load assignments');
      
      const data = await response.json();
      setAssignments(data.requests || data);
      setTotalCount(data.total_count || data.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, statusFilter, typeFilter, showMyRequests, currentUserId]);

  const loadPendingApprovals = async () => {
    try {
      const response = await fetch('/api/v1/assignments/approvals/pending');
      if (response.ok) {
        const data = await response.json();
        setPendingApprovals(data);
      }
    } catch (err) {
      console.error('Failed to load pending approvals:', err);
    }
  };

  const loadStats = async () => {
    try {
      // This would be a dedicated stats endpoint
      const response = await fetch('/api/v1/assignments/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  // Event handlers
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, request: AssignmentRequest) => {
    setAnchorEl(event.currentTarget);
    setSelectedRequest(request);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRequest(null);
  };

  const handleRefresh = () => {
    loadAssignments();
    loadPendingApprovals();
    loadStats();
  };

  const handleCancelRequest = async (requestId: number) => {
    try {
      const response = await fetch(`/api/v1/assignments/requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      });
      
      if (response.ok) {
        loadAssignments();
        handleMenuClose();
      }
    } catch (err) {
      setError('Failed to cancel request');
    }
  };

  // Utility functions
  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'cancelled': return 'default';
      case 'in_progress': return 'info';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  const getTypeColor = (type: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (type) {
      case 'emergency': return 'error';
      case 'standard': return 'primary';
      case 'scheduled': return 'info';
      default: return 'default';
    }
  };

  const getPriorityLabel = (level: number): string => {
    const labels = { 1: 'Critical', 2: 'High', 3: 'Medium', 4: 'Low', 5: 'Lowest' };
    return labels[level as keyof typeof labels] || 'Unknown';
  };

  const canEditRequest = (request: AssignmentRequest): boolean => {
    return request.requester_id === currentUserId && request.status === 'pending';
  };

  const canCancelRequest = (request: AssignmentRequest): boolean => {
    return (request.requester_id === currentUserId || userRole === 'admin') && 
           ['pending', 'approved'].includes(request.status);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Assignment Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onCreateNew}
          >
            New Assignment
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {stats.total_requests}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Requests
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main">
                  {stats.pending_requests}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {stats.approved_requests}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Approved
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="info.main">
                  {stats.my_requests}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  My Requests
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Badge badgeContent={stats.pending_approvals} color="error">
                  <Typography variant="h4" color="secondary.main">
                    {stats.pending_approvals}
                  </Typography>
                </Badge>
                <Typography variant="body2" color="text.secondary">
                  Pending Approvals
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  label="Type"
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="emergency">Emergency</MenuItem>
                  <MenuItem value="standard">Standard</MenuItem>
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Priority</InputLabel>
                <Select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  label="Priority"
                >
                  <MenuItem value="all">All Priorities</MenuItem>
                  <MenuItem value="1">Critical</MenuItem>
                  <MenuItem value="2">High</MenuItem>
                  <MenuItem value="3">Medium</MenuItem>
                  <MenuItem value="4">Low</MenuItem>
                  <MenuItem value="5">Lowest</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button
                variant={showMyRequests ? 'contained' : 'outlined'}
                onClick={() => setShowMyRequests(!showMyRequests)}
                fullWidth
              >
                My Requests Only
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Assignment Requests Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Requester</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assignments.map((request) => (
                <TableRow key={request.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      #{request.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={request.assignment_type}
                      size="small"
                      color={getTypeColor(request.assignment_type)}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getPriorityLabel(request.priority_level)}
                      size="small"
                      color={request.priority_level <= 2 ? 'error' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {request.requested_role}
                    </Typography>
                    {request.trade_crew?.name && (
                      <Typography variant="caption" color="text.secondary">
                        {request.trade_crew.name}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {request.requester ? 
                        `${request.requester.first_name} ${request.requester.last_name}` :
                        `User ${request.requester_id}`
                      }
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {format(new Date(request.start_date), 'MMM dd, yyyy')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(request.start_date), 'h:mm a')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={request.status}
                      size="small"
                      color={getStatusColor(request.status)}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {format(new Date(request.created_at), 'MMM dd, yyyy')}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => onViewRequest(request.id)}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, request)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          if (selectedRequest) onViewRequest(selectedRequest.id);
          handleMenuClose();
        }}>
          <ViewIcon sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        
        {selectedRequest && canEditRequest(selectedRequest) && (
          <MenuItem onClick={() => {
            if (selectedRequest) onEditRequest(selectedRequest.id);
            handleMenuClose();
          }}>
            <EditIcon sx={{ mr: 1 }} />
            Edit Request
          </MenuItem>
        )}
        
        {selectedRequest && selectedRequest.status === 'pending' && (
          <MenuItem onClick={() => {
            if (selectedRequest) onApproveRequest(selectedRequest.id);
            handleMenuClose();
          }}>
            <ApproveIcon sx={{ mr: 1 }} />
            Process Approval
          </MenuItem>
        )}
        
        {selectedRequest && canCancelRequest(selectedRequest) && (
          <MenuItem 
            onClick={() => {
              if (selectedRequest) handleCancelRequest(selectedRequest.id);
            }}
            sx={{ color: 'error.main' }}
          >
            <CancelIcon sx={{ mr: 1 }} />
            Cancel Request
          </MenuItem>
        )}
      </Menu>

      {/* Floating Action Button for Quick Access */}
      {pendingApprovals.length > 0 && (
        <Fab
          color="secondary"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => {
            // Navigate to approvals page or show approvals dialog
          }}
        >
          <Badge badgeContent={pendingApprovals.length} color="error">
            <AssignmentIcon />
          </Badge>
        </Fab>
      )}
    </Box>
  );
};
