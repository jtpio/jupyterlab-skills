#!/usr/bin/env python3
"""
Start and stop a throwaway JupyterLab server for automated checks.

The server runs detached, with a known token and a clean user state, so
that a browser probe sees the defaults and not the settings of a person.
"""

from __future__ import annotations

import argparse
import json
import os
import secrets
import shlex
import signal
import socket
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request
from pathlib import Path

STATE_ROOT = Path(tempfile.gettempdir()) / "jlab-verify"


def state_file(name: str) -> Path:
    """
    Path of the JSON file that records a running server.
    """
    return STATE_ROOT / f"{name}.json"


def free_port() -> int:
    """
    Ask the OS for a free TCP port.
    """
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


def is_alive(pid: int) -> bool:
    """
    Tell if a process still runs.
    """
    try:
        os.kill(pid, 0)
    except OSError:
        return False
    return True


def wait_ready(url: str, token: str, pid: int, timeout: float) -> bool:
    """
    Poll the status endpoint until the server answers.
    """
    request = urllib.request.Request(
        f"{url}api/status", headers={"Authorization": f"token {token}"}
    )
    # A proxy from the environment must not catch requests to localhost.
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
    deadline = time.time() + timeout
    while time.time() < deadline:
        if not is_alive(pid):
            return False
        try:
            with opener.open(request, timeout=2) as response:
                if response.status == 200:
                    return True
        except (urllib.error.URLError, OSError):
            pass
        time.sleep(0.4)
    return False


def start(args: argparse.Namespace) -> int:
    """
    Start a server and print its details as JSON.
    """
    path = state_file(args.name)
    if path.exists():
        old = json.loads(path.read_text())
        if is_alive(old["pid"]):
            print(json.dumps(old, indent=2))
            print(f"Server '{args.name}' already runs. Stop it first.", file=sys.stderr)
            return 1
        path.unlink()

    STATE_ROOT.mkdir(parents=True, exist_ok=True)
    port = args.port or free_port()
    token = args.token or secrets.token_hex(16)
    root_dir = Path(args.root_dir).resolve()
    root_dir.mkdir(parents=True, exist_ok=True)

    if args.cmd:
        command = shlex.split(args.cmd)
    else:
        # No symlink resolution: the path of a venv Python selects the venv.
        command = [os.path.abspath(args.python), "-m", "jupyterlab"]
    command += [
        "--no-browser",
        f"--ServerApp.port={port}",
        "--ServerApp.port_retries=0",
        "--ServerApp.ip=127.0.0.1",
        f"--IdentityProvider.token={token}",
        f"--ServerApp.root_dir={root_dir}",
        "--LabApp.expose_app_in_browser=True",
    ]
    if hasattr(os, "geteuid") and os.geteuid() == 0:
        command.append("--allow-root")
    command += args.extra

    env = dict(os.environ)
    profile = None
    if not args.keep_user_state:
        # User settings and workspaces hide the defaults under test.
        profile = Path(args.profile or tempfile.mkdtemp(prefix=f"{args.name}-", dir=STATE_ROOT))
        env["JUPYTERLAB_SETTINGS_DIR"] = str(profile / "user-settings")
        env["JUPYTERLAB_WORKSPACES_DIR"] = str(profile / "workspaces")
    for item in args.env:
        key, _, value = item.partition("=")
        env[key] = value

    log = STATE_ROOT / f"{args.name}.log"
    with open(log, "w") as stream:
        process = subprocess.Popen(
            command,
            stdout=stream,
            stderr=subprocess.STDOUT,
            stdin=subprocess.DEVNULL,
            env=env,
            cwd=root_dir,
            start_new_session=True,
        )

    base = f"http://127.0.0.1:{port}/"
    if not wait_ready(base, token, process.pid, args.timeout):
        print(f"The server did not start. Last lines of {log}:", file=sys.stderr)
        print("\n".join(log.read_text().splitlines()[-30:]), file=sys.stderr)
        if is_alive(process.pid):
            os.killpg(process.pid, signal.SIGTERM)
        return 1

    state = {
        "name": args.name,
        "pid": process.pid,
        "port": port,
        "token": token,
        "url": f"{base}lab?token={token}",
        "base_url": base,
        "root_dir": str(root_dir),
        "log": str(log),
        "profile": str(profile) if profile else None,
        "command": command,
    }
    path.write_text(json.dumps(state, indent=2))
    print(json.dumps(state, indent=2))
    return 0


def stop(args: argparse.Namespace) -> int:
    """
    Stop one server, or all of them.
    """
    names = [p.stem for p in STATE_ROOT.glob("*.json")] if args.all else [args.name]
    for name in names:
        path = state_file(name)
        if not path.exists():
            print(f"No server named '{name}'.", file=sys.stderr)
            continue
        state = json.loads(path.read_text())
        pid = state["pid"]
        if is_alive(pid):
            os.killpg(pid, signal.SIGTERM)
            for _ in range(50):
                if not is_alive(pid):
                    break
                time.sleep(0.1)
            else:
                os.killpg(pid, signal.SIGKILL)
        path.unlink()
        print(f"Stopped '{name}' (pid {pid}).")
    return 0


def status(args: argparse.Namespace) -> int:
    """
    List the servers that this script started.
    """
    servers = []
    for path in sorted(STATE_ROOT.glob("*.json")):
        state = json.loads(path.read_text())
        state["alive"] = is_alive(state["pid"])
        servers.append(state)
    print(json.dumps(servers, indent=2))
    return 0


def main() -> int:
    """
    Parse the command line and run the sub-command.
    """
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="action", required=True)

    p_start = sub.add_parser("start", help="start a detached server")
    p_start.add_argument("--name", default="default", help="label of the server")
    p_start.add_argument(
        "--python",
        default=sys.executable,
        help="Python of the environment that has JupyterLab (default: this Python)",
    )
    p_start.add_argument(
        "--cmd",
        help="command to run instead of 'python -m jupyterlab', "
        "for example the entry point of a distribution",
    )
    p_start.add_argument("--root-dir", default=".", help="folder that the server shows")
    p_start.add_argument("--port", type=int, default=0, help="port (default: a free port)")
    p_start.add_argument("--token", help="token (default: random)")
    p_start.add_argument(
        "--keep-user-state",
        action="store_true",
        help="use the real user settings and workspaces, not a clean profile",
    )
    p_start.add_argument("--profile", help="folder for the clean user settings and workspaces")
    p_start.add_argument("--env", action="append", default=[], metavar="KEY=VALUE")
    p_start.add_argument("--timeout", type=float, default=60)
    p_start.add_argument("extra", nargs="*", help="more arguments for the server, after '--'")
    p_start.set_defaults(func=start)

    p_stop = sub.add_parser("stop", help="stop a server")
    p_stop.add_argument("--name", default="default")
    p_stop.add_argument("--all", action="store_true")
    p_stop.set_defaults(func=stop)

    p_status = sub.add_parser("status", help="list the servers")
    p_status.set_defaults(func=status)

    args = parser.parse_args()
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
