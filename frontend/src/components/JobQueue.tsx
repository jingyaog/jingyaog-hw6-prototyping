import React, { useEffect, useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Box,
  LinearProgress,
} from '@mui/material';
import { Refresh, Cancel } from '@mui/icons-material';
import { Job, JobStatus } from '../types/job';
import { jobsApi } from '../services/api';
import { wsManager } from '../services/websocket';

const getStatusColor = (status: JobStatus): 'default' | 'primary' | 'success' | 'error' | 'warning' => {
  switch (status) {
    case 'pending':
      return 'default';
    case 'processing':
      return 'primary';
    case 'completed':
      return 'success';
    case 'failed':
      return 'error';
    case 'cancelled':
      return 'warning';
    default:
      return 'default';
  }
};

export const JobQueue: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      const data = await jobsApi.getJobs();
      setJobs(data);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();

    // Connect to WebSocket
    wsManager.connect();

    const unsubscribe = wsManager.subscribe((updatedJob: Job) => {
      setJobs((prevJobs) => {
        const index = prevJobs.findIndex((job) => job.id === updatedJob.id);
        if (index >= 0) {
          const newJobs = [...prevJobs];
          newJobs[index] = updatedJob;
          return newJobs;
        } else {
          return [updatedJob, ...prevJobs];
        }
      });
    });

    return () => {
      unsubscribe();
      wsManager.disconnect();
    };
  }, []);

  const handleRetry = async (jobId: string) => {
    try {
      await jobsApi.retryJob(jobId);
    } catch (error) {
      console.error('Failed to retry job:', error);
      alert('Failed to retry job. Please try again.');
    }
  };

  const handleCancel = async (jobId: string) => {
    try {
      await jobsApi.cancelJob(jobId);
    } catch (error) {
      console.error('Failed to cancel job:', error);
      alert('Failed to cancel job. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <Paper elevation={2} sx={{ p: 3 }}>
        <LinearProgress />
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Job Queue
      </Typography>

      {jobs.length === 0 ? (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            No jobs yet. Upload files to create a job.
          </Typography>
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Job ID</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Files</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Updated</TableCell>
                <TableCell>Progress</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {job.id.substring(0, 8)}...
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={job.status.toUpperCase()}
                      color={getStatusColor(job.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title={job.files.join(', ')}>
                      <Typography variant="body2">
                        {job.files.length} file{job.files.length !== 1 ? 's' : ''}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(job.created_at)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(job.updated_at)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {job.status === 'processing' && job.progress !== undefined ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={job.progress}
                          sx={{ flexGrow: 1, minWidth: 60 }}
                        />
                        <Typography variant="body2">{job.progress}%</Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        {job.error_message || '-'}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      {(job.status === 'failed' || job.status === 'cancelled') && (
                        <Tooltip title="Retry Job">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleRetry(job.id)}
                          >
                            <Refresh />
                          </IconButton>
                        </Tooltip>
                      )}
                      {(job.status === 'pending' || job.status === 'processing') && (
                        <Tooltip title="Cancel Job">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleCancel(job.id)}
                          >
                            <Cancel />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};
