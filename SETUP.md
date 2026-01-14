# Full machine setup

# Install VS Code 
# Install VS Extensions - any needed? 

# Install Git 

# Install Node 

# Install Next.js 

# Install Postgress for local DB testing 

# Install Docker 

- Building the docker image: 
docker build --provenance false --platform linux/amd64 -t reminders-api:v1.0.0 .


# Setup AWS account
# Setup AWS RDS for Database 
(See README.md)

# Install AWS CLI
Maybe the following command but use documentation:  
https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html#getting-started-install-instructions

Possible Windows Install:
msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi

Confirm Installation: 
aws --version

# Setup AWS ECR - Elastic Container Registry 
Setting up AWS ECR (Elastic Container Registry) with Docker
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 645108250905.dkr.ecr.us-east-1.amazonaws.com

Build the Container - Use --provence to make it smaller only including what is necessary. 
docker build --provenance false --platform linux/amd64 -t contactservice:v1.0.0 .

Tag the container - This links the local image with AWS 
docker tag contactservice:latest 645108250905.dkr.ecr.us-east-1.amazonaws.com/contactservice:latest

Pusdh the tags container to AWS
docker push 645108250905.dkr.ecr.us-east-1.amazonaws.com/contactservice:v1.0.0

To build and push a new image you will likely need to repeat these steps.  

# Setup sensitive properties in AWS Secrets Manager 
Create secrets as "Other Secret" for standard key/value pairs 

# Setup AWS ECS - Elastic Container Service
Go to ECS and create a basic container for Fargate

# Then setup a task in ECS
Need to reference the image you created in ECS
Need to pull in secret ENV proprerties from the secret created

