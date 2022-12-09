#!/usr/bin/env python
import glob
import json
import re


def get_step_id(line):
    truncated_line = line[0:20]
    m = re.search('Step #(?P<step>[0-9]+)', truncated_line)
    step_number = m.group('step').strip()
    return int(step_number)


def ingest_file(file_to_process, load_file):
    build_id = file_to_process.rstrip('.txt')
    build_id = build_id.lstrip('log-')

    with open(file_to_process) as log_file:
        insert_id = 0
        for line in log_file:
            if line.startswith("Step #"):
                step_id = get_step_id(line)
                if not isinstance(step_id, int):
                    print(line)
                load_file.write(json.dumps(
                    {'build_id': build_id, 'step_id': step_id, 'insert_id': insert_id, 'log_line': line})+'\n')
                insert_id += 1
            else:
                load_file.write(json.dumps(
                    {'build_id': build_id, 'step_id': 0, 'insert_id': insert_id, 'log_line': line})+'\n')
                insert_id += 1


files_to_process = glob.glob('log-*.txt')
with open('ingest-load.jsonl', 'w+') as load_file:
    for file_to_process in files_to_process:
        print(f'processing {file_to_process}')
        try:
            ingest_file(file_to_process, load_file)
        except Exception as e:
            print(f'Failed to process: {file_to_process}\n')
            print(f'{e}\n')
