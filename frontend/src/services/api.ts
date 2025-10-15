import axios from 'axios';
import { CreateJobResponse, Job } from '../types/job';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const jobsApi = {
  async createJob(files: File[]): Promise<CreateJobResponse> {
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
  },

  async getJobs(): Promise<Job[]> {
    const response = await apiClient.get<Job[]>('/jobs');
    return response.data;
  },

  async retryJob(jobId: string): Promise<Job> {
    const response = await apiClient.post<Job>(`/jobs/${jobId}/retry`);
    return response.data;
  },

  async cancelJob(jobId: string): Promise<Job> {
    const response = await apiClient.post<Job>(`/jobs/${jobId}/cancel`);
    return response.data;
  },
};
