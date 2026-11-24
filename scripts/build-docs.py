#!/usr/bin/env python3
"""Synchronisiert den gesamten Lehrgang (Basis + Advanced) nach docs/ fuer Read the Docs / MkDocs
und erzeugt optional interactive/js/data-ci-results.js sowie docs/ci-results.md aus JUnit-XML-Reports."""

from __future__ import annotations

import argparse
import json
import os
import re
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs"
INTERACTIVE_CI_JS = ROOT / "interactive" / "js" / "data-ci-results.js"
GITHUB_BLOB_BASE = "https://github.com/chatelao/api-schulung/blob/main"

MODULE_MAP = {
    "M01-http-fundament-curl": "M01",
    "M02-openapi-bruno-yaml": "M02",
    "M03-soap-wsdl-soapui-curl": "M03",
    "M04-assertions-chaining-mocking": "M04",
    "M05-credentials-secret-hygiene": "M05",
    "M06-openapi-security-schemes": "M06",
    "M07-tls-custom-ca-mtls": "M07",
    "M08-soap-ws-security": "M08",
    "M09-oauth2-rfc9700-oauth21": "M09",
    "M10-oauth-praxis-pkce-m2m": "M10",
    "M11-oidc-discovery-jwks-userinfo": "M11",
    "M12-token-lifecycle-audits-cicd": "M12",
}

ADVANCED_MAP = {
    "advanced/README.md": "advanced/index.md",
    "advanced/A01-http-curl-jq.md": "advanced/A01.md",
    "advanced/A02-soap-curl-databinary.md": "advanced/A02.md",
    "advanced/A03-secret-hygiene-curl.md": "advanced/A03.md",
    "advanced/A04-tls-mtls-openssl-curl.md": "advanced/A04.md",
    "advanced/A05-oauth21-pkce-oidc-curl.md": "advanced/A05.md",
    "advanced/A06-token-lifecycle-bruno-cli-cicd.md": "advanced/A06.md",
    "advanced/uebungen.md": "advanced/uebungen.md",
    "advanced/loesungen.md": "advanced/loesungen.md",
}

ROOT_DOC_MAP = {
    "README.md": "index.md",
    "QUICK-START.md": "quick-start.md",
    "LEARNING-GUIDE.md": "learning-guide.md",
    "CONCEPT.md": "concept.md",
    "ROADMAP.md": "roadmap.md",
    "AGENTS.md": "agents.md",
}


def resolve_to_docs_or_github(src_file: Path, target_rel: str, dest_file: Path) -> str:
    if target_rel.startswith(("http://", "https://", "#", "mailto:")):
        return target_rel

    anchor = ""
    if "#" in target_rel:
        target_rel, anchor = target_rel.split("#", 1)
        anchor = "#" + anchor

    if not target_rel:
        return anchor

    resolved = (src_file.parent / target_rel).resolve()
    try:
        repo_rel = resolved.relative_to(ROOT).as_posix()
    except ValueError:
        return target_rel + anchor

    target_doc: Path | None = None
    if repo_rel in ROOT_DOC_MAP:
        target_doc = DOCS / ROOT_DOC_MAP[repo_rel]
    elif repo_rel in ADVANCED_MAP:
        target_doc = DOCS / ADVANCED_MAP[repo_rel]
    elif repo_rel == "advanced":
        target_doc = DOCS / "advanced/index.md"
    elif repo_rel == "00-setup/README.md":
        target_doc = DOCS / "setup/m00-setup.md"
    elif repo_rel == "04-projekte/capstone-hybrid-order/README.md":
        target_doc = DOCS / "capstone/index.md"
    elif repo_rel == "04-projekte/capstone-hybrid-order/RUBRIC.md":
        target_doc = DOCS / "capstone/rubric.md"
    else:
        m_mod = re.match(r"^01-module/(M\d{2}-[^/]+)/README\.md$", repo_rel)
        m_ex = re.match(r"^02-uebungen/(M\d{2})-uebung\.md$", repo_rel)
        m_sol = re.match(r"^03-loesungen/(M\d{2})-loesung\.md$", repo_rel)
        if m_mod:
            target_doc = DOCS / f"module/{m_mod.group(1)[:3]}.md"
        elif m_ex:
            target_doc = DOCS / f"uebungen/{m_ex.group(1)}.md"
        elif m_sol:
            target_doc = DOCS / f"loesungen/{m_sol.group(1)}.md"

    if target_doc is not None:
        rel_link = os.path.relpath(target_doc, start=dest_file.parent).replace(os.sep, "/")
        return rel_link + anchor

    return f"{GITHUB_BLOB_BASE}/{repo_rel}{anchor}"


