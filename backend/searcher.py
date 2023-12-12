import os
import re


def find_pycairo_usage(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(".py"):
                with open(os.path.join(root, file), 'r') as f:
                    lines = f.readlines()
                    for i, line in enumerate(lines):
                        if "import cairo" in line or "from cairo" in line:
                            print(
                                f"File: {os.path.join(root, file)}, Line: {i+1}")


find_pycairo_usage("./backend")
