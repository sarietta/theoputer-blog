#!/bin/bash

# --- Default Configuration ---
FRAME_DELAY="1.5"
FINAL_GIF="output.gif" # Default output name

# --- Usage/Help Function ---
print_usage() {
    echo "Usage: $0 -o <output.gif> image1.png image2.png [image3.png ...]"
    echo ""
    echo "This script finds the smallest common dimensions from all input"
    echo "images and center-crops them to create a high-quality, animated GIF."
    echo ""
    echo "Options:"
    echo "  -o <filename>   Specify the output GIF filename (default: output.gif)"
    echo "  -h              Show this help message"
}

# --- Check for Dependencies ---
command -v identify >/dev/null 2>&1 || { echo >&2 "Error: 'identify' (from ImageMagick) is required but not found."; exit 1; }
command -v magick >/dev/null 2>&1 || { echo >&2 "Error: 'magick' (from ImageMagick) is required but not found."; exit 1; }
command -v ffmpeg >/dev/null 2>&1 || { echo >&2 "Error: 'ffmpeg' is required but not found."; exit 1; }

# --- Parse Command-Line Options ---
while getopts "ho:" opt; do
    case ${opt} in
        h )
            print_usage
            exit 0
            ;;
        o )
            FINAL_GIF="$OPTARG"
            ;;
        \? )
            echo "Invalid Option: -$OPTARG" 1>&2
            print_usage
            exit 1
            ;;
        : )
            echo "Invalid Option: -$OPTARG requires an argument" 1>&2
            print_usage
            exit 1
            ;;
    esac
done
# Shift the parsed options away, leaving only the image arguments
shift $((OPTIND -1))

# --- Script Logic ---


# Check if at least 2 image arguments remain
if [ "$#" -lt 2 ]; then
    echo "Error: You must provide at least two images as arguments."
    echo ""
    print_usage
    exit 1
fi

# --- Step 0: Determine Optimal Geometry ---
echo "Analyzing image dimensions..."
min_w=99999
min_h=99999

for IMG_PATH in "$@"; do
    # Use 'identify' to get width and height, read them into vars
    read -r w h < <(identify -format "%w %h" "$IMG_PATH")

    echo "  - Found: $IMG_PATH ($w x $h)"

    if [ "$w" -lt "$min_w" ]; then
        min_w=$w
    fi
    if [ "$h" -lt "$min_h" ]; then
        min_h=$h
    fi
done

# We use WxH format for a center crop.
CROP_GEOMETRY="${min_w}x${min_h}"
echo "Using smallest common geometry for center-crop: $CROP_GEOMETRY"

# --- Create a temporary directory ---
TEMP_DIR=$(mktemp -d)
trap 'rm -rf "$TEMP_DIR"' EXIT
echo "Temporary directory created at: $TEMP_DIR"

# --- Step 1: Flatten and Crop Images ---
echo "Flattening and cropping images..."

i=1
for IMG_PATH in "$@"; do
    FLAT_FILE="$TEMP_DIR/flat_img_$(printf "%03d" $i).png"

    echo "Processing $IMG_PATH -> $FLAT_FILE"
    # Use the dynamic CROP_GEOMETRY variable here
    magick "$IMG_PATH" -background white -flatten -crop "$CROP_GEOMETRY" +repage "$FLAT_FILE"

    ((i++))
done

# --- Step 2: Generate Palette ---
echo "Generating color palette..."
PALETTE_FILE="$TEMP_DIR/palette.png"
# -v quiet suppresses ffmpeg's chatty console output
ffmpeg -v quiet -i "$TEMP_DIR/flat_img_%03d.png" -vf "palettegen" "$PALETTE_FILE"

# --- Step 3: Create Final GIF ---
echo "Creating final GIF..."
FRAMERATE="1/$FRAME_DELAY"

ffmpeg -v quiet -framerate "$FRAMERATE" -i "$TEMP_DIR/flat_img_%03d.png" -i "$PALETTE_FILE" \
       -filter_complex "[0:v][1:v]paletteuse=dither=none" \
       -loop 0 "$FINAL_GIF"

echo "---"
echo "✅ Success! Animated GIF created at: $FINAL_GIF"
