#!/bin/bash

output_directory="$2"
file="$1"

/Applications/KiCad/KiCad.app/Contents/MacOS/kicad-cli sch export svg --output "${output_directory}" "${file}"
