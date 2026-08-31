FROM mcr.microsoft.com/playwright/python:v1.49.1-jammy

WORKDIR /app

COPY pyproject.toml ./
RUN pip install --no-cache-dir .

COPY app ./app

ENV PYTHONUNBUFFERED=1
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8080/health')"

USER pwuser

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
