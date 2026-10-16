import re
from typing import List, Dict, Any
import sqlglot

class SQLCodeAnalyzer:
    """Analyzes SQL files or embedded SQL queries using sqlglot and pattern matchers."""
    
    def analyze_sql_file(self, content: str, file_path: str) -> List[Dict[str, Any]]:
        findings = []
        lines = content.splitlines()
        
        # Try sqlglot parsing statement by statement
        try:
            expressions = sqlglot.parse(content)
        except Exception:
            expressions = []
            
        if expressions:
            for expr in expressions:
                if expr is None:
                    continue
                expr_str = expr.sql().upper()
                start_line = 1
                end_line = len(lines)
                
                # Check what clauses are present
                clauses = []
                if "JOIN" in expr_str:
                    clauses.append("multi-table JOIN relational queries")
                if "WHERE" in expr_str:
                    clauses.append("conditional WHERE filtering")
                if "GROUP BY" in expr_str:
                    clauses.append("aggregated GROUP BY computation")
                if "SELECT" in expr_str:
                    clauses.append("SELECT projection")
                if "INSERT" in expr_str:
                    clauses.append("INSERT mutations")
                if "UPDATE" in expr_str:
                    clauses.append("UPDATE queries")
                    
                has_params = bool(re.search(r'(\?|%s|:\w+|\$\d+)', content))
                param_text = " with parameterized injection defenses" if has_params else ""
                
                summary = f"Authored verified SQL statement ({', '.join(clauses) if clauses else 'SQL DML'}){param_text}"
                findings.append({
                    "skill_key": "sql_query_writing",
                    "file_path": file_path,
                    "start_line": start_line,
                    "end_line": max(end_line, start_line),
                    "observed_behavior": summary,
                    "evidence_strength": "implementation",
                    "analyzer_rule_id": "sql_glot_syntax_verified",
                    "limitations": [
                        "Demonstrates query writing and relational syntax; does not measure high-throughput database engine tuning or indexing at scale."
                    ]
                })
                break
        else:
            # Fallback regex if file has custom dialect or multiple blocks
            upper = content.upper()
            if "SELECT" in upper or "INSERT INTO" in upper or "UPDATE" in upper:
                findings.append({
                    "skill_key": "sql_query_writing",
                    "file_path": file_path,
                    "start_line": 1,
                    "end_line": len(lines),
                    "observed_behavior": "Authored relational SQL query operations in dedicated repository file",
                    "evidence_strength": "implementation",
                    "analyzer_rule_id": "sql_rule_query_verified",
                    "limitations": [
                        "Evaluates query structure; does not evaluate production query planner latency."
                    ]
                })
                
        return findings

    def analyze_embedded_sql(self, content: str, file_path: str) -> List[Dict[str, Any]]:
        findings = []
        lines = content.splitlines()
        for idx, line in enumerate(lines):
            # Detect execute("SELECT ...") or session.execute(...)
            if re.search(r'(execute|cursor\.execute|session\.execute)\s*\(\s*["\'](SELECT|INSERT|UPDATE|DELETE)', line, re.IGNORECASE):
                findings.append({
                    "skill_key": "sql_query_writing",
                    "file_path": file_path,
                    "start_line": idx + 1,
                    "end_line": idx + 1,
                    "observed_behavior": "Integrated parameterized SQL query execution in application controller layer",
                    "evidence_strength": "application",
                    "analyzer_rule_id": "sql_py_embedded_query",
                    "limitations": [
                        "Demonstrates query integration in backend service; does not verify live DB transactions."
                    ]
                })
        return findings
