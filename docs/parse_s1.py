import csv
import re

def tab_table_to_md(lines):
    rows = [[c.strip() for c in line.split('\t')] for line in lines]
    max_cols = max(len(r) for r in rows)
    rows = [r + [''] * (max_cols - len(r)) for r in rows]

    def fmt(cells):
        return '| ' + ' | '.join(cells) + ' |'

    out = [fmt(rows[0]), fmt(['---'] * max_cols)]
    for row in rows[1:]:
        out.append(fmt(row))
    return '\n'.join(out)

def process(content):
    content = content.replace('￼', '').replace('￼', '')
    content = re.sub(r'⸻+', '', content)
    content = re.sub(r'\n{3,}', '\n\n', content)

    lines = content.split('\n')
    result = []
    i = 0
    while i < len(lines):
        line = lines[i]
        if '\t' in line:
            tbl = []
            while i < len(lines) and '\t' in lines[i]:
                tbl.append(lines[i])
                i += 1
            result.append(tab_table_to_md(tbl) if len(tbl) >= 2 else tbl[0].replace('\t', '  '))
        else:
            result.append(line)
            i += 1
    return '\n'.join(result).strip()

turns = []
with open('/Users/melkwon/Desktop/Dev/16_KAIST_HCI/docs/S1.csv', encoding='utf-8') as f:
    reader = csv.reader(f)
    next(reader)
    for row in reader:
        if len(row) < 3 or not row[0].strip().isdigit():
            continue
        ai, user = (row[1].strip() if len(row) > 1 else ''), (row[2].strip() if len(row) > 2 else '')
        if user:
            turns.append(('user', user))
        elif ai:
            turns.append(('assistant', process(ai)))

lines_out = []
for i, (role, content) in enumerate(turns):
    escaped = content.replace('\\', '\\\\').replace('`', "'").replace('${', '$\\{')
    lines_out.append(f"      {{ id: 's1-t{i+1}', role: '{role}',")
    lines_out.append(f"        content: `{escaped}`,")
    lines_out.append(f"      }},")

print('\n'.join(lines_out))
