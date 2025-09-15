import json
import sys

def generate_svg(gate_data):
    svg_elements = []
    gate_width = 80
    gate_height = 40
    pin_radius = 3
    font_size = 16

    # Calculate overall SVG dimensions based on gate positions
    max_x = 0
    max_y = 0
    for gate in gate_data['gates']:
        max_x = max(max_x, gate.get('x', 0) + gate_width)
        max_y = max(max_y, gate.get('y', 0) + gate_height)

    width = max_x + 100 # Add some margin
    height = max_y + 100 # Add some margin

    # Store gate positions and output coordinates
    gate_output_coords = {} # Stores (x, y) for the output pin of each gate

    # First pass: Draw gates and determine output coordinates
    for gate in gate_data['gates']:
        gate_id = gate['id']
        x = gate.get('x', 0)
        y = gate.get('y', 0)
        gate_type = gate['type']
        label = gate.get('label', gate_type)

        if gate_type == 'INPUT':
            svg_elements.append(f'<text x="{x - 20}" y="{y + gate_height / 2 + font_size / 2 - 5}" font-family="monospace" font-size="{font_size}">{label}</text>')
            # Output pin for INPUT gates is on the right
            output_pin_x = x + gate_width
            output_pin_y = y + gate_height / 2
            svg_elements.append(f'<circle cx="{output_pin_x}" cy="{output_pin_y}" r="{pin_radius}" fill="black"/>')
            gate_output_coords[gate_id + '.out'] = (output_pin_x, output_pin_y)
        elif gate_type == 'OUTPUT':
            # Input pin for OUTPUT gates is on the left
            input_pin_x = x
            input_pin_y = y + gate_height / 2
            svg_elements.append(f'<circle cx="{input_pin_x}" cy="{input_pin_y}" r="{pin_radius}" fill="black"/>')
            svg_elements.append(f'<text x="{x + gate_width + 10}" y="{y + gate_height / 2 + font_size / 2 - 5}" font-family="monospace" font-size="{font_size}">{label}</text>')
        else: # Standard logic gates (XOR, AND, OR)
            svg_elements.append(f'<rect x="{x}" y="{y}" width="{gate_width}" height="{gate_height}" fill="lightblue" stroke="black"/>')
            svg_elements.append(f'<text x="{x + gate_width / 2}" y="{y + gate_height / 2 + font_size / 2 - 5}" text-anchor="middle" font-family="monospace" font-size="{font_size}">{gate_type}</text>')

            # Input pins
            svg_elements.append(f'<circle cx="{x}" cy="{y + gate_height / 4}" r="{pin_radius}" fill="black"/>') # Input 1
            svg_elements.append(f'<circle cx="{x}" cy="{y + 3 * gate_height / 4}" r="{pin_radius}" fill="black"/>') # Input 2

            # Output pin
            output_pin_x = x + gate_width
            output_pin_y = y + gate_height / 2
            svg_elements.append(f'<circle cx="{output_pin_x}" cy="{output_pin_y}" r="{pin_radius}" fill="black"/>')
            gate_output_coords[gate_id + '.out'] = (output_pin_x, output_pin_y)

    # Second pass: Draw connections
    for gate in gate_data['gates']:
        gate_id = gate['id']
        gate_x = gate.get('x', 0)
        gate_y = gate.get('y', 0)

        # Connect input 1
        if 'in1' in gate and gate['type'] != 'INPUT':
            source_ref = gate['in1']
            if source_ref in gate_output_coords:
                sx, sy = gate_output_coords[source_ref]
                dx, dy = gate_x, gate_y + gate_height / 4 # Input 1 pin
                svg_elements.append(f'<line x1="{sx}" y1="{sy}" x2="{dx}" y2="{dy}" stroke="black" stroke-width="2"/>')

        # Connect input 2
        if 'in2' in gate and gate['type'] != 'INPUT':
            source_ref = gate['in2']
            if source_ref in gate_output_coords:
                sx, sy = gate_output_coords[source_ref]
                dx, dy = gate_x, gate_y + 3 * gate_height / 4 # Input 2 pin
                svg_elements.append(f'<line x1="{sx}" y1="{sy}" x2="{dx}" y2="{dy}" stroke="black" stroke-width="2"/>')

    svg_content = f'''<svg width="{width}" height="{height}" viewBox="0 0 {width} {height}" xmlns="http://www.w3.org/2000/svg">
    {"".join(svg_elements)}
</svg>'''
    return svg_content

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python generate_logic_svg.py <json_file_path>")
        sys.exit(1)

    json_file_path = sys.argv[1]
    try:
        with open(json_file_path, 'r') as f:
            gate_data = json.load(f)
        svg_output = generate_svg(gate_data)
        print(svg_output)
    except FileNotFoundError:
        print(f"Error: File not found at {json_file_path}")
        sys.exit(1)
    except json.JSONDecodeError:
        print(f"Error: Invalid JSON in {json_file_path}")
        sys.exit(1)
    except Exception as e:
        print(f"An error occurred: {e}")
        sys.exit(1)
