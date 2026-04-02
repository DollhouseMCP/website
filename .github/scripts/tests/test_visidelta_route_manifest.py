import json
import tempfile
import unittest
from pathlib import Path


import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import visidelta_route_manifest as routes


class VisiDeltaRouteManifestTests(unittest.TestCase):
    def test_html_route_handles_root_and_nested_index(self):
        self.assertEqual(routes.html_route("index.html"), "/")
        self.assertEqual(routes.html_route("blog/index.html"), "/blog/")
        self.assertEqual(routes.html_route("about.html"), "/about.html")

    def test_markdown_route_handles_blog_collections(self):
        self.assertEqual(routes.markdown_route("_blog_posts/story-behind-dollhousemcp.md"), "/blog/story-behind-dollhousemcp/")
        self.assertEqual(routes.markdown_route("_posts/2026-04-01-launch.md"), "/blog/2026/04/launch/")
        self.assertIsNone(routes.markdown_route("_posts/not-a-valid-name.md"))

    def test_markdown_route_excludes_non_public_paths(self):
        self.assertIsNone(routes.markdown_route("README.md"))
        self.assertIsNone(routes.markdown_route("LICENSING.md"))
        self.assertIsNone(routes.markdown_route("docs/internal-note.md"))
        self.assertEqual(routes.markdown_route("guides/intro.md"), "/guides/intro/")

    def test_augment_routes_adds_changed_and_shell_routes_without_duplicates(self):
        existing = [{"id": "seed", "file": "index.html", "route": "/"}]
        changed = ["assets/css/atelier.css", "building-blocks.html", "_blog_posts/example.md"]
        blog_posts = ["_blog_posts/example.md", "_blog_posts/second.md"]

        updated = routes.augment_routes(existing, changed, blog_posts)
        route_map = {item["route"]: item["file"] for item in updated}

        self.assertEqual(route_map["/"], "index.html")
        self.assertEqual(route_map["/building-blocks.html"], "building-blocks.html")
        self.assertEqual(route_map["/blog/example"], "_blog_posts/example.md")
        self.assertEqual(route_map["/blog"], "blog/index.html")
        self.assertEqual(route_map["/blog/second"], "_blog_posts/second.md")
        self.assertEqual(len(updated), len(route_map))

    def test_writes_stable_json_manifest(self):
        with tempfile.TemporaryDirectory() as tmp:
          manifest = Path(tmp) / "routes.json"
          manifest.write_text(json.dumps([{"id": "seed", "file": "index.html", "route": "/"}]))
          updated = routes.augment_routes(json.loads(manifest.read_text()), ["about.html"], [])
          manifest.write_text(json.dumps(updated, indent=2) + "\n")
          payload = json.loads(manifest.read_text())
          self.assertEqual(payload[0]["route"], "/")
          self.assertEqual(payload[1]["route"], "/about.html")


if __name__ == "__main__":
    unittest.main()
