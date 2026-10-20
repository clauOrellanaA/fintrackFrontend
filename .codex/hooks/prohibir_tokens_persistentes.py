"""Codex PreToolUse hook: prevent auth credentials from being persisted in browser storage."""
import json
import re
import sys

sys.stderr.reconfigure(encoding="utf-8")

STORAGE_WRITE = re.compile(
    r"\b(?:window\s*\.\s*)?(?:localStorage|sessionStorage)\s*\.\s*setItem\s*\(",
    re.IGNORECASE,
)
COOKIE_WRITE = re.compile(r"\bdocument\s*\.\s*cookie\s*=", re.IGNORECASE)
AUTH_MARKER = re.compile(
    r"\b(?:access|refresh|auth|session|bearer)(?:[-_ ]?(?:token|credential))?\b"
    r"|\b(?:token|credential|authorization)\b",
    re.IGNORECASE,
)


def added_source_lines(patch: str) -> list[tuple[str, str]]:
    path = ""
    added = []
    for line in patch.splitlines():
        if line.startswith(("*** Add File: ", "*** Update File: ", "*** Delete File: ")):
            path = line.split(": ", 1)[1].strip().replace("\\", "/")
        elif line.startswith("+++ "):
            continue
        elif line.startswith("+") and path.startswith("src/"):
            added.append((path, line[1:]))
    return added


def find_persistent_auth_writes(patch: str) -> list[str]:
    findings = []
    for path, line in added_source_lines(patch):
        stripped = line.lstrip()
        if stripped.startswith(("//", "/*", "*", "*/")):
            continue
        if AUTH_MARKER.search(line) and (STORAGE_WRITE.search(line) or COOKIE_WRITE.search(line)):
            findings.append(path)
    return findings


def main() -> int:
    try:
        event = json.load(sys.stdin)
    except (json.JSONDecodeError, UnicodeDecodeError):
        print("Hook de almacenamiento de sesión: entrada JSON inválida; parche bloqueado.", file=sys.stderr)
        return 2

    if event.get("tool_name") != "apply_patch":
        return 0

    tool_input = event.get("tool_input", {})
    patch = tool_input.get("command", "") if isinstance(tool_input, dict) else ""
    if not isinstance(patch, str):
        print("Hook de almacenamiento de sesión: formato de parche inválido; parche bloqueado.", file=sys.stderr)
        return 2

    findings = find_persistent_auth_writes(patch)
    if findings:
        locations = ", ".join(dict.fromkeys(findings))
        print(
            "Parche bloqueado: no persistas tokens, credenciales o sesiones de autenticación "
            f"en almacenamiento accesible desde JavaScript: {locations}",
            file=sys.stderr,
        )
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
