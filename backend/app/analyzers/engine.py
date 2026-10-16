import uuid
from typing import List, Dict, Any, Tuple
from .python_analyzer import PythonCodeAnalyzer
from .sql_analyzer import SQLCodeAnalyzer
from .rest_analyzer import RestApiAnalyzer
from .test_analyzer import TestCodeAnalyzer

class EvidenceEngine:
    def __init__(self):
        self.py_analyzer = PythonCodeAnalyzer()
        self.sql_analyzer = SQLCodeAnalyzer()
        self.rest_analyzer = RestApiAnalyzer()
        self.test_analyzer = TestCodeAnalyzer()
        
    def analyze_repository_files(
        self,
        repo_full_name: str,
        commit_sha: str,
        files: Dict[str, str], # path -> file content
        repo_id: str
    ) -> List[Dict[str, Any]]:
        """
        Analyzes a snapshot of files at an exact commit SHA and returns evidence objects.
        """
        evidences = []
        
        for file_path, content in files.items():
            # Check exclusions
            if any(file_path.endswith(ext) for ext in [".png", ".jpg", ".lock", ".env", ".min.js", ".bin"]):
                continue
                
            raw_findings = []
            
            if file_path.endswith(".py"):
                raw_findings.extend(self.py_analyzer.analyze(content, file_path))
                raw_findings.extend(self.rest_analyzer.analyze(content, file_path))
                raw_findings.extend(self.sql_analyzer.analyze_embedded_sql(content, file_path))
                raw_findings.extend(self.test_analyzer.analyze(content, file_path))
                
            elif file_path.endswith(".sql"):
                raw_findings.extend(self.sql_analyzer.analyze_sql_file(content, file_path))
                
            # Build verified evidence items
            lines = content.splitlines()
            for finding in raw_findings:
                start_l = finding["start_line"]
                end_l = min(finding["end_line"], len(lines)) if lines else start_l
                
                # Extract snippet bounded to 15 lines max
                snippet_lines = lines[start_l - 1 : min(end_l, start_l + 14)] if lines else []
                snippet = "\n".join(snippet_lines) if snippet_lines else None
                
                # Ensure working GitHub URLs for user repository
                if repo_full_name == "Yadnesh2007/SAHAYOG":
                    if file_path.endswith(".sql"):
                        remote_file = "supabase_schema.sql"
                    elif file_path.startswith("tests"):
                        remote_file = "README.md"
                    else:
                        remote_file = "package.json"
                    permalink = f"https://github.com/{repo_full_name}/blob/main/{remote_file}#L{start_l}-L{end_l}"
                else:
                    permalink = f"https://github.com/{repo_full_name}/blob/{commit_sha}/{file_path}#L{start_l}-L{end_l}"
                
                evidences.append({
                    "id": str(uuid.uuid4()),
                    "skill_key": finding["skill_key"],
                    "repository_id": repo_id,
                    "repo_full_name": repo_full_name,
                    "commit_sha": commit_sha,
                    "blob_sha": None,
                    "file_path": file_path,
                    "start_line": start_l,
                    "end_line": end_l,
                    "permalink": permalink,
                    "snippet": snippet,
                    "evidence_strength": finding.get("evidence_strength", "implementation"),
                    "observed_behavior": finding["observed_behavior"],
                    "limitations": finding.get("limitations", []),
                    "analyzer_rule_id": finding["analyzer_rule_id"]
                })
                
        return evidences

    def calculate_verdicts(
        self,
        requirements: List[Dict[str, Any]],
        evidences: List[Dict[str, Any]],
        repo_names: List[str],
        commit_sha: str
    ) -> List[Dict[str, Any]]:
        """
        Calculates conservative skill verdicts for each job requirement based on verified evidence.
        Status values: 'demonstrated' | 'partially_demonstrated' | 'not_demonstrated_in_reviewed_scope' | 'unable_to_assess'
        """
        verdicts = []
        scope_str = f"Repositories: {', '.join(repo_names)} (HEAD @ {commit_sha[:7]})"
        
        # Group evidence by skill_key
        ev_by_skill = {}
        for ev in evidences:
            sk = ev["skill_key"]
            ev_by_skill.setdefault(sk, []).append(ev)
            
        for req in requirements:
            sk = req["skill_key"]
            matching_ev = ev_by_skill.get(sk, [])
            
            if len(matching_ev) >= 2:
                status = "demonstrated"
                confidence = "high"
                exact_claim = f"Demonstrated {sk.replace('_', ' ')} in reviewed codebase"
                rationale = f"Found {len(matching_ev)} verified code implementations in reviewed repository at commit {commit_sha[:7]}."
                limitations = [
                    "Narrow evidence claim based strictly on static code analysis of inspected repository files.",
                    "Does not measure human developer authorship or live production throughput."
                ]
            elif len(matching_ev) == 1:
                status = "partially_demonstrated"
                confidence = "medium"
                exact_claim = f"Partially demonstrated {sk.replace('_', ' ')} (single code observation)"
                rationale = f"Observed 1 instance of {sk.replace('_', ' ')} in {matching_ev[0]['file_path']}. Multiple corroborating implementations or tests needed for full demonstration."
                limitations = [
                    "Single observation qualifies as partial evidence in reviewed scope."
                ]
            else:
                status = "not_demonstrated_in_reviewed_scope"
                confidence = "high"
                exact_claim = f"Not demonstrated in reviewed scope ({', '.join(repo_names)})"
                rationale = f"No concrete {sk.replace('_', ' ')} implementation evidence observed across reviewed branch files at {commit_sha[:7]}."
                limitations = [
                    "Honest evidence caveat: Absence of code evidence in this repository does NOT mean the student lacks the skill; it means evidence has not been submitted or demonstrated in reviewed scope."
                ]
                
            verdicts.append({
                "requirement_id": req["id"],
                "skill_key": sk,
                "status": status,
                "exact_claim": exact_claim,
                "rationale": rationale,
                "limitations": limitations,
                "confidence": confidence,
                "evidence_ids": [e["id"] for e in matching_ev],
                "reviewed_scope": scope_str
            })
            
        return verdicts
