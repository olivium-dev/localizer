# Localizer Deployment Guide

This guide explains how to deploy the Localizer application using GitHub Actions to an EC2 instance.

## Prerequisites

1. An EC2 instance with Docker installed
2. GitHub repository with the Localizer code
3. GitHub Secrets configured with:
   - `SSH_PRIVATE_KEY`: Base64-encoded SSH private key for accessing the EC2 instance
   - `DB_PASSWORD`: PostgreSQL database password
4. PostgreSQL database accessible from the EC2 instance

## Deployment Process

### 1. Setting up GitHub Secrets

Add the following secrets to your GitHub repository:

- `SSH_PRIVATE_KEY`: Your base64-encoded SSH private key
  ```
  cat ~/.ssh/id_rsa | base64
  ```
- `DB_PASSWORD`: Your PostgreSQL database password

### 2. Triggering the Deployment

1. Navigate to the "Actions" tab in your GitHub repository
2. Select the "Deploy Localizer to EC2" workflow
3. Click "Run workflow"
4. Fill in the required inputs:
   - `registry`: The Docker registry URL (default: ghcr.io)
   - `service_name`: The name for your Docker service (default: localizer-app)
   - `backend_port`: Internal port for the backend (default: 5002)
   - `frontend_port`: Internal port for the frontend (default: 3000)
   - `backend_external_port`: External port for the backend (default: 10500)
   - `frontend_external_port`: External port for the frontend (default: 10501)
   - `server`: EC2 instance address (format: user@hostname)
   - `ssh_option`: SSH key option to use (default: default)
5. Click "Run workflow"

### 3. Accessing the Application

Once deployed, the application will be available at:

- Frontend: `http://your-ec2-instance:10501`
- Backend API: `http://your-ec2-instance:10500`

## Troubleshooting

If you encounter issues with the deployment:

1. Check the GitHub Actions logs for error messages
2. SSH into your EC2 instance and check Docker logs:
   ```
   docker logs localizer-app
   ```
3. Verify that the ports are open in your EC2 security group
4. Check that PostgreSQL is accessible from the EC2 instance
   ```
   psql -h <DB_HOST> -p <DB_PORT> -U <DB_USER> -d <DB_NAME>
   ```

## Configuration

The application can be configured using environment variables:

- `BACKEND_PORT`: Port for the backend service
- `FRONTEND_PORT`: Port for the frontend service
- `DB_HOST`: PostgreSQL database host
- `DB_PORT`: PostgreSQL database port
- `DB_NAME`: PostgreSQL database name
- `DB_USER`: PostgreSQL database user
- `DB_PASSWORD`: PostgreSQL database password 