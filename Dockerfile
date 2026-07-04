FROM node:20-slim
WORKDIR /app
EXPOSE 3000
CMD ["npm", "run", "dev"]
