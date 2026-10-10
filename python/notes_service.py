#!/usr/bin/env python3
"""Small internal HTTP service for the Quick Note internship assignment."""
from __future__ import annotations

import json
import os
import ssl
from datetime import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, unquote, urlparse

import pymysql


def database_options() -> dict:
    dsn = os.environ.get("DATABASE_URL", "")
    if not dsn:
        raise RuntimeError("DATABASE_URL is not configured")
    parsed = urlparse(dsn)
    if parsed.scheme not in {"mysql", "mysql+pymysql"}:
        raise RuntimeError("DATABASE_URL must use a MySQL URL")
    query = {key.lower(): value[-1] for key, value in parse_qs(parsed.query).items()}
    options = {
        "host": parsed.hostname,
        "port": parsed.port or 3306,
        "user": unquote(parsed.username or ""),
        "password": unquote(parsed.password or ""),
        "database": unquote(parsed.path.lstrip("/")),
        "charset": "utf8mb4",
        "cursorclass": pymysql.cursors.DictCursor,
        "connect_timeout": 8,
        "read_timeout": 12,
        "write_timeout": 12,
        "autocommit": True,
    }
    ssl_mode = query.get("ssl-mode", query.get("sslmode", "required")).lower()
    if ssl_mode not in {"disable", "disabled", "false", "0"}:
        options["ssl"] = ssl.create_default_context()
    return options


def connect():
    return pymysql.connect(**database_options())


def json_ready(row: dict) -> dict:
    if isinstance(row.get("createdAt"), datetime):
        row["createdAt"] = row["createdAt"].isoformat()
    return row


class NotesHandler(BaseHTTPRequestHandler):
    server_version = "FieldworkNotes/1.0"

    def log_message(self, format: str, *args) -> None:
        print("[notes] " + format % args, flush=True)

    def send_json(self, status: int, payload: dict) -> None:
        data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self) -> None:
        path = urlparse(self.path).path
        if path == "/health":
            self.send_json(200, {"status": "ok", "service": "python-notes"})
            return
        if path != "/notes":
            self.send_json(404, {"error": "Not found"})
            return
        try:
            with connect() as connection:
                with connection.cursor() as cursor:
                    cursor.execute("SELECT id, body, createdAt FROM notes ORDER BY createdAt DESC, id DESC LIMIT 100")
                    rows = [json_ready(dict(row)) for row in cursor.fetchall()]
            self.send_json(200, {"notes": rows})
        except Exception as exc:
            print(f"[notes] list failed: {type(exc).__name__}: {exc}", flush=True)
            self.send_json(503, {"error": "Notes are temporarily unavailable. Please retry."})

    def do_POST(self) -> None:
        if urlparse(self.path).path != "/notes":
            self.send_json(404, {"error": "Not found"})
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length < 1 or length > 8000:
                self.send_json(400, {"error": "Note text must be between 1 and 500 characters."})
                return
            payload = json.loads(self.rfile.read(length))
            body = payload.get("body")
            if not isinstance(body, str) or not body.strip() or len(body.strip()) > 500:
                self.send_json(400, {"error": "Note text must be between 1 and 500 characters."})
                return
            body = body.strip()
            with connect() as connection:
                with connection.cursor() as cursor:
                    cursor.execute("INSERT INTO notes (body) VALUES (%s)", (body,))
                    note_id = cursor.lastrowid
                    cursor.execute("SELECT id, body, createdAt FROM notes WHERE id = %s", (note_id,))
                    row = cursor.fetchone()
            if not row:
                self.send_json(500, {"error": "The note was not returned after saving."})
                return
            self.send_json(201, {"note": json_ready(dict(row))})
        except (json.JSONDecodeError, UnicodeDecodeError):
            self.send_json(400, {"error": "Request body must be valid JSON."})
        except Exception as exc:
            print(f"[notes] save failed: {type(exc).__name__}: {exc}", flush=True)
            self.send_json(503, {"error": "The note could not be saved. Please retry."})


if __name__ == "__main__":
    port = int(os.environ.get("NOTES_PORT", "3001"))
    server = ThreadingHTTPServer(("127.0.0.1", port), NotesHandler)
    print(f"Python notes service listening on 127.0.0.1:{port}", flush=True)
    server.serve_forever()