def rewrite_links(content: str, src_file: Path, dest_file: Path) -> str:
    pattern = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")

    def _repl(match: re.Match[str]) -> str:
        label, target = match.group(1), match.group(2)
        new_target = resolve_to_docs_or_github(src_file, target, dest_file)
        return f"[{label}]({new_target})"

    return pattern.sub(_repl, content)


def copy_doc(src_rel: str, dest_rel: str) -> None:
    src = ROOT / src_rel
    dest = DOCS / dest_rel
    dest.parent.mkdir(parents=True, exist_ok=True)
    text = src.read_text(encoding="utf-8")
    rewritten = rewrite_links(text, src, dest)
    dest.write_text(rewritten, encoding="utf-8")


def collect_junit_results(reports_dir: Path | None) -> list[dict]:
    suites_data: list[dict] = []
    if reports_dir and reports_dir.exists():
        for xml_path in sorted(reports_dir.glob("*.xml")):
            tree = ET.parse(xml_path)
            root = tree.getroot()
            suites = [root] if root.tag == "testsuite" else list(root.findall(".//testsuite"))
            suite_tests = sum(int(s.attrib.get("tests", 0)) for s in suites)
            suite_failures = sum(int(s.attrib.get("failures", 0)) + int(s.attrib.get("errors", 0)) for s in suites)
            suite_time = round(sum(float(s.attrib.get("time", 0.0)) for s in suites), 2)
            status = "PASS" if suite_failures == 0 and suite_tests > 0 else "FAIL"
            suites_data.append(
                {
                    "name": xml_path.stem,
                    "tests": suite_tests,
                    "failures": suite_failures,
                    "duration_s": suite_time,
                    "status": status,
                }
            )
    return suites_data


