#!/usr/bin/env python3

import argparse
import hashlib
import json
import re
import subprocess
from pathlib import Path


EXCLUDED_PREFIXES = ("docs/", "scripts/", ".github/")
SHELL_CHANGE_PREFIXES = ("_layouts/", "_includes/", "assets/", "styles/")
CORE_ROUTES = [
    ("index.html", "/"),
    ("blog/index.html", "/blog/"),
    ("about.html", "/about.html"),
    ("licensing.html", "/licensing.html"),
    ("blog/launch-announcement.html", "/blog/launch-announcement.html"),
]


def normalize_route(route: str) -> str:
    if route == "/":
        return route
    return route.rstrip("/")


def route_id(source_file: str, route: str) -> str:
    return hashlib.sha1(f"{source_file}:{route}".encode("utf-8")).hexdigest()[:12]


def html_route(path: str) -> str:
    if path == "index.html":
        return "/"
    if path.endswith("/index.html"):
        directory = path[: -len("/index.html")].strip("/")
        return f"/{directory}/" if directory else "/"
    return f"/{path}"


def markdown_route(path: str, excluded_prefixes=EXCLUDED_PREFIXES):
    if path in {"README.md", "LICENSING.md"}:
        return None
    if path.startswith(excluded_prefixes):
        return None
    if path == "index.md":
        return "/"
    if path.startswith("_blog_posts/") and path.endswith(".md"):
        return f"/blog/{Path(path).stem}/"
    if path.startswith("_posts/"):
        match = re.match(r"_posts/(\d{4})-(\d{2})-(\d{2})-(.+)\.md$", path)
        if match:
            year, month, _day, slug = match.groups()
            return f"/blog/{year}/{month}/{slug}/"
        return None
    if path.endswith("/index.md"):
        directory = path[: -len("/index.md")].strip("/")
        return f"/{directory}/" if directory else "/"
    if path.endswith(".md"):
        return f"/{path[:-3].strip('/')}/"
    return None


def add_route(routes, seen, source_file: str, route: str) -> None:
    normalized = normalize_route(route)
    if normalized in seen:
        return
    seen.add(normalized)
    routes.append({"id": route_id(source_file, normalized), "file": source_file, "route": normalized})


def augment_routes(routes, changed_files, blog_post_paths):
    seen = {normalize_route(item["route"]) for item in routes}
    shell_changed = False

    for path in changed_files:
        if path == "_config.yml" or path.startswith(SHELL_CHANGE_PREFIXES):
            shell_changed = True

        if path.endswith(".html") and not path.startswith(("mockups/", "_site/")):
            add_route(routes, seen, path, html_route(path))

        if path.endswith(".md"):
            route = markdown_route(path)
            if route:
                add_route(routes, seen, path, route)

    if shell_changed:
        for source_file, route in CORE_ROUTES:
            add_route(routes, seen, source_file, route)

        for blog_post in blog_post_paths:
            route = markdown_route(blog_post)
            if route:
                add_route(routes, seen, blog_post, route)

    routes.sort(key=lambda item: item["route"])
    return routes


def changed_files_from_git(base_ref: str):
    try:
        return subprocess.check_output(
            ["git", "diff", "--name-only", f"{base_ref}...HEAD"],
            text=True,
        ).splitlines()
    except subprocess.CalledProcessError as exc:
        raise SystemExit(f"Failed to compute changed files against {base_ref}: {exc}") from exc


def parse_args():
    parser = argparse.ArgumentParser(description="Augment VisiDelta route manifest for Jekyll and static pages.")
    parser.add_argument("--base-ref", required=True, help="Git base ref to diff against, e.g. origin/main")
    parser.add_argument("--routes-file", required=True, help="Path to routes.json")
    parser.add_argument(
        "--blog-posts-root",
        default="_blog_posts",
        help="Directory containing Jekyll collection blog posts",
    )
    return parser.parse_args()


def main():
    args = parse_args()
    routes_file = Path(args.routes_file)
    routes = json.loads(routes_file.read_text()) if routes_file.exists() else []
    changed_files = changed_files_from_git(args.base_ref.strip())
    blog_posts_root = Path(args.blog_posts_root)
    blog_post_paths = [path.as_posix() for path in sorted(blog_posts_root.rglob("*.md"))] if blog_posts_root.exists() else []
    updated = augment_routes(routes, changed_files, blog_post_paths)
    routes_file.write_text(json.dumps(updated, indent=2) + "\n")


if __name__ == "__main__":
    main()
