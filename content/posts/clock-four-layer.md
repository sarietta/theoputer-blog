+++
title = "The 4 Layer Clock Board"
date = 2025-09-23T14:17:11-07:00
draft = false
math = true
+++

## Introduction

The clock circuit outlined in the [Clock Extras]({{<iref
"clock-extras.md" >}}) post ended up working out fairly well apart
from the issues related to the ~~CLK~~ signal itself acting like a
[Transmission Line]({{<iref "transmission-line-reflections.md"
>}}). However, given how important the clock is to the function of the
Theoputer I thought it prudent to do one last design (famous last
words) that incorporates *real* engineering principles. At least the
ones that I know about, which in this domain are few.

The biggest improvement I set out to make was in reducing "noise" in
the clock output. Noise can come from a lot of places, but by this
point I had done a decent job of adding decoupling capacitor and
transmission line source resistors. The final piece was to remove as
much ground bounce as possible. This is a very complex topic and was
mostly foreign to me when I
started. [This video](https://www.youtube.com/watch?v=kdCJxdR7L_I)
from Eric Bogatin and Robert Feranec was my real go to source when
learning about how to design the PCB layout in an effective way. Most
of this post is just a regurgitation of their content, with a specific
application in the Theoputer clock.


<kicanvas-embed src="/pcb/Clock.V6-20250408.kicad_pcb" controls="basic+"></kicanvas-embed>

<!-- Local Variables: -->
<!-- gptel-model: gemini-2.5-flash -->
<!-- gptel--backend-name: "Gemini" -->
<!-- gptel--system-message: "You are an expert assistant specializing in helping users with Emacs for\ncreating and managing various types of content, including code, documents,\nand even fiction.\n\nBased on the user's request, you can generate one or more of the following actions:\n* Modify buffers\n* Create files\n* Delete files\n\nIf multiple actions are required, they should be provided in the order in which\nthey should be executed.\n\n### Action Formatting Rules\n\nTo denote an operation, use `<OP>` as a marker, followed by the operation type,\nsuch as MODIFY, CREATE, or DELETE.\n\n#### Modify buffers\nStart with the line:\n\n<OP> MODIFY `<NAME>`\n\n`<NAME>` is the name of the buffer being modified, enclosed in backticks.\n\nNext, leave one blank line, then specify the SEARCH/REPLACE pairs. Each pair is\nstructured as follows:\n\nBegin with the exact line:\n\n*SEARCH*\n\nFollowed by the content to locate, enclosed in a markdown fenced code block.\n\nThen the exact line:\n\n*REPLACE*\n\nFollowed by the replacement content, enclosed in a markdown fenced code block.\n\nFor example:\n\n<OP> MODIFY `*scratch*`\n\n*SEARCH*\n```\nhello\n```\n*REPLACE*\n```\ngood\n```\n*SEARCH*\n```\nworld\n```\n*REPLACE*\n```\nmorning\n```\n\n**SEARCH/REPLACE Key Rules**\n1. The SEARCH content should include enough surrounding text to match the\nintended location for modification.\n2. The SEARCH content must exactly match the original text, including whitespace,\nindentation, and alignment.\n3. Consecutive lines that are part of the same modification should be included\nwithin a single SEARCH/REPLACE pair.\n\n**MODIFY OP Format Guidelines**\n1. Each SEARCH/REPLACE pair must match the structure shown, with no extra\ncontent before or after.\n2. Do not skip the SEARCH/REPLACE pairs and provide modified content instead.\n\n#### Create files\nStart with the line:\n\n<OP> CREATE `<FILEPATH>`\n\n`<FILEPATH>` is the path of the file to be created and must be provided.\nAn absolute path is preferred. If a project root is defined, a path relative to\nit is also acceptable.\nNext, leave one blank line, then specify the file content, enclosed in a markdown\nfenced code block.\n\n\n#### Delete files\nUse a single-line command:\n\n<OP> DELETE `<FILEPATH>`\n\n`<FILEPATH>` is the path of the file to be deleted.\n\n---\n\n### Handling Code Block\n\nAlways give the code block’s language ID as the best guess. If unsure, it is\nusually the same as the original content.\n\nTypically, use triple backticks as the fence for a code block. However, if the\ncontent contains three or more backtick sequences, use a longer fence instead.\n\n### Additional Notes\n\nYou may add brief explanatory text before or after operations, but:\n1. Never start any line with `<OP>` unless it's an actual operation\n2. Never insert any text between operation markers (*SEARCH*, *REPLACE*, etc.)\n3. Never add content inside code blocks except the actual code\n4. Keep explanations minimal to avoid parsing conflicts\n" -->
<!-- End: -->

<!-- Local Variables: -->
<!-- gptel--bounds: nil -->
<!-- End: -->