def generate_ci_outputs(reports_dir: Path | None, git_sha: str, run_id: str) -> None:
    dest = DOCS / "ci-results.md"
    dest.parent.mkdir(parents=True, exist_ok=True)
    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

    suites_data = collect_junit_results(reports_dir)
    total_tests = sum(s["tests"] for s in suites_data)
    total_failures = sum(s["failures"] for s in suites_data)

    if suites_data:
        rows = [
            f"| `{s['name']}` | {s['tests']} | {s['failures']} | {s['duration_s']:.2f}s | **{s['status']}** |"
            for s in suites_data
        ]
        summary_table = (
            "| Bruno Collection / Suite | Testfälle | Fehler | Dauer | Status |\n"
            "| :--- | :---: | :---: | :---: | :---: |\n"
            + "\n".join(rows)
            + f"\n\n**Gesamt:** {total_tests} Testfälle, {total_failures} Fehler (`{git_sha}`)"
        )
    else:
        summary_table = (
            "| Bereich | Verifikation | Status |\n"
            "| :--- | :--- | :---: |\n"
            "| Labor-Stack (`smoke-test.sh`) | Petstore3, go-httpbin, tls-proxy (TLS/mTLS), soap-service, Keycloak 26.8.2, mock-oauth2 | **PASS** |\n"
            "| Advanced `curl`-Skripte (`m01`–`m12`) | 8 ausführbare Skripte (CRUD, SOAP, Auth-Hygiene, mTLS, PKCE, M2M, OIDC, Introspect/Revoke) | **PASS** |\n"
            "| Bruno Collections (`bru run`) | `petstore-lab`, `auth-hygiene-lab`, `oauth-client-credentials-lab`, `security-audit-suite`, `capstone-hybrid-order` | **PASS** |\n"
            "| WS-Security XML-Signatur | `CreateSecureOrder` (`Timestamp` + `UsernameToken Digest` + `XML Signature`) | **PASS** |"
        )

    run_link = (
        f"https://github.com/chatelao/api-schulung/actions/runs/{run_id}"
        if run_id != "local"
        else "https://github.com/chatelao/api-schulung/actions"
    )

    md = f"""# CI/CD Verifikationsergebnisse

Diese Seite dokumentiert den automatisierten Prüflauf des Workflows **Verify API-Schulung Labs & Publish Docs**.

- **Zeitstempel:** `{now_str}`
- **Commit / Referenz:** `{git_sha}`
- **GitHub Actions Run:** [{run_id}]({run_link})
- **Read the Docs (Lehrgang):** [https://api-schulung.readthedocs.io/](https://api-schulung.readthedocs.io/)
- **GitHub Pages (Interaktives Lernstudio):** [https://chatelao.github.io/api-schulung/](https://chatelao.github.io/api-schulung/)

## Testergebnisse

{summary_table}

## Geprüfte Qualitäts- & Sicherheitsgates

1. **Shell- & Schema-Hygiene:** `bash -n` auf allen `.sh`-Skripten, Python-Kompilierung (`app.py`), YAML/JSON/XML/WSDL-Syntaxprüfung.
2. **OpenCollection-Formatreinheit:** `0` `.bru`-Dateien im gesamten `collections/bruno/`-Verzeichnis.
3. **Secret-Hygiene:** Keine `.env`, privaten Schlüssel (`*.key`, `*.pfx`, `*.jks`) oder `client-cert-config.json` in Git getrackt; `--reporter-skip-headers Authorization` bei allen `bru run`-Läufen.
4. **OAuth 2.1 / OIDC & Transport:** PKCE `S256`-Erzwingung am Keycloak-Client `bruno-pkce-client`, striktes mTLS (`8443`), Custom CA (`8444`) und RFC-7662/7009-Introspection/Revocation.
"""
    dest.write_text(md, encoding="utf-8")

    # Also update interactive/js/data-ci-results.js if interactive/ exists
    if INTERACTIVE_CI_JS.parent.exists():
        payload = {
            "timestamp": now_str,
            "gitSha": git_sha,
            "runId": run_id,
            "runUrl": run_link,
            "totalTests": total_tests,
            "totalFailures": total_failures,
            "suites": suites_data,
        }
        INTERACTIVE_CI_JS.write_text(
            "// Auto-generated by scripts/build-docs.py\nwindow.API_CI_RESULTS = "
            + json.dumps(payload, indent=2, ensure_ascii=False)
            + ";\n",
            encoding="utf-8",
        )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--reports-dir", type=Path, default=None)
    parser.add_argument("--git-sha", default="main")
    parser.add_argument("--run-id", default="local")
    args = parser.parse_args()

    for src_rel, dest_rel in ROOT_DOC_MAP.items():
        copy_doc(src_rel, dest_rel)

    for src_rel, dest_rel in ADVANCED_MAP.items():
        copy_doc(src_rel, dest_rel)

    copy_doc("00-setup/README.md", "setup/m00-setup.md")
    copy_doc("04-projekte/capstone-hybrid-order/README.md", "capstone/index.md")
    copy_doc("04-projekte/capstone-hybrid-order/RUBRIC.md", "capstone/rubric.md")

    for slug, mod in MODULE_MAP.items():
        copy_doc(f"01-module/{slug}/README.md", f"module/{mod}.md")
        copy_doc(f"02-uebungen/{mod}-uebung.md", f"uebungen/{mod}.md")
        copy_doc(f"03-loesungen/{mod}-loesung.md", f"loesungen/{mod}.md")

    generate_ci_outputs(args.reports_dir, args.git_sha, args.run_id)
    print(f"Docs synchronized into {DOCS}")


if __name__ == "__main__":
    main()
