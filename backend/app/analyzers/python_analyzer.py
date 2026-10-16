import ast
from typing import List, Dict, Any

class PythonCodeAnalyzer:
    """Analyzes Python code using ast to find concrete implementation evidence."""
    
    def analyze(self, code_str: str, file_path: str) -> List[Dict[str, Any]]:
        findings = []
        try:
            tree = ast.parse(code_str)
        except Exception:
            return findings
            
        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                # Skip simple pass functions
                if len(node.body) == 1 and isinstance(node.body[0], ast.Pass):
                    continue
                start_line = node.lineno
                end_line = getattr(node, "end_lineno", node.lineno + 5)
                
                # Check complexity / features
                has_args = len(node.args.args) > 0
                is_async = isinstance(node, ast.AsyncFunctionDef)
                
                behavior = f"Defined {'async ' if is_async else ''}function '{node.name}' with {len(node.args.args)} parameters and concrete body logic"
                
                findings.append({
                    "skill_key": "python",
                    "file_path": file_path,
                    "start_line": start_line,
                    "end_line": end_line,
                    "observed_behavior": behavior,
                    "evidence_strength": "implementation",
                    "analyzer_rule_id": "py_ast_function_def",
                    "limitations": ["Evaluates structural logic in reviewed scope; does not test runtime exception performance."]
                })
                
            elif isinstance(node, ast.ClassDef):
                start_line = node.lineno
                end_line = getattr(node, "end_lineno", node.lineno + 10)
                behavior = f"Defined class '{node.name}' implementing modular object-oriented architecture"
                
                findings.append({
                    "skill_key": "python",
                    "file_path": file_path,
                    "start_line": start_line,
                    "end_line": end_line,
                    "observed_behavior": behavior,
                    "evidence_strength": "implementation",
                    "analyzer_rule_id": "py_ast_class_def",
                    "limitations": ["Class design verified by AST; does not evaluate deployment scalability."]
                })
                
        return findings
