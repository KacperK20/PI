docker stop magazyn-app
docker rm magazyn-app
docker run -d -t -i --env-file ./.env -p 80:80 -p 443:443 --name magazyn-app -d magazyn-app-img
