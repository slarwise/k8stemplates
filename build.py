import json
import os
import re

placeholder_pattern = re.compile(r"\$\{([^}]+)\}")
if __name__ == "__main__":
    filenames = os.listdir("templates")
    filenames.sort()
    templates = []
    for filename in filenames:
        with open(f"templates/{filename}") as f:
            text = f.read()
            matches = placeholder_pattern.findall(text)
            inputs = {}
            for m in matches:
                split = m.split(",")
                key = split[0]
                if key in inputs:
                    continue
                default = split[1].strip() if len(split) > 1 else split[0]
                inputs[key] = default
            name = filename.split(".")[0]
            templates.append({"name": name, "filename": filename, "inputs": inputs})
    print(json.dumps(templates))
