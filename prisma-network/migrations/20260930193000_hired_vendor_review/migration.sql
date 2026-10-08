-- Add vendor→client review type (vendor rates the partner on a completed job).
ALTER TYPE "ReviewerType" ADD VALUE IF NOT EXISTS 'HIRED_VENDOR';
