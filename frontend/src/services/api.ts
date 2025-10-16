import axios from 'axios';
import { CreateJobResponse, Job, JobStatus } from '../types/job';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock data store
let mockJobs: Job[] = [];
let jobIdCounter = 1;

// Mock API functions
const mockApi = {
  async createJob(files: File[]): Promise<CreateJobResponse> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const jobId = `job-${Date.now()}-${jobIdCounter++}`;
    const fileNames = files.map(f => f.name);

    const newJob: Job = {
      id: jobId,
      status: 'pending' as JobStatus,
      files: fileNames,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      progress: 0,
    };

    mockJobs.unshift(newJob);

    // Simulate job processing
    setTimeout(() => this.processJob(jobId), 1000);

    return {
      job_id: jobId,
      status: 'pending',
      files: fileNames,
    };
  },

  async getJobs(): Promise<Job[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...mockJobs];
  },

  async retryJob(jobId: string): Promise<Job> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const job = mockJobs.find(j => j.id === jobId);
    if (!job) throw new Error('Job not found');

    job.status = 'pending' as JobStatus;
    job.progress = 0;
    job.error_message = undefined;
    job.updated_at = new Date().toISOString();

    setTimeout(() => this.processJob(jobId), 1000);

    return { ...job };
  },

  async cancelJob(jobId: string): Promise<Job> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const job = mockJobs.find(j => j.id === jobId);
    if (!job) throw new Error('Job not found');

    job.status = 'cancelled' as JobStatus;
    job.updated_at = new Date().toISOString();

    return { ...job };
  },

  processJob(jobId: string) {
    const job = mockJobs.find(j => j.id === jobId);
    if (!job || job.status === 'cancelled') return;

    job.status = 'processing' as JobStatus;
    job.updated_at = new Date().toISOString();

    let progress = 0;
    const interval = setInterval(() => {
      if (!job || job.status === 'cancelled') {
        clearInterval(interval);
        return;
      }

      progress += 20;
      job.progress = progress;
      job.updated_at = new Date().toISOString();

      if (progress >= 100) {
        clearInterval(interval);
        // 80% success rate
        if (Math.random() > 0.2) {
          job.status = 'completed' as JobStatus;
        } else {
          job.status = 'failed' as JobStatus;
          job.error_message = 'Mock processing error occurred';
        }
        job.updated_at = new Date().toISOString();
      }

      // Trigger storage event for cross-component updates
      window.dispatchEvent(new CustomEvent('jobUpdate', { detail: job }));
    }, 2000);
  }
};

// Real API with fallback to mock
export const jobsApi = {
  async createJob(files: File[]): Promise<CreateJobResponse> {
    if (USE_MOCK) {
      return mockApi.createJob(files);
    }

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      const response = await apiClient.post<CreateJobResponse>('/jobs', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.warn('Backend unavailable, using mock data');
      return mockApi.createJob(files);
    }
  },

  async getJobs(): Promise<Job[]> {
    if (USE_MOCK) {
      return mockApi.getJobs();
    }

    try {
      const response = await apiClient.get<Job[]>('/jobs');
      return response.data;
    } catch (error) {
      console.warn('Backend unavailable, using mock data');
      return mockApi.getJobs();
    }
  },

  async retryJob(jobId: string): Promise<Job> {
    if (USE_MOCK) {
      return mockApi.retryJob(jobId);
    }

    try {
      const response = await apiClient.post<Job>(`/jobs/${jobId}/retry`);
      return response.data;
    } catch (error) {
      console.warn('Backend unavailable, using mock data');
      return mockApi.retryJob(jobId);
    }
  },

  async cancelJob(jobId: string): Promise<Job> {
    if (USE_MOCK) {
      return mockApi.cancelJob(jobId);
    }

    try {
      const response = await apiClient.post<Job>(`/jobs/${jobId}/cancel`);
      return response.data;
    } catch (error) {
      console.warn('Backend unavailable, using mock data');
      return mockApi.cancelJob(jobId);
    }
  },
};
