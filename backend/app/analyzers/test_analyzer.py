import re
from typing import List, Dict, Any

class TestCodeAnalyzer:
    """Analyzes test suites (pytest, unittest) and asserts."""
    
    def analyze(self, content: str, file_path: str) -> List[Dict[str, Any]]:
        findings = []
        is_test_file = "test" in file_path.lower()
        if not is_test_file:
            return findings
            
        lines = content.splitlines()
        test_funcs = []
        assert_count = 0
        
        for idx, line in enumerate(lines):
            if re.match(r'^\s*def\s+test_\w+', line):
                test_funcs.append((idx + 1, line.strip()))
            if "assert " in line or "self.assert" in line:
                assert_count += 1
                
        if test_funcs or assert_count > 0:
            findings.append({
                "skill_key": "automated_testing",
                "file_path": file_path,
                "start_line": test_funcs[0][0] if test_funcs else 1,
                "end_line": len(lines),
                "observed_behavior": f"Authored unit and regression test suite with {len(test_funcs)} test functions and {assert_count} assertions",
                "evidence_strength": "test",
                "analyzer_rule_id": "test_suite_assertions_def",
                "limitations": [
                    "Static test assertions inspected; does not verify live test pass/fail execution in CI sandbox."
                ]
            })
        return findings
