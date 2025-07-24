# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Copy the dependencies file to the working directory
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
# --no-cache-dir reduces image size
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application's code to the working directory
COPY . .

# Expose the port the app runs on
EXPOSE 5000

# Run the application using Gunicorn with eventlet worker for WebSocket support
CMD ["gunicorn", "-k", "--worker-class", "eventlet", "-w", "1", "-b", "0.0.0.0:5000", "app:app", "--log-level", "debug", "--error-logfile", "-"]