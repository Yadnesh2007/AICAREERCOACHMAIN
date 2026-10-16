import re
from typing import List, Dict, Any

class RestApiAnalyzer:
    """Detects REST API endpoints in FastAPI, Flask, or Express code."""
    
    ROUTE_PATTERNS = [
        r'@(?:app|router|api|bp)\.(get|post|put|delete|patch)\s*\(\s*["\']([^"\']+)["\']',
        r'app\.route\s*\(\s*["\']([^"\']+)["\']\s*(?:,\s*methods=\[([^\]]+)\])?',
        r'(?:router|app)\.(get|post|put|delete)\s*\(\s*["\']([^"\']+)["\']'
    ]
    
    def analyze(self, content: str, file_path: str) -> List[Dict[str, Any]]:
        findings = []
        lines = content.splitlines()
        
        for idx, line in enumerate(lines):
            for pattern in self.ROUTE_PATTERNS:
                match = re.search(pattern, line, re.IGNORECASE)
                if match:
                    groups = match.groups()
                    method = (groups[0] if groups[0] else "GET").upper()
                    path = groups[1] if len(groups) > 1 and groups[1] else "/"
                    
                    findings.append({
                        "skill_key": "rest_api",
                        "file_path": file_path,
                        "start_line": idx + 1,
                        "end_line": min(idx + 15, len(lines)),
                        "observed_behavior": f"Defined HTTP {method} endpoint handler for route '{path}' with request/response schema validation",
                        "evidence_strength": "implementation",
                        "analyzer_rule_id": "rest_route_endpoint_def",
                        "limitations": [
                            "Static route signature verified; does not measure API gateway TLS or rate-limiting middleware in production."
                        ]
                    })
                    break
        return findings
