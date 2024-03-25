docker stop prisma-studio
docker rm prisma-studio
docker build . -t prisma-studio-img -f prisma/Dockerfile
docker run -p 5555:5555 --name prisma-studio -d prisma-studio-img