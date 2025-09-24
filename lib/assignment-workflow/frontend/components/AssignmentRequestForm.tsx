/**
 * Assignment Request Form Component
 * USLDC-2829-E Compliant Assignment Request Creation
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Grid,
  Alert,
  Chip,
  Autocomplete,
  DateTimePicker,
  Slider,
  FormHelperText,
  Divider
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Types
interface AssignmentRequestFormData {
  assignmentType: 'emergency' | 'standard' | 'scheduled';
  priorityLevel: number;
  requestedRole: string;
  projectId?: number;
  tradeTeamId?: number;
  tradeCrewId?: number;
  startDate: Date;
  endDate?: Date;
  description: string;
  requirements?: Record<string, any>;
}

interface Project {
  id: number;
  name: string;
  status: string;
}

interface TradeTeam {
  id: number;
  name: string;
  description: string;
}

interface TradeCrew {
  id: number;
  name: string;
  tradeTeamId: number;
  capacity: number;
  currentUtilization: number;
}

interface CapacityCheck {
  available: boolean;
  availableCapacity: number;
  currentUtilization: number;
  conflictingAssignments: number;
}

// Validation Schema
const validationSchema = yup.object({
  assignmentType: yup.string().required('Assignment type is required'),
  priorityLevel: yup.number().min(1).max(5).required('Priority level is required'),
  requestedRole: yup.string().min(2).max(100).required('Requested role is required'),
  startDate: yup.date().min(new Date(), 'Start date cannot be in the past').required('Start date is required'),
  endDate: yup.date().min(yup.ref('startDate'), 'End date must be after start date'),
  description: yup.string().min(10).max(2000).required('Description is required (minimum 10 characters)')
});

interface AssignmentRequestFormProps {
  onSubmit: (data: AssignmentRequestFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<AssignmentRequestFormData>;
  isLoading?: boolean;
}

export const AssignmentRequestForm: React.FC<AssignmentRequestFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isLoading = false
}) => {
  // Form state
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<AssignmentRequestFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      assignmentType: 'standard',
      priorityLevel: 3,
      ...initialData
    }
  });

  // Component state
  const [projects, setProjects] = useState<Project[]>([]);
  const [tradeTeams, setTradeTeams] = useState<TradeTeam[]>([]);
  const [tradeCrews, setTradeCrews] = useState<TradeCrew[]>([]);
  const [availableCrews, setAvailableCrews] = useState<TradeCrew[]>([]);
  const [capacityCheck, setCapacityCheck] = useState<CapacityCheck | null>(null);
  const [submitError, setSubmitError] = useState<string>('');

  // Watch form values for dynamic updates
  const watchedValues = watch(['assignmentType', 'tradeTeamId', 'tradeCrewId', 'startDate', 'endDate']);
  const [assignmentType, tradeTeamId, tradeCrewId, startDate, endDate] = watchedValues;

  // Load initial data
  useEffect(() => {
    loadProjects();
    loadTradeTeams();
    loadTradeCrews();
  }, []);

  // Update available crews when trade team changes
  useEffect(() => {
    if (tradeTeamId) {
      const filteredCrews = tradeCrews.filter(crew => crew.tradeTeamId === tradeTeamId);
      setAvailableCrews(filteredCrews);
      
      // Clear crew selection if current crew doesn't belong to selected team
      const currentCrewId = watch('tradeCrewId');
      if (currentCrewId && !filteredCrews.find(crew => crew.id === currentCrewId)) {
        setValue('tradeCrewId', undefined);
      }
    } else {
      setAvailableCrews(tradeCrews);
    }
  }, [tradeTeamId, tradeCrews, setValue, watch]);

  // Check capacity when crew or dates change
  useEffect(() => {
    if (tradeCrewId && startDate) {
      checkCapacityAvailability();
    } else {
      setCapacityCheck(null);
    }
  }, [tradeCrewId, startDate, endDate]);

  // Update priority constraints for emergency assignments
  useEffect(() => {
    if (assignmentType === 'emergency') {
      const currentPriority = watch('priorityLevel');
      if (currentPriority > 2) {
        setValue('priorityLevel', 2);
      }
    }
  }, [assignmentType, setValue, watch]);

  // Data loading functions
  const loadProjects = async () => {
    try {
      const response = await fetch('/api/v1/projects?status=active');
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const loadTradeTeams = async () => {
    try {
      const response = await fetch('/api/v1/trade-teams');
      const data = await response.json();
      setTradeTeams(data);
    } catch (error) {
      console.error('Failed to load trade teams:', error);
    }
  };

  const loadTradeCrews = async () => {
    try {
      const response = await fetch('/api/v1/trade-crews');
      const data = await response.json();
      setTradeCrews(data);
    } catch (error) {
      console.error('Failed to load trade crews:', error);
    }
  };

  const checkCapacityAvailability = async () => {
    if (!tradeCrewId || !startDate) return;

    try {
      const params = new URLSearchParams({
        trade_crew_id: tradeCrewId.toString(),
        start_date: startDate.toISOString(),
        ...(endDate && { end_date: endDate.toISOString() })
      });

      const response = await fetch(`/api/v1/assignments/capacity/check?${params}`);
      const data = await response.json();
      setCapacityCheck(data);
    } catch (error) {
      console.error('Failed to check capacity:', error);
      setCapacityCheck(null);
    }
  };

  // Form submission
  const handleFormSubmit = async (data: AssignmentRequestFormData) => {
    try {
      setSubmitError('');
      await onSubmit(data);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to create assignment request');
    }
  };

  // Priority level labels
  const getPriorityLabel = (level: number): string => {
    const labels = {
      1: 'Critical',
      2: 'High',
      3: 'Medium',
      4: 'Low',
      5: 'Lowest'
    };
    return labels[level as keyof typeof labels] || 'Unknown';
  };

  // Priority level color
  const getPriorityColor = (level: number): 'error' | 'warning' | 'info' | 'success' => {
    if (level <= 2) return 'error';
    if (level === 3) return 'warning';
    if (level === 4) return 'info';
    return 'success';
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Create Assignment Request
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Submit a new assignment request following USLDC-2829-E compliance requirements.
          </Typography>

          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(handleFormSubmit)}>
            <Grid container spacing={3}>
              {/* Assignment Type and Priority */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="assignmentType"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.assignmentType}>
                      <InputLabel>Assignment Type</InputLabel>
                      <Select {...field} label="Assignment Type">
                        <MenuItem value="emergency">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            Emergency
                            <Chip label="Expedited" size="small" color="error" />
                          </Box>
                        </MenuItem>
                        <MenuItem value="standard">Standard</MenuItem>
                        <MenuItem value="scheduled">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            Scheduled
                            <Chip label="Advance Planning" size="small" color="info" />
                          </Box>
                        </MenuItem>
                      </Select>
                      <FormHelperText>
                        {errors.assignmentType?.message}
                      </FormHelperText>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="priorityLevel"
                  control={control}
                  render={({ field }) => (
                    <Box>
                      <Typography gutterBottom>
                        Priority Level: {getPriorityLabel(field.value)}
                        <Chip 
                          label={field.value} 
                          size="small" 
                          color={getPriorityColor(field.value)}
                          sx={{ ml: 1 }}
                        />
                      </Typography>
                      <Slider
                        {...field}
                        min={assignmentType === 'emergency' ? 1 : 1}
                        max={assignmentType === 'emergency' ? 2 : 5}
                        step={1}
                        marks
                        valueLabelDisplay="auto"
                        valueLabelFormat={getPriorityLabel}
                      />
                      {assignmentType === 'emergency' && (
                        <FormHelperText>
                          Emergency assignments are limited to Critical (1) or High (2) priority
                        </FormHelperText>
                      )}
                    </Box>
                  )}
                />
              </Grid>

              {/* Requested Role */}
              <Grid item xs={12}>
                <Controller
                  name="requestedRole"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Requested Role"
                      error={!!errors.requestedRole}
                      helperText={errors.requestedRole?.message}
                      placeholder="e.g., Electrical Supervisor, Plumbing Assistant"
                    />
                  )}
                />
              </Grid>

              <Divider sx={{ width: '100%', my: 2 }} />

              {/* Project and Team Selection */}
              <Grid item xs={12} md={4}>
                <Controller
                  name="projectId"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      options={projects}
                      getOptionLabel={(option) => option.name}
                      value={projects.find(p => p.id === field.value) || null}
                      onChange={(_, value) => field.onChange(value?.id)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Project (Optional)"
                          error={!!errors.projectId}
                          helperText={errors.projectId?.message}
                        />
                      )}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Controller
                  name="tradeTeamId"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      options={tradeTeams}
                      getOptionLabel={(option) => option.name}
                      value={tradeTeams.find(t => t.id === field.value) || null}
                      onChange={(_, value) => field.onChange(value?.id)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Trade Team (Optional)"
                          error={!!errors.tradeTeamId}
                          helperText={errors.tradeTeamId?.message}
                        />
                      )}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Controller
                  name="tradeCrewId"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      options={availableCrews}
                      getOptionLabel={(option) => `${option.name} (${option.currentUtilization}% utilized)`}
                      value={availableCrews.find(c => c.id === field.value) || null}
                      onChange={(_, value) => field.onChange(value?.id)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Trade Crew (Optional)"
                          error={!!errors.tradeCrewId}
                          helperText={errors.tradeCrewId?.message}
                        />
                      )}
                    />
                  )}
                />
              </Grid>

              {/* Capacity Check Display */}
              {capacityCheck && (
                <Grid item xs={12}>
                  <Alert 
                    severity={capacityCheck.available ? 'success' : 'warning'}
                    sx={{ mb: 2 }}
                  >
                    <Typography variant="subtitle2">
                      Capacity Check Results
                    </Typography>
                    <Typography variant="body2">
                      Available Capacity: {capacityCheck.availableCapacity}% | 
                      Current Utilization: {capacityCheck.currentUtilization}% | 
                      Conflicting Assignments: {capacityCheck.conflictingAssignments}
                    </Typography>
                    {!capacityCheck.available && assignmentType !== 'emergency' && (
                      <Typography variant="body2" color="error">
                        Insufficient capacity for this time period. Consider selecting a different crew or time.
                      </Typography>
                    )}
                  </Alert>
                </Grid>
              )}

              {/* Date Selection */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="startDate"
                  control={control}
                  render={({ field }) => (
                    <DateTimePicker
                      {...field}
                      label="Start Date & Time"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.startDate,
                          helperText: errors.startDate?.message
                        }
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="endDate"
                  control={control}
                  render={({ field }) => (
                    <DateTimePicker
                      {...field}
                      label="End Date & Time (Optional)"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.endDate,
                          helperText: errors.endDate?.message || 'Leave blank for 8-hour default duration'
                        }
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      multiline
                      rows={4}
                      label="Assignment Description"
                      error={!!errors.description}
                      helperText={errors.description?.message || `${field.value?.length || 0}/2000 characters`}
                      placeholder="Provide detailed description of the assignment requirements, scope, and any special considerations..."
                    />
                  )}
                />
              </Grid>

              {/* Action Buttons */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={onCancel}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={!isValid || isLoading || (!capacityCheck?.available && assignmentType !== 'emergency' && tradeCrewId)}
                    sx={{ minWidth: 120 }}
                  >
                    {isLoading ? 'Creating...' : 'Create Request'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </LocalizationProvider>
  );
};
