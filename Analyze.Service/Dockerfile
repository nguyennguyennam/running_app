# Stage 1: Build the application
# Use the official Python image as a base image
FROM python:3.9-slim-buster AS build

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container
COPY Analyze.Service/requirements.txt .

# Install the Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY Analyze.Service/app.py .

# Stage 2: Create the final runtime image (optional, but good practice for smaller images)
FROM python:3.9-slim-buster

# Set the working directory in the container
WORKDIR /app

# Copy only the necessary files from the build stage
COPY --from=build /usr/local/lib/python3.9/site-packages /usr/local/lib/python3.9/site-packages
COPY --from=build /app/app.py .

# Expose the port that the Flask app will run on
EXPOSE 5003

# Command to run the Flask application
CMD ["python", "app.py"]