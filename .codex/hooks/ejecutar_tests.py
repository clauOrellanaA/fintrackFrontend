"""Codex PostToolUse hook: run focused frontend tests after feature patches."""
import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")


def fail(message: str, detail: str = "") -> None:
    print(
        "❌ El hook ejecutó las pruebas después del cambio y fallaron.\n"
        f"{message}\n{detail[-3000:]}",
        file=sys.stderr,
    )
    sys.exit(2)


event = json.loads(sys.stdin.buffer.read().decode("utf-8"))
patch = event.get("tool_input", {}).get("command", "")
if not isinstance(patch, str):
    patch = ""
paths = [
    line.split(": ", 1)[1].strip().replace("\\", "/")
    for line in patch.splitlines()
    if line.startswith(("*** Add File: ", "*** Update File: ", "*** Delete File: "))
]
areas = []
for area in ("src/features/dashboard", "src/features/transactions"):
    if not any(path.startswith(f"{area}/") for path in paths):
        continue
    area_path = Path(event.get("cwd") or os.getcwd()).resolve()
    area_path = area_path / area
    test_files = list(area_path.rglob("*.test.ts")) + list(area_path.rglob("*.test.tsx"))
    if not test_files:
        fail(f"Se modificó {area}, pero no hay pruebas focalizadas para esa feature.")
    areas.append(area)
if not areas:
    sys.exit(0)

project = Path(event.get("cwd") or os.getcwd()).resolve()
if not (project / "package.json").is_file() or not (project / "package-lock.json").is_file():
    fail("No se encontró package.json/package-lock.json en el repositorio frontend.")

docker = shutil.which("docker")
node = shutil.which("node")
node24 = False
if node:
    version = subprocess.run([node, "--version"], capture_output=True, text=True, timeout=5, check=False)
    node24 = version.returncode == 0 and version.stdout.strip().startswith("v24.")

if node24:
    if os.name == "nt":
        command = ["cmd.exe", "/d", "/s", "/c", f"npm test -- {' '.join(areas)}"]
    else:
        command = ["npm", "test", "--", *areas]
    try:
        result = subprocess.run(
            command, cwd=project, capture_output=True, text=True, encoding="utf-8", timeout=180, check=False
        )
    except subprocess.TimeoutExpired as error:
        fail(f"Pruebas de {', '.join(areas)} excedieron el tiempo límite.", str(error))
else:
    if not docker:
        fail(
            "El proyecto requiere Node 24 para las pruebas y Docker no está disponible. "
            "Instala Node 24 o Docker; no se reportarán pruebas como aprobadas."
        )
    with tempfile.TemporaryDirectory(prefix="fintrack-npm-cache-") as cache:
        command = [
            docker,
            "run",
            "--rm",
            "-v",
            f"{project}:/source:ro",
            "-v",
            f"{cache}:/root/.npm",
            "node:24-alpine",
            "sh",
            "-lc",
            "mkdir /tmp/fintrack && "
            "tar --exclude=node_modules --exclude=dist --exclude=.git "
            "--exclude=.env --exclude='.env.*' -cf - -C /source . "
            "| tar -xf - -C /tmp/fintrack && "
            f"cd /tmp/fintrack && npm ci && npm test -- {' '.join(areas)}",
        ]
        try:
            result = subprocess.run(
                command, cwd=project, capture_output=True, text=True, encoding="utf-8", timeout=180, check=False
            )
        except subprocess.TimeoutExpired as error:
            fail(f"Pruebas de {', '.join(areas)} excedieron el tiempo límite.", str(error))

if result.returncode != 0:
    fail(f"Revisa el error y corrige el código. Áreas: {', '.join(areas)}.", result.stdout + result.stderr)

print(
    json.dumps(
        {
            "hookSpecificOutput": {
                "hookEventName": "PostToolUse",
                "additionalContext": f"✅ Hook de pruebas: {', '.join(areas)} → OK",
            }
        },
        ensure_ascii=False,
    )
)
sys.exit(0)
