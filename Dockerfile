# Use official Python 3.10 slim image
FROM python:3.10-slim

# Install Node.js, git, and build dependencies
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs git build-essential

# Set up a new user named "user" with user ID 1000
RUN useradd -m -u 1000 user

# Switch to the "user" user
USER user

# Set home to the user's home directory
ENV HOME=/home/user \
	PATH=/home/user/.local/bin:$PATH

# Set the working directory to the user's home directory
WORKDIR $HOME/app

# Copy the frontend package.json and install dependencies
COPY --chown=user:user frontend/package.json frontend/package-lock.json* ./frontend/
RUN cd frontend && npm install

# Copy the rest of the frontend code and build
COPY --chown=user:user frontend/ ./frontend/
RUN cd frontend && npm run build

# Copy backend requirements and install
COPY --chown=user:user backend/requirements.txt ./backend/
RUN cd backend && pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend code
COPY --chown=user:user backend/ ./backend/
COPY --chown=user:user .gitignore ./.gitignore

# Set Environment variables
ENV ENVIRONMENT=production
ENV PORT=7860

# Expose the port Hugging Face Spaces expects
EXPOSE 7860

# Start the application
CMD ["bash", "-c", "cd backend && python main.py"]
