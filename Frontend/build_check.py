import subprocess
res = subprocess.run(['npm.cmd', 'run', 'build'], capture_output=True, text=True)
lines = res.stdout.split('\n') + res.stderr.split('\n')
for i, line in enumerate(lines):
    if 'error' in line.lower() or 'failed' in line.lower():
        print(line)
