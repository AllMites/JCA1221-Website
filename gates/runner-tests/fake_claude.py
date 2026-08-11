#!/usr/bin/env python3
"""Test fixture standing in for the real `claude` CLI. Controlled entirely by
env vars so gates/runner-tests/run.sh can drive every branch of gates/runner.py
without a network call or a real subscription. Always self-reports pid/cwd/argv
to files named by env vars — git-bash's `$!` is an MSYS-virtualised pid, so the
test compares what this process says about itself, not what the shell thinks
the child's pid was."""
import json
import os
import sys
import time


def main():
    argv = sys.argv[1:]

    pid_file = os.environ.get("FAKE_PID_FILE")
    if pid_file:
        with open(pid_file, "w", encoding="utf-8") as f:
            f.write(str(os.getpid()))

    cwd_file = os.environ.get("FAKE_CWD_FILE")
    if cwd_file:
        with open(cwd_file, "w", encoding="utf-8") as f:
            f.write(os.getcwd())

    argv_file = os.environ.get("FAKE_ARGV_FILE")
    if argv_file:
        with open(argv_file, "w", encoding="utf-8") as f:
            f.write(json.dumps(argv))

    calls_file = os.environ.get("FAKE_CALLS_FILE")
    count = 0
    if calls_file:
        with open(calls_file, "a", encoding="utf-8") as f:
            f.write("1\n")
        with open(calls_file, encoding="utf-8") as f:
            count = sum(1 for _ in f)

    sleep_s = float(os.environ.get("FAKE_SLEEP", "0"))
    if sleep_s:
        time.sleep(sleep_s)

    mode = os.environ.get("FAKE_MODE", "success")

    if mode == "success":
        print("ok")
        return 0
    if mode == "fail":
        sys.stderr.write("boom\n")
        return 1
    if mode == "ratelimit":
        succeed_at = int(os.environ.get("FAKE_RATELIMIT_SUCCEED_AT", "999999"))
        if count >= succeed_at:
            print("ok")
            return 0
        sys.stderr.write('{"type":"rate_limit_error"}\n')
        return 1
    if mode == "ratelimit_always":
        sys.stderr.write('{"type":"rate_limit_error"}\n')
        return 1
    print("ok")
    return 0


if __name__ == "__main__":
    sys.exit(main())
