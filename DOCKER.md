
docker login -u ccolebourn
docker build -t contactservice .
docker run -p 3001:3001 --env-file .env contactservice
