import re

# Read sessions.ts
with open('/Users/melkwon/Desktop/Dev/16_KAIST_HCI/refinding/src/data/sessions.ts', 'r', encoding='utf-8') as f:
    sessions_text = f.read()

# Read new turns content
with open('/Users/melkwon/Desktop/Dev/16_KAIST_HCI/docs/s1_turns_output.txt', 'r', encoding='utf-8') as f:
    new_turns_content = f.read().strip()

# Find s1's turns section.
# Strategy: find the 'turns: [' that comes right after s1's anchors section.
# s1 has a unique anchor id 'T-limit' which we can use as a landmark.
# After s1 ends, s2 starts with id: 's2'.

# Find where s1 starts
s1_start = sessions_text.find("    id: 's1',")
# Find where s2 starts
s2_start = sessions_text.find("    id: 's2',")

# Extract s1 block
s1_block = sessions_text[s1_start:s2_start]

# Find turns section within s1 block
turns_start_in_block = s1_block.find('    turns: [')
# Find the closing '],\n  },' of s1
# After the turns array there should be '    ],\n  },'
turns_end_in_block = s1_block.rfind('    ],\n  },')
if turns_end_in_block == -1:
    turns_end_in_block = s1_block.rfind('    ],\n  }')

# Extract the part of s1_block before turns and after turns
before_turns = s1_block[:turns_start_in_block]
after_turns = s1_block[turns_end_in_block:]

# Construct new s1 block
new_turns_section = f'    turns: [\n{new_turns_content}\n    ],'
new_s1_block = before_turns + new_turns_section + '\n  },'

# Also strip the old closing from after_turns since we already include it
# after_turns starts with '    ],' which we're replacing
# So we skip that part - new_s1_block already ends with '  },'
# The remaining text after s2_start stays as is

# Reconstruct full sessions.ts
# sessions_text[s2_start:] starts at "    id: 's2'," — need to include the opening "  {\n" before it
new_sessions_text = (
    sessions_text[:s1_start] +
    new_s1_block + '\n\n  {\n' +
    sessions_text[s2_start:]
)

with open('/Users/melkwon/Desktop/Dev/16_KAIST_HCI/refinding/src/data/sessions.ts', 'w', encoding='utf-8') as f:
    f.write(new_sessions_text)

print("Done! Turns replaced successfully.")
print(f"New s1 block character count: {len(new_s1_block)}")
