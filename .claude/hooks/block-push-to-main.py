#!/usr/bin/env python3
"""PreToolUse hook: stop Claude from pushing straight to main.

main is protected on GitHub (changes go through a pull request), so a direct
push would be rejected anyway. This hook blocks it earlier, with a clear
reason, and tells Claude to push a feature branch and open a PR instead.

Blocked: a `git push` whose destination is main (`origin main`,
`HEAD:main`, `+x:main`, `:main`, `refs/heads/main`), `--all` / `--mirror`,
and a push with no branch named while main is checked out.
Allowed: every other branch, and tag-only pushes.
"""
import json
import os
import re
import shlex
import subprocess
import sys

PROTECTED = "main"
SEPARATORS = set(";&|()\n")
# git options that take their value as the next word
GIT_OPTS_WITH_VALUE = {"-C", "-c", "--git-dir", "--work-tree", "--namespace", "--exec-path"}
PUSH_OPTS_WITH_VALUE = {"--repo", "--receive-pack", "--exec", "-o", "--push-option", "--signed"}


def deny(reason):
    print(json.dumps({
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "permissionDecision": "deny",
            "permissionDecisionReason": reason,
        }
    }))
    sys.exit(0)


def current_branch(cwd):
    try:
        out = subprocess.run(
            ["git", "-C", cwd, "branch", "--show-current"],
            capture_output=True, text=True, timeout=5,
        )
        return out.stdout.strip()
    except Exception:
        return ""


def is_protected(ref):
    return re.fullmatch(r"(refs/heads/)?" + re.escape(PROTECTED), ref) is not None


def segments(tokens):
    seg = []
    for tok in tokens:
        if tok and all(ch in SEPARATORS for ch in tok):
            if seg:
                yield seg
            seg = []
        else:
            seg.append(tok)
    if seg:
        yield seg


def check_push(args, cwd):
    """args: the words after `push`. Returns a reason to block, or None."""
    positional = []
    tags_only = False
    i = 0
    while i < len(args):
        a = args[i]
        if a in ("--all", "--mirror", "--branches"):
            return "`git push %s` would push %s too." % (a, PROTECTED)
        if a == "--tags":
            tags_only = True
        elif a in PUSH_OPTS_WITH_VALUE:
            i += 1
        elif a.startswith("-"):
            pass
        else:
            positional.append(a)
        i += 1

    refspecs = positional[1:]  # positional[0] is the remote
    branch = current_branch(cwd)

    if not refspecs:
        if tags_only:
            return None
        if branch == PROTECTED:
            return "`git push` with no branch named, while %s is checked out." % PROTECTED
        return None

    for spec in refspecs:
        spec = spec.lstrip("+")
        dst = spec.split(":", 1)[1] if ":" in spec else spec
        if dst in ("HEAD", "@"):
            dst = branch
        if is_protected(dst):
            return "this push targets %s (`%s`)." % (PROTECTED, spec)
    return None


HEREDOC = re.compile(r"<<-?\s*(['\"]?)([A-Za-z_][A-Za-z0-9_]*)\1")


def strip_heredocs(command):
    """Drop heredoc bodies (commit messages and the like): they are data, not
    commands, and an apostrophe in them would break the shell lexer."""
    lines = command.split("\n")
    out = []
    i = 0
    while i < len(lines):
        line = lines[i]
        out.append(HEREDOC.sub(" ", line))
        for m in HEREDOC.finditer(line):
            end = m.group(2)
            i += 1
            while i < len(lines) and lines[i].strip() != end:
                i += 1
        i += 1
    return "\n".join(out)


def main():
    data = json.load(sys.stdin)
    command = (data.get("tool_input") or {}).get("command") or ""
    cwd = data.get("cwd") or os.getcwd()
    command = strip_heredocs(command)
    # A line break ends a command, like ";" (a trailing "\" joins two lines).
    command = command.replace("\\\n", " ").replace("\n", " ; ")

    if not re.search(r"\bgit\b", command) or not re.search(r"\bpush\b", command):
        sys.exit(0)

    try:
        lexer = shlex.shlex(command, posix=True, punctuation_chars=";&|()")
        lexer.whitespace_split = True
        tokens = list(lexer)
    except ValueError:
        deny("Could not read this git push command, so it is blocked to be safe. "
             "Push a feature branch with a plain `git push -u origin <branch>`.")

    for seg in segments(tokens):
        # skip leading VAR=value assignments
        k = 0
        while k < len(seg) and re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*=.*", seg[k]):
            k += 1
        if k >= len(seg) or os.path.basename(seg[k]) != "git":
            continue
        k += 1
        seg_cwd = cwd
        while k < len(seg) and seg[k].startswith("-"):
            opt = seg[k]
            if opt in GIT_OPTS_WITH_VALUE and k + 1 < len(seg):
                if opt == "-C":
                    seg_cwd = os.path.join(seg_cwd, seg[k + 1])
                k += 2
            else:
                k += 1
        if k < len(seg) and seg[k] == "push":
            reason = check_push(seg[k + 1:], seg_cwd)
            if reason:
                deny("Direct push to %s is blocked: %s %s is protected and only changes "
                     "through a pull request. Create a feature branch, push it "
                     "(`git push -u origin <branch>`), and open a PR with `gh pr create`."
                     % (PROTECTED, reason, PROTECTED))

    sys.exit(0)


if __name__ == "__main__":
    main()
