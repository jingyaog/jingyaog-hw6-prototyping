export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface Job {
  id: string;
  status: JobStatus;
  files: string[];
  created_at: string;
  updated_at: string;
  error_message?: string;
  progress?: number;
}

export interface CreateJobResponse {
  job_id: string;
  status: string;
  files: string[];
}
