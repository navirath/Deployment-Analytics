import fs from 'fs';
import path from 'path';
import OpenAI from 'openai'; // Ensure you install openai SDK: npm i openai

// === 1. Detect Language ===
export function detectLanguageFromFilePath(filePath) {
  if (filePath.endsWith("package.json") || filePath.endsWith(".js") || filePath.endsWith(".mjs")) return "node";
  if (filePath.endsWith("requirements.txt") || filePath.endsWith(".py")) return "python";
  if (filePath.endsWith("go.mod") || filePath.endsWith(".go")) return "go";
  if (filePath.endsWith("pom.xml") || filePath.endsWith(".java")) return "java";
  if (filePath.endsWith("Gemfile") || filePath.endsWith(".rb")) return "ruby";
  if (filePath.endsWith("composer.json") || filePath.endsWith(".php")) return "php";
  if (filePath.endsWith("Cargo.toml") || filePath.endsWith(".rs")) return "rust";
  if (filePath.endsWith(".csproj") || filePath.endsWith(".cs")) return "csharp";
  if (filePath.endsWith(".c") || filePath.endsWith(".cpp") || filePath.endsWith(".h")) return "c_cpp";

  return null;
}

// Helper functions
function hasPyFiles(dir) { return fs.readdirSync(dir).some(f => f.endsWith('.py')); }
function hasGoFiles(dir) { return fs.readdirSync(dir).some(f => f.endsWith('.go')); }
function hasCsprojFiles(dir) { return fs.readdirSync(dir).some(f => f.endsWith('.csproj')); }
function hasCFiles(dir) { return fs.readdirSync(dir).some(f => f.endsWith('.c') || f.endsWith('.cpp')); }

// === 2. Predefined Dockerfile templates ===
const dockerTemplates = {
  node: `FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production || npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]`,

  python: `FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt ./
RUN pip install -r requirements.txt || true
COPY . .
EXPOSE 8000
CMD ["python", "app.py"]`,

  go: `FROM golang:1.20 as builder
WORKDIR /src
COPY . .
RUN go build -o /app/app .
FROM debian:buster-slim
COPY --from=builder /app/app /app/app
EXPOSE 8080
CMD ["/app/app"]`,

  java: `FROM maven:3.8.6-jdk-17 AS builder
WORKDIR /app
COPY pom.xml ./
COPY src ./src
RUN mvn package -DskipTests
FROM openjdk:17-jdk-slim
COPY --from=builder /app/target/*.jar /app/app.jar
EXPOSE 8080
CMD ["java", "-jar", "/app/app.jar"]`,

  ruby: `FROM ruby:3.2
WORKDIR /app
COPY Gemfile* ./
RUN bundle install
COPY . .
EXPOSE 4567
CMD ["ruby", "app.rb"]`,

  php: `FROM php:8.2-apache
COPY . /var/www/html/
EXPOSE 80`,

  rust: `FROM rust:1.78 AS builder
WORKDIR /app
COPY . .
RUN cargo build --release
FROM debian:buster-slim
COPY --from=builder /app/target/release/app /app/app
EXPOSE 8080
CMD ["/app/app"]`,

  csharp: `FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /app
COPY *.csproj ./
RUN dotnet restore
COPY . .
RUN dotnet publish -c Release -o out
FROM mcr.microsoft.com/dotnet/aspnet:7.0
WORKDIR /app
COPY --from=build /app/out .
EXPOSE 5000
CMD ["dotnet", "App.dll"]`,

  c_cpp: `FROM gcc:12
WORKDIR /app
COPY . .
RUN make
CMD ["./app"]`
};

// === 3. Generate Dockerfile ===
export async function generateDockerfile(repoPath, lang) {
  const dockerfilePath = path.join(repoPath, 'Dockerfile');
  if (fs.existsSync(dockerfilePath)) return;

  if (dockerTemplates[lang]) {
    fs.writeFileSync(dockerfilePath, dockerTemplates[lang]);
    console.log(`Dockerfile generated using template for ${lang}`);
    return;
  }

//   // === 4. Fallback to AI ===
//   console.log(`Language "${lang}" not in templates. Using AI to generate Dockerfile...`);

//   const files = fs.readdirSync(repoPath).join(', ');
//   const prompt = `
// You are a Docker expert.
// I have a project with the following files: ${files}
// Detected language: ${lang}
// Generate a Dockerfile that builds and runs this project.
// Only give the Dockerfile content, no explanations.
// `;

//   const openai = new OpenAI({ apiKey: openAiApiKey });
//   const response = await openai.chat.completions.create({
//     model: "gpt-5-mini",
//     messages: [{ role: "user", content: prompt }],
//   });

//   const dockerfileContent = response.choices[0].message.content;
//   fs.writeFileSync(dockerfilePath, dockerfileContent);
//   console.log(`Dockerfile generated using AI for ${lang}`);
}
