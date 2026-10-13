# braces (vendored 3.0.4)

Local fork of `braces@3.0.3` with nesting-depth guards for
[GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).

Upstream has not published 3.0.4 yet. This package is forced via
`package.json` → `overrides.braces` so eslint/micromatch stay on a
patched build until an official release lands — then delete this folder
and drop the override.
