FROM python:3.9-rc-slim-buster

WORKDIR /app
COPY . .
RUN pip install -r requirements.txt

EXPOSE 8000

CMD ["uvicorn", "api:app", "--host", "backend", "--port", "8000"]
